import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs,
  serverTimestamp, onSnapshot, Unsubscribe,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '@/firebase/firestore';
import { storage } from '@/firebase/storage';

export interface UserDoc {
  uid: string;
  displayName: string;
  name?: string;
  email: string;
  photoURL?: string;
  role: 'teen' | 'employer' | 'admin';
  phone?: string;
  city?: string;
  birthDate?: string;
  school?: string;
  bio?: string;
  skills?: string[];
  companyName?: string;
  profileImageUrl?: string;
  companyLogoUrl?: string;
  cvUrl?: string;
  cvFileName?: string;
  availability?: string[];
  favoriteJobs?: string[];
  profileCompleted?: boolean;
  status?: string;
  createdAt?: any;
  updatedAt?: any;
  lastLogin?: any;
}

export const UserService = {
  async get(uid: string): Promise<UserDoc | null> {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as UserDoc) : null;
  },

  async create(uid: string, data: Partial<UserDoc>) {
    return setDoc(doc(db, 'users', uid), {
      uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      status: 'active',
      profileCompleted: false,
      ...data,
    });
  },

  async update(uid: string, data: Partial<UserDoc>) {
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

  async ensureDocument(uid: string, defaults: Partial<UserDoc>): Promise<UserDoc['role']> {
    const existing = await this.get(uid);
    if (existing) {
      await this.touchLogin(uid);
      return existing.role || 'teen';
    }
    await this.create(uid, defaults);
    return (defaults.role as UserDoc['role']) || 'teen';
  },

  onSnapshot(uid: string, callback: (data: UserDoc | null) => void): Unsubscribe {
    return onSnapshot(doc(db, 'users', uid), (snap) => {
      callback(snap.exists() ? (snap.data() as UserDoc) : null);
    });
  },

  async listByRole(role: 'teen' | 'employer' | 'admin'): Promise<UserDoc[]> {
    const snap = await getDocs(query(collection(db, 'users'), where('role', '==', role)));
    return snap.docs.map(d => d.data() as UserDoc);
  },

  async uploadProfileImage(uid: string, file: File, role: 'teen' | 'employer'): Promise<string> {
    const path = role === 'employer' ? `companyLogos/${uid}` : `profileImages/teens/${uid}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    const field = role === 'employer' ? 'companyLogoUrl' : 'profileImageUrl';
    await this.update(uid, { [field]: url } as any);
    return url;
  },

  async uploadCv(uid: string, file: File): Promise<{ url: string; fileName: string }> {
    const storageRef = ref(storage, `cvs/${uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await this.update(uid, { cvUrl: url, cvFileName: file.name } as any);
    return { url, fileName: file.name };
  },
};
