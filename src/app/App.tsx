import React, { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/auth/LoginPage';
import EmployerLoginPage from '@/pages/auth/EmployerLoginPage';
import TeenLoginPage from '@/pages/auth/TeenLoginPage';
import LandingPage from '@/pages/LandingPage';
import AboutPage from '@/pages/AboutPage';
import EmailVerificationPage from '@/pages/auth/EmailVerificationPage';
import ParentApprovalPage from '@/pages/auth/ParentApprovalPage';
import { useAuth } from '@/hooks/useAuth';

type View = 'landing' | 'about' | 'teen' | 'employer' | 'admin';

const App: React.FC = () => {
  const { user, profile, role, loading, initError, logout, userName } = useAuth();
  const [view, setView] = useState<View>('landing');
  const [approvalToken, setApprovalToken] = useState<string | null>(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('approve');
    if (token) setApprovalToken(token);
  }, []);

  useEffect(() => {
    if (role) {
      setView(role);
    } else if (!user && !loading) {
      setView('landing');
    }
  }, [role, user, loading]);

  const dashboard = useMemo(() => {
    switch (view) {
      case 'about':
        return <AboutPage onBack={() => setView('landing')} />;

      case 'landing':
        return <LandingPage onRoleSelect={(v) => setView(v as View)} />;

      case 'teen':
        if (role === 'teen' && user) {
          if (!user.emailVerified) {
            return <EmailVerificationPage user={user} />;
          }
          return <DashboardLayout role="teen" userName={userName} onLogout={logout} />;
        }
        return <TeenLoginPage onBack={() => setView('landing')} />;

      case 'employer':
        return role === 'employer'
          ? <DashboardLayout role="employer" userName={userName} onLogout={logout} />
          : <EmployerLoginPage onBack={() => setView('landing')} />;

      case 'admin':
        return role === 'admin'
          ? <DashboardLayout role="admin" userName={userName} onLogout={logout} />
          : <LoginPage onBack={() => setView('landing')} />;

      default:
        return <LandingPage onRoleSelect={(v) => setView(v as View)} />;
    }
  }, [view, role, user, userName, logout]);

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
  if (isProtectedRoute && role === view) {
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
