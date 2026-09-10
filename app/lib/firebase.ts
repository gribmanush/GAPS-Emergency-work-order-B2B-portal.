/**
 * Firebase project wiring: Authentication (email/password) + Firestore
 * (per-user role and profile fields collected at sign up).
 *
 * TODO — replace every value below with your own project's config.
 * Find it in the Firebase console: gear icon -> Project settings -> General
 * tab -> "Your apps" -> Web app -> SDK setup and configuration -> Config.
 * If you haven't created a web app yet, click "Add app" -> the </> icon first.
 *
 * These values are safe to commit: Firebase's own docs confirm the web config
 * is not a secret (security comes from Firestore/Auth rules, not from hiding
 * this object). Also remember to turn on Email/Password under
 * Authentication -> Sign-in method, and to create a Firestore database
 * (any region, start in test mode for this prototype).
 */
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBveIAfSFi29HiKaF6zfYOoLPjKMdYtxWs",
  authDomain: "gap-emergency-work-order.firebaseapp.com",
  projectId: "gap-emergency-work-order",
  storageBucket: "gap-emergency-work-order.firebasestorage.app",
  messagingSenderId: "498062084015",
  appId: "1:498062084015:web:c07bf7c33072e5f5c2115a",
  measurementId: "G-JME072G0HL",
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
