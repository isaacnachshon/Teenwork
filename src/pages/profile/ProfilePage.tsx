import React, { useState, useEffect } from 'react';
import { MapPinIcon, PencilIcon, StarIcon, CheckCircleIcon, FileTextIcon, ClockIcon } from '@/components/icons';
import type { TeenProfile } from '@/types';
import { auth, db } from '@/firebase';
import { doc, setDoc, collection, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';

interface ProfilePageProps {
    userProfile: TeenProfile;
    onEdit: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userProfile, onEdit }) => {
    const [approvalLink, setApprovalLink] = useState('');
    const [approvalStatus, setApprovalStatus] = useState<string | undefined>(userProfile.parentalConsentStatus);
    const [copied, setCopied] = useState(false);
    const [sendingRequest, setSendingRequest] = useState(false);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
            collection(db, 'parentalApprovals'),
            where('teenUid', '==', user.uid)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            for (const docSnap of snapshot.docs) {
                const data = docSnap.data();
                setApprovalStatus(data.status);
                if (data.status === 'pending') {
                    const baseUrl = window.location.origin;
                    setApprovalLink(`${baseUrl}?approve=${data.token}`);
                }
            }
        });

        return unsub;
    }, []);

    const handleSendApprovalRequest = async () => {
        const user = auth.currentUser;
        if (!user || !userProfile.parentEmail || !userProfile.parentPhone) return;

        setSendingRequest(true);
        try {
            const approvalRef = doc(collection(db, 'parentalApprovals'));
            await setDoc(approvalRef, {
                token: approvalRef.id,
                teenUid: user.uid,
                teenName: userProfile.name || userProfile.displayName || '',
                teenEmail: user.email,
                parentEmail: userProfile.parentEmail,
                parentPhone: userProfile.parentPhone,
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            await setDoc(doc(db, 'users', user.uid), {
                parentalConsentStatus: 'pending',
            }, { merge: true });

            setApprovalStatus('pending');
        } catch (err) {
            console.error('Error sending approval request:', err);
            alert('שגיאה בשליחת בקשת האישור. נסה שוב.');
        } finally {
            setSendingRequest(false);
        }
    };

    const handleCopyLink = async () => {
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

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in-0 duration-500">
            {/* Profile Header */}
            <header className="bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row items-center gap-6 mb-8">
                <img src={userProfile.profileImageUrl} alt={userProfile.name} className="w-32 h-32 rounded-full border-4 border-purple-500 object-cover" />
                <div className="text-center sm:text-right flex-grow">
                    <h1 className="text-3xl font-bold text-gray-800">{userProfile.name}</h1>
                    <p className="text-gray-500">גיל {userProfile.age}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-1 text-gray-500 mt-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{userProfile.location}</span>
                    </div>
                    <div className="mt-3 text-sm text-gray-500 space-y-2 text-right">
                        {userProfile.address && (
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">כתובת:</span>
                                <span>{userProfile.address}</span>
                            </div>
                        )}
                        {userProfile.phone && (
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">טלפון:</span>
                                <span>{userProfile.phone}</span>
                            </div>
                        )}
                        {userProfile.idNumber && (
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">ת.ז:</span>
                                <span>{userProfile.idNumber}</span>
                            </div>
                        )}
                        {userProfile.city && (
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">עיר:</span>
                                <span>{userProfile.city}</span>
                            </div>
                        )}
                        {userProfile.school && (
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">בית ספר:</span>
                                <span>{userProfile.school}</span>
                            </div>
                        )}
                        {userProfile.studyStatus && (
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">סטטוס לימודים:</span>
                                <span>{userProfile.studyStatus}</span>
                            </div>
                        )}
                        {userProfile.birthDate && (
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">תאריך לידה:</span>
                                <span>{new Date(userProfile.birthDate).toLocaleDateString('he-IL')}</span>
                            </div>
                        )}
                        {userProfile.paymentInfo && (
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">תשלום:</span>
                                <span>{userProfile.paymentInfo}</span>
                            </div>
                        )}
                        {userProfile.parentName && (
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">שם הורה:</span>
                                <span>{userProfile.parentName}</span>
                            </div>
                        )}
                        {userProfile.parentPhone && (
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">טלפון הורה:</span>
                                <span>{userProfile.parentPhone}</span>
                            </div>
                        )}
                        {userProfile.parentEmail && (
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">אימייל הורה:</span>
                                <span>{userProfile.parentEmail}</span>
                            </div>
                        )}
                        {userProfile.parentalConsentStatus && (
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">סטטוס אישור הורים:</span>
                                <span>{userProfile.parentalConsentStatus}</span>
                            </div>
                        )}
                    </div>
                </div>
                <button onClick={onEdit} className="flex items-center gap-2 bg-purple-100 text-purple-700 font-semibold py-2 px-4 rounded-lg hover:bg-purple-200 transition-colors">
                    <PencilIcon className="w-5 h-5" />
                    <span>עריכת פרופיל</span>
                </button>
            </header>

            {/* Parental Consent Section */}
            {approvalStatus === 'approved' ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-center gap-3 animate-in fade-in-0 duration-500">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    <div>
                        <h3 className="font-bold text-green-800">אישור הורים התקבל</h3>
                        <p className="text-sm text-green-700">ההורה/אפוטרופוס אישר את ההרשמה שלך לפלטפורמה.</p>
                    </div>
                </div>
            ) : approvalStatus === 'rejected' ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-center gap-3 animate-in fade-in-0 duration-500">
                    <FileTextIcon className="w-6 h-6 text-red-600" />
                    <div>
                        <h3 className="font-bold text-red-800">בקשת האישור נדחתה</h3>
                        <p className="text-sm text-red-700">ההורה/אפוטרופוס דחה את הבקשה. ניתן לפנות להורה ולשלוח בקשה חדשה.</p>
                        {userProfile.parentEmail && userProfile.parentPhone && (
                            <button
                                onClick={handleSendApprovalRequest}
                                disabled={sendingRequest}
                                className="mt-2 text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                {sendingRequest ? 'שולח...' : 'שלח בקשה חדשה'}
                            </button>
                        )}
                    </div>
                </div>
            ) : approvalStatus === 'pending' ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-8 animate-in fade-in-0 duration-500">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="animate-pulse">
                            <ClockIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-yellow-800">ממתין לאישור הורים</h3>
                            <p className="text-sm text-yellow-700">נשלחה בקשת אישור להורה/אפוטרופוס. הדף יתעדכן אוטומטית.</p>
                        </div>
                    </div>
                    {approvalLink && (
                        <div className="space-y-3 pt-3 border-t border-yellow-200">
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
                                    onClick={handleCopyLink}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors whitespace-nowrap"
                                >
                                    {copied ? 'הועתק!' : 'העתק'}
                                </button>
                            </div>
                            <button
                                onClick={handleWhatsApp}
                                className="w-full py-3 px-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                            >
                                שלח בוואטסאפ
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 animate-in fade-in-0 duration-500">
                    <div className="flex items-center gap-3 mb-3">
                        <FileTextIcon className="w-6 h-6 text-blue-600" />
                        <div>
                            <h3 className="font-bold text-blue-800">אישור הורים</h3>
                            <p className="text-sm text-blue-700">בני נוער צריכים אישור הורים כדי להגיש מועמדות למשרות.</p>
                        </div>
                    </div>
                    {userProfile.parentEmail && userProfile.parentPhone ? (
                        <button
                            onClick={handleSendApprovalRequest}
                            disabled={sendingRequest}
                            className="mt-2 w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                        >
                            {sendingRequest ? 'שולח בקשה...' : 'שלח בקשת אישור להורה'}
                        </button>
                    ) : (
                        <div className="mt-2">
                            <p className="text-sm text-gray-600 mb-2">יש למלא פרטי הורה בפרופיל לפני שליחת בקשת אישור.</p>
                            <button
                                onClick={onEdit}
                                className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                            >
                                עריכת פרופיל — הוספת פרטי הורה
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {/* About me */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-3">קצת עליי</h2>
                        <p className="text-gray-600 leading-relaxed">{userProfile.bio}</p>
                    </div>

                    {/* Work History */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">ניסיון תעסוקתי</h2>
                        <ul className="space-y-4">
                            {userProfile.workHistory.map(job => (
                                <li key={job.id} className="flex gap-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold text-xl flex-shrink-0">
                                        {job.company.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-700">{job.title}</h3>
                                        <p className="text-sm text-gray-500">{job.company} | {job.duration}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Skills */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">כישורים</h2>
                        <div className="flex flex-wrap gap-2">
                            {userProfile.skills.map(skill => (
                                <span key={skill} className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">{skill}</span>
                            ))}
                        </div>
                    </div>

                    {/* Preferred Job Types */}
                    {userProfile.preferredJobTypes && userProfile.preferredJobTypes.length > 0 && (
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">סוגי עבודה מעניינים</h2>
                            <div className="flex flex-wrap gap-2">
                                {userProfile.preferredJobTypes.map(jobType => (
                                    <span key={jobType} className="bg-purple-100 text-purple-700 text-sm font-semibold px-3 py-1 rounded-full">{jobType}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reviews */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">המלצות</h2>
                        <ul className="space-y-4">
                            {userProfile.reviews.map(review => (
                                <li key={review.id}>
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-semibold text-gray-700">{review.reviewer}</h3>
                                        <div className="flex items-center gap-1">
                                            {[...Array(review.rating)].map((_, i) => (
                                                <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
                                            ))}
                                            {[...Array(5 - review.rating)].map((_, i) => (
                                                <StarIcon key={i} className="w-4 h-4 text-gray-300" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500">"{review.comment}"</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
