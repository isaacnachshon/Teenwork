import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  browserPopupRedirectResolver,
  browserLocalPersistence
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBJzLMOzNWVHScG4yAwiXVDKDmFrGN8cAg",
  authDomain: "teenwork-4c9de.firebaseapp.com",
  projectId: "teenwork-4c9de",
  storageBucket: "teenwork-4c9de.firebasestorage.app",
  messagingSenderId: "374398540771",
  appId: "1:374398540771:web:e17f14c480a27e4abe1ed6"
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