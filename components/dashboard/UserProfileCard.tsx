import React, { useState, useEffect } from 'react';
import { DIcon } from './DashboardIcons';
import { USER_STATUS, UserStatus, avatarGrad, initial } from './types';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface UserProfileCardProps {
  userId: string;
  role: 'teen' | 'employer';
  onClose: () => void;
  onVerify?: (userId: string) => void;
}

interface TeenData {
  name: string;
  email: string;
  age?: number;
  location?: string;
  city?: string;
  phone?: string;
  bio?: string;
  profileImageUrl?: string;
  skills?: string[];
  preferredJobTypes?: string[];
  workHistory?: { id: string; title: string; company: string; duration: string }[];
  reviews?: { id: string; reviewer: string; rating: number; comment: string }[];
  status?: UserStatus;
  createdAt?: any;
  parentalConsentUrl?: string;
  idVerified?: boolean;
  idVerifiedAt?: any;
}

interface EmployerData {
  companyName?: string;
  name?: string;
  fullName?: string;
  email: string;
  phone?: string;
  category?: string;
  cat?: string;
  location?: string;
  companyAddress?: string;
  companyDescription?: string;
  profileImageUrl?: string;
  companyLogoUrl?: string;
  idNumber?: string;
  status?: UserStatus;
  createdAt?: any;
}

interface AppData {
  jobTitle: string;
  status: string;
  createdAt?: any;
}

const sectionTitle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#8A93A3', marginBottom: 8, marginTop: 18, textTransform: 'uppercase', letterSpacing: 0.5 };
const fieldRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, borderBottom: '1px solid #F4F5F7' };
const fieldLabel: React.CSSProperties = { color: '#8A93A3', fontWeight: 600 };
const fieldValue: React.CSSProperties = { color: '#1B2333', fontWeight: 500, textAlign: 'left' as const, direction: 'ltr' as const };

const UserProfileCard: React.FC<UserProfileCardProps> = ({ userId, role, onClose, onVerify }) => {
  const [loading, setLoading] = useState(true);
  const [teenData, setTeenData] = useState<TeenData | null>(null);
  const [empData, setEmpData] = useState<EmployerData | null>(null);
  const [applications, setApplications] = useState<AppData[]>([]);
  const [jobCount, setJobCount] = useState(0);
  const [hiredCount, setHiredCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) return;
        const data = userDoc.data();

        if (role === 'teen') {
          setTeenData(data as TeenData);
          const appsSnap = await getDocs(query(collection(db, 'applications'), where('applicantId', '==', userId)));
          setApplications(appsSnap.docs.map(d => {
            const a = d.data();
            return { jobTitle: a.jobTitle || '—', status: a.status || 'new', createdAt: a.createdAt };
          }));
        } else {
          setEmpData(data as EmployerData);
          const [jobsSnap, appsSnap] = await Promise.all([
            getDocs(query(collection(db, 'jobs'), where('employerId', '==', userId))),
            getDocs(query(collection(db, 'applications'), where('employerId', '==', userId))),
          ]);
          setJobCount(jobsSnap.size);
          const contacted = appsSnap.docs.filter(d => d.data().status === 'contacted').length;
          setHiredCount(contacted);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, role]);

  const profileCompleteness = (data: TeenData): number => {
    const fields = [data.name, data.age, data.location || data.city, data.email, data.phone, data.bio, data.profileImageUrl];
    const arrays = [data.skills, data.preferredJobTypes, data.workHistory];
    let filled = fields.filter(Boolean).length;
    filled += arrays.filter(a => a && a.length > 0).length;
    return Math.round((filled / (fields.length + arrays.length)) * 100);
  };

  const statusLabel: Record<string, string> = { new: 'חדש', viewed: 'נצפה', contacted: 'נוצר קשר' };
  const statusColor: Record<string, string> = { new: '#B5740A', viewed: '#4E5BD6', contacted: '#0E8A48' };

  const renderAvatar = (name: string, imageUrl?: string, size = 72) => {
    if (imageUrl) {
      return <img src={imageUrl} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,.12)' }} />;
    }
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', background: avatarGrad(name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: size * 0.4, fontWeight: 700, border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,.12)' }}>
        {initial(name)}
      </div>
    );
  };

  const renderTeenCard = (data: TeenData) => {
    const meta = USER_STATUS[data.status || 'pending'];
    const pct = profileCompleteness(data);
    return (
      <>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #7B2FF6, #5560FF)', borderRadius: '18px 18px 0 0', padding: '28px 28px 48px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ padding: '0 28px 24px', marginTop: -40 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 12 }}>
            {renderAvatar(data.name, data.profileImageUrl)}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1B2333' }}>{data.name}</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: meta.bg, color: meta.color, padding: '3px 10px', borderRadius: 7, fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                {DIcon(meta.icon, { size: 12, color: meta.color })}{meta.label}
              </span>
            </div>
          </div>

          {/* Profile completeness */}
          <div style={{ margin: '12px 0 4px', fontSize: 12, fontWeight: 600, color: '#8A93A3' }}>השלמת פרופיל: {pct}%</div>
          <div style={{ height: 6, borderRadius: 3, background: '#EEF0F3', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: pct >= 80 ? '#0E8A48' : pct >= 50 ? '#B5740A' : '#C8364A', transition: 'width .3s' }} />
          </div>

          {/* Personal info */}
          <div style={sectionTitle}>פרטים אישיים</div>
          <div style={fieldRow}><span style={fieldLabel}>גיל</span><span style={fieldValue}>{data.age || '—'}</span></div>
          <div style={fieldRow}><span style={fieldLabel}>עיר</span><span style={fieldValue}>{data.location || data.city || '—'}</span></div>
          <div style={fieldRow}><span style={fieldLabel}>אימייל</span><span style={fieldValue}>{data.email || '—'}</span></div>
          <div style={fieldRow}><span style={fieldLabel}>טלפון</span><span style={fieldValue}>{data.phone || '—'}</span></div>

          {/* Work preferences */}
          <div style={sectionTitle}>העדפות עבודה</div>
          <div style={fieldRow}>
            <span style={fieldLabel}>סוגי עבודה</span>
            <span style={fieldValue}>{data.preferredJobTypes && data.preferredJobTypes.length > 0 ? data.preferredJobTypes.join(', ') : '—'}</span>
          </div>

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <>
              <div style={sectionTitle}>כישורים</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {data.skills.map((s, i) => (
                  <span key={i} style={{ background: '#F3ECFE', color: '#7B2FF6', padding: '4px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 600 }}>{s}</span>
                ))}
              </div>
            </>
          )}

          {/* Work history */}
          {data.workHistory && data.workHistory.length > 0 && (
            <>
              <div style={sectionTitle}>ניסיון קודם</div>
              {data.workHistory.map((w, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #F4F5F7', fontSize: 13.5 }}>
                  <div style={{ fontWeight: 600, color: '#1B2333' }}>{w.title}</div>
                  <div style={{ color: '#8A93A3' }}>{w.company} · {w.duration}</div>
                </div>
              ))}
            </>
          )}

          {/* Bio */}
          {data.bio && (
            <>
              <div style={sectionTitle}>אודות</div>
              <div style={{ fontSize: 13.5, color: '#5A6478', lineHeight: 1.6 }}>{data.bio}</div>
            </>
          )}

          {/* Identity verification */}
          <div style={sectionTitle}>אימות זהות</div>
          <div style={fieldRow}>
            <span style={fieldLabel}>ת.ז. אומתה</span>
            <span style={{ ...fieldValue, color: data.idVerified ? '#0E8A48' : '#C8364A' }}>{data.idVerified ? 'כן' : 'לא'}</span>
          </div>
          {data.parentalConsentUrl && (
            <div style={fieldRow}>
              <span style={fieldLabel}>אישור הורים</span>
              <a href={data.parentalConsentUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#7B2FF6', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>צפייה</a>
            </div>
          )}

          {/* Applications */}
          <div style={sectionTitle}>מועמדויות ({applications.length})</div>
          {applications.length === 0 ? (
            <div style={{ fontSize: 13, color: '#8A93A3', padding: '8px 0' }}>אין מועמדויות</div>
          ) : (
            applications.map((a, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #F4F5F7', fontSize: 13.5 }}>
                <span style={{ fontWeight: 600, color: '#1B2333' }}>{a.jobTitle}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: statusColor[a.status] || '#8A93A3', background: '#F4F5F7', padding: '3px 8px', borderRadius: 6 }}>
                  {statusLabel[a.status] || a.status}
                </span>
              </div>
            ))
          )}

          {/* Actions */}
          {onVerify && (
            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button onClick={() => onVerify(userId)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: '#0E8A48', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {DIcon('shield', { size: 16, color: '#fff' })}אמת משתמש
              </button>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderEmployerCard = (data: EmployerData) => {
    const name = data.companyName || data.name || '—';
    const meta = USER_STATUS[data.status || 'pending'];
    return (
      <>
        <div style={{ background: 'linear-gradient(135deg, #1B2333, #2D3748)', borderRadius: '18px 18px 0 0', padding: '28px 28px 48px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ padding: '0 28px 24px', marginTop: -40 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 12 }}>
            {renderAvatar(name, data.companyLogoUrl || data.profileImageUrl)}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1B2333' }}>{name}</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: meta.bg, color: meta.color, padding: '3px 10px', borderRadius: 7, fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                {DIcon(meta.icon, { size: 12, color: meta.color })}{meta.label}
              </span>
            </div>
          </div>

          <div style={sectionTitle}>פרטי עסק</div>
          <div style={fieldRow}><span style={fieldLabel}>קטגוריה</span><span style={fieldValue}>{data.category || data.cat || '—'}</span></div>
          <div style={fieldRow}><span style={fieldLabel}>כתובת</span><span style={fieldValue}>{data.companyAddress || data.location || '—'}</span></div>
          <div style={fieldRow}><span style={fieldLabel}>אימייל</span><span style={fieldValue}>{data.email || '—'}</span></div>
          <div style={fieldRow}><span style={fieldLabel}>טלפון</span><span style={fieldValue}>{data.phone || '—'}</span></div>
          <div style={fieldRow}><span style={fieldLabel}>איש קשר</span><span style={fieldValue}>{data.fullName || '—'}</span></div>
          <div style={fieldRow}><span style={fieldLabel}>ת.ז / ח.פ</span><span style={fieldValue}>{data.idNumber || '—'}</span></div>
          {data.companyDescription && (
            <>
              <div style={sectionTitle}>תיאור העסק</div>
              <div style={{ fontSize: 13.5, color: '#5A6478', lineHeight: 1.6 }}>{data.companyDescription}</div>
            </>
          )}

          <div style={sectionTitle}>סטטיסטיקות</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
            <div style={{ background: '#F3ECFE', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#7B2FF6' }}>{jobCount}</div>
              <div style={{ fontSize: 12, color: '#5A6478', fontWeight: 600, marginTop: 2 }}>משרות פורסמו</div>
            </div>
            <div style={{ background: '#E4F5EA', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0E8A48' }}>{hiredCount}</div>
              <div style={{ fontSize: 12, color: '#5A6478', fontWeight: 600, marginTop: 2 }}>מועמדים נבחרו</div>
            </div>
          </div>

          {onVerify && (
            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button onClick={() => onVerify(userId)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: '#0E8A48', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {DIcon('shield', { size: 16, color: '#fff' })}אמת מעסיק
              </button>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }} onClick={e => e.stopPropagation()}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#8A93A3', fontSize: 15 }}>טוען פרטי משתמש...</div>
        ) : role === 'teen' && teenData ? (
          renderTeenCard(teenData)
        ) : role === 'employer' && empData ? (
          renderEmployerCard(empData)
        ) : (
          <div style={{ padding: 60, textAlign: 'center', color: '#C8364A', fontSize: 15 }}>לא נמצאו נתונים</div>
        )}
      </div>
    </div>
  );
};

export default UserProfileCard;
