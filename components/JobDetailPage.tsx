import React, { useState, useEffect } from 'react';
import type { Job } from '../types';
import { MapPinIcon, DollarSignIcon, ClockIcon, CalendarIcon, BriefcaseIcon, ChevronLeftIcon, RouteIcon } from './icons';
import { auth, db } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface JobDetailPageProps {
    job: Job;
    onBack: () => void;
    userLocation: { lat: number; lng: number; } | null;
}

// Haversine formula - straight-line distance in km between two coordinates.
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const JobDetailPage: React.FC<JobDetailPageProps> = ({ job, onBack, userLocation }) => {
    const [distanceInfo, setDistanceInfo] = useState<{ text: string; link?: string } | null>(null);
    const [applyStatus, setApplyStatus] = useState<'idle' | 'submitting' | 'applied' | 'error'>('idle');

    const handleApply = async () => {
        const user = auth.currentUser;
        if (!user) {
            setApplyStatus('error');
            return;
        }

        setApplyStatus('submitting');
        try {
            await addDoc(collection(db, 'applications'), {
                jobId: job.id,
                jobTitle: job.title,
                employerId: (job as any).employerId || null,
                applicantId: user.uid,
                status: 'new',
                createdAt: serverTimestamp(),
            });
            setApplyStatus('applied');
        } catch (error) {
            console.error('Error submitting application:', error);
            setApplyStatus('error');
        }
    };

    useEffect(() => {
        if (userLocation && job.coordinates) {
            const distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng, job.coordinates.lat, job.coordinates.lng);
            const mapsLink = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${job.coordinates.lat},${job.coordinates.lng}`;
            setDistanceInfo({ text: `כ-${distanceKm.toFixed(1)} ק"מ ממיקומך`, link: mapsLink });
        } else {
            setDistanceInfo(null);
        }
    }, [userLocation, job.coordinates]);

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in-0 duration-500">
            <header className="mb-6">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-semibold mb-4 transition-colors">
                    <ChevronLeftIcon className="w-5 h-5" />
                    <span>חזרה לחיפוש</span>
                </button>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">{job.title}</h1>
                            <p className="text-lg text-gray-600 mt-1">{job.company}</p>
                        </div>
                        <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0">{job.type}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-500">
                        <div className="flex items-center gap-2"><MapPinIcon className="w-5 h-5"/> {job.location}</div>
                        <div className="flex items-center gap-2"><DollarSignIcon className="w-5 h-5"/> {job.salary} ₪ לשעה</div>
                        {job.days && job.days.length > 0 && <div className="flex items-center gap-2"><CalendarIcon className="w-5 h-5"/> {job.days.join(', ')}</div>}
                        {job.startTime && job.endTime && <div className="flex items-center gap-2"><ClockIcon className="w-5 h-5"/> {job.startTime} - {job.endTime}</div>}
                    </div>
                </div>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-3">תיאור המשרה</h2>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
                    
                    {job.skills && job.skills.length > 0 && (
                        <>
                            <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">כישורים נדרשים</h2>
                            <div className="flex flex-wrap gap-2">
                                {job.skills.map(skill => (
                                    <span key={skill} className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">{skill}</span>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="space-y-6">
                     <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-3">פרטים נוספים</h2>
                         <ul className="space-y-4 text-gray-600">
                            <li className="flex items-start gap-3">
                                <BriefcaseIcon className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                                <div>
                                    <strong className="font-semibold text-gray-700">ניסיון:</strong>
                                    <p className="text-sm">{job.experience || 'לא נדרש ניסיון קודם'}</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <RouteIcon className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                                <div>
                                    <strong className="font-semibold text-gray-700">מרחק ממך:</strong>
                                    {distanceInfo ? (
                                        <>
                                            <p className="text-sm">{distanceInfo.text}</p>
                                            {distanceInfo.link && (
                                                <a href={distanceInfo.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline font-semibold">
                                                    הצג מסלול במפות Google
                                                </a>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-500">לא ניתן לחשב מרחק. יש לאפשר גישה למיקום.</p>
                                    )}
                                </div>
                            </li>
                         </ul>
                     </div>
                     <div className="bg-purple-600 text-white p-6 rounded-xl shadow-lg text-center sticky top-28">
                         <h2 className="text-2xl font-bold">מוכנים להתחיל?</h2>
                         <p className="mt-2 mb-4 opacity-90">הגישו מועמדות עכשיו והתחילו את הקריירה שלכם!</p>
                         <button
                            onClick={handleApply}
                            disabled={applyStatus === 'submitting' || applyStatus === 'applied'}
                            className="w-full bg-white text-purple-600 font-bold py-3 px-6 rounded-lg hover:bg-purple-50 transition-colors duration-300 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                         >
                            {applyStatus === 'submitting' ? 'שולח מועמדות...' : applyStatus === 'applied' ? 'המועמדות נשלחה ✓' : 'הגש מועמדות עכשיו'}
                         </button>
                         {applyStatus === 'error' && (
                            <p className="mt-2 text-sm text-red-100">שגיאה בשליחת המועמדות. נסה שוב.</p>
                         )}
                     </div>
                </div>
            </main>
        </div>
    );
};

export default JobDetailPage;