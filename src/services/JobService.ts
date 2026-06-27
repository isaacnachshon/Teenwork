import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, serverTimestamp, arrayUnion, arrayRemove,
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';
import type { Job } from '@/types';

export interface JobDoc extends Omit<Job, 'id'> {
  employerId: string;
  createdAt?: any;
  updatedAt?: any;
}

export const JobService = {
  async getAll(): Promise<Job[]> {
    const snap = await getDocs(collection(db, 'jobs'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Job));
  },

  async getById(jobId: string): Promise<Job | null> {
    const snap = await getDoc(doc(db, 'jobs', jobId));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Job) : null;
  },

  async getByEmployer(employerId: string): Promise<Job[]> {
    const snap = await getDocs(query(collection(db, 'jobs'), where('employerId', '==', employerId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Job));
  },

  async create(data: JobDoc): Promise<string> {
    const docRef = await addDoc(collection(db, 'jobs'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(jobId: string, data: Partial<JobDoc>) {
    return updateDoc(doc(db, 'jobs', jobId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(jobId: string) {
    return deleteDoc(doc(db, 'jobs', jobId));
  },

  async addFavorite(uid: string, jobId: string) {
    return updateDoc(doc(db, 'users', uid), { favoriteJobs: arrayUnion(jobId) });
  },

  async removeFavorite(uid: string, jobId: string) {
    return updateDoc(doc(db, 'users', uid), { favoriteJobs: arrayRemove(jobId) });
  },

  async toggleFavorite(uid: string, jobId: string, currentFavorites: string[]): Promise<boolean> {
    const isFav = currentFavorites.includes(jobId);
    if (isFav) {
      await this.removeFavorite(uid, jobId);
    } else {
      await this.addFavorite(uid, jobId);
    }
    return !isFav;
  },
};
