import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "workforce-ops-4686a.firebaseapp.com",
  projectId: "workforce-ops-4686a",
  storageBucket: "workforce-ops-4686a.firebasestorage.app",
  messagingSenderId: "34861664071",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;