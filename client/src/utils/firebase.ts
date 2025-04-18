import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA3f4gJOKZDIjy9gnhSSpMVLs1UblGxo0s",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bismi-broilers-3ca96.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bismi-broilers-3ca96",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bismi-broilers-3ca96.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "949430744092",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:949430744092:web:4ea5638a9d38ba3e76dbd9",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://bismi-broilers-3ca96-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Authentication functions
export const loginWithEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const createUserWithEmail = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
  return signOut(auth);
};

export const onAuthStateChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth, firestore };
export default app;
