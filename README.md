# Bismi Chicken Business Management App

A comprehensive management system for chicken business operations, tracking vendors, purchases, sales, and more.

## Firebase Setup

This application uses Firebase for authentication and Firestore for data storage. To set up Firebase:

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com/)
2. Enable Firebase Authentication and Firestore Database
3. Create a web app in your Firebase project to get client credentials
4. Create a service account for server-side operations

### Client-side Firebase Setup

Add the following environment variables for client-side Firebase:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Server-side Firebase Admin Setup

For server-side Firebase Admin integration, use environment variables instead of storing the service account file:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="your-private-key"
```

**IMPORTANT:** Never commit your service account key file to version control!

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Set up the required environment variables as described above

3. Start the development server:
   ```
   npm run dev
   ```

## Features

- User authentication
- Vendor management
- Product management
- Purchase tracking
- Sales recording (retail and hotel)
- Daily and date range reports
- Inventory management