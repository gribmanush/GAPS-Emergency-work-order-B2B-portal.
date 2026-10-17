/**
 * Every signed-up account, across all 5 role collections, for the GAP
 * Administrator-only Account Approvals screen. Sign-up is self-service for
 * every role again - this is the after-the-fact review/revoke mechanism
 * that replaces the old "staff can't self-register at all" restriction.
 */
"use client";

import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { ROLE_COLLECTIONS, Role, UserProfile } from "../../shared/types";
import { Actor, writeAuditEntry } from "./shared";

export type AccountEntry = UserProfile & { reviewStatus: "Pending" | "Approved" | "Rejected" };

const ROLE_ENTRIES = Object.entries(ROLE_COLLECTIONS) as [Role, string][];

export function subscribeAllAccounts(onValue: (accounts: AccountEntry[]) => void, onError: (message: string) => void) {
  const byRole = new Map<Role, AccountEntry[]>();
  const emit = () => onValue(ROLE_ENTRIES.flatMap(([role]) => byRole.get(role) || []));
  const unsubscribers = ROLE_ENTRIES.map(([role, collectionName]) =>
    onSnapshot(collection(db, collectionName),
      snapshot => {
        byRole.set(role, snapshot.docs.map(item => {
          const data = item.data() as UserProfile;
          // Accounts created before this field existed have no reviewStatus
          // at all - treat that exactly like "Approved" (already usable, no
          // review pending), never as "Pending" needing fresh attention.
          return { ...data, reviewStatus: data.reviewStatus || "Approved" };
        }));
        emit();
      },
      error => onError(`Account list sync failed: ${error.message}`),
    ));
  return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

export async function setAccountReviewStatus(
  role: Role, uid: string, reviewStatus: "Approved" | "Rejected", actor: Actor,
): Promise<void> {
  await updateDoc(doc(db, ROLE_COLLECTIONS[role], uid), { reviewStatus });
  await writeAuditEntry(actor, `${reviewStatus} account`, uid);
}
