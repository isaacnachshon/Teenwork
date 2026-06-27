import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, onSnapshot, Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';

export type NotificationType = 'application' | 'message' | 'status_change' | 'system';

export interface NotificationDoc {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  read: boolean;
  link?: string;
  createdAt?: any;
}

export const NotificationService = {
  async getByUser(userId: string): Promise<NotificationDoc[]> {
    const snap = await getDocs(
      query(collection(db, 'notifications'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as NotificationDoc));
  },

  onUserNotifications(userId: string, callback: (notifications: NotificationDoc[]) => void): Unsubscribe {
    return onSnapshot(
      query(collection(db, 'notifications'), where('userId', '==', userId), orderBy('createdAt', 'desc')),
      (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as NotificationDoc)));
      }
    );
  },

  async create(data: Omit<NotificationDoc, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async markAsRead(notificationId: string) {
    return updateDoc(doc(db, 'notifications', notificationId), { read: true });
  },

  async markAllAsRead(userId: string) {
    const unread = await getDocs(
      query(collection(db, 'notifications'), where('userId', '==', userId), where('read', '==', false))
    );
    const updates = unread.docs.map(d => updateDoc(d.ref, { read: true }));
    return Promise.all(updates);
  },

  async delete(notificationId: string) {
    return deleteDoc(doc(db, 'notifications', notificationId));
  },

  async getUnreadCount(userId: string): Promise<number> {
    const snap = await getDocs(
      query(collection(db, 'notifications'), where('userId', '==', userId), where('read', '==', false))
    );
    return snap.size;
  },
};
