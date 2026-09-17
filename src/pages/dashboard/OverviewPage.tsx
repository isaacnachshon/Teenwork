import React, { useState, useEffect } from 'react';
import { DIcon } from '@/components/DashboardIcons';
import { DashRole, avatarGrad, initial } from '@/types/dashboard';
import type { Job } from '@/types';
import { auth, db } from '@/firebase';
import { collection, query, where, getDocs, getDoc, doc, Timestamp } from 'firebase/firestore';
import { validateJob } from '@/utils/youthLaw';

interface Props {
  role: DashRole;
  userName: string;
}

const MONTHS_HE = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יוני', 'יולי', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];

interface MatchedJob extends Job {
  score: number;
  matchReasons: string[];
}

type TeenAppStatus = 'pending' | 'active' | 'completed' | 'rejected';

interface TeenApp {
  id: string;
  jobTitle: string;
  employerName: string;
  status: TeenAppStatus;
  hours: number;
}

const TEEN_STATUS_MAP: Record<string, TeenAppStatus> = {
  new: 'pending',
  viewed: 'pending',
  contacted: 'pending',
  interview: 'pending',
  accepted: 'active',
  rejected: 'rejected',
  completed: 'completed',
};

const TEEN_STATUS_META: Record<TeenAppStatus, { label: string; bg: string; color: string }> = {
  pending: { label: 'ממתין', bg: '#FBF0DA', color: '#B5740A' },
  active: { label: 'פעיל', bg: '#E4F5EA', color: '#0E8A48' },
  completed: { label: 'הושלם', bg: '#E8F0FE', color: '#2D6BE0' },
  rejected: { label: 'נדחה', bg: '#FBE7EA', color: '#C8364A' },
};

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isProfileComplete(profile: { skills?: string[]; preferredJobTypes?: string[] }): boolean {
  return (profile.skills || []).length > 0 || (profile.preferredJobTypes || []).length > 0;
}

function matchJobsToProfile(jobs: Job[], profile: { skills?: string[]; preferredJobTypes?: string[]; coordinates?: { lat: number; lng: number } }): MatchedJob[] {
  const teenSkills = (profile.skills || []).map(s => s.trim());
  const preferredTypes = profile.preferredJobTypes || [];

  const scored = jobs.map(job => {
    let score = 0;
    const reasons: string[] = [];

    if (preferredTypes.includes(job.type)) {
      score += 3;
      reasons.push(`תחום מועדף: ${job.type}`);
    }

    const matchedSkills = (job.skills || []).filter(skill =>
      teenSkills.some(ts => ts.includes(skill) || skill.includes(ts))
    );
    if (matchedSkills.length > 0) {
      score += matchedSkills.length;
      reasons.push(`כישורים תואמים: ${matchedSkills.join(', ')}`);
    }

    let distance: number | undefined;
    if (job.coordinates && profile.coordinates) {
      distance = haversineKm(profile.coordinates.lat, profile.coordinates.lng, job.coordinates.lat, job.coordinates.lng);
      if (distance < 15) {
        score += 1;
        reasons.push('קרוב אלייך');
      }
    }

    return { ...job, distance, score, matchReasons: reasons };
  });

  const byRelevance = (a: MatchedJob, b: MatchedJob) =>
    b.score - a.score || (a.distance ?? Infinity) - (b.distance ?? Infinity);

  const matched = scored.filter(j => j.score > 0).sort(byRelevance);
  if (matched.length >= 6 || !isProfileComplete(profile)) return matched.slice(0, 6);

  // Fallback: once the profile is complete, always surface jobs — fill the
  // remaining slots with the closest available jobs so the teen never sees an
  // empty "jobs for you" section after completing their profile.
  const fallback = scored
    .filter(j => j.score === 0)
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
    .map(j => ({ ...j, matchReasons: j.matchReasons.length ? j.matchReasons : ['משרה זמינה'] }));

  return [...matched, ...fallback].slice(0, 6);
}

function timeAgoHe(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'זה עתה';
  const m = Math.floor(s / 60);
  if (m === 1) return 'לפני דקה';
  if (m < 60) return `לפני ${m} דק׳`;
  const h = Math.floor(m / 60);
  if (h === 1) return 'לפני שעה';
  if (h < 24) return `לפני ${h} שעות`;
  const days = Math.floor(h / 24);
  if (days === 1) return 'אתמול';
  if (days < 30) return `לפני ${days} ימים`;
  const mo = Math.floor(days / 30);
  if (mo === 1) return 'לפני חודש';
  if (mo < 12) return `לפני ${mo} חודשים`;
  const y = Math.floor(mo / 12);
  return y === 1 ? 'לפני שנה' : `לפני ${y} שנים`;
}

interface ActivityItem {
  text: string;
  when: Date;
}

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
  const [flaggedReports, setFlaggedReports] = useState(0);
  const [appsWithoutConsent, setAppsWithoutConsent] = useState(0);
  const [illegalJobs, setIllegalJobs] = useState(0);
  const [blockedUsers, setBlockedUsers] = useState(0);
  const [adminActivity, setAdminActivity] = useState<ActivityItem[] | null>(null);
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[] | null>(null);
  const [teenApps, setTeenApps] = useState<TeenApp[] | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    if (role !== 'teen') return;
    const uid = auth?.currentUser?.uid;
    if (!uid) { setMatchedJobs([]); setTeenApps([]); return; }
    (async () => {
      try {
        const [profileSnap, jobsSnap, appsSnap] = await Promise.all([
          getDoc(doc(db, 'users', uid)),
          getDocs(collection(db, 'jobs')),
          getDocs(query(collection(db, 'applications'), where('applicantId', '==', uid))),
        ]);
        const profile = profileSnap.exists() ? profileSnap.data() : {};
        const jobs = jobsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Job[];
        setProfileComplete(isProfileComplete(profile));
        setMatchedJobs(matchJobsToProfile(jobs, profile));

        const apps: TeenApp[] = appsSnap.docs.map(d => {
          const data = d.data() as Record<string, any>;
          return {
            id: d.id,
            jobTitle: data.jobTitle || 'משרה',
            employerName: data.employerName || data.companyName || 'מעסיק',
            status: TEEN_STATUS_MAP[data.status || 'new'] || 'pending',
            hours: data.hours || 0,
          };
        });
        setTeenApps(apps);
      } catch (err) {
        console.error('Error fetching teen overview data:', err);
        setMatchedJobs([]);
        setTeenApps([]);
      }
    })();
  }, [role]);

  useEffect(() => {
    if (role !== 'admin') return;
    (async () => {
      try {
        const [teenSnap, empSnap, jobsSnap, appsSnap, reportsSnap] = await Promise.all([
          getDocs(query(collection(db, 'users'), where('role', '==', 'teen'))),
          getDocs(query(collection(db, 'users'), where('role', '==', 'employer'))),
          getDocs(collection(db, 'jobs')),
          getDocs(collection(db, 'applications')),
          getDocs(collection(db, 'reports')).catch(() => null),
        ]);
        setTeenCount(teenSnap.size);
        setEmpCount(empSnap.size);
        setTotalUsers(teenSnap.size + empSnap.size);
        setJobsCount(jobsSnap.size);
        setAppsCount(appsSnap.size);

        const toDate = (ts: any): Date | null => (ts instanceof Timestamp ? ts.toDate() : null);

        const allDates = [...teenSnap.docs, ...empSnap.docs]
          .map(d => toDate(d.data().createdAt))
          .filter(Boolean) as Date[];
        setChartData(computeMonthlyCount(allDates, 6));

        let pt = 0, pe = 0;
        teenSnap.docs.forEach(d => { if (d.data().parentalConsentStatus !== 'approved') pt++; });
        empSnap.docs.forEach(d => { if (d.data().status === 'pending') pe++; });
        setPendingTeens(pt);
        setPendingEmps(pe);
        setFlaggedReports(reportsSnap ? reportsSnap.docs.filter(d => d.data().status === 'pending').length : 0);

        // Youth-law compliance flags (should all be 0 in a healthy system).
        const consentByUid: Record<string, string> = {};
        teenSnap.docs.forEach(d => { consentByUid[d.id] = d.data().parentalConsentStatus; });
        setAppsWithoutConsent(appsSnap.docs.filter(d => {
          const a = d.data();
          return a.consentVerified !== true || consentByUid[a.applicantId] !== 'approved';
        }).length);
        setIllegalJobs(jobsSnap.docs.filter(d => {
          const j = d.data();
          return validateJob({ salary: Number(j.salary), minAge: Number(j.minAge ?? 16), startTime: j.startTime || '', endTime: j.endTime || '', days: j.days || [] }).length > 0;
        }).length);
        setBlockedUsers([...teenSnap.docs, ...empSnap.docs].filter(d => d.data().status === 'blocked').length);

        // Build a real activity feed from actual registrations, jobs and applications.
        const acts: ActivityItem[] = [];
        teenSnap.docs.forEach(d => { const dt = toDate(d.data().createdAt); if (dt) acts.push({ text: `${d.data().name || 'נוער'} נרשם/ה כנוער`, when: dt }); });
        empSnap.docs.forEach(d => { const dt = toDate(d.data().createdAt); if (dt) acts.push({ text: `${d.data().companyName || 'מעסיק'} נרשם כמעסיק`, when: dt }); });
        jobsSnap.docs.forEach(d => { const dt = toDate(d.data().createdAt); if (dt) acts.push({ text: `משרה חדשה פורסמה: ${d.data().title || 'משרה'}`, when: dt }); });
        appsSnap.docs.forEach(d => { const dt = toDate(d.data().createdAt); if (dt) acts.push({ text: `מועמדות חדשה ל${d.data().jobTitle || 'משרה'}`, when: dt }); });
        acts.sort((a, b) => b.when.getTime() - a.when.getTime());
        setAdminActivity(acts.slice(0, 7));
      } catch (err) {
        console.error('Error fetching overview data:', err);
        setAdminActivity([]);
      }
    })();
  }, [role]);

  const TITLES: Record<DashRole, [string, string]> = {
    admin: ['לוח בקרה — ניהול מערכת', 'סקירה כללית של פעילות הפלטפורמה'],
    employer: ['שלום, ' + userName, 'סקירת המשרות והמועמדים שלך'],
    teen: ['בוקר טוב, ' + userName, 'העבודות וההזדמנויות שלך'],
  };
  const [pageTitle, pageSub] = TITLES[role];

  // Teen overview — real data only. The page fills up as the teen applies and gets hired.
  if (role === 'teen') {
    const activeJobs = teenApps ? teenApps.filter(a => a.status === 'active') : [];
    const pendingCount = teenApps ? teenApps.filter(a => a.status === 'pending').length : 0;
    const completedCount = teenApps ? teenApps.filter(a => a.status === 'completed').length : 0;
    const totalHours = teenApps
      ? teenApps.filter(a => a.status === 'active' || a.status === 'completed').reduce((sum, a) => sum + (a.hours || 0), 0)
      : 0;

    const teenStats = [
      { icon: 'briefcase', label: 'עבודות פעילות', value: activeJobs.length, color: '#7B2FF6', bg: '#F3ECFE' },
      { icon: 'clock', label: 'מועמדויות ממתינות', value: pendingCount, color: '#2D6BE0', bg: '#E8F0FE' },
      { icon: 'star', label: 'עבודות שהושלמו', value: completedCount, color: '#0E8A48', bg: '#E4F5EA' },
      { icon: 'clock', label: 'שעות שנצברו', value: totalHours, color: '#E0588E', bg: '#FCE9F1' },
    ];

    return (
      <div className="tw-page" style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '26px 30px 42px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 25, fontWeight: 800, letterSpacing: '-.4px' }}>{pageTitle}</h1>
            <div style={{ marginTop: 5, fontSize: 14, color: '#8A93A3' }}>{pageSub}</div>
          </div>
        </div>

        {/* KPI Cards — real counts from the teen's applications */}
        <div className="tw-kpi-grid">
          {teenStats.map((s, i) => (
            <div key={i} className="tw-card" style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, padding: '17px 18px', animation: 'pop .3s both' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{DIcon(s.icon, { size: 20, color: s.color })}</div>
              <div style={{ fontSize: 27, fontWeight: 800, marginTop: 14, letterSpacing: '-.5px' }}>{teenApps === null ? '...' : s.value}</div>
              <div style={{ fontSize: 13.5, color: '#8A93A3', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Active jobs — only appears once an employer has accepted the teen */}
        <div className="tw-card" style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, padding: '18px 22px', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#E4F5EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{DIcon('briefcase', { size: 17, color: '#0E8A48' })}</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>העבודות הפעילות שלי</div>
            {activeJobs.length > 0 && <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0E8A48', background: '#E4F5EA', padding: '3px 9px', borderRadius: 9 }}>{activeJobs.length}</span>}
          </div>
          {teenApps === null ? (
            <div style={{ fontSize: 14, color: '#8A93A3', padding: '8px 0' }}>טוען...</div>
          ) : activeJobs.length === 0 ? (
            <div className="tw-empty-inline">
              <span className="tw-empty-inline-dot" aria-hidden />
              <span>עדיין אין לך עבודה פעילה. הגישו מועמדות למשרה מתאימה — ברגע שמעסיק יאשר אתכם, העבודה תופיע כאן.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {activeJobs.map(app => {
                const meta = TEEN_STATUS_META[app.status];
                return (
                  <div key={app.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 2px', borderBottom: '1px solid #F1F2F5' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: avatarGrad(app.employerName), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>{initial(app.employerName)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{app.jobTitle}</div>
                      <div style={{ fontSize: 12.5, color: '#8A93A3', marginTop: 1 }}>{app.employerName}{app.hours > 0 ? ` · ${app.hours} שעות` : ''}</div>
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: meta.bg, color: meta.color, padding: '5px 11px', borderRadius: 9, fontSize: 12.5, fontWeight: 700, flexShrink: 0 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color }} />{meta.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Matched jobs — discovery, helps the teen find work to apply to */}
        <div className="tw-card" style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#F3ECFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{DIcon('star', { size: 17, color: '#7B2FF6' })}</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>משרות מתאימות עבורך</div>
            {matchedJobs && matchedJobs.length > 0 && <span style={{ fontSize: 12.5, fontWeight: 700, color: '#7B2FF6', background: '#F3ECFE', padding: '3px 9px', borderRadius: 9 }}>{matchedJobs.length}</span>}
          </div>
          {matchedJobs === null ? (
            <div style={{ fontSize: 14, color: '#8A93A3', padding: '8px 0' }}>מחפש משרות מתאימות...</div>
          ) : matchedJobs.length === 0 ? (
            <div className="tw-empty-inline">
              <span className="tw-empty-inline-dot" aria-hidden />
              <span>{profileComplete
                ? 'עדיין אין משרות זמינות במערכת. חזרו לכאן בקרוב — ברגע שיתווספו משרות, נציג לכם את המתאימות ביותר.'
                : 'השלימו את הפרופיל שלכם — הוסיפו כישורים ותחומי עבודה מועדפים — וכאן יופיעו המשרות שמתאימות לכם.'}</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {matchedJobs.map(job => (
                <div key={job.id} style={{ border: '1px solid #EEF0F3', borderRadius: 14, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8, background: '#FDFDFE' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: avatarGrad(job.company), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0, fontSize: 15 }}>{initial(job.company)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</div>
                      <div style={{ fontSize: 12.5, color: '#8A93A3' }}>{job.company}</div>
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#5A18C2', background: '#F3ECFE', padding: '3px 8px', borderRadius: 8, flexShrink: 0 }}>{job.type}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12.5, color: '#5A6478' }}>
                    <span>📍 {job.location}{job.distance !== undefined ? ` · ${job.distance.toFixed(1)} ק"מ` : ''}</span>
                    <span style={{ fontWeight: 700 }}>₪{job.salary}/שעה</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {job.matchReasons.map(r => (
                      <span key={r} style={{ fontSize: 11.5, fontWeight: 600, color: '#0E8A48', background: '#E4F5EA', padding: '2px 8px', borderRadius: 8 }}>✓ {r}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Admin overview — all figures pulled live from Firestore, no demo content.
  if (role === 'admin') {
    const adminStats = [
      { icon: 'users', label: 'סה"כ משתמשים', value: totalUsers, color: '#7B2FF6', bg: '#F3ECFE' },
      { icon: 'user', label: 'נערים רשומים', value: teenCount, color: '#2D6BE0', bg: '#E8F0FE' },
      { icon: 'briefcase', label: 'מעסיקים רשומים', value: empCount, color: '#0E8A48', bg: '#E4F5EA' },
      { icon: 'link', label: 'סה"כ משרות', value: jobsCount, color: '#E0588E', bg: '#FCE9F1' },
    ];

    const attention = [
      { show: true, icon: appsWithoutConsent > 0 ? 'alert' : 'check', color: appsWithoutConsent > 0 ? '#C8364A' : '#0E8A48', bg: appsWithoutConsent > 0 ? '#FBE7EA' : '#E4F5EA', t1: `${appsWithoutConsent} מועמדויות ללא אישור הורים`, t2: 'חוק עבודת הנוער — צריך להיות 0' },
      { show: true, icon: illegalJobs > 0 ? 'alert' : 'check', color: illegalJobs > 0 ? '#C8364A' : '#0E8A48', bg: illegalJobs > 0 ? '#FBE7EA' : '#E4F5EA', t1: `${illegalJobs} משרות עם שכר/שעות לא חוקיים`, t2: 'שכר מתחת למינימום, מעל 8 שעות, לילה או שבת' },
      { show: blockedUsers > 0, icon: 'ban', color: '#C8364A', bg: '#FBE7EA', t1: `${blockedUsers} משתמשים חסומים`, t2: 'נחסמו על ידי מנהל' },
      { show: pendingTeens > 0, icon: 'shield', color: '#B5740A', bg: '#FBF0DA', t1: `${pendingTeens} נערים ללא אישור הורים`, t2: 'ממתינים לאישור הורה או נדחו' },
      { show: pendingEmps > 0, icon: 'briefcase', color: '#2D6BE0', bg: '#E8F0FE', t1: `${pendingEmps} מעסיקים ממתינים לאישור`, t2: 'ממתינים לאישור פרופיל' },
      { show: flaggedReports > 0, icon: 'flag', color: '#C8364A', bg: '#FBE7EA', t1: `${flaggedReports} דיווחים ממתינים לבדיקה`, t2: 'דיווחים שהוגשו במערכת' },
    ].filter(a => a.show);

    const adminChart = chartData.length > 0 ? chartData : Array.from({ length: 6 }, (_, i) => ({ label: MONTHS_HE[i], value: 0 }));
    const acmax = Math.max(...adminChart.map(b => b.value), 1);

    return (
      <div className="tw-page" style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '26px 30px 42px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 25, fontWeight: 800, letterSpacing: '-.4px' }}>{pageTitle}</h1>
            <div style={{ marginTop: 5, fontSize: 14, color: '#8A93A3' }}>{pageSub}</div>
          </div>
        </div>

        {/* KPI Cards — live counts from Firestore */}
        <div className="tw-kpi-grid">
          {adminStats.map((s, i) => (
            <div key={i} className="tw-card" style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, padding: '17px 18px', animation: 'pop .3s both' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{DIcon(s.icon, { size: 20, color: s.color })}</div>
              <div style={{ fontSize: 27, fontWeight: 800, marginTop: 14, letterSpacing: '-.5px' }}>{s.value !== null ? s.value.toLocaleString() : '...'}</div>
              <div style={{ fontSize: 13.5, color: '#8A93A3', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Chart + requires-attention */}
        <div className="tw-split-grid">
          <div className="tw-card" style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, padding: '20px 22px' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>צמיחת משתמשים — 6 חודשים</div>
              <div style={{ fontSize: 13, color: '#8A93A3', marginTop: 2 }}>{(totalUsers !== null ? totalUsers.toLocaleString() : '...') + ' משתמשים רשומים'}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 13, height: 160, paddingTop: 6 }}>
              {adminChart.map((b, i) => {
                const last = i === adminChart.length - 1;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ width: '100%', maxWidth: 38, borderRadius: '8px 8px 4px 4px', background: last ? '#7B2FF6' : '#E7DBFA', height: Math.round(b.value / acmax * 132) + 6, transition: 'height .35s' }} />
                    <div style={{ fontSize: 12, color: '#9AA3B2' }}>{b.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="tw-card" style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, padding: '18px 18px 6px' }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>דורש טיפול</div>
            {attention.length === 0 ? (
              <div className="tw-empty-inline" style={{ margin: '6px 0 12px' }}>
                <span className="tw-empty-inline-dot" aria-hidden />
                <span>אין פריטים שדורשים טיפול כרגע ✓</span>
              </div>
            ) : attention.map((it, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 2px', borderBottom: '1px solid #F1F2F5' }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: it.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{DIcon(it.icon, { size: 18, color: it.color })}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{it.t1}</div>
                  <div style={{ fontSize: 12.5, color: '#8A93A3', marginTop: 1 }}>{it.t2}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed — real events from the platform */}
        <div className="tw-card" style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, padding: '18px 22px 8px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>פעילות אחרונה</div>
          {adminActivity === null ? (
            <div style={{ fontSize: 14, color: '#8A93A3', padding: '11px 0' }}>טוען...</div>
          ) : adminActivity.length === 0 ? (
            <div className="tw-empty-inline" style={{ margin: '8px 0 14px' }}>
              <span className="tw-empty-inline-dot" aria-hidden />
              <span>אין עדיין פעילות במערכת. ברגע שמשתמשים יירשמו, יפורסמו משרות או יוגשו מועמדויות — הכל יופיע כאן.</span>
            </div>
          ) : adminActivity.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid #F4F5F7' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7B2FF6', flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 14, color: '#3A4456' }}>{f.text}</div>
              <div style={{ fontSize: 12.5, color: '#9AA3B2', flexShrink: 0 }}>{timeAgoHe(f.when)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
    <div className="tw-page" style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '26px 30px 42px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 25, fontWeight: 800, letterSpacing: '-.4px' }}>{pageTitle}</h1>
          <div style={{ marginTop: 5, fontSize: 14, color: '#8A93A3' }}>{pageSub}</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="tw-kpi-grid">
        {stats.map((s, i) => (
          <div key={i} className="tw-card" style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, padding: '17px 18px', animation: 'pop .3s both' }}>
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
      <div className="tw-split-grid">
        <div className="tw-card" style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, padding: '20px 22px' }}>
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

        <div className="tw-card" style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, padding: '18px 18px 6px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{sideCard.title}</div>
          {sideCard.items.map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 2px', borderBottom: '1px solid #F1F2F5' }}>
              {it.isAvatar && <div style={{ width: 38, height: 38, borderRadius: '50%', background: it.av, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>{it.ini}</div>}
              {it.isIcon && <div style={{ width: 38, height: 38, borderRadius: 11, background: it.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{it.iconEl}</div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{it.t1}</div>
                <div style={{ fontSize: 12.5, color: '#8A93A3', marginTop: 1 }}>{it.t2}</div>
              </div>
              <button className="tw-btn-primary" style={{ fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: '#7B2FF6', background: 'transparent', border: 'none', cursor: 'pointer', flexShrink: 0 }}>{it.cta}</button>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="tw-card" style={{ background: '#fff', border: '1px solid #EEF0F3', borderRadius: 16, padding: '18px 22px 8px' }}>
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
