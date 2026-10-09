import test from "node:test";
import assert from "node:assert/strict";
import { handleEmailNotification } from "../worker/email-notifications.ts";

const env = {
  RESEND_API_KEY: "test-key",
  EMAIL_FROM: "GAP Emergency Portal <onboarding@resend.dev>",
  EMAIL_TEST_RECIPIENT: "aanayv@gmail.com",
  GAP_NOTIFICATION_EMAIL: "aanayv@gmail.com",
  FIREBASE_API_KEY: "firebase-key",
};

function request(body, token = "valid-token") {
  return new Request("https://portal.example/api/notifications/email", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("rejects unauthenticated email requests", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("{}", { status: 401 });
  try {
    const response = await handleEmailNotification(request({ event: "invoice_submitted", recordId: "INV-1" }, "bad-token"), env);
    assert.equal(response.status, 401);
  } finally { globalThis.fetch = originalFetch; }
});

test("routes test-mode delivery to the verified Resend account", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).includes("accounts:lookup")) return Response.json({ users: [{ localId: "uid-1" }] });
    return Response.json({ id: "email-1" });
  };
  try {
    const response = await handleEmailNotification(request({
      event: "work_order_assigned", recordId: "WO-100", recipientEmail: "vet@example.com", recipientName: "Dr Vet",
    }), env);
    assert.equal(response.status, 200);
    const resendBody = JSON.parse(calls[1].options.body);
    assert.deepEqual(resendBody.to, ["aanayv@gmail.com"]);
    assert.match(resendBody.subject, /WO-100/);
    assert.doesNotMatch(resendBody.html, /test-key/);
  } finally { globalThis.fetch = originalFetch; }
});

test("uses the configured GAP inbox for staff-facing events", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).includes("accounts:lookup")) return Response.json({ users: [{ localId: "uid-1" }] });
    return Response.json({ id: "email-2" });
  };
  try {
    const productionLikeEnv = { ...env, EMAIL_TEST_RECIPIENT: undefined };
    const response = await handleEmailNotification(request({ event: "invoice_submitted", recordId: "INV-7", recipientEmail: "untrusted@example.com" }), productionLikeEnv);
    assert.equal(response.status, 200);
    const resendBody = JSON.parse(calls[1].options.body);
    assert.deepEqual(resendBody.to, ["aanayv@gmail.com"]);
  } finally { globalThis.fetch = originalFetch; }
});
