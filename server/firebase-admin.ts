import admin from 'firebase-admin';

// Firebase configuration
const firebaseConfig = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "bismi-broilers-3ca96",
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || "https://bismi-broilers-3ca96-default-rtdb.firebaseio.com"
};

// Initialize Firebase Admin
let app;

try {
  // For development purposes, we'll initialize the admin SDK with just the required properties
  // In production, you would use a proper service account key file
  app = admin.initializeApp({
    projectId: firebaseConfig.projectId,
    databaseURL: firebaseConfig.databaseURL
  });
  
  console.log("Firebase Admin initialized successfully");
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error);
  throw error;
}

// Initialize Realtime Database
const database = admin.database();

// Initialize Auth
const auth = admin.auth();

export { database, auth };
export default app;