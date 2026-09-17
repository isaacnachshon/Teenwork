import React, { useState, useEffect } from 'react';
import { DIcon } from '@/components/DashboardIcons';
import NotificationsPanel from '@/components/NotificationsPanel';
import { DashRole, TabKey, avatarGrad, initial } from '@/types/dashboard';
import OverviewPage from '@/pages/dashboard/OverviewPage';
import EmployerDashboard from '@/pages/dashboard/EmployerDashboard';
import JobSearchPage from '@/pages/jobs/JobSearchPage';
import RankingsPage from '@/pages/dashboard/RankingsPage';
import ConnectionsPage from '@/pages/dashboard/ConnectionsPage';
import UsersPage from '@/pages/dashboard/UsersPage';
import ReportsPage from '@/pages/dashboard/ReportsPage';
import ChatPage from '@/pages/dashboard/ChatPage';
import ProfileTab from '@/pages/dashboard/ProfileTab';
import SettingsPage from '@/pages/dashboard/SettingsPage';
import AIAssistantPage from '@/pages/dashboard/AIAssistantPage';
import RightsInfoModal from '@/components/RightsInfoModal';
import { auth, db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { NotificationService } from '@/services/NotificationService';

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
  admin: [['overview', 'סקירה כללית', 'overview'], ['users', 'ניהול משתמשים', 'users'], ['reports', 'דיווחים', 'flag'], ['connections', 'התקשרויות', 'link'], ['chat', "ניהול צ'אט", 'chat'], ['settings', 'הגדרות', 'gear']],
  employer: [['overview', 'סקירה', 'overview'], ['jobs', 'ניהול משרות', 'link'], ['connections', 'מועמדים והעסקות', 'link'], ['chat', 'הודעות', 'chat'], ['settings', 'הגדרות', 'gear']],
  teen: [['overview', 'סקירה', 'overview'], ['jobs', 'חיפוש משרות', 'search'], ['connections', 'העבודות שלי', 'link'], ['chat', 'הודעות', 'chat'], ['ai', 'עוזר AI', 'star'], ['settings', 'הגדרות', 'gear']],
};

const SEARCH_PH: Record<DashRole, string> = {
  admin: 'חיפוש משתמש, התקשרות או שיחה...',
  employer: 'חיפוש מועמד או הודעה...',
  teen: 'חיפוש עבודה...',
};

const MOBILE_MQ = '(max-width: 767px)';

const DashboardLayout: React.FC<Props> = ({ role, userName: fallbackName, onLogout }) => {
  const [tab, setTab] = useState<TabKey>('overview');
  const [userName, setUserName] = useState(fallbackName);
  const [showRightsModal, setShowRightsModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_MQ).matches : false
  );

  const uid = auth?.currentUser?.uid || '';

  useEffect(() => {
    if (!uid) return;
    getDoc(doc(db, 'users', uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setUserName(data.name || data.companyName || fallbackName);
      }
    }).catch(() => {});
  }, [fallbackName]);

  useEffect(() => {
    if (!uid) return;
    const unsub = NotificationService.onUserNotifications(uid, (notifs) => {
      setUnreadCount(notifs.filter(n => !n.read).length);
    });
    return unsub;
  }, [uid]);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const onChange = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false);
    };
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!isMobile || !menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isMobile, menuOpen]);

  const badges: Partial<Record<TabKey, number>> = {};
  const av = avatarGrad(userName);
  const ini = initial(userName);

  const goTab = (key: TabKey) => {
    setTab(key);
    setMenuOpen(false);
  };

  const renderContent = () => {
    switch (tab) {
      case 'overview': return <OverviewPage role={role} userName={userName} />;
      case 'jobs': return role === 'employer' ? <EmployerDashboard embedded onLogout={onLogout} /> : role === 'teen' ? <JobSearchPage /> : null;
      case 'users': return <UsersPage />;
      case 'reports': return role === 'admin' ? <ReportsPage /> : null;
      case 'rankings': return <RankingsPage />;
      case 'connections': return <ConnectionsPage role={role} />;
      case 'chat': return <ChatPage role={role} />;
      case 'profile': return <ProfileTab role={role} />;
      case 'ai': return <AIAssistantPage />;
      case 'settings': return <SettingsPage role={role} onLogout={onLogout} />;
    }
  };

  const asideStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed',
        top: 0,
        bottom: 0,
        right: 0,
        width: 'min(280px, 86vw)',
        zIndex: 60,
        background: '#fff',
        borderLeft: '1px solid #EAECEF',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 12px',
        height: '100vh',
        transform: menuOpen ? 'translateX(0)' : 'translateX(110%)',
        transition: 'transform .22s ease',
        boxShadow: menuOpen ? '-8px 0 28px rgba(27,35,51,.18)' : 'none',
        overflowY: 'auto',
      }
    : {
        width: 260,
        flexShrink: 0,
        background: '#fff',
        borderLeft: '1px solid #EAECEF',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 14px',
        height: '100vh',
      };

  return (
    <div
      dir="rtl"
      className={`tw-dash${isMobile && menuOpen ? ' tw-dash--menu-open' : ''}`}
      style={{
        fontFamily: "'Assistant',sans-serif",
        display: 'flex',
        minHeight: '100vh',
        height: '100vh',
        background: '#F5F6F8',
        color: '#1B2333',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Mobile backdrop */}
      {isMobile && menuOpen && (
        <button
          type="button"
          aria-label="סגור תפריט"
          className="tw-dash-backdrop"
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 55,
            background: 'rgba(27,35,51,.45)',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        />
      )}

      {/* Sidebar */}
      <aside className="tw-dash-sidebar" style={asideStyle} aria-hidden={isMobile && !menuOpen}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px 20px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #7B2FF6, #5560FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 17, boxShadow: '0 3px 10px rgba(123,47,246,.25)', flexShrink: 0 }}>T</div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '.5px', color: '#7B2FF6' }}>TEENWORK</div>
          </div>
          {isMobile && (
            <button
              type="button"
              aria-label="סגור תפריט"
              onClick={() => setMenuOpen(false)}
              style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid #E6E8ED', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
            >
              {DIcon('close', { size: 18, color: '#5A6478' })}
            </button>
          )}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#B0B8C7', padding: '0 14px 8px', letterSpacing: '.5px', textTransform: 'uppercase' as const }}>תפריט</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV[role].map(([key, label, ic]) => {
            const active = tab === key;
            const badge = badges[key] || 0;
            return (
              <button key={key} className="tw-nav-btn" onClick={() => goTab(key)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', border: active ? '1px solid #E8DAF8' : '1px solid transparent', cursor: 'pointer', textAlign: 'right', padding: '12px 14px', borderRadius: 12, fontFamily: 'inherit', fontSize: 15, background: active ? '#F3ECFE' : 'transparent', color: active ? '#5A18C2' : '#4A576E', fontWeight: active ? 700 : 500, transition: 'all .15s', boxShadow: active ? '0 2px 8px rgba(123,47,246,.08)' : 'none', minHeight: 48 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: active ? '#E8DAF8' : '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}>
                  {DIcon(ic, { size: 17, color: active ? '#6A1FD0' : '#7A8699' })}
                </div>
                <span style={{ flex: 1 }}>{label}</span>
                {badge > 0 && <span style={{ minWidth: 20, height: 20, padding: '0 6px', borderRadius: 10, background: '#7B2FF6', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</span>}
              </button>
            );
          })}
        </nav>
        <button className="tw-nav-btn" onClick={() => goTab('rankings')} style={{ padding: 12, border: 0, borderRadius: 12, background: tab === 'rankings' ? '#F3ECFE' : '#fff', textAlign: 'right', fontFamily: 'inherit', minHeight: 44 }}>דירוגים</button>
        {role === 'teen' && (
          <button className="tw-nav-btn" onClick={() => { setShowRightsModal(true); setMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', border: '1px solid #E8DAF8', cursor: 'pointer', textAlign: 'right', padding: '11px 12px', borderRadius: 11, fontFamily: 'inherit', fontSize: 15, background: '#FAF5FF', color: '#7B2FF6', fontWeight: 700, marginTop: 12, transition: 'background .14s', minHeight: 48 }}>
            <span style={{ display: 'flex' }}>{DIcon('scale', { size: 19, color: '#7B2FF6' })}</span>
            <span style={{ flex: 1 }}>זכויות נוער</span>
          </button>
        )}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="tw-nav-btn" onClick={() => goTab('profile')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 11px', borderRadius: 13, background: tab === 'profile' ? '#F3ECFE' : '#F7F8FA', border: tab === 'profile' ? '1px solid #E8DAF8' : '1px solid transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', width: '100%', transition: 'all .15s', minHeight: 56 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: av, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>{ini}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: tab === 'profile' ? '#5A18C2' : '#1B2333' }}>{userName}</div>
              <div style={{ fontSize: 12, color: tab === 'profile' ? '#7B2FF6' : '#8A93A3' }}>{ROLE_LABEL[role]} · הפרופיל שלי</div>
            </div>
          </button>
          <button className="tw-btn-ghost" onClick={onLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1px solid #E6E8ED', background: '#fff', borderRadius: 11, padding: 12, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, color: '#5A6478', fontWeight: 600, minHeight: 44 }}>
            <span style={{ display: 'flex' }}>{DIcon('logout', { size: 18, color: '#7A8699' })}</span>התנתקות
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', overflow: 'hidden' }}>
        {/* Top bar */}
        <header
          className="tw-dash-topbar"
          style={{
            minHeight: 66,
            flexShrink: 0,
            background: '#fff',
            borderBottom: '1px solid #EAECEF',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: isMobile ? '10px 12px' : '0 24px',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
          }}
        >
          {isMobile && (
            <button
              type="button"
              aria-label="פתח תפריט"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              style={{ width: 44, height: 44, borderRadius: 12, border: '1px solid #ECEEF1', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
            >
              {DIcon('menu', { size: 20, color: '#5A6478' })}
            </button>
          )}
          <div
            className="tw-dash-search"
            style={{
              flex: 1,
              maxWidth: isMobile ? 'none' : 380,
              minWidth: isMobile ? 0 : undefined,
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              background: '#F4F5F7',
              border: '1px solid #ECEEF1',
              borderRadius: 12,
              padding: isMobile ? '10px 12px' : '9px 14px',
              order: isMobile ? 3 : 0,
              width: isMobile ? '100%' : undefined,
              flexBasis: isMobile ? '100%' : undefined,
            }}
          >
            <span style={{ display: 'flex' }}>{DIcon('search', { size: 18, color: '#9AA3B2' })}</span>
            <input placeholder={SEARCH_PH[role]} style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontFamily: 'inherit', fontSize: 14, color: '#2A3242', minWidth: 0 }} />
          </div>
          {!isMobile && <div style={{ flex: 1 }} />}
          <div style={{ position: 'relative', marginInlineStart: isMobile ? 'auto' : 0 }}>
            <button onClick={() => setShowNotifications(!showNotifications)} style={{ position: 'relative', width: 44, height: 44, borderRadius: 12, border: `1px solid ${showNotifications ? '#7B2FF6' : '#ECEEF1'}`, background: showNotifications ? '#F3ECFE' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <span style={{ display: 'flex' }}>{DIcon('bell', { size: 19, color: showNotifications ? '#7B2FF6' : '#5A6478' })}</span>
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: 6, right: 6, minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9, background: '#E23B4E', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <NotificationsPanel userId={uid} isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
          </div>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: av, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>{ini}</div>
        </header>

        {/* Content */}
        <div className="tw-page-enter tw-dash-content" key={tab} style={{ flex: 1, minHeight: 0, minWidth: 0, overflowX: 'hidden', overflowY: 'auto', width: '100%' }}>
          {renderContent()}
        </div>
      </main>
      {role === 'teen' && <RightsInfoModal isOpen={showRightsModal} onClose={() => setShowRightsModal(false)} />}
    </div>
  );
};

export default DashboardLayout;
