import React from 'react';
import type { Job } from '@/types';
import { evaluateJobForTeen, validateJob, minWageForMinAge, HOURS_RULES, NIGHT, YOUTH_WAGE } from '@/utils/youthLaw';
import { ScaleIcon, AlertTriangleIcon, CheckCircleIcon, ClockIcon, DollarSignIcon } from '@/components/icons';

type Mode = 'teen' | 'employer' | 'card';

interface Props {
  job: Pick<Job, 'salary' | 'minAge' | 'startTime' | 'endTime' | 'days'>;
  teenAge?: number;
  mode: Mode;
}

const Row: React.FC<{ ok: boolean; icon: React.ReactNode; text: string; sub?: string }> = ({ ok, icon, text, sub }) => (
  <li className={`flex items-start gap-2 text-sm ${ok ? 'text-gray-700' : 'text-red-700'}`}>
    <span className={`mt-0.5 flex-shrink-0 ${ok ? 'text-green-600' : 'text-red-600'}`}>
      {ok ? <CheckCircleIcon className="w-4 h-4" /> : <AlertTriangleIcon className="w-4 h-4" />}
    </span>
    <span className="flex items-center gap-1 flex-wrap">
      <span className="text-gray-400">{icon}</span>
      <span className={ok ? '' : 'font-semibold'}>{text}</span>
      {sub && <span className="text-xs text-gray-500">· {sub}</span>}
    </span>
  </li>
);

/**
 * Youth-law summary for a single job. `teen` mode evaluates the job for the viewing teen's age,
 * `employer` mode validates the job against the floor for its minAge, `card` mode shows two chips.
 */
const JobRightsPanel: React.FC<Props> = ({ job, teenAge, mode }) => {
  const minAge = job.minAge ?? 16;
  const shiftMins = job.startTime && job.endTime ? evaluateJobForTeen(job, teenAge ?? minAge).shiftHours * 60 : 0;
  const shiftHours = shiftMins / 60;

  if (mode === 'card') {
    const issues = validateJob({ salary: job.salary, minAge, startTime: job.startTime || '', endTime: job.endTime || '', days: job.days || [] });
    const legal = issues.length === 0;
    return (
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full">גיל {minAge}+</span>
        <span className={`${legal ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} font-semibold px-2 py-0.5 rounded-full`}>
          {legal ? 'שכר ושעות לפי חוק ✓' : 'לא עומד בחוק עבודת הנוער'}
        </span>
      </div>
    );
  }

  if (mode === 'employer') {
    const issues = validateJob({ salary: Number(job.salary), minAge, startTime: job.startTime || '', endTime: job.endTime || '', days: job.days || [] });
    const floor = minWageForMinAge(minAge);
    const window = minAge < 16 ? NIGHT.under16 : NIGHT.from16;
    return (
      <section aria-label="בדיקת חוק עבודת הנוער" className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-3">
          <ScaleIcon className="w-5 h-5 text-purple-600" />
          בדיקת חוק עבודת הנוער למשרה
        </h4>
        <ul className="space-y-1.5">
          <Row ok={!issues.some(i => i.code === 'SALARY_BELOW_FLOOR' || i.code === 'MIN_AGE_INVALID')} icon={<DollarSignIcon className="w-4 h-4" />}
            text={`שכר ₪${Number(job.salary) || 0} לשעה מול מינימום ₪${floor.toFixed(2)} לגיל ${minAge}`} sub={`נכון ל-${YOUTH_WAGE.effectiveDate.slice(5, 7)}/${YOUTH_WAGE.effectiveDate.slice(0, 4)}`} />
          <Row ok={!issues.some(i => i.code === 'SHIFT_TOO_LONG' || i.code === 'START_AFTER_END')} icon={<ClockIcon className="w-4 h-4" />}
            text={`משמרת ${shiftHours > 0 ? shiftHours.toFixed(1) : '?'} שעות (מקסימום ${HOURS_RULES.maxDailyHours})`} sub={shiftHours >= 6 ? `הפסקה ${HOURS_RULES.breakMinutesFrom6h} דק' חובה` : undefined} />
          <Row ok={!issues.some(i => i.code === 'NIGHT_UNDER16' || i.code === 'NIGHT_16_18')} icon={<ClockIcon className="w-4 h-4" />}
            text={`שעות מותרות לגיל ${minAge}: ${window.earliest}–${window.latest}`} />
          <Row ok={!issues.some(i => i.code === 'SATURDAY')} icon={<ScaleIcon className="w-4 h-4" />} text="ללא עבודה בשבת · 36 שעות מנוחה שבועית · ללא שעות נוספות" />
        </ul>
        {issues.length > 0 && (
          <ul className="mt-3 space-y-1" role="alert">
            {issues.map(i => <li key={i.code} className="text-sm text-red-700 font-semibold">• {i.message}</li>)}
          </ul>
        )}
      </section>
    );
  }

  const age = teenAge ?? minAge;
  const ev = evaluateJobForTeen(job, age);
  const window = age < 16 ? NIGHT.under16 : NIGHT.from16;
  return (
    <section aria-label="זכויות במשרה זו" className="bg-purple-50 border border-purple-100 rounded-xl p-4">
      <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-3">
        <ScaleIcon className="w-5 h-5 text-purple-600" />
        זכויות במשרה זו{teenAge !== undefined ? ` (לגיל ${teenAge})` : ''}
      </h4>
      <ul className="space-y-1.5">
        <Row ok={ev.ageOk} icon={<CheckCircleIcon className="w-4 h-4" />}
          text={ev.ageOk ? `המשרה מתאימה לגילך (גיל ${minAge}+)` : (ev.ageNote || `המשרה מיועדת לגיל ${minAge} ומעלה`)} sub={ev.ageOk ? ev.ageNote : undefined} />
        <Row ok={ev.wage === 'ok'} icon={<DollarSignIcon className="w-4 h-4" />}
          text={ev.wage === 'ok' ? `שכר ₪${job.salary} לשעה — לפחות המינימום לגילך (₪${ev.wageFloor.toFixed(2)})` : `שכר ₪${job.salary} נמוך משכר המינימום לגילך (₪${ev.wageFloor.toFixed(2)})`} />
        <Row ok={ev.shiftHours <= HOURS_RULES.maxDailyHours} icon={<ClockIcon className="w-4 h-4" />}
          text={ev.shiftHours > 0 ? `משמרת של ${ev.shiftHours.toFixed(1)} שעות (מותר עד ${HOURS_RULES.maxDailyHours})` : `עד ${HOURS_RULES.maxDailyHours} שעות ביום`} sub={ev.needsBreak ? `מגיעה לך הפסקה של ${HOURS_RULES.breakMinutesFrom6h} דק'` : undefined} />
        <Row ok={ev.night === 'ok'} icon={<ClockIcon className="w-4 h-4" />}
          text={ev.night === 'ok' ? `השעות בטווח המותר לגילך (${window.earliest}–${window.latest})` : `השעות חורגות מהמותר לגילך (${window.earliest}–${window.latest})`} />
        <Row ok={!(job.days || []).includes('שבת')} icon={<ScaleIcon className="w-4 h-4" />} text="ללא עבודה בשבת · 36 שעות מנוחה בשבוע · ללא שעות נוספות" />
      </ul>
      <p className="text-xs text-gray-500 mt-3">
        לפני תחילת העבודה: טופס 101, צילום ת״ז + ספח, אישור רפואי. המעסיק חייב למסור הודעה בכתב על תנאי ההעסקה תוך 7 ימים ותלוש שכר חודשי.
      </p>
    </section>
  );
};

export default JobRightsPanel;
