// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app"; // <-- Fixed here (app, not apps)
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDB_H7ZQLNDi47JHOiblFIeOFRH7HdCRAg",
  authDomain: "webfinal-e849a.firebaseapp.com",
  projectId: "webfinal-e849a",
  storageBucket: "webfinal-e849a.firebasestorage.app",
  messagingSenderId: "163842530285",
  appId: "1:163842530285:web:07b62199db0e6881f965e4",
  measurementId: "G-67J38G3LV2"
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);