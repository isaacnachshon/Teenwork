

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
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';

type Role = 'landing' | 'about' | 'teen' | 'employer' | 'admin';

type CurrentUser = {
  firebaseUser: User;
  role: Exclude<Role, 'landing' | 'about'>;
};

const ensureUserDocument = async (user: User): Promise<Exclude<Role, 'landing' | 'about'>> => {
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    const data = userDoc.data();
    await setDoc(userDocRef, {
      lastLogin: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return (data.role as Exclude<Role, 'landing' | 'about'>) || 'teen';
  }

  const defaultName = user.displayName || user.email?.split('@')[0] || 'משתמש';
  await setDoc(userDocRef, {
    uid: user.uid,
    displayName: defaultName,
    name: defaultName,
    email: user.email || '',
    photoURL: user.photoURL || '',
    role: 'teen',
    phone: '',
    city: '',
    birthDate: '',
    profileCompleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    status: 'active',
  });

  return 'teen';
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
        const handleUserDocument = async () => {
          try {
            const role = await ensureUserDocument(user);

            const userDocRef = doc(db, 'users', user.uid);
            unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
              let resolvedRole: Exclude<Role, 'landing'> | null = null;

              if (docSnap.exists()) {
                const userData = docSnap.data();
                resolvedRole = userData.role as Exclude<Role, 'landing'>;
              }

              if (resolvedRole) {
                if (resolvedRole === 'teen' && !user.emailVerified) {
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

                setCurrentUser({ firebaseUser: user, role: resolvedRole });
                setView(resolvedRole);
                setLoading(false);
              }
            }, (error) => {
              console.error('Error listening to user doc:', error);
              setLoading(false);
            });
          } catch (error) {
            console.error('Failed to ensure user document:', error);
            setLoading(false);
          }
        };

        void handleUserDocument();

      } else {
        setCurrentUser(null);
        setView('landing');
        setLoading(false);
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
        return <TeenLoginPage onBack={() => setView('landing')} />;

      case 'employer':
        return currentUser?.role === 'employer'
          ? <DashboardLayout role="employer" userName={getUserName()} onLogout={handleLogout} />
          : <EmployerLoginPage onBack={() => setView('landing')} />;

      case 'admin':
        return currentUser?.role === 'admin'
          ? <DashboardLayout role="admin" userName={getUserName()} onLogout={handleLogout} />
          : <LoginPage onBack={() => setView('landing')} />;

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
