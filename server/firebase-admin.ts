import admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase configuration
const firebaseConfig = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "bismi-broilers-3ca96",
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || "https://bismi-broilers-3ca96-default-rtdb.firebaseio.com"
};

// Check if we have service account credentials
const serviceAccountPath = path.resolve(__dirname, 'firebase-admin-key.json');
let serviceAccount;

if (fs.existsSync(serviceAccountPath)) {
  try {
    serviceAccount = require('./firebase-admin-key.json');
    console.log("Using Firebase Admin service account from file");
  } catch (error) {
    console.warn("Failed to load service account file:", error);
  }
}

// Initialize Firebase Admin
let app;

try {
  const adminConfig: admin.AppOptions = {
    projectId: firebaseConfig.projectId,
    databaseURL: firebaseConfig.databaseURL
  };

  // Add credential if available
  if (serviceAccount) {
    adminConfig.credential = admin.credential.cert(serviceAccount as admin.ServiceAccount);
  } else {
    console.log("Using default application credentials");
    adminConfig.credential = admin.credential.applicationDefault();
  }

  app = admin.initializeApp(adminConfig);
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