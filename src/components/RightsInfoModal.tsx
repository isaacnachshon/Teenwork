import React, { useRef, useEffect } from 'react';
import { XIcon, ScaleIcon, ClockIcon, DollarSignIcon, ShieldCheckIcon, AlertTriangleIcon, FileTextIcon, UsersIcon } from './icons';
import { YOUTH_WAGE, ADULT_MIN_WAGE, HOURS_RULES, NIGHT } from '@/utils/youthLaw';

interface RightsInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const fmtDate = (iso: string) => `${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
const monthly = (hourly: number) => Math.round(hourly * 173).toLocaleString('he-IL');

/** מרכז זכויות — כל המספרים מגיעים מ-src/utils/youthLaw.ts (מקור יחיד). */
const RightsInfoModal: React.FC<RightsInfoModalProps> = ({ isOpen, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-label="מרכז זכויות עובדים לבני נוער"
                className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            >
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-full">
                            <ScaleIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">מרכז זכויות עובדים לבני נוער</h2>
                    </div>
                    <button onClick={onClose} aria-label="סגור" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-8">

                    {/* מי רשאי לעבוד */}
                    <section>
                        <h3 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-3">
                            <UsersIcon className="w-5 h-5 text-purple-600" />
                            מי רשאי לעבוד?
                        </h3>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            <li><strong>מתחת לגיל 14:</strong> אסור להעסיק.</li>
                            <li><strong>גיל 14:</strong> עבודות קלות בחופשות הלימודים הרשמיות בלבד (למשל יולי–אוגוסט).</li>
                            <li><strong>גיל 15:</strong> מותר, בכפוף לחוק לימוד חובה.</li>
                            <li><strong>גיל 16–18:</strong> מותר בשנת הלימודים ובחופשות, לפי מגבלות השעות למטה.</li>
                            <li>הפלטפורמה מיועדת לגילאי 14–18 בלבד, ונדרש אישור הורה/אפוטרופוס.</li>
                        </ul>
                    </section>

                    {/* שכר מינימום */}
                    <section>
                        <h3 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-4">
                            <DollarSignIcon className="w-5 h-5 text-green-600" />
                            שכר מינימום לנוער (נכון ל-{fmtDate(YOUTH_WAGE.effectiveDate)})
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse bg-green-50 rounded-xl overflow-hidden">
                                <thead className="bg-green-100 text-green-800">
                                    <tr>
                                        <th className="p-4 font-bold">גיל</th>
                                        <th className="p-4 font-bold">שכר לשעה</th>
                                        <th className="p-4 font-bold">שכר חודשי (משרה מלאה, 173 שעות)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-green-200">
                                    <tr>
                                        <td className="p-4">עד גיל 16 (14–15)</td>
                                        <td className="p-4 font-bold">{YOUTH_WAGE.under16.toFixed(2)} ₪</td>
                                        <td className="p-4">{monthly(YOUTH_WAGE.under16)} ₪</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4">גיל 16 עד 17</td>
                                        <td className="p-4 font-bold">{YOUTH_WAGE.age16.toFixed(2)} ₪</td>
                                        <td className="p-4">{monthly(YOUTH_WAGE.age16)} ₪</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4">גיל 17 עד 18</td>
                                        <td className="p-4 font-bold">{YOUTH_WAGE.age17.toFixed(2)} ₪</td>
                                        <td className="p-4">{monthly(YOUTH_WAGE.age17)} ₪</td>
                                    </tr>
                                    <tr className="text-gray-500">
                                        <td className="p-4">18 ומעלה (שכר מינימום מבוגרים, נכון ל-{fmtDate(ADULT_MIN_WAGE.effectiveDate)})</td>
                                        <td className="p-4 font-bold">{ADULT_MIN_WAGE.hourly.toFixed(2)} ₪</td>
                                        <td className="p-4">~{monthly(ADULT_MIN_WAGE.hourly)} ₪</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">* מקור: {YOUTH_WAGE.source}. הנתונים עשויים להתעדכן — יש לבדוק באתר משרד העבודה או כל-זכות.</p>
                    </section>

                    {/* זכויות */}
                    <section>
                        <h3 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-4">
                            <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                            זכויות חשובות שחובה לדעת
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                    <ClockIcon className="w-4 h-4 text-purple-500" />
                                    שעות עבודה ומנוחה
                                </h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    <li>מקסימום {HOURS_RULES.maxDailyHours} שעות ביום ({HOURS_RULES.maxDailyHours5DayWeek} במקומות שעובדים 5 ימים) ועד {HOURS_RULES.maxWeeklyHours} שעות בשבוע.</li>
                                    <li>הפסקה של {HOURS_RULES.breakMinutesFrom6h} דקות ביום עבודה של 6 שעות ומעלה.</li>
                                    <li>לפחות {HOURS_RULES.weeklyRestHours} שעות מנוחה רצופות בשבוע — אין עבודה ביום המנוחה השבועי (שבת).</li>
                                    <li><strong>אסור להעסיק נוער בשעות נוספות.</strong></li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                    <AlertTriangleIcon className="w-4 h-4 text-orange-500" />
                                    עבודת לילה
                                </h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    <li><strong>עד גיל 16:</strong> מותר לעבוד רק בין {NIGHT.under16.earliest} ל-{NIGHT.under16.latest}.</li>
                                    <li><strong>גיל 16–18:</strong> מותר לעבוד רק בין {NIGHT.from16.earliest} ל-{NIGHT.from16.latest}.</li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                    <FileTextIcon className="w-4 h-4 text-purple-500" />
                                    מסמכים לפני תחילת עבודה
                                </h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    <li>טופס 101 (ממלאים אצל המעסיק).</li>
                                    <li>צילום תעודת זהות + ספח (או ספח ההורה).</li>
                                    <li>אישור רפואי מרופא המשפחה.</li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h4 className="font-bold text-gray-800 mb-2">📝 חובות המעסיק</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    <li>הודעה בכתב על תנאי ההעסקה תוך 7 ימים.</li>
                                    <li>תלוש שכר חודשי ורישום שעות מדויק.</li>
                                    <li>ביטוח לאומי על חשבון המעסיק — ללא ניכוי מהנער/ה.</li>
                                    <li>החזר נסיעות. אסור להטיל קנסות כספיים על עובד.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <div className="bg-purple-50 p-6 rounded-xl text-center">
                        <h4 className="font-bold text-purple-800 mb-2">מרגישים שזכויותיכם נפגעו?</h4>
                        <p className="text-purple-600 text-sm mb-4">אל תהססו לפנות לייעוץ או להסתדרות הנוער העובד והלומד.</p>
                        <a
                            href="https://www.gov.il/he/labor/units/youth-employment"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-purple-600 text-white font-bold py-2 px-6 rounded-full hover:bg-purple-700 transition-colors"
                        >
                            למידע נוסף באתר משרד העבודה
                        </a>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RightsInfoModal;
