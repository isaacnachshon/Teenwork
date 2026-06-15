import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { ShieldCheckIcon } from './icons';

const AdminSetup: React.FC = () => {
    const [email, setEmail] = useState('isaacnachshon@gmail.com');
    const [password, setPassword] = useState('770770770AL');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            // Create the user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create the Firestore document with admin role
            await setDoc(doc(db, 'users', user.uid), {
                email: email,
                role: 'admin',
                createdAt: new Date().toISOString(),
            });

            setStatus('success');
            setMessage('Admin account created successfully! You can now log in with these credentials.');
        } catch (err: any) {
            setStatus('error');
            if (err.code === 'auth/email-already-in-use') {
                setMessage('This email is already registered. Try logging in instead.');
            } else if (err.code === 'auth/weak-password') {
                setMessage('Password should be at least 6 characters.');
            } else {
                setMessage(`Error: ${err.message}`);
            }
            console.error('Admin setup error:', err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <div className="flex flex-col items-center">
                    <div className="p-3 bg-gray-100 rounded-full mb-4">
                        <ShieldCheckIcon className="w-10 h-10 text-gray-700" />
                    </div>
                    <h1 className="text-3xl font-bold text-center text-gray-800">Admin Account Setup</h1>
                    <p className="text-center text-gray-500 mt-2">Create the admin account for first-time setup</p>
                </div>

                <form onSubmit={handleSetup} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Admin Email
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                disabled={status === 'loading' || status === 'success'}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                disabled={status === 'loading' || status === 'success'}
                            />
                        </div>
                    </div>

                    {message && (
                        <div
                            className={`p-4 rounded-lg text-sm ${status === 'success'
                                    ? 'bg-green-50 text-green-800 border border-green-200'
                                    : 'bg-red-50 text-red-800 border border-red-200'
                                }`}
                        >
                            {message}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={status === 'loading' || status === 'success'}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === 'loading' ? 'Creating Account...' : status === 'success' ? 'Account Created!' : 'Create Admin Account'}
                        </button>
                    </div>
                </form>

                {status === 'success' && (
                    <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 text-center">
                            You can now close this page and log in as admin.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSetup;
