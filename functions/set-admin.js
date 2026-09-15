const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

async function setAdmin() {
  const email = "isaacnachshon@gmail.com";

  try {
    const userRecord = await auth.getUserByEmail(email);
    const uid = userRecord.uid;

    const userDoc = await db.collection("users").doc(uid).get();

    if (userDoc.exists) {
      await db.collection("users").doc(uid).update({ role: "admin" });
      console.log(`Updated existing doc for ${email} (uid: ${uid}) — role set to 'admin'.`);
    } else {
      await db.collection("users").doc(uid).set({
        uid,
        email,
        role: "admin",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`Created new doc for ${email} (uid: ${uid}) with role 'admin'.`);
    }

    console.log("Done! You can now log in as admin.");
  } catch (err) {
    console.error("Error:", err.message);
  }

  process.exit(0);
}

setAdmin();
