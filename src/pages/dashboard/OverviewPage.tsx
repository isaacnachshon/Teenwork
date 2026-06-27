import React, { useState, useEffect } from 'react';
import { DIcon } from '@/components/DashboardIcons';
import { DashRole, avatarGrad, initial } from '@/types/dashboard';
import { db } from '@/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

interface Props {
  role: DashRole;
  userName: string;
}

const MONTHS_HE = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יוני', 'יולי', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];

function computeMonthlyCount(dates: Date[], n: number): { label: string; value: number }[] {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    const count = dates.filter(dt => dt?.getMonth() === d.getMonth() && dt?.getFullYear() === d.getFullYear()).length;
    return { label: MONTHS_HE[d.getMonth()], value: count };
  });
}

const FEEDS: Record<DashRole, { t: string; m: string }[]> = {
  admin: [
    { t: 'אור לוי התחיל עבודה בקפה ביאליק', m: 'לפני 12 דק׳' },
    { t: 'מעסיק חדש נרשם: פיצה רומא', m: 'לפני שעה' },
    { t: 'שיחה סומנה אוטומטית למניעת קשר חיצוני', m: 'לפני שעה' },
    { t: 'רוני שגב סיים עבודה באולם לב העיר', m: 'אתמול' },
  ],
  employer: [
    { t: 'אישרת את אור לוי למשמרת ניסיון', m: 'לפני 20 דק׳' },
    { t: 'הודעה חדשה מדנה כהן', m: 'לפני שעה' },
    { t: 'משרת קופאות פורסמה בהצלחה', m: 'אתמול' },
  ],
  teen: [
    { t: 'אושרת למשמרת ניסיון בקפה ביאליק', m: 'לפני 20 דק׳' },
    { t: 'הצעת עבודה חדשה: משלוחים — פיצה רומא', m: 'לפני 3 שעות' },
    { t: 'קיבלת דירוג 5 כוכבים מספרים ועוד', m: 'אתמול' },
  ],
};

interface SideItem {
  isAvatar?: boolean;
  isIcon?: boolean;
  av?: string;
  ini?: string;
  iconEl?: React.ReactElement;
  iconBg?: string;
  t1: string;
  t2: string;
  cta: string;
}

function getSideCard(role: DashRole, pendingTeens: number, pendingEmps: number): { title: string; items: SideItem[] } {
  if (role === 'admin') {
    return {
      title: 'דורש טיפול', items: [
        { isIcon: true, iconEl: DIcon('shield', { size: 18, color: '#B5740A' }), iconBg: '#FBF0DA', t1: pendingTeens + ' נערים ממתינים לאימות', t2: 'נדרש אישור גיל והורים', cta: 'אימות' },
        { isIcon: true, iconEl: DIcon('flag', { size: 18, color: '#C8364A' }), iconBg: '#FBE7EA', t1: 'שיחה אחת סומנה לבדיקה', t2: 'דנה כהן · בקשת קשר חיצוני', cta: 'בדיקה' },
        { isIcon: true, iconEl: DIcon('briefcase', { size: 18, color: '#2D6BE0' }), iconBg: '#E8F0FE', t1: pendingEmps + ' מעסיקים חדשים', t2: 'ממתינים לאישור פרופיל', cta: 'צפייה' },
      ]
    };
  }
  if (role === 'employer') {
    return {
      title: 'מועמדויות אחרונות', items: [
        { isAvatar: true, av: avatarGrad('דנה כהן'), ini: initial('דנה כהן'), t1: 'דנה כהן', t2: 'קופאות · לפני שעתיים', cta: 'צפייה' },
        { isAvatar: true, av: avatarGrad('תומר אבני'), ini: initial('תומר אבני'), t1: 'תומר אבני', t2: 'משלוחים · אתמול', cta: 'צפייה' },
        { isAvatar: true, av: avatarGrad('מאיה גל'), ini: initial('מאיה גל'), t1: 'מאיה גל', t2: 'מלצרות · אתמול', cta: 'צפייה' },
      ]
    };
  }
  return {
    title: 'העבודות שלי', items: [
      { isAvatar: true, av: avatarGrad('קפה ביאליק'), ini: initial('קפה ביאליק'), t1: 'קפה ביאליק', t2: 'מלצרות · פעיל', cta: 'פתח' },
      { isAvatar: true, av: avatarGrad('ספרים ועוד'), ini: initial('ספרים ועוד'), t1: 'ספרים ועוד', t2: 'מכירות · פעיל', cta: 'פתח' },
    ]
  };
}

const OverviewPage: React.FC<Props> = ({ role, userName }) => {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [teenCount, setTeenCount] = useState<number | null>(null);
  const [empCount, setEmpCount] = useState<number | null>(null);
  const [jobsCount, setJobsCount] = useState<number | null>(null);
  const [appsCount, setAppsCount] = useState<number | null>(null);
  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([]);
  const [pendingTeens, setPendingTeens] = useState(0);
  const [pendingEmps, setPendingEmps] = useState(0);

  useEffect(() => {
    if (role !== 'admin') return;
    (async () => {
      try {
        const [teenSnap, empSnap, jobsSnap, appsSnap] = await Promise.all([
          getDocs(query(collection(db, 'users'), where('role', '==', 'teen'))),
          getDocs(query(collection(db, 'users'), where('role', '==', 'employer'))),
          getDocs(collection(db, 'jobs')),
          getDocs(collection(db, 'applications')),
        ]);
        setTeenCount(teenSnap.size);
        setEmpCount(empSnap.size);
        setTotalUsers(teenSnap.size + empSnap.size);
        setJobsCount(jobsSnap.size);
        setAppsCount(appsSnap.size);

        const allDates = [...teenSnap.docs, ...empSnap.docs]
          .map(d => { const ts = d.data().createdAt; return ts instanceof Timestamp ? ts.toDate() : null; })
          .filter(Boolean) as Date[];
        setChartData(computeMonthlyCount(allDates, 6));

        let pt = 0, pe = 0;
        teenSnap.docs.forEach(d => { if (d.data().status === 'pending') pt++; });
        empSnap.docs.forEach(d => { if (d.data().status === 'pending') pe++; });
        setPendingTeens(pt);
        setPendingEmps(pe);
      } catch (err) {
        console.error('Error fetching overview data:', err);
      }
    })();
  }, [role]);

  const TITLES: Record<DashRole, [string, string]> = {
    admin: ['לוח בקרה — ניהול מערכת', 'סקירה כללית של פעילות הפלטפורמה'],
    employer: ['שלום, ' + userName, 'סקירת המשרות והמועמדים שלך'],
    teen: ['בוקר טוב, ' + userName, 'העבודות וההזדמנויות שלך'],
  };
  const [pageTitle, pageSub] = TITLES[role];

  type StatDef = { icon: string; label: string; value: string; delta: string; color: string; bg: string };
  let stats: StatDef[];
  if (role === 'admin') {
    stats = [
      { icon: 'users', label: 'סה"כ משתמשים', value: totalUsers !== null ? totalUsers.toLocaleString() : '...', delta: '', color: '#7B2FF6', bg: '#F3ECFE' },
      { icon: 'user', label: 'נערים רשומים', value: teenCount !== null ? teenCount.toLocaleString() : '...', delta: '', color: '#2D6BE0', bg: '#E8F0FE' },
      { icon: 'briefcase', label: 'מעסיקים רשומים', value: empCount !== null ? empCount.toLocaleString() : '...', delta: '', color: '#0E8A48', bg: '#E4F5EA' },
      { icon: 'link', label: 'סה"כ משרות', value: jobsCount !== null ? jobsCount.toLocaleString() : '...', delta: '', color: '#E0588E', bg: '#FCE9F1' },
    ];
  } else if (role === 'employer') {
    stats = [
      { icon: 'briefcase', label: 'משרות פעילות', value: '4', delta: '', color: '#7B2FF6', bg: '#F3ECFE' },
      { icon: 'users', label: 'מועמדויות חדשות', value: '12', delta: '+4', color: '#2D6BE0', bg: '#E8F0FE' },
      { icon: 'user', label: 'נערים מועסקים', value: '3', delta: '', color: '#0E8A48', bg: '#E4F5EA' },
      { icon: 'clock', label: 'שעות החודש', value: '86', delta: '+9', color: '#E0588E', bg: '#FCE9F1' },
    ];
  } else {
    stats = [
      { icon: 'briefcase', label: 'עבודות פעילות', value: '2', delta: '', color: '#7B2FF6', bg: '#F3ECFE' },
      { icon: 'bell', label: 'הצעות חדשות', value: '5', delta: '+2', color: '#2D6BE0', bg: '#E8F0FE' },
      { icon: 'clock', label: 'שעות החודש', value: '34', delta: '', color: '#0E8A48', bg: '#E4F5EA' },
      { icon: 'wallet', label: 'רווח החודש', value: '₪1,240', delta: '+18%', color: '#E0588E', bg: '#FCE9F1' },
    ];
  }

  // Chart: use real data for admin, demo for others
  const DEMO_CHARTS: Record<string, { title: string; sub: string; vals: number[]; labels: string[] }> = {
    employer: { title: 'שעות עבודה — השבוע', sub: '86 שעות סה"כ', vals: [8, 6, 10, 7, 12, 9, 5], labels: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'] },
    teen: { title: 'רווח חודשי (₪)', sub: '₪1,240 החודש', vals: [320, 540, 610, 780, 1020, 1240], labels: ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יוני'] },
  };

  let chartTitle: string, chartSub: string, barData: { label: string; value: number }[];
  if (role === 'admin') {
    chartTitle = 'צמיחת משתמשים — 6 חודשים';
    chartSub = (totalUsers !== null ? totalUsers.toLocaleString() : '...') + ' משתמשים רשומים';
    barData = chartData.length > 0 ? chartData : Array.from({ length: 6 }, (_, i) => ({ label: MONTHS_HE[i], value: 0 }));
  } else {
    const demo = DEMO_CHARTS[role];
    chartTitle = demo.title;
    chartSub = demo.sub;
    barData = demo.vals.map((v, i) => ({ label: demo.labels[i], value: v }));
  }
  const cmax = Math.max(...barData.map(b => b.value), 1);

  const feed = FEEDS[role];
  const sideCard = getSideCard(role, pendingTeens, pendingEmps);

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '26px 30px 42px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 25, fontWeight: 800, letterSpacing: '-.4px' }}>{pageTitle}</h1>
          <div style={{ marginTop: 5, fontSize: 14, color: '#8A93A3' }}>{pageSub}</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 18 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, padding: '17px 18px', animation: 'pop .3s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{DIcon(s.icon, { size: 20, color: s.color })}</div>
              {s.delta && <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0E8A48', background: '#E4F5EA', padding: '3px 8px', borderRadius: 8 }}>{s.delta}</span>}
            </div>
            <div style={{ fontSize: 27, fontWeight: 800, marginTop: 14, letterSpacing: '-.5px' }}>{s.value}</div>
            <div style={{ fontSize: 13.5, color: '#8A93A3', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart + Side card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 16, marginBottom: 18 }}>
        <div style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{chartTitle}</div>
              <div style={{ fontSize: 13, color: '#8A93A3', marginTop: 2 }}>{chartSub}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 13, height: 160, paddingTop: 6 }}>
            {barData.map((b, i) => {
              const last = i === barData.length - 1;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ width: '100%', maxWidth: 38, borderRadius: '8px 8px 4px 4px', background: last ? '#7B2FF6' : '#E7DBFA', height: Math.round(b.value / cmax * 132) + 6, transition: 'height .35s' }} />
                  <div style={{ fontSize: 12, color: '#9AA3B2' }}>{b.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, padding: '18px 18px 6px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{sideCard.title}</div>
          {sideCard.items.map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 2px', borderBottom: '1px solid #F1F2F5' }}>
              {it.isAvatar && <div style={{ width: 38, height: 38, borderRadius: '50%', background: it.av, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>{it.ini}</div>}
              {it.isIcon && <div style={{ width: 38, height: 38, borderRadius: 11, background: it.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{it.iconEl}</div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{it.t1}</div>
                <div style={{ fontSize: 12.5, color: '#8A93A3', marginTop: 1 }}>{it.t2}</div>
              </div>
              <button style={{ fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: '#7B2FF6', background: 'transparent', border: 'none', cursor: 'pointer', flexShrink: 0 }}>{it.cta}</button>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, padding: '18px 22px 8px' }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>פעילות אחרונה</div>
        {feed.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid #F4F5F7' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7B2FF6', flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: 14, color: '#3A4456' }}>{f.t}</div>
            <div style={{ fontSize: 12.5, color: '#9AA3B2', flexShrink: 0 }}>{f.m}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverviewPage;
