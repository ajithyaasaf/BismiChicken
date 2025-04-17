import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Use environment variables for service account credentials
const projectId = process.env.FIREBASE_PROJECT_ID || "bismi-broilers-3ca96";
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-uj6n4@bismi-broilers-3ca96.iam.gserviceaccount.com";

// Initialize Firebase Admin with application default credentials
// This works in development mode
let app;

try {
  // Initialize Firebase Admin with default credentials
  app = initializeApp({
    projectId
  });
  console.log("Firebase Admin initialized with default credentials");
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error);
  
  // Fallback to minimal initialization
  app = initializeApp({ projectId });
  console.log("WARNING: Firebase Admin initialized in fallback mode");
}

// Initialize Firestore
const firestore = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

export { firestore, auth };
export default app;