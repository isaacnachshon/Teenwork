import React, { useState, useMemo, useEffect } from 'react';
import type { Job } from '@/types';
import { MapPinIcon, DollarSignIcon, SearchIcon, MapIcon, BriefcaseIcon } from '@/components/icons';
import { auth, db } from '@/firebase';
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import JobMap from '@/components/JobMap';

interface JobsPageProps {
    onViewJobDetails: (job: Job) => void;
    userLocation?: { lat: number; lng: number };
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const jobTypes: Job['type'][] = ['קייטרינג', 'ניקיון', 'בייביסיטר', 'שיעורים', 'מלצרות', 'סבלות'];

const HeartIcon: React.FC<{ filled: boolean; className?: string }> = ({ filled, className }) => (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const JobCard: React.FC<{ job: Job; onViewDetails: (job: Job) => void; distance?: number; isFavorite: boolean; onToggleFavorite: (jobId: string) => void }> = ({ job, onViewDetails, distance, isFavorite, onToggleFavorite }) => (
    <div className="bg-white p-4 rounded-xl shadow-md flex flex-col gap-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3 flex-1">
                {job.companyLogoUrl ? (
                    <img src={job.companyLogoUrl} alt={job.company} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                        <BriefcaseIcon className="w-5 h-5 text-gray-400" />
                    </div>
                )}
                <div>
                    <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.company}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(job.id); }} className="p-1.5 rounded-full hover:bg-red-50 transition-colors">
                    <HeartIcon filled={isFavorite} className={`w-5 h-5 ${isFavorite ? 'text-red-500' : 'text-gray-300'}`} />
                </button>
                <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">{job.type}</span>
            </div>
        </div>
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
        {distance !== undefined && distance !== Infinity && (
            <p className="text-xs text-purple-600 font-semibold">מרחק: {distance.toFixed(1)} ק"מ</p>
        )}
        <p className="text-sm text-gray-500 flex-grow line-clamp-2">{job.description}</p>
        <button onClick={() => onViewDetails(job)} className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300 mt-2">צפה בפרטים</button>
    </div>
);


const JobsPage: React.FC<JobsPageProps> = ({ onViewJobDetails, userLocation }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<Job['type'] | 'all'>('all');
    const [sortByDistance, setSortByDistance] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'jobs'));
                const fetchedJobs: Job[] = querySnapshot.docs.map(d => ({
                    id: d.id,
                    ...d.data()
                })) as Job[];
                setJobs(fetchedJobs);
            } catch (error) {
                console.error("Error fetching jobs:", error);
            } finally {
                setLoadingJobs(false);
            }
        };
        const fetchFavorites = async () => {
            const uid = auth?.currentUser?.uid;
            if (!uid) return;
            try {
                const userDoc = await getDoc(doc(db, 'users', uid));
                if (userDoc.exists()) {
                    setFavoriteIds(userDoc.data().favoriteJobs || []);
                }
            } catch (err) {
                console.error("Error fetching favorites:", err);
            }
        };
        fetchJobs();
        fetchFavorites();
    }, []);

    const toggleFavorite = async (jobId: string) => {
        const uid = auth?.currentUser?.uid;
        if (!uid) return;
        const isFav = favoriteIds.includes(jobId);
        try {
            const userRef = doc(db, 'users', uid);
            if (isFav) {
                await updateDoc(userRef, { favoriteJobs: arrayRemove(jobId) });
                setFavoriteIds(prev => prev.filter(id => id !== jobId));
            } else {
                await updateDoc(userRef, { favoriteJobs: arrayUnion(jobId) });
                setFavoriteIds(prev => [...prev, jobId]);
            }
        } catch (err) {
            console.error("Error toggling favorite:", err);
        }
    };

    const filteredJobs = useMemo(() => {
        let result = jobs.filter(job => {
            const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.company.toLowerCase().includes(searchTerm.toLowerCase()) || job.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = selectedType === 'all' || job.type === selectedType;
            const matchesFav = !showFavoritesOnly || favoriteIds.includes(job.id);
            return matchesSearch && matchesType && matchesFav;
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
    }, [searchTerm, selectedType, sortByDistance, userLocation, jobs, showFavoritesOnly, favoriteIds]);

    return (
        <div className="animate-in fade-in-0 duration-500">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-3xl font-bold text-gray-800">חיפוש עבודות</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${showFavoritesOnly ? 'bg-red-500 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                    >
                        <HeartIcon filled={showFavoritesOnly} className="w-4 h-4" />
                        {showFavoritesOnly ? 'מועדפים' : 'מועדפים'}
                        {favoriteIds.length > 0 && <span className="text-xs">({favoriteIds.length})</span>}
                    </button>
                    <button
                        onClick={() => setShowMap(!showMap)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${showMap ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                    >
                        <MapIcon className="w-4 h-4" />
                        {showMap ? 'הסתר מפה' : 'הצג מפה'}
                    </button>
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
            </div>
            <p className="text-gray-500 mb-6">מצא את העבודה הבאה שלך כאן.</p>

            {showMap && (
                <div className="mb-8">
                    <JobMap
                        jobs={filteredJobs}
                        userLocation={userLocation}
                        onJobClick={onViewJobDetails}
                        height="350px"
                    />
                </div>
            )}

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

            {loadingJobs ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.length > 0 ? (
                        filteredJobs.map(job => (
                            <JobCard
                                key={job.id}
                                job={job}
                                onViewDetails={onViewJobDetails}
                                distance={(job as any).distance}
                                isFavorite={favoriteIds.includes(job.id)}
                                onToggleFavorite={toggleFavorite}
                            />
                        ))
                    ) : (
                        <p className="md:col-span-3 text-center text-gray-500 py-10">לא נמצאו עבודות התואמות את החיפוש.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default JobsPage;
