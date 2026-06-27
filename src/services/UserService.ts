import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs,
  serverTimestamp, onSnapshot, Unsubscribe,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '@/firebase/firestore';
import { storage } from '@/firebase/storage';
import type { UserProfile } from '@/types';

export const UserService = {
  async get(uid: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  },

  async create(uid: string, data: Partial<UserProfile>) {
    return setDoc(doc(db, 'users', uid), {
      uid,
      displayName: '',
      email: '',
      photoURL: '',
      phone: '',
      city: '',
      birthDate: '',
      profileCompleted: false,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      ...data,
    });
  },

  async update(uid: string, data: Record<string, any>) {
    return updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(uid: string) {
    return deleteDoc(doc(db, 'users', uid));
  },

  async touchLogin(uid: string) {
    return updateDoc(doc(db, 'users', uid), {
      lastLogin: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async ensureDocument(uid: string, defaults: Partial<UserProfile>): Promise<UserProfile['role']> {
    const existing = await this.get(uid);
    if (existing) {
      await this.touchLogin(uid);
      return existing.role || 'teen';
    }
    await this.create(uid, defaults);
    return defaults.role || 'teen';
  },

  onSnapshot(uid: string, callback: (data: UserProfile | null) => void): Unsubscribe {
    return onSnapshot(doc(db, 'users', uid), (snap) => {
      callback(snap.exists() ? (snap.data() as UserProfile) : null);
    });
  },

  async listByRole(role: UserProfile['role']): Promise<UserProfile[]> {
    const snap = await getDocs(query(collection(db, 'users'), where('role', '==', role)));
    return snap.docs.map(d => d.data() as UserProfile);
  },

  async uploadProfileImage(uid: string, file: File, role: 'teen' | 'employer'): Promise<string> {
    const path = role === 'employer' ? `companyLogos/${uid}` : `profileImages/teens/${uid}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    const field = role === 'employer' ? 'companyLogoUrl' : 'profileImageUrl';
    await this.update(uid, { [field]: url });
    return url;
  },

  async uploadCv(uid: string, file: File): Promise<{ url: string; fileName: string }> {
    const storageRef = ref(storage, `cvs/${uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await this.update(uid, { cvUrl: url, cvFileName: file.name });
    return { url, fileName: file.name };
  },
};
