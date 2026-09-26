"use client";

import { collection, DocumentData, limit as fsLimit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { Audit, DATA_COLLECTIONS } from "../../shared/types";
import { Actor, writeAuditEntry } from "./shared";

const auditLogCol = () => collection(db, DATA_COLLECTIONS.auditLog);

function normalise(id: string, data: DocumentData): Audit {
  return { ...(data as Omit<Audit, "id">), id };
}

export function subscribeAuditLog(onValue: (entries: Audit[]) => void, onError: (message: string) => void) {
  return onSnapshot(query(auditLogCol(), orderBy("createdAt", "desc"), fsLimit(500)),
    snapshot => onValue(snapshot.docs.map(item => normalise(item.id, item.data()))),
    error => onError(`Audit log sync failed: ${error.message}`),
  );
}

export function logSignIn(actor: Actor) {
  return writeAuditEntry(actor, "Signed in", "SESSION");
}
