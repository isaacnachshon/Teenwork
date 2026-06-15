import { useState, useEffect } from 'react';

export default function LanguageSelector() {
    const [language, setLanguage] = useState('he');

    const languages = [
        { code: 'he', name: 'עברית', dir: 'rtl' },
        { code: 'en', name: 'English', dir: 'ltr' },
        { code: 'ar', name: 'العربية', dir: 'rtl' }
    ];

    const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

    useEffect(() => {
        // Update document direction when language changes
        document.documentElement.setAttribute('dir', currentLanguage.dir);
        document.documentElement.setAttribute('lang', currentLanguage.code);
    }, [currentLanguage]);

    const changeLanguage = (langCode: string) => {
        setLanguage(langCode);
        localStorage.setItem('teenwork-language', langCode);

        // Update direction
        const lang = languages.find(l => l.code === langCode);
        if (lang) {
            document.documentElement.setAttribute('dir', lang.dir);
            document.documentElement.setAttribute('lang', lang.code);
        }
    };

    return (
        <div className="relative">
            <label htmlFor="language-select" className="sr-only">
                Language
            </label>
            <select
                id="language-select"
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 theme-transition"
                aria-label="Language"
            >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
