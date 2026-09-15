import React, { useState } from 'react';
import type { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import LegalModal from '@/components/LegalModal';
import { isYouthAge, YOUTH_AGE_ERROR, TERMS_VERSION, dobBounds } from '@/utils/age';
import { LogOutIcon, UserIcon } from '@/components/icons';

interface Props {
  user: User;
}

/** Mandatory gate when a teen account lacks birthDate (e.g. Google signup race / legacy). */
const DOB = dobBounds();

const TeenComplianceCompletion: React.FC<Props> = ({ user }) => {
  const [birthDate, setBirthDate] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!birthDate || !isYouthAge(birthDate)) {
      setError(YOUTH_AGE_ERROR);
      return;
    }
    if (!parentName.trim() || !parentEmail.trim() || !parentPhone.trim()) {
      setError('נא למלא שם, אימייל וטלפון של הורה / אפוטרופוס.');
      return;
    }
    if (!acceptedTerms) {
      setError('יש לאשר את תקנון השימוש ומדיניות הפרטיות.');
      return;
    }
    setIsLoading(true);
    try {
      // age/parentalConsentStatus are server-managed (rules lock them; the approval trigger sets pending).
      await setDoc(doc(db, 'users', user.uid), {
        birthDate,
        parentName: parentName.trim(),
        parentEmail: parentEmail.trim(),
        parentPhone: parentPhone.trim(),
        termsAcceptedAt: serverTimestamp(),
        termsVersion: TERMS_VERSION,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      const approvalRef = doc(collection(db, 'parentalApprovals'));
      await setDoc(approvalRef, {
        token: approvalRef.id,
        teenUid: user.uid,
        teenName: user.displayName || '',
        teenEmail: user.email,
        parentName: parentName.trim(),
        parentEmail: parentEmail.trim(),
        parentPhone: parentPhone.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      setError(err.message || 'שמירה נכשלה. נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-purple-100 rounded-full mb-4">
            <UserIcon className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">השלמת פרטי הרשמה</h1>
          <p className="mt-2 text-sm text-gray-600">
            לפני השימוש בפלטפורמה יש למלא תאריך לידה ופרטי הורה, ולאשר את התקנון.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="dob-complete" className="block text-sm font-medium text-gray-700">תאריך לידה</label>
            <input id="dob-complete" type="date" required min={DOB.min} max={DOB.max} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label htmlFor="pn-complete" className="block text-sm font-medium text-gray-700">שם הורה</label>
            <input id="pn-complete" type="text" required value={parentName} onChange={(e) => setParentName(e.target.value)} className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label htmlFor="pe-complete" className="block text-sm font-medium text-gray-700">אימייל הורה</label>
            <input id="pe-complete" type="email" required value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label htmlFor="pp-complete" className="block text-sm font-medium text-gray-700">טלפון הורה</label>
            <input id="pp-complete" type="tel" required value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500" dir="ltr" />
          </div>
          <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500" required />
            <span>
              קראתי ואני מסכים/ה ל
              <button type="button" onClick={() => setLegalModal('terms')} className="text-purple-600 hover:underline mx-1 font-semibold">תקנון השימוש</button>
              ו־
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline mx-1 font-semibold">מדיניות הפרטיות</a>
            </span>
          </label>
          {error && <p role="alert" className="text-sm text-red-600 text-center">{error}</p>}
          <button type="submit" disabled={isLoading} className="w-full py-3 px-4 rounded-lg font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50">
            {isLoading ? 'שומר...' : 'המשך'}
          </button>
        </form>
        <button onClick={() => signOut(auth)} className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
          <LogOutIcon className="w-5 h-5" />
          התנתקות
        </button>
      </div>
      {legalModal && <LegalModal initialTab={legalModal} onClose={() => setLegalModal(null)} />}
    </div>
  );
};

export default TeenComplianceCompletion;
