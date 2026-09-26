/**
 * Shared helpers reused by every domain repository: a human-readable ID
 * generator for the collections whose IDs are actually displayed/referenced
 * (work orders, invoices, incidents), and the two cross-cutting writes every
 * action performs — an audit log entry and, where relevant, a notification.
 */
"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { DATA_COLLECTIONS } from "../../shared/types";

export function generateFriendlyId(prefix: string) {
  return `${prefix}-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
}

export type Actor = { name: string; role: string };

export function writeAuditEntry(actor: Actor, action: string, record: string) {
  return addDoc(collection(db, DATA_COLLECTIONS.auditLog), {
    time: new Date().toLocaleString("en-AU"),
    user: actor.name,
    role: actor.role,
    action,
    record,
    createdAt: serverTimestamp(),
  });
}

export type NotifyOptions = { recipientUid?: string; staffOnly?: boolean; workOrderId?: string; practice?: string };

export function pushNotification(text: string, options: NotifyOptions = {}) {
  return addDoc(collection(db, DATA_COLLECTIONS.notifications), {
    text,
    time: "Just now",
    read: false,
    createdAt: serverTimestamp(),
    ...options,
  });
}
