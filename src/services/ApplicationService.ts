import {
  collection, doc, getDocs, addDoc, updateDoc,
  query, where, serverTimestamp, getDoc,
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';

export type ApplicationStatus = 'new' | 'viewed' | 'contacted' | 'interview' | 'accepted' | 'rejected' | 'completed';

export interface ApplicationDoc {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantId: string;
  employerId: string;
  teenName?: string;
  employerName?: string;
  status: ApplicationStatus;
  createdAt?: any;
  updatedAt?: any;
}

export const ApplicationService = {
  async create(data: Omit<ApplicationDoc, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'applications'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateStatus(appId: string, status: ApplicationStatus) {
    return updateDoc(doc(db, 'applications', appId), {
      status,
      updatedAt: serverTimestamp(),
    });
  },

  async getByApplicant(applicantId: string): Promise<ApplicationDoc[]> {
    const snap = await getDocs(query(collection(db, 'applications'), where('applicantId', '==', applicantId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ApplicationDoc));
  },

  async getByEmployer(employerId: string): Promise<ApplicationDoc[]> {
    const snap = await getDocs(query(collection(db, 'applications'), where('employerId', '==', employerId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ApplicationDoc));
  },

  async getByJob(jobId: string): Promise<ApplicationDoc[]> {
    const snap = await getDocs(query(collection(db, 'applications'), where('jobId', '==', jobId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ApplicationDoc));
  },

  async getAll(): Promise<ApplicationDoc[]> {
    const snap = await getDocs(collection(db, 'applications'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ApplicationDoc));
  },

  async count(): Promise<number> {
    const snap = await getDocs(collection(db, 'applications'));
    return snap.size;
  },
};
