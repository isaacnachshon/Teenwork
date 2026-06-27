

import React, { useState, useMemo, useEffect } from 'react';
import TeenDashboard from './components/dashboards/TeenDashboard';
import EmployerDashboard from './components/dashboards/EmployerDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import LoginPage from './components/LoginPage';
import EmployerLoginPage from './components/EmployerLoginPage';
import TeenLoginPage from './components/TeenLoginPage';
import LandingPage from './components/LandingPage';
import AboutPage from './components/AboutPage';
import EmailVerificationPage from './components/EmailVerificationPage';
import { UserIcon, BriefcaseIcon, ShieldCheckIcon } from './components/icons';

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
  const [hideGlobalHeader, setHideGlobalHeader] = useState(false);

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

  const dashboard = useMemo(() => {
    switch (view) {
      case 'about':
        return <AboutPage onBack={() => setView('landing')} />;

      case 'landing':
        return <LandingPage onRoleSelect={handleRoleChange} />;

      case 'teen':
        if (currentUser?.role === 'teen') {
          if (currentUser.firebaseUser.emailVerified) {
            return <TeenDashboard onLogout={handleLogout} onHeaderVisibilityChange={setHideGlobalHeader} />;
          } else {
            return <EmailVerificationPage user={currentUser.firebaseUser} />;
          }
        }
        return <TeenLoginPage />;

      case 'employer':
        return currentUser?.role === 'employer'
          ? <EmployerDashboard onLogout={handleLogout} />
          : <EmployerLoginPage />;

      case 'admin':
        return currentUser?.role === 'admin'
          ? <AdminDashboard onLogout={handleLogout} />
          : <LoginPage />;

      default:
        return <LandingPage onRoleSelect={handleRoleChange} />;
    }
  }, [view, currentUser]);

  const getButtonClass = (buttonRole: Role) => {
    const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";
    if (view === buttonRole) {
      switch (buttonRole) {
        case 'teen':
          return `${baseClasses} bg-purple-600 text-white shadow-lg scale-105 ring-purple-500`;
        case 'employer':
          return `${baseClasses} bg-blue-600 text-white shadow-lg scale-105 ring-blue-500`;
        case 'admin':
          return `${baseClasses} bg-gray-700 text-white shadow-lg scale-105 ring-gray-600`;
        default:
          return '';
      }
    }
    return `${baseClasses} bg-white text-gray-700 hover:bg-gray-100`;
  };

  const showHeader = view !== 'landing' && !hideGlobalHeader;

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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {showHeader && (
        <header className="bg-white shadow-md p-4 sticky top-0 z-50 animate-in fade-in-0 duration-300">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => setView('landing')} aria-label="TEENWORK - חזרה לדף הבית" className="text-2xl font-bold text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded transition-transform duration-200 hover:scale-105">
                TEENWORK
              </button>
            </div>
            <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-xl">
              <button onClick={() => handleRoleChange('teen')} className={getButtonClass('teen')}>
                <UserIcon className="w-5 h-5" />
                <span>נוער</span>
              </button>
              <button onClick={() => handleRoleChange('employer')} className={getButtonClass('employer')}>
                <BriefcaseIcon className="w-5 h-5" />
                <span>מעסיקים</span>
              </button>
              <button onClick={() => handleRoleChange('admin')} className={getButtonClass('admin')}>
                <ShieldCheckIcon className="w-5 h-5" />
                <span>מנהלים</span>
              </button>
            </div>
          </div>
        </header>
      )}
      <main id="main-content" tabIndex={-1}>
        {dashboard}
      </main>
    </div>
  );
};

export default App;
