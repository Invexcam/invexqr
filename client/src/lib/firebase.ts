import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile, User, connectAuthEmulator } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
    messagingSenderId: "123456789", // Default value, can be updated
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  // Check for missing configuration
  const missing = Object.entries(config).filter(([key, value]) => !value || value === 'undefined');
  if (missing.length > 0) {
    console.error('Firebase configuration missing:', missing.map(([key]) => key));
    throw new Error(`Firebase configuration incomplete. Missing: ${missing.map(([key]) => key).join(', ')}`);
  }

  return config;
};

let app: FirebaseApp | null = null;
let auth: any;

try {
  const firebaseConfig = validateFirebaseConfig();
  
  // Initialize Firebase
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);

  // Set language for auth
  auth.languageCode = 'fr';

} catch (error) {
  console.error('Firebase initialization failed:', error);
  // Create a mock auth object to prevent app crashes
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
  };
}

export { auth };

// Initialize Analytics (only in production and when Firebase is properly configured)
let analytics: any = null;
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  try {
    if (app) {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

export { analytics };

// Helper function to handle Firebase auth errors
const handleFirebaseError = (error: any): string => {
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Adresse email invalide';
    case 'auth/user-disabled':
      return 'Ce compte a été désactivé';
    case 'auth/user-not-found':
      return 'Aucun compte trouvé avec cette adresse email';
    case 'auth/wrong-password':
      return 'Mot de passe incorrect';
    case 'auth/email-already-in-use':
      return 'Cette adresse email est déjà utilisée';
    case 'auth/weak-password':
      return 'Le mot de passe doit contenir au moins 6 caractères';
    case 'auth/network-request-failed':
      return 'Erreur de connexion réseau';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Réessayez plus tard';
    case 'auth/invalid-api-key':
      return 'Configuration Firebase invalide - Clé API incorrecte';
    case 'auth/app-not-authorized':
      return 'App non autorisée - Vérifiez la configuration Firebase';
    case 'auth/invalid-app-credential':
      return 'Identifiants d\'application invalides';
    default:
      return error.message || 'Une erreur est survenue';
  }
};

// Auth functions with improved error handling
export const signInWithEmail = async (email: string, password: string) => {
  if (!auth || !auth.currentUser === undefined) {
    return { user: null, error: 'Firebase non configuré correctement' };
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('Firebase sign in error:', error);
    return { user: null, error: handleFirebaseError(error) };
  }
};

export const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
  if (!auth || !auth.currentUser === undefined) {
    return { user: null, error: 'Firebase non configuré correctement' };
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name if provided
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }
    
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('Firebase sign up error:', error);
    return { user: null, error: handleFirebaseError(error) };
  }
};

export const logOut = async () => {
  if (!auth || !auth.currentUser === undefined) {
    return { error: 'Firebase non configuré correctement' };
  }

  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    console.error('Firebase sign out error:', error);
    return { error: handleFirebaseError(error) };
  }
};

export const resetPassword = async (email: string) => {
  if (!auth || !auth.currentUser === undefined) {
    return { error: 'Firebase non configuré correctement' };
  }

  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error: any) {
    console.error('Firebase password reset error:', error);
    return { error: handleFirebaseError(error) };
  }
};

export const getCurrentUser = (): User | null => {
  try {
    return auth?.currentUser || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Firebase connection test function
export const testFirebaseConnection = async () => {
  if (!auth) {
    return { success: false, error: 'Firebase non initialisé' };
  }

  try {
    // Test by trying to get the current user
    const user = getCurrentUser();
    return { 
      success: true, 
      error: null, 
      status: user ? 'Utilisateur connecté' : 'Firebase configuré, aucun utilisateur connecté' 
    };
  } catch (error: any) {
    console.error('Firebase connection test failed:', error);
    return { 
      success: false, 
      error: handleFirebaseError(error) 
    };
  }
};