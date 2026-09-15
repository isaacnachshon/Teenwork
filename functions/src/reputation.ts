import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const getRelatedProfile = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Login required");
  const uid = request.auth.uid;
  const target = request.data?.userId;
  if (typeof target !== "string" || !target || target.includes("/")) throw new HttpsError("invalid-argument", "Invalid user");
  const db = admin.firestore();
  const me = (await db.doc(`users/${uid}`).get()).data();
  if (uid !== target && me?.role !== "admin") {
    const employer = me?.role === "employer";
    if (!employer && me?.role !== "teen") throw new HttpsError("permission-denied", "Invalid role");
    const relation = await db.collection("applications")
      .where(employer ? "employerId" : "applicantId", "==", uid)
      .where(employer ? "applicantId" : "employerId", "==", target).limit(1).get();
    if (relation.empty) throw new HttpsError("permission-denied", "No application relationship");
  }
  const data = (await db.doc(`users/${target}`).get()).data();
  if (!data) throw new HttpsError("not-found", "Profile missing");
  // Only professional fields. Never return identity, banking, parent or location coordinates.
  return {name: data.companyName || data.name || data.displayName || "", bio: data.companyDescription || data.bio || "", skills: data.skills || [], availability: data.availability || [], city: data.city || "", role: data.role};
});

export const submitRating = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Login required");
  const {applicationId, score} = request.data || {};
  if (typeof applicationId !== "string" || !applicationId || applicationId.includes("/") || !Number.isInteger(score) || score < 1 || score > 5) throw new HttpsError("invalid-argument", "Score must be 1 to 5");
  const uid = request.auth.uid;
  const db = admin.firestore();
  await db.runTransaction(async (tx) => {
    const app = (await tx.get(db.doc(`applications/${applicationId}`))).data();
    if (!app || app.status !== "completed" || ![app.employerId, app.applicantId].includes(uid) || app.employerId === app.applicantId) throw new HttpsError("permission-denied", "Completed employment required");
    const targetId = uid === app.employerId ? app.applicantId : app.employerId;
    const target = (await tx.get(db.doc(`users/${targetId}`))).data();
    if (!target) throw new HttpsError("not-found", "User missing");
    tx.set(db.doc(`ratings/${applicationId}_${uid}`), {applicationId, authorId: uid, targetId, targetRole: uid === app.employerId ? "teen" : "employer", targetName: target.companyName || target.name || "משתמש", score, updatedAt: admin.firestore.FieldValue.serverTimestamp()});
  });
  return {saved: true};
});

export const getRankings = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Login required");
  const rows = await admin.firestore().collection("ratings").get();
  const totals = new Map<string, {id:string;name:string;role:string;sum:number;count:number}>();
  rows.forEach((row) => {
    const d = row.data();
    const item = totals.get(d.targetId) || {id:d.targetId,name:d.targetName,role:d.targetRole,sum:0,count:0};
    item.sum += d.score; item.count++; totals.set(d.targetId,item);
  });
  return [...totals.values()].map(({sum,...r})=>({...r,average:sum/r.count})).sort((a,b)=>b.average-a.average || b.count-a.count || a.id.localeCompare(b.id));
});
