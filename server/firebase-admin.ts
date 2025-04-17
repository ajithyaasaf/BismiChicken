import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin using environment variables or default development settings
const projectId = process.env.FIREBASE_PROJECT_ID || "bismi-broilers-3ca96";
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-uj6n4@bismi-broilers-3ca96.iam.gserviceaccount.com";

// For security, we're not using the actual private key directly in the code
// In production, this should be set as an environment variable
// For development, we're using a simple initialization without authentication
let app;

try {
  if (process.env.FIREBASE_PRIVATE_KEY) {
    // Use environment variables if available (production)
    app = initializeApp({
      projectId,
      credential: cert({
        projectId,
        clientEmail,
        // Replace escape sequences \\n with actual newlines
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    console.log("Firebase Admin initialized with credentials");
  } else {
    // Initialize without authentication for development
    app = initializeApp({
      projectId
    });
    console.log("Firebase Admin initialized without credentials (dev mode)");
  }
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error);
  app = initializeApp({ projectId });
}

// Initialize Firestore
const firestore = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

export { firestore, auth };
export default app;