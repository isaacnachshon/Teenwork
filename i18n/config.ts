
// Use standard i18next import
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
    he: {
        translation: {
            // Common
            'common.loading': 'טוען...',
            'common.error': 'שגיאה',
            'common.success': 'הצלחה',
            'common.save': 'שמור',
            'common.cancel': 'ביטול',
            'common.delete': 'מחק',
            'common.edit': 'ערוך',
            'common.search': 'חיפוש',
            'common.filter': 'סינון',
            'common.close': 'סגור',

            // Navigation
            'nav.home': 'בית',
            'nav.jobs': 'משרות',
            'nav.profile': 'פרופיל',
            'nav.dashboard': 'לוח בקרה',
            'nav.logout': 'התנתק',
            'nav.login': 'התחבר',
            'nav.signup': 'הרשם',

            // Auth
            'auth.email': 'אימייל',
            'auth.password': 'סיסמה',
            'auth.confirmPassword': 'אימות סיסמה',
            'auth.forgotPassword': 'שכחת סיסמה?',
            'auth.signInWithGoogle': 'התחבר עם Google',
            'auth.alreadyHaveAccount': 'כבר יש לך חשבון?',
            'auth.dontHaveAccount': 'אין לך חשבון?',
            'auth.signIn': 'התחבר',
            'auth.signUp': 'הרשם',

            // Jobs
            'jobs.title': 'משרות',
            'jobs.search': 'חפש משרות',
            'jobs.noJobs': 'לא נמצאו משרות',
            'jobs.apply': 'הגש מועמדות',
            'jobs.viewDetails': 'צפה בפרטים',
            'jobs.salary': 'שכר',
            'jobs.location': 'מיקום',
            'jobs.type': 'סוג משרה',
            'jobs.posted': 'פורסם',

            // Profile
            'profile.title': 'פרופיל',
            'profile.edit': 'ערוך פרופיל',
            'profile.name': 'שם',
            'profile.age': 'גיל',
            'profile.bio': 'אודות',
            'profile.skills': 'כישורים',
            'profile.experience': 'ניסיון',
            'profile.photo': 'תמונת פרופיל',

            // Dashboard
            'dashboard.welcome': 'שלום',
            'dashboard.stats': 'סטטיסטיקות',
            'dashboard.recentActivity': 'פעילות אחרונה',

            // Settings
            'settings.title': 'הגדרות',
            'settings.theme': 'ערכת נושא',
            'settings.language': 'שפה',
            'settings.notifications': 'התראות',
            'settings.privacy': 'פרטיות',

            // Theme
            'theme.light': 'בהיר',
            'theme.dark': 'כהה',
            'theme.system': 'אוטומטי',

            // Accessibility
            'a11y.skipToMain': 'דלג לתוכן הראשי',
            'a11y.menu': 'תפריט',
            'a11y.closeMenu': 'סגור תפריט',
            'a11y.openMenu': 'פתח תפריט',
        }
    },
    en: {
        translation: {
            // Common
            'common.loading': 'Loading...',
            'common.error': 'Error',
            'common.success': 'Success',
            'common.save': 'Save',
            'common.cancel': 'Cancel',
            'common.delete': 'Delete',
            'common.edit': 'Edit',
            'common.search': 'Search',
            'common.filter': 'Filter',
            'common.close': 'Close',

            // Navigation
            'nav.home': 'Home',
            'nav.jobs': 'Jobs',
            'nav.profile': 'Profile',
            'nav.dashboard': 'Dashboard',
            'nav.logout': 'Logout',
            'nav.login': 'Login',
            'nav.signup': 'Sign Up',

            // Auth
            'auth.email': 'Email',
            'auth.password': 'Password',
            'auth.confirmPassword': 'Confirm Password',
            'auth.forgotPassword': 'Forgot Password?',
            'auth.signInWithGoogle': 'Sign in with Google',
            'auth.alreadyHaveAccount': 'Already have an account?',
            'auth.dontHaveAccount': "Don't have an account?",
            'auth.signIn': 'Sign In',
            'auth.signUp': 'Sign Up',

            // Jobs
            'jobs.title': 'Jobs',
            'jobs.search': 'Search jobs',
            'jobs.noJobs': 'No jobs found',
            'jobs.apply': 'Apply',
            'jobs.viewDetails': 'View Details',
            'jobs.salary': 'Salary',
            'jobs.location': 'Location',
            'jobs.type': 'Job Type',
            'jobs.posted': 'Posted',

            // Profile
            'profile.title': 'Profile',
            'profile.edit': 'Edit Profile',
            'profile.name': 'Name',
            'profile.age': 'Age',
            'profile.bio': 'About',
            'profile.skills': 'Skills',
            'profile.experience': 'Experience',
            'profile.photo': 'Profile Photo',

            // Dashboard
            'dashboard.welcome': 'Welcome',
            'dashboard.stats': 'Statistics',
            'dashboard.recentActivity': 'Recent Activity',

            // Settings
            'settings.title': 'Settings',
            'settings.theme': 'Theme',
            'settings.language': 'Language',
            'settings.notifications': 'Notifications',
            'settings.privacy': 'Privacy',

            // Theme
            'theme.light': 'Light',
            'theme.dark': 'Dark',
            'theme.system': 'System',

            // Accessibility
            'a11y.skipToMain': 'Skip to main content',
            'a11y.menu': 'Menu',
            'a11y.closeMenu': 'Close menu',
            'a11y.openMenu': 'Open menu',
        }
    },
    ar: {
        translation: {
            // Common
            'common.loading': 'جار التحميل...',
            'common.error': 'خطأ',
            'common.success': 'نجاح',
            'common.save': 'حفظ',
            'common.cancel': 'إلغاء',
            'common.delete': 'حذف',
            'common.edit': 'تحرير',
            'common.search': 'بحث',
            'common.filter': 'تصفية',
            'common.close': 'إغلاق',

            // Navigation
            'nav.home': 'الرئيسية',
            'nav.jobs': 'الوظائف',
            'nav.profile': 'الملف الشخصي',
            'nav.dashboard': 'لوحة التحكم',
            'nav.logout': 'تسجيل الخروج',
            'nav.login': 'تسجيل الدخول',
            'nav.signup': 'التسجيل',

            // Auth
            'auth.email': 'البريد الإلكتروني',
            'auth.password': 'كلمة المرور',
            'auth.confirmPassword': 'تأكيد كلمة المرور',
            'auth.forgotPassword': 'نسيت كلمة المرور؟',
            'auth.signInWithGoogle': 'تسجيل الدخول باستخدام Google',
            'auth.alreadyHaveAccount': 'هل لديك حساب بالفعل؟',
            'auth.dontHaveAccount': 'ليس لديك حساب؟',
            'auth.signIn': 'تسجيل الدخول',
            'auth.signUp': 'التسجيل',

            // Jobs
            'jobs.title': 'الوظائف',
            'jobs.search': 'البحث عن وظائف',
            'jobs.noJobs': 'لم يتم العثور على وظائف',
            'jobs.apply': 'تقدم',
            'jobs.viewDetails': 'عرض التفاصيل',
            'jobs.salary': 'الراتب',
            'jobs.location': 'الموقع',
            'jobs.type': 'نوع الوظيفة',
            'jobs.posted': 'نشر في',

            // Profile
            'profile.title': 'الملف الشخصي',
            'profile.edit': 'تحرير الملف الشخصي',
            'profile.name': 'الاسم',
            'profile.age': 'العمر',
            'profile.bio': 'نبذة',
            'profile.skills': 'المهارات',
            'profile.experience': 'الخبرة',
            'profile.photo': 'صورة الملف الشخصي',

            // Dashboard
            'dashboard.welcome': 'مرحباً',
            'dashboard.stats': 'الإحصائيات',
            'dashboard.recentActivity': 'النشاط الأخير',

            // Settings
            'settings.title': 'الإعدادات',
            'settings.theme': 'المظهر',
            'settings.language': 'اللغة',
            'settings.notifications': 'الإشعارات',
            'settings.privacy': 'الخصوصية',

            // Theme
            'theme.light': 'فاتح',
            'theme.dark': 'داكن',
            'theme.system': 'تلقائي',

            // Accessibility
            'a11y.skipToMain': 'انتقل إلى المحتوى الرئيسي',
            'a11y.menu': 'القائمة',
            'a11y.closeMenu': 'إغلاق القائمة',
            'a11y.openMenu': 'فتح القائمة',
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'he', // default language
        fallbackLng: 'he',
        interpolation: {
            escapeValue: false // React already escapes
        },
        react: {
            useSuspense: false
        }
    });

export default i18n;
