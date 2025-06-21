import type { Request, Response, NextFunction } from "express";
import { verifyFirebaseToken } from "./firebaseAdmin";
import { isAuthenticated } from "./replitAuth";

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
  // Check for Firebase authentication first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.split('Bearer ')[1];
    const { uid, email, error } = await verifyFirebaseToken(idToken);
    
    if (!error && uid) {
      req.user = {
        id: uid,
        email: email || undefined,
        authProvider: 'firebase',
      };
      return next();
    }
  }

  // Fallback to Replit authentication
  const replitAuth = isAuthenticated as any;
  replitAuth(req, res, (error?: any) => {
    if (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // If Replit auth succeeded, set user data
    if (req.user && (req as any).user.claims) {
      req.user = {
        id: (req as any).user.claims.sub,
        email: (req as any).user.claims.email,
        authProvider: 'replit',
        claims: (req as any).user.claims,
      };
    }
    next();
  });
};