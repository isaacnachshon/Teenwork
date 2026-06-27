
import React, { useState, useEffect } from 'react';
import { User, signOut } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ClockIcon, LogOutIcon, CheckCircleIcon } from '@/components/icons';

interface WaitingForParentApprovalProps {
    user: User;
}

const WaitingForParentApproval: React.FC<WaitingForParentApprovalProps> = ({ user }) => {
    const [approvalLink, setApprovalLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

    useEffect(() => {
        const q = query(
            collection(db, 'parentalApprovals'),
            where('teenUid', '==', user.uid),
            where('status', '==', 'pending')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const docData = snapshot.docs[0].data();
                const token = docData.token;
                const baseUrl = window.location.origin;
                setApprovalLink(`${baseUrl}?approve=${token}`);
            }
        });

        const qAll = query(
            collection(db, 'parentalApprovals'),
            where('teenUid', '==', user.uid)
        );

        const unsubAll = onSnapshot(qAll, (snapshot) => {
            for (const doc of snapshot.docs) {
                const data = doc.data();
                if (data.status === 'approved') {
                    setStatus('approved');
                    setTimeout(() => window.location.reload(), 1500);
                    return;
                }
                if (data.status === 'rejected') {
                    setStatus('rejected');
                    return;
                }
            }
        });

        return () => {
            unsubscribe();
            unsubAll();
        };
    }, [user.uid]);

    const handleCopy = async () => {
        if (!approvalLink) return;
        await navigator.clipboard.writeText(approvalLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsApp = () => {
        if (!approvalLink) return;
        const text = encodeURIComponent(`שלום, נרשמתי לפלטפורמת TeenWork ואני צריך את אישורך כהורה. אנא לחץ/י על הקישור הבא:\n${approvalLink}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const handleLogout = () => {
        signOut(auth);
    };

    if (status === 'approved') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg text-center">
                    <div className="flex flex-col items-center">
                        <div className="p-3 bg-green-100 rounded-full mb-4">
                            <CheckCircleIcon className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">ההורה אישר!</h1>
                        <p className="mt-2 text-gray-600">הדף מתעדכן...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'rejected') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg text-center">
                    <div className="flex flex-col items-center">
                        <div className="p-3 bg-red-100 rounded-full mb-4">
                            <ClockIcon className="w-10 h-10 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">ההורה דחה את הבקשה</h1>
                        <p className="mt-2 text-gray-600">ההורה/אפוטרופוס שלך דחה את בקשת ההרשמה. אנא פנה להורה שלך לפרטים נוספים.</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-lg shadow-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        <LogOutIcon className="w-5 h-5" />
                        התנתקות
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg text-center">
                <div className="flex flex-col items-center">
                    <div className="p-3 bg-yellow-100 rounded-full mb-4 animate-pulse">
                        <ClockIcon className="w-10 h-10 text-yellow-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">ממתין לאישור הורים</h1>
                    <p className="mt-2 text-gray-600">
                        נשלח אימייל להורה/אפוטרופוס שלך עם קישור לאישור ההרשמה.
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                        הדף יתעדכן אוטומטית לאחר האישור.
                    </p>
                </div>

                {approvalLink && (
                    <div className="space-y-3 pt-4 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700">שתף/י את הקישור עם ההורה:</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={approvalLink}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-600"
                                dir="ltr"
                            />
                            <button
                                onClick={handleCopy}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors whitespace-nowrap"
                            >
                                {copied ? 'הועתק!' : 'העתק'}
                            </button>
                        </div>
                        <button
                            onClick={handleWhatsApp}
                            className="w-full py-3 px-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            שלח בוואטסאפ
                        </button>
                    </div>
                )}

                <div className="pt-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-lg shadow-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        <LogOutIcon className="w-5 h-5" />
                        התנתקות
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WaitingForParentApproval;
