// setAdminClaim.js
const admin = require("firebase-admin");

// 1) Import your service account key. 
// Make sure the path here matches where you've stored it.
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// 2) Initialize the Firebase Admin SDK using the service account.
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 3) The function to set the "admin" custom claim
async function setAdmin(uid) {
  try {
    // Here we set the 'admin' claim to true for the user with the given UID.
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`Admin claim set for user: ${uid}`);
  } catch (error) {
    console.error("Error setting admin claim:", error);
  }
}

// Replace this with the UID of the user you want to grant admin privileges to.
// You can find the UID in your Firebase Console under "Authentication" > "Users".
const UID_OF_YOUR_ACCOUNT = "flFXBD3uWfW9tZqNbxzNUqMMjZZ2";

// Run the function.
setAdmin(UID_OF_YOUR_ACCOUNT);
