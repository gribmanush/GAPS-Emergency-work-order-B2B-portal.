export type EmailEvent =
  | "work_order_assigned"
  | "work_order_reassigned"
  | "work_order_accepted"
  | "work_order_rejected"
  | "work_order_status_updated"
  | "invoice_submitted"
  | "invoice_reviewed";

export interface EmailEnv {
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  EMAIL_TEST_RECIPIENT?: string;
  GAP_NOTIFICATION_EMAIL?: string;
  FIREBASE_API_KEY?: string;
}

type EmailRequest = {
  event: EmailEvent;
  recordId: string;
  recipientEmail?: string;
  recipientName?: string;
  status?: string;
  practice?: string;
};

const allowedEvents = new Set<EmailEvent>([
  "work_order_assigned", "work_order_reassigned", "work_order_accepted",
  "work_order_rejected", "work_order_status_updated", "invoice_submitted", "invoice_reviewed",
]);

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
});

const clean = (value: unknown, max = 160) => String(value || "").trim().slice(0, max);
const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
}[character] || character));

async function validateFirebaseToken(token: string, apiKey: string): Promise<boolean> {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ idToken: token }),
  });
  if (!response.ok) return false;
  const result = await response.json() as { users?: Array<{ localId?: string }> };
  return Boolean(result.users?.[0]?.localId);
}

function messageFor(input: EmailRequest) {
  const id = clean(input.recordId, 80);
  const status = clean(input.status, 80);
  const practice = clean(input.practice, 120);
  const messages: Record<EmailEvent, { subject: string; heading: string; detail: string; audience: "gap" | "recipient" }> = {
    work_order_assigned: { subject: `GAP work order ${id} assigned`, heading: "A new emergency work order has been assigned", detail: `Please sign in to review and respond to work order ${id}.`, audience: "recipient" },
    work_order_reassigned: { subject: `GAP work order ${id} reassigned`, heading: "An emergency work order has been reassigned", detail: `Please sign in to review and respond to work order ${id}.`, audience: "recipient" },
    work_order_accepted: { subject: `${id} accepted by the veterinary practice`, heading: "Work order accepted", detail: `${id}${practice ? ` has been accepted by ${practice}` : " has been accepted"}.`, audience: "gap" },
    work_order_rejected: { subject: `${id} requires reassignment`, heading: "Work order declined", detail: `${id}${practice ? ` was declined by ${practice}` : " was declined"} and requires reassignment.`, audience: "gap" },
    work_order_status_updated: { subject: `${id} status updated`, heading: "Work order status changed", detail: `${id} is now ${status || "updated"}.`, audience: "gap" },
    invoice_submitted: { subject: `Invoice ${id} submitted`, heading: "A veterinary invoice is ready for review", detail: `${id}${practice ? ` from ${practice}` : ""} has been submitted for GAP finance review.`, audience: "gap" },
    invoice_reviewed: { subject: `Invoice ${id}: ${status || "reviewed"}`, heading: "Your invoice has been reviewed", detail: `${id} is now ${status || "reviewed"}. Sign in to view the decision and audit trail.`, audience: "recipient" },
  };
  return messages[input.event];
}

export async function handleEmailNotification(request: Request, env: EmailEnv): Promise<Response> {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM || !env.FIREBASE_API_KEY) {
    return json({ error: "Email service is not configured" }, 503);
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!token || !(await validateFirebaseToken(token, env.FIREBASE_API_KEY))) {
    return json({ error: "Valid Firebase authentication is required" }, 401);
  }

  let input: EmailRequest;
  try { input = await request.json() as EmailRequest; }
  catch { return json({ error: "Invalid JSON body" }, 400); }
  if (!allowedEvents.has(input.event) || !clean(input.recordId, 80)) {
    return json({ error: "Unsupported notification event" }, 400);
  }

  const message = messageFor(input);
  const requestedRecipient = message.audience === "gap" ? env.GAP_NOTIFICATION_EMAIL : clean(input.recipientEmail, 254);
  // While Resend's onboarding sender is used, route every message to the
  // verified account address. Remove EMAIL_TEST_RECIPIENT only after a GAP
  // domain is verified and the client approves real-user delivery.
  const recipient = env.EMAIL_TEST_RECIPIENT || requestedRecipient;
  if (!recipient) return json({ error: "No approved recipient is configured" }, 503);

  const greeting = clean(input.recipientName, 100);
  const html = `<!doctype html><html><body style="margin:0;background:#f3f7f8;font-family:Arial,sans-serif;color:#17323d"><div style="max-width:620px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #d8e4e8"><div style="background:#06384f;color:#fff;padding:22px 28px"><strong style="font-size:22px">GAP Emergency Portal</strong><div style="color:#9cdbea;margin-top:4px">Operational notification</div></div><div style="padding:28px"><p>${greeting ? `Hello ${escapeHtml(greeting)},` : "Hello,"}</p><h2>${escapeHtml(message.heading)}</h2><p style="line-height:1.6">${escapeHtml(message.detail)}</p><p style="line-height:1.6">This email contains no clinical attachments. Please sign in to the secure portal to view the complete record.</p><div style="margin-top:24px;padding-top:16px;border-top:1px solid #d8e4e8;color:#607883;font-size:12px">Greyhounds As Pets NSW · Automated message · Do not reply</div></div></div></body></html>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "authorization": `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: env.EMAIL_FROM, to: [recipient], subject: message.subject, html }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return json({ error: "Email provider rejected the request", providerStatus: response.status }, 502);
  return json({ delivered: true, id: (result as { id?: string }).id || null, testMode: Boolean(env.EMAIL_TEST_RECIPIENT) });
}
