/**
 * Reads the live list of registered vet accounts from Firestore, so GAP staff
 * can assign (and reassign) work orders to a real vet, not a hardcoded list.
 */
"use client";

import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { ROLE_COLLECTIONS, UserProfile } from "../shared/types";

export type VetDirectoryEntry = { uid: string; fullName: string; email: string; practice?: string };

export async function listRegisteredVets(): Promise<VetDirectoryEntry[]> {
  const snapshot = await getDocs(collection(db, ROLE_COLLECTIONS["Veterinary Practice"]));
  return snapshot.docs.map(item => {
    const data = item.data() as UserProfile;
    return { uid: data.uid, fullName: data.fullName, email: data.email, practice: data.practice };
  });
}
