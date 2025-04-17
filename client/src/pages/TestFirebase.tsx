import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import app from '../firebase';

export default function TestFirebase() {
  const [status, setStatus] = useState('Checking Firebase...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const auth = getAuth(app);
      
      const unsubscribe = onAuthStateChanged(auth, 
        (user) => {
          if (user) {
            setStatus(`Firebase is working! User: ${user.email}`);
          } else {
            setStatus('Firebase is working! No user is signed in.');
          }
        },
        (error) => {
          setError(`Firebase error: ${error.message}`);
        }
      );
      
      return () => unsubscribe();
    } catch (err: any) {
      setError(`Firebase initialization error: ${err.message}`);
    }
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Firebase Status</h1>
      <div className="p-4 border rounded mb-4">
        <p><strong>Status:</strong> {status}</p>
        {error && (
          <p className="text-red-500 mt-2"><strong>Error:</strong> {error}</p>
        )}
      </div>
      <div className="p-4 border rounded">
        <h2 className="text-xl font-bold mb-2">Environment Variables</h2>
        <p><strong>API Key available:</strong> {String(!!import.meta.env.VITE_FIREBASE_API_KEY)}</p>
        <p><strong>Project ID available:</strong> {String(!!import.meta.env.VITE_FIREBASE_PROJECT_ID)}</p>
        <p><strong>App ID available:</strong> {String(!!import.meta.env.VITE_FIREBASE_APP_ID)}</p>
      </div>
    </div>
  );
}