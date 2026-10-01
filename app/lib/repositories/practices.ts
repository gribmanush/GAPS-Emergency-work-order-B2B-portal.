"use client";

import { collection, doc, DocumentData, onSnapshot, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { DATA_COLLECTIONS, Practice } from "../../shared/types";
import { Actor, writeAuditEntry } from "./shared";

const practicesCol = () => collection(db, DATA_COLLECTIONS.practices);

function normalise(id: string, data: DocumentData): Practice {
  return { ...(data as Omit<Practice, "id">), id };
}

export function subscribePractices(onValue: (practices: Practice[]) => void, onError: (message: string) => void) {
  return onSnapshot(query(practicesCol(), orderBy("name")),
    snapshot => onValue(snapshot.docs.map(item => normalise(item.id, item.data()))),
    error => onError(`Practice directory sync failed: ${error.message}`),
  );
}

export async function registerPractice(practice: Practice, actor: Actor): Promise<void> {
  const { id, ...fields } = practice;
  await setDoc(doc(practicesCol(), id), { ...fields, createdAt: serverTimestamp() });
  await writeAuditEntry(actor, "Registered veterinary practice", practice.name);
}
