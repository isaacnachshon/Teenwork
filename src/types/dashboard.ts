export type DashRole = 'admin' | 'employer' | 'teen';
export type TabKey = 'overview' | 'users' | 'connections' | 'chat' | 'profile' | 'settings' | 'ai';
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

