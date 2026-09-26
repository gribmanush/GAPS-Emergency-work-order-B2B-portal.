/**
 * Firestore-backed work orders. Every lifecycle action re-validates against
 * the document actually stored (not just what the client believes it saw),
 * and writes the order update, its audit entry and any notification in one
 * atomic transaction — so a work order's history can never desync from it.
 */
"use client";

import {
  collection, doc, DocumentData, onSnapshot, orderBy, query,
  runTransaction, serverTimestamp, where,
} from "firebase/firestore";
import { db } from "../firebase";
import { canAdvanceWorkOrder, DATA_COLLECTIONS, UserProfile, WorkOrder, WorkOrderStatus } from "../../shared/types";
import type { VetDirectoryEntry } from "../vet-directory";
import { Actor, generateFriendlyId } from "./shared";

const workOrdersCol = () => collection(db, DATA_COLLECTIONS.workOrders);
const auditLogCol = () => collection(db, DATA_COLLECTIONS.auditLog);
const notificationsCol = () => collection(db, DATA_COLLECTIONS.notifications);

function normalise(id: string, data: DocumentData): WorkOrder {
  return { ...(data as Omit<WorkOrder, "id">), id };
}

function auditEntry(actor: Actor, action: string, record: string) {
  return { time: new Date().toLocaleString("en-AU"), user: actor.name, role: actor.role, action, record, createdAt: serverTimestamp() };
}

export function subscribeWorkOrders(
  session: Pick<UserProfile, "role" | "uid">,
  onValue: (orders: WorkOrder[]) => void,
  onError: (message: string) => void,
) {
  const q = session.role === "Veterinary Practice"
    ? query(workOrdersCol(), where("assignedVetUid", "==", session.uid))
    : query(workOrdersCol(), orderBy("createdAt", "desc"));
  return onSnapshot(q,
    snapshot => onValue(snapshot.docs.map(item => normalise(item.id, item.data()))),
    error => onError(`Work orders sync failed: ${error.message}`),
  );
}

export async function createWorkOrder(
  fields: { incident: string; dogs: string[]; priority: string; due: string; limit: number; service: string; notes: string },
  vet: VetDirectoryEntry,
  actor: Actor,
): Promise<void> {
  const id = generateFriendlyId("WO");
  const order: Omit<WorkOrder, "id"> = {
    ...fields,
    practice: vet.practice || "Unassigned",
    status: "Work Order Created and Assigned",
    assignedVetUid: vet.uid,
    assignedVetName: vet.fullName,
    updated: "Just now",
  };
  const orderRef = doc(workOrdersCol(), id);
  const auditRef = doc(auditLogCol());
  const noticeRef = doc(notificationsCol());
  await runTransaction(db, async transaction => {
    transaction.set(orderRef, { ...order, createdAt: serverTimestamp() });
    transaction.set(auditRef, auditEntry(actor, "Created work order", id));
    transaction.set(noticeRef, { text: `${id} was assigned to you`, time: "Just now", read: false, recipientUid: vet.uid, workOrderId: id, createdAt: serverTimestamp() });
  });
}

export async function acceptWorkOrder(orderId: string, actor: Actor & { uid: string }): Promise<void> {
  const orderRef = doc(workOrdersCol(), orderId);
  const auditRef = doc(auditLogCol());
  const noticeRef = doc(notificationsCol());
  await runTransaction(db, async transaction => {
    const snapshot = await transaction.get(orderRef);
    if (!snapshot.exists()) throw new Error("Work order not found.");
    const order = normalise(orderId, snapshot.data());
    if (order.assignedVetUid !== actor.uid) throw new Error("This work order is not assigned to you.");
    if (order.status !== "Work Order Created and Assigned" || order.needsReassignment) throw new Error("This work order is no longer awaiting your decision.");
    transaction.update(orderRef, { status: "Accepted by Vet" as WorkOrderStatus, updated: "Just now" });
    transaction.set(auditRef, auditEntry(actor, "Accepted work order", orderId));
    transaction.set(noticeRef, { text: `${orderId} was accepted by ${actor.name}`, time: "Just now", read: false, staffOnly: true, workOrderId: orderId, createdAt: serverTimestamp() });
  });
}

export async function rejectWorkOrder(orderId: string, actor: Actor & { uid: string }): Promise<void> {
  const orderRef = doc(workOrdersCol(), orderId);
  const auditRef = doc(auditLogCol());
  const noticeRef = doc(notificationsCol());
  await runTransaction(db, async transaction => {
    const snapshot = await transaction.get(orderRef);
    if (!snapshot.exists()) throw new Error("Work order not found.");
    const order = normalise(orderId, snapshot.data());
    if (order.assignedVetUid !== actor.uid) throw new Error("This work order is not assigned to you.");
    if (order.status !== "Work Order Created and Assigned" || order.needsReassignment) throw new Error("This work order is no longer awaiting your decision.");
    transaction.update(orderRef, { needsReassignment: true, updated: "Just now" });
    transaction.set(auditRef, auditEntry(actor, "Rejected work order", orderId));
    transaction.set(noticeRef, { text: `${orderId} was declined by ${actor.name} and needs reassignment`, time: "Just now", read: false, staffOnly: true, workOrderId: orderId, createdAt: serverTimestamp() });
  });
}

export async function reassignWorkOrder(orderId: string, vet: VetDirectoryEntry, actor: Actor): Promise<void> {
  const orderRef = doc(workOrdersCol(), orderId);
  const auditRef = doc(auditLogCol());
  const noticeRef = doc(notificationsCol());
  await runTransaction(db, async transaction => {
    const snapshot = await transaction.get(orderRef);
    if (!snapshot.exists()) throw new Error("Work order not found.");
    const current = snapshot.data();
    transaction.update(orderRef, {
      assignedVetUid: vet.uid,
      assignedVetName: vet.fullName,
      practice: vet.practice || current.practice,
      needsReassignment: false,
      status: "Work Order Created and Assigned" as WorkOrderStatus,
      updated: "Just now",
    });
    transaction.set(auditRef, auditEntry(actor, `Reassigned to ${vet.fullName}`, orderId));
    transaction.set(noticeRef, { text: `${orderId} was assigned to you`, time: "Just now", read: false, recipientUid: vet.uid, workOrderId: orderId, createdAt: serverTimestamp() });
  });
}

export async function advanceWorkOrderStatus(orderId: string, to: WorkOrderStatus, actor: Actor & { uid: string }): Promise<void> {
  const orderRef = doc(workOrdersCol(), orderId);
  const auditRef = doc(auditLogCol());
  const noticeRef = doc(notificationsCol());
  await runTransaction(db, async transaction => {
    const snapshot = await transaction.get(orderRef);
    if (!snapshot.exists()) throw new Error("Work order not found.");
    const order = normalise(orderId, snapshot.data());
    if (actor.role === "Veterinary Practice" && order.assignedVetUid !== actor.uid) throw new Error("This work order is not assigned to you.");
    if (!canAdvanceWorkOrder(order.status, to)) throw new Error("That status change isn't allowed.");
    transaction.update(orderRef, { status: to, updated: "Just now" });
    transaction.set(auditRef, auditEntry(actor, `Status changed to ${to}`, orderId));
    if (actor.role === "Veterinary Practice") {
      transaction.set(noticeRef, { text: `${orderId} is now ${to}`, time: "Just now", read: false, staffOnly: true, workOrderId: orderId, createdAt: serverTimestamp() });
    }
  });
}
