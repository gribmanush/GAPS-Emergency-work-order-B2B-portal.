"use client";

import { auth } from "./firebase";
import type { EmailEvent } from "../../worker/email-notifications";

export type EmailNotification = {
  event: EmailEvent;
  recordId: string;
  recipientEmail?: string;
  recipientName?: string;
  status?: string;
  practice?: string;
};

export type EmailNotificationResult = {
  delivered: boolean;
  message: string;
  status?: number;
  missing?: string[];
  testMode?: boolean;
};

type EmailResponse = {
  delivered?: boolean;
  error?: string;
  missing?: string[];
  testMode?: boolean;
};

/**
 * Sends a fixed, server-rendered notification template. Failure never rolls
 * back the already-committed operational action; it is reported to the caller
 * so the UI can keep the workflow usable while delivery is investigated.
 */
export async function sendEmailNotification(input: EmailNotification): Promise<EmailNotificationResult> {
  const user = auth.currentUser;
  if (!user) return { delivered: false, message: "Sign in again before sending email." };
  try {
    const token = await user.getIdToken();
    const response = await fetch("/api/notifications/email", {
      method: "POST",
      headers: { "authorization": `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    const body = await response.json().catch(() => ({})) as EmailResponse;
    if (!response.ok) {
      const missing = Array.isArray(body.missing) ? body.missing : [];
      const detail = missing.length ? ` Missing local settings: ${missing.join(", ")}.` : "";
      const message = `${body.error || "Email notification was not delivered"}.${detail}`.replace(/\.\./g, ".");
      console.warn("Email notification was not delivered", response.status, message);
      return { delivered: false, message, status: response.status, missing };
    }
    return { delivered: true, message: "Email notification sent.", status: response.status, testMode: body.testMode };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown network error";
    console.warn("Email notification failed", detail);
    return { delivered: false, message: `Email notification failed: ${detail}` };
  }
}
