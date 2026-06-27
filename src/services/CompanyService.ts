import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';

export interface CompanyDoc {
  id: string;
  ownerId: string;
  name: string;
  address?: string;
  description?: string;
  logoUrl?: string;
  createdAt?: any;
  updatedAt?: any;
}

export const CompanyService = {
  async getById(companyId: string): Promise<CompanyDoc | null> {
    const snap = await getDoc(doc(db, 'companies', companyId));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as CompanyDoc) : null;
  },

  async getByOwner(ownerId: string): Promise<CompanyDoc[]> {
    const snap = await getDocs(query(collection(db, 'companies'), where('ownerId', '==', ownerId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as CompanyDoc));
  },

  async getAll(): Promise<CompanyDoc[]> {
    const snap = await getDocs(collection(db, 'companies'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as CompanyDoc));
  },

  async create(data: Omit<CompanyDoc, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'companies'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(companyId: string, data: Partial<CompanyDoc>) {
    return updateDoc(doc(db, 'companies', companyId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(companyId: string) {
    return deleteDoc(doc(db, 'companies', companyId));
  },
};
