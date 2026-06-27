
import React, { useState, useEffect } from 'react';
import { BriefcaseIcon, GoogleIcon, PencilIcon } from '@/components/icons';
import { auth, db, storage } from '@/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    deleteUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MIN_PASSWORD_LENGTH = 8;

interface EmployerLoginPageProps {
    onBack?: () => void;
}

const EmployerLoginPage: React.FC<EmployerLoginPageProps> = ({ onBack }) => {
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSuccess, setResetSuccess] = useState('');

    useEffect(() => {
        return () => {
            if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > MAX_IMAGE_SIZE) {
                setError(`התמונה גדולה מדי. מקסימום ${MAX_IMAGE_SIZE / 1024 / 1024}MB.`);
                return;
            }
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                setError('רק קבצי JPEG, PNG או WebP מותרים.');
                return;
            }
            if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email.trim() || !password.trim()) {
            setError('נא למלא אימייל וסיסמה.');
            return;
        }
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            if (err.code === 'auth/too-many-requests') {
                setError('יותר מדי ניסיונות. נסה שוב מאוחר יותר.');
            } else {
                setError('אימייל או סיסמה שגויים.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!companyName.trim() || !email.trim() || !password.trim()) {
            setError('נא למלא את כל השדות.');
            return;
        }
        if (companyName.trim().length < 2) {
            setError('שם החברה חייב להכיל לפחות 2 תווים.');
            return;
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
            setError(`הסיסמה חייבת להכיל לפחות ${MIN_PASSWORD_LENGTH} תווים.`);
            return;
        }
        if (password !== confirmPassword) {
            setError('הסיסמאות אינן תואמות.');
            return;
        }
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            let companyLogoUrl = '';
            if (profileImage) {
                try {
                    const storageRef = ref(storage, `companyLogos/${user.uid}`);
                    await uploadBytes(storageRef, profileImage);
                    companyLogoUrl = await getDownloadURL(storageRef);
                } catch (uploadErr) {
                    await deleteUser(user);
                    throw new Error('העלאת הלוגו נכשלה.');
                }
            }

            try {
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    displayName: companyName,
                    email: user.email || '',
                    photoURL: companyLogoUrl,
                    companyName,
                    companyLogoUrl,
                    role: 'employer',
                    phone: '',
                    city: '',
                    birthDate: '',
                    profileCompleted: false,
                    status: 'active',
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    lastLogin: serverTimestamp(),
                });
            } catch (firestoreErr) {
                if (companyLogoUrl) {
                    try { await deleteObject(ref(storage, `companyLogos/${user.uid}`)); } catch (_) {}
                }
                try { await deleteUser(user); } catch (_) {}
                throw firestoreErr;
            }
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError('משתמש עם אימייל זה כבר קיים. להתחבר?');
            } else if (err.code === 'auth/weak-password') {
                setError('הסיסמה חלשה מדי.');
            } else if (err.code === 'auth/invalid-email') {
                setError('כתובת אימייל לא תקינה.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('יותר מדי ניסיונות. נסה שוב מאוחר יותר.');
            } else {
                setError(err.message || 'הרשמה נכשלה. נסה שוב.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setResetSuccess('');
        if (!resetEmail.trim()) { setError('נא להזין כתובת אימייל.'); return; }
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setResetSuccess('קישור לאיפוס סיסמה נשלח! בדוק את תיבת הדואר שלך.');
        } catch (err: any) {
            if (err.code === 'auth/user-not-found') {
                setError('לא נמצא חשבון עם כתובת אימייל זו.');
            } else {
                setError('שליחה נכשלה. נסה שוב.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setError('');
        setIsGoogleLoading(true);
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    uid: user.uid,
                    displayName: user.displayName || '',
                    email: user.email || '',
                    photoURL: user.photoURL || '',
                    companyName: user.displayName || 'החברה שלי',
                    companyLogoUrl: user.photoURL || '',
                    role: 'employer',
                    phone: '',
                    city: '',
                    birthDate: '',
                    profileCompleted: false,
                    status: 'active',
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    lastLogin: serverTimestamp(),
                });
            } else {
                const userData = userDoc.data();
                if (userData.role !== 'employer') {
                    await auth.signOut();
                    setError('חשבון זה רשום כתפקיד אחר.');
                }
            }
        } catch (err: any) {
            if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') return;
            if (err.code === 'auth/unauthorized-domain') {
                setError('הדומיין אינו מורשה ב-Firebase.');
            } else {
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
                    <div className="p-3 bg-blue-100 rounded-full mb-4">
                        <BriefcaseIcon className="w-10 h-10 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-center text-gray-800">{authMode === 'login' ? 'כניסת מעסיקים' : 'הרשמת מעסיקים'}</h1>
                    <p className="text-center text-gray-500">{authMode === 'login' ? 'התחבר ופרסם משרה חדשה' : 'צור חשבון חדש והתחל לגייס'}</p>
                </div>
                {isForgotPassword ? (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <p className="text-sm text-gray-600 text-center">הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה.</p>
                        <div>
                            <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">כתובת אימייל</label>
                            <input id="reset-email" type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="your@company.com" />
                        </div>
                        {error && <p role="alert" className="text-sm text-red-600 text-center">{error}</p>}
                        {resetSuccess && <p role="status" className="text-sm text-green-600 text-center">{resetSuccess}</p>}
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {isLoading ? 'שולח...' : 'שלח קישור לאיפוס'}
                        </button>
                        <button type="button" onClick={() => { setIsForgotPassword(false); setError(''); setResetSuccess(''); }} className="w-full text-sm text-gray-500 hover:underline">
                            חזרה להתחברות
                        </button>
                    </form>
                ) : authMode === 'login' ? (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">כתובת אימייל</label>
                            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="your@company.com" />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">סיסמה</label>
                            <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="********" />
                            <div className="text-left mt-1">
                                <button type="button" onClick={() => { setIsForgotPassword(true); setError(''); setResetEmail(email); }} className="text-sm text-blue-600 hover:underline">שכחת סיסמה?</button>
                            </div>
                        </div>
                        {error && <p role="alert" className="text-sm text-red-600 text-center">{error}</p>}
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? 'מתחבר...' : 'התחברות'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 text-center mb-2">לוגו חברה (אופציונלי)</label>
                            <div className="flex justify-center">
                                <div className="relative">
                                    <img src={imagePreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName || ' ')}&background=D1E5F8&color=2563EB&bold=true`} alt="תצוגה מקדימה" className="w-24 h-24 rounded-full object-cover border-2 border-gray-300" />
                                    <label htmlFor="profileImage" className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-md">
                                        <PencilIcon className="w-4 h-4" />
                                        <input id="profileImage" name="profileImage" type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">שם החברה</label>
                            <input id="companyName" name="companyName" type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="שם החברה שלך" />
                        </div>
                        <div>
                            <label htmlFor="email-signup" className="block text-sm font-medium text-gray-700">כתובת אימייל</label>
                            <input id="email-signup" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="your@company.com" />
                        </div>
                        <div>
                            <label htmlFor="password-signup" className="block text-sm font-medium text-gray-700">סיסמה (לפחות {MIN_PASSWORD_LENGTH} תווים)</label>
                            <input id="password-signup" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="********" />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">אימות סיסמה</label>
                            <input id="confirmPassword" name="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="********" />
                        </div>
                        {error && <p role="alert" className="text-sm text-red-600 text-center">{error}</p>}
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? 'יוצר חשבון...' : 'הרשמה'}
                        </button>
                    </form>
                )}
                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">או המשך עם</span></div>
                </div>
                <button type="button" onClick={handleGoogleAuth} disabled={isGoogleLoading} className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                    <GoogleIcon className="w-5 h-5" />
                    {isGoogleLoading ? 'טוען...' : <span>{authMode === 'login' ? 'התחברות עם גוגל' : 'הרשמה עם גוגל'}</span>}
                </button>
                <p className="text-center text-sm text-gray-600 mt-6">
                    {authMode === 'login' ? 'אין לך חשבון? ' : 'יש לך כבר חשבון? '}
                    <button onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setError(''); }} className="font-semibold text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
                        {authMode === 'login' ? 'הרשם כאן' : 'התחבר'}
                    </button>
                </p>
                <p className="text-center text-sm text-gray-500">
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 underline">מדיניות פרטיות</a>
                </p>
                {onBack && (
                    <button onClick={onBack} className="w-full text-center text-sm text-gray-500 hover:text-blue-600 transition-colors mt-2">← חזרה לדף הראשי</button>
                )}
            </div>
        </div>
    );
};

export default EmployerLoginPage;
