import { useQuery } from "@tanstack/react-query";
import { useFirebaseAuth } from "./useFirebaseAuth";

export function useAuth() {
  const { user: firebaseUser, loading: firebaseLoading } = useFirebaseAuth();
  
  const { data: replitUser, isLoading: replitLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !firebaseUser && !firebaseLoading, // Only check Replit auth if not Firebase authenticated
  });

  // Prioritize Firebase auth, fallback to Replit auth
  const user = firebaseUser ? {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    firstName: firebaseUser.displayName?.split(' ')[0] || null,
    lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || null,
    profileImageUrl: firebaseUser.photoURL,
    authProvider: 'firebase'
  } : replitUser;

  const isLoading = firebaseLoading || (replitLoading && !firebaseUser);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    authProvider: firebaseUser ? 'firebase' : 'replit',
  };
}
