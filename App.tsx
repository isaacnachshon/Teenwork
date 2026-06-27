

import React, { useState, useMemo, useEffect } from 'react';
import DashboardLayout from './components/dashboard/DashboardLayout';
import LoginPage from './components/LoginPage';
import EmployerLoginPage from './components/EmployerLoginPage';
import TeenLoginPage from './components/TeenLoginPage';
import LandingPage from './components/LandingPage';
import AboutPage from './components/AboutPage';
import EmailVerificationPage from './components/EmailVerificationPage';

import { auth, db, getFirebaseInitError } from './firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

type Role = 'landing' | 'about' | 'teen' | 'employer' | 'admin';

type CurrentUser = {
  firebaseUser: User;
  role: Exclude<Role, 'landing' | 'about'>;
};

const App: React.FC = () => {
  const [view, setView] = useState<Role>('landing');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    // If Firebase failed to initialize, surface the error immediately.
    const firebaseInitErr = getFirebaseInitError && getFirebaseInitError();
    if (firebaseInitErr) {
      console.error('Firebase init error detected in App:', firebaseInitErr);
      setInitError(firebaseInitErr);
      setLoading(false);
      return;
    }

    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Always cleanup previous document listener when auth state changes
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (user) {
        // User is signed in. Listen to their Firestore document to determine role.
        // Using onSnapshot allows us to handle the case where the user is created (auth)
        // but the Firestore document is still being written (race condition during signup).
        const userDocRef = doc(db, 'users', user.uid);

        unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
          let role: Exclude<Role, 'landing'> | null = null;

          if (docSnap.exists()) {
            const userData = docSnap.data();
            role = userData.role as Exclude<Role, 'landing'>;
          }

          if (role) {
            // Verification logic for teens
            if (role === 'teen' && !user.emailVerified) {
              // Logic for unverified email...
              const creationTime = new Date(user.metadata.creationTime!).getTime();
              const now = new Date().getTime();
              const hoursSinceCreation = (now - creationTime) / (1000 * 60 * 60);

              if (hoursSinceCreation > 24) {
                alert('Your registration expired because your email was not verified within 24 hours. Please sign up again.');
                signOut(auth);
                setLoading(false);
                return;
              }
            }

            setCurrentUser({ firebaseUser: user, role });
            setView(role);
            setLoading(false);
          } else {
            // Document doesn't exist yet (or deleted). 
            // DO NOT sign out immediately, as it might be a new user signup in progress.
            // We keep 'loading' true or allow the UI to handle the waiting state.
            // Optionally, we could set a timeout here if we wanted to enforce strictly, 
            // but relying on the snapshot update is cleaner for the happy path.
            // Profile doc may not exist yet — the onSnapshot listener will fire again when it's created.
          }
        }, (error) => {
          console.error("Error listening to user doc:", error);
          setLoading(false);
        });

      } else {
        // User is signed out
        setCurrentUser(null);
        setLoading(false);
        // If we were on a protected route, we might want to redirect, 
        // but 'view' state management handles rendering.
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) {
        unsubscribeDoc();
      }
    };
  }, []);

  const handleRoleChange = (newView: Role) => {
    setView(newView);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const getUserName = (): string => {
    if (!currentUser) return '';
    const data = currentUser as any;
    return data.displayName || currentUser.firebaseUser.displayName || currentUser.firebaseUser.email?.split('@')[0] || 'משתמש';
  };

  const dashboard = useMemo(() => {
    switch (view) {
      case 'about':
        return <AboutPage onBack={() => setView('landing')} />;

      case 'landing':
        return <LandingPage onRoleSelect={handleRoleChange} />;

      case 'teen':
        if (currentUser?.role === 'teen') {
          if (currentUser.firebaseUser.emailVerified) {
            return <DashboardLayout role="teen" userName={getUserName()} onLogout={handleLogout} />;
          } else {
            return <EmailVerificationPage user={currentUser.firebaseUser} />;
          }
        }
        return <TeenLoginPage />;

      case 'employer':
        return currentUser?.role === 'employer'
          ? <DashboardLayout role="employer" userName={getUserName()} onLogout={handleLogout} />
          : <EmployerLoginPage />;

      case 'admin':
        return currentUser?.role === 'admin'
          ? <DashboardLayout role="admin" userName={getUserName()} onLogout={handleLogout} />
          : <LoginPage />;

      default:
        return <LandingPage onRoleSelect={handleRoleChange} />;
    }
  }, [view, currentUser]);

  const isDashboard = view === 'teen' || view === 'employer' || view === 'admin';
  const showingDashboard = isDashboard && currentUser?.role === view;

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
          <p className="mt-4 text-sm text-gray-600">פתח את קונסולת הדפדפן (DevTools) כדי לראות פרטים נוספים.</p>
        </div>
      </div>
    );
  }

  if (showingDashboard) {
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
