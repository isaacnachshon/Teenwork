import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';
import type { FirebaseApp } from 'firebase/app';

declare global {
  // Read by the App Check SDK before initialization (dev/CI only).
  var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined;
}

const siteKey = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY as string | undefined;

/**
 * Initializes Firebase App Check (reCAPTCHA v3) for the given app instance.
 * Returns null when no site key is configured so local setups without a key keep working.
 * Enforcement is controlled in the Firebase Console, not here.
 */
export function initAppCheckFor(app: FirebaseApp | null): AppCheck | null {
  if (!app || !siteKey) return null;
  try {
    if (import.meta.env.DEV) {
      // On localhost reCAPTCHA cannot verify the domain; use a debug token instead.
      // Set VITE_APPCHECK_DEBUG_TOKEN to a token registered in Firebase Console > App Check,
      // or leave it unset to have the SDK print a fresh one in the browser console.
      globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
    }
    return initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (e: any) {
    console.error('Firebase App Check initialization error:', e);
    return null;
  }
}
