"use client";

import { collection, doc, DocumentData, onSnapshot, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { DATA_COLLECTIONS, Incident } from "../../shared/types";
import { Actor, generateFriendlyId, writeAuditEntry } from "./shared";

const incidentsCol = () => collection(db, DATA_COLLECTIONS.incidents);

function normalise(id: string, data: DocumentData): Incident {
  return { ...(data as Omit<Incident, "id">), id };
}

export function subscribeIncidents(onValue: (incidents: Incident[]) => void, onError: (message: string) => void) {
  return onSnapshot(query(incidentsCol(), orderBy("createdAt", "desc")),
    snapshot => onValue(snapshot.docs.map(item => normalise(item.id, item.data()))),
    error => onError(`Incidents sync failed: ${error.message}`),
  );
}

export async function createIncident(fields: Omit<Incident, "id">, actor: Actor): Promise<string> {
  const id = generateFriendlyId("INC");
  await setDoc(doc(incidentsCol(), id), { ...fields, createdAt: serverTimestamp() });
  await writeAuditEntry(actor, "Created emergency incident", id);
  return id;
}
