// lib/admin.ts
import admin from "firebase-admin";

// Parse the service account credentials from the environment variable
const serviceAccountString = process.env.FIREBASE_ADMIN_CREDENTIALS || "{}";
let serviceAccount;

try {
  serviceAccount = JSON.parse(serviceAccountString);
} catch (error) {
  console.error("Failed to parse FIREBASE_ADMIN_CREDENTIALS:", error);
  throw new Error("Invalid FIREBASE_ADMIN_CREDENTIALS JSON.");
}

// Verify that "project_id" exists
if (!serviceAccount.project_id) {
  console.error('Service account JSON is missing the "project_id" property.');
  throw new Error('Service account JSON is missing the "project_id" property.');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export { admin };
