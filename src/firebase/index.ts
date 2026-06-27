import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  browserPopupRedirectResolver,
  browserLocalPersistence
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration, loaded from environment variables (see .env.example).
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase with runtime diagnostics. If initialization fails (for
// example due to an invalid config or environment restrictions) we capture the
// error message in `_initError` and expose it via `getFirebaseInitError()` so
// the app can render a helpful diagnostic message instead of remaining stuck
// on a loading screen.
let _initError: string | null = null;
let _app: any = null;
let _auth: any = null;
let _db: any = null;
let _storage: any = null;

try {
  _app = initializeApp(firebaseConfig);

  // Explicitly initialize Auth with a popup resolver. This can resolve
  // issues in some environments where the default `getAuth` has problems.
  _auth = initializeAuth(_app, {
    popupRedirectResolver: browserPopupRedirectResolver,
    persistence: browserLocalPersistence
  });

  _db = getFirestore(_app);
  _storage = getStorage(_app);
} catch (e: any) {
  // Keep a string message only; avoid exposing internal error objects.
  console.error('Firebase initialization error:', e);
  _initError = e?.message || String(e);
}

export const auth = _auth;
export const db = _db;
export const storage = _storage;

export function getFirebaseInitError() {
  return _initError;
}