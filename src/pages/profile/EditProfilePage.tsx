import React, { useState, useRef } from 'react';
import { MapPinIcon, PencilIcon, XIcon, PlusCircleIcon, UploadIcon, FileTextIcon, CheckCircleIcon } from '@/components/icons';
import type { TeenProfile, Job } from '@/types';
import { storage, auth } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface EditProfilePageProps {
    userProfile: TeenProfile;
    onSave: (updatedProfile: TeenProfile) => void;
    onCancel: () => void;
}

// Predefined lists for selection
const ALL_JOB_TYPES: Job['type'][] = ['קייטרינג', 'ניקיון', 'בייביסיטר', 'שיעורים', 'מלצרות', 'סבלות'];

const COMMON_SKILLS = [
    'שירות לקוחות',
    'עבודת צוות',
    'אנגלית',
    'בישול',
    'ניקיון',
    'טיפול בילדים',
    'הוראה',
    'מחשבים',
    'תקשורת',
    'אחריות',
    'סבלנות',
    'גמישות',
    'זריזות',
    'יצירתיות',
    'ארגון',
];

const EditProfilePage: React.FC<EditProfilePageProps> = ({ userProfile, onSave, onCancel }) => {
    const [formData, setFormData] = useState<TeenProfile>({
        ...userProfile,
        preferredJobTypes: userProfile.preferredJobTypes || [],
    });
    const [newSkill, setNewSkill] = useState('');
    const [uploadingConsent, setUploadingConsent] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const consentInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profileImageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConsentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadingConsent(true);
            try {
                const user = auth.currentUser;
                if (!user) return;
                const storageRef = ref(storage, `parental_consents/${user.uid}/${file.name}`);
                await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(storageRef);

                setFormData(prev => ({
                    ...prev,
                    parentalConsentUrl: downloadURL,
                    parentalConsentUploadedAt: new Date().toISOString(),
                    parentalConsentStatus: 'pending',
                }));
            } catch (error) {
                console.error("Error uploading consent form:", error);
                alert("שגיאה בהעלאת הקובץ. נסה שוב.");
            } finally {
                setUploadingConsent(false);
            }
        }
    };

    const handleAddSkill = () => {
        const trimmedSkill = newSkill.trim();
        if (trimmedSkill && !formData.skills.includes(trimmedSkill)) {
            setFormData(prev => ({ ...prev, skills: [...prev.skills, trimmedSkill] }));
            setNewSkill('');
        }
    };

    const handleAddPredefinedSkill = (skill: string) => {
        if (!formData.skills.includes(skill)) {
            setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setFormData(prev => ({ ...prev, skills: prev.skills.filter(skill => skill !== skillToRemove) }));
    };

    const handleToggleJobType = (jobType: Job['type']) => {
        setFormData(prev => {
            const currentTypes = prev.preferredJobTypes || [];
            if (currentTypes.includes(jobType)) {
                return { ...prev, preferredJobTypes: currentTypes.filter(t => t !== jobType) };
            } else {
                return { ...prev, preferredJobTypes: [...currentTypes, jobType] };
            }
        });
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in-0 duration-500">
            <form onSubmit={handleFormSubmit}>
                <header className="bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row items-center gap-6 mb-8">
                    <div className="relative">
                        <img src={formData.profileImageUrl} alt={formData.name} className="w-32 h-32 rounded-full border-4 border-purple-500 object-cover" />
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                            accept="image/png, image/jpeg, image/webp"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            aria-label="Change profile picture"
                        >
                            <PencilIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="text-center sm:text-right flex-grow">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">שם מלא</label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="text-3xl font-bold text-gray-800 bg-transparent border-b-2 border-gray-200 focus:border-purple-500 focus:outline-none w-full"
                        />
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mt-2">מיקום</label>
                        <div className="flex items-center justify-center sm:justify-start gap-1 text-gray-500 mt-1">
                            <MapPinIcon className="w-4 h-4" />
                            <input
                                id="location"
                                type="text"
                                value={formData.location}
                                onChange={handleInputChange}
                                className="bg-transparent border-b-2 border-gray-200 focus:border-purple-500 focus:outline-none w-full"
                                placeholder="הזן מיקום או לחץ על הכפתור"
                            />
                        </div>
                    </div>
                </header>

                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">טלפון</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone || ''}
                                    onChange={handleInputChange}
                                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="052-1234567"
                                />
                            </div>
                            <div>
                                <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700">מספר זהות</label>
                                <input
                                    id="idNumber"
                                    type="text"
                                    value={formData.idNumber || ''}
                                    onChange={handleInputChange}
                                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="123456789"
                                />
                            </div>
                            <div>
                                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">תאריך לידה</label>
                                <input
                                    id="birthDate"
                                    type="date"
                                    value={formData.birthDate || ''}
                                    onChange={handleInputChange}
                                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="school" className="block text-sm font-medium text-gray-700">בית ספר</label>
                                <input
                                    id="school"
                                    type="text"
                                    value={formData.school || ''}
                                    onChange={handleInputChange}
                                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="שם בית ספר"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label htmlFor="studyStatus" className="block text-sm font-medium text-gray-700">סטטוס לימודים</label>
                                <input
                                    id="studyStatus"
                                    type="text"
                                    value={formData.studyStatus || ''}
                                    onChange={handleInputChange}
                                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="לומד / נוער עובד / חופשה"
                                />
                            </div>
                        </div>
                        <div className="flex justify-center mt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition(async (position) => {
                                            const { latitude, longitude } = position.coords;

                                            // Update coordinates immediately
                                            setFormData(prev => ({
                                                ...prev,
                                                coordinates: { lat: latitude, lng: longitude }
                                            }));

                                            // Try to get city name
                                            try {
                                                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                                                const data = await response.json();
                                                const city = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality;
                                                if (city) {
                                                    setFormData(prev => ({ ...prev, location: city }));
                                                }
                                            } catch (error) {
                                                console.error("Error fetching address:", error);
                                            }
                                        }, (error) => {
                                            console.error("Error getting location:", error);
                                            alert("לא ניתן לאתר את מיקום שלך. אנא וודא שהמיקום מאופשר בדפדפן.");
                                        });
                                    } else {
                                        alert("הדפדפן שלך לא תומך באיתור מיקום.");
                                    }
                                }}
                                className="bg-purple-100 text-purple-700 p-2 rounded-full hover:bg-purple-200 transition-colors"
                                title="השתמש במיקום הנוכחי"
                            >
                                <MapPinIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">כתובת מלאה</label>
                                <input
                                    id="address"
                                    type="text"
                                    value={formData.address || ''}
                                    onChange={handleInputChange}
                                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="רחוב, מספר, עיר"
                                />
                            </div>
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">עיר</label>
                                <input
                                    id="city"
                                    type="text"
                                    value={formData.city || ''}
                                    onChange={handleInputChange}
                                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="תל אביב"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="paymentInfo" className="block text-sm font-medium text-gray-700">פרטי תשלום (ביט / חשבון בנק)</label>
                            <input
                                id="paymentInfo"
                                type="text"
                                value={formData.paymentInfo || ''}
                                onChange={handleInputChange}
                                className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                placeholder="לדוגמה: bit 0521234567 או מספר חשבון"
                            />
                        </div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">שם בנק</label>
                                <input
                                    id="bankName"
                                    type="text"
                                    value={formData.bankName || ''}
                                    onChange={handleInputChange}
                                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="בנק הפועלים"
                                />
                            </div>
                            <div>
                                <label htmlFor="bankBranch" className="block text-sm font-medium text-gray-700">סניף</label>
                                <input
                                    id="bankBranch"
                                    type="text"
                                    value={formData.bankBranch || ''}
                                    onChange={handleInputChange}
                                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="123"
                                />
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-gray-700">מספר חשבון</label>
                                <input
                                    id="bankAccountNumber"
                                    type="text"
                                    value={formData.bankAccountNumber || ''}
                                    onChange={handleInputChange}
                                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="123456"
                                />
                            </div>
                            <div>
                                <label htmlFor="bankId" className="block text-sm font-medium text-gray-700">קוד בנק</label>
                                <input
                                    id="bankId"
                                    type="text"
                                    value={formData.bankId || ''}
                                    onChange={handleInputChange}
                                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="01"
                                />
                            </div>
                        </div>
                    </div>

                <div className="space-y-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <label htmlFor="bio" className="text-xl font-bold text-gray-800 mb-3 block">קצת עליי</label>
                        <textarea
                            id="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            rows={5}
                            className="w-full text-gray-600 leading-relaxed p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        ></textarea>
                    </div>

                    {/* Parental Consent Section */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">אישור הורים</h2>
                        <p className="text-sm text-gray-500 mb-4">בני נוער מתחת לגיל 18 נדרשים להציג אישור הורים חתום.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label htmlFor="parentName" className="block text-sm font-medium text-gray-700">שם ההורה / האפוטרופוס</label>
                                <input
                                    id="parentName"
                                    type="text"
                                    value={formData.parentName || ''}
                                    onChange={handleInputChange}
                                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="שם ההורה"
                                />
                            </div>
                            <div>
                                <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700">טלפון הורה</label>
                                <input
                                    id="parentPhone"
                                    type="tel"
                                    value={formData.parentPhone || ''}
                                    onChange={handleInputChange}
                                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="052-7654321"
                                />
                            </div>
                            <div>
                                <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700">אימייל הורה</label>
                                <input
                                    id="parentEmail"
                                    type="email"
                                    value={formData.parentEmail || ''}
                                    onChange={handleInputChange}
                                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="dana@example.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="parentRelation" className="block text-sm font-medium text-gray-700">קשר להורה</label>
                                <input
                                    id="parentRelation"
                                    type="text"
                                    value={formData.parentRelation || ''}
                                    onChange={handleInputChange}
                                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="אימא / אב / אפוטרופוס"
                                />
                            </div>
                            <div>
                                <label htmlFor="parentAddress" className="block text-sm font-medium text-gray-700">כתובת הורה</label>
                                <input
                                    id="parentAddress"
                                    type="text"
                                    value={formData.parentAddress || ''}
                                    onChange={handleInputChange}
                                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    placeholder="רחוב, מספר, עיר"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                ref={consentInputRef}
                                onChange={handleConsentUpload}
                                className="hidden"
                                accept=".pdf,image/*"
                            />

                            <button
                                type="button"
                                onClick={() => consentInputRef.current?.click()}
                                disabled={uploadingConsent}
                                className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                            >
                                {uploadingConsent ? (
                                    <span className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></span>
                                ) : (
                                    <UploadIcon className="w-5 h-5" />
                                )}
                                <span>{formData.parentalConsentUrl ? 'החלף קובץ' : 'העלה אישור הורים'}</span>
                            </button>

                            {formData.parentalConsentUrl && (
                                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                                    <CheckCircleIcon className="w-5 h-5" />
                                    <span>הקובץ הועלה בהצלחה</span>
                                    <a href={formData.parentalConsentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mr-2 text-xs">
                                        (צפה בקובץ)
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preferred Job Types */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">סוגי עבודה שמעניינים אותי</h2>
                        <p className="text-sm text-gray-500 mb-4">בחר את סוגי העבודה שאתה מעוניין לעבוד בהם</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {ALL_JOB_TYPES.map(jobType => {
                                const isSelected = (formData.preferredJobTypes || []).includes(jobType);
                                return (
                                    <button
                                        key={jobType}
                                        type="button"
                                        onClick={() => handleToggleJobType(jobType)}
                                        className={`p-3 text-center rounded-lg border-2 transition-colors font-semibold ${isSelected
                                            ? 'bg-purple-100 border-purple-500 text-purple-700'
                                            : 'bg-white border-gray-300 hover:border-purple-400 text-gray-700'
                                            }`}
                                    >
                                        {jobType}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Skills Section */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">כישורים</h2>

                        {/* Selected Skills */}
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">הכישורים שלי:</h3>
                            <div className="flex flex-wrap gap-2">
                                {formData.skills.length === 0 ? (
                                    <p className="text-gray-400 text-sm">עדיין לא הוספת כישורים</p>
                                ) : (
                                    formData.skills.map(skill => (
                                        <span key={skill} className="flex items-center gap-2 bg-purple-100 text-purple-700 text-sm font-medium pl-3 pr-2 py-1 rounded-full">
                                            {skill}
                                            <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-purple-400 hover:text-purple-600">
                                                <XIcon className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Predefined Skills to Choose From */}
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">בחר מרשימת כישורים נפוצים:</h3>
                            <div className="flex flex-wrap gap-2">
                                {COMMON_SKILLS.filter(skill => !formData.skills.includes(skill)).map(skill => (
                                    <button
                                        key={skill}
                                        type="button"
                                        onClick={() => handleAddPredefinedSkill(skill)}
                                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-purple-100 hover:text-purple-700 transition-colors border border-gray-300 hover:border-purple-400"
                                    >
                                        + {skill}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Add Custom Skill */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">הוסף כישרון מותאם אישית:</h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    placeholder="כתוב כישרון חדש"
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                    className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                />
                                <button type="button" onClick={handleAddSkill} className="flex items-center gap-2 bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                                    <PlusCircleIcon className="w-5 h-5" />
                                    <span>הוסף</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                        ביטול
                    </button>
                    <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                        שמור שינויים
                    </button>
                </div>

                {/* Floating Save Button - appears on scroll */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <button
                        type="submit"
                        className="bg-purple-600 text-white font-bold py-4 px-8 rounded-full shadow-2xl hover:bg-purple-700 hover:shadow-purple-500/50 transition-all duration-300 flex items-center gap-2 border-2 border-purple-400"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>שמור שינויים</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfilePage;
