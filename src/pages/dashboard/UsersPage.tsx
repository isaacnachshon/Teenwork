import React, { useState, useEffect } from 'react';
import { DIcon } from '@/components/DashboardIcons';
import { USER_STATUS, UserStatus, avatarGrad, initial } from '@/types/dashboard';
import { db, firebaseConfig } from '@/firebase';
import { collection, query, where, getDocs, doc, deleteDoc, setDoc, Timestamp } from 'firebase/firestore';
import UserProfileCard from './UserProfileCard';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp, deleteApp, FirebaseApp } from 'firebase/app';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  status: UserStatus;
  extra: string; // age+city for teen, category for employer
  count: number; // jobs count
}

const AddUserModal: React.FC<{ onClose: () => void; onDone: () => void }> = ({ onClose, onDone }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'teen' | 'employer'>('teen');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    let tempApp: FirebaseApp | undefined;
    try {
      tempApp = initializeApp(firebaseConfig, `user-creation-${Date.now()}`);
      const tempAuth = getAuth(tempApp);
      const cred = await createUserWithEmailAndPassword(tempAuth, email, password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email: cred.user.email,
        role,
        createdAt: new Date(),
        ...(role === 'teen' ? { name } : { companyName: name }),
      });
      onDone();
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') setError('כתובת אימייל זו כבר קיימת במערכת.');
      else if (err.code === 'auth/weak-password') setError('הסיסמה צריכה להכיל לפחות 6 תווים.');
      else { setError('אירעה שגיאה ביצירת המשתמש.'); console.error(err); }
    } finally {
      setSubmitting(false);
      if (tempApp) await deleteApp(tempApp);
    }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #E3E6EC', borderRadius: 10, fontFamily: 'inherit', fontSize: 14, outline: 'none' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 18, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 16px 48px rgba(0,0,0,.15)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>הוספת משתמש חדש</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#8A93A3' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['teen', 'employer'] as const).map(r => (
              <button key={r} type="button" onClick={() => setRole(r)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${role === r ? '#7B2FF6' : '#E3E6EC'}`, background: role === r ? '#F3ECFE' : '#fff', color: role === r ? '#7B2FF6' : '#5A6478', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                {r === 'teen' ? 'נער/ה' : 'מעסיק/ה'}
              </button>
            ))}
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#5A6478', display: 'block', marginBottom: 4 }}>{role === 'teen' ? 'שם מלא' : 'שם החברה'}</label>
            <input value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#5A6478', display: 'block', marginBottom: 4 }}>אימייל</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#5A6478', display: 'block', marginBottom: 4 }}>סיסמה</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
          </div>
          {error && <div style={{ fontSize: 13, color: '#C8364A', fontWeight: 600 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #E3E6EC', background: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#5A6478' }}>ביטול</button>
            <button type="submit" disabled={submitting} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#7B2FF6', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
              {submitting ? 'יוצר...' : 'צור משתמש'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditUserModal: React.FC<{ user: ManagedUser; role: 'teen' | 'employer'; onClose: () => void; onDone: () => void }> = ({ user, role, onClose, onDone }) => {
  const [name, setName] = useState(user.name);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await setDoc(doc(db, 'users', user.id), role === 'teen' ? { name } : { companyName: name }, { merge: true });
      onDone();
      onClose();
    } catch (err) {
      console.error(err);
      setError('שגיאה בעדכון הפרטים');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #E3E6EC', borderRadius: 10, fontFamily: 'inherit', fontSize: 14, outline: 'none' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 18, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 16px 48px rgba(0,0,0,.15)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>עריכת משתמש</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#8A93A3' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#5A6478', display: 'block', marginBottom: 4 }}>{role === 'teen' ? 'שם מלא' : 'שם החברה'}</label>
            <input value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#5A6478', display: 'block', marginBottom: 4 }}>אימייל (לצפייה בלבד)</label>
            <input value={user.email} disabled style={{ ...inputStyle, background: '#F4F5F7', color: '#8A93A3', cursor: 'not-allowed' }} />
          </div>
          {error && <div style={{ fontSize: 13, color: '#C8364A', fontWeight: 600 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #E3E6EC', background: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#5A6478' }}>ביטול</button>
            <button type="submit" disabled={submitting} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#7B2FF6', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
              {submitting ? 'שומר...' : 'שמור'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UsersPage: React.FC = () => {
  const [userTab, setUserTab] = useState<'teens' | 'employers'>('teens');
  const [teens, setTeens] = useState<ManagedUser[]>([]);
  const [employers, setEmployers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [editUser, setEditUser] = useState<ManagedUser | null>(null);
  const [viewUserId, setViewUserId] = useState<string | null>(null);

  const MONTHS_HE = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יוני', 'יולי', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];

  const formatDate = (ts: any): string => {
    if (!ts) return '—';
    const d = ts instanceof Timestamp ? ts.toDate() : (ts.toDate ? ts.toDate() : new Date(ts));
    return MONTHS_HE[d.getMonth()] + ' ' + d.getFullYear();
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [teenSnap, empSnap, jobsSnap, appsSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), where('role', '==', 'teen'))),
        getDocs(query(collection(db, 'users'), where('role', '==', 'employer'))),
        getDocs(collection(db, 'jobs')),
        getDocs(collection(db, 'applications')),
      ]);

      const jobsByEmployer: Record<string, number> = {};
      jobsSnap.docs.forEach(d => {
        const eid = d.data().employerId;
        if (eid) jobsByEmployer[eid] = (jobsByEmployer[eid] || 0) + 1;
      });

      const appsByTeen: Record<string, number> = {};
      appsSnap.docs.forEach(d => {
        const aid = d.data().applicantId;
        if (aid) appsByTeen[aid] = (appsByTeen[aid] || 0) + 1;
      });

      setTeens(teenSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || '—',
          email: data.email || '',
          createdAt: formatDate(data.createdAt),
          status: (data.status as UserStatus) || 'verified',
          extra: (data.age ? 'בן/בת ' + data.age : '') + (data.location ? ' · ' + data.location : (data.city ? ' · ' + data.city : '')),
          count: appsByTeen[d.id] || 0,
        };
      }));

      setEmployers(empSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          name: data.companyName || data.name || '—',
          email: data.email || '',
          createdAt: formatDate(data.createdAt),
          status: (data.status as UserStatus) || 'verified',
          extra: data.category || data.cat || '—',
          count: jobsByEmployer[d.id] || 0,
        };
      }));
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (user: ManagedUser) => {
    if (!window.confirm(`למחוק את ${user.name}? פעולה זו תמחק את נתוני המשתמש מהאפליקציה.`)) return;
    try {
      await deleteDoc(doc(db, 'users', user.id));
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('שגיאה במחיקת המשתמש.');
    }
  };

  const isTeens = userTab === 'teens';
  const src = isTeens ? teens : employers;
  const tabs: ['teens' | 'employers', string, number][] = [['teens', 'נערים', teens.length], ['employers', 'מעסיקים', employers.length]];

  const cols = {
    c1: 'משתמש',
    c2: isTeens ? 'גיל ועיר' : 'קטגוריה',
    c3: 'סטטוס',
    c4: 'הצטרף/ה',
    c5: isTeens ? 'מועמדויות' : 'משרות',
    c6: 'פעולות',
  };

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '26px 30px 42px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 25, fontWeight: 800, letterSpacing: '-.4px' }}>ניהול משתמשים</h1>
          <div style={{ marginTop: 5, fontSize: 14, color: '#8A93A3' }}>נערים ומעסיקים רשומים במערכת</div>
        </div>
        <button onClick={() => setAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#7B2FF6', color: '#fff', border: 'none', borderRadius: 12, padding: '11px 18px', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
          {DIcon('plus', { size: 18, color: '#fff' })}הוסף משתמש
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {tabs.map(([key, label, count]) => {
          const active = userTab === key;
          return (
            <button key={key} onClick={() => setUserTab(key)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 10, border: `1px solid ${active ? '#1B2333' : '#E3E6EC'}`, background: active ? '#1B2333' : '#fff', color: active ? '#fff' : '#5A6478', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              {label}<span style={{ fontSize: 12, opacity: 0.7 }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#8A93A3', fontSize: 16 }}>טוען משתמשים...</div>
      ) : src.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#8A93A3', fontSize: 16 }}>לא נמצאו משתמשים.</div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.3fr 1fr 0.9fr 145px', gap: 12, padding: '13px 20px', background: '#FAFBFC', borderBottom: '1px solid #EEF0F3', fontSize: 12.5, fontWeight: 700, color: '#8A93A3' }}>
            <div>{cols.c1}</div><div>{cols.c2}</div><div>{cols.c3}</div><div>{cols.c4}</div><div>{cols.c5}</div><div style={{ textAlign: 'left' }}>{cols.c6}</div>
          </div>
          {src.map((u) => {
            const meta = USER_STATUS[u.status] || USER_STATUS.verified;
            return (
              <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.3fr 1fr 0.9fr 145px', gap: 12, padding: '12px 20px', borderBottom: '1px solid #F4F5F7', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: avatarGrad(u.name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>{initial(u.name)}</div>
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: '#8A93A3' }}>{u.email}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13.5, color: '#5A6478' }}>{u.extra || '—'}</div>
                <div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: meta.bg, color: meta.color, padding: '5px 10px', borderRadius: 8, fontSize: 12.5, fontWeight: 700 }}>
                    {DIcon(meta.icon, { size: 13, color: meta.color })}{meta.label}
                  </span>
                </div>
                <div style={{ fontSize: 13.5, color: '#5A6478' }}>{u.createdAt}</div>
                <div style={{ fontSize: 13.5, color: '#5A6478' }}>{u.count}</div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button onClick={() => setViewUserId(u.id)} title="צפייה" style={{ width: 33, height: 33, borderRadius: 9, border: '1px solid #EEF0F3', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>{DIcon('eye', { size: 16, color: '#7A8699' })}</button>
                  <button onClick={() => setEditUser(u)} title="עריכה" style={{ width: 33, height: 33, borderRadius: 9, border: '1px solid #EEF0F3', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>{DIcon('user', { size: 16, color: '#7A8699' })}</button>
                  <button onClick={() => handleDelete(u)} title="מחיקה" style={{ width: 33, height: 33, borderRadius: 9, border: '1px solid #EEF0F3', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>{DIcon('flag', { size: 16, color: '#C8364A' })}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {addModal && <AddUserModal onClose={() => setAddModal(false)} onDone={fetchUsers} />}
      {editUser && <EditUserModal user={editUser} role={isTeens ? 'teen' : 'employer'} onClose={() => setEditUser(null)} onDone={fetchUsers} />}
      {viewUserId && (
        <UserProfileCard
          userId={viewUserId}
          role={isTeens ? 'teen' : 'employer'}
          onClose={() => setViewUserId(null)}
          onVerify={async (uid) => {
            await setDoc(doc(db, 'users', uid), { status: 'verified' }, { merge: true });
            setViewUserId(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
};

export default UsersPage;
