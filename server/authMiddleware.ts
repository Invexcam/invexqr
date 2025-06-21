import type { Request, Response, NextFunction } from "express";
import { verifyFirebaseToken } from "./firebaseAdmin";
import { isAuthenticated } from "./replitAuth";
import { storage } from "./storage";

// Extended request interface to include user data
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email?: string;
    authProvider: 'firebase' | 'replit';
    claims?: any;
  };
}

// Middleware that supports both Firebase and Replit authentication
export const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Check for Firebase authentication first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      
      try {
        const { uid, email, error } = await verifyFirebaseToken(idToken);
        
        if (!error && uid) {
          // Ensure user exists in database
          let user = await storage.getUser(uid);
          if (!user) {
            user = await storage.upsertUser({
              id: uid,
              email: email || undefined,
              firstName: null,
              lastName: null,
              profileImageUrl: null,
            });
          }
          
          req.user = {
            id: uid,
            email: email || undefined,
            authProvider: 'firebase',
          };
          return next();
        }
      } catch (firebaseError) {
        console.error('Firebase token verification failed:', firebaseError);
        // Continue to try Replit auth
      }
    }

    // Fallback to Replit authentication
    const replitAuth = isAuthenticated as any;
    replitAuth(req, res, async (error?: any) => {
      if (error) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // If Replit auth succeeded, set user data
      const replitUser = (req as any).user;
      if (replitUser && replitUser.claims) {
        // Ensure user exists in database
        let user = await storage.getUser(replitUser.claims.sub);
        if (!user) {
          user = await storage.upsertUser({
            id: replitUser.claims.sub,
            email: replitUser.claims.email,
            firstName: replitUser.claims.first_name,
            lastName: replitUser.claims.last_name,
            profileImageUrl: replitUser.claims.profile_image_url,
          });
        }
        
        req.user = {
          id: replitUser.claims.sub,
          email: replitUser.claims.email,
          authProvider: 'replit',
          claims: replitUser.claims,
        };
        return next();
      }
      
      return res.status(401).json({ message: "Unauthorized" });
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};