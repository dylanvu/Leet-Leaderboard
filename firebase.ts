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
const db = getFirestore();
export const collection = db.collection("leet_leaderboard");

// a poor man's ORM
export interface IUser {
  display_name: string; // discord display name
  points: number; // points a user has acquired
  username: string; // discord username
}
