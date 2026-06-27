# TEENWORK — מדריך ידע לאפליקציה

## מה האפליקציה עושה
TEENWORK היא פלטפורמת עבודה לנוער בישראל. היא מחברת בין נערים ונערות (14–18) המחפשים עבודה לבין מעסיקים המחפשים כוח עבודה צעיר. קיימת גם ממשק ניהול למנהלי המערכת.

---

## סטאק טכנולוגי
- **Frontend**: React 19 + TypeScript + Vite 6
- **Backend/DB**: Firebase (Auth + Firestore + Storage)
- **עיצוב**: Tailwind CSS (inline classes)
- **גרפים**: Recharts (לדשבורד המנהל)
- **בינה מלאכותית**: הוסר (היה Gemini API — הוחלף בחישוב Haversine מקומי)
- **בדיקות**: Playwright (E2E)
- **פריסה**: Firebase Hosting → `teensworks.com`

---

## מבנה תיקיות
```
teenwork/
├── App.tsx                    # נקודת כניסה ראשית, ניהול routing ו-Auth state
├── firebase.ts                # אתחול Firebase (auth, db, storage)
├── types.ts                   # טיפוסי TypeScript (Job, Applicant, UserProfile)
├── index.tsx                  # ReactDOM render
├── .env.local                 # משתני סביבה (Firebase config)
├── firebase.json              # הגדרות Firebase Hosting
├── .firebaserc                # project: teenwork-4c9de
└── components/
    ├── dashboards/
    │   ├── TeenDashboard.tsx      # דשבורד נוער
    │   ├── EmployerDashboard.tsx  # דשבורד מעסיקים
    │   └── AdminDashboard.tsx     # דשבורד מנהל
    ├── LandingPage.tsx            # דף נחיתה ראשי
    ├── TeenLoginPage.tsx          # הרשמה/כניסה לנוער
    ├── EmployerLoginPage.tsx      # הרשמה/כניסה למעסיקים
    ├── LoginPage.tsx              # כניסה למנהלים
    ├── ProfilePage.tsx            # צפייה בפרופיל נוער
    ├── EditProfilePage.tsx        # עריכת פרופיל נוער
    ├── EmployerProfilePage.tsx    # פרופיל מעסיק
    ├── JobsPage.tsx               # חיפוש משרות (נוער)
    ├── JobDetailPage.tsx          # פרטי משרה בודדת
    ├── ApplicantsListView.tsx     # רשימת מועמדים למשרה
    ├── ApplicantProfileView.tsx   # פרופיל מועמד (למעסיק)
    ├── EmailVerificationPage.tsx  # אימות אימייל לנוער
    ├── RightsInfoModal.tsx        # מידע על זכויות נוער בעבודה
    └── icons.tsx                  # אייקוני SVG
```

---

## תפקידים (Roles)
| Role | תיאור | כניסה |
|------|--------|-------|
| `teen` | נוער מחפש עבודה | TeenLoginPage — דורש אימות אימייל |
| `employer` | מעסיק מפרסם משרות | EmployerLoginPage |
| `admin` | מנהל המערכת | LoginPage (ללא הרשמה עצמית) |
| `landing` | מצב ברירת מחדל (לא מחובר) | LandingPage |

---

## Firestore — מבנה הנתונים

### אוסף `users`
```
users/{uid}
├── uid: string
├── email: string
├── role: 'teen' | 'employer' | 'admin'
├── createdAt: Timestamp
│
│ — נוער בלבד —
├── name: string
├── age: number
├── location: string (טקסט חופשי)
├── coordinates: { lat: number, lng: number }
├── profileImageUrl: string
├── bio: string
├── skills: string[]
├── preferredJobTypes: Job['type'][]
├── workHistory: { id, title, company, duration }[]
└── reviews: { id, reviewer, rating, comment }[]
│
│ — מעסיק בלבד —
├── companyName: string
├── profileImageUrl: string (לוגו חברה)
└── companyLogoUrl: string
```

### אוסף `jobs`
```
jobs/{jobId}
├── title: string
├── company: string
├── companyLogoUrl?: string
├── location: string
├── coordinates?: { lat, lng }
├── salary: number (לשעה בש"ח)
├── type: 'קייטרינג'|'ניקיון'|'בייביסיטר'|'שיעורים'|'מלצרות'|'סבלות'
├── description: string
├── days?: string[] (ימי שבוע)
├── startTime?: string ('HH:MM')
├── endTime?: string ('HH:MM')
├── skills?: string[]
├── experience?: string
├── applicantsCount?: number
├── employerId: string (uid של המעסיק)
└── createdAt: Timestamp
```

### אוסף `applications`
```
applications/{appId}
├── applicantId: string (uid של הנוער)
├── employerId: string (uid של המעסיק)
├── jobId: string
├── jobTitle: string
├── status: 'new' | 'viewed' | 'contacted'
└── createdAt: Timestamp
```

---

## Firebase Auth
- **ספק**: Email/Password בלבד
- **אימות אימייל**: חובה לנוער — יש 24 שעות להשלים, אחרת החשבון נמחק
- **דומיינים מורשים**: `localhost`, `teenwork-4c9de.web.app`, `teensworks.com`
- **יצירת משתמש ע"י מנהל**: נעשית דרך app זמני (`initializeApp` + `deleteApp`) כדי לא להוציא את המנהל מהחשבון

---

## זרימת Auth בApp.tsx
1. `onAuthStateChanged` מאזין לשינויי מצב
2. אם משתמש מחובר — `onSnapshot` על `users/{uid}` לקבלת `role`
3. לפי `role` מנתב לדשבורד המתאים
4. אם נוער ואימייל לא מאומת → `EmailVerificationPage`
5. אם token פג → הפניה לדף ההתחברות

---

## דשבורד נוער (TeenDashboard)
**תצוגות**: `home` | `jobs` | `communities` | `profile` | `editProfile` | `jobDetail`

**תכונות**:
- עבודות מומלצות (כל המשרות מ-Firestore)
- עבודות קרובות (מחשב מרחק ב-km בהיאוורסין, מסנן ב-50 ק"מ, מציג 5 הקרובות)
- מפת עבודות (placeholder)
- סטוריז מהקהילה (נתונים דמו)
- חיפוש מהיר
- פרופיל עם עריכה
- מידע זכויות נוער (RightsInfoModal)
- תמיכה בתפריט מובייל (Hamburger menu)

---

## דשבורד מעסיק (EmployerDashboard)
**תצוגות**: `dashboard` | `profile` | `applicants` | `applicantProfile`

**תכונות**:
- פרסום משרה חדשה — טופס 4 שלבים: (1) פרטי משרה (2) מיקום+ימים+שעות (3) שכר+כישורים (4) סיכום
- עריכת משרה קיימת
- צפייה ברשימת מועמדים לכל משרה
- צפייה בפרופיל מועמד בודד
- סטטיסטיקות (משרות פעילות, מועמדים חדשים, תשלומים)
- 5 מועמדים אחרונים עם סטטוס (new/viewed/contacted)

**סוגי משרות**: `קייטרינג`, `ניקיון`, `בייביסיטר`, `שיעורים`, `מלצרות`, `סבלות`

---

## דשבורד מנהל (AdminDashboard)
**תכונות**:
- סטטיסטיקות כלליות (משתמשים, משרות, הכנסות)
- גרפים: צמיחת משתמשים (LineChart), הכנסות (BarChart), קטגוריות משרות (PieChart)
- ניהול נוער: צפייה, עריכה, מחיקה
- ניהול מעסיקים: צפייה, עריכה, מחיקה
- הוספת משתמש חדש (נוער או מעסיק)
- **הערה**: מחיקה מוחקת מ-Firestore בלבד, לא מ-Firebase Auth

---

## פרויקט Firebase
- **Project ID**: `teenwork-4c9de`
- **Hosting site**: `teenwork-4c9de.web.app`
- **דומיין מותאם**: `teensworks.com`
- **אזור**: ברירת מחדל (us-central1)

---

## סביבת פיתוח
```bash
cd teenwork
npm run dev      # שרת פיתוח על localhost:3000
npm run build    # בנייה לייצור (dist/)
firebase deploy --only hosting  # פריסה ל-Firebase Hosting
```

---

## נקודות חשובות לפיתוח
1. **RTL**: האפליקציה בעברית, ה-UI מימין לשמאל
2. **אין router**: הניווט מנוהל ע"י state מקומי בתוך כל דשבורד
3. **env variables**: כל משתני Firebase חייבים להתחיל ב-`VITE_` כדי להיחשף לקוד
4. **מרחק**: חישוב Haversine ב-TeenDashboard וב-JobDetailPage לסינון ומרחק עבודות
5. **תמונות פרופיל**: fallback ל-`ui-avatars.com` עם שם המשתמש
