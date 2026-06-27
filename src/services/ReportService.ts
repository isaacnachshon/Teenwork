import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';

export type ReportType = 'inappropriate_content' | 'harassment' | 'spam' | 'safety_concern' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface ReportDoc {
  id: string;
  reporterId: string;
  reporterName?: string;
  targetType: 'user' | 'job' | 'message' | 'company';
  targetId: string;
  type: ReportType;
  description: string;
  status: ReportStatus;
  adminNotes?: string;
  createdAt?: any;
  resolvedAt?: any;
}

export const ReportService = {
  async create(data: Omit<ReportDoc, 'id' | 'status' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'reports'), {
      ...data,
      status: 'pending' as ReportStatus,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getAll(): Promise<ReportDoc[]> {
    const snap = await getDocs(query(collection(db, 'reports'), orderBy('createdAt', 'desc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ReportDoc));
  },

  async getPending(): Promise<ReportDoc[]> {
    const all = await this.getAll();
    return all.filter(r => r.status === 'pending');
  },

  async updateStatus(reportId: string, status: ReportStatus, adminNotes?: string) {
    const updates: Record<string, any> = { status };
    if (adminNotes) updates.adminNotes = adminNotes;
    if (status === 'resolved' || status === 'dismissed') updates.resolvedAt = serverTimestamp();
    return updateDoc(doc(db, 'reports', reportId), updates);
  },

  async delete(reportId: string) {
    return deleteDoc(doc(db, 'reports', reportId));
  },
};
