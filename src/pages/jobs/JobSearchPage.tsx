import React, { useEffect, useState } from 'react';
import type { Job } from '@/types';
import { auth, db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import JobsPage from './JobsPage';
import JobDetailPage from './JobDetailPage';

export default function JobSearchPage() {
  const [selected, setSelected] = useState<Job | null>(null);
  const [location, setLocation] = useState<{lat:number;lng:number} | null>(null);
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    let active = true;
    if (uid) getDoc(doc(db, 'users', uid)).then(snap => {
      const coords = snap.data()?.coordinates;
      if (active && Number.isFinite(coords?.lat) && Number.isFinite(coords?.lng)) setLocation(coords);
    }).catch(() => { /* Search remains available without distance sorting. */ });
    return () => { active = false; };
  }, []);
  return <section className="p-6 md:p-10">
    <div hidden={!!selected}><JobsPage onViewJobDetails={setSelected} userLocation={location || undefined} /></div>
    {selected && <JobDetailPage key={selected.id} job={selected} onBack={() => setSelected(null)} userLocation={location} />}
  </section>;
}
