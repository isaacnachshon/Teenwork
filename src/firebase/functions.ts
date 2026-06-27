import { getFunctions, Functions } from "firebase/functions";
import { app } from "./config";

let _functions: Functions | null = null;

if (app) {
  try {
    _functions = getFunctions(app);
  } catch (e: any) {
    console.error('Firebase Functions initialization error:', e);
  }
}

export const functions = _functions as Functions;
