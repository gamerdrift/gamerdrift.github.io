import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const isConfigValid = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'your_api_key_here' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'your_project_id' &&
  !firebaseConfig.projectId.includes('your_project_id');

let app;
let authInstance: any = null;
let dbInstance: any = null;
let mockActive = true;

if (isConfigValid) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    mockActive = false;
    console.log("🛰️ Firebase successfully initialized.");
  } catch (e) {
    console.warn("⚠️ Firebase initialization failed, falling back to local simulation:", e);
  }
} else {
  console.log("🛰️ Firebase environment variables not configured. Running in Sandbox Mode.");
}

export const auth = authInstance;
export const db = dbInstance;
export const isFirebaseMock = mockActive;
export default app;
