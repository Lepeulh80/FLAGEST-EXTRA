import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration will be loaded once available. 
// For now, we use a placeholder or check environment variables.
const firebaseConfig = {
  apiKey: "placeholder",
  authDomain: "placeholder.firebaseapp.com",
  projectId: "placeholder",
  storageBucket: "placeholder.appspot.com",
  messagingSenderId: "placeholder",
  appId: "placeholder"
};

// Lazy initialization to prevent crash if config is missing
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
