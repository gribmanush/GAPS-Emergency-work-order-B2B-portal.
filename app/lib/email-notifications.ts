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

/**
 * Sends a fixed, server-rendered notification template. Failure never rolls
 * back the already-committed operational action; it is reported to the caller
 * so the UI can keep the workflow usable while delivery is investigated.
 */
export async function sendEmailNotification(input: EmailNotification): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  try {
    const token = await user.getIdToken();
    const response = await fetch("/api/notifications/email", {
      method: "POST",
      headers: { "authorization": `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      console.warn("Email notification was not delivered", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.warn("Email notification failed", error instanceof Error ? error.message : "Unknown error");
    return false;
  }
}
