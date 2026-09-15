import React, { useState, useEffect } from 'react';
import type { Job } from '@/types';
import { MapPinIcon, DollarSignIcon, ClockIcon, CalendarIcon, BriefcaseIcon, ChevronLeftIcon, RouteIcon } from '@/components/icons';
import { auth, db } from '@/firebase';
import { addDoc, collection, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { calcAge, isYouthAge, YOUTH_AGE_ERROR } from '@/utils/age';
import { evaluateJobForTeen } from '@/utils/youthLaw';
import JobRightsPanel from '@/components/JobRightsPanel';
import EmploymentPrepChecklist from '@/components/EmploymentPrepChecklist';
import { ReportService } from '@/services/ReportService';

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
    const [applyError, setApplyError] = useState('');
    const [teen, setTeen] = useState<{ birthDate?: string; parentalConsentStatus?: string; name?: string; idNumber?: string; address?: string } | null>(null);

    // Load the viewing teen once so the rights panel can evaluate the job for their age.
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;
        let active = true;
        getDoc(doc(db, 'users', user.uid)).then(snap => {
            if (active) setTeen(snap.exists() ? (snap.data() as any) : null);
        }).catch(() => { /* panel falls back to the job's minAge */ });
        return () => { active = false; };
    }, []);

    const teenAge = teen?.birthDate ? calcAge(teen.birthDate) : undefined;
    const evaluation = teenAge !== undefined ? evaluateJobForTeen(job, teenAge) : null;
    const blockedReason = evaluation
        ? (!evaluation.ageOk ? (evaluation.ageNote || 'המשרה אינה מתאימה לגילך.')
            : evaluation.wage === 'below' ? `השכר במשרה נמוך משכר המינימום לגילך (₪${evaluation.wageFloor.toFixed(2)}).`
            : evaluation.night === 'illegal' ? 'שעות המשרה חורגות מהמותר לגילך לפי חוק עבודת הנוער.'
            : evaluation.shiftHours > 8 ? 'משמרת ארוכה מ-8 שעות אסורה לנוער.'
            : '')
        : '';

    const [reportState, setReportState] = useState<'idle' | 'sent' | 'error'>('idle');
    const reportJob = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const description = window.prompt('מה הבעיה במשרה? (שכר מתחת למינימום, שעות לא חוקיות, תוכן לא הולם...)');
        if (description === null) return;
        try {
            await ReportService.create({ reporterId: user.uid, reporterName: teen?.name || user.displayName || '', targetType: 'job', targetId: job.id, type: 'safety_concern', description: description.trim() || 'דיווח על משרה' });
            setReportState('sent');
        } catch (err) {
            console.error('Report failed:', err);
            setReportState('error');
        }
    };

    const shareWithParent = () => {
        const lines = [
            'היי, הגשתי מועמדות דרך TeenWork:',
            `${job.title} אצל ${job.company}`,
            `שכר: ₪${job.salary} לשעה · שעות: ${job.startTime || '?'}–${job.endTime || '?'} · ${job.location}`,
            `זכויות נוער: ${window.location.origin}/?rights=1`,
        ];
        window.open(`https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    };

    const handleApply = async () => {
        const user = auth.currentUser;
        if (!user) {
            setApplyStatus('error');
            setApplyError('יש להתחבר כדי להגיש מועמדות.');
            return;
        }

        setApplyStatus('submitting');
        setApplyError('');
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.exists() ? userDoc.data() : {};
            setTeen(userData as any);

            if (userData.parentalConsentStatus !== 'approved') {
                setApplyStatus('error');
                setApplyError('נדרש אישור הורים לפני הגשת מועמדות.');
                return;
            }

            if (!userData.birthDate || !isYouthAge(userData.birthDate)) {
                setApplyStatus('error');
                setApplyError(YOUTH_AGE_ERROR);
                return;
            }

            const ev = evaluateJobForTeen(job, calcAge(userData.birthDate));
            if (!ev.ageOk || ev.wage === 'below' || ev.night === 'illegal' || ev.shiftHours > 8) {
                setApplyStatus('error');
                setApplyError(!ev.ageOk ? (ev.ageNote || YOUTH_AGE_ERROR) : 'המשרה אינה עומדת בחוק עבודת הנוער עבור גילך ולכן לא ניתן להגיש מועמדות.');
                return;
            }

            await addDoc(collection(db, 'applications'), {
                jobId: job.id,
                jobTitle: job.title,
                employerId: (job as any).employerId || null,
                applicantId: user.uid,
                teenName: userData.name || user.displayName || 'נער/ה',
                employerName: job.company || 'מעסיק',
                status: 'new',
                createdAt: serverTimestamp(),
            });
            setApplyStatus('applied');
        } catch (error: any) {
            console.error('Error submitting application:', error);
            setApplyStatus('error');
            setApplyError(error?.code === 'permission-denied'
                ? 'ההגשה נדחתה על ידי המערכת: נדרשים אישור הורים תקף, גיל מתאים למשרה ואישור התקנון העדכני.'
                : 'שגיאה בשליחת המועמדות. נסה שוב.');
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
                     <JobRightsPanel mode="teen" job={job} teenAge={teenAge} />
                     <div className="text-left">
                        {reportState === 'sent'
                            ? <p role="status" className="text-sm text-green-700">הדיווח נשלח לצוות TeenWork. תודה!</p>
                            : <button type="button" onClick={reportJob} className="text-sm text-gray-500 hover:text-red-600 underline">דווח על משרה זו</button>}
                        {reportState === 'error' && <p role="alert" className="text-sm text-red-600">שליחת הדיווח נכשלה.</p>}
                     </div>
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
                            disabled={applyStatus === 'submitting' || applyStatus === 'applied' || !!blockedReason}
                            className="w-full bg-white text-purple-600 font-bold py-3 px-6 rounded-lg hover:bg-purple-50 transition-colors duration-300 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                         >
                            {applyStatus === 'submitting' ? 'שולח מועמדות...' : applyStatus === 'applied' ? 'המועמדות נשלחה ✓' : 'הגש מועמדות עכשיו'}
                         </button>
                         {blockedReason && applyStatus !== 'applied' && (
                            <p role="alert" className="mt-2 text-sm text-red-100">{blockedReason}</p>
                         )}
                         {applyStatus === 'error' && (
                            <p role="alert" className="mt-2 text-sm text-red-100">{applyError || 'שגיאה בשליחת המועמדות. נסה שוב.'}</p>
                         )}
                         {applyStatus === 'applied' && (
                            <div className="mt-4 space-y-3 text-right">
                                <button type="button" onClick={shareWithParent} className="w-full bg-green-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-green-600 transition-colors">שתף עם ההורה בוואטסאפ</button>
                                <p className="text-xs opacity-90">ההורה מקבל גם עדכון במייל על כל מועמדות.</p>
                                <div className="text-gray-800">
                                    <EmploymentPrepChecklist role="teen" compact done={[...(teen?.parentalConsentStatus === 'approved' ? ['consent'] : []), ...(teen?.idNumber && teen?.address ? ['form101'] : [])]} />
                                </div>
                            </div>
                         )}
                     </div>
                </div>
            </main>
        </div>
    );
};

export default JobDetailPage;