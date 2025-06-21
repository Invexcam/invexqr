import { useQuery } from "@tanstack/react-query";
import { useFirebaseAuth } from "./useFirebaseAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";

export function useAuth() {
  const { user: firebaseUser, loading: firebaseLoading } = useFirebaseAuth();
  const { toast } = useToast();
  const hasShownWelcome = useRef(false);
  
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
  const isAuthenticated = !!user;

  // Show welcome message on authentication
  useEffect(() => {
    if (isAuthenticated && user && !hasShownWelcome.current) {
      hasShownWelcome.current = true;
      
      const firstName = user.firstName || user.email?.split('@')[0] || 'Utilisateur';
      
      toast({
        title: "Bienvenue sur InvexQR !",
        description: `Bonjour ${firstName}, vous êtes maintenant connecté(e) à votre dashboard.`,
        duration: 5000,
      });
    }
    
    // Reset welcome flag when user logs out
    if (!isAuthenticated) {
      hasShownWelcome.current = false;
    }
  }, [isAuthenticated, user, toast]);

  return {
    user,
    isLoading,
    isAuthenticated,
    authProvider: firebaseUser ? 'firebase' : 'replit',
  };
}
