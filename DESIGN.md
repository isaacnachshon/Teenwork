# TeenWork Design System v1.0

## Vision

TeenWork היא פלטפורמה מודרנית למציאת עבודות לבני נוער בישראל, מעסיקים ומנהלי מערכת.

הממשק חייב להרגיש:

- מהיר
- נקי
- צעיר
- אמין
- נגיש
- Mobile First
- Responsive
- פשוט לשימוש גם למשתמש בן 14 וגם למעסיק בן 60

---

## Design Principles

1. פחות עומס.
2. פעולה אחת מרכזית בכל מסך.
3. ריווח גדול.
4. טקסט קריא.
5. צבעים עקביים.
6. אנימציות עדינות בלבד.
7. כל פעולה מקבלת Feedback.
8. אין יותר מ-3 צבעים ראשיים במסך.
9. אין Popups מיותרים.
10. כל מסך חייב לעבוד עם מקלדת בלבד.

---

## RTL & Language

- כל הממשק בעברית, כיוון RTL (`dir="rtl"`)
- טקסט מיושר לימין כברירת מחדל
- Layout ממוראה (sidebar בצד ימין ב-Desktop)
- כל קומפוננטה חייבת לתמוך ב-RTL: margins, paddings, borders, icons

---

## Supported Platforms

יש לפתח כל רכיב כך שיעבוד באופן מלא ב:

- Desktop
- Laptop
- Tablet
- Mobile Android
- Mobile iPhone
- PWA `[Planned]`

אין לפתח רכיב שעובד רק ב-Desktop.

---

## Responsive Breakpoints

| שם | טווח |
|---|---|
| Mobile | 0–639px |
| Tablet | 640–1023px |
| Desktop | 1024–1439px |
| Large Desktop | 1440px+ |

כל קומפוננטה חייבת להיות Responsive.

אין להשתמש ברוחב קבוע (למעט sidebar ב-Desktop: `260px`).

יש להשתמש ב:

- Flexbox (שימוש עיקרי כיום)
- CSS Grid (לפי הצורך)
- `min-width` / `max-width` עם אחוזים

> **מצב נוכחי**: רוב הקומפוננטות מותאמות ל-Desktop בלבד. Responsive הוא יעד לשלב הבא.

---

## Layout

### Desktop (מצב נוכחי)

```
---------------------------------------
Content           |          Sidebar
---------------------|
Header               |
                      |
Main                  |
                      |
---------------------------------------
```

- Sidebar: רוחב קבוע `260px`, רקע לבן, border-left `1px solid #EAECEF`
- Header: גובה `66px`, רקע לבן, border-bottom `1px solid #EAECEF`
- Main: `flex: 1`, רקע `#F5F6F8`

### Tablet `[Planned]`

```
Header
Navigation Drawer
Content
```

### Mobile `[Planned]`

```
Header
Content
Bottom Navigation
```

---

## Navigation

### Desktop (מצב נוכחי)

Sidebar קבוע עם:
- לוגו TEENWORK (סגול, gradient)
- תפריט ניווט (לפי role)
- כפתור פרופיל + התנתקות בתחתית

#### Tabs לפי תפקיד:

| Role | Tabs |
|------|------|
| Admin | סקירה כללית, ניהול משתמשים, התקשרויות, ניהול צ'אט, הגדרות |
| Employer | סקירה, מועמדים והעסקות, הודעות, הגדרות |
| Teen | סקירה, העבודות שלי, הודעות, עוזר AI, הגדרות |

### Tablet `[Planned]`

Drawer.

### Mobile `[Planned]`

Bottom Navigation עם: Home, Jobs, Messages, Notifications, Profile.

---

## Grid System `[Planned]`

| Platform | Columns |
|----------|---------|
| Desktop | 12 |
| Tablet | 8 |
| Mobile | 4 |

> **מצב נוכחי**: Layout מבוסס Flexbox inline. אין grid system פורמלי.

---

## Colors

### Brand Colors (בשימוש פעיל)

| שם | ערך | שימוש |
|----|-----|-------|
| **Primary** | `#7B2FF6` | צבע ראשי, כפתורים, לינקים, badges, nav active |
| **Primary Gradient** | `linear-gradient(135deg, #7B2FF6, #5560FF)` | לוגו, אווטארים, headers |
| **Primary Light** | `#F3ECFE` | רקע nav active, רקע badges, hover states |
| **Primary Hover** | `#E8DAF8` | borders של items פעילים |
| **Primary Dark** | `#5A18C2` / `#6A1FD0` | טקסט active, מצב נבחר |
| **Success** | `#0E8A48` | ירוק, אישורים, סטטיסטיקות חיוביות |
| **Success Light** | `#E4F5EA` | רקע ירוק |
| **Danger** | `#E23B4E` / `#EF4444` | שגיאות, notification badges |
| **Warning** | `#F59E0B` | אזהרות |

### UI Colors (בשימוש פעיל)

| שם | ערך | שימוש |
|----|-----|-------|
| **Background** | `#F5F6F8` | רקע ראשי של main area |
| **Surface** | `#FFFFFF` | כרטיסים, sidebar, header |
| **Text Primary** | `#1B2333` | טקסט ראשי |
| **Text Secondary** | `#4A576E` / `#5A6478` | טקסט משני |
| **Text Tertiary** | `#7A8699` / `#8A93A3` | טקסט רמז, placeholder |
| **Text Muted** | `#B0B8C7` | labels, section headers |
| **Border** | `#EAECEF` / `#ECEEF1` | borders ראשיים |
| **Border Light** | `#E3E6EC` / `#E7E9EE` | borders משניים, separators |
| **Inactive BG** | `#F4F5F7` | רקע אלמנטים לא פעילים |
| **Chat Text** | `#26303F` | טקסט בועות צ'אט נכנס |

### Landing Page Colors (Tailwind classes)

בדפי auth ו-landing משתמשים ב-Tailwind utility classes:
- `bg-purple-50`, `text-purple-500` — Primary
- `bg-pink-50`, `text-pink-500` — Pink accent
- `bg-blue-50`, `text-blue-500` — Blue accent
- `bg-green-50`, `text-green-500` — Green accent

### CSS Variables (ב-index.css)

```css
--bg-primary: #ffffff;
--bg-secondary: #f9fafb;
--bg-tertiary: #f3f4f6;
--text-primary: #111827;
--text-secondary: #6b7280;
--border-color: #e5e7eb;
--accent-primary: #3b82f6;
--accent-secondary: #10b981;
--accent-danger: #ef4444;
--accent-warning: #f59e0b;
```

> **הערה חשובה**: יש חוסר עקביות — הדשבורד משתמש ב-hardcoded hex values (inline styles), בעוד שדפי auth/landing משתמשים ב-Tailwind classes, וב-index.css יש CSS variables שונים שאינם בשימוש פעיל. **יש ליישר את כל הצבעים למערכת אחת.**

---

## Typography

| מאפיין | ערך |
|--------|-----|
| **Font Family** | `'Assistant', sans-serif` |
| **כיוון** | RTL |
| **Line Height** | `1.45–1.6` |

### סולם גדלים (בשימוש בפועל)

| שם | גודל | משקל | שימוש |
|----|-------|------|-------|
| Hero | `27px` | 800 | מספרים גדולים בסטטיסטיקות |
| Page Title | `25px` | 800 | כותרת דף, מספרים בולטים |
| Section Title | `20px` | 800 | שם הלוגו, כותרות sections |
| Card Title | `17px` | 700–800 | כותרת כרטיס, כותרת שיחה |
| Subtitle | `16px` | 600–700 | כותרת מסנן, כותרת משנה |
| Body | `15px` | 500–700 | תפריט nav, טקסט ראשי |
| Body Small | `14px` | 500–700 | inputs, כפתורים, תוכן כרטיסים |
| Caption | `13px` | 600 | טקסט עזר, תיאורים, זמנים |
| Micro | `12px` | 600–700 | labels, role labels, tags |
| Tiny | `11px` | 700 | section headers, notification count |

> **הערה**: Font `Inter` לא בשימוש. הפרויקט משתמש ב-`Assistant` — פונט עברי מעולה מ-Google Fonts.

---

## Border Radius (בשימוש בפועל)

| אלמנט | ערך |
|--------|-----|
| Cards / Panels | `16–18px` |
| Buttons | `10–12px` |
| Inputs | `10–12px` |
| Nav Items | `12px` |
| Icon Containers | `9–10px` |
| Badges | `10px` (pill) |
| Avatars | `50%` (עיגול) |
| Chat Bubbles | `14–16px` |
| Dialogs / Modals | `16–20px` |

---

## Shadows

Soft בלבד. אין צללים כבדים.

| שם | ערך | שימוש |
|----|-----|-------|
| Card | `0 1px 2px rgba(20,20,40,.04)` | כרטיסים |
| Nav Active | `0 2px 8px rgba(123,47,246,.08)` | nav item פעיל |
| Logo | `0 3px 10px rgba(123,47,246,.25)` | לוגו |
| Soft | `0 1px 3px rgba(0,0,0,.04)` | צ'אט bubbles |

---

## Buttons

### סוגים

| סוג | רקע | טקסט | Border | שימוש |
|-----|------|------|--------|-------|
| **Primary** | `#7B2FF6` | `#fff` | none | פעולה ראשית |
| **Secondary** | `#fff` | `#5A6478` | `1px solid #E6E8ED` | פעולה משנית, ביטול |
| **Ghost** | transparent | `#7B2FF6` | none | פעולות inline, links |
| **Danger** | `#EF4444` | `#fff` | none | מחיקה, פעולות הרסניות |
| **Toggle Active** | `#F3ECFE` | `#7B2FF6` | `2px solid #7B2FF6` | כפתור toggle נבחר |
| **Toggle Inactive** | `#fff` | `#5A6478` | `1px solid #E3E6EC` | כפתור toggle לא נבחר |
| **Filter Active** | `#1B2333` | `#fff` | `1px solid #1B2333` | מסנן פעיל |
| **Filter Inactive** | `#fff` | `#51607A` | `1px solid #E3E6EC` | מסנן לא פעיל |

### מידות

| מאפיין | ערך |
|--------|-----|
| Padding | `10px 18px` – `12px 20px` |
| Border Radius | `10–12px` |
| Font Size | `14–15px` |
| Font Weight | `600–700` |
| Font Family | `inherit` |
| Cursor | `pointer` |
| Disabled Opacity | `0.6` |

---

## Forms

כל Input כולל:

- Label
- Placeholder
- Helper Text (אופציונלי)
- Validation
- Error State
- Success State

### Input Style (דשבורד)

```
border: none
background: transparent / #F4F5F7
border-radius: 10–12px
padding: 9px 14px
font-size: 14px
font-family: inherit
color: #2A3242
```

### Input Container Style

```
background: #F4F5F7
border: 1px solid #ECEEF1
border-radius: 12px
padding: 9px 14px
```

---

## Cards

כל Card כולל:

| מאפיין | ערך |
|--------|-----|
| Background | `#FFFFFF` |
| Padding | `20–24px` |
| Border Radius | `16–18px` |
| Border | `1px solid #EAECEF` (אופציונלי) |
| Shadow | `0 1px 2px rgba(20,20,40,.04)` |
| Hover Effect | `background .15s ease` |

---

## Icons

### Dashboard (DashboardIcons.tsx)

Custom SVG icon system — 20+ אייקונים מותאמים:

`overview`, `users`, `user`, `link`, `chat`, `bell`, `search`, `briefcase`, `logout`, `plus`, `shield`, `flag`, `send`, `check`, `clock`, `eye`, `star`, `calendar`, `wallet`, `alert`, `ban`, `dots`, `scale`, `gear`

### Landing Page (icons.tsx)

קומפוננטות SVG מותאמות:

`UserIcon`, `BriefcaseIcon`, `SearchIcon`, `UtensilsCrossedIcon`, `BabyIcon`, `BookOpenTextIcon`, `StoreIcon`, `DropletsIcon`, `StarIcon`, `ClipboardListIcon`, `WalletIcon`, `LinkedinIcon`, `InstagramIcon`, `FacebookIcon`

> **כלל**: אין לערבב ספריות אייקונים חיצוניות. להשתמש אך ורק ב-custom SVGs הקיימים. אם צריך אייקון חדש — להוסיף ל-DashboardIcons.tsx.

---

## Animations

| מאפיין | ערך |
|--------|-----|
| Duration | `150–200ms` |
| Transition | `all .15s` / `ease` |
| Properties | `background`, `color`, `border-color`, `box-shadow`, `width`, `height` |

אין להשתמש באנימציות ארוכות (מעל 300ms).

---

## Loading States

| סוג | שימוש | מצב |
|-----|-------|-----|
| Text "טוען..." | מסך טעינה ראשי ב-App.tsx | `[קיים]` |
| Skeleton Loading | דפי login (חלקי) | `[חלקי]` |
| Spinner | fallback כשאין אפשרות אחרת | `[Planned]` |
| Disabled + opacity 0.6 | כפתורים בזמן שליחה | `[קיים]` |

> **יעד**: להחליף את כל "טוען..." ב-Skeleton Loading.

---

## Empty States `[Planned]`

כל רשימה ריקה חייבת להכיל:

- Icon
- Title
- Description
- Action Button

> **מצב נוכחי**: רוב הרשימות מציגות טקסט פשוט בלבד.

---

## Error States

כל שגיאה חייבת לכלול:

- Icon
- Title
- Explanation (הסבר בעברית פשוטה)
- Retry Button (כפתור ניסיון חוזר)

### שגיאת אתחול (קיימת ב-App.tsx)

```
רקע: bg-gray-50
כרטיס: bg-white, padding 32px, border-radius 12px, shadow
כותרת: text-xl, bold
טקסט שגיאה: bg-gray-100, text-red-700, overflow-auto
```

---

## Accessibility

| דרישה | מצב |
|-------|-----|
| WCAG AA | `[Target]` |
| Contrast Ratio תקין | `[חלקי]` |
| Keyboard Navigation | `[קיים]` — focus styles מוגדרים ב-index.css |
| Screen Reader Support | `[חלקי]` — sr-only class קיים |
| Visible Focus | `[קיים]` — `2px solid var(--accent-primary)` |
| ARIA Labels | `[חלקי]` |
| Skip to Main Content | `[קיים]` — `.skip-to-main` |
| Reduced Motion | `[קיים]` — `prefers-reduced-motion` |
| High Contrast | `[קיים]` — `prefers-contrast: high` |

---

## Role-Based Dashboards

### Teen Dashboard

| Section | מצב |
|---------|-----|
| Overview (Welcome, Stats) | `[קיים]` |
| Profile + Completion Bar | `[קיים]` |
| Connections (העבודות שלי) | `[קיים]` |
| Chat (הודעות) | `[קיים]` |
| AI Assistant | `[קיים]` |
| Rights Info Modal | `[קיים]` |
| Settings | `[קיים]` |
| Recommended Jobs | `[קיים]` — בדשבורד הישן |
| Nearby Jobs (Haversine) | `[קיים]` — בדשבורד הישן |

### Employer Dashboard

| Section | מצב |
|---------|-----|
| Overview (Stats) | `[קיים]` |
| Connections (מועמדים) | `[קיים]` |
| Chat (הודעות) | `[קיים]` |
| Settings | `[קיים]` |
| Job Publishing (4-step form) | `[קיים]` — בדשבורד הישן |
| Applicant Profiles | `[קיים]` |

### Admin Dashboard

| Section | מצב |
|---------|-----|
| Overview (Statistics + Charts) | `[קיים]` |
| User Management | `[קיים]` |
| Connections | `[קיים]` |
| Chat Management | `[קיים]` |
| Settings | `[קיים]` |
| Add User Modal | `[קיים]` |

---

## Mobile Behavior `[Planned]`

- כל הטפסים במסך אחד
- אין Modal מלא במובייל — Bottom Sheet עדיף על Dialog
- Bottom Navigation תמיד גלוי
- Floating Action Button רק במסכים המתאימים
- Sidebar הופך ל-Drawer

> **מצב נוכחי**: הדשבורד Desktop-only עם sidebar קבוע `260px`. אין responsive adaptation.

---

## Tables

| Platform | תצוגה |
|----------|-------|
| Desktop | Table רגיל |
| Mobile | Cards `[Planned]` |

אין Tables במובייל.

---

## Images

| מאפיין | מצב |
|--------|-----|
| Lazy Loading | `[Planned]` |
| Responsive | `[חלקי]` |
| Optimized | `[Planned]` |
| WebP | `[Planned]` |
| Fallback Avatar | `[קיים]` — gradient עם אות ראשונה |

> **מצב נוכחי**: אווטארים מבוססים gradient+initial (ללא תמונה חיצונית). תמונות פרופיל עם fallback ל-`ui-avatars.com`.

---

## Theme

| מצב | סטטוס |
|-----|-------|
| Light Mode | `[קיים]` — ברירת מחדל |
| Dark Mode | `[Planned]` — CSS variables מוגדרים, אין toggle |
| Theme שמור ב-Firebase | `[Planned]` |

> **מצב נוכחי**: CSS variables ל-dark mode קיימים ב-index.css (`[data-theme="dark"]`) אבל אף קומפוננטה לא מפעילה אותם. הדשבורד משתמש ב-hardcoded light colors.

---

## Performance `[Targets]`

| מדד | יעד |
|-----|-----|
| Lighthouse | 90+ |
| CLS | < 0.1 |
| LCP | < 2.5s |
| FID | < 100ms |

> **מצב נוכחי**: אין lazy loading, אין code splitting, אין image optimization. דרוש מדידה ושיפור.

---

## Styling Architecture

### מצב נוכחי (מעורב)

| אזור | שיטה |
|-------|-------|
| Landing Page, Auth Pages | Tailwind CSS utility classes (`className`) |
| Dashboard, Chat, Profile | Inline styles (`style={{...}}`) |
| Global styles | CSS file (`public/index.css`) עם CSS variables |

### כללים

- **אין** Bootstrap
- **אין** Material UI
- **אין** Styled Components
- פונט: `Assistant` (Google Fonts) — לא Inter
- כל inline style חייב להשתמש ב-`fontFamily: 'inherit'`

> **יעד ארוך טווח**: לאחד את כל ה-styling ל-Tailwind CSS בלבד ולבטל inline styles.

---

## Component Rules

כל רכיב חדש:

- [ ] Reusable
- [ ] Typed (TypeScript strict)
- [ ] Accessible (keyboard + screen reader)
- [ ] Responsive (Desktop לפחות, Mobile כ-target)
- [ ] RTL-compatible
- [ ] Uses existing color palette (אין צבעים חדשים ללא אישור)
- [ ] Uses existing icon system (DashboardIcons.tsx)
- [ ] Uses `fontFamily: inherit` (Assistant)

---

## File Naming

| Convention | דוגמה |
|------------|-------|
| Components | `PascalCase.tsx` — `UserProfileCard.tsx` |
| Pages | `PascalCase.tsx` — `JobDetailPage.tsx` |
| Services | `PascalCase.ts` — `NotificationService.ts` |
| Types | `camelCase.ts` — `dashboard.ts` |
| Hooks | `camelCase.ts` — `useAuth.ts` |

---

## File Structure

```
src/
├── app/              # App.tsx (entry point, auth routing)
├── components/       # Shared components (icons, modals, map, notifications)
├── contexts/         # React contexts (AuthContext)
├── layouts/          # Layout components (DashboardLayout)
├── pages/
│   ├── auth/         # Login, signup, verification pages
│   ├── dashboard/    # Dashboard pages per role
│   ├── jobs/         # Job listing, detail, applicants
│   └── profile/      # Profile view & edit
├── services/         # Firebase service wrappers
├── types/            # TypeScript type definitions
└── firebase.ts       # Firebase initialization
```

---

## Design Goal

כל מסך חדש חייב להיראות כאילו תוכנן על ידי אותו צוות עיצוב, ללא קשר למי כתב את הקוד.

- אותם צבעים
- אותם border-radius
- אותם font sizes
- אותם shadows
- אותו spacing rhythm
- אותו icon style

---

## Migration Roadmap

### Phase 1 — Consistency (עכשיו)
- [ ] ליישר CSS variables ב-index.css לצבעים בפועל (#7B2FF6)
- [ ] לבנות color tokens אחידים

### Phase 2 — Responsive
- [ ] להוסיף media queries ל-DashboardLayout
- [ ] להמיר sidebar ל-drawer במובייל
- [ ] להוסיף Bottom Navigation למובייל

### Phase 3 — Dark Mode
- [ ] להפעיל toggle ב-Settings
- [ ] לעדכן כל inline styles לתמוך ב-theme
- [ ] לשמור העדפה ב-Firebase

### Phase 4 — Polish
- [ ] Skeleton loading בכל הדפים
- [ ] Empty states מעוצבים
- [ ] Error states אחידים
- [ ] PWA support
- [ ] Image optimization
- [ ] Performance audit
