import React, { useState } from 'react';
import { XIcon } from './icons';

interface LegalModalProps {
    initialTab?: 'terms' | 'privacy';
    onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ initialTab = 'terms', onClose }) => {
    const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('terms')}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'terms' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            תקנון שימוש
                        </button>
                        <button
                            onClick={() => setActiveTab('privacy')}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'privacy' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            מדיניות פרטיות
                        </button>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 text-right space-y-4 text-gray-700 text-sm leading-relaxed">
                    {activeTab === 'terms' ? (
                        <>
                            <h2 className="text-xl font-bold text-gray-800">תקנון שימוש – TEENWORK</h2>
                            <p className="text-gray-500 text-xs">עדכון אחרון: יוני 2025</p>

                            <section className="space-y-2">
                                <h3 className="font-bold text-gray-800">1. כללי</h3>
                                <p>ברוכים הבאים לפלטפורמת TEENWORK. השימוש באפליקציה מהווה הסכמה לתנאי שימוש אלה. הפלטפורמה מיועדת לחיבור בין בני נוער בגילאי 14–18 לבין מעסיקים בישראל.</p>
                            </section>

                            <section className="space-y-2">
                                <h3 className="font-bold text-gray-800">2. כשירות משתמשים</h3>
                                <p>בני נוער: גיל 14–18 בלבד. שימוש על ידי קטינים מתחת לגיל 14 אסור. רישום מחייב אימות כתובת אימייל.</p>
                                <p>מעסיקים: חייבים להיות עסקים חוקיים הפועלים בהתאם לחוק עבודת נוער, התשי"ג-1953.</p>
                            </section>

                            <section className="space-y-2">
                                <h3 className="font-bold text-gray-800">3. זכויות ואחריות</h3>
                                <p>TEENWORK אינה צד ביחסי העבודה בין הנוער למעסיק. האחריות לקיום חוק עבודת הנוער, לרבות שעות עבודה מותרות ושכר מינימום, חלה על המעסיק בלבד.</p>
                                <p>TEENWORK שומרת לעצמה את הזכות להסיר כל תוכן פוגעני או הפרה של תנאים אלה.</p>
                            </section>

                            <section className="space-y-2">
                                <h3 className="font-bold text-gray-800">4. שימוש אסור</h3>
                                <ul className="list-disc list-inside space-y-1 pr-2">
                                    <li>פרסום מידע כוזב או מטעה</li>
                                    <li>פרסום משרות הנוגדות את חוק עבודת הנוער</li>
                                    <li>שימוש בפלטפורמה לצרכים לא חוקיים</li>
                                    <li>הצקה, הטרדה או פגיעה במשתמשים אחרים</li>
                                </ul>
                            </section>

                            <section className="space-y-2">
                                <h3 className="font-bold text-gray-800">5. שינויים בתקנון</h3>
                                <p>TEENWORK שומרת לעצמה את הזכות לשנות תנאים אלה בכל עת. המשך השימוש לאחר שינוי מהווה הסכמה לתנאים המעודכנים.</p>
                            </section>

                            <section className="space-y-2">
                                <h3 className="font-bold text-gray-800">6. יצירת קשר</h3>
                                <p>לשאלות בנוגע לתקנון: support@teensworks.com</p>
                            </section>
                        </>
                    ) : (
                        <>
                            <h2 className="text-xl font-bold text-gray-800">מדיניות פרטיות – TEENWORK</h2>
                            <p className="text-gray-500 text-xs">עדכון אחרון: יוני 2025</p>

                            <section className="space-y-2">
                                <h3 className="font-bold text-gray-800">1. מידע שאנו אוספים</h3>
                                <p>אנו אוספים את המידע הבא בעת השימוש בפלטפורמה:</p>
                                <ul className="list-disc list-inside space-y-1 pr-2">
                                    <li>שם מלא וכתובת אימייל</li>
                                    <li>גיל ומיקום (לנוער בלבד)</li>
                                    <li>תמונת פרופיל (אופציונלי)</li>
                                    <li>כישורים ועדיפויות עבודה (לנוער)</li>
                                    <li>פרטי חברה ולוגו (למעסיקים)</li>
                                </ul>
                            </section>

                            <section className="space-y-2">
                                <h3 className="font-bold text-gray-800">2. שימוש במידע</h3>
                                <p>המידע משמש אך ורק למטרות הפלטפורמה: חיבור בין נוער למעסיקים, שיפור השירות, ואימות זהות. איננו מוכרים מידע לצדדים שלישיים.</p>
                            </section>

                            <section className="space-y-2">
                                <h3 className="font-bold text-gray-800">3. אחסון מידע</h3>
                                <p>המידע מאוחסן בשירותי Firebase של Google, הפועלים בתאימות לתקן ISO 27001 ול-GDPR. השרתים ממוקמים בארה"ב.</p>
                            </section>

                            <section className="space-y-2">
                                <h3 className="font-bold text-gray-800">4. הגנה על קטינים</h3>
                                <p>TEENWORK נותנת דגש מיוחד להגנה על פרטיות קטינים בהתאם לחוק הגנת הפרטיות, התשמ"א-1981. פרטי בני נוער אינם נחשפים למעסיקים מעבר למה שנדרש לצורך הקשר התעסוקתי.</p>
                            </section>

                            <section className="space-y-2">
                                <h3 className="font-bold text-gray-800">5. זכויות המשתמש</h3>
                                <ul className="list-disc list-inside space-y-1 pr-2">
                                    <li>זכות לעיון במידע האישי</li>
                                    <li>זכות לתיקון מידע שגוי</li>
                                    <li>זכות למחיקת החשבון וכל הנתונים</li>
                                </ul>
                                <p>למימוש זכויות אלה: support@teensworks.com</p>
                            </section>

                            <section className="space-y-2">
                                <h3 className="font-bold text-gray-800">6. עוגיות (Cookies)</h3>
                                <p>הפלטפורמה משתמשת ב-cookies לצורך ניהול הפגישה בלבד. אין שימוש ב-cookies לצרכי פרסום.</p>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LegalModal;
