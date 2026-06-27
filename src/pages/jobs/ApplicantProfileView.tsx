import React, { useEffect, useState } from 'react';
import type { UserProfile } from '@/types';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { MapPinIcon, StarIcon, ChevronLeftIcon } from '@/components/icons';

interface ApplicantProfileViewProps {
    applicantId: string;
    onBack: () => void;
}

const ApplicantProfileView: React.FC<ApplicantProfileViewProps> = ({ applicantId, onBack }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const userDoc = await getDoc(doc(db, 'users', applicantId));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setProfile({
                        name: data.name || 'מועמד/ת',
                        age: data.age || 0,
                        location: data.location || '',
                        coordinates: data.coordinates,
                        profileImageUrl: data.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=DBEAFE&color=2563EB&bold=true`,
                        bio: data.bio || '',
                        skills: data.skills || [],
                        preferredJobTypes: data.preferredJobTypes || [],
                        workHistory: data.workHistory || [],
                        reviews: data.reviews || [],
                    });
                }
            } catch (error) {
                console.error('Error fetching applicant profile:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [applicantId]);

    if (isLoading) {
        return <div className="text-center p-10 text-gray-500">טוען פרופיל מועמד...</div>;
    }

    if (!profile) {
        return (
            <div className="text-center p-10">
                <p className="text-gray-500 mb-4">לא ניתן לטעון את פרופיל המועמד.</p>
                <button onClick={onBack} className="text-blue-600 font-semibold hover:underline">חזרה</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in-0 duration-500">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-semibold mb-4 transition-colors">
                <ChevronLeftIcon className="w-5 h-5" />
                <span>חזרה</span>
            </button>

            <header className="bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row items-center gap-6 mb-8">
                <img src={profile.profileImageUrl} alt={profile.name} className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover" />
                <div className="text-center sm:text-right flex-grow">
                    <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
                    <p className="text-gray-500">גיל {profile.age}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-1 text-gray-500 mt-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{profile.location}</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-3">קצת על המועמד/ת</h2>
                        <p className="text-gray-600 leading-relaxed">{profile.bio || 'לא הוזן תיאור.'}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">ניסיון תעסוקתי</h2>
                        {profile.workHistory.length > 0 ? (
                            <ul className="space-y-4">
                                {profile.workHistory.map(job => (
                                    <li key={job.id} className="flex gap-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl flex-shrink-0">
                                            {job.company.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-700">{job.title}</h3>
                                            <p className="text-sm text-gray-500">{job.company} | {job.duration}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">אין ניסיון תעסוקתי מתועד.</p>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">כישורים</h2>
                        {profile.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map(skill => (
                                    <span key={skill} className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">{skill}</span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">לא הוזנו כישורים.</p>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">המלצות</h2>
                        {profile.reviews.length > 0 ? (
                            <ul className="space-y-4">
                                {profile.reviews.map(review => (
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
                        ) : (
                            <p className="text-sm text-gray-500">אין המלצות עדיין.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicantProfileView;
