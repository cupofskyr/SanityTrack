/**
 * seedFirestore.js
 * Seed Firestore emulator with example compliance rules and health reports.
 * Run with FIRESTORE_EMULATOR_HOST=127.0.0.1:18181 (or your emulator port).
 */

const admin = require("firebase-admin");

async function seedFirestore() {
  admin.initializeApp({
    projectId: "sanitytrack-20",
  });

  const db = admin.firestore();

  const complianceRules = {
    rule1: { name: "Sanitizer Check", enabled: true, threshold: 5 },
    rule2: { name: "Temperature Check", enabled: false, threshold: 8 },
  };

  const healthReports = {
    report1: { date: "2025-07-01", status: "ok", notes: "No issues" },
  };

  const complianceRulesCollection = db.collection("complianceRules");
  for (const [id, data] of Object.entries(complianceRules)) {
    await complianceRulesCollection.doc(id).set(data);
    console.log(`Seeded complianceRules/${id}`);
  }

  const healthReportsCollection = db.collection("healthReports");
  for (const [id, data] of Object.entries(healthReports)) {
    await healthReportsCollection.doc(id).set(data);
    console.log(`Seeded healthReports/${id}`);
  }

  console.log("Firestore seeding complete.");
  process.exit(0);
}

seedFirestore().catch((error) => {
  console.error("Error seeding Firestore:", error);
  process.exit(1);
});
