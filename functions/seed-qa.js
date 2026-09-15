/* eslint-disable */
/**
 * Seeds clearly-labeled QA accounts and jobs in the teenwork-4c9de project (production).
 *
 *   cd functions
 *   set GOOGLE_APPLICATION_CREDENTIALS=path\to\serviceAccount.json   (or gcloud ADC)
 *   node seed-qa.js            # create / refresh
 *   node seed-qa.js --cleanup  # delete everything flagged isTestAccount / isTestData
 *
 * Parent OTP: add +972 55-000-0001 / 123456 under Authentication > Sign-in method > Phone > test numbers.
 */
const admin = require("firebase-admin");

admin.initializeApp({projectId: process.env.GCLOUD_PROJECT || "teenwork-4c9de"});
const db = admin.firestore();
const auth = admin.auth();

const PASSWORD = "QaTest!2026";
const PARENT = {parentName: "הורה בדיקה", parentEmail: "qa-parent@teensworks.com", parentPhone: "0550000001"};
const TERMS_VERSION = "2";

const iso = (d) => d.toISOString().slice(0, 10);
const yearsAgo = (years, extraDays) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  d.setDate(d.getDate() - extraDays);
  return iso(d);
};

const USERS = [
  {email: "qa-teen14@teensworks.com", role: "teen", name: "[QA] נער 14", birthDate: yearsAgo(14, 30)},
  {email: "qa-teen17@teensworks.com", role: "teen", name: "[QA] נערה 17", birthDate: yearsAgo(17, 30)},
  {email: "qa-employer@teensworks.com", role: "employer", companyName: "[QA] עסק בדיקה"},
  {email: "qa-admin@teensworks.com", role: "admin", name: "[QA] מנהל"},
];

async function ensureAuthUser(email, displayName) {
  try {
    const u = await auth.getUserByEmail(email);
    await auth.updateUser(u.uid, {password: PASSWORD, emailVerified: true, displayName});
    return u.uid;
  } catch (e) {
    if (e.code !== "auth/user-not-found") throw e;
    const u = await auth.createUser({email, password: PASSWORD, emailVerified: true, displayName});
    return u.uid;
  }
}

async function seed() {
  const now = admin.firestore.FieldValue.serverTimestamp();
  const uids = {};
  for (const u of USERS) {
    const uid = await ensureAuthUser(u.email, u.name || u.companyName);
    uids[u.email] = uid;
    const base = {
      uid, email: u.email, role: u.role, displayName: u.name || u.companyName,
      status: "active", profileCompleted: true, isTestAccount: true,
      termsVersion: TERMS_VERSION, termsAcceptedAt: now, createdAt: now, updatedAt: now, lastLogin: now,
      phone: "", city: "תל אביב",
    };
    const extra = u.role === "teen" ? {
      name: u.name, birthDate: u.birthDate, skills: ["אחריות", "עבודת צוות"], availability: ["אחר הצהריים"],
      parentalConsentStatus: "pending", ...PARENT, idNumber: "", address: "",
    } : u.role === "employer" ? {
      companyName: u.companyName, companyDescription: "עסק לבדיקות QA בלבד",
    } : {name: u.name};
    await db.doc(`users/${uid}`).set({...base, ...extra}, {merge: true});
    console.log(`user ${u.role}: ${u.email} (${uid})`);
  }

  // Pending approvals (token = doc id) so the ?approve= link can be exercised.
  for (const u of USERS.filter((x) => x.role === "teen")) {
    const uid = uids[u.email];
    const ref = db.collection("parentalApprovals").doc();
    await ref.set({
      token: ref.id, teenUid: uid, teenName: u.name, teenEmail: u.email, ...PARENT,
      status: "pending", createdAt: now, isTestData: true,
    });
    console.log(`approval link for ${u.email}: https://teensworks.com/?approve=${ref.id}`);
  }

  const employerId = uids["qa-employer@teensworks.com"];
  const jobs = [
    {id: "qa-job-16", title: "[QA] מלצרות בקפה", minAge: 16, salary: 28, startTime: "09:00", endTime: "15:00", days: ["ראשון", "שני", "שלישי"], youthLawAck: true, status: "open"},
    {id: "qa-job-14", title: "[QA] עזרה בחנות (קיץ)", minAge: 14, salary: 26.5, startTime: "09:00", endTime: "14:00", days: ["ראשון", "רביעי"], youthLawAck: true, status: "open"},
    // Intentionally non-compliant legacy job (no minAge) to exercise the admin flags and the red rights panel.
    {id: "qa-job-bad", title: "[QA] משמרת ערב לא חוקית", salary: 20, startTime: "16:00", endTime: "23:00", days: ["חמישי", "שבת"]},
  ];
  for (const j of jobs) {
    const {id, ...data} = j;
    await db.doc(`jobs/${id}`).set({
      company: "[QA] עסק בדיקה", location: "תל אביב", type: "מלצרות", description: "משרת בדיקה. לא להגיש מועמדות אמיתית.",
      skills: [], experience: "ללא ניסיון", applicantsCount: 0, employerId, createdAt: now, isTestData: true, ...data,
    }, {merge: true});
    console.log(`job: ${id}`);
  }

  await db.doc("settings/app").set({
    minAgeRequirement: 14, maxAgeRequirement: 18, termsVersion: TERMS_VERSION,
    vacationActive: false, youthWageEffectiveDate: "2026-04-01", updatedAt: now,
  }, {merge: true});
  console.log("settings/app updated");
  console.log(`\nPassword for all QA accounts: ${PASSWORD}`);
}

async function cleanup() {
  for (const col of ["users", "jobs", "parentalApprovals", "applications", "notifications"]) {
    const flag = col === "users" ? "isTestAccount" : "isTestData";
    const snap = await db.collection(col).where(flag, "==", true).get();
    for (const d of snap.docs) {
      await d.ref.delete();
      console.log(`deleted ${col}/${d.id}`);
    }
  }
  for (const u of USERS) {
    try {
      const rec = await auth.getUserByEmail(u.email);
      await auth.deleteUser(rec.uid);
      console.log(`deleted auth ${u.email}`);
    } catch (e) {
      if (e.code !== "auth/user-not-found") throw e;
    }
  }
}

(process.argv.includes("--cleanup") ? cleanup() : seed())
  .then(() => process.exit(0))
  .catch((err) => { console.error(err); process.exit(1); });
