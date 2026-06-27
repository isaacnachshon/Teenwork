import React, { useState, useEffect } from 'react';
import { DIcon } from '@/components/DashboardIcons';
import { DashRole, TabKey, avatarGrad, initial } from '@/types/dashboard';
import OverviewPage from '@/pages/dashboard/OverviewPage';
import ConnectionsPage from '@/pages/dashboard/ConnectionsPage';
import UsersPage from '@/pages/dashboard/UsersPage';
import ChatPage from '@/pages/dashboard/ChatPage';
import ProfileTab from '@/pages/dashboard/ProfileTab';
import SettingsPage from '@/pages/dashboard/SettingsPage';
import { auth, db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface Props {
  role: DashRole;
  userName: string;
  onLogout: () => void;
}

const ROLE_LABEL: Record<DashRole, string> = {
  admin: 'מנהל מערכת',
  employer: 'מעסיק',
  teen: 'נוער',
};

const NAV: Record<DashRole, [TabKey, string, string][]> = {
  admin: [['overview', 'סקירה כללית', 'overview'], ['users', 'ניהול משתמשים', 'users'], ['connections', 'התקשרויות', 'link'], ['chat', "ניהול צ'אט", 'chat'], ['settings', 'הגדרות', 'gear']],
  employer: [['overview', 'סקירה', 'overview'], ['connections', 'מועמדים והעסקות', 'link'], ['chat', 'הודעות', 'chat'], ['profile', 'פרופיל', 'user'], ['settings', 'הגדרות', 'gear']],
  teen: [['overview', 'סקירה', 'overview'], ['connections', 'העבודות שלי', 'link'], ['chat', 'הודעות', 'chat'], ['profile', 'פרופיל', 'user'], ['settings', 'הגדרות', 'gear']],
};

const SEARCH_PH: Record<DashRole, string> = {
  admin: 'חיפוש משתמש, התקשרות או שיחה...',
  employer: 'חיפוש מועמד או הודעה...',
  teen: 'חיפוש עבודה...',
};

const DashboardLayout: React.FC<Props> = ({ role, userName: fallbackName, onLogout }) => {
  const [tab, setTab] = useState<TabKey>('overview');
  const [userName, setUserName] = useState(fallbackName);

  useEffect(() => {
    const uid = auth?.currentUser?.uid;
    if (!uid) return;
    getDoc(doc(db, 'users', uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        const name = data.name || data.companyName || fallbackName;
        setUserName(name);
      }
    }).catch(() => {});
  }, [fallbackName]);

  const badges: Partial<Record<TabKey, number>> = {};

  const av = avatarGrad(userName);
  const ini = initial(userName);

  const renderContent = () => {
    switch (tab) {
      case 'overview': return <OverviewPage role={role} userName={userName} />;
      case 'users': return <UsersPage />;
      case 'connections': return <ConnectionsPage role={role} />;
      case 'chat': return <ChatPage role={role} />;
      case 'profile': return <ProfileTab role={role} />;
      case 'settings': return <SettingsPage role={role} onLogout={onLogout} />;
    }
  };

  return (
    <div dir="rtl" style={{ fontFamily: "'Assistant',sans-serif", display: 'flex', minHeight: '100vh', height: '100vh', background: '#F5F6F8', color: '#1B2333' }}>
      {/* Sidebar */}
      <aside style={{ width: 250, flexShrink: 0, background: '#fff', borderLeft: '1px solid #EAECEF', display: 'flex', flexDirection: 'column', padding: '22px 16px', height: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '4px 10px 22px' }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: '#7B2FF6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>T</div>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '.5px', color: '#7B2FF6' }}>TEENWORK</div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9AA3B2', padding: '0 12px 9px', letterSpacing: '.4px' }}>תפריט</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV[role].map(([key, label, ic]) => {
            const active = tab === key;
            const badge = badges[key] || 0;
            return (
              <button key={key} onClick={() => setTab(key)} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', border: 'none', cursor: 'pointer', textAlign: 'right', padding: '11px 12px', borderRadius: 11, fontFamily: 'inherit', fontSize: 15, background: active ? '#F3ECFE' : 'transparent', color: active ? '#5A18C2' : '#4A576E', fontWeight: active ? 700 : 600, transition: 'background .14s' }}>
                <span style={{ display: 'flex' }}>{DIcon(ic, { size: 19, color: active ? '#6A1FD0' : '#7A8699' })}</span>
                <span style={{ flex: 1 }}>{label}</span>
                {badge > 0 && <span style={{ minWidth: 20, height: 20, padding: '0 6px', borderRadius: 10, background: '#7B2FF6', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</span>}
              </button>
            );
          })}
        </nav>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 11px', borderRadius: 13, background: '#F7F8FA' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: av, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>{ini}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
              <div style={{ fontSize: 12, color: '#8A93A3' }}>{ROLE_LABEL[role]}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1px solid #E6E8ED', background: '#fff', borderRadius: 11, padding: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, color: '#5A6478', fontWeight: 600 }}>
            <span style={{ display: 'flex' }}>{DIcon('logout', { size: 18, color: '#7A8699' })}</span>התנתקות
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Top bar */}
        <header style={{ height: 66, flexShrink: 0, background: '#fff', borderBottom: '1px solid #EAECEF', display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px' }}>
          <div style={{ flex: 1, maxWidth: 380, display: 'flex', alignItems: 'center', gap: 9, background: '#F4F5F7', border: '1px solid #ECEEF1', borderRadius: 12, padding: '9px 14px' }}>
            <span style={{ display: 'flex' }}>{DIcon('search', { size: 18, color: '#9AA3B2' })}</span>
            <input placeholder={SEARCH_PH[role]} style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontFamily: 'inherit', fontSize: 14, color: '#2A3242' }} />
          </div>
          <div style={{ flex: 1 }} />
          <button style={{ position: 'relative', width: 42, height: 42, borderRadius: 12, border: '1px solid #ECEEF1', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <span style={{ display: 'flex' }}>{DIcon('bell', { size: 19, color: '#5A6478' })}</span>
            <span style={{ position: 'absolute', top: 9, right: 10, width: 8, height: 8, borderRadius: '50%', background: '#E23B4E', border: '2px solid #fff' }} />
          </button>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: av, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>{ini}</div>
        </header>

        {/* Content */}
        {renderContent()}
      </main>
    </div>
  );
};

export default DashboardLayout;
