import { TERMS_VERSION } from './youthLaw';

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
export { TERMS_VERSION };

export function isYouthAge(isoDate: string): boolean {
  if (!isoDate) return false;
  const age = calcAge(isoDate);
  return age >= 14 && age <= 18;
}

/** Bounds for <input type="date"> so the picker only offers 14–18-year-old birth dates. */
export function dobBounds(today: Date = new Date()): { min: string; max: string } {
  const iso = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const max = new Date(today); max.setFullYear(max.getFullYear() - 14);
  const min = new Date(today); min.setFullYear(min.getFullYear() - 19); min.setDate(min.getDate() + 1);
  return { min: iso(min), max: iso(max) };
}
