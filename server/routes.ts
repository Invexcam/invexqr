import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { emailService } from "./emailService";
import { authenticateUser, type AuthenticatedRequest } from "./authMiddleware";
import { insertQRCodeSchema, insertQRScanSchema } from "@shared/schema";
import { z } from "zod";
import axios from "axios";

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

async function getLocationFromIP(ip: string): Promise<{ country: string; city: string }> {
  try {
    // Skip geolocation for localhost/development IPs
    if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.0.")) {
      return { country: "Local", city: "Development" };
    }

    // Use ipapi.co for geolocation (free tier: 1000 requests/day)
    const response = await axios.get(`https://ipapi.co/${ip}/json/`, {
      timeout: 3000,
      headers: {
        'User-Agent': 'InvexQR/1.0'
      }
    });

    return {
      country: response.data.country_name || "Unknown",
      city: response.data.city || "Unknown"
    };
  } catch (error) {
    console.error("Geolocation error:", error);
    return { country: "Unknown", city: "Unknown" };
  }
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

  // Public QR code creation for visitors
  app.post('/api/public/qr-codes', async (req, res) => {
    try {
      const generateOriginalUrl = (contentType: string, content: any, shortCode: string) => {
        if (contentType === 'url' && content.url) {
          return content.url;
        }
        // For non-URL content types, create a redirect URL through our tracking system
        return `${req.protocol}://${req.get('host')}/r/${shortCode}`;
      };

      // Generate short code first
      const shortCode = Math.random().toString(36).substring(2, 8);
      
      const qrData = {
        name: req.body.name,
        originalUrl: req.body.originalUrl || generateOriginalUrl(req.body.contentType, req.body.content, shortCode),
        type: req.body.type || 'static',
        contentType: req.body.contentType || 'url',
        content: req.body.content || {},
        style: req.body.style || {},
        customization: req.body.customization || {},
        description: req.body.description,
        shortCode: shortCode,
      };
      
      const qrCode = await storage.createQRCode('anonymous', qrData);
      res.status(201).json(qrCode);
    } catch (error) {
      console.error("Error creating public QR code:", error);
      res.status(500).json({ message: "Failed to create QR code" });
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
      
      // Generate short code first for authenticated users
      const shortCode = Math.random().toString(36).substring(2, 8);
      
      const generateOriginalUrl = (contentType: string, content: any, shortCode: string) => {
        if (contentType === 'url' && content.url) {
          return content.url;
        }
        // For non-URL types, create a redirect URL through our tracking system
        return `${req.protocol}://${req.get('host')}/r/${shortCode}`;
      };

      const qrData = {
        name: req.body.name,
        originalUrl: req.body.originalUrl || generateOriginalUrl(req.body.contentType, req.body.content, shortCode),
        type: req.body.type || 'dynamic',
        contentType: req.body.contentType || 'url',
        content: req.body.content || {},
        style: req.body.style || {},
        customization: req.body.customization || {},
        description: req.body.description,
        shortCode: shortCode,
      };
      
      const qrCode = await storage.createQRCode(userId, qrData);
      
      // Send email notification for QR code creation
      try {
        const user = await storage.getUser(userId);
        if (user && user.email) {
          const userName = user.firstName || user.email.split('@')[0];
          await emailService.sendQRCodeCreatedEmail(
            user.email, 
            userName, 
            qrData.name, 
            qrData.originalUrl
          );
          
          // Also send general action notification
          await emailService.sendActionNotificationEmail(
            user.email,
            userName,
            "Création de QR Code",
            `QR Code "${qrData.name}" créé avec succès`
          );
        }
      } catch (emailError) {
        console.error("Failed to send QR code creation email:", emailError);
        // Don't fail the request if email fails
      }
      
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
      
      // Send email notification for QR code update
      try {
        const user = await storage.getUser(userId);
        if (user && user.email) {
          const userName = user.firstName || user.email.split('@')[0];
          await emailService.sendActionNotificationEmail(
            user.email,
            userName,
            "Modification de QR Code",
            `QR Code "${existingQR.name}" modifié avec succès`
          );
        }
      } catch (emailError) {
        console.error("Failed to send QR code update email:", emailError);
      }
      
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
        // Send email notification for QR code deletion
        try {
          const user = await storage.getUser(userId);
          if (user && user.email) {
            const userName = user.firstName || user.email.split('@')[0];
            await emailService.sendActionNotificationEmail(
              user.email,
              userName,
              "Suppression de QR Code",
              `QR Code "${existingQR.name}" supprimé avec succès`
            );
          }
        } catch (emailError) {
          console.error("Failed to send QR code deletion email:", emailError);
        }
        
        res.json({ message: "QR code deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete QR code" });
      }
    } catch (error) {
      console.error("Error deleting QR code:", error);
      res.status(500).json({ message: "Failed to delete QR code" });
    }
  });

  // QR Code redirect and tracking - Enhanced tracking system
  app.get('/r/:code', async (req, res) => {
    try {
      const shortCode = req.params.code;
      const qrCode = await storage.getQRCodeByShortCode(shortCode);
      
      if (!qrCode) {
        return res.status(404).send('QR code not found');
      }
      
      // Check if QR code is active
      if (qrCode.isActive === false) {
        return res.status(410).send('QR code is inactive');
      }
      
      // Extract tracking data
      const userAgent = req.headers['user-agent'] || '';
      const ip = req.ip || req.connection.remoteAddress || '';
      const deviceType = getDeviceType(userAgent);
      
      // Bot detection - simple heuristics
      const isBot = /bot|crawler|spider|scraper|headless|curl|wget/i.test(userAgent) ||
                   userAgent === '' ||
                   userAgent.length < 10;
      
      // Only record scan if not a bot
      if (!isBot) {
        try {
          // Get geolocation data with timeout
          const location = await getLocationFromIP(ip);
          
          await storage.recordScan({
            qrCodeId: qrCode.id,
            userAgent,
            ipAddress: ip,
            country: location.country,
            city: location.city,
            deviceType,
          });
        } catch (scanError) {
          // Don't fail redirect if scan recording fails
          console.error("Error recording scan:", scanError);
        }
      }
      
      // Handle different content types with appropriate redirects
      let redirectUrl = qrCode.originalUrl;
      
      if (qrCode.contentType !== 'url' && qrCode.content) {
        const content = qrCode.content as any;
        switch (qrCode.contentType) {
          case 'phone':
            redirectUrl = `tel:${content.phone || ''}`;
            break;
          case 'sms':
            redirectUrl = `sms:${content.phone || ''}${content.message ? `?body=${encodeURIComponent(content.message)}` : ''}`;
            break;
          case 'email':
            redirectUrl = `mailto:${content.email || ''}${content.subject ? `?subject=${encodeURIComponent(content.subject)}` : ''}`;
            break;
          case 'text':
            // For text content, show it on a simple page
            return res.send(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>QR Code Content</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
                    .content { background: #f5f5f5; padding: 20px; border-radius: 8px; white-space: pre-wrap; }
                  </style>
                </head>
                <body>
                  <h2>QR Code Content</h2>
                  <div class="content">${content.text || ''}</div>
                </body>
              </html>
            `);
          default:
            // Use original URL for other types
            break;
        }
      }
      
      // 302 redirect (temporary) to preserve analytics
      res.redirect(302, redirectUrl);
    } catch (error) {
      console.error("Error processing QR redirect:", error);
      res.status(500).send('Internal server error');
    }
  });

  // Legacy redirect endpoint for backward compatibility
  app.get('/qr/:shortCode', async (req, res) => {
    // Redirect to new format
    res.redirect(301, `/r/${req.params.shortCode}`);
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

  app.get('/api/analytics/scan-trends', authenticateUser as any, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const days = parseInt(req.query.days as string) || 7;
      const trends = await storage.getScanTrends(userId, days);
      res.json(trends);
    } catch (error) {
      console.error("Error fetching scan trends:", error);
      res.status(500).json({ message: "Failed to fetch scan trends" });
    }
  });

  app.get('/api/analytics/recent-activity', authenticateUser as any, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 10;
      const activity = await storage.getRecentScanActivity(userId, limit);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // QR code specific analytics
  app.get('/api/analytics/qr/:id/scans', authenticateUser as any, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const qrCodeId = parseInt(req.params.id);
      
      // Verify QR code belongs to user
      const qrCode = await storage.getQRCode(qrCodeId);
      if (!qrCode || qrCode.userId !== userId) {
        return res.status(404).json({ message: "QR code not found" });
      }
      
      const scans = await storage.getQRCodeScans(qrCodeId);
      res.json(scans);
    } catch (error) {
      console.error("Error fetching QR code scans:", error);
      res.status(500).json({ message: "Failed to fetch QR code scans" });
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

  // Public statistics endpoint
  app.get('/api/public/stats', async (req, res) => {
    try {
      const stats = await storage.getPublicStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching public stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Contact form endpoint
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const emailSent = await emailService.sendContactFormEmail({
        name,
        email,
        subject,
        message
      });

      if (emailSent) {
        res.json({ message: "Message sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send message" });
      }
    } catch (error) {
      console.error("Error sending contact message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Email service test endpoint (development only)
  if (process.env.NODE_ENV === 'development') {
    app.get('/api/test-email', async (req, res) => {
      try {
        const isConnected = await emailService.testConnection();
        res.json({ connected: isConnected });
      } catch (error: any) {
        res.status(500).json({ connected: false, error: error.message });
      }
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
