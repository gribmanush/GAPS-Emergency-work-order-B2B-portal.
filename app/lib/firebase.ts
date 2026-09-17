/**
 * Firebase project wiring: Authentication (email/password) + Firestore
 * (per-user role/profile fields at sign up, and the invoice workflow).
 *
 * These values are safe to commit: Firebase's own docs confirm the web config
 * is not a secret (security comes from Firestore/Auth rules, not from hiding
 * this object). Email/Password sign-in and Firestore must be enabled in the
 * Firebase console, and firestore.rules deployed, for this to work end to end.
 */
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBveIAfSFi29HiKaF6zfYOoLPjKMdYtxWs",
  authDomain: "gap-emergency-work-order.firebaseapp.com",
  projectId: "gap-emergency-work-order",
  storageBucket: "gap-emergency-work-order.firebasestorage.app",
  messagingSenderId: "498062084015",
  appId: "1:498062084015:web:c07bf7c33072e5f5c2115a",
  measurementId: "G-JME072G0HL",
};

export const isFirebaseConfigured = true;

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export function getFirebaseDb(): Firestore | null {
  return db;
}
