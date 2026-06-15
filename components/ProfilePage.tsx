import React from 'react';
import { MapPinIcon, PencilIcon, StarIcon, CheckCircleIcon, FileTextIcon } from './icons';
import type { UserProfile } from '../types';

interface ProfilePageProps {
    userProfile: UserProfile;
    onEdit: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userProfile, onEdit }) => {
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
                </div>
                <button onClick={onEdit} className="flex items-center gap-2 bg-purple-100 text-purple-700 font-semibold py-2 px-4 rounded-lg hover:bg-purple-200 transition-colors">
                    <PencilIcon className="w-5 h-5" />
                    <span>עריכת פרופיל</span>
                </button>
            </header>

            {/* Parental Consent Status Banner */}
            {userProfile.parentalConsentUrl ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-center gap-3 animate-in fade-in-0 duration-500">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    <div>
                        <h3 className="font-bold text-green-800">אישור הורים קיים</h3>
                        <p className="text-sm text-green-700">המשתמש העלה אישור הורים חתום. <a href={userProfile.parentalConsentUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-900">צפה בקובץ</a></p>
                    </div>
                </div>
            ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-center gap-3 animate-in fade-in-0 duration-500">
                    <FileTextIcon className="w-6 h-6 text-yellow-600" />
                    <div>
                        <h3 className="font-bold text-yellow-800">חסר אישור הורים</h3>
                        <p className="text-sm text-yellow-700">טרם הועלה אישור הורים. <button onClick={onEdit} className="underline hover:text-yellow-900">לחץ לעריכה והעלאה</button></p>
                    </div>
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
