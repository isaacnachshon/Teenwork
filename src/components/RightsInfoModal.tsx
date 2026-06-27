import React, { useRef, useEffect } from 'react';
import { XIcon, ScaleIcon, ClockIcon, DollarSignIcon, ShieldCheckIcon, AlertTriangleIcon } from './icons';

interface RightsInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RightsInfoModal: React.FC<RightsInfoModalProps> = ({ isOpen, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
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
                className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-full">
                            <ScaleIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">מרכז זכויות עובדים לבני נוער</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">

                    {/* Minimum Wage Section */}
                    <section>
                        <h3 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-4">
                            <DollarSignIcon className="w-5 h-5 text-green-600" />
                            שכר מינימום לנוער (מעודכן לאפריל 2025)
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse bg-green-50 rounded-xl overflow-hidden">
                                <thead className="bg-green-100 text-green-800">
                                    <tr>
                                        <th className="p-4 font-bold">גיל</th>
                                        <th className="p-4 font-bold">שכר לשעה</th>
                                        <th className="p-4 font-bold">שכר חודשי (למשרה מלאה)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-green-200">
                                    <tr>
                                        <td className="p-4">14 עד 16</td>
                                        <td className="p-4 font-bold">24.02 ₪</td>
                                        <td className="p-4">4,155 ₪</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4">16 עד 17</td>
                                        <td className="p-4 font-bold">25.74 ₪</td>
                                        <td className="p-4">4,453 ₪</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4">17 עד 18</td>
                                        <td className="p-4 font-bold">28.49 ₪</td>
                                        <td className="p-4">4,929 ₪</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4">18 ומעלה</td>
                                        <td className="p-4 font-bold">34.32 ₪</td>
                                        <td className="p-4">~6,246 ₪ (שכר מינימום מבוגרים)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">* הנתונים נכונים למועד העדכון האחרון ועשויים להשתנות. יש להתעדכן באתר משרד העבודה.</p>
                    </section>

                    {/* Important Laws Grid */}
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
                                    <li>מקסימום 8 שעות ביום (או 9 במקומות שעובדים 5 ימים).</li>
                                    <li>חובה לתת הפסקה של 45 דקות ביום עבודה של 6 שעות ומעלה.</li>
                                    <li>לפחות 36 שעות מנוחה רצופות בשבוע.</li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                    <AlertTriangleIcon className="w-4 h-4 text-orange-500" />
                                    עבודת לילה
                                </h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    <li><strong>עד גיל 16:</strong> אסור להעסיק בין 20:00 ל-08:00.</li>
                                    <li><strong>גיל 16-18:</strong> אסור להעסיק בין 22:00 ל-06:00.</li>
                                    <li>בחופשות רשמיות מותר לעבוד עד 24:00 (בכפוף להסעה הביתה).</li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h4 className="font-bold text-gray-800 mb-2">💰 תשלומים נוספים</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    <li>חובה לשלם נסיעות (עד תקרה יומית).</li>
                                    <li>תשלום על שעות נוספות (125% שעתיים ראשונות, 150% אח"כ).</li>
                                    <li>חובה לשלם על ימי התלמדות וישיבות עבודה.</li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h4 className="font-bold text-gray-800 mb-2">📝 רישום ובירוקרטיה</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    <li>חובה לנהל רישום שעות מדויק.</li>
                                    <li>חובה להוציא תלוש שכר מסודר.</li>
                                    <li>מעסיק לא יכול להטיל קנסות כספיים על עובד.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Call to Action */}
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
