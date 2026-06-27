import React, { createContext, useState, useEffect } from 'react';
import { getFirebaseInitError } from '@/firebase';
import { AuthService } from '@/services/AuthService';
import { UserService } from '@/services/UserService';
import type { User } from 'firebase/auth';
import type { UserProfile } from '@/types';

export interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  role: UserProfile['role'] | null;
  loading: boolean;
  initError: string | null;
  logout: () => Promise<void>;
  userName: string;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  role: null,
  loading: true,
  initError: null,
  logout: async () => {},
  userName: '',
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const firebaseErr = getFirebaseInitError?.();
    if (firebaseErr) {
      setInitError(firebaseErr);
      setLoading(false);
      return;
    }

    let unsubProfile: (() => void) | null = null;

    const unsubAuth = AuthService.onAuthStateChanged((firebaseUser) => {
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      const init = async () => {
        try {
          const defaultName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'משתמש';
          await UserService.ensureDocument(firebaseUser.uid, {
            displayName: defaultName,
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
          } as Partial<UserProfile>);

          unsubProfile = UserService.onSnapshot(firebaseUser.uid, (userProfile) => {
            if (!userProfile?.role) return;

            if (userProfile.role === 'teen' && !firebaseUser.emailVerified) {
              const createdTime = firebaseUser.metadata.creationTime;
              if (createdTime) {
                const hours = (Date.now() - new Date(createdTime).getTime()) / (1000 * 60 * 60);
                if (hours > 24) {
                  AuthService.logout();
                  setLoading(false);
                  return;
                }
              }
            }

            setProfile(userProfile);
            setLoading(false);
          });
        } catch (err) {
          console.error('Auth flow error:', err);
          setLoading(false);
        }
      };

      void init();
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const logout = () => AuthService.logout();

  const userName = (() => {
    if (!profile) return '';
    const p = profile as any;
    return p.name || p.companyName || p.displayName || user?.displayName || 'משתמש';
  })();

  return (
    <AuthContext.Provider value={{ user, profile, role: profile?.role || null, loading, initError, logout, userName }}>
      {children}
    </AuthContext.Provider>
  );
};
