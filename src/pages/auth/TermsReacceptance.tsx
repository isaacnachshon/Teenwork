import React, { useState } from 'react';
import type { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import LegalModal from '@/components/LegalModal';
import { TERMS_VERSION } from '@/utils/youthLaw';
import { LogOutIcon, ScaleIcon } from '@/components/icons';

interface Props {
  user: User;
  role: 'teen' | 'employer';
}

/** Gate shown when users/{uid}.termsVersion !== TERMS_VERSION. Writes only self-writable keys. */
const TermsReacceptance: React.FC<Props> = ({ user, role }) => {
  const [accepted, setAccepted] = useState(false);
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) {
      setError('יש לאשר את התקנון ומדיניות הפרטיות המעודכנים.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await setDoc(doc(db, 'users', user.uid), {
        termsVersion: TERMS_VERSION,
        termsAcceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err: any) {
      setError(err?.message || 'השמירה נכשלה. נסה שוב.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-purple-100 rounded-full mb-4">
            <ScaleIcon className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">עדכון תקנון ומדיניות פרטיות</h1>
          <p className="mt-2 text-sm text-gray-600">
            עדכנו את התנאים (גרסה {TERMS_VERSION}). כדי להמשיך יש לקרוא ולאשר אותם מחדש.
          </p>
        </div>

        <ul className="text-sm text-gray-700 space-y-2 list-disc pr-5">
          {role === 'teen' ? (
            <>
              <li>הרשמת נער/ה מותנית באישור הורה/אפוטרופוס שמאומת בטלפון.</li>
              <li>ההורה מקבל עדכון על כל מועמדות שמוגשת.</li>
              <li>בני 14 רשאים לעבוד בעבודות קלות בחופשות הלימודים הרשמיות בלבד.</li>
              <li>למעסיק נחשפים רק שם, אודות, כישורים, עיר, גיל וסטטוס אישור הורים.</li>
            </>
          ) : (
            <>
              <li>כל משרה חייבת לעמוד בחוק עבודת הנוער: שכר מינימום לפי גיל, עד 8 שעות ביום, ללא עבודת לילה ושבת.</li>
              <li>לפני תחילת העסקה: טופס 101, צילום ת״ז, אישור רפואי, הודעה בכתב על תנאי העסקה תוך 7 ימים.</li>
              <li>תלוש שכר חודשי וביטוח לאומי ללא ניכוי מהנער/ה.</li>
            </>
          )}
        </ul>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500" required />
            <span>
              קראתי ואני מסכים/ה ל
              <button type="button" onClick={() => setLegalModal('terms')} className="text-purple-600 hover:underline mx-1 font-semibold">תקנון השימוש</button>
              ו־
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline mx-1 font-semibold">מדיניות הפרטיות</a>
            </span>
          </label>
          {error && <p role="alert" className="text-sm text-red-600 text-center">{error}</p>}
          <button type="submit" disabled={saving} className="w-full py-3 px-4 rounded-lg font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'שומר...' : 'אישור והמשך'}
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

export default TermsReacceptance;
