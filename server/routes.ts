import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { authenticateUser, type AuthenticatedRequest } from "./authMiddleware";
import { insertQRCodeSchema, insertQRScanSchema } from "@shared/schema";
import { z } from "zod";

function getDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
    return 'mobile';
  } else if (/tablet|ipad/i.test(ua)) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

function getLocationFromIP(ip: string): { country: string; city: string } {
  // In a real implementation, you would use a service like MaxMind GeoIP2 or IP-API
  // For now, we'll return placeholder values
  return {
    country: 'Unknown',
    city: 'Unknown'
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', authenticateUser as any, async (req: any, res) => {
    try {
      const userId = req.user.id;
      let user = await storage.getUser(userId);
      
      // If Firebase user doesn't exist in database, create them
      if (!user && req.user.authProvider === 'firebase') {
        user = await storage.upsertUser({
          id: userId,
          email: req.user.email || null,
          firstName: null,
          lastName: null,
          profileImageUrl: null,
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // QR Code routes
  app.get('/api/qr-codes', authenticateUser as any, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const qrCodes = await storage.getUserQRCodes(userId);
      
      // Add scan counts to each QR code
      const qrCodesWithStats = await Promise.all(
        qrCodes.map(async (qr) => {
          const scanCount = await storage.getQRCodeScanCount(qr.id);
          return { ...qr, scanCount };
        })
      );
      
      res.json(qrCodesWithStats);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
      res.status(500).json({ message: "Failed to fetch QR codes" });
    }
  });

  app.post('/api/qr-codes', authenticateUser as any, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Enhanced QR code data with new fields
      const qrData = {
        name: req.body.name,
        originalUrl: req.body.originalUrl,
        type: req.body.type || 'dynamic',
        contentType: req.body.contentType || 'url',
        content: req.body.content || {},
        style: req.body.style || {},
        customization: req.body.customization || {},
        description: req.body.description,
      };
      
      const qrCode = await storage.createQRCode(userId, qrData);
      res.status(201).json(qrCode);
    } catch (error) {
      console.error("Error creating QR code:", error);
      res.status(500).json({ message: "Failed to create QR code" });
    }
  });

  app.put('/api/qr-codes/:id', authenticateUser as any, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if QR code belongs to user
      const existingQR = await storage.getQRCode(id);
      if (!existingQR || existingQR.userId !== userId) {
        return res.status(404).json({ message: "QR code not found" });
      }
      
      const updateData = insertQRCodeSchema.partial().parse(req.body);
      const updatedQR = await storage.updateQRCode(id, updateData);
      
      res.json(updatedQR);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error updating QR code:", error);
        res.status(500).json({ message: "Failed to update QR code" });
      }
    }
  });

  app.delete('/api/qr-codes/:id', authenticateUser as any, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if QR code belongs to user
      const existingQR = await storage.getQRCode(id);
      if (!existingQR || existingQR.userId !== userId) {
        return res.status(404).json({ message: "QR code not found" });
      }
      
      const deleted = await storage.deleteQRCode(id);
      if (deleted) {
        res.json({ message: "QR code deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete QR code" });
      }
    } catch (error) {
      console.error("Error deleting QR code:", error);
      res.status(500).json({ message: "Failed to delete QR code" });
    }
  });

  // QR Code redirect and tracking
  app.get('/qr/:shortCode', async (req, res) => {
    try {
      const { shortCode } = req.params;
      const qrCode = await storage.getQRCodeByShortCode(shortCode);
      
      if (!qrCode || !qrCode.isActive) {
        return res.status(404).send('QR code not found');
      }
      
      // Record the scan
      const userAgent = req.headers['user-agent'] || '';
      const ip = req.ip || req.connection.remoteAddress || '';
      const deviceType = getDeviceType(userAgent);
      const location = getLocationFromIP(ip);
      
      await storage.recordScan({
        qrCodeId: qrCode.id,
        userAgent,
        ipAddress: ip,
        country: location.country,
        city: location.city,
        deviceType,
      });
      
      // Redirect to the original URL
      res.redirect(qrCode.originalUrl);
    } catch (error) {
      console.error("Error processing QR redirect:", error);
      res.status(500).send('Internal server error');
    }
  });

  // Analytics routes
  app.get('/api/analytics/overview', authenticateUser as any, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const analytics = await storage.getUserAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/analytics/top-performing', authenticateUser as any, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 5;
      const topQRCodes = await storage.getTopPerformingQRCodes(userId, limit);
      res.json(topQRCodes);
    } catch (error) {
      console.error("Error fetching top performing QR codes:", error);
      res.status(500).json({ message: "Failed to fetch top performing QR codes" });
    }
  });

  app.get('/api/analytics/device-breakdown', authenticateUser as any, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const breakdown = await storage.getDeviceBreakdown(userId);
      res.json(breakdown);
    } catch (error) {
      console.error("Error fetching device breakdown:", error);
      res.status(500).json({ message: "Failed to fetch device breakdown" });
    }
  });

  app.get('/api/analytics/location-breakdown', authenticateUser as any, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const breakdown = await storage.getLocationBreakdown(userId);
      res.json(breakdown);
    } catch (error) {
      console.error("Error fetching location breakdown:", error);
      res.status(500).json({ message: "Failed to fetch location breakdown" });
    }
  });

  app.get('/api/qr-codes/:id/scans', authenticateUser as any, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if QR code belongs to user
      const qrCode = await storage.getQRCode(id);
      if (!qrCode || qrCode.userId !== userId) {
        return res.status(404).json({ message: "QR code not found" });
      }
      
      const scans = await storage.getQRCodeScans(id);
      res.json(scans);
    } catch (error) {
      console.error("Error fetching QR code scans:", error);
      res.status(500).json({ message: "Failed to fetch QR code scans" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
