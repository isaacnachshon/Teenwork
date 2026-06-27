import React, { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/auth/LoginPage';
import EmployerLoginPage from '@/pages/auth/EmployerLoginPage';
import TeenLoginPage from '@/pages/auth/TeenLoginPage';
import LandingPage from '@/pages/LandingPage';
import AboutPage from '@/pages/AboutPage';
import EmailVerificationPage from '@/pages/auth/EmailVerificationPage';
import ParentApprovalPage from '@/pages/auth/ParentApprovalPage';
import WaitingForParentApproval from '@/pages/auth/WaitingForParentApproval';

import { getFirebaseInitError } from '@/firebase';
import { AuthService } from '@/services/AuthService';
import { UserService } from '@/services/UserService';
import type { User } from 'firebase/auth';
import type { UserProfile } from '@/types';

type View = 'landing' | 'about' | 'teen' | 'employer' | 'admin';

interface AuthState {
  firebaseUser: User;
  profile: UserProfile;
}

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [approvalToken, setApprovalToken] = useState<string | null>(null);

  // ── Step 0: Check for parental approval token in URL ──
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('approve');
    if (token) setApprovalToken(token);
  }, []);

  // ── Auth Flow: onAuthStateChanged → ensureUser → loadProfile → route ──
  useEffect(() => {
    if (approvalToken) return;

    const firebaseErr = getFirebaseInitError?.();
    if (firebaseErr) {
      setInitError(firebaseErr);
      setLoading(false);
      return;
    }

    let unsubProfile: (() => void) | null = null;

    const unsubAuth = AuthService.onAuthStateChanged((user) => {
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (!user) {
        // ── Logged out → Landing ──
        setAuthState(null);
        setView('landing');
        setLoading(false);
        return;
      }

      // ── Logged in → ensure user doc → listen to profile ──
      const init = async () => {
        try {
          const defaultName = user.displayName || user.email?.split('@')[0] || 'משתמש';
          await UserService.ensureDocument(user.uid, {
            displayName: defaultName,
            email: user.email || '',
            photoURL: user.photoURL || '',
          } as Partial<UserProfile>);

          unsubProfile = UserService.onSnapshot(user.uid, (profile) => {
            if (!profile?.role) return;

            // ── Teen email verification check (24h expiry) ──
            if (profile.role === 'teen' && !user.emailVerified) {
              const created = new Date(user.metadata.creationTime!).getTime();
              const hoursSinceCreation = (Date.now() - created) / (1000 * 60 * 60);
              if (hoursSinceCreation > 24) {
                alert('ההרשמה שלך פגה כי האימייל לא אומת תוך 24 שעות. נא להירשם מחדש.');
                AuthService.logout();
                setLoading(false);
                return;
              }
            }

            setAuthState({ firebaseUser: user, profile });
            setView(profile.role);
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
  }, [approvalToken]);

  // ── Handlers ──
  const handleLogout = () => AuthService.logout();

  const getUserName = (): string => {
    if (!authState) return '';
    const p = authState.profile as any;
    return p.name || p.companyName || p.displayName || authState.firebaseUser.displayName || 'משתמש';
  };

  // ── Protected Route Logic ──
  const dashboard = useMemo(() => {
    switch (view) {
      case 'about':
        return <AboutPage onBack={() => setView('landing')} />;

      case 'landing':
        return <LandingPage onRoleSelect={(v) => setView(v as View)} />;

      case 'teen':
        if (authState?.profile.role === 'teen') {
          if (!authState.firebaseUser.emailVerified) {
            return <EmailVerificationPage user={authState.firebaseUser} />;
          }
          const consent = (authState.profile as any).parentalConsentStatus;
          if (consent !== 'approved') {
            return <WaitingForParentApproval user={authState.firebaseUser} />;
          }
          return <DashboardLayout role="teen" userName={getUserName()} onLogout={handleLogout} />;
        }
        return <TeenLoginPage onBack={() => setView('landing')} />;

      case 'employer':
        return authState?.profile.role === 'employer'
          ? <DashboardLayout role="employer" userName={getUserName()} onLogout={handleLogout} />
          : <EmployerLoginPage onBack={() => setView('landing')} />;

      case 'admin':
        return authState?.profile.role === 'admin'
          ? <DashboardLayout role="admin" userName={getUserName()} onLogout={handleLogout} />
          : <LoginPage onBack={() => setView('landing')} />;

      default:
        return <LandingPage onRoleSelect={(v) => setView(v as View)} />;
    }
  }, [view, authState]);

  // ── Render ──
  if (approvalToken) {
    return <ParentApprovalPage token={approvalToken} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-2xl font-bold text-gray-700">טוען...</div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-2xl bg-white p-8 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">שגיאת אתחול</h2>
          <p className="mb-4 text-sm text-gray-700">האפליקציה נתקלה בבעיה בזמן התחלת Firebase:</p>
          <pre className="bg-gray-100 p-3 rounded text-sm text-red-700 overflow-auto">{initError}</pre>
        </div>
      </div>
    );
  }

  const isProtectedRoute = view === 'teen' || view === 'employer' || view === 'admin';
  if (isProtectedRoute && authState?.profile.role === view) {
    return dashboard;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <main id="main-content" tabIndex={-1}>
        {dashboard}
      </main>
    </div>
  );
};

export default App;
