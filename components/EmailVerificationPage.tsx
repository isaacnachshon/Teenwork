
import React, { useState, useEffect } from 'react';
import { User, sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { LogOutIcon, MailCheckIcon } from './icons';

interface EmailVerificationPageProps {
    user: User;
}

const EmailVerificationPage: React.FC<EmailVerificationPageProps> = ({ user }) => {
    const [isSending, setIsSending] = useState(false);
    const [resentMessage, setResentMessage] = useState('');
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        const interval = setInterval(async () => {
            if (auth.currentUser) {
                await auth.currentUser.reload();
                if (auth.currentUser.emailVerified) {
                    window.location.reload();
                }
            }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let timer: number;
        if (countdown > 0) {
            timer = window.setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => window.clearTimeout(timer);
    }, [countdown]);

    const handleResend = async () => {
        setIsSending(true);
        setError('');
        setResentMessage('');
        try {
            await sendEmailVerification(user);
            setResentMessage('Verification email sent!');
            setCountdown(60); // 60 seconds cooldown
        } catch (err: any) {
             if (err.code === 'auth/too-many-requests') {
                setError('Too many requests. Please try again later.');
            } else {
                setError('Failed to send email. Please try again later.');
            }
        } finally {
            setIsSending(false);
        }
    };
    
    const handleLogout = () => {
        signOut(auth);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg text-center animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="flex flex-col items-center">
                    <div className="p-3 bg-purple-100 rounded-full mb-4">
                        <MailCheckIcon className="w-10 h-10 text-purple-600" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Verify Your Email</h1>
                    <p className="mt-2 text-gray-600">
                        A verification link has been sent to <strong>{user.email}</strong>.
                    </p>
                    <p className="mt-2 text-gray-500 text-sm">
                        Please check your inbox (and spam folder) and click the link to activate your account. This page will update automatically once you're verified.
                    </p>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
                {resentMessage && <p className="text-sm text-green-600">{resentMessage}</p>}

                <div className="space-y-4 pt-4">
                    <button
                        onClick={handleResend}
                        disabled={isSending || countdown > 0}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSending ? 'Sending...' : (countdown > 0 ? `Resend in ${countdown}s` : 'Resend Verification Email')}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-lg shadow-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        <LogOutIcon className="w-5 h-5" />
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationPage;
