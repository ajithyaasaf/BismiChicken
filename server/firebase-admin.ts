import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';

// Initialize Firebase Admin with service account credentials
const serviceAccountPath = path.resolve(__dirname, 'firebase-service-account.json');
const app = initializeApp({
  credential: cert(serviceAccountPath),
  databaseURL: `https://${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseio.com`
});

// Initialize Firestore
const firestore = getFirestore(app);

export { firestore };
export default app;