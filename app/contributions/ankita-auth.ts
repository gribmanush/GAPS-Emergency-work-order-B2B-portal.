/**
 * Team JAM contribution: ANKITA BASNET
 * Real Firebase authentication: sign in, role-aware sign up (writes a
 * Firestore profile alongside the auth account), and password reset.
 */
"use client";

import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { accounts, UserProfile } from "../shared/types";

export const PASSWORD_REQUIREMENTS =
  "At least 8 characters, with an uppercase letter, a lowercase letter, a number and a symbol.";
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function isStrongPassword(password: string) {
  return PASSWORD_PATTERN.test(password);
}

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Email or password is incorrect.",
  "auth/wrong-password": "Email or password is incorrect.",
  "auth/user-not-found": "Email or password is incorrect.",
  "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
  "auth/email-already-in-use": "An account with that email already exists.",
  "auth/weak-password": PASSWORD_REQUIREMENTS,
  "auth/invalid-email": "Enter a valid email address.",
};

export function friendlyAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code;
  return (code && ERROR_MESSAGES[code]) || "Something went wrong. Please try again.";
}

async function loadProfile(uid: string, email: string): Promise<UserProfile> {
  const snapshot = await getDoc(doc(db, "users", uid));
  if (snapshot.exists()) return snapshot.data() as UserProfile;

  const normalizedEmail = email.trim().toLowerCase();
  const fallback = accounts[normalizedEmail];
  if (fallback) return { uid, email: normalizedEmail, fullName: fallback.name, phone: "", role: fallback.role };

  return { uid, email: normalizedEmail, fullName: normalizedEmail, phone: "", role: "Veterinary Practice" };
}

export async function signIn(email: string, password: string, remember: boolean): Promise<UserProfile> {
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  return loadProfile(credential.user.uid, credential.user.email || email);
}

export async function signUp(profile: Omit<UserProfile, "uid">, password: string): Promise<UserProfile> {
  await setPersistence(auth, browserLocalPersistence);
  const credential = await createUserWithEmailAndPassword(auth, profile.email.trim().toLowerCase(), password);
  await updateProfile(credential.user, { displayName: profile.fullName });
  const fullProfile: UserProfile = { ...profile, email: profile.email.trim().toLowerCase(), uid: credential.user.uid };
  await setDoc(doc(db, "users", credential.user.uid), fullProfile);
  return fullProfile;
}

export function requestPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email.trim().toLowerCase());
}

export function signOutUser() {
  return signOut(auth);
}

export { loadProfile, auth };
