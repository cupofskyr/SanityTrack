
// =================================================================
// PART 1 & 2: BACKEND & SYSTEM GLUE
// =================================================================
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// --- Helper Functions ---
async function getUserAuthInfo(uid) {
  if (!uid) return null;
  const userDoc = await db.collection("users").doc(uid).get();
  if (!userDoc.exists) return null;
  const { role, locationId } = userDoc.data();
  return { role, locationId };
}

async function createTransaction(logData) {
  await db.collection("perksTransactions").add({
    ...logData,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
}

// --- CRASH-PREVENTION "GLUE": Auth Trigger to Seed New User Data ---
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName } = user;

  const batch = db.batch();

  // Create the user document for roles and permissions
  const userDocRef = db.collection("users").doc(uid);
  batch.set(userDocRef, {
    name: displayName || "New User",
    email: email,
    role: "employee", // Default role
    locationId: "default-loc", // Default location
  });

  // Create the employee document with default perks
  const employeeDocRef = db.collection("employees").doc(uid);
  batch.set(employeeDocRef, {
    name: displayName || "New User",
    email: email,
    role: "employee",
    locationId: "default-loc",
    membershipCard: {
      cardId: `card-${uid.slice(0, 8)}`,
      creditBalance: 0,
      status: "active",
      walletEnabled: false,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    },
  });

  await batch.commit();
  console.log(`Successfully created user and employee profiles for UID: ${uid}`);
  return null;
});


// --- Callable Cloud Functions ---
exports.adjustBalance = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError('unauthenticated', 'User not authenticated.');
  const { employeeId, amount, reason } = data;
  if (!employeeId || typeof amount !== 'number' || !reason) throw new functions.https.HttpsError('invalid-argument', 'Missing or invalid parameters.');

  const adminInfo = await getUserAuthInfo(uid);
  if (!adminInfo || adminInfo.role === "employee") throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions.');

  const empDocRef = db.collection("employees").doc(employeeId);
  const empDoc = await empDocRef.get();
  if (!empDoc.exists) throw new functions.https.HttpsError('not-found', 'Employee not found.');

  const empData = empDoc.data();
  if (adminInfo.role === "manager" && adminInfo.locationId !== empData.locationId) throw new functions.https.HttpsError('permission-denied', 'Managers can only act within their location.');

  const currentBalance = empData.membershipCard?.creditBalance || 0;
  const newBalance = currentBalance + amount;
  if (newBalance < 0) throw new functions.https.HttpsError('failed-precondition', 'Balance cannot go below zero.');

  await empDocRef.update({ "membershipCard.creditBalance": newBalance, "membershipCard.lastUpdated": admin.firestore.FieldValue.serverTimestamp() });
  await createTransaction({ employeeId, performedBy: uid, type: amount > 0 ? 'credit_add' : 'credit_spend', amount: Math.abs(amount), notes: reason });
  return { newBalance };
});

exports.changeCardStatus = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError('unauthenticated', 'User not authenticated.');
  const { employeeId, newStatus } = data;
  const validStatuses = ['active', 'suspended', 'revoked'];
  if (!employeeId || !validStatuses.includes(newStatus)) throw new functions.https.HttpsError('invalid-argument', 'Invalid parameters.');

  const adminInfo = await getUserAuthInfo(uid);
  if (!adminInfo || adminInfo.role === "employee") throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions.');
  
  const empDoc = await db.collection("employees").doc(employeeId).get();
  if (!empDoc.exists) throw new functions.https.HttpsError('not-found', 'Employee not found.');

  const empData = empDoc.data();
  if (adminInfo.role === "manager" && adminInfo.locationId !== empData.locationId) throw new functions.https.HttpsError('permission-denied', 'Managers can only act within their location.');
  
  await db.collection("employees").doc(employeeId).update({ "membershipCard.status": newStatus, "membershipCard.lastUpdated": admin.firestore.FieldValue.serverTimestamp() });
  await createTransaction({ employeeId, performedBy: uid, type: 'status_change', notes: `Status changed to ${newStatus}` });
  return { newStatus };
});

exports.toggleWalletEnabled = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError('unauthenticated', 'User not authenticated.');
  const { employeeId, enableWallet } = data;
  if (!employeeId || typeof enableWallet !== 'boolean') throw new functions.https.HttpsError('invalid-argument', 'Missing or invalid parameters.');

  const adminInfo = await getUserAuthInfo(uid);
  if (!adminInfo || adminInfo.role === "employee") throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions.');

  const empDoc = await db.collection("employees").doc(employeeId).get();
  if (!empDoc.exists) throw new functions.https.HttpsError('not-found', 'Employee not found.');

  const empData = empDoc.data();
  if (adminInfo.role === "manager" && adminInfo.locationId !== empData.locationId) throw new functions.https.HttpsError('permission-denied', 'Managers can only act within their location.');

  await db.collection("employees").doc(employeeId).update({ "membershipCard.walletEnabled": enableWallet, "membershipCard.lastUpdated": admin.firestore.FieldValue.serverTimestamp() });
  await createTransaction({ employeeId, performedBy: uid, type: 'wallet_toggle', notes: `Wallet ${enableWallet ? 'enabled' : 'disabled'}` });
  return { walletEnabled: enableWallet };
});
