export type DashRole = 'admin' | 'employer' | 'teen';
export type TabKey = 'overview' | 'users' | 'connections' | 'chat';
export type ConnStatus = 'pending' | 'active' | 'completed' | 'rejected';
export type UserStatus = 'verified' | 'pending' | 'blocked';

export interface StatusMeta {
  label: string;
  color: string;
  bg: string;
}

export interface UserStatusMeta extends StatusMeta {
  icon: string;
}

export const CONN_STATUS: Record<ConnStatus, StatusMeta> = {
  active: { label: 'פעיל', color: '#0E8A48', bg: '#E4F5EA' },
  pending: { label: 'ממתין לאישור', color: '#B5740A', bg: '#FBF0DA' },
  completed: { label: 'הושלם', color: '#4E5BD6', bg: '#EAECFE' },
  rejected: { label: 'נדחה', color: '#C8364A', bg: '#FBE7EA' },
};

export const USER_STATUS: Record<UserStatus, UserStatusMeta> = {
  verified: { label: 'מאומת', color: '#0E8A48', bg: '#E4F5EA', icon: 'check' },
  pending: { label: 'ממתין לאימות', color: '#B5740A', bg: '#FBF0DA', icon: 'clock' },
  blocked: { label: 'חסום', color: '#C8364A', bg: '#FBE7EA', icon: 'ban' },
};

export const AVATAR_GRADS = [
  'linear-gradient(135deg,#FBB03B,#E94F8A)',
  'linear-gradient(135deg,#8B5CF6,#5560FF)',
  'linear-gradient(135deg,#34D399,#0EA5A0)',
  'linear-gradient(135deg,#F472B6,#A855F7)',
  'linear-gradient(135deg,#60A5FA,#7C3AED)',
  'linear-gradient(135deg,#FB923C,#EF4444)',
];

export function avatarGrad(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_GRADS[h % AVATAR_GRADS.length];
}

export function initial(name: string): string {
  const n = (name || '').trim();
  return n ? n[0] : '?';
}

export interface Connection {
  id: string;
  teen: string;
  tAge: number;
  emp: string;
  role: string;
  since: string;
  hours: number;
  status: ConnStatus;
}

export interface Conversation {
  id: string;
  connId: string;
  teen: string;
  emp: string;
  role: string;
  last: string;
  time: string;
  unread: number;
  flagged: boolean;
}

export interface Message {
  sender: 'teen' | 'employer';
  text: string;
  time: string;
  flagged: boolean;
}

export const DEMO_CONVERSATIONS: Conversation[] = [
  { id: 'c1', connId: 'k1', teen: 'אור לוי', emp: 'קפה ביאליק', role: 'מלצרות', last: 'מעולה, נתראה מחר', time: '09:22', unread: 2, flagged: false },
  { id: 'c2', connId: 'k2', teen: 'דנה כהן', emp: 'סופר חביב', role: 'קופאות', last: 'אפשר לקבל מספר טלפון...', time: '11:08', unread: 1, flagged: true },
  { id: 'c3', connId: 'k3', teen: 'יעל ברק', emp: 'ספרים ועוד', role: 'מכירות', last: 'תודה רבה! ממש נהניתי', time: '18:45', unread: 0, flagged: false },
  { id: 'c4', connId: 'k4', teen: 'רוני שגב', emp: 'אולם לב העיר', role: 'מלצרות', last: 'נשמח לעבוד איתך שוב', time: 'אתמול', unread: 0, flagged: false },
];

export const DEMO_THREADS: Record<string, Message[]> = {
  c1: [
    { sender: 'employer', text: 'היי אור, מתאים לך להגיע מחר ב-16:00 למשמרת ניסיון?', time: '09:12', flagged: false },
    { sender: 'teen', text: 'כן בטוח! צריך להביא משהו?', time: '09:20', flagged: false },
    { sender: 'employer', text: 'רק תעודת זהות וחיוך 🙂', time: '09:21', flagged: false },
    { sender: 'teen', text: 'מעולה, נתראה מחר', time: '09:22', flagged: false },
  ],
  c2: [
    { sender: 'teen', text: 'שלום, ראיתי את המשרה לקופאות וזה נשמע מתאים לי', time: '11:01', flagged: false },
    { sender: 'employer', text: 'יופי! כמה שעות בשבוע את פנויה?', time: '11:05', flagged: false },
    { sender: 'teen', text: 'אפשר לקבל את מספר הטלפון שלך כדי לדבר מחוץ לאפליקציה?', time: '11:08', flagged: true },
  ],
  c3: [
    { sender: 'employer', text: 'תודה על המשמרת היום, עבודה יפה מאוד', time: '18:30', flagged: false },
    { sender: 'teen', text: 'תודה רבה! ממש נהניתי', time: '18:45', flagged: false },
  ],
  c4: [
    { sender: 'teen', text: 'היה ערב מוצלח, תודה על ההזדמנות', time: 'אתמול', flagged: false },
    { sender: 'employer', text: 'כל הכבוד, נשמח לעבוד איתך שוב', time: 'אתמול', flagged: false },
  ],
};

export const DEMO_CONNECTIONS: Connection[] = [
  { id: 'k1', teen: 'אור לוי', tAge: 16, emp: 'קפה ביאליק', role: 'מלצרות', since: '12.5', hours: 42, status: 'active' },
  { id: 'k2', teen: 'דנה כהן', tAge: 17, emp: 'סופר חביב', role: 'קופאות', since: '—', hours: 0, status: 'pending' },
  { id: 'k3', teen: 'יעל ברק', tAge: 16, emp: 'ספרים ועוד', role: 'מכירות', since: '2.6', hours: 18, status: 'active' },
  { id: 'k4', teen: 'רוני שגב', tAge: 17, emp: 'אולם לב העיר', role: 'מלצרות', since: '20.4', hours: 64, status: 'completed' },
  { id: 'k5', teen: 'תומר אבני', tAge: 15, emp: 'גן שמש', role: 'סייע/ת', since: '—', hours: 0, status: 'pending' },
  { id: 'k6', teen: 'מאיה גל', tAge: 16, emp: 'פיצה רומא', role: 'משלוחים', since: '8.6', hours: 11, status: 'active' },
];

export const DEMO_TEENS = [
  { name: 'אור לוי', age: 16, city: 'תל אביב', status: 'verified' as UserStatus, joined: 'מאי 2026', jobs: 3 },
  { name: 'דנה כהן', age: 17, city: 'חיפה', status: 'pending' as UserStatus, joined: 'יוני 2026', jobs: 0 },
  { name: 'יעל ברק', age: 16, city: 'רמת גן', status: 'verified' as UserStatus, joined: 'אפר 2026', jobs: 2 },
  { name: 'רוני שגב', age: 17, city: 'ירושלים', status: 'verified' as UserStatus, joined: 'מרץ 2026', jobs: 4 },
  { name: 'תומר אבני', age: 15, city: 'באר שבע', status: 'pending' as UserStatus, joined: 'יוני 2026', jobs: 0 },
  { name: 'מאיה גל', age: 16, city: 'הרצליה', status: 'blocked' as UserStatus, joined: 'מאי 2026', jobs: 1 },
];

export const DEMO_EMPLOYERS = [
  { name: 'קפה ביאליק', cat: 'בית קפה', status: 'verified' as UserStatus, joined: 'ינו 2026', jobs: 5 },
  { name: 'סופר חביב', cat: 'מינימרקט', status: 'verified' as UserStatus, joined: 'פבר 2026', jobs: 3 },
  { name: 'ספרים ועוד', cat: 'חנות ספרים', status: 'verified' as UserStatus, joined: 'מרץ 2026', jobs: 2 },
  { name: 'אולם לב העיר', cat: 'אולם אירועים', status: 'pending' as UserStatus, joined: 'יוני 2026', jobs: 1 },
  { name: 'גן שמש', cat: 'גן ילדים', status: 'verified' as UserStatus, joined: 'אפר 2026', jobs: 4 },
  { name: 'פיצה רומא', cat: 'מסעדה', status: 'verified' as UserStatus, joined: 'מאי 2026', jobs: 6 },
];
