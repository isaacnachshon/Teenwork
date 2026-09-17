import React, { useEffect, useState } from 'react';
import type { Job } from '@/types';
import { db, auth } from '@/firebase';
import { ReputationService } from '@/services/ReputationService';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ChevronLeftIcon, UserIcon } from '@/components/icons';

interface JobApplicant {
    applicationId: string;
    applicantId: string;
    name: string;
    age?: number;
    consentVerified?: boolean;
    profileImageUrl?: string;
    status: string;
}

interface ApplicantsListViewProps {
    job: Job;
    onBack: () => void;
    onViewProfile: (applicantId: string) => void;
}

const statusLabels: Record<string, string> = {
    new: 'חדש',
    viewed: 'נצפה',
    contacted: 'נוצר קשר',
    interview: 'ראיון',
    accepted: 'התקבל/ה',
    rejected: 'נדחה',
};

const statusColors: Record<string, string> = {
    new: 'bg-green-100 text-green-800',
    viewed: 'bg-yellow-100 text-yellow-800',
    contacted: 'bg-blue-100 text-blue-800',
    interview: 'bg-purple-100 text-purple-800',
    accepted: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
};

const ApplicantsListView: React.FC<ApplicantsListViewProps> = ({ job, onBack, onViewProfile }) => {
    const [applicants, setApplicants] = useState<JobApplicant[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleStatusChange = async (applicationId: string, newStatus: string) => {
        try {
            await updateDoc(doc(db, 'applications', applicationId), { status: newStatus });
            setApplicants(prev => prev.map(a =>
                a.applicationId === applicationId ? { ...a, status: newStatus } : a
            ));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    useEffect(() => {
        const fetchApplicants = async () => {
            setIsLoading(true);
            try {
                if (!auth.currentUser) throw new Error('Login required');
                const q = query(collection(db, 'applications'), where('jobId', '==', job.id), where('employerId', '==', auth.currentUser.uid));
                const snapshot = await getDocs(q);

                const results = await Promise.all(snapshot.docs.map(async (appDoc) => {
                    const data = appDoc.data();
                    let name = 'מועמד/ת';
                    // Stamped by the onApplicationCreated Cloud Function (the profile callable never returns age).
                    const age: number | undefined = typeof data.teenAge === 'number' ? data.teenAge : undefined;
                    const consentVerified: boolean | undefined = typeof data.consentVerified === 'boolean' ? data.consentVerified : undefined;
                    let profileImageUrl: string | undefined;

                    try {
                        const userData = await ReputationService.profile(data.applicantId);
                        if (userData) {
                            name = userData.name || name;
                        }
                    } catch (error) {
                        console.error('Error fetching applicant profile:', error);
                    }

                    return {
                        applicationId: appDoc.id,
                        applicantId: data.applicantId,
                        name,
                        age,
                        consentVerified,
                        profileImageUrl,
                        status: data.status || 'new',
                    };
                }));

                setApplicants(results);
            } catch (error) {
                console.error('Error fetching applicants:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplicants();
    }, [job.id]);

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in-0 duration-500 min-w-0 px-0">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-semibold mb-4 transition-colors min-h-[44px]">
                <ChevronLeftIcon className="w-5 h-5" />
                <span>חזרה ללוח הבקרה</span>
            </button>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 break-words">מועמדים למשרה: {job.title}</h1>
            <p className="text-gray-500 mb-6">{applicants.length} מועמדים</p>

            {isLoading ? (
                <p className="text-center text-gray-500 py-10">טוען מועמדים...</p>
            ) : applicants.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-10 text-center">
                    <UserIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">עדיין לא הוגשו מועמדויות למשרה זו.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md divide-y divide-gray-100">
                    {applicants.map(applicant => (
                        <div key={applicant.applicationId} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <img
                                    src={applicant.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(applicant.name)}&background=DBEAFE&color=2563EB&bold=true`}
                                    alt={applicant.name}
                                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-800 truncate">{applicant.name}</p>
                                    <p className="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
                                        {applicant.age !== undefined && <span>גיל {applicant.age}</span>}
                                        {applicant.consentVerified !== undefined && (
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${applicant.consentVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {applicant.consentVerified ? 'אישור הורים ✓' : 'ללא אישור הורים'}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col xs:flex-row sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                                <select
                                    value={applicant.status}
                                    onChange={(e) => handleStatusChange(applicant.applicationId, e.target.value)}
                                    className={`text-sm font-medium px-3 py-2.5 min-h-[44px] rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 w-full sm:w-auto ${statusColors[applicant.status] || 'bg-gray-100 text-gray-800'}`}
                                >
                                    <option value="new">{statusLabels.new}</option>
                                    <option value="viewed">{statusLabels.viewed}</option>
                                    <option value="contacted">{statusLabels.contacted}</option>
                                    <option value="interview">{statusLabels.interview}</option>
                                    <option value="accepted">{statusLabels.accepted}</option>
                                    <option value="rejected">{statusLabels.rejected}</option>
                                </select>
                                <button onClick={() => onViewProfile(applicant.applicantId)} className="text-blue-600 font-semibold min-h-[44px] px-4 rounded-lg bg-blue-50 hover:bg-blue-100 w-full sm:w-auto">צפה בפרופיל</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ApplicantsListView;
