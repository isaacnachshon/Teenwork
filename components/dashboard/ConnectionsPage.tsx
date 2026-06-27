import React, { useState, useEffect } from 'react';
import { DIcon } from './DashboardIcons';
import { DashRole, ConnStatus, CONN_STATUS, avatarGrad, initial } from './types';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface Props {
  role: DashRole;
}

interface AppRecord {
  id: string;
  teenName: string;
  teenAge: number;
  employerName: string;
  jobTitle: string;
  status: ConnStatus;
  hours: number;
  since: string;
  applicantId: string;
  employerId: string;
}

const TITLES: Record<DashRole, [string, string]> = {
  admin: ['ניהול התקשרויות', 'כל ההעסקות בין נערים למעסיקים'],
  employer: ['מועמדים והעסקות', 'ניהול מועמדויות ועובדים פעילים'],
  teen: ['העבודות שלי', 'ההתקשרויות שלך עם מעסיקים'],
};

type BtnStyle = { bg: string; color: string; border: string };
const BTN: Record<string, BtnStyle> = {
  primary: { bg: '#7B2FF6', color: '#fff', border: 'none' },
  ghost: { bg: '#fff', color: '#475067', border: '1px solid #E3E6EC' },
  soft: { bg: '#F8F9FB', color: '#3A4456', border: '1px solid #EEF0F3' },
  ok: { bg: '#E4F5EA', color: '#0E8A48', border: 'none' },
  danger: { bg: '#FBE7EA', color: '#C8364A', border: 'none' },
};

const STATUS_MAP: Record<string, ConnStatus> = {
  new: 'pending',
  viewed: 'pending',
  contacted: 'active',
  accepted: 'active',
  rejected: 'rejected',
  completed: 'completed',
};

const ConnectionsPage: React.FC<Props> = ({ role }) => {
  const [filter, setFilter] = useState<'all' | ConnStatus>('all');
  const [records, setRecords] = useState<AppRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const uid = auth?.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;
    loadApplications();
  }, [uid, role]);

  const loadApplications = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      let q;
      if (role === 'admin') {
        q = query(collection(db, 'applications'));
      } else if (role === 'employer') {
        q = query(collection(db, 'applications'), where('employerId', '==', uid));
      } else {
        q = query(collection(db, 'applications'), where('applicantId', '==', uid));
      }

      const snap = await getDocs(q);
      const apps: AppRecord[] = [];

      for (const d of snap.docs) {
        const data = d.data();
        const rawStatus = data.status || 'new';
        const status = STATUS_MAP[rawStatus] || 'pending';

        apps.push({
          id: d.id,
          teenName: data.teenName || data.applicantName || 'נער/ה',
          teenAge: data.teenAge || 0,
          employerName: data.employerName || data.companyName || 'מעסיק',
          jobTitle: data.jobTitle || 'משרה',
          status,
          hours: data.hours || 0,
          since: data.startDate || '—',
          applicantId: data.applicantId || '',
          employerId: data.employerId || '',
        });
      }

      setRecords(apps);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'applications', appId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      setRecords(prev => prev.map(r =>
        r.id === appId ? { ...r, status: STATUS_MAP[newStatus] || 'pending' } : r
      ));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filtered = filter === 'all' ? records : records.filter(r => r.status === filter);
  const cntBy = (s: ConnStatus) => records.filter(r => r.status === s).length;
  const filters: [string, string, number][] = [['all', 'הכל', records.length], ['active', 'פעילות', cntBy('active')], ['pending', 'ממתינות', cntBy('pending')], ['completed', 'הושלמו', cntBy('completed')]];

  const [pageTitle, pageSub] = TITLES[role];

  const mkBtn = (label: string, kind: string, go?: () => void) => {
    const s = BTN[kind] || BTN.ghost;
    return { label, go: go || (() => {}), ...s };
  };

  const getActions = (rec: AppRecord) => {
    if (role === 'admin') return [mkBtn('פרטים', 'soft')];
    if (role === 'employer') {
      if (rec.status === 'pending') return [mkBtn('אישור', 'ok', () => updateStatus(rec.id, 'accepted')), mkBtn('דחייה', 'danger', () => updateStatus(rec.id, 'rejected'))];
      if (rec.status === 'active') return [mkBtn('הודעה', 'primary'), mkBtn('סיום', 'soft', () => updateStatus(rec.id, 'completed'))];
      return [mkBtn('פרטים', 'soft')];
    }
    if (rec.status === 'active') return [mkBtn('הודעה', 'primary'), mkBtn('פרטים', 'soft')];
    return [mkBtn('פרטים', 'soft')];
  };

  const getSub2 = (rec: AppRecord) => {
    if (rec.status === 'active') return rec.employerName + ' · ' + (rec.hours || 0) + ' שעות';
    if (rec.status === 'completed') return rec.employerName + ' · הושלם';
    if (rec.status === 'rejected') return rec.employerName + ' · נדחה';
    return rec.employerName + ' · ממתין';
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 16, color: '#8A93A3' }}>טוען נתונים...</div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '26px 30px 42px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 25, fontWeight: 800, letterSpacing: '-.4px' }}>{pageTitle}</h1>
          <div style={{ marginTop: 5, fontSize: 14, color: '#8A93A3' }}>{pageSub}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {filters.map(([key, label, count]) => {
          const active = filter === key;
          return (
            <button key={key} onClick={() => setFilter(key as any)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 10, border: `1px solid ${active ? '#1B2333' : '#E3E6EC'}`, background: active ? '#1B2333' : '#fff', color: active ? '#fff' : '#51607A', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              {label}<span style={{ fontSize: 12, opacity: 0.7 }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ marginBottom: 12 }}>{DIcon('briefcase', { size: 40, color: '#C8CDD7' })}</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#4A576E', marginBottom: 6 }}>
            {records.length === 0 ? 'אין התקשרויות עדיין' : 'אין תוצאות לסינון זה'}
          </div>
          <div style={{ fontSize: 14, color: '#8A93A3' }}>
            {role === 'teen' ? 'ברגע שתגיש מועמדות למשרה, היא תופיע כאן' : role === 'employer' ? 'ברגע שנערים יגישו מועמדות, הם יופיעו כאן' : 'אין התקשרויות במערכת'}
          </div>
        </div>
      )}

      {/* Connection Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(rec => {
          const meta = CONN_STATUS[rec.status];
          const actions = getActions(rec);
          return (
            <div key={rec.id} style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, padding: '15px 18px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 175 }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: avatarGrad(rec.teenName), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 17, flexShrink: 0 }}>{initial(rec.teenName)}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{rec.teenName}</div>
                  {rec.teenAge > 0 && <div style={{ fontSize: 12.5, color: '#8A93A3' }}>{'בן/בת ' + rec.teenAge}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', color: '#C8CDD7' }}>{DIcon('link', { size: 22, color: '#C8CDD7' })}</div>
              <div style={{ flex: 1, minWidth: 150 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{rec.jobTitle}</div>
                <div style={{ fontSize: 12.5, color: '#8A93A3' }}>{getSub2(rec)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: meta.bg, color: meta.color, padding: '6px 12px', borderRadius: 9, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color }} />
                {meta.label}
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {actions.map((a, i) => (
                  <button key={i} onClick={a.go} style={{ fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, padding: '8px 14px', borderRadius: 10, cursor: 'pointer', background: a.bg, color: a.color, border: a.border }}>{a.label}</button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConnectionsPage;
