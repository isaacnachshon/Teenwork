/**
 * חוק עבודת הנוער — קבועים ולוגיקה משותפת.
 *
 * MIRROR: functions/src/youthLaw.ts must stay identical to this file, and the
 * numeric literals must match the comment block at the top of firestore.rules.
 *
 * Sources: כל-זכות (שכר מינימום לנוער, נכון ל-04/2026), משרד העבודה (שעות, לילה, מנוחה).
 * request.time in rules is UTC; UI uses local time — boundaries may differ by up to 3h.
 */

export const YOUTH_WAGE = {
  effectiveDate: '2026-04-01',
  source: 'כל זכות — שכר מינימום לנוער',
  /** גיל 14–15 */
  under16: 26.07,
  /** גיל 16 */
  age16: 27.94,
  /** גיל 17 */
  age17: 30.92,
} as const;

/** שכר מינימום למבוגרים (18+). תאריך ומקור נפרדים — לאישור הבעלים. */
export const ADULT_MIN_WAGE = {
  hourly: 34.32,
  effectiveDate: '2025-04-01',
  source: 'משרד העבודה — שכר מינימום',
} as const;

export const HOURS_RULES = {
  maxDailyHours: 8,
  maxDailyHours5DayWeek: 9,
  maxWeeklyHours: 40,
  weeklyRestHours: 36,
  breakMinutesFrom6h: 45,
  noOvertime: true,
} as const;

export const NIGHT = {
  under16: { earliest: '08:00', latest: '20:00' },
  from16: { earliest: '06:00', latest: '22:00' },
} as const;

export const FORBIDDEN_DAYS: readonly string[] = ['שבת'];

export const VACATION_WINDOWS = [{ from: '07-01', to: '08-31', label: 'חופשת הקיץ' }] as const;

export const TERMS_VERSION = '2';

export const MIN_AGE_OPTIONS = [14, 15, 16, 17] as const;
export type JobMinAge = (typeof MIN_AGE_OPTIONS)[number];

export type YouthBand = 'under16' | 'age16' | 'age17' | 'adult';

export function youthBand(age: number): YouthBand {
  if (age < 16) return 'under16';
  if (age < 17) return 'age16';
  if (age < 18) return 'age17';
  return 'adult';
}

/** שכר מינימום לשעה לפי גיל הנער/ה. */
export function minWageForAge(age: number): number {
  switch (youthBand(age)) {
    case 'under16': return YOUTH_WAGE.under16;
    case 'age16': return YOUTH_WAGE.age16;
    case 'age17': return YOUTH_WAGE.age17;
    default: return ADULT_MIN_WAGE.hourly;
  }
}

/** רצפת שכר למשרה לפי הגיל המינימלי שהמעסיק הגדיר (הליטרל ב-firestore.rules: youthMinWage). */
export function minWageForMinAge(minAge: number): number {
  if (minAge < 16) return YOUTH_WAGE.under16;
  if (minAge < 17) return YOUTH_WAGE.age16;
  return YOUTH_WAGE.age17;
}

export function minutesOf(hhmm: string): number {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm || '');
  if (!m) return NaN;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function minutesBetween(start: string, end: string): number {
  return minutesOf(end) - minutesOf(start);
}

export function isVacationNow(date: Date = new Date(), settings?: { vacationActive?: boolean }): boolean {
  if (settings?.vacationActive) return true;
  const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return VACATION_WINDOWS.some(w => mmdd >= w.from && mmdd <= w.to);
}

export interface Eligibility {
  ok: boolean;
  reason?: string;
  note?: string;
}

/** מי רשאי לעבוד: מתחת ל-14 אסור; 14 — עבודות קלות בחופשות בלבד; 15+ מותר. */
export function eligibilityForAge(age: number, date: Date = new Date(), settings?: { vacationActive?: boolean }): Eligibility {
  if (!Number.isFinite(age) || age < 14) {
    return { ok: false, reason: 'מתחת לגיל 14 אסור להעסיק לפי חוק עבודת הנוער.' };
  }
  if (age === 14) {
    if (isVacationNow(date, settings)) {
      return { ok: true, note: 'בגיל 14 מותרת עבודה קלה בחופשות הלימודים הרשמיות בלבד.' };
    }
    return { ok: false, reason: 'בגיל 14 מותר לעבוד רק בחופשות הלימודים הרשמיות (למשל יולי–אוגוסט).' };
  }
  if (age === 15) {
    return { ok: true, note: 'בגיל 15 העסקה מותרת בכפוף לחוק לימוד חובה.' };
  }
  if (age > 18) {
    return { ok: false, reason: 'הפלטפורמה מיועדת לגילאי 14–18 בלבד.' };
  }
  return { ok: true };
}

export type JobIssueCode =
  | 'SALARY_BELOW_FLOOR'
  | 'START_AFTER_END'
  | 'SHIFT_TOO_LONG'
  | 'NIGHT_UNDER16'
  | 'NIGHT_16_18'
  | 'SATURDAY'
  | 'MIN_AGE_INVALID';

export interface JobIssue {
  code: JobIssueCode;
  message: string;
}

export interface JobComplianceInput {
  salary: number;
  minAge: number;
  startTime: string;
  endTime: string;
  days: string[];
}

/** ולידציה של משרה מול החוק. רשימה ריקה = תקין. תואם ל-validJob() ב-firestore.rules. */
export function validateJob(j: JobComplianceInput): JobIssue[] {
  const issues: JobIssue[] = [];
  const minAge = Number(j.minAge);
  const minAgeValid = (MIN_AGE_OPTIONS as readonly number[]).includes(minAge);
  if (!minAgeValid) {
    issues.push({ code: 'MIN_AGE_INVALID', message: 'יש לבחור גיל מינימלי בין 14 ל-17.' });
  }
  const floorAge = minAgeValid ? minAge : 14;
  const floor = minWageForMinAge(floorAge);
  if (!(Number(j.salary) >= floor)) {
    issues.push({ code: 'SALARY_BELOW_FLOOR', message: `השכר נמוך משכר המינימום לנוער לגיל ${floorAge}: ₪${floor.toFixed(2)} לשעה.` });
  }
  const start = minutesOf(j.startTime);
  const end = minutesOf(j.endTime);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
    issues.push({ code: 'START_AFTER_END', message: 'שעת הסיום חייבת להיות אחרי שעת ההתחלה.' });
  } else {
    if (end - start > HOURS_RULES.maxDailyHours * 60) {
      issues.push({ code: 'SHIFT_TOO_LONG', message: `משמרת ארוכה מ-${HOURS_RULES.maxDailyHours} שעות אסורה לנוער.` });
    }
    const window = floorAge < 16 ? NIGHT.under16 : NIGHT.from16;
    if (j.startTime < window.earliest || j.endTime > window.latest) {
      issues.push(floorAge < 16
        ? { code: 'NIGHT_UNDER16', message: `מתחת לגיל 16 מותר לעבוד רק בין ${window.earliest} ל-${window.latest}.` }
        : { code: 'NIGHT_16_18', message: `בגילאי 16–18 מותר לעבוד רק בין ${window.earliest} ל-${window.latest}.` });
    }
  }
  if ((j.days || []).some(d => FORBIDDEN_DAYS.includes(d))) {
    issues.push({ code: 'SATURDAY', message: 'אסור להעסיק נוער ביום המנוחה השבועי (שבת).' });
  }
  return issues;
}

export interface TeenJobEvaluation {
  wage: 'ok' | 'below';
  wageFloor: number;
  shiftHours: number;
  needsBreak: boolean;
  night: 'ok' | 'illegal';
  ageOk: boolean;
  ageNote?: string;
  issues: JobIssue[];
}

/** הערכת משרה עבור נער/ה בגיל נתון (לפאנל הזכויות ולחסימת הגשה). */
export function evaluateJobForTeen(
  job: { salary: number; minAge?: number; startTime?: string; endTime?: string; days?: string[] },
  teenAge: number,
  date: Date = new Date(),
  settings?: { vacationActive?: boolean },
): TeenJobEvaluation {
  const minAge = job.minAge ?? 16;
  const wageFloor = minWageForAge(teenAge);
  const start = job.startTime || '';
  const end = job.endTime || '';
  const mins = minutesBetween(start, end);
  const shiftHours = Number.isFinite(mins) && mins > 0 ? mins / 60 : 0;
  const window = teenAge < 16 ? NIGHT.under16 : NIGHT.from16;
  const nightIllegal = !!start && !!end && (start < window.earliest || end > window.latest);
  const elig = eligibilityForAge(teenAge, date, settings);
  const ageOk = elig.ok && teenAge >= minAge;
  const issues = validateJob({ salary: job.salary, minAge, startTime: start, endTime: end, days: job.days || [] });
  return {
    wage: Number(job.salary) >= wageFloor ? 'ok' : 'below',
    wageFloor,
    shiftHours,
    needsBreak: shiftHours >= 6,
    night: nightIllegal ? 'illegal' : 'ok',
    ageOk,
    ageNote: !elig.ok ? elig.reason : (teenAge < minAge ? `המשרה מיועדת לגיל ${minAge} ומעלה.` : elig.note),
    issues,
  };
}
