import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '@/firebase';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const AuthService = {
  loginWithEmail(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  },

  signupWithEmail(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  },

  loginWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  },

  logout() {
    return signOut(auth);
  },

  sendPasswordReset(email: string) {
    return sendPasswordResetEmail(auth, email);
  },

  sendVerificationEmail(user: User) {
    return sendEmailVerification(user);
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No authenticated user');
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    return updatePassword(user, newPassword);
  },

  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  get currentUser() {
    return auth?.currentUser;
  },

  get currentUid() {
    return auth?.currentUser?.uid || null;
  },
};
