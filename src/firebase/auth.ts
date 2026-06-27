import {
  initializeAuth,
  browserPopupRedirectResolver,
  browserLocalPersistence,
  Auth
} from "firebase/auth";
import { app } from "./config";

let _auth: Auth | null = null;

if (app) {
  try {
    _auth = initializeAuth(app, {
      popupRedirectResolver: browserPopupRedirectResolver,
      persistence: browserLocalPersistence,
    });
  } catch (e: any) {
    console.error('Firebase Auth initialization error:', e);
  }
}

export const auth = _auth as Auth;
