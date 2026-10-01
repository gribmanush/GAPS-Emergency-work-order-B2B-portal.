"use client";

import { collection, doc, DocumentData, onSnapshot, orderBy, query, runTransaction, serverTimestamp, where } from "firebase/firestore";
import { db } from "../firebase";
import { DATA_COLLECTIONS, Invoice, UserProfile } from "../../shared/types";
import { Actor, generateFriendlyId } from "./shared";

const invoicesCol = () => collection(db, DATA_COLLECTIONS.invoices);
const auditLogCol = () => collection(db, DATA_COLLECTIONS.auditLog);
const notificationsCol = () => collection(db, DATA_COLLECTIONS.notifications);

function normalise(id: string, data: DocumentData): Invoice {
  return { ...(data as Omit<Invoice, "id">), id };
}

function auditEntry(actor: Actor, action: string, record: string) {
  return { time: new Date().toLocaleString("en-AU"), user: actor.name, role: actor.role, action, record, createdAt: serverTimestamp() };
}

export function subscribeInvoices(
  session: Pick<UserProfile, "role" | "practice">,
  onValue: (invoices: Invoice[]) => void,
  onError: (message: string) => void,
) {
  const q = session.role === "Veterinary Practice"
    ? query(invoicesCol(), where("practice", "==", session.practice || "__none__"))
    : query(invoicesCol(), orderBy("createdAt", "desc"));
  return onSnapshot(q,
    snapshot => onValue(snapshot.docs.map(item => normalise(item.id, item.data()))),
    error => onError(`Invoices sync failed: ${error.message}`),
  );
}

export async function createInvoice(fields: { workOrder: string; practice: string; amount: number }, actor: Actor): Promise<void> {
  const id = generateFriendlyId("INV");
  const invoiceRef = doc(invoicesCol(), id);
  const auditRef = doc(auditLogCol());
  const noticeRef = doc(notificationsCol());
  const invoice = { ...fields, status: "Submitted", version: 1, date: new Date().toLocaleDateString("en-AU") };
  await runTransaction(db, async transaction => {
    transaction.set(invoiceRef, { ...invoice, createdAt: serverTimestamp() });
    transaction.set(auditRef, auditEntry(actor, "Submitted invoice", id));
    transaction.set(noticeRef, { text: `${id} was submitted for finance review`, time: "Just now", read: false, staffOnly: true, createdAt: serverTimestamp() });
  });
}

export async function reviewInvoice(invoiceId: string, status: string, actor: Actor): Promise<void> {
  const invoiceRef = doc(invoicesCol(), invoiceId);
  const auditRef = doc(auditLogCol());
  const noticeRef = doc(notificationsCol());
  await runTransaction(db, async transaction => {
    const snapshot = await transaction.get(invoiceRef);
    if (!snapshot.exists()) throw new Error("Invoice not found.");
    const invoice = normalise(invoiceId, snapshot.data());
    transaction.update(invoiceRef, { status });
    transaction.set(auditRef, auditEntry(actor, `${status} invoice`, invoiceId));
    transaction.set(noticeRef, { text: `${invoiceId} is now ${status}`, time: "Just now", read: false, practice: invoice.practice, createdAt: serverTimestamp() });
  });
}
