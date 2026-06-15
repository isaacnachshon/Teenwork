import React, { useState, useMemo } from 'react';
import type { Job } from '../types';
import { MapPinIcon, DollarSignIcon, SearchIcon } from './icons';

interface JobsPageProps {
    onViewJobDetails: (job: Job) => void;
    userLocation?: { lat: number; lng: number };
}

// Helper function to calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

// Mock data, can be moved to a separate file later
const jobs: Job[] = [
    { id: '1', title: 'מלצר/ית באירוע', company: 'קייטרינג "השף המעופף"', location: 'תל אביב', coordinates: { lat: 32.0853, lng: 34.7818 }, salary: 45, type: 'מלצרות', description: 'עבודה כיפית ודינאמית באירועי ערב יוקרתיים. דרושים נערים ונערות חייכנים ואנרגטיים לעבודה באירועים בסופי שבוע. אין צורך בניסיון קודם - הכשרה תינתן במקום. שכר גבוה ותנאים מעולים למתאימים.', skills: ['שירותיות', 'עבודת צוות', 'זריזות'], experience: 'ללא ניסיון', days: ['חמישי', 'שישי'], startTime: '18:00', endTime: '02:00' },
    { id: '2', title: 'בייביסיטר אנרגטי/ת', company: 'משפחת כהן', location: 'רמת גן', coordinates: { lat: 32.0826, lng: 34.8093 }, salary: 40, type: 'בייביסיטר', description: 'לשמור על שני ילדים מקסימים (גילאי 4 ו-7) בשעות אחר הצהריים, פעמיים בשבוע. כולל הוצאה מהגן, משחק והכנת ארוחת ערב קלה.', skills: ['גישה לילדים', 'אחריות', 'סבלנות'], experience: 'ניסיון בסיסי' },
    { id: '3', title: 'עזרה בהכנת שיעורי בית', company: 'דניאל', location: 'הרצליה', coordinates: { lat: 32.166, lng: 34.8432 }, salary: 50, type: 'שיעורים', description: 'עזרה במתמטיקה ואנגלית לתלמיד כיתה ח\'.' },
    { id: '4', title: 'עובד/ת ניקיון למשרד', company: 'WeClean', location: 'פתח תקווה', coordinates: { lat: 32.0939, lng: 34.8825 }, salary: 42, type: 'ניקיון', description: 'ניקיון משרדי הייטק בשעות הערב.' },
    { id: '5', title: 'סדרן/ית בקולנוע', company: 'סינמה סיטי', location: 'ראשון לציון', coordinates: { lat: 31.972, lng: 34.789 }, salary: 38, type: 'מלצרות', description: 'עבודה באווירה צעירה ודינמית בסופי שבוע.' },
    { id: '6', title: 'מוכר/ת בחנות בגדים', company: 'קסטרו', location: 'תל אביב', coordinates: { lat: 32.073, lng: 34.792 }, salary: 40, type: 'מלצרות', description: 'דרושים/ות מוכרים/ות אנרגטיים/ות עם אהבה לאופנה.' },
    { id: '7', title: 'צוות הפעלה בימי הולדת', company: 'הפעלות וכיף', location: 'חולון', coordinates: { lat: 32.016, lng: 34.776 }, salary: 55, type: 'בייביסיטר', description: 'להפעיל ילדים בימי הולדת, דרוש/ה ניסיון וגישה לילדים.' },
    { id: '8', title: 'שליח/ה בפיצריה', company: 'פיצה האט', location: 'בת ים', coordinates: { lat: 32.017, lng: 34.745 }, salary: 45, type: 'מלצרות', description: 'שליחויות על אופניים חשמליים באזור בת ים. טיפים טובים.' },
];

const jobTypes: Job['type'][] = ['קייטרינג', 'ניקיון', 'בייביסיטר', 'שיעורים', 'מלצרות', 'סבלות'];

const JobCard: React.FC<{ job: Job; onViewDetails: (job: Job) => void; distance?: number }> = ({ job, onViewDetails, distance }) => (
    <div className="bg-white p-4 rounded-xl shadow-md flex flex-col gap-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
            <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">{job.type}</span>
        </div>
        <p className="text-sm text-gray-600">{job.company}</p>
        <div className="flex items-center text-gray-500 text-sm gap-4">
            <div className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" />
                <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
                <DollarSignIcon className="w-4 h-4" />
                <span>{job.salary} ₪ לשעה</span>
            </div>
        </div>
        {distance !== undefined && (
            <p className="text-xs text-purple-600 font-semibold">📍 מרחק: {distance.toFixed(1)} ק"מ</p>
        )}
        <p className="text-sm text-gray-500 flex-grow">{job.description}</p>
        <button onClick={() => onViewDetails(job)} className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300 mt-2">הגש מועמדות</button>
    </div>
);


const JobsPage: React.FC<JobsPageProps> = ({ onViewJobDetails, userLocation }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<Job['type'] | 'all'>('all');
    const [sortByDistance, setSortByDistance] = useState(false);

    const filteredJobs = useMemo(() => {
        let result = jobs.filter(job => {
            const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.company.toLowerCase().includes(searchTerm.toLowerCase()) || job.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = selectedType === 'all' || job.type === selectedType;
            return matchesSearch && matchesType;
        });

        if (sortByDistance && userLocation) {
            result = result.map(job => {
                if (job.coordinates) {
                    return { ...job, distance: calculateDistance(userLocation.lat, userLocation.lng, job.coordinates.lat, job.coordinates.lng) };
                }
                return { ...job, distance: Infinity };
            }).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        }

        return result;
    }, [searchTerm, selectedType, sortByDistance, userLocation]);

    return (
        <div className="animate-in fade-in-0 duration-500">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-3xl font-bold text-gray-800">חיפוש עבודות</h1>
                {userLocation && (
                    <button
                        onClick={() => setSortByDistance(!sortByDistance)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${sortByDistance ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                    >
                        <MapPinIcon className="w-4 h-4" />
                        {sortByDistance ? 'מציג קרוב לרחוק' : 'מיין לפי מרחק'}
                    </button>
                )}
            </div>
            <p className="text-gray-500 mb-6">מצא את העבודה הבאה שלך כאן.</p>

            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="חפש לפי שם משרה, חברה או מיקום..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full ps-12 pe-4 py-3 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                    />
                    <SearchIcon className="absolute top-1/2 right-4 -translate-y-1/2 w-6 h-6 text-gray-400" />
                </div>
            </div>

            <div className="mb-8 flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedType('all')}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${selectedType === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                    הכל
                </button>
                {jobTypes.map(type => (
                    <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${selectedType === type ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.length > 0 ? (
                    filteredJobs.map(job => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onViewDetails={onViewJobDetails}
                            distance={(job as any).distance}
                        />
                    ))
                ) : (
                    <p className="md:col-span-3 text-center text-gray-500 py-10">לא נמצאו עבודות התואמות את החיפוש.</p>
                )}
            </div>
        </div>
    );
};

export default JobsPage;