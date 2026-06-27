
import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { firebaseConfig } from '@/firebase';
import { ShieldCheckIcon, CheckCircleIcon, ClockIcon } from '@/components/icons';

interface ParentApprovalPageProps {
    token: string;
}

type ApprovalData = {
    teenName: string;
    teenEmail: string;
    parentEmail: string;
    parentPhone: string;
    teenUid: string;
    status: string;
};

const ParentApprovalPage: React.FC<ParentApprovalPageProps> = ({ token }) => {
    const [loading, setLoading] = useState(true);
    const [approvalData, setApprovalData] = useState<ApprovalData | null>(null);
    const [error, setError] = useState('');
    const [step, setStep] = useState<'loading' | 'verify' | 'otp' | 'approve' | 'done' | 'expired'>('loading');
    const [otpCode, setOtpCode] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null);
    const recaptchaRef = useRef<HTMLDivElement>(null);
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
    const parentAuthRef = useRef<ReturnType<typeof getAuth> | null>(null);

    useEffect(() => {
        const fetchApproval = async () => {
            try {
                const approvalDoc = await getDoc(doc(db, 'parentalApprovals', token));
                if (!approvalDoc.exists()) {
                    setStep('expired');
                    setLoading(false);
                    return;
                }

                const data = approvalDoc.data() as ApprovalData;
                if (data.status !== 'pending') {
                    setDecision(data.status as 'approved' | 'rejected');
                    setStep('done');
                    setLoading(false);
                    return;
                }

                setApprovalData(data);
                setStep('verify');
                setLoading(false);
            } catch (err) {
                console.error('Error fetching approval:', err);
                setError('שגיאה בטעינת הנתונים');
                setLoading(false);
            }
        };

        fetchApproval();
    }, [token]);

    const getParentAuth = () => {
        if (parentAuthRef.current) return parentAuthRef.current;
        const existingApps = getApps();
        const parentApp = existingApps.find(a => a.name === 'parent-verify')
            || initializeApp(firebaseConfig, 'parent-verify');
        parentAuthRef.current = getAuth(parentApp);
        return parentAuthRef.current;
    };

    const handleSendOtp = async () => {
        if (!approvalData) return;
        setError('');
        setIsSending(true);

        try {
            const parentAuth = getParentAuth();

            let phone = approvalData.parentPhone.trim();
            if (phone.startsWith('0')) {
                phone = '+972' + phone.substring(1);
            }
            if (!phone.startsWith('+')) {
                phone = '+972' + phone;
            }

            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear();
            }

            recaptchaVerifierRef.current = new RecaptchaVerifier(parentAuth, 'recaptcha-container', {
                size: 'normal',
                callback: () => {},
                'expired-callback': () => {
                    setError('ה-reCAPTCHA פג תוקף. נסה שוב.');
                }
            });

            await recaptchaVerifierRef.current.render();

            const result = await signInWithPhoneNumber(parentAuth, phone, recaptchaVerifierRef.current);
            setConfirmationResult(result);
            setStep('otp');
        } catch (err: any) {
            console.error('Error sending OTP:', err);
            if (err.code === 'auth/invalid-phone-number') {
                setError('מספר הטלפון אינו תקין.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('יותר מדי ניסיונות. נסה שוב מאוחר יותר.');
            } else {
                setError('שגיאה בשליחת קוד האימות. נסה שוב.');
            }
        } finally {
            setIsSending(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!confirmationResult || !otpCode.trim()) return;
        setError('');
        setIsSending(true);

        try {
            await confirmationResult.confirm(otpCode);
            setStep('approve');
        } catch (err: any) {
            console.error('Error verifying OTP:', err);
            if (err.code === 'auth/invalid-verification-code') {
                setError('קוד האימות שגוי. נסה שוב.');
            } else {
                setError('שגיאה באימות. נסה שוב.');
            }
        } finally {
            setIsSending(false);
        }
    };

    const handleDecision = async (approved: boolean) => {
        if (!approvalData) return;
        setIsSending(true);
        setError('');

        try {
            const newStatus = approved ? 'approved' : 'rejected';

            await updateDoc(doc(db, 'parentalApprovals', token), {
                status: newStatus,
                decidedAt: new Date(),
            });

            await updateDoc(doc(db, 'users', approvalData.teenUid), {
                parentalConsentStatus: newStatus,
                parentalConsentReviewedAt: new Date().toISOString(),
            });

            setDecision(newStatus);
            setStep('done');
        } catch (err) {
            console.error('Error updating decision:', err);
            setError('שגיאה בשמירת ההחלטה. נסה שוב.');
        } finally {
            setIsSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-2xl font-bold text-gray-700">טוען...</div>
            </div>
        );
    }

    if (step === 'expired') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg text-center">
                    <div className="p-3 bg-red-100 rounded-full mb-4 inline-block">
                        <ClockIcon className="w-10 h-10 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">קישור לא תקין</h1>
                    <p className="text-gray-600">הקישור אינו תקין או שפג תוקפו.</p>
                </div>
            </div>
        );
    }

    if (step === 'done') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg text-center">
                    <div className={`p-3 ${decision === 'approved' ? 'bg-green-100' : 'bg-red-100'} rounded-full mb-4 inline-block`}>
                        <CheckCircleIcon className={`w-10 h-10 ${decision === 'approved' ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {decision === 'approved' ? 'האישור התקבל!' : 'הבקשה נדחתה'}
                    </h1>
                    <p className="text-gray-600">
                        {decision === 'approved'
                            ? `אישרת את ההרשמה של ${approvalData?.teenName} לפלטפורמת TeenWork. ניתן לסגור את הדף.`
                            : `דחית את ההרשמה של ${approvalData?.teenName}. ניתן לסגור את הדף.`
                        }
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4" dir="rtl">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-purple-100 rounded-full mb-4">
                        <ShieldCheckIcon className="w-10 h-10 text-purple-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">אישור הורים — TeenWork</h1>
                    <p className="mt-2 text-gray-600">
                        <strong>{approvalData?.teenName}</strong> ({approvalData?.teenEmail}) נרשם/ה לפלטפורמת TeenWork ומבקש/ת את אישורך.
                    </p>
                </div>

                {step === 'verify' && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-blue-800">
                                כדי לאמת את זהותך, נשלח קוד אימות למספר הטלפון שלך: <strong dir="ltr">{approvalData?.parentPhone}</strong>
                            </p>
                        </div>

                        <div id="recaptcha-container" className="flex justify-center"></div>

                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                        <button
                            onClick={handleSendOtp}
                            disabled={isSending}
                            className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSending ? 'שולח...' : 'שלח קוד אימות'}
                        </button>
                    </div>
                )}

                {step === 'otp' && (
                    <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-green-800">
                                קוד אימות נשלח למספר <strong dir="ltr">{approvalData?.parentPhone}</strong>
                            </p>
                        </div>

                        <div>
                            <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700">קוד אימות</label>
                            <input
                                id="otpCode"
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl tracking-widest"
                                dir="ltr"
                                placeholder="000000"
                            />
                        </div>

                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                        <button
                            onClick={handleVerifyOtp}
                            disabled={isSending || otpCode.length < 6}
                            className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSending ? 'מאמת...' : 'אמת קוד'}
                        </button>
                    </div>
                )}

                {step === 'approve' && (
                    <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-green-800">הטלפון אומת בהצלחה! כעת תוכל/י לאשר או לדחות את ההרשמה.</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <h3 className="font-semibold text-gray-800">פרטי הנער/ה:</h3>
                            <p className="text-sm text-gray-600">שם: <strong>{approvalData?.teenName}</strong></p>
                            <p className="text-sm text-gray-600">אימייל: <strong>{approvalData?.teenEmail}</strong></p>
                        </div>

                        <p className="text-sm text-gray-600 text-center">
                            באישור ההרשמה, את/ה מאשר/ת שהנער/ה רשאי/ת להשתמש בפלטפורמת TeenWork לחיפוש עבודה.
                        </p>

                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleDecision(true)}
                                disabled={isSending}
                                className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSending ? 'שומר...' : 'אישור'}
                            </button>
                            <button
                                onClick={() => handleDecision(false)}
                                disabled={isSending}
                                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSending ? 'שומר...' : 'דחייה'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentApprovalPage;
