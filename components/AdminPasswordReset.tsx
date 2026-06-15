import React, { useState } from 'react';
import { signInWithEmailAndPassword, updatePassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { ShieldCheckIcon } from './icons';

const AdminPasswordReset: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('770770770AL');
    const [email] = useState('isaacnachshon@gmail.com');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            // First, sign in with the current password
            const userCredential = await signInWithEmailAndPassword(auth, email, currentPassword);
            const user = userCredential.user;

            // Update the password
            await updatePassword(user, newPassword);

            // Ensure the Firestore document has the admin role
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                // Create the document if it doesn't exist
                await setDoc(userDocRef, {
                    email: email,
                    role: 'admin',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            } else {
                // Update the role if it's not admin
                const userData = userDoc.data();
                if (userData.role !== 'admin') {
                    await setDoc(userDocRef, {
                        ...userData,
                        role: 'admin',
                        updatedAt: new Date().toISOString(),
                    });
                }
            }

            // Sign out after successful reset
            await signOut(auth);

            setStatus('success');
            setMessage(`Password successfully updated to: ${newPassword}\nFirestore role confirmed as admin.\nYou can now log in with the new password.`);
        } catch (err: any) {
            setStatus('error');
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setMessage('Current password is incorrect. Please enter the correct current password.');
            } else if (err.code === 'auth/user-not-found') {
                setMessage('No account found with this email.');
            } else if (err.code === 'auth/weak-password') {
                setMessage('New password should be at least 6 characters.');
            } else if (err.code === 'auth/requires-recent-login') {
                setMessage('For security, please log in again before changing your password.');
            } else {
                setMessage(`Error: ${err.message}`);
            }
            console.error('Password reset error:', err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <div className="flex flex-col items-center">
                    <div className="p-3 bg-gray-100 rounded-full mb-4">
                        <ShieldCheckIcon className="w-10 h-10 text-gray-700" />
                    </div>
                    <h1 className="text-3xl font-bold text-center text-gray-800">Reset Admin Password</h1>
                    <p className="text-center text-gray-500 mt-2">Update your admin password and verify Firestore role</p>
                </div>

                <form onSubmit={handlePasswordReset} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Admin Email (read-only)
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                type="email"
                                value={email}
                                disabled
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-600"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                            Current Password *
                        </label>
                        <div className="mt-1">
                            <input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                placeholder="Enter your current password"
                                disabled={status === 'loading' || status === 'success'}
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Enter the password you currently use to log in</p>
                    </div>

                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                            New Password
                        </label>
                        <div className="mt-1">
                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                disabled={status === 'loading' || status === 'success'}
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">This will be your new password (pre-filled with 770770770AL)</p>
                    </div>

                    {message && (
                        <div
                            className={`p-4 rounded-lg text-sm whitespace-pre-line ${status === 'success'
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
                            {status === 'loading' ? 'Updating Password...' : status === 'success' ? 'Password Updated!' : 'Update Password & Verify Role'}
                        </button>
                    </div>
                </form>

                {status === 'success' && (
                    <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 text-center">
                            You can now <a href="/" className="text-blue-600 hover:underline">go back to the main page</a> and log in with your new password.
                        </p>
                    </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                        This page will update your password and ensure your Firestore document has the correct admin role.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminPasswordReset;
