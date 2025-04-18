import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Check if Firebase env variables are available
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const databaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;

console.log('Firebase config check:');
console.log('API Key available:', !!apiKey);
console.log('Project ID available:', !!projectId);
console.log('App ID available:', !!appId);

// Firebase configuration with fallbacks
const firebaseConfig = {
  apiKey: apiKey || "AIzaSyA3f4gJOKZDIjy9gnhSSpMVLs1UblGxo0s",
  authDomain: `${projectId || "bismi-broilers-3ca96"}.firebaseapp.com`,
  databaseURL: databaseURL || "https://bismi-broilers-3ca96-default-rtdb.firebaseio.com",
  projectId: projectId || "bismi-broilers-3ca96",
  storageBucket: `${projectId || "bismi-broilers-3ca96"}.firebasestorage.app`,
  messagingSenderId: messagingSenderId || "949430744092",
  appId: appId || "1:949430744092:web:4ea5638a9d38ba3e76dbd9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Authentication functions
export const signInWithEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const createAccount = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signOut = () => {
  return firebaseSignOut(auth);
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth, db };
export default app;
