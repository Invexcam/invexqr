import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    // In production, you would use a service account key
    // For development, we'll use the application default credentials
  });
}

export const auth = admin.auth();
export const firestore = admin.firestore();

// Middleware to verify Firebase ID tokens
export async function verifyFirebaseToken(idToken: string) {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return { uid: decodedToken.uid, email: decodedToken.email, error: null };
  } catch (error: any) {
    return { uid: null, email: null, error: error?.message || 'Unknown error' };
  }
}