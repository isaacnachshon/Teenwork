# Sprint 1 – Foundation Backlog

## Objective

להביא את TeenWork לגרסת התשתית הראשונה של v1.0, שבה המשתמשים יכולים להתחבר, ליצור פרופיל, לגשת ללוח המחוונים, ולהתבסס על מסד נתונים מאובטח.

## Priority Legend

- 🔴 Critical: חובה לשלב לפני כל פיתוח נוסף
- 🟠 High: חשוב מאוד, אך לא תמיד מחייב את כל המערכת
- 🟡 Medium: נדרש לשלב מאוחר יותר או כבסיס לפיצ'רים עתידיים

## Current Focus

הפוקוס המיידי של הספינט הוא בשלושה מרכיבים קריטיים:

1. Firebase Authentication
2. Auto User Creation
3. Dashboard בסיסי

ברגע שלושה אלה עובדים, שאר המערכת הופכת קלה הרבה יותר לפיתוח.

## Backlog

| ID | Task | Priority | Status | Depends On | Definition of Done |
| --- | --- | --- | --- | --- | --- |
| AUTH-001 | Google Login | 🔴 Critical | ⬜ Not Started | None | משתמש יכול להתחבר עם Google, להיכנס למערכת, ולהיות מופנה ל-dashboard המתאים |
| AUTH-002 | Email Login | 🔴 Critical | ⬜ Not Started | None | משתמש יכול להתחבר עם אימייל וסיסמה, עם טיפול בשגיאות תקינות |
| AUTH-003 | Sign Up | 🔴 Critical | ⬜ Not Started | None | משתמש יכול ליצור חשבון, להירשם ולהיכנס למערכת |
| AUTH-004 | Logout | 🟠 High | ⬜ Not Started | AUTH-002 / AUTH-003 | המשתמש יכול להתנתק ולהחזיר את המערכת למצב לא מחובר |
| AUTH-005 | Forgot Password | 🟠 High | ⬜ Not Started | AUTH-002 | המשתמש יכול לאפס סיסמה ולקבל מייל/טיפול מתאים |
| AUTH-006 | Email Verification | 🔴 Critical | ⬜ Not Started | AUTH-003 | משתמש חדש מקבל אימות מייל, והמערכת מטפלת במצב לא מאומת |
| AUTH-007 | Session Restore | 🔴 Critical | ⬜ Not Started | AUTH-002 / AUTH-003 | לאחר רענון דף, המשתמש נשאר מחובר אם המידע תקף |
| AUTH-008 | Protected Routes | 🔴 Critical | ⬜ Not Started | AUTH-007 | דפים מוגנים לא נגישים ללא התחברות, עם redirect מתאים |
| USR-001 | Auto User Creation | 🔴 Critical | ⬜ Not Started | AUTH-002 / AUTH-003 | עם התחברות, נוצר מסמך משתמש ב-firestore אם הוא לא קיים |
| DB-001 | Firestore Collections | 🔴 Critical | ⬜ Not Started | None | נבנות הקולקציות users, companies, jobs, applications, messages, notifications, reports, settings |
| SEC-001 | Firestore Security Rules | 🔴 Critical | ⬜ Not Started | DB-001 | כל רמת גישה מוגדרת בבטחה: user/self, employer/company, admin/full |
| ROL-001 | Role System | 🔴 Critical | ⬜ Not Started | USR-001 | קיימות התפקידים Teen, Employer, Admin, והמערכת מזהה אותם נכון |
| ROU-001 | Routing Shell | 🟠 High | ⬜ Not Started | ROL-001 | קיימים מסלולים בסיסיים: Landing, Login, Register, Dashboard, Profile, Jobs, Messages, Settings |
| DASH-001 | Teen Dashboard | 🟠 High | ⬜ Not Started | AUTH-008 / ROL-001 | ללוח המחוונים של Teen יש כותרת, התקדמות פרופיל, משרות מומלצות, בקשות חדשות |
| DASH-002 | Employer Dashboard | 🟠 High | ⬜ Not Started | AUTH-008 / ROL-001 | ללוח המחוונים של Employer יש סקירה כללית, משרות, מועמדים, הודעות |
| DASH-003 | Admin Dashboard | 🟠 High | ⬜ Not Started | AUTH-008 / ROL-001 | לאדמין יש לוח מחוונים עם סטטיסטיקות וניהול בסיסי |
| PRF-001 | Profile Completion | 🟠 High | ⬜ Not Started | USR-001 | המשתמש יכול למלא פרטים כמו שם מלא, טלפון, עיר, בית ספר, כישורים, זמינות |
| JOB-001 | Job CRUD | 🟡 Medium | ⬜ Not Started | DB-001 | Employer יכול ליצור, לערוך ולמחוק משרות בסיסיות |
| JOB-002 | Job Discovery | 🟡 Medium | ⬜ Not Started | DB-001 | Teen יכול לחפש ולסנן משרות |
| APP-001 | Applications Flow | 🟡 Medium | ⬜ Not Started | JOB-001 | משתמש יכול להגיש בקשה למשרה ולראות את סטטוסה |
| MSG-001 | Messaging | 🟡 Medium | ⬜ Not Started | DB-001 | קיימת תקשורת בסיסית בין משתמשים עם הודעות |
| STO-001 | Firebase Storage | 🟠 High | ⬜ Not Started | DB-001 | אפשר להעלות תמונת פרופיל, קורות חיים ולוגו חברה |
| AI-001 | AI Assistant Foundation | 🟡 Medium | ⬜ Not Started | PRF-001 / JOB-002 | המערכת יכולה להציע סיוע בסיסי למשתמשים על סמך פרופיל ומשרות |
| NOT-001 | Notifications | 🟡 Medium | ⬜ Not Started | DB-001 | קיימות התראות בתוך המערכת, push ו-email בהמשך |
| ADM-001 | Admin Management | 🟡 Medium | ⬜ Not Started | ROL-001 | אדמין יכול לנהל משתמשים, חברות, משרות ודיווחים |
| TEST-001 | Core Testing | 🟠 High | ⬜ Not Started | AUTH-008 / USR-001 | נבדקות כניסות, הרשמה, לוגיקה של dashboard ו-firestore |
| DEP-001 | Deployment Setup | 🟠 High | ⬜ Not Started | TEST-001 | האפליקציה נפרסת ל-Firebase Hosting עם Functions/Firestore/Storage |

## Definition of Ready

משימה נחשבת מוכנה להתחלה אם:

- יש לה מטרה ברורה
- ברור מהו ה-Definition of Done
- יש לה תלות ברורה או שאין לה תלות
- ניתן לבדוק אותה בצורה מעשית

## Definition of Done

משימה נחשבת מושלמת אם:

- הקוד עובד בסביבת הפיתוח
- יש בדיקה ידנית או אוטומטית בסיסית
- לא קיימות בעיות ברורות ב-build
- התוצאה נראית רלוונטית למטרת הספינט
