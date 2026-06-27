import {
  doc, getDoc, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';

export interface AppSettings {
  maintenanceMode?: boolean;
  registrationEnabled?: boolean;
  maxJobsPerEmployer?: number;
  minAgeRequirement?: number;
  maxAgeRequirement?: number;
  supportEmail?: string;
  termsVersion?: string;
  updatedAt?: any;
}

const SETTINGS_DOC = 'app';

export const SettingsService = {
  async get(): Promise<AppSettings> {
    const snap = await getDoc(doc(db, 'settings', SETTINGS_DOC));
    return snap.exists() ? (snap.data() as AppSettings) : {};
  },

  async update(data: Partial<AppSettings>) {
    return setDoc(doc(db, 'settings', SETTINGS_DOC), {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },

  async getSetting<K extends keyof AppSettings>(key: K): Promise<AppSettings[K] | undefined> {
    const settings = await this.get();
    return settings[key];
  },
};
