import React, { useState } from 'react';
import { DIcon } from './DashboardIcons';
import { DashRole, ConnStatus, CONN_STATUS, DEMO_CONNECTIONS, avatarGrad, initial } from './types';

interface Props {
  role: DashRole;
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
  warn: { bg: '#FBF0DA', color: '#9A6406', border: 'none' },
};

const ConnectionsPage: React.FC<Props> = ({ role }) => {
  const [filter, setFilter] = useState<'all' | ConnStatus>('all');
  const [overrides, setOverrides] = useState<Record<string, ConnStatus>>({});

  const getStatus = (id: string, base: ConnStatus) => overrides[id] || base;
  const approve = (id: string) => setOverrides(o => ({ ...o, [id]: 'active' }));
  const reject = (id: string) => setOverrides(o => ({ ...o, [id]: 'rejected' }));
  const complete = (id: string) => setOverrides(o => ({ ...o, [id]: 'completed' }));

  const conns = DEMO_CONNECTIONS.map(c => ({ ...c, status: getStatus(c.id, c.status) }));
  const filtered = filter === 'all' ? conns : conns.filter(c => c.status === filter);

  const cntBy = (s: ConnStatus) => conns.filter(c => c.status === s).length;
  const filters: [string, string, number][] = [['all', 'הכל', conns.length], ['active', 'פעילות', cntBy('active')], ['pending', 'ממתינות', cntBy('pending')], ['completed', 'הושלמו', cntBy('completed')]];

  const [pageTitle, pageSub] = TITLES[role];

  const mkBtn = (label: string, kind: string, go?: () => void) => {
    const s = BTN[kind] || BTN.ghost;
    return { label, go: go || (() => {}), ...s };
  };

  const getActions = (conn: typeof conns[0]) => {
    const st = conn.status;
    if (role === 'admin') return [mkBtn('צ׳אט', 'soft'), mkBtn('פרופיל', 'soft'), mkBtn('סמן', 'warn')];
    if (role === 'employer') {
      if (st === 'pending') return [mkBtn('אישור', 'ok', () => approve(conn.id)), mkBtn('דחייה', 'danger', () => reject(conn.id)), mkBtn('הודעה', 'soft')];
      if (st === 'active') return [mkBtn('הודעה', 'primary'), mkBtn('סיום עבודה', 'soft', () => complete(conn.id))];
      if (st === 'rejected') return [mkBtn('נדחה', 'danger')];
      return [mkBtn('דירוג', 'soft'), mkBtn('פרטים', 'soft')];
    }
    // teen
    if (st === 'pending') return [mkBtn('הודעה', 'soft')];
    if (st === 'active') return [mkBtn('הודעה', 'primary'), mkBtn('פרטים', 'soft')];
    if (st === 'rejected') return [mkBtn('נדחה', 'danger')];
    return [mkBtn('דירוג', 'soft')];
  };

  const getSub2 = (conn: typeof conns[0]) => {
    if (conn.status === 'active') return conn.emp + ' · ' + conn.hours + ' שעות החודש';
    if (conn.status === 'completed') return conn.emp + ' · ' + conn.hours + ' שעות בסך הכל';
    if (conn.status === 'rejected') return conn.emp + ' · המועמדות נדחתה';
    return conn.emp + ' · טרם החל';
  };

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '26px 30px 42px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 25, fontWeight: 800, letterSpacing: '-.4px' }}>{pageTitle}</h1>
          <div style={{ marginTop: 5, fontSize: 14, color: '#8A93A3' }}>{pageSub}</div>
        </div>
        {role === 'employer' && (
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#7B2FF6', color: '#fff', border: 'none', borderRadius: 12, padding: '11px 18px', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
            {DIcon('plus', { size: 18, color: '#fff' })}פרסום משרה
          </button>
        )}
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

      {/* Connection Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(conn => {
          const meta = CONN_STATUS[conn.status];
          const actions = getActions(conn);
          return (
            <div key={conn.id} style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, padding: '15px 18px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', animation: 'pop .25s both' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 175 }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: avatarGrad(conn.teen), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 17, flexShrink: 0 }}>{initial(conn.teen)}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{conn.teen}</div>
                  <div style={{ fontSize: 12.5, color: '#8A93A3' }}>{'בן/בת ' + conn.tAge}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', color: '#C8CDD7' }}>{DIcon('link', { size: 22, color: '#C8CDD7' })}</div>
              <div style={{ flex: 1, minWidth: 150 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{conn.role}</div>
                <div style={{ fontSize: 12.5, color: '#8A93A3' }}>{getSub2(conn)}</div>
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
