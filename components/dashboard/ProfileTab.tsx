import React, { useState, useEffect, useRef } from 'react';
import { DIcon } from './DashboardIcons';
import { DashRole, avatarGrad, initial } from './types';
import { auth, db, storage } from '../../firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Props {
  role: DashRole;
}

interface UserData {
  name?: string;
  displayName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  city?: string;
  birthDate?: string;
  school?: string;
  bio?: string;
  skills?: string[];
  profileImageUrl?: string;
  companyLogoUrl?: string;
  profileCompleted?: boolean;
}

const ProfileTab: React.FC<Props> = ({ role }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<UserData>({});
  const [newSkill, setNewSkill] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const uid = auth?.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;
    getDoc(doc(db, 'users', uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data() as UserData;
        setUserData(data);
        setForm(data);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [uid]);

  const handleSave = async () => {
    if (!uid) return;
    setSaving(true);
    try {
      const updates: Record<string, any> = {
        updatedAt: serverTimestamp(),
      };
      if (role === 'teen') {
        updates.name = form.name || '';
        updates.phone = form.phone || '';
        updates.city = form.city || '';
        updates.birthDate = form.birthDate || '';
        updates.school = form.school || '';
        updates.bio = form.bio || '';
        updates.skills = form.skills || [];
      } else if (role === 'employer') {
        updates.companyName = form.companyName || '';
        updates.phone = form.phone || '';
        updates.city = form.city || '';
      }

      const hasBasicFields = role === 'teen'
        ? !!(form.name && form.phone && form.city && form.birthDate)
        : !!(form.companyName && form.phone && form.city);
      updates.profileCompleted = hasBasicFields;

      await updateDoc(doc(db, 'users', uid), updates);
      setUserData({ ...userData, ...updates });
      setEditing(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !uid) return;
    const file = e.target.files[0];
    setUploadingImage(true);
    try {
      const path = role === 'employer' ? `companyLogos/${uid}` : `profileImages/teens/${uid}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      const field = role === 'employer' ? 'companyLogoUrl' : 'profileImageUrl';
      await updateDoc(doc(db, 'users', uid), { [field]: url, updatedAt: serverTimestamp() });
      setUserData(prev => prev ? { ...prev, [field]: url } : prev);
      setForm(prev => ({ ...prev, [field]: url }));
    } catch (err) {
      console.error('Failed to upload image:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (!s || (form.skills || []).includes(s)) return;
    setForm(prev => ({ ...prev, skills: [...(prev.skills || []), s] }));
    setNewSkill('');
  };

  const removeSkill = (skill: string) => {
    setForm(prev => ({ ...prev, skills: (prev.skills || []).filter(s => s !== skill) }));
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 16, color: '#8A93A3' }}>טוען פרופיל...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 16, color: '#8A93A3' }}>לא נמצא פרופיל</div>
      </div>
    );
  }

  const displayName = role === 'employer' ? (userData.companyName || userData.name || '') : (userData.name || userData.displayName || '');
  const imageUrl = role === 'employer' ? userData.companyLogoUrl : userData.profileImageUrl;
  const av = avatarGrad(displayName);
  const ini = initial(displayName);

  const completionFields = role === 'teen'
    ? [userData.name, userData.phone, userData.city, userData.birthDate, userData.school, userData.bio]
    : [userData.companyName, userData.phone, userData.city];
  const filled = completionFields.filter(Boolean).length;
  const completionPct = Math.round((filled / completionFields.length) * 100);

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '26px 30px 42px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 25, fontWeight: 800 }}>הפרופיל שלי</h1>
          <div style={{ marginTop: 5, fontSize: 14, color: '#8A93A3' }}>
            {role === 'teen' ? 'ניהול הפרופיל האישי שלך' : 'ניהול פרטי החברה'}
          </div>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#7B2FF6', color: '#fff', border: 'none', borderRadius: 12, padding: '11px 18px', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            {DIcon('user', { size: 18, color: '#fff' })}עריכת פרופיל
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <div style={{ position: 'relative' }}>
            {imageUrl ? (
              <img src={imageUrl} alt={displayName} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #E9D5FF' }} />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: av, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 28 }}>{ini}</div>
            )}
            {editing && (
              <>
                <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: -2, right: -2, width: 28, height: 28, borderRadius: '50%', background: '#7B2FF6', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {uploadingImage ? <span style={{ color: '#fff', fontSize: 10 }}>...</span> : DIcon('plus', { size: 14, color: '#fff' })}
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </>
            )}
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{displayName}</div>
            <div style={{ fontSize: 14, color: '#8A93A3' }}>{userData.email}</div>
            {userData.city && <div style={{ fontSize: 13, color: '#8A93A3', marginTop: 2 }}>{userData.city}</div>}
          </div>
        </div>

        {/* Completion Bar */}
        <div style={{ background: '#F8F9FB', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
            <span>השלמת פרופיל</span>
            <span style={{ color: completionPct === 100 ? '#0E8A48' : '#B5740A' }}>{completionPct}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: '#E6E8ED' }}>
            <div style={{ height: '100%', borderRadius: 3, background: completionPct === 100 ? '#0E8A48' : '#7B2FF6', width: `${completionPct}%`, transition: 'width .3s' }} />
          </div>
        </div>

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {role === 'teen' ? (
              <>
                <Field label="שם מלא" value={form.name || ''} onChange={v => setForm(p => ({ ...p, name: v }))} />
                <Field label="טלפון" value={form.phone || ''} onChange={v => setForm(p => ({ ...p, phone: v }))} type="tel" />
                <Field label="עיר" value={form.city || ''} onChange={v => setForm(p => ({ ...p, city: v }))} />
                <Field label="תאריך לידה" value={form.birthDate || ''} onChange={v => setForm(p => ({ ...p, birthDate: v }))} type="date" />
                <Field label="בית ספר" value={form.school || ''} onChange={v => setForm(p => ({ ...p, school: v }))} />
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A576E', marginBottom: 6 }}>אודות</label>
                  <textarea value={form.bio || ''} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} style={{ width: '100%', minHeight: 80, padding: '10px 14px', borderRadius: 10, border: '1px solid #E3E6EC', fontFamily: 'inherit', fontSize: 14, resize: 'vertical', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A576E', marginBottom: 6 }}>כישורים</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {(form.skills || []).map(s => (
                      <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F3ECFE', color: '#5A18C2', padding: '5px 10px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                        {s}
                        <button onClick={() => removeSkill(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>{DIcon('plus', { size: 12, color: '#5A18C2' })}</button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} placeholder="הוסף כישור..." style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #E3E6EC', fontFamily: 'inherit', fontSize: 13, outline: 'none' }} />
                    <button onClick={addSkill} style={{ padding: '8px 14px', borderRadius: 8, background: '#F3ECFE', color: '#5A18C2', border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>הוסף</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Field label="שם החברה" value={form.companyName || ''} onChange={v => setForm(p => ({ ...p, companyName: v }))} />
                <Field label="טלפון" value={form.phone || ''} onChange={v => setForm(p => ({ ...p, phone: v }))} type="tel" />
                <Field label="עיר" value={form.city || ''} onChange={v => setForm(p => ({ ...p, city: v }))} />
              </>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '12px 18px', borderRadius: 12, background: '#7B2FF6', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'שומר...' : 'שמור שינויים'}
              </button>
              <button onClick={() => { setEditing(false); setForm(userData); }} style={{ padding: '12px 18px', borderRadius: 12, background: '#fff', color: '#475067', border: '1px solid #E3E6EC', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                ביטול
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {role === 'teen' ? (
              <>
                <InfoField label="טלפון" value={userData.phone} />
                <InfoField label="עיר" value={userData.city} />
                <InfoField label="תאריך לידה" value={userData.birthDate} />
                <InfoField label="בית ספר" value={userData.school} />
                <div style={{ gridColumn: '1 / -1' }}>
                  <InfoField label="אודות" value={userData.bio} />
                </div>
                {(userData.skills || []).length > 0 && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: 12, color: '#8A93A3', fontWeight: 600, marginBottom: 6 }}>כישורים</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {userData.skills!.map(s => (
                        <span key={s} style={{ background: '#F3ECFE', color: '#5A18C2', padding: '5px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <InfoField label="שם החברה" value={userData.companyName} />
                <InfoField label="טלפון" value={userData.phone} />
                <InfoField label="עיר" value={userData.city} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string }> = ({ label, value, onChange, type = 'text' }) => (
  <div>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A576E', marginBottom: 6 }}>{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E3E6EC', fontFamily: 'inherit', fontSize: 14, outline: 'none' }} />
  </div>
);

const InfoField: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div style={{ background: '#F8F9FB', borderRadius: 10, padding: '10px 14px' }}>
    <div style={{ fontSize: 12, color: '#8A93A3', fontWeight: 600, marginBottom: 3 }}>{label}</div>
    <div style={{ fontSize: 14, fontWeight: 600, color: value ? '#2A3242' : '#C8CDD7' }}>{value || 'לא צוין'}</div>
  </div>
);

export default ProfileTab;
