import {setGlobalOptions} from "firebase-functions";
import {onDocumentCreated, onDocumentUpdated, onDocumentWritten} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import {sendMail, emailShell, escapeHtml, appUrl} from "./mail";
import {buildApplicationStamp, buildParentApplicationEmail} from "./applications";
import {computeAgeFields, ageFieldsDiff} from "./users";

admin.initializeApp();
export {getRelatedProfile, submitRating, getRankings} from "./reputation";
export {aiGenerate} from "./ai";

setGlobalOptions({maxInstances: 10});

/** Email the parent an approval link. Also marks the teen as pending (clients may not write that key). */
export const onParentalApprovalCreated = onDocumentCreated(
  "parentalApprovals/{tokenId}",
  async (event) => {
    const data = event.data?.data();
    if (!data) return;
    const {parentEmail, teenName, teenUid, token} = data;

    if (typeof teenUid === "string" && teenUid) {
      const teenRef = admin.firestore().doc(`users/${teenUid}`);
      const teen = (await teenRef.get()).data();
      if (teen && teen.parentalConsentStatus !== "approved" && teen.parentalConsentStatus !== "pending") {
        await teenRef.set({parentalConsentStatus: "pending"}, {merge: true});
      }
    }

    const approvalLink = `${appUrl.value()}?approve=${token}`;
    const body = `
      <h2 style="color: #1f2937;">שלום,</h2>
      <p style="color: #4b5563; line-height: 1.8;">
        <strong>${escapeHtml(teenName)}</strong> נרשם/ה לפלטפורמת TeenWork —
        פלטפורמת עבודה לנוער בישראל, ודרוש/ה אישורך כהורה/אפוטרופוס.
      </p>
      <p style="color: #4b5563;">
        האישור הוא לחשבון (חד-פעמי). לאחר האישור תקבל/י עדכון על כל מועמדות שהנער/ה מגיש/ה.
        לחץ/י על הכפתור הבא כדי לאמת את זהותך בטלפון ולאשר או לדחות את ההרשמה:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${escapeHtml(approvalLink)}"
          style="background: #7C3AED; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
          אישור / דחיית הרשמה
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 12px;">
        אם הכפתור לא עובד, העתק/י את הקישור הבא לדפדפן:<br>
        <a href="${escapeHtml(approvalLink)}" style="color: #7C3AED;">${escapeHtml(approvalLink)}</a>
      </p>
      <p style="color: #9ca3af; font-size: 12px;">אם לא ביקשת אישור זה, ניתן להתעלם מהודעה זו.</p>`;

    const sent = await sendMail({
      to: parentEmail,
      subject: "אישור הורים — TeenWork",
      html: emailShell("TeenWork", "אישור הורים", body),
    });
    if (sent) console.log(`Approval email sent to ${parentEmail} for teen ${teenName}`);
  }
);

/**
 * Mirrors the parent's decision onto the teen's user document and notifies the teen.
 * The parent is authenticated only by phone (no users/ doc), so the client cannot write users/{teenUid}.
 */
export const onParentalApprovalDecided = onDocumentUpdated(
  "parentalApprovals/{tokenId}",
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;
    if (before.status !== "pending") return;
    if (after.status !== "approved" && after.status !== "rejected") return;
    if (typeof after.teenUid !== "string" || !after.teenUid) return;

    const db = admin.firestore();
    await db.doc(`users/${after.teenUid}`).set({
      parentalConsentStatus: after.status,
      parentalConsentReviewedAt: new Date().toISOString(),
    }, {merge: true});

    await db.collection("notifications").add({
      userId: after.teenUid,
      type: "system",
      title: after.status === "approved" ? "ההורה אישר את החשבון" : "ההורה דחה את בקשת האישור",
      content: after.status === "approved" ?
        "אפשר להתחיל לחפש עבודה ולהגיש מועמדות." :
        "ניתן לבקש אישור מחדש מהמסך הראשי.",
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
);

/** Keeps derived age fields (age, youthBand, ageVerified) in sync with birthDate. Idempotent. */
export const onUserWritten = onDocumentWritten("users/{uid}", async (event) => {
  const after = event.data?.after;
  if (!after?.exists) return;
  const data = after.data() || {};
  if (data.role !== "teen") return;
  const diff = ageFieldsDiff(data, computeAgeFields(data, new Date()));
  if (Object.keys(diff).length === 0) return;
  await after.ref.set(diff, {merge: true});
});

/** Stamps youth-compliance facts onto a new application and notifies the parent (email) and the teen. */
export const onApplicationCreated = onDocumentCreated("applications/{appId}", async (event) => {
  const snap = event.data;
  if (!snap) return;
  const app = snap.data();
  const db = admin.firestore();
  const [teenSnap, jobSnap] = await Promise.all([
    typeof app.applicantId === "string" ? db.doc(`users/${app.applicantId}`).get() : Promise.resolve(null),
    typeof app.jobId === "string" ? db.doc(`jobs/${app.jobId}`).get() : Promise.resolve(null),
  ]);
  const teen = teenSnap?.data() || {};
  const job = jobSnap?.data() || {};
  const now = new Date();

  const stamp = buildApplicationStamp(teen, job, now);
  let parentNotifiedAt: admin.firestore.FieldValue | null = null;
  if (teen.parentEmail) {
    const mail = buildParentApplicationEmail(teen, job, appUrl.value(), now);
    const sent = await sendMail({to: teen.parentEmail, subject: mail.subject, html: mail.html});
    if (sent) parentNotifiedAt = admin.firestore.FieldValue.serverTimestamp();
  }
  await snap.ref.set({...stamp, parentNotifiedAt}, {merge: true});

  if (typeof app.applicantId === "string" && app.applicantId) {
    await db.collection("notifications").add({
      userId: app.applicantId,
      type: "application",
      title: "המועמדות נשלחה",
      content: parentNotifiedAt ?
        `ההורה עודכן במייל על המועמדות ל${job.title || "משרה"}.` :
        `המועמדות ל${job.title || "משרה"} נשלחה. מומלץ לעדכן את ההורה.`,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
});
