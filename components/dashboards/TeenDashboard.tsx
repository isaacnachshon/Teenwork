import React, { useState, useEffect, useMemo } from 'react';
import type { Job, UserProfile } from '../../types';
import { MapPinIcon, DollarSignIcon, SearchIcon, BellIcon, MenuIcon, XIcon, UserIcon, BriefcaseIcon, UsersIcon, HomeIcon, ScaleIcon } from '../icons';
import RightsInfoModal from '../RightsInfoModal';
import ProfilePage from '../ProfilePage';
import JobsPage from '../JobsPage';
import EditProfilePage from '../EditProfilePage';
import JobDetailPage from '../JobDetailPage';
import { auth, db } from '../../firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import JobMap from '../JobMap';

// Local jobs array removed in favor of Firestore fetching


// Helper function to calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

const stories = [
  { id: '1', name: 'אור', img: 'https://picsum.photos/id/1005/100/100' },
  { id: '2', name: 'יעל', img: 'https://picsum.photos/id/1011/100/100' },
  { id: '3', name: 'תומר', img: 'https://picsum.photos/id/1025/100/100' },
  { id: '4', name: 'מאיה', img: 'https://picsum.photos/id/1027/100/100' },
  { id: '5', name: 'רוני', img: 'https://picsum.photos/id/1028/100/100' },
  { id: '6', name: 'דנה', img: 'https://picsum.photos/id/1029/100/100' },
];

const initialUserProfile: UserProfile = {
  name: 'אור כהן',
  age: 17,
  birthDate: '2008-07-12',
  idNumber: '123456789',
  phone: '052-1234567',
  location: 'תל אביב',
  address: 'רחוב דיזנגוף 123, תל אביב',
  city: 'תל אביב',
  school: 'תיכון עירוני א\'',
  studyStatus: 'לומד',
  parentName: 'דנה כהן',
  parentPhone: '052-7654321',
  parentEmail: 'dana@example.com',
  parentRelation: 'אם',
  parentAddress: 'רחוב דיזנגוף 123, תל אביב',
  parentalConsentUrl: '',
  parentalConsentStatus: 'pending',
  parentalConsentUploadedAt: '',
  parentalConsentReviewedAt: '',
  parentalConsentReviewer: '',
  paymentInfo: 'bit: 052-1234567',
  bankName: 'בנק הפועלים',
  bankBranch: '123',
  bankAccountNumber: '123456',
  bankId: '01',
  coordinates: { lat: 32.0853, lng: 34.7818 },
  profileImageUrl: 'https://picsum.photos/id/1005/200/200',
  bio: 'נער אנרגטי ואחראי עם ניסיון בעבודה עם ילדים ושירות לקוחות. מחפש עבודה מאתגרת ומהנה לסופי שבוע וחופשות. אוהב ללמוד דברים חדשים ומוכן לעבוד קשה!',
  skills: ['בייביסיטר', 'שירות לקוחות', 'עבודת צוות', 'אנגלית ברמה גבוהה', 'סדר וארגון'],
  preferredJobTypes: ['בייביסיטר', 'שיעורים'],
  workHistory: [
    { id: '1', title: 'בייביסיטר', company: 'משפחת לוי', duration: '2022-היום' },
    { id: '2', title: 'מוכר בגלידריה', company: 'גולדה', duration: 'קיץ 2023' },
  ],
  reviews: [
    { id: '1', reviewer: 'דנה לוי', rating: 5, comment: 'אור שמר על הילדים שלנו מספר פעמים והיה פשוט מעולה! אחראי, סבלני ויודע איך להעסיק אותם. ממליצה בחום.' },
    { id: '2', reviewer: 'מנהל סניף גולדה', rating: 4, comment: 'עובד חרוץ עם תודעת שירות גבוהה. תמיד מגיע בזמן ועם חיוך.' },
  ]
};

const JobCard: React.FC<{ job: Job, onViewDetails: (job: Job) => void, distance?: number }> = ({ job, onViewDetails, distance }) => (
  <div className="bg-white p-4 rounded-xl shadow-md flex flex-col gap-3 min-w-[280px] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center gap-3">
      {job.companyLogoUrl ? (
        <img src={job.companyLogoUrl} alt={job.company} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
          <BriefcaseIcon className="w-5 h-5 text-gray-400" />
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-800 leading-tight">{job.title}</h3>
        <p className="text-sm text-gray-600">{job.company}</p>
      </div>
      <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">{job.type}</span>
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
    {distance !== undefined && (
      <p className="text-xs text-purple-600 font-semibold">📍 מרחק: {distance.toFixed(1)} ק"מ</p>
    )}
    <p className="text-sm text-gray-500 flex-grow">{job.description}</p>
    <button onClick={() => onViewDetails(job)} className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300 mt-2">צפה בפרטים</button>
  </div>
);

type View = 'home' | 'jobs' | 'communities' | 'profile' | 'editProfile' | 'jobDetail';

interface TeenDashboardProps {
  onLogout: () => void;
  onHeaderVisibilityChange?: (hidden: boolean) => void;
}

const getTimeGreeting = (name: string): string => {
  const hour = new Date().getHours();
  const firstName = name.split(' ')[0];
  if (hour >= 5 && hour < 12) return `בוקר טוב, ${firstName}`;
  if (hour >= 12 && hour < 17) return `צהריים טובים, ${firstName}`;
  if (hour >= 17 && hour < 21) return `ערב טוב, ${firstName}`;
  return `לילה טוב, ${firstName}`;
};

const TeenDashboard: React.FC<TeenDashboardProps> = ({ onLogout, onHeaderVisibilityChange }) => {
  const [activeView, setActiveView] = useState<View>('home');

  const navigateTo = (view: View) => {
    const hideHeader = view === 'profile' || view === 'editProfile';
    onHeaderVisibilityChange?.(hideHeader);
    setActiveView(view);
  };
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [showRightsModal, setShowRightsModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch jobs from Firestore
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'jobs'));
        const fetchedJobs: Job[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Job[];
        setJobs(fetchedJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  const nearbyJobs = useMemo(() => {
    if (!userProfile.coordinates) return [];

    return jobs
      .map(job => {
        if (!job.coordinates || !userProfile.coordinates) return { ...job, distance: Infinity };
        const distance = calculateDistance(
          userProfile.coordinates.lat,
          userProfile.coordinates.lng,
          job.coordinates.lat,
          job.coordinates.lng
        );
        return { ...job, distance };
      })
      .filter(job => job.distance < 50) // Filter jobs within 50km
      .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
      .slice(0, 5); // Take top 5
  }, [userProfile.coordinates, jobs]);

  // Fetch user profile from Firestore
  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.error('No authenticated user found');
        setIsLoadingProfile(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile({
            name: userData.name || 'משתמש',
            age: userData.age || 16,
            birthDate: userData.birthDate || '',
            idNumber: userData.idNumber || '',
            phone: userData.phone || '',
            location: userData.location || 'ישראל',
            address: userData.address || '',
            city: userData.city || '',
            school: userData.school || '',
            studyStatus: userData.studyStatus || '',
            parentName: userData.parentName || '',
            parentPhone: userData.parentPhone || '',
            parentEmail: userData.parentEmail || '',
            parentRelation: userData.parentRelation || '',
            parentAddress: userData.parentAddress || '',
            parentalConsentUrl: userData.parentalConsentUrl || '',
            parentalConsentStatus: userData.parentalConsentStatus || 'pending',
            parentalConsentUploadedAt: userData.parentalConsentUploadedAt || '',
            parentalConsentReviewedAt: userData.parentalConsentReviewedAt || '',
            parentalConsentReviewer: userData.parentalConsentReviewer || '',
            paymentInfo: userData.paymentInfo || '',
            bankName: userData.bankName || '',
            bankBranch: userData.bankBranch || '',
            bankAccountNumber: userData.bankAccountNumber || '',
            bankId: userData.bankId || '',
            coordinates: userData.coordinates || { lat: 32.0853, lng: 34.7818 },
            profileImageUrl: userData.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=E9D5FF&color=8B5CF6&bold=true`,
            bio: userData.bio || '',
            skills: userData.skills || [],
            preferredJobTypes: userData.preferredJobTypes || [],
            workHistory: userData.workHistory || [],
            reviews: userData.reviews || [],
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          console.error("Error getting location", error);
          setLocationError("לא ניתן היה לקבל את מיקומך. יש לאפשר גישה למיקום בהגדרות הדפדפן.");
        }
      );
    } else {
      setLocationError("שירותי מיקום אינם נתמכים בדפדפן זה.");
    }
  }, []);

  const handleViewJobDetails = (job: Job) => {
    setSelectedJob(job);
    setActiveView('jobDetail');
  };

  const handleProfileSave = async (updatedProfile: UserProfile) => {
    const user = auth.currentUser;
    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        name: updatedProfile.name,
        age: updatedProfile.age,
        birthDate: updatedProfile.birthDate || '',
        idNumber: updatedProfile.idNumber || '',
        phone: updatedProfile.phone || '',
        location: updatedProfile.location,
        address: updatedProfile.address || '',
        city: updatedProfile.city || '',
        school: updatedProfile.school || '',
        studyStatus: updatedProfile.studyStatus || '',
        parentName: updatedProfile.parentName || '',
        parentPhone: updatedProfile.parentPhone || '',
        parentEmail: updatedProfile.parentEmail || '',
        parentRelation: updatedProfile.parentRelation || '',
        parentAddress: updatedProfile.parentAddress || '',
        parentalConsentUrl: updatedProfile.parentalConsentUrl || '',
        parentalConsentStatus: updatedProfile.parentalConsentStatus || userProfile.parentalConsentStatus || 'pending',
        parentalConsentUploadedAt: updatedProfile.parentalConsentUploadedAt || userProfile.parentalConsentUploadedAt || '',
        parentalConsentReviewedAt: updatedProfile.parentalConsentReviewedAt || userProfile.parentalConsentReviewedAt || '',
        parentalConsentReviewer: updatedProfile.parentalConsentReviewer || userProfile.parentalConsentReviewer || '',
        paymentInfo: updatedProfile.paymentInfo || '',
        bankName: updatedProfile.bankName || '',
        bankBranch: updatedProfile.bankBranch || '',
        bankAccountNumber: updatedProfile.bankAccountNumber || '',
        bankId: updatedProfile.bankId || '',
        coordinates: updatedProfile.coordinates || { lat: 32.0853, lng: 34.7818 },
        profileImageUrl: updatedProfile.profileImageUrl,
        bio: updatedProfile.bio,
        skills: updatedProfile.skills,
        preferredJobTypes: updatedProfile.preferredJobTypes || [],
        workHistory: updatedProfile.workHistory,
        reviews: updatedProfile.reviews,
        role: 'teen',
        uid: user.uid,
        email: user.email,
      }, { merge: true });

      setUserProfile(updatedProfile);
      navigateTo('profile');
    } catch (error) {
      console.error('Error saving teen profile:', error);
      alert('שגיאה בשמירת הפרופיל. נסה שוב.');
    }
  };

  const NavLink: React.FC<{
    viewName: View;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ viewName, icon, children }) => {
    const isActive = activeView === viewName;
    return (
      <li>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigateTo(viewName);
            setIsMobileMenuOpen(false);
          }}
          className={`flex items-center gap-3 text-lg font-semibold p-3 rounded-lg transition-colors ${isActive ? 'text-purple-700 bg-purple-100' : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'}`}
        >
          {icon}
          {children}
        </a>
      </li>
    );
  };

  const HomeContent: React.FC = () => (
    <>
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{getTimeGreeting(userProfile.name)}</h1>
        <p className="text-gray-500 mt-1">מה עובד היום?</p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">סטוריז מהקהילה</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stories.map(story => (
            <div key={story.id} className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-1">
                <img src={story.img} alt={story.name} className="w-full h-full rounded-full border-2 border-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700">{story.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">עבודות מומלצות עבורך</h2>
        <div className="flex gap-6 overflow-x-auto pb-4 -mx-2 px-2">
          {jobs.map(job => <JobCard key={job.id} job={job} onViewDetails={handleViewJobDetails} />)}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">עבודות קרובות אלייך</h2>
        <div className="flex gap-6 overflow-x-auto pb-4 -mx-2 px-2">
          {nearbyJobs.map(job => <JobCard key={job.id} job={job} onViewDetails={handleViewJobDetails} distance={job.distance} />)}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">מפת עבודות</h2>
        <JobMap
          jobs={jobs}
          userLocation={userProfile.coordinates}
          onJobClick={handleViewJobDetails}
          height="400px"
        />
      </section>

    </>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'profile':
        return <ProfilePage userProfile={userProfile} onEdit={() => navigateTo('editProfile')} />;
      case 'editProfile':
        return <EditProfilePage userProfile={userProfile} onSave={handleProfileSave} onCancel={() => navigateTo('profile')} />;
      case 'jobs':
        return <JobsPage onViewJobDetails={handleViewJobDetails} userLocation={userProfile.coordinates} />;
      case 'jobDetail':
        return selectedJob ? <JobDetailPage job={selectedJob} onBack={() => navigateTo('jobs')} userLocation={userLocation} /> : <div className="text-center p-10">טוען פרטי משרה...</div>;
      case 'communities':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-10 animate-in fade-in-0 duration-500">
            <UsersIcon className="w-24 h-24 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700">הקהילות יגיעו בקרוב!</h2>
            <p className="text-gray-500 mt-2 max-w-md">אנחנו עובדים על מרחב שבו תוכלו לשתף חוויות, לקבל טיפים, לשאול שאלות ולהכיר חברים חדשים לעבודה.</p>
          </div>
        );
      case 'home':
      default:
        return <div className="animate-in fade-in-0 duration-500"><HomeContent /></div>;
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">טוען פרופיל...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      <nav id="mobile-nav" aria-label="ניווט ראשי" className={`fixed inset-y-0 right-0 z-50 w-64 bg-white p-6 shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out md:static md:flex-shrink-0 md:translate-x-0 md:flex ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => { navigateTo('home'); setIsMobileMenuOpen(false); }}
            aria-label="TEENWORK - חזרה לדף הבית"
            className="text-2xl font-bold text-purple-600 text-right focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded hover:opacity-80 transition-opacity"
          >
            TEENWORK
          </button>
          <button onClick={() => setIsMobileMenuOpen(false)} aria-label="סגור תפריט ניווט" className="md:hidden p-1 text-gray-500 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded">
            <XIcon className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
        <ul className="space-y-4">
          <NavLink viewName="home" icon={<HomeIcon className="w-6 h-6" />}>דף הבית</NavLink>
          <NavLink viewName="jobs" icon={<BriefcaseIcon className="w-6 h-6" />}>חיפוש עבודות</NavLink>
          <NavLink viewName="communities" icon={<UsersIcon className="w-6 h-6" />}>קהילות</NavLink>
          <NavLink viewName="profile" icon={<UserIcon className="w-6 h-6" />}>פרופיל</NavLink>
          <li>
            <button
              onClick={() => { setShowRightsModal(true); setIsMobileMenuOpen(false); }}
              className="flex w-full items-center gap-3 text-lg font-semibold p-3 rounded-lg transition-colors text-gray-600 hover:text-purple-700 hover:bg-purple-50"
            >
              <ScaleIcon className="w-6 h-6" />
              זכויות נוער
            </button>
          </li>
        </ul>
        <div className="mt-auto">
          <button onClick={onLogout} className="w-full bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">התנתקות</button>
        </div>
      </nav>

      <div className="flex-1 bg-gray-50 p-6 md:p-10">
        <header className="flex justify-between items-center mb-8">
          <div className="relative w-full max-w-lg">
            <label htmlFor="quick-search" className="sr-only">חיפוש מהיר של עבודה</label>
            <input
              id="quick-search"
              type="search"
              placeholder="חיפוש מהיר של עבודה..."
              className="w-full ps-12 pe-4 py-3 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow cursor-pointer"
              readOnly
              onClick={() => setActiveView('jobs')}
            />
            <SearchIcon className="absolute top-1/2 right-4 -translate-y-1/2 w-6 h-6 text-gray-400" aria-hidden="true" />
          </div>
          <div className="flex items-center gap-4">
            <button aria-label="התראות (בקרוב)" className="p-3 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500" title="התראות (בקרוב)">
              <BellIcon className="w-6 h-6 text-gray-600" aria-hidden="true" />
            </button>
            <img src={userProfile.profileImageUrl} alt={`תמונת פרופיל של ${userProfile.name}`} className="w-12 h-12 rounded-full border-2 border-purple-500 object-cover" />
            <button onClick={() => setIsMobileMenuOpen(true)} aria-label="פתח תפריט ניווט" aria-expanded={isMobileMenuOpen} aria-controls="mobile-nav" className="md:hidden p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded">
              <MenuIcon className="w-6 h-6 text-gray-600" aria-hidden="true" />
            </button>
          </div>
        </header>

        {locationError && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
            <p className="font-bold">שגיאת מיקום</p>
            <p>{locationError}</p>
          </div>
        )}

        {renderContent()}

        <RightsInfoModal isOpen={showRightsModal} onClose={() => setShowRightsModal(false)} />

      </div>
    </div>
  );
};

export default TeenDashboard;