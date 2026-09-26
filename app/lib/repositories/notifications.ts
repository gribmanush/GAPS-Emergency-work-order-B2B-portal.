"use client";

import { collection, doc, DocumentData, limit as fsLimit, onSnapshot, orderBy, query, updateDoc, where, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { DATA_COLLECTIONS, isNoticeVisible, Notice, UserProfile } from "../../shared/types";

const notificationsCol = () => collection(db, DATA_COLLECTIONS.notifications);

function normalise(id: string, data: DocumentData): Notice {
  return { ...(data as Omit<Notice, "id">), id };
}

// A vet's query is scoped server-side to only their own notifications — every
// vet-directed notice is always personally addressed via recipientUid, so this
// single where-clause covers everything a vet can ever see. Staff have full
// visibility, bounded by a sane limit rather than an unbounded collection read.
export function subscribeNotifications(
  session: Pick<UserProfile, "role" | "uid">,
  onValue: (notices: Notice[]) => void,
  onError: (message: string) => void,
) {
  const q = session.role === "Veterinary Practice"
    ? query(notificationsCol(), where("recipientUid", "==", session.uid))
    : query(notificationsCol(), orderBy("createdAt", "desc"), fsLimit(200));
  return onSnapshot(q,
    snapshot => onValue(snapshot.docs.map(item => normalise(item.id, item.data()))),
    error => onError(`Notifications sync failed: ${error.message}`),
  );
}

export function markNotificationRead(id: string) {
  return updateDoc(doc(notificationsCol(), id), { read: true });
}

export async function markAllNotificationsRead(session: Pick<UserProfile, "role" | "uid" | "practice">, notices: Notice[]) {
  const unread = notices.filter(n => !n.read && isNoticeVisible(session, n));
  if (!unread.length) return;
  const batch = writeBatch(db);
  unread.forEach(n => batch.update(doc(notificationsCol(), n.id), { read: true }));
  await batch.commit();
}
