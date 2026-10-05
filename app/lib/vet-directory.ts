/**
 * Reads the live list of registered vet accounts from Firestore, so GAP staff
 * can assign (and reassign) work orders to a real vet, not a hardcoded list.
 */
"use client";

import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { DATA_COLLECTIONS, Practice, ROLE_COLLECTIONS, UserProfile } from "../shared/types";
import { eligibleVeterinaryProfiles } from "../contributions/aanay-sprint5";

export type VetDirectoryEntry = { uid: string; fullName: string; email: string; practice?: string; licenseNumber?: string };

export async function listRegisteredVets(): Promise<VetDirectoryEntry[]> {
  const [vetSnapshot, practiceSnapshot] = await Promise.all([
    getDocs(collection(db, ROLE_COLLECTIONS["Veterinary Practice"])),
    getDocs(collection(db, DATA_COLLECTIONS.practices)),
  ]);
  const profiles = vetSnapshot.docs.map(item => {
    const data = item.data() as UserProfile;
    return { uid: data.uid, fullName: data.fullName, email: data.email, practice: data.practice, licenseNumber: data.licenseNumber };
  });
  const practices = practiceSnapshot.docs.map(item => ({ ...(item.data() as Practice), id: item.id }));
  return eligibleVeterinaryProfiles(profiles, practices);
}
