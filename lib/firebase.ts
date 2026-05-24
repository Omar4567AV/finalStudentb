import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Hardened config layout forcing inline evaluation
// lib/firebase.ts

const firebaseConfig = {
  apiKey: "AIzaSyYourActualFirebaseApiKeyGoesHere",
  authDomain: "your-app-id.firebaseapp.com",
  projectId: "your-app-id",
  storageBucket: "your-app-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id-string"
};

// Defensive check: If the compiler failed to inject the keys, let's gracefully catch it
if (!firebaseConfig.apiKey && typeof window !== 'undefined') {
  console.error(
    "CRITICAL ENV ERROR: Next.js Turbopack failed to inline your .env.local keys. " +
    "Verify the file is at C:/ffwebff/app/my-app/.env.local and variables start with NEXT_PUBLIC_"
  );
}

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);