import { getFirestore, Firestore } from "firebase/firestore";
import { app } from "./config";

let _db: Firestore | null = null;

if (app) {
  try {
    _db = getFirestore(app);
  } catch (e: any) {
    console.error('Firestore initialization error:', e);
  }
}

export const db = _db as Firestore;
