import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, onSnapshot, Unsubscribe, or, Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';

export interface MessageDoc {
  id: string;
  senderId: string;
  recipientId: string;
  senderName: string;
  recipientName: string;
  text: string;
  timestamp: Date;
  flagged: boolean;
  readAt?: any;
}

export const MessageService = {
  onUserMessages(uid: string, callback: (messages: MessageDoc[]) => void): Unsubscribe {
    const q = query(
      collection(db, 'messages'),
      or(where('senderId', '==', uid), where('recipientId', '==', uid))
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
        } as MessageDoc;
      }));
    });
  },

  onAllMessages(callback: (messages: MessageDoc[]) => void): Unsubscribe {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
        } as MessageDoc;
      }));
    });
  },

  async send(data: Omit<MessageDoc, 'id' | 'timestamp' | 'flagged'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'messages'), {
      ...data,
      flagged: false,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  },

  async flag(messageId: string, flagged: boolean) {
    return updateDoc(doc(db, 'messages', messageId), { flagged });
  },

  async markAsRead(messageId: string) {
    return updateDoc(doc(db, 'messages', messageId), { readAt: serverTimestamp() });
  },

  async delete(messageId: string) {
    return deleteDoc(doc(db, 'messages', messageId));
  },

  async getConversation(uid1: string, uid2: string): Promise<MessageDoc[]> {
    const snap = await getDocs(
      query(collection(db, 'messages'), or(
        where('senderId', '==', uid1),
        where('recipientId', '==', uid1)
      ))
    );
    return snap.docs
      .map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
        } as MessageDoc;
      })
      .filter(m => m.senderId === uid2 || m.recipientId === uid2)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  },
};
