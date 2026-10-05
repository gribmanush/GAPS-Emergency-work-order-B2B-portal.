"use client";

import { collection, doc, DocumentData, onSnapshot, orderBy, query, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { DATA_COLLECTIONS, Incident } from "../../shared/types";
import { Actor, generateFriendlyId } from "./shared";

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
  const batch = writeBatch(db);
  batch.set(doc(incidentsCol(), id), { ...fields, createdAt: serverTimestamp() });
  batch.set(doc(collection(db, DATA_COLLECTIONS.auditLog)), {
    time: new Date().toLocaleString("en-AU"), user: actor.name, role: actor.role,
    action: "Created emergency incident", record: id, createdAt: serverTimestamp(),
  });
  batch.set(doc(collection(db, DATA_COLLECTIONS.notifications)), {
    text: `${id}: ${fields.priority} emergency recorded for ${fields.greyhoundNames?.join(", ") || `${fields.greyhoundCount} greyhound(s)`}`,
    time: "Just now", read: false, staffOnly: true, createdAt: serverTimestamp(),
  });
  await batch.commit();
  return id;
}
