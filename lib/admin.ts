// lib/admin.ts
import admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// Load local environment variables if not in production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

if (!admin.apps.length) {
  try {
    if (process.env.NODE_ENV !== 'production') {
      // For local development, initialize with service account credentials
      if (
        !process.env.FIREBASE_PROJECT_ID ||
        !process.env.FIREBASE_CLIENT_EMAIL ||
        !process.env.FIREBASE_PRIVATE_KEY
      ) {
        throw new Error('Missing Firebase service account environment variables.');
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        // databaseURL: 'https://your-project-id.firebaseio.com', // Uncomment if needed
      });

      console.log('Firebase Admin initialized with service account for local development.');
    } else {
      // In production, initialize with default credentials
      admin.initializeApp();
      console.log('Firebase Admin initialized with default credentials for production.');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    throw error;
  }
} else {
  console.log('Firebase Admin already initialized.');
}

export { admin };
