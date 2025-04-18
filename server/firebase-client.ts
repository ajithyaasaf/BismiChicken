// Import Firebase client SDK
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, push, update, remove, query, orderByChild, equalTo, DatabaseReference } from "firebase/database";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyA3f4gJOKZDIjy9gnhSSpMVLs1UblGxo0s",
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID || "bismi-broilers-3ca96"}.firebaseapp.com`,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || "https://bismi-broilers-3ca96-default-rtdb.firebaseio.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "bismi-broilers-3ca96",
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID || "bismi-broilers-3ca96"}.firebasestorage.app`,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "949430744092",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:949430744092:web:4ea5638a9d38ba3e76dbd9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);

// Initialize Auth
const auth = getAuth(app);

// Helper function to authenticate with Firebase
export async function authenticateToFirebase(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error authenticating to Firebase:", error);
    return null;
  }
}

// Utility function to handle Firebase snapshot conversion to objects
export function snapshotToArray<T>(snapshot: any): T[] {
  if (!snapshot.exists()) return [];
  
  const result: T[] = [];
  const val = snapshot.val();
  
  if (val === null) return [];
  
  // If it's an array-like object with numeric keys
  if (typeof val === 'object') {
    Object.keys(val).forEach((key) => {
      result.push({
        ...val[key],
        _key: key, // Store the Firebase key
      } as unknown as T);
    });
  }
  
  return result;
}

// Utility function to get reference path with user segments
export const getRefPath = (userId: number, collection: string) => 
  `users/${userId}/${collection}`;

// Export database and refs for use in storage implementation
export { database, ref, get, set, push, update, remove, query, orderByChild, equalTo };
export type { DatabaseReference };
export default app;