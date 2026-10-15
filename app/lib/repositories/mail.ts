/**
 * Queues an outbound email for Firebase's "Trigger Email" extension, which
 * watches the `mail` collection and sends anything added here once it's
 * installed and configured with a real SMTP provider. Until then, documents
 * just sit here unsent — writing them now means no further code changes are
 * needed the moment that extension is set up.
 */
"use client";

import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

export async function queueEmail(to: string, subject: string, body: string): Promise<void> {
  await addDoc(collection(db, "mail"), { to: [to], message: { subject, text: body } });
}
