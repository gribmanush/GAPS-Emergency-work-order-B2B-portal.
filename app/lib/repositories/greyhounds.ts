"use client";

import { collection, doc, DocumentData, onSnapshot, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { DATA_COLLECTIONS, Greyhound } from "../../shared/types";
import { Actor, writeAuditEntry } from "./shared";

const greyhoundsCol = () => collection(db, DATA_COLLECTIONS.greyhounds);

function normalise(id: string, data: DocumentData): Greyhound {
  return { ...(data as Omit<Greyhound, "id">), id };
}

export function subscribeGreyhounds(onValue: (greyhounds: Greyhound[]) => void, onError: (message: string) => void) {
  return onSnapshot(query(greyhoundsCol(), orderBy("createdAt", "desc")),
    snapshot => onValue(snapshot.docs.map(item => normalise(item.id, item.data()))),
    error => onError(`Greyhound directory sync failed: ${error.message}`),
  );
}

export async function createGreyhound(greyhound: Greyhound, actor: Actor): Promise<void> {
  const { id, ...fields } = greyhound;
  await setDoc(doc(greyhoundsCol(), id), { ...fields, createdAt: serverTimestamp() });
  await writeAuditEntry(actor, "Added greyhound", id);
}
