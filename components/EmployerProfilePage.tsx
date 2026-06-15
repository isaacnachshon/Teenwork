import React, { useState, useEffect } from 'react';
import { BuildingIcon, CreditCardIcon, MapPinIcon, PencilIcon, UserIcon } from './icons';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface EmployerProfilePageProps {
    onSave: () => void;
}

// Default profile structure
const defaultProfile = {
    fullName: '',
    idNumber: '',
    email: '',
    phone: '',
    companyName: '',
    companyAddress: '',
    companyDescription: '',
    profileImageUrl: '',
};

const FormRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 items-center ${className}`}>
        {children}
    </div>
);

const FormLabel: React.FC<{ htmlFor: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ htmlFor, children, icon }) => (
    <label htmlFor={htmlFor} className="text-gray-600 font-semibold flex items-center gap-2">
        {icon}
        {children}
    </label>
);

const FormInput: React.FC<{ id: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string, readOnly?: boolean }> = ({ id, type = "text", value, onChange, placeholder, readOnly = false }) => (
    <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`md:col-span-2 w-full p-3 border rounded-lg transition-colors ${readOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
    />
);


const EmployerProfilePage: React.FC<EmployerProfilePageProps> = ({ onSave }) => {
    const [profile, setProfile] = useState(defaultProfile);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch employer profile from Firestore on mount
    useEffect(() => {
        const fetchProfile = async () => {
            const user = auth.currentUser;
            if (!user) {
                console.error('No authenticated user found');
                setIsLoading(false);
                return;
            }

            try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setProfile({
                        fullName: userData.fullName || '',
                        idNumber: userData.idNumber || '',
                        email: userData.email || user.email || '',
                        phone: userData.phone || '',
                        companyName: userData.companyName || '',
                        companyAddress: userData.companyAddress || '',
                        companyDescription: userData.companyDescription || '',
                        profileImageUrl: userData.companyLogoUrl || userData.profileImageUrl || 'https://picsum.photos/id/1040/200/200',
                    });
                } else {
                    // If no profile exists, populate with basic user info
                    setProfile({
                        ...defaultProfile,
                        email: user.email || '',
                    });
                }
            } catch (error) {
                console.error('Error fetching employer profile:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setProfile(prev => ({ ...prev, [id]: value }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const user = auth.currentUser;
        if (!user) {
            console.error('No authenticated user found');
            return;
        }

        try {
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, {
                fullName: profile.fullName,
                idNumber: profile.idNumber,
                email: profile.email,
                phone: profile.phone,
                companyName: profile.companyName,
                companyAddress: profile.companyAddress,
                companyDescription: profile.companyDescription,
                role: 'employer',
                uid: user.uid,
            }, { merge: true });

            console.log("Employer profile saved successfully");
            onSave();
        } catch (error) {
            console.error('Error saving employer profile:', error);
            alert('שגיאה בשמירת הפרופיל. נסה שוב.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-xl font-semibold text-gray-700">טוען פרופיל...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in-0 duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">הגדרות פרופיל</h1>
                <p className="text-gray-500 mt-1">נהל את הפרטים האישיים ופרטי החברה שלך.</p>
            </header>

            <form onSubmit={handleFormSubmit} className="space-y-10">
                {/* Personal Details Section */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">פרטים אישיים</h2>
                    <div className="space-y-4">
                        <FormRow>
                            <FormLabel htmlFor="fullName" icon={<UserIcon className="w-5 h-5 text-gray-400" />}>שם מלא</FormLabel>
                            <FormInput id="fullName" value={profile.fullName} onChange={handleInputChange} />
                        </FormRow>
                        <FormRow>
                            <FormLabel htmlFor="idNumber" icon={<CreditCardIcon className="w-5 h-5 text-gray-400" />}>תעודת זהות</FormLabel>
                            <FormInput id="idNumber" value={profile.idNumber} onChange={handleInputChange} />
                        </FormRow>
                        <FormRow>
                            <FormLabel htmlFor="email" icon={<UserIcon className="w-5 h-5 text-gray-400" />}>אימייל</FormLabel>
                            <FormInput id="email" type="email" value={profile.email} onChange={handleInputChange} readOnly />
                        </FormRow>
                        <FormRow>
                            <FormLabel htmlFor="phone" icon={<UserIcon className="w-5 h-5 text-gray-400" />}>טלפון</FormLabel>
                            <FormInput id="phone" type="tel" value={profile.phone} onChange={handleInputChange} />
                        </FormRow>
                    </div>
                </div>

                {/* Company Details Section */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">פרטי העסק</h2>
                    <div className="space-y-4">
                        <FormRow>
                            <FormLabel htmlFor="companyName" icon={<BuildingIcon className="w-5 h-5 text-gray-400" />}>שם החברה / עסק</FormLabel>
                            <FormInput id="companyName" value={profile.companyName} onChange={handleInputChange} />
                        </FormRow>
                        <FormRow>
                            <FormLabel htmlFor="companyAddress" icon={<MapPinIcon className="w-5 h-5 text-gray-400" />}>כתובת העסק</FormLabel>
                            <FormInput id="companyAddress" value={profile.companyAddress} onChange={handleInputChange} />
                        </FormRow>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6">
                            <FormLabel htmlFor="companyDescription" icon={<PencilIcon className="w-5 h-5 text-gray-400" />}>אודות החברה</FormLabel>
                            <textarea
                                id="companyDescription"
                                value={profile.companyDescription}
                                onChange={handleInputChange}
                                rows={4}
                                className="md:col-span-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 mt-8">
                    <button type="button" onClick={onSave} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                        ביטול
                    </button>
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        שמור שינויים
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EmployerProfilePage;