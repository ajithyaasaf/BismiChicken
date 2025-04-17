// For testing in browser
console.log("Testing environment variables in browser:");
console.log("API Key available:", !!import.meta.env.VITE_FIREBASE_API_KEY);
console.log("Project ID available:", !!import.meta.env.VITE_FIREBASE_PROJECT_ID);
console.log("App ID available:", !!import.meta.env.VITE_FIREBASE_APP_ID);