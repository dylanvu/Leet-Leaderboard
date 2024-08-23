import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { ServiceAccount } from "firebase-admin";

// create the firebase application using the service account
const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountEnv) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set.");
}
const serviceAccount = JSON.parse(serviceAccountEnv);
initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});

// create the firestore database access in the application
export const db = getFirestore();
