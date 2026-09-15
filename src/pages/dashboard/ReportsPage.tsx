import React, { useEffect, useState } from 'react';
import { ReportService, ReportDoc, ReportStatus } from '@/services/ReportService';
import { DIcon } from '@/components/DashboardIcons';
import { SkeletonTable } from '@/components/Skeleton';

const TYPE_LABEL: Record<string, string> = {
  inappropriate_content: 'תוכן לא הולם',
  harassment: 'הטרדה',
  spam: 'ספאם',
  safety_concern: 'חשש בטיחותי / הפרת חוק',
  other: 'אחר',
};

const TARGET_LABEL: Record<string, string> = { user: 'משתמש', job: 'משרה', message: 'הודעה', company: 'חברה' };

const STATUS_META: Record<ReportStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'ממתין', color: '#B5740A', bg: '#FBF0DA' },
  reviewed: { label: 'נבדק', color: '#4E5BD6', bg: '#EAECFE' },
  resolved: { label: 'נפתר', color: '#0E8A48', bg: '#E4F5EA' },
  dismissed: { label: 'נדחה', color: '#8A93A3', bg: '#F1F3F5' },
};

/** Admin moderation queue on top of the existing ReportService (reports collection, admin-only reads). */
const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | ReportStatus>('pending');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setReports(await ReportService.getAll());
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError('טעינת הדיווחים נכשלה.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: ReportStatus) => {
    try {
      await ReportService.updateStatus(id, status);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (err) {
      console.error('Failed to update report:', err);
      setError('עדכון הדיווח נכשל.');
    }
  };

  const visible = reports.filter(r => filter === 'all' || r.status === filter);
  const fmt = (ts: any) => ts?.toDate ? ts.toDate().toLocaleDateString('he-IL') : '—';

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '26px 30px 42px' }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, fontSize: 25, fontWeight: 800, letterSpacing: '-.4px' }}>דיווחים</h1>
        <div style={{ marginTop: 5, fontSize: 14, color: '#8A93A3' }}>דיווחים על משרות, משתמשים והודעות — מודרציה</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['pending', 'reviewed', 'resolved', 'dismissed', 'all'] as const).map(key => {
          const active = filter === key;
          const label = key === 'all' ? 'הכל' : STATUS_META[key].label;
          const count = key === 'all' ? reports.length : reports.filter(r => r.status === key).length;
          return (
            <button key={key} onClick={() => setFilter(key)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 10, border: `1px solid ${active ? '#1B2333' : '#E3E6EC'}`, background: active ? '#1B2333' : '#fff', color: active ? '#fff' : '#5A6478', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              {label}<span style={{ fontSize: 12, opacity: 0.7 }}>{count}</span>
            </button>
          );
        })}
      </div>

      {error && <p role="alert" style={{ color: '#C8364A', fontWeight: 600 }}>{error} <button onClick={load} style={{ textDecoration: 'underline', background: 'none', border: 0, color: 'inherit', cursor: 'pointer', fontFamily: 'inherit' }}>נסה שוב</button></p>}

      {loading ? (
        <SkeletonTable />
      ) : visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#8A93A3', fontSize: 16 }}>אין דיווחים להצגה.</div>
      ) : (
        <div className="tw-card" style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, overflow: 'hidden' }}>
          {visible.map(r => {
            const meta = STATUS_META[r.status] || STATUS_META.pending;
            return (
              <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 2fr 1fr 220px', gap: 12, padding: '12px 20px', borderBottom: '1px solid #F4F5F7', alignItems: 'center', fontSize: 13.5 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{TYPE_LABEL[r.type] || r.type}</div>
                  <div style={{ fontSize: 12, color: '#8A93A3' }}>{fmt(r.createdAt)}</div>
                </div>
                <div style={{ color: '#5A6478' }}>{TARGET_LABEL[r.targetType] || r.targetType}<div style={{ fontSize: 11, color: '#B0B8C7', direction: 'ltr', textAlign: 'right' }}>{r.targetId}</div></div>
                <div style={{ color: '#3A4456' }}>{r.description || '—'}<div style={{ fontSize: 12, color: '#8A93A3' }}>מדווח/ת: {r.reporterName || r.reporterId}</div></div>
                <div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: meta.bg, color: meta.color, padding: '5px 10px', borderRadius: 8, fontSize: 12.5, fontWeight: 700 }}>
                    {DIcon('flag', { size: 13, color: meta.color })}{meta.label}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {r.status === 'pending' && <button onClick={() => setStatus(r.id, 'reviewed')} style={btn('#EAECFE', '#4E5BD6')}>נבדק</button>}
                  {r.status !== 'resolved' && <button onClick={() => setStatus(r.id, 'resolved')} style={btn('#E4F5EA', '#0E8A48')}>נפתר</button>}
                  {r.status !== 'dismissed' && <button onClick={() => setStatus(r.id, 'dismissed')} style={btn('#F1F3F5', '#5A6478')}>דחה</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function btn(bg: string, color: string): React.CSSProperties {
  return { background: bg, color, border: 'none', borderRadius: 8, padding: '6px 10px', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' };
}

export default ReportsPage;
