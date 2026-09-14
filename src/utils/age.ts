/** Calculate age in full years from an ISO date string (YYYY-MM-DD). */
export function calcAge(isoDate: string): number {
  const d = new Date(isoDate);
  const t = new Date();
  let age = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) age--;
  return age;
}

export const YOUTH_AGE_ERROR = 'הפלטפורמה מיועדת לגילאי 14–18 בלבד.';
export const TERMS_VERSION = '1';

export function isYouthAge(isoDate: string): boolean {
  if (!isoDate) return false;
  const age = calcAge(isoDate);
  return age >= 14 && age <= 18;
}
