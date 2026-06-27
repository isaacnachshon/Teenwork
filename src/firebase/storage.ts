import { getStorage, FirebaseStorage } from "firebase/storage";
import { app } from "./config";

let _storage: FirebaseStorage | null = null;

if (app) {
  try {
    _storage = getStorage(app);
  } catch (e: any) {
    console.error('Firebase Storage initialization error:', e);
  }
}

export const storage = _storage as FirebaseStorage;
