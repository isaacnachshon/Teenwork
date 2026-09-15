import React, { useState } from 'react';
import { TEEN_PREP, EMPLOYER_PREP } from '@/content/employmentPrep';
import { CheckCircleIcon, ClipboardListIcon } from '@/components/icons';

interface Props {
  role: 'teen' | 'employer';
  compact?: boolean;
  /** Keys that are already satisfied (rendered with a green check). */
  done?: string[];
  /** Start collapsed (compact cards on dashboards). */
  collapsible?: boolean;
}

/** "Before employment starts" checklist — Form 101, documents and youth-law duties, per persona. */
const EmploymentPrepChecklist: React.FC<Props> = ({ role, compact = false, done = [], collapsible = false }) => {
  const [open, setOpen] = useState(!collapsible);
  const items = role === 'teen' ? TEEN_PREP : EMPLOYER_PREP;
  const title = role === 'teen' ? 'לפני שמתחילים לעבוד — צ׳קליסט' : 'לפני שמעסיקים נוער — חובות המעסיק';

  return (
    <section aria-label={title} className={`bg-white border border-gray-200 rounded-xl ${compact ? 'p-3' : 'p-5'}`}>
      <button type="button" onClick={() => collapsible && setOpen(o => !o)} className="w-full flex items-center justify-between gap-2 text-right" aria-expanded={open}>
        <span className="flex items-center gap-2 font-bold text-gray-800">
          <ClipboardListIcon className="w-5 h-5 text-purple-600" />
          {title}
        </span>
        {collapsible && <span className="text-sm text-purple-600">{open ? 'הסתר' : 'הצג'}</span>}
      </button>
      {open && (
        <ol className={`mt-3 space-y-2 ${compact ? 'text-xs' : 'text-sm'}`}>
          {items.map((item, i) => {
            const isDone = done.includes(item.key);
            return (
              <li key={item.key} className="flex items-start gap-2">
                <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${isDone ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                  {isDone ? <CheckCircleIcon className="w-4 h-4" /> : i + 1}
                </span>
                <span>
                  <span className={`font-semibold ${isDone ? 'text-green-700' : 'text-gray-800'}`}>{item.title}</span>
                  {!compact && <span className="block text-gray-500">{item.detail}</span>}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};

export default EmploymentPrepChecklist;
