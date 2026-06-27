

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { LogOutIcon, UserPlusIcon, TrashIcon, PencilIcon, XIcon, MailIcon } from '@/components/icons';
import { db, firebaseConfig } from '@/firebase';
import { collection, query, where, getDocs, doc, deleteDoc, setDoc, Timestamp } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp, deleteApp, FirebaseApp } from 'firebase/app';


interface AdminDashboardProps {
    onLogout: () => void;
}

interface ManagedUser {
    id: string; // uid
    name: string; // name or companyName
    email: string;
    createdAt: string; // Formatted date
}

const MONTHS_HE = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

function computeMonthlyCount(dates: Date[], nMonths: number): { name: string; count: number }[] {
    const now = new Date();
    return Array.from({ length: nMonths }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (nMonths - 1 - i), 1);
        const count = dates.filter(date => date?.getMonth() === d.getMonth() && date?.getFullYear() === d.getFullYear()).length;
        return { name: MONTHS_HE[d.getMonth()], count };
    });
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f'];

const AddUserModal: React.FC<{ onClose: () => void; onUserAdded: () => void; }> = ({ onClose, onUserAdded }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'teen' | 'employer'>('teen');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        // Create a temporary Firebase app instance to create user without logging out the admin
        const tempAppName = `user-creation-${Date.now()}`;
        let tempApp: FirebaseApp | undefined;

        try {
            tempApp = initializeApp(firebaseConfig, tempAppName);
            const tempAuth = getAuth(tempApp);

            const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
            const user = userCredential.user;

            const userData = {
                uid: user.uid,
                email: user.email,
                role: role,
                createdAt: new Date(),
                ...(role === 'teen' ? { name: name } : { companyName: name }),
            };

            await setDoc(doc(db, "users", user.uid), userData);

            onUserAdded();
            onClose();

        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError('כתובת אימייל זו כבר קיימת במערכת.');
            } else if (err.code === 'auth/weak-password') {
                setError('הסיסמה צריכה להכיל לפחות 6 תווים.');
            } else {
                setError('אירעה שגיאה ביצירת המשתמש.');
                console.error(err);
            }
        } finally {
            setIsSubmitting(false);
            if (tempApp) {
                await deleteApp(tempApp);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">הוספת משתמש חדש</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">סוג משתמש</label>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setRole('teen')} className={`flex-1 p-2 rounded-lg border-2 font-semibold ${role === 'teen' ? 'bg-purple-100 border-purple-500 text-purple-700' : 'border-gray-300'}`}>נער/ה</button>
                            <button type="button" onClick={() => setRole('employer')} className={`flex-1 p-2 rounded-lg border-2 font-semibold ${role === 'employer' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-gray-300'}`}>מעסיק/ה</button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">{role === 'teen' ? 'שם מלא' : 'שם החברה'}</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-lg" />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg font-semibold">ביטול</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300">
                            {isSubmitting ? 'יוצר משתמש...' : 'צור משתמש'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditUserModal: React.FC<{ user: ManagedUser; role: 'teen' | 'employer'; onClose: () => void; onUserUpdated: () => void; }> = ({ user, role, onClose, onUserUpdated }) => {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const userData = {
                email: email,
                ...(role === 'teen' ? { name: name } : { companyName: name }),
            };

            await setDoc(doc(db, "users", user.id), userData, { merge: true });
            onUserUpdated();
            onClose();
        } catch (err) {
            console.error("Error updating user:", err);
            setError('שגיאה בעדכון הפרטים');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">עריכת משתמש</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">{role === 'teen' ? 'שם מלא' : 'שם החברה'}</label>
                        <input type="text" id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">אימייל (לצפייה בלבד)</label>
                        <input type="email" id="edit-email" value={email} disabled className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed" />
                        <p className="text-xs text-gray-500 mt-1">לא ניתן לשנות אימייל כאן (דורש שינוי ב-Authentication).</p>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg font-semibold">ביטול</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300">
                            {isSubmitting ? 'שמור שינויים' : 'שמור'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};



const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="font-bold text-lg text-gray-700 mb-4">{title}</h3>
        <div style={{ width: '100%', height: 300 }}>
            {children}
        </div>
    </div>
);

const UserTable: React.FC<{ users: ManagedUser[], isLoading: boolean, onDelete: (userId: string, name: string) => void; onEdit: (user: ManagedUser) => void }> = ({ users, isLoading, onDelete, onEdit }) => {
    if (isLoading) {
        return <div className="text-center py-8">טוען משתמשים...</div>;
    }
    if (users.length === 0) {
        return <div className="text-center py-8 text-gray-500">לא נמצאו משתמשים.</div>
    }
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-right">
                <thead className="border-b-2 border-gray-100 bg-gray-50">
                    <tr>
                        <th className="p-3 text-sm font-semibold tracking-wide text-gray-500">מזהה</th>
                        <th className="p-3 text-sm font-semibold tracking-wide text-gray-500">ספקים</th>
                        <th className="p-3 text-sm font-semibold tracking-wide text-gray-500">תאריך יצירה</th>
                        <th className="p-3 text-sm font-semibold tracking-wide text-gray-500">מזהה משתמש (UID)</th>
                        <th className="p-3 text-sm font-semibold tracking-wide text-gray-500">פעולות</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                            <td className="p-3 whitespace-nowrap">
                                <div className="font-semibold text-gray-800">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                            </td>
                            <td className="p-3 whitespace-nowrap text-gray-600">
                                <MailIcon className="w-5 h-5 text-gray-400" />
                            </td>
                            <td className="p-3 whitespace-nowrap text-gray-600">{user.createdAt}</td>
                            <td className="p-3 whitespace-nowrap text-gray-600 font-mono text-xs" title={user.id}>
                                {user.id}
                            </td>
                            <td className="p-3 whitespace-nowrap">
                                <div className="flex gap-4">
                                    <button onClick={() => onEdit(user)} className="text-gray-500 hover:text-blue-600 flex items-center gap-1 text-sm">
                                        <PencilIcon className="w-4 h-4" /> ערוך
                                    </button>
                                    <button onClick={() => onDelete(user.id, user.name)} className="text-gray-500 hover:text-red-600 flex items-center gap-1 text-sm">
                                        <TrashIcon className="w-4 h-4" /> מחק
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const [teens, setTeens] = useState<ManagedUser[]>([]);
    const [employers, setEmployers] = useState<ManagedUser[]>([]);
    const [jobsCount, setJobsCount] = useState<number | null>(null);
    const [applicationsCount, setApplicationsCount] = useState<number | null>(null);
    const [userGrowthData, setUserGrowthData] = useState<{ name: string; count: number }[]>([]);
    const [applicationsChartData, setApplicationsChartData] = useState<{ name: string; count: number }[]>([]);
    const [jobCategoryData, setJobCategoryData] = useState<{ name: string; value: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'teens' | 'employers'>('teens');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const teenQuery = query(collection(db, "users"), where("role", "==", "teen"));
            const employerQuery = query(collection(db, "users"), where("role", "==", "employer"));

            const [teenSnapshot, employerSnapshot, jobsSnapshot, appsSnapshot] = await Promise.all([
                getDocs(teenQuery),
                getDocs(employerQuery),
                getDocs(collection(db, "jobs")),
                getDocs(collection(db, "applications")),
            ]);

            setJobsCount(jobsSnapshot.size);
            setApplicationsCount(appsSnapshot.size);

            // Compute user growth chart from real registration dates
            const allUserDates = [
                ...teenSnapshot.docs.map(d => (d.data().createdAt as Timestamp)?.toDate()),
                ...employerSnapshot.docs.map(d => (d.data().createdAt as Timestamp)?.toDate()),
            ].filter(Boolean) as Date[];
            setUserGrowthData(computeMonthlyCount(allUserDates, 7));

            // Compute job category pie chart from real job types
            const categoryMap: Record<string, number> = {};
            jobsSnapshot.docs.forEach(d => {
                const type: string = d.data().type || 'אחר';
                categoryMap[type] = (categoryMap[type] || 0) + 1;
            });
            setJobCategoryData(Object.entries(categoryMap).map(([name, value]) => ({ name, value })));

            // Compute applications bar chart from real application dates
            const appDates = appsSnapshot.docs.map(d => (d.data().createdAt as Timestamp)?.toDate()).filter(Boolean) as Date[];
            setApplicationsChartData(computeMonthlyCount(appDates, 7));

            const teensList = teenSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name,
                    email: data.email,
                    createdAt: (data.createdAt as Timestamp)?.toDate().toLocaleDateString('he-IL') || 'N/A'
                };
            });

            const employersList = employerSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.companyName,
                    email: data.email,
                    createdAt: (data.createdAt as Timestamp)?.toDate().toLocaleDateString('he-IL') || 'N/A'
                };
            });
            setTeens(teensList);
            setEmployers(employersList);

        } catch (error) {
            console.error("Error fetching users: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId: string, name: string) => {
        if (window.confirm(`האם אתה בטוח שברצונך למחוק את ${name}? פעולה זו תמחק את נתוני המשתמש מהאפליקציה, אך לא תמחק את חשבון ההתחברות שלו מ-Firebase Authentication.`)) {
            try {
                await deleteDoc(doc(db, "users", userId));
                fetchUsers(); // Refresh the list
            } catch (error) {
                console.error("Error removing document: ", error);
                alert("שגיאה במחיקת המשתמש.");
            }
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen p-6 md:p-10">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">לוח בקרה - מנהל</h1>
                    <p className="text-gray-500 mt-1">סקירה כללית של ביצועי האפליקציה.</p>
                </div>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg font-semibold shadow-sm hover:bg-gray-100 transition-colors duration-300"
                >
                    <LogOutIcon className="w-5 h-5" />
                    <span>התנתקות</span>
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
                        <div>
                            <p className="text-gray-500">סה"כ משתמשים</p>
                            <p className="text-3xl font-bold text-gray-800">{teens.length + employers.length}</p>
                        </div>
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                            <UserPlusIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
                        <div>
                            <p className="text-gray-500">סה"כ משרות</p>
                            <p className="text-3xl font-bold text-gray-800">{jobsCount ?? '...'}</p>
                        </div>
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                            <UserPlusIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
                        <div>
                            <p className="text-gray-500">סה"כ מועמדויות</p>
                            <p className="text-3xl font-bold text-gray-800">{applicationsCount ?? '...'}</p>
                        </div>
                        <div className="p-3 bg-green-100 text-green-600 rounded-full">
                            <UserPlusIcon className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <ChartContainer title="צמיחת משתמשים">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={userGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke="#8884d8" name="משתמשים חדשים" />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <ChartContainer title="מועמדויות חודשיות">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={applicationsChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#82ca9d" name="מועמדויות" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartContainer title="קטגוריות משרות פופולריות">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={jobCategoryData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" label={(entry: { name: string }) => entry.name}>
                                {jobCategoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-gray-700">ניהול משתמשים</h3>
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-semibold hover:bg-blue-700">
                            <UserPlusIcon className="w-5 h-5" />
                            הוסף משתמש
                        </button>
                    </div>
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex gap-6" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('teens')}
                                className={`shrink-0 border-b-2 py-4 px-1 text-sm font-medium ${activeTab === 'teens' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                ניהול נוער ({teens.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('employers')}
                                className={`shrink-0 border-b-2 py-4 px-1 text-sm font-medium ${activeTab === 'employers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                ניהול מעסיקים ({employers.length})
                            </button>
                        </nav>
                    </div>
                    <div className="mt-4">
                        {activeTab === 'teens' ? (
                            <UserTable users={teens} isLoading={isLoading} onDelete={handleDeleteUser} onEdit={setEditingUser} />
                        ) : (
                            <UserTable users={employers} isLoading={isLoading} onDelete={handleDeleteUser} onEdit={setEditingUser} />
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && <AddUserModal onClose={() => setIsModalOpen(false)} onUserAdded={fetchUsers} />}
            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    role={activeTab === 'teens' ? 'teen' : 'employer'}
                    onClose={() => setEditingUser(null)}
                    onUserUpdated={fetchUsers}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
