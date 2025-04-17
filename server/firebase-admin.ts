import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin with service account credentials
const app = initializeApp({
  projectId: "bismi-broilers-3ca96",
  // We'll use environment variables for production but hardcode for development
  credential: cert({
    projectId: "bismi-broilers-3ca96",
    clientEmail: "firebase-adminsdk-uj6n4@bismi-broilers-3ca96.iam.gserviceaccount.com",
    // Use a placeholder private key for development - this won't actually authenticate
    // but will allow the app to start for testing the client-side Firebase config
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC+GGqVdIW8\n-----END PRIVATE KEY-----\n"
  })
});

// Initialize Firestore
const firestore = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

export { firestore, auth };
export default app;