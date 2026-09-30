"use client";

import { collection, doc, DocumentData, onSnapshot, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { DATA_COLLECTIONS, GreyhoundDocument } from "../../shared/types";
import { Actor, writeAuditEntry } from "./shared";

const documentsCol = () => collection(db, DATA_COLLECTIONS.greyhoundDocuments);

function normalise(id: string, data: DocumentData): GreyhoundDocument {
  return { ...(data as Omit<GreyhoundDocument, "id">), id };
}

export function subscribeGreyhoundDocuments(onValue: (documents: GreyhoundDocument[]) => void, onError: (message: string) => void) {
  return onSnapshot(query(documentsCol(), orderBy("createdAt", "desc")),
    snapshot => onValue(snapshot.docs.map(item => normalise(item.id, item.data()))),
    error => onError(`Greyhound documents sync failed: ${error.message}`),
  );
}

// Files are still embedded as base64 directly in the Firestore document (capped
// well under its 1MiB limit) rather than a real object-storage bucket, since
// Firebase Storage isn't set up in this project yet. Good enough for small
// attachments; anything larger needs Firebase Storage as a follow-up.
export async function uploadGreyhoundDocument(fields: Omit<GreyhoundDocument, "id">, actor: Actor): Promise<void> {
  const id = crypto.randomUUID();
  await setDoc(doc(documentsCol(), id), { ...fields, createdAt: serverTimestamp() });
  await writeAuditEntry(actor, "Uploaded greyhound document", fields.greyhoundRef);
}
