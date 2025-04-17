import admin from 'firebase-admin';

// Firebase configuration
const firebaseConfig = {
  projectId: "bismi-broilers-3ca96",
  databaseURL: "https://bismi-broilers-3ca96-default-rtdb.firebaseio.com"
};

// Initialize Firebase Admin
let app;

try {
  app = admin.initializeApp({
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