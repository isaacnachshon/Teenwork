
import React, { useState } from 'react';
import {
    UserIcon,
    BriefcaseIcon,
    SearchIcon,
    UtensilsCrossedIcon,
    BabyIcon,
    BookOpenTextIcon,
    StoreIcon,
    DropletsIcon,
    StarIcon,
    StarOutlineIcon,
    ClipboardListIcon,
    WalletIcon,
    LinkedinIcon,
    InstagramIcon,
    FacebookIcon
} from './icons';

import LanguageSelector from './LanguageSelector';

interface LandingPageProps {
    onRoleSelect: (role: 'teen' | 'employer' | 'admin') => void;
}

const partners = [
    { name: 'קסטרו', logo: 'https://img.logoipsum.com/296.svg' },
    { name: 'גולדה', logo: 'https://img.logoipsum.com/297.svg' },
    { name: 'סינמה סיטי', logo: 'https://img.logoipsum.com/298.svg' },
    { name: 'פיצה האט', logo: 'https://img.logoipsum.com/299.svg' },
    { name: 'WeClean', logo: 'https://img.logoipsum.com/300.svg' },
    { name: 'השף המעופף', logo: 'https://img.logoipsum.com/289.svg' },
];

const categories = [
    { name: 'מלצרות ואירועים', icon: <UtensilsCrossedIcon className="w-8 h-8" />, color: 'text-purple-500', bg: 'bg-purple-50' },
    { name: 'בייביסיטר', icon: <BabyIcon className="w-8 h-8" />, color: 'text-pink-500', bg: 'bg-pink-50' },
    { name: 'שיעורים פרטיים', icon: <BookOpenTextIcon className="w-8 h-8" />, color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'חנויות ומכירות', icon: <StoreIcon className="w-8 h-8" />, color: 'text-green-500', bg: 'bg-green-50' },
    { name: 'ניקיון וסדר', icon: <DropletsIcon className="w-8 h-8" />, color: 'text-yellow-500', bg: 'bg-yellow-50' },
];

const testimonials = [
    { name: 'דניאל כהן', role: 'נער, 17', quote: 'מצאתי עבודה תוך פחות משבוע! האפליקציה סופר נוחה ועזרה לי למצוא עבודה גמישה ליד הבית.', image: 'https://picsum.photos/id/1025/100/100' },
    { name: 'שרה לוי', role: 'בעלת קייטרינג', quote: 'TEENWORK שינו לי את החיים. אני מוצאת עובדים איכותיים וזמינים לאירועים שלי בכמה קליקים. ממליצה בחום!', image: 'https://picsum.photos/id/1027/100/100' },
];

const CategoryCard: React.FC<{ category: typeof categories[0] }> = ({ category }) => (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${category.bg} ${category.color} mb-4`}>
            {category.icon}
        </div>
        <h3 className="font-bold text-gray-800">{category.name}</h3>
    </div>
);

const HowItWorksStep: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 mb-4">
            {icon}
        </div>
        <h3 className="font-bold text-lg text-gray-800 mb-1">{title}</h3>
        <p className="text-gray-500">{description}</p>
    </div>
);

const TestimonialCard: React.FC<{ testimonial: typeof testimonials[0] }> = ({ testimonial }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center mb-4">
            <img src={testimonial.image} alt={testimonial.name} className="w-14 h-14 rounded-full mr-4" />
            <div>
                <p className="font-bold text-gray-800">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
            </div>
        </div>
        <div className="flex mb-2">
            {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-5 h-5 text-yellow-400" />)}
        </div>
        <p className="text-gray-600 italic">"{testimonial.quote}"</p>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onRoleSelect }) => {
    const [howItWorksView, setHowItWorksView] = useState<'teen' | 'employer'>('teen');

    return (
        <div className="bg-white text-gray-800 font-sans">
            <header className="relative py-6 px-4 sm:px-6 lg:px-8 bg-gray-50/50 backdrop-blur-sm theme-transition">
                <nav className="container mx-auto flex justify-between items-center">
                    <a href="#" className="text-3xl font-bold text-purple-600">TEENWORK</a>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#categories" className="font-semibold text-gray-600 hover:text-purple-600 transition-colors">קטגוריות</a>
                        <a href="#how-it-works" className="font-semibold text-gray-600 hover:text-purple-600 transition-colors">איך זה עובד</a>
                        <a href="#testimonials" className="font-semibold text-gray-600 hover:text-purple-600 transition-colors">המלצות</a>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Language Selector */}
                        <div className="flex items-center gap-2 mr-4">
                            <LanguageSelector />
                        </div>
                        <button onClick={() => onRoleSelect('teen')} className="font-bold text-purple-600 hover:opacity-80 transition-opacity">כניסה</button>
                        <button onClick={() => onRoleSelect('employer')} className="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors">פרסם משרה</button>
                    </div>
                </nav>
            </header>

            <main>
                {/* Hero Section */}
                <section className="text-center py-20 px-4 bg-gray-50">
                    <div className="container mx-auto">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 leading-tight animate-in fade-in-0 slide-in-from-top-4 duration-500">
                            העבודה הראשונה שלך <br /> מתחילה <span className="text-purple-600">כאן</span>
                        </h1>
                        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto animate-in fade-in-0 duration-500 delay-100">
                            הצטרפו לאלפי בני נוער שכבר מצאו עבודה, ולמאות מעסיקים שמגייסים את הדור הבא של העובדים.
                        </p>
                        <div className="mt-8 max-w-2xl mx-auto animate-in fade-in-0 duration-500 delay-200">
                            <div className="relative">
                                <input type="text" placeholder="מה לחפש? (לדוגמה: מלצרות בתל אביב)" className="w-full text-lg ps-14 pe-4 py-4 rounded-full bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                <SearchIcon className="absolute top-1/2 right-5 -translate-y-1/2 w-6 h-6 text-gray-400" />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-center gap-4 animate-in fade-in-0 duration-500 delay-300">
                            <button onClick={() => onRoleSelect('teen')} className="bg-purple-600 text-white font-bold py-3 px-8 rounded-full hover:bg-purple-700 transition-colors text-lg">אני רוצה לעבוד</button>
                            <button onClick={() => onRoleSelect('employer')} className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors text-lg ring-1 ring-inset ring-gray-300">אני רוצה להעסיק</button>
                        </div>
                    </div>
                </section>

                {/* Partners Section */}
                <section className="py-12 bg-white">
                    <div className="container mx-auto text-center">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">מגייסים אצלנו</h3>
                        <div className="w-full mt-6 inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_1rem,_black_calc(100%-1rem),transparent_100%)]">
                            <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 animate-infinite-scroll">
                                {partners.map((p, i) => <li key={i}><img src={p.logo} alt={p.name} className="max-h-8" /></li>)}
                            </ul>
                            <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 animate-infinite-scroll" aria-hidden="true">
                                {partners.map((p, i) => <li key={i}><img src={p.logo} alt={p.name} className="max-h-8" /></li>)}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Categories Section */}
                <section id="categories" className="py-20 px-4 bg-gray-50">
                    <div className="container mx-auto text-center">
                        <h2 className="text-3xl font-bold text-gray-800">מצא עבודה בתחום שמעניין אותך</h2>
                        <p className="mt-2 text-gray-500 max-w-xl mx-auto">ממכירת גלידה ועד עזרה בשיעורי בית, יש לנו מגוון רחב של משרות לבני נוער.</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-10">
                            {categories.map(cat => <CategoryCard key={cat.name} category={cat} />)}
                        </div>
                    </div>
                </section>

                {/* How it works Section */}
                <section id="how-it-works" className="py-20 px-4 bg-white">
                    <div className="container mx-auto text-center">
                        <h2 className="text-3xl font-bold text-gray-800">כל כך פשוט להתחיל</h2>
                        <div className="mt-6 flex justify-center bg-gray-100 p-1.5 rounded-full max-w-xs mx-auto">
                            <button onClick={() => setHowItWorksView('teen')} className={`w-1/2 py-2 rounded-full font-bold transition-colors ${howItWorksView === 'teen' ? 'bg-purple-600 text-white shadow' : 'text-gray-600'}`}>לנוער</button>
                            <button onClick={() => setHowItWorksView('employer')} className={`w-1/2 py-2 rounded-full font-bold transition-colors ${howItWorksView === 'employer' ? 'bg-blue-600 text-white shadow' : 'text-gray-600'}`}>למעסיקים</button>
                        </div>
                        <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
                            {howItWorksView === 'teen' ? (
                                <>
                                    <HowItWorksStep icon={<UserIcon className="w-8 h-8" />} title="1. בונים פרופיל" description="הירשמו בחינם ובנו פרופיל שיציג את הכישורים והניסיון שלכם." />
                                    <HowItWorksStep icon={<SearchIcon className="w-8 h-8" />} title="2. מוצאים עבודה" description="חפשו משרות לפי תחום, מיקום או שכר, והגישו מועמדות בקליק." />
                                    <HowItWorksStep icon={<WalletIcon className="w-8 h-8" />} title="3. מתחילים להרוויח" description="התחילו לעבוד, לצבור ניסיון ולהרוויח כסף משלכם." />
                                </>
                            ) : (
                                <>
                                    <HowItWorksStep icon={<BriefcaseIcon className="w-8 h-8" />} title="1. מפרסמים משרה" description="פרסמו משרה חדשה תוך דקות, ופרטו את כל דרישות התפקיד." />
                                    <HowItWorksStep icon={<ClipboardListIcon className="w-8 h-8" />} title="2. בוחנים מועמדים" description="קבלו פניות מבני נוער מוכשרים וצפו בפרופילים שלהם." />
                                    <HowItWorksStep icon={<StarOutlineIcon className="w-8 h-8" />} title="3. מגייסים את הטובים ביותר" description="צרו קשר עם המועמדים המתאימים וגייסו עובדים חדשים לעסק." />
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section id="testimonials" className="py-20 px-4 bg-gray-50">
                    <div className="container mx-auto">
                        <h2 className="text-3xl font-bold text-gray-800 text-center">מה אומרים עלינו?</h2>
                        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {testimonials.map(t => <TestimonialCard key={t.name} testimonial={t} />)}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-20 px-4 bg-purple-600 text-white">
                    <div className="container mx-auto text-center">
                        <h2 className="text-4xl font-bold">מוכנים להתחיל?</h2>
                        <p className="mt-2 text-lg opacity-90">הצטרפו היום לקהילת TEENWORK והתחילו את המסע שלכם.</p>
                        <div className="mt-8 flex justify-center gap-4">
                            <button onClick={() => onRoleSelect('teen')} className="bg-white text-purple-600 font-bold py-3 px-8 rounded-full hover:bg-purple-100 transition-colors text-lg">מצא את העבודה הבאה שלך</button>
                            <button onClick={() => onRoleSelect('employer')} className="bg-transparent text-white font-bold py-3 px-8 rounded-full hover:bg-white/10 transition-colors text-lg ring-2 ring-inset ring-white">גייס עובדים לעסק</button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-gray-800 text-white py-12 px-4">
                <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-3">TEENWORK</h3>
                        <p className="text-gray-400 text-sm">מחברים בין בני נוער למעסיקים.</p>
                    </div>
                    <div>
                        <h3 className="font-bold mb-3">ניווט מהיר</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="text-gray-400 hover:text-white">אודות</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white">חיפוש עבודות</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white">למעסיקים</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white">צור קשר</a></li>
                            <li><button onClick={() => onRoleSelect('admin')} className="text-gray-400 hover:text-white text-left text-xs mt-4 block">כניסת מנהלים</button></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold mb-3">משפטי</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="text-gray-400 hover:text-white">תקנון שימוש</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white">מדיניות פרטיות</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold mb-3">עקבו אחרינו</h3>
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-400 hover:text-white"><LinkedinIcon className="w-6 h-6" /></a>
                            <a href="#" className="text-gray-400 hover:text-white"><InstagramIcon className="w-6 h-6" /></a>
                            <a href="#" className="text-gray-400 hover:text-white"><FacebookIcon className="w-6 h-6" /></a>
                        </div>
                    </div>
                </div>
                <div className="container mx-auto mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} TEENWORK. כל הזכויות שמורות.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
