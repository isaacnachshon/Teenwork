import React, { useState } from 'react';
import type { Applicant, Job } from '../../types';
import { BriefcaseIcon, UserIcon, PlusCircleIcon, XIcon, DollarSignIcon, MapPinIcon, LogOutIcon, ClockIcon, CalendarIcon, UsersIcon, HomeIcon, SettingsIcon } from '../icons';
import EmployerProfilePage from '../EmployerProfilePage';
import { db, auth } from '../../firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp, Timestamp, doc, getDoc } from 'firebase/firestore';

const applicants: Applicant[] = [
  { id: '1', name: 'מאיה לוי', age: 17, jobTitle: 'מלצרות באירוע', profileImageUrl: 'https://picsum.photos/id/1027/100/100', status: 'new' },
  { id: '2', name: 'איתי שדה', age: 16, jobTitle: 'עזרה בשיעורי בית', profileImageUrl: 'https://picsum.photos/id/1041/100/100', status: 'viewed' },
  { id: '3', name: 'נועה ברק', age: 18, jobTitle: 'בייביסיטר', profileImageUrl: 'https://picsum.photos/id/1043/100/100', status: 'contacted' },
  { id: '4', name: 'גיא כרמל', age: 17, jobTitle: 'מלצרות באירוע', profileImageUrl: 'https://picsum.photos/id/1051/100/100', status: 'new' },
];

interface EmployerDashboardProps {
  onLogout: () => void;
}

const allJobTypes: Job['type'][] = ['קייטרינג', 'ניקיון', 'בייביסיטר', 'שיעורים', 'מלצרות', 'סבלות'];
const weekDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

type FormData = {
  title: string;
  description: string;
  jobTypes: Job['type'][];
  location: string;
  days: string[];
  startTime: string;
  endTime: string;
  salary: number | string;
  skills: string[];
  experience: string;
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 hover:shadow-lg transition-shadow">
    <div className="p-3 bg-blue-100 rounded-full">{icon}</div>
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const PostJobModal: React.FC<{ onClose: () => void, onPostJob: (job: Job) => void, employerProfile: any }> = ({ onClose, onPostJob, employerProfile }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    jobTypes: [],
    location: '',
    days: [],
    startTime: '09:00',
    endTime: '17:00',
    salary: '',
    skills: [],
    experience: 'ללא ניסיון'
  });
  const [currentSkill, setCurrentSkill] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (value: string, field: 'jobTypes' | 'days') => {
    setFormData(prev => {
      const currentValues = prev[field] as string[];
      if (currentValues.includes(value)) {
        return { ...prev, [field]: currentValues.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...currentValues, value] };
      }
    });
  };

  const handleAddSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, currentSkill.trim()] }));
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(skill => skill !== skillToRemove) }));
  };

  const nextStep = () => setCurrentStep(prev => prev < 4 ? prev + 1 : prev);
  const prevStep = () => setCurrentStep(prev => prev > 1 ? prev - 1 : prev);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newJobData = {
      title: formData.title,
      company: employerProfile?.companyName || "My Awesome Company", // Ideally fetch from profile
      companyLogoUrl: employerProfile?.profileImageUrl || employerProfile?.companyLogoUrl,
      location: formData.location,
      salary: Number(formData.salary),
      type: formData.jobTypes[0] || 'מלצרות',
      description: formData.description,
      days: formData.days,
      startTime: formData.startTime,
      endTime: formData.endTime,
      skills: formData.skills,
      experience: formData.experience,
      applicantsCount: 0,
      employerId: auth.currentUser?.uid,
      createdAt: serverTimestamp(),
    };

    // Pass the data to the parent handler which will do the async save
    onPostJob(newJobData as any);
    onClose();
  };

  const totalSteps = 4;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl transform transition-all animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-gray-800">פרסום משרה חדשה</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <p className="text-center text-gray-500 mb-6">שלב {currentStep} מתוך {totalSteps}</p>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
        </div>

        <form onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in-0 duration-300">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם המשרה</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="לדוגמה: מלצר/ית לאירוע ערב" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תיאור המשרה</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} placeholder="פרטים על המשרה, דרישות, וכו'..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">סוג/י העבודה</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allJobTypes.map(type => (
                    <button type="button" key={type} onClick={() => handleCheckboxChange(type, 'jobTypes')} className={`p-3 text-center rounded-lg border-2 transition-colors ${formData.jobTypes.includes(type) ? 'bg-blue-100 border-blue-500 text-blue-700 font-semibold' : 'bg-white border-gray-300 hover:border-blue-400'}`}>{type}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in-0 duration-300">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מיקום</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="לדוגמה: תל אביב" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ימי עבודה</label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map(day => (
                    <button type="button" key={day} onClick={() => handleCheckboxChange(day, 'days')} className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${formData.days.includes(day) ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-100'}`}>{day}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שעת התחלה</label>
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שעת סיום</label>
                  <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          )}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in-0 duration-300">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שכר לשעה (בש"ח)</label>
                <input type="number" name="salary" value={formData.salary} onChange={handleInputChange} placeholder="45" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">כישורים נדרשים</label>
                <div className="flex gap-2">
                  <input type="text" value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)} placeholder="לדוגמה: אנגלית שוטפת" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())} className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  <button type="button" onClick={handleAddSkill} className="px-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600">הוסף</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.skills.map(skill => (
                    <span key={skill} className="flex items-center gap-2 bg-gray-200 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-gray-500 hover:text-gray-800"><XIcon className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ניסיון נדרש</label>
                <div className="flex gap-3">
                  {['ללא ניסיון', 'ניסיון בסיסי', 'ניסיון רב'].map(exp => (
                    <button type="button" key={exp} onClick={() => setFormData(prev => ({ ...prev, experience: exp }))} className={`flex-1 p-3 text-center rounded-lg border-2 transition-colors ${formData.experience === exp ? 'bg-blue-100 border-blue-500 text-blue-700 font-semibold' : 'bg-white border-gray-300 hover:border-blue-400'}`}>{exp}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in-0 duration-300">
              <h3 className="text-xl font-bold text-gray-800 mb-4">סיכום ואישור</h3>
              <div className="p-4 bg-gray-50 rounded-lg space-y-3 max-h-60 overflow-y-auto">
                <p><strong>שם המשרה:</strong> {formData.title || 'לא צוין'}</p>
                <p><strong>סוגי עבודה:</strong> {formData.jobTypes.join(', ') || 'לא צוין'}</p>
                <p><strong>מיקום:</strong> {formData.location || 'לא צוין'}</p>
                <p><strong>ימים:</strong> {formData.days.join(', ') || 'לא צוין'}</p>
                <p><strong>שעות:</strong> {formData.startTime} - {formData.endTime}</p>
                <p><strong>שכר:</strong> {formData.salary} ₪ לשעה</p>
                <p><strong>כישורים:</strong> {formData.skills.join(', ') || 'לא צוין'}</p>
                <p><strong>ניסיון:</strong> {formData.experience}</p>
                <p><strong>תיאור:</strong> {formData.description || 'לא צוין'}</p>
              </div>
              <p className="text-sm text-gray-500">בדיקה אחרונה לפני הפרסום. ניתן לחזור אחורה ולתקן במידת הצורך.</p>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            {currentStep > 1 ? (
              <button type="button" onClick={prevStep} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300">חזרה</button>
            ) : <div></div>}

            {currentStep < 4 ? (
              <button type="button" onClick={nextStep} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">הבא</button>
            ) : (
              <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">פרסם משרה</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const PostedJobCard: React.FC<{ job: Job }> = ({ job }) => (
  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div className="flex-grow">
      <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
      <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-1 mt-1">
        <div className="flex items-center gap-1.5"><MapPinIcon className="w-4 h-4" /> {job.location}</div>
        <div className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> {job.days?.join(', ')}</div>
        <div className="flex items-center gap-1.5"><ClockIcon className="w-4 h-4" /> {job.startTime} - {job.endTime}</div>
      </div>
    </div>
    <div className="flex-shrink-0 flex sm:flex-col items-end justify-between sm:justify-center gap-2">
      <div className="flex items-center gap-2 text-blue-600 font-semibold">
        <UsersIcon className="w-5 h-5" />
        <span>{job.applicantsCount} מועמדים</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="text-sm text-blue-600 font-semibold hover:underline">צפה במועמדים</button>
        <button className="text-sm text-gray-500 font-semibold hover:underline">ערוך</button>
      </div>
    </div>
  </div>
);

type View = 'dashboard' | 'profile';

const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [employerProfile, setEmployerProfile] = useState<any>(null);

  // Fetch jobs from Firestore - AND Profile
  const fetchData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch Profile
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setEmployerProfile(userDocSnap.data());
      }

      // Fetch Jobs
      const q = query(collection(db, 'jobs'), where('employerId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const fetchedJobs: Job[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];

      fetchedJobs.sort((a, b) => {
        const dateA = (a as any).createdAt?.seconds || 0;
        const dateB = (b as any).createdAt?.seconds || 0;
        return dateB - dateA;
      });

      setJobs(fetchedJobs);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handlePostJob = async (newJobData: any) => {
    try {
      await addDoc(collection(db, 'jobs'), newJobData);
      // Refresh the list
      fetchData();
    } catch (error) {
      console.error("Error adding job:", error);
      alert("שגיאה בפרסום המשרה");
    }
  };

  const getStatusChip = (status: Applicant['status']) => {
    switch (status) {
      case 'new': return <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">חדש</span>;
      case 'viewed': return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">נצפה</span>;
      case 'contacted': return <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">נוצר קשר</span>;
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
            setActiveView(viewName);
          }}
          className={`flex items-center gap-3 text-lg font-semibold p-3 rounded-lg transition-colors ${isActive ? 'text-blue-700 bg-blue-100' : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'}`}
        >
          {icon}
          {children}
        </a>
      </li>
    );
  };

  const DashboardContent: React.FC = () => (
    <>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">לוח בקרה</h1>
          <p className="text-gray-500 mt-1">ניהול משרות ומועמדים בקלות וביעילות.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
            <PlusCircleIcon className="w-6 h-6" />
            <span>פרסם משרה חדשה</span>
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard title="משרות פעילות" value={jobs.length.toString()} icon={<BriefcaseIcon className="w-6 h-6 text-blue-600" />} />
        <StatCard title="מועמדים חדשים" value="12" icon={<UserIcon className="w-6 h-6 text-blue-600" />} />
        <StatCard title="תשלומים החודש" value="3,200 ₪" icon={<DollarSignIcon className="w-6 h-6 text-blue-600" />} />
      </section>

      <section className="bg-white p-6 rounded-xl shadow-md mb-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4">המשרות שפרסמתי</h2>
        {jobs.length === 0 ? (
          <div className="text-center py-10">
            <BriefcaseIcon className="w-16 h-16 mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-700">עדיין לא פרסמת משרות</h3>
            <p className="mt-1 text-gray-500">לחץ על 'פרסם משרה חדשה' כדי להתחיל.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <PostedJobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">מועמדים אחרונים</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="border-b-2 border-gray-100">
              <tr>
                <th className="p-3 text-sm font-semibold tracking-wide text-gray-500">שם</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-gray-500">משרה</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-gray-500">סטטוס</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-gray-500">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map(applicant => (
                <tr key={applicant.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img src={applicant.profileImageUrl} alt={applicant.name} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-bold text-gray-800">{applicant.name}</p>
                        <p className="text-sm text-gray-500">גיל {applicant.age}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap text-gray-700">{applicant.jobTitle}</td>
                  <td className="p-4 whitespace-nowrap">{getStatusChip(applicant.status)}</td>
                  <td className="p-4 whitespace-nowrap">
                    <button className="text-blue-600 font-semibold hover:underline">צפה בפרופיל</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'profile':
        return <EmployerProfilePage onSave={() => setActiveView('dashboard')} />;
      case 'dashboard':
      default:
        return <div className="animate-in fade-in-0 duration-500"><DashboardContent /></div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {isModalOpen && <PostJobModal onClose={() => setIsModalOpen(false)} onPostJob={handlePostJob} employerProfile={employerProfile} />}
      <nav className="w-64 bg-white p-6 shadow-lg flex-shrink-0 hidden md:flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <img src={employerProfile?.profileImageUrl || employerProfile?.companyLogoUrl || "https://picsum.photos/id/1040/100/100"} alt="לוגו חברה" className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover" />
          <div>
            <h2 className="font-bold text-gray-800">{employerProfile?.companyName || "החברה שלי"}</h2>
            <p className="text-sm text-gray-500">my-company.com</p>
          </div>
        </div>
        <ul className="space-y-4">
          <NavLink viewName="dashboard" icon={<HomeIcon className="w-6 h-6" />}>לוח בקרה</NavLink>
          <NavLink viewName="profile" icon={<SettingsIcon className="w-6 h-6" />}>הגדרות פרופיל</NavLink>
        </ul>
        <div className="mt-auto">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-300"
          >
            <LogOutIcon className="w-5 h-5" />
            <span>התנתקות</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 p-6 md:p-10">
        {renderContent()}
      </main>
    </div>
  );
};

export default EmployerDashboard;