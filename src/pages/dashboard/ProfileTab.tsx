import React, { useState, useEffect, useRef } from 'react';
import { DIcon } from '@/components/DashboardIcons';
import { SkeletonProfile } from '@/components/Skeleton';
import { DashRole, avatarGrad, initial } from '@/types/dashboard';
import { auth, db, storage } from '@/firebase';
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
  cvUrl?: string;
  cvFileName?: string;
  availability?: string[];
}

const COMPLETION_MSGS = [
  { max: 30, text: 'בוא נתחיל למלא את הפרופיל שלך!', emoji: '👋' },
  { max: 60, text: 'כמעט שם! עוד קצת פרטים', emoji: '💪' },
  { max: 99, text: 'מעולה! עוד שדה אחד-שניים', emoji: '🔥' },
  { max: 100, text: 'הפרופיל שלך מושלם!', emoji: '🎉' },
];

const ProfileTab: React.FC<Props> = ({ role }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<UserData>({});
  const [newSkill, setNewSkill] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cvRef = useRef<HTMLInputElement>(null);

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
      const updates: Record<string, any> = { updatedAt: serverTimestamp() };
      if (role === 'teen') {
        updates.name = form.name || '';
        updates.phone = form.phone || '';
        updates.city = form.city || '';
        updates.birthDate = form.birthDate || '';
        updates.school = form.school || '';
        updates.bio = form.bio || '';
        updates.skills = form.skills || [];
        updates.availability = form.availability || [];
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

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !uid) return;
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) { alert('הקובץ גדול מדי. מקסימום 5MB.'); return; }
    setUploadingCv(true);
    try {
      const storageRef = ref(storage, `cvs/${uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', uid), { cvUrl: url, cvFileName: file.name, updatedAt: serverTimestamp() });
      setUserData(prev => prev ? { ...prev, cvUrl: url, cvFileName: file.name } : prev);
      setForm(prev => ({ ...prev, cvUrl: url, cvFileName: file.name }));
    } catch (err) {
      console.error('Failed to upload CV:', err);
    } finally {
      setUploadingCv(false);
    }
  };

  const toggleAvailability = (day: string) => {
    setForm(prev => {
      const current = prev.availability || [];
      return { ...prev, availability: current.includes(day) ? current.filter(d => d !== day) : [...current, day] };
    });
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
    return <SkeletonProfile />;
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
  const completionMsg = COMPLETION_MSGS.find(m => completionPct <= m.max) || COMPLETION_MSGS[3];

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '26px 30px 42px', maxWidth: 780, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-.3px' }}>הפרופיל שלי</h1>
          <div style={{ marginTop: 6, fontSize: 14, color: '#8A93A3' }}>
            {role === 'teen' ? 'ככל שהפרופיל שלך מלא יותר, כך תקבל יותר הצעות עבודה' : 'ניהול פרטי החברה'}
          </div>
        </div>
        {!editing && (
          <button className="tw-btn-primary" onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #7B2FF6, #5560FF)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 22px', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(123,47,246,.25)' }}>
            {DIcon('user', { size: 18, color: '#fff' })}עריכת פרופיל
          </button>
        )}
      </div>

      {/* Hero Card — Profile Header */}
      <div style={{ background: 'linear-gradient(135deg, #7B2FF6 0%, #5560FF 50%, #3B82F6 100%)', borderRadius: 20, padding: '32px 28px', marginBottom: 20, color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
        <div style={{ position: 'absolute', bottom: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            {imageUrl ? (
              <img src={imageUrl} alt={displayName} style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,.3)' }} />
            ) : (
              <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 32, border: '4px solid rgba(255,255,255,.2)' }}>{ini}</div>
            )}
            {editing && (
              <>
                <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: '50%', background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,.15)' }}>
                  {uploadingImage ? <span style={{ fontSize: 11 }}>...</span> : DIcon('plus', { size: 16, color: '#7B2FF6' })}
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </>
            )}
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{displayName || 'שם לא צוין'}</div>
            <div style={{ fontSize: 14, opacity: .8, marginTop: 4 }}>{userData.email}</div>
            {userData.city && <div style={{ fontSize: 13, opacity: .7, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>{DIcon('user', { size: 14, color: 'rgba(255,255,255,.7)' })} {userData.city}</div>}
          </div>
        </div>
      </div>

      {/* Completion Bar */}
      <div className="tw-card" style={{ background: '#fff', borderRadius: 16, padding: '18px 22px', marginBottom: 20, border: '1px solid #EEF0F3' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>{completionMsg.emoji}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#2A3242' }}>{completionMsg.text}</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: completionPct === 100 ? '#0E8A48' : '#7B2FF6' }}>{completionPct}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: '#F0F1F3' }}>
          <div style={{ height: '100%', borderRadius: 4, background: completionPct === 100 ? 'linear-gradient(90deg, #34D399, #0E8A48)' : 'linear-gradient(90deg, #A78BFA, #7B2FF6)', width: `${completionPct}%`, transition: 'width .4s ease' }} />
        </div>
      </div>

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Personal Info Card */}
          <SectionCard title="פרטים אישיים" icon="user">
            {role === 'teen' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: '1 / -1' }}><Field label="שם מלא" value={form.name || ''} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="ישראל ישראלי" /></div>
                <Field label="טלפון" value={form.phone || ''} onChange={v => setForm(p => ({ ...p, phone: v }))} type="tel" placeholder="052-1234567" />
                <Field label="עיר" value={form.city || ''} onChange={v => setForm(p => ({ ...p, city: v }))} placeholder="תל אביב" />
                <Field label="תאריך לידה" value={form.birthDate || ''} onChange={v => setForm(p => ({ ...p, birthDate: v }))} type="date" />
                <Field label="בית ספר" value={form.school || ''} onChange={v => setForm(p => ({ ...p, school: v }))} placeholder="שם בית הספר" />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: '1 / -1' }}><Field label="שם החברה" value={form.companyName || ''} onChange={v => setForm(p => ({ ...p, companyName: v }))} /></div>
                <Field label="טלפון" value={form.phone || ''} onChange={v => setForm(p => ({ ...p, phone: v }))} type="tel" />
                <Field label="עיר" value={form.city || ''} onChange={v => setForm(p => ({ ...p, city: v }))} />
              </div>
            )}
          </SectionCard>

          {role === 'teen' && (
            <>
              {/* About */}
              <SectionCard title="קצת עליי" icon="chat">
                <textarea value={form.bio || ''} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="ספר/י על עצמך — מה את/ה אוהב/ת לעשות, מה מאפיין אותך..." style={{ width: '100%', minHeight: 100, padding: '14px 16px', borderRadius: 12, border: '1px solid #E3E6EC', fontFamily: 'inherit', fontSize: 14, resize: 'vertical', outline: 'none', lineHeight: 1.6, background: '#FAFBFC' }} />
              </SectionCard>

              {/* Skills */}
              <SectionCard title="כישורים" icon="star">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {(form.skills || []).map(s => (
                    <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F3ECFE', color: '#5A18C2', padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                      {s}
                      <button onClick={() => removeSkill(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', opacity: .6 }}>✕</button>
                    </span>
                  ))}
                  {(form.skills || []).length === 0 && <span style={{ fontSize: 13, color: '#A6AEBC' }}>עדיין אין כישורים — הוסף/י למטה</span>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} placeholder="למשל: אנגלית, שירות לקוחות..." style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #E3E6EC', fontFamily: 'inherit', fontSize: 14, outline: 'none', background: '#FAFBFC' }} />
                  <button className="tw-btn-primary" onClick={addSkill} style={{ padding: '10px 18px', borderRadius: 10, background: '#7B2FF6', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>הוסף</button>
                </div>
              </SectionCard>

              {/* CV + Availability */}
              <SectionCard title="קורות חיים וזמינות" icon="briefcase">
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A576E', marginBottom: 8 }}>קורות חיים (PDF / Word)</label>
                  {form.cvUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#E4F5EA', padding: '12px 16px', borderRadius: 12 }}>
                      <span style={{ display: 'flex' }}>{DIcon('check', { size: 18, color: '#0E8A48' })}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0E8A48', flex: 1 }}>{form.cvFileName || 'קו"ח הועלו'}</span>
                      <button onClick={() => cvRef.current?.click()} style={{ fontSize: 13, color: '#5A18C2', background: '#F3ECFE', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>החלף</button>
                    </div>
                  ) : (
                    <button onClick={() => cvRef.current?.click()} disabled={uploadingCv} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '16px', borderRadius: 12, border: '2px dashed #D1D5DB', background: '#FAFBFC', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, color: '#6B7689', justifyContent: 'center', transition: 'border-color .2s' }}>
                      {DIcon('plus', { size: 20, color: '#9AA3B2' })}
                      {uploadingCv ? 'מעלה...' : 'העלה קורות חיים'}
                    </button>
                  )}
                  <input ref={cvRef} type="file" accept=".pdf,.doc,.docx" onChange={handleCvUpload} style={{ display: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A576E', marginBottom: 8 }}>באילו ימים את/ה פנוי/ה?</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'].map(day => {
                      const selected = (form.availability || []).includes(day);
                      return (
                        <button key={day} onClick={() => toggleAvailability(day)} style={{ padding: '10px 18px', borderRadius: 12, border: selected ? '2px solid #7B2FF6' : '1px solid #E3E6EC', background: selected ? '#F3ECFE' : '#fff', color: selected ? '#5A18C2' : '#4A576E', fontFamily: 'inherit', fontSize: 14, fontWeight: selected ? 700 : 500, cursor: 'pointer', transition: 'all .15s' }}>{day}</button>
                      );
                    })}
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8, position: 'sticky', bottom: 20, background: 'linear-gradient(0deg, #F5F6F8 60%, transparent)', padding: '16px 0 4px' }}>
            <button className="tw-btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '14px 22px', borderRadius: 14, background: 'linear-gradient(135deg, #7B2FF6, #5560FF)', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: 16, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1, boxShadow: '0 4px 14px rgba(123,47,246,.25)' }}>
              {saving ? 'שומר...' : 'שמור שינויים'}
            </button>
            <button className="tw-btn-ghost" onClick={() => { setEditing(false); setForm(userData); }} style={{ padding: '14px 22px', borderRadius: 14, background: '#fff', color: '#475067', border: '1px solid #E3E6EC', fontFamily: 'inherit', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
              ביטול
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Read-only view */}
          <SectionCard title="פרטים אישיים" icon="user">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {role === 'teen' ? (
                <>
                  <InfoField icon="user" label="טלפון" value={userData.phone} />
                  <InfoField icon="user" label="עיר" value={userData.city} />
                  <InfoField icon="calendar" label="תאריך לידה" value={userData.birthDate} />
                  <InfoField icon="briefcase" label="בית ספר" value={userData.school} />
                </>
              ) : (
                <>
                  <InfoField icon="briefcase" label="שם החברה" value={userData.companyName} />
                  <InfoField icon="user" label="טלפון" value={userData.phone} />
                  <InfoField icon="user" label="עיר" value={userData.city} />
                </>
              )}
            </div>
          </SectionCard>

          {role === 'teen' && userData.bio && (
            <SectionCard title="קצת עליי" icon="chat">
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#3A4456', margin: 0 }}>{userData.bio}</p>
            </SectionCard>
          )}

          {role === 'teen' && (userData.skills || []).length > 0 && (
            <SectionCard title="כישורים" icon="star">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {userData.skills!.map(s => (
                  <span key={s} style={{ background: '#F3ECFE', color: '#5A18C2', padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{s}</span>
                ))}
              </div>
            </SectionCard>
          )}

          {role === 'teen' && (userData.cvUrl || (userData.availability || []).length > 0) && (
            <SectionCard title="קורות חיים וזמינות" icon="briefcase">
              {userData.cvUrl && (
                <div style={{ marginBottom: (userData.availability || []).length > 0 ? 14 : 0 }}>
                  <a href={userData.cvUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E4F5EA', color: '#0E8A48', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                    {DIcon('check', { size: 16, color: '#0E8A48' })}
                    {userData.cvFileName || 'הורד קו"ח'}
                  </a>
                </div>
              )}
              {(userData.availability || []).length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: '#8A93A3', fontWeight: 600, marginBottom: 8 }}>ימים זמינים</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {userData.availability!.map(d => (
                      <span key={d} style={{ background: '#F3ECFE', color: '#5A18C2', padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{d}</span>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>
          )}
        </div>
      )}
    </div>
  );
};

const SectionCard: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="tw-card" style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 18, padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,.03)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: '#F3ECFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {DIcon(icon, { size: 17, color: '#7B2FF6' })}
      </div>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1B2333' }}>{title}</h3>
    </div>
    {children}
  </div>
);

const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4A576E', marginBottom: 6 }}>{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #E3E6EC', fontFamily: 'inherit', fontSize: 14, outline: 'none', background: '#FAFBFC', transition: 'border-color .2s' }} />
  </div>
);

const InfoField: React.FC<{ icon: string; label: string; value?: string }> = ({ icon, label, value }) => (
  <div style={{ background: '#F8F9FB', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EEF0F3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {DIcon(icon, { size: 15, color: '#7A8699' })}
    </div>
    <div>
      <div style={{ fontSize: 11, color: '#8A93A3', fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: value ? '#2A3242' : '#C8CDD7' }}>{value || 'לא צוין'}</div>
    </div>
  </div>
);

export default ProfileTab;
