import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      // For development, we use the project ID for basic token verification
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

export const auth = admin.auth();
export const firestore = admin.firestore();

// Middleware to verify Firebase ID tokens
export async function verifyFirebaseToken(idToken: string) {
  try {
    // For development, we'll decode the token without verification
    // In production, you should use proper Firebase Admin SDK verification
    const tokenParts = idToken.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    
    // Basic validation
    if (!payload.sub || !payload.aud) {
      throw new Error('Invalid token payload');
    }
    
    return { 
      uid: payload.sub, 
      email: payload.email || null, 
      error: null 
    };
  } catch (error: any) {
    console.error('Token verification error:', error);
    return { uid: null, email: null, error: error?.message || 'Token verification failed' };
  }
}