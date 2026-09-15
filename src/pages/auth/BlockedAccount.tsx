import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import { LogOutIcon, AlertTriangleIcon } from '@/components/icons';

/** Shown when users/{uid}.status === 'blocked'. Rules deny every write for blocked accounts. */
const BlockedAccount: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg text-center">
      <div className="flex flex-col items-center">
        <div className="p-3 bg-red-100 rounded-full mb-4">
          <AlertTriangleIcon className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">החשבון חסום</h1>
        <p className="mt-2 text-gray-600">
          החשבון נחסם על ידי צוות TeenWork. לא ניתן להגיש מועמדות, לפרסם משרות או לשלוח הודעות.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          לבירור ניתן לפנות אל <a href="mailto:support@teensworks.com" className="text-purple-600 underline">support@teensworks.com</a>.
        </p>
      </div>
      <button
        onClick={() => signOut(auth)}
        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
      >
        <LogOutIcon className="w-5 h-5" />
        התנתקות
      </button>
    </div>
  </div>
);

export default BlockedAccount;
