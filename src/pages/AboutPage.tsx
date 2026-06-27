import React from 'react';
import { UsersIcon, BriefcaseIcon, ScaleIcon, WalletIcon, StarIcon, MapPinIcon, ChevronLeftIcon, MailIcon } from '@/components/icons';

interface AboutPageProps {
    onBack: () => void;
}

const StatCard: React.FC<{ value: string; label: string }> = ({ value, label }) => (
    <div className="text-center">
        <p className="text-4xl font-extrabold text-purple-600">{value}</p>
        <p className="mt-1 text-gray-500 font-medium">{label}</p>
    </div>
);

const ValueCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col items-center text-center gap-3">
        <div className="p-3 bg-purple-100 rounded-full text-purple-600">
            {icon}
        </div>
        <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
);

const TeamMember: React.FC<{ name: string; role: string; image: string }> = ({ name, role, image }) => (
    <div className="flex flex-col items-center gap-3">
        <img src={image} alt={name} className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-purple-100" />
        <div className="text-center">
            <p className="font-bold text-gray-800">{name}</p>
            <p className="text-sm text-purple-600 font-medium">{role}</p>
        </div>
    </div>
);

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
    return (
        <div className="bg-gray-50 min-h-screen font-sans" dir="rtl">
            {/* Header */}
            <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-10">
                <div className="container mx-auto flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-semibold transition-colors"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                        חזרה לדף הבית
                    </button>
                    <span className="text-2xl font-bold text-purple-600">TEENWORK</span>
                </div>
            </header>

            {/* Hero */}
            <section className="bg-gradient-to-br from-purple-600 to-purple-800 text-white py-24 px-4 text-center">
                <div className="container mx-auto max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-extrabold leading-tight animate-in fade-in-0 slide-in-from-top-4 duration-500">
                        מחברים בין נוער ישראלי
                        <br />לעולם העבודה
                    </h1>
                    <p className="mt-6 text-lg text-purple-100 leading-relaxed max-w-xl mx-auto">
                        TEENWORK נוסדה מתוך אמונה פשוטה: כל נער ונערה בישראל ראויים להזדמנות אמיתית להרוויח, לצמוח ולגלות את עצמם דרך עבודה.
                    </p>
                </div>
            </section>

            {/* Stats */}
            <section className="bg-white py-16 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <StatCard value="2,000+" label="נרשמו לפלטפורמה" />
                        <StatCard value="500+" label="משרות פורסמו" />
                        <StatCard value="150+" label="מעסיקים פעילים" />
                        <StatCard value="6" label="קטגוריות עבודה" />
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section className="py-20 px-4 bg-gray-50">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">המשימה שלנו</h2>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        אנחנו יודעים שהצעד הראשון הוא הקשה ביותר. בני נוער רבים רוצים לעבוד — אבל לא יודעים איך להתחיל, לאן לפנות, ואם המשרה שמצאו בכלל מתאימה לגילם וזכויותיהם.
                    </p>
                    <p className="text-gray-600 text-lg leading-relaxed mt-4">
                        TEENWORK פותרת בדיוק את זה: פלטפורמה שמחברת בין נוער למעסיקים בצורה בטוחה, שקופה, ובהתאם לחוק עבודת נוער — כך שכל נער ונערה יוכלו להתחיל לעבוד בביטחון ובכבוד.
                    </p>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 px-4 bg-white">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">הערכים שלנו</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ValueCard
                            icon={<ScaleIcon className="w-6 h-6" />}
                            title="שוויון הזדמנויות"
                            description="כל נער ונערה, ללא קשר לרקע, מוצאים אצלנו הזדמנות אמיתית לעבודה ראשונה."
                        />
                        <ValueCard
                            icon={<UsersIcon className="w-6 h-6" />}
                            title="קהילה"
                            description="אנחנו בונים קהילה תומכת של עובדים צעירים, מעסיקים אחראיים ומנטורים מנוסים."
                        />
                        <ValueCard
                            icon={<WalletIcon className="w-6 h-6" />}
                            title="שקיפות"
                            description="כל משרה מציגה את השכר, השעות והזכויות לפי חוק — אין הפתעות."
                        />
                        <ValueCard
                            icon={<StarIcon className="w-6 h-6" />}
                            title="איכות"
                            description="אנחנו בוחרים מעסיקים שמכבדים את בני הנוער ומספקים חוויית עבודה חיובית."
                        />
                    </div>
                </div>
            </section>

            {/* Story */}
            <section className="py-20 px-4 bg-gray-50">
                <div className="container mx-auto max-w-3xl">
                    <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">הסיפור שלנו</h2>
                    <div className="bg-white rounded-2xl shadow-md p-8 space-y-4 text-gray-600 leading-relaxed">
                        <p>
                            TEENWORK נולדה מתוך תסכול אמיתי. כשהמייסד שלנו היה בן 16, הוא רצה לעבוד בקיץ — אבל לא ידע לאן לפנות. רוב האתרים נועדו למבוגרים, המעסיקים לא ידעו אם מותר להם להעסיק קטין, וחוק עבודת הנוער נשמע כמו שפה זרה.
                        </p>
                        <p>
                            ב-2024 החלטנו לפתור את הבעיה הזו מהשורש. בנינו פלטפורמה שמדברת את השפה של בני הנוער, מסבירה למעסיקים את הכללים, ומחברת בין השניים בקלות ובמהירות.
                        </p>
                        <p>
                            היום TEENWORK מחברת מאות בני נוער עם מאות מעסיקים מקצועיים ברחבי הארץ — ואנחנו רק בהתחלה.
                        </p>
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-20 px-4 bg-white">
                <div className="container mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-12">הצוות שלנו</h2>
                    <div className="flex flex-wrap justify-center gap-12">
                        <TeamMember name="איתי נחשון" role="מייסד ומנכ״ל" image="https://picsum.photos/id/1012/100/100" />
                        <TeamMember name="מיה לוי" role="ראש מוצר" image="https://picsum.photos/id/1005/100/100" />
                        <TeamMember name="דניאל כהן" role="ראש טכנולוגיה" image="https://picsum.photos/id/1025/100/100" />
                        <TeamMember name="שירה אברהם" role="ראש שיווק" image="https://picsum.photos/id/1027/100/100" />
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-20 px-4 bg-purple-600 text-white text-center">
                <div className="container mx-auto max-w-2xl">
                    <MailIcon className="w-12 h-12 mx-auto mb-4 opacity-80" />
                    <h2 className="text-3xl font-bold mb-3">רוצים לדעת עוד?</h2>
                    <p className="text-purple-100 mb-6">אנחנו תמיד שמחים לשמוע — בין אם אתם מעסיקים, הורים, ארגונים או בני נוער.</p>
                    <a
                        href="mailto:support@teensworks.com"
                        className="inline-block bg-white text-purple-600 font-bold py-3 px-8 rounded-full hover:bg-purple-50 transition-colors text-lg shadow-lg"
                    >
                        support@teensworks.com
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8 px-4 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} TEENWORK. כל הזכויות שמורות.
            </footer>
        </div>
    );
};

export default AboutPage;
