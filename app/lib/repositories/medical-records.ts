"use client";

import { collection, doc, DocumentData, onSnapshot, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { DATA_COLLECTIONS, MedicalRecord } from "../../shared/types";
import { Actor, writeAuditEntry } from "./shared";

const medicalRecordsCol = () => collection(db, DATA_COLLECTIONS.medicalRecords);

function normalise(id: string, data: DocumentData): MedicalRecord {
  return { ...(data as Omit<MedicalRecord, "id">), id };
}

export function subscribeMedicalRecords(onValue: (records: MedicalRecord[]) => void, onError: (message: string) => void) {
  return onSnapshot(query(medicalRecordsCol(), orderBy("createdAt", "desc")),
    snapshot => onValue(snapshot.docs.map(item => normalise(item.id, item.data()))),
    error => onError(`Medical records sync failed: ${error.message}`),
  );
}

export async function saveMedicalRecord(record: MedicalRecord, actor: Actor): Promise<void> {
  const { id, ...fields } = record;
  await setDoc(doc(medicalRecordsCol(), id), { ...fields, updatedAt: new Date().toLocaleString("en-AU"), createdAt: serverTimestamp() }, { merge: true });
  await writeAuditEntry(actor, "Updated medical record", id);
}
