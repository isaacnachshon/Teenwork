import {emailShell, escapeHtml} from "./mail";
import {validateJob, youthBand, minWageForAge} from "./youthLaw";

export interface TeenLike {
  name?: string;
  displayName?: string;
  birthDate?: string;
  parentalConsentStatus?: string;
  parentName?: string;
  parentEmail?: string;
}

export interface JobLike {
  title?: string;
  company?: string;
  location?: string;
  salary?: number;
  minAge?: number;
  startTime?: string;
  endTime?: string;
  days?: string[];
}

/** Full years between an ISO date (YYYY-MM-DD) and `now`. Returns null for invalid input. */
export function ageFromBirthDate(birthDate: string | undefined, now: Date): number | null {
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;
  const [y, m, d] = birthDate.split("-").map(Number);
  let age = now.getUTCFullYear() - y;
  const mm = now.getUTCMonth() + 1;
  if (mm < m || (mm === m && now.getUTCDate() < d)) age--;
  return Number.isFinite(age) ? age : null;
}

export interface ApplicationStamp {
  teenAge: number | null;
  teenYouthBand: string | null;
  consentVerified: boolean;
  complianceIssues: string[];
}

/** Fields stamped onto applications/{id} by onApplicationCreated (clients may not write them). */
export function buildApplicationStamp(teen: TeenLike, job: JobLike, now: Date): ApplicationStamp {
  const teenAge = ageFromBirthDate(teen.birthDate, now);
  const complianceIssues = validateJob({
    salary: Number(job.salary),
    minAge: Number(job.minAge ?? 16),
    startTime: job.startTime || "",
    endTime: job.endTime || "",
    days: job.days || [],
  }).map((i) => i.code);
  return {
    teenAge,
    teenYouthBand: teenAge === null ? null : youthBand(teenAge),
    consentVerified: teen.parentalConsentStatus === "approved",
    complianceIssues,
  };
}

/** Parent notification email for a new application (owner decision: account-level consent + per-application update). */
export function buildParentApplicationEmail(teen: TeenLike, job: JobLike, appUrl: string, now: Date): {subject: string; html: string} {
  const teenName = teen.name || teen.displayName || "הנער/ה";
  const age = ageFromBirthDate(teen.birthDate, now);
  const floor = age === null ? null : minWageForAge(age);
  const hours = job.startTime && job.endTime ? `${job.startTime}–${job.endTime}` : "לא צוינו";
  const days = job.days && job.days.length ? job.days.join(", ") : "לא צוינו";
  const wageLine = floor === null ? "" :
    `<li>שכר מינימום לנוער בגיל ${age}: ₪${floor.toFixed(2)} לשעה${Number(job.salary) < floor ? " — <strong style=\"color:#b91c1c\">השכר במשרה נמוך מהמינימום החוקי</strong>" : ""}</li>`;
  const body = `
    <h2 style="color: #1f2937;">שלום ${escapeHtml(teen.parentName || "")},</h2>
    <p style="color: #4b5563; line-height: 1.8;">
      <strong>${escapeHtml(teenName)}</strong> הגיש/ה מועמדות למשרה דרך TeenWork. זהו עדכון בלבד —
      אישור ההורים שלך לחשבון כבר תקף.
    </p>
    <ul style="color: #4b5563; line-height: 1.9;">
      <li>משרה: <strong>${escapeHtml(job.title || "")}</strong></li>
      <li>מעסיק: ${escapeHtml(job.company || "")}</li>
      <li>מיקום: ${escapeHtml(job.location || "")}</li>
      <li>שכר: ₪${escapeHtml(String(job.salary ?? ""))} לשעה</li>
      <li>שעות: ${escapeHtml(hours)} · ימים: ${escapeHtml(days)}</li>
      ${wageLine}
    </ul>
    <p style="color: #4b5563;">
      תזכורת: לנוער מותר לעבוד עד 8 שעות ביום, ללא עבודת לילה ושבת, ועם הודעה בכתב על תנאי ההעסקה.
      <a href="${escapeHtml(appUrl)}/?rights=1" style="color:#7C3AED;">לזכויות נוער בעבודה</a>
    </p>
    <p style="color: #9ca3af; font-size: 12px;">
      אם אינך מאשר/ת את המועמדות, פנה/י לילדך או אלינו: support@teensworks.com
    </p>`;
  return {
    subject: `עדכון להורה: ${teenName} הגיש/ה מועמדות — TeenWork`,
    html: emailShell("TeenWork", "עדכון על מועמדות", body),
  };
}
