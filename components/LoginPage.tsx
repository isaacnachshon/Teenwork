import React, { useState } from 'react';
import { ShieldCheckIcon, GoogleIcon } from './icons';
import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Removed hardcoded admin email check: App-level role lookup determines access.
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // App component will handle successful login via onAuthStateChanged
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('אימייל או סיסמה שגויים.');
      } else {
        setError('אירעה שגיאה. נסה שוב מאוחר יותר.');
        console.error(err);
      }
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account' // Always show account selection
    });
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if this is the admin email
      if (user.email !== 'isaacnachshon@gmail.com') {
        await auth.signOut();
        setError('רק חשבון המנהל מורשה להתחבר דרך Google.');
        setIsGoogleLoading(false);
        return;
      }

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create admin account
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName || 'Admin',
          profileImageUrl: user.photoURL,
          role: 'admin',
          createdAt: new Date(),
        });
      } else {
        // Update role to admin if not already
        const userData = userDoc.data();
        if (userData.role !== 'admin') {
          await setDoc(userDocRef, { role: 'admin' }, { merge: true });
        }
      }

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('הדומיין אינו מורשה ב-Firebase. יש להוסיף את הדומיין בהגדרות ה-Authentication ב-Firebase Console.');
      } else if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError('התחברות עם גוגל נכשלה. נסה שוב.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="flex flex-col items-center">
          <div className="p-3 bg-gray-100 rounded-full mb-4">
            <ShieldCheckIcon className="w-10 h-10 text-gray-700" />
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-800">כניסת מנהלים</h1>
          <p className="text-center text-gray-500">נא להזין את פרטי ההתחברות</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              כתובת אימייל
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              סיסמה
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="********"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'מתחבר...' : 'התחברות'}
            </button>
          </div>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">או המשך עם</span>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GoogleIcon className="w-5 h-5" />
            {isGoogleLoading ? 'טוען...' : <span>התחברות עם גוגל</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;