import {
  users,
  qrCodes,
  qrScans,
  type User,
  type UpsertUser,
  type QRCode,
  type InsertQRCode,
  type QRScan,
  type InsertQRScan,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, count, inArray, or } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserSubscription(userId: string, subscription: {
    subscriptionId: string;
    subscriptionStatus: string;
    subscriptionPlanId: string;
  }): Promise<User | undefined>;
  
  // QR Code operations
  getUserQRCodes(userId: string): Promise<QRCode[]>;
  getQRCode(id: number): Promise<QRCode | undefined>;
  getQRCodeByShortCode(shortCode: string): Promise<QRCode | undefined>;
  createQRCode(userId: string, qrCode: InsertQRCode): Promise<QRCode>;
  updateQRCode(id: number, updates: Partial<InsertQRCode>): Promise<QRCode | undefined>;
  deleteQRCode(id: number): Promise<boolean>;
  
  // Analytics operations
  recordScan(scan: InsertQRScan): Promise<QRScan>;
  getQRCodeScans(qrCodeId: number): Promise<QRScan[]>;
  getQRCodeScanCount(qrCodeId: number): Promise<number>;
  getUserAnalytics(userId: string): Promise<{
    totalQRCodes: number;
    totalScans: number;
    scansToday: number;
    activeQRCodes: number;
  }>;
  getTopPerformingQRCodes(userId: string, limit?: number): Promise<(QRCode & { scanCount: number })[]>;
  getDeviceBreakdown(userId: string): Promise<{ deviceType: string; count: number }[]>;
  getLocationBreakdown(userId: string): Promise<{ country: string; count: number }[]>;
  getScanTrends(userId: string, days?: number): Promise<{ date: string; scans: number }[]>;
  getRecentScanActivity(userId: string, limit?: number): Promise<any[]>;
  getPublicStats(): Promise<{
    totalQRCodes: number;
    totalScans: number;
    totalUsers: number;
    scansToday: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      // Check if user exists by ID first
      if (userData.id) {
        const existingUser = await this.getUser(userData.id);
        if (existingUser) {
          // Update existing user
          const [updatedUser] = await db
            .update(users)
            .set({
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              profileImageUrl: userData.profileImageUrl,
              updatedAt: new Date(),
            })
            .where(eq(users.id, userData.id))
            .returning();
          return updatedUser;
        }
      }

      // Check if user exists by email
      if (userData.email) {
        const [existingUserByEmail] = await db
          .select()
          .from(users)
          .where(eq(users.email, userData.email))
          .limit(1);
        
        if (existingUserByEmail) {
          // Update existing user found by email
          const [updatedUser] = await db
            .update(users)
            .set({
              id: userData.id || existingUserByEmail.id,
              firstName: userData.firstName,
              lastName: userData.lastName,
              profileImageUrl: userData.profileImageUrl,
              updatedAt: new Date(),
            })
            .where(eq(users.email, userData.email))
            .returning();
          return updatedUser;
        }
      }

      // Create new user if none exists
      const [newUser] = await db
        .insert(users)
        .values(userData)
        .returning();
      return newUser;
    } catch (error) {
      console.error('Error in upsertUser:', error);
      throw error;
    }
  }

  async updateUserSubscription(userId: string, subscription: {
    subscriptionId: string;
    subscriptionStatus: string;
    subscriptionPlanId: string;
  }): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        subscriptionId: subscription.subscriptionId,
        subscriptionStatus: subscription.subscriptionStatus,
        subscriptionPlanId: subscription.subscriptionPlanId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // QR Code operations
  async getUserQRCodes(userId: string): Promise<QRCode[]> {
    return await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.userId, userId))
      .orderBy(desc(qrCodes.createdAt));
  }

  async getQRCode(id: number): Promise<QRCode | undefined> {
    const [qrCode] = await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.id, id));
    return qrCode;
  }

  async getQRCodeByShortCode(shortCode: string): Promise<QRCode | undefined> {
    const [qrCode] = await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.shortCode, shortCode));
    return qrCode;
  }

  async createQRCode(userId: string, qrCodeData: InsertQRCode): Promise<QRCode> {
    // Use provided shortCode or generate a unique one
    const shortCode = qrCodeData.shortCode || this.generateShortCode();
    
    const [qrCode] = await db
      .insert(qrCodes)
      .values({
        ...qrCodeData,
        userId,
        shortCode,
      })
      .returning();
    return qrCode;
  }

  async updateQRCode(id: number, updates: Partial<InsertQRCode>): Promise<QRCode | undefined> {
    const [qrCode] = await db
      .update(qrCodes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(qrCodes.id, id))
      .returning();
    return qrCode;
  }

  async deleteQRCode(id: number): Promise<boolean> {
    const result = await db
      .delete(qrCodes)
      .where(eq(qrCodes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Analytics operations
  async recordScan(scanData: InsertQRScan): Promise<QRScan> {
    const [scan] = await db
      .insert(qrScans)
      .values(scanData)
      .returning();
    return scan;
  }

  async getQRCodeScans(qrCodeId: number): Promise<QRScan[]> {
    return await db
      .select()
      .from(qrScans)
      .where(eq(qrScans.qrCodeId, qrCodeId))
      .orderBy(desc(qrScans.scannedAt));
  }

  async getQRCodeScanCount(qrCodeId: number): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(qrScans)
      .where(eq(qrScans.qrCodeId, qrCodeId));
    return result[0]?.count || 0;
  }

  async getUserAnalytics(userId: string): Promise<{
    totalQRCodes: number;
    totalScans: number;
    scansToday: number;
    activeQRCodes: number;
  }> {
    const userQRCodes = await db
      .select({ id: qrCodes.id })
      .from(qrCodes)
      .where(eq(qrCodes.userId, userId));

    const qrCodeIds = userQRCodes.map(qr => qr.id);

    if (qrCodeIds.length === 0) {
      return {
        totalQRCodes: 0,
        totalScans: 0,
        scansToday: 0,
        activeQRCodes: 0,
      };
    }

    const [totalQRCodesResult] = await db
      .select({ count: count() })
      .from(qrCodes)
      .where(eq(qrCodes.userId, userId));

    const totalScansResult = await db
      .select({ count: count() })
      .from(qrScans)
      .innerJoin(qrCodes, eq(qrScans.qrCodeId, qrCodes.id))
      .where(eq(qrCodes.userId, userId));
    
    const totalScans = totalScansResult[0]?.count || 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const scansTodayResult = await db
      .select({ count: count() })
      .from(qrScans)
      .innerJoin(qrCodes, eq(qrScans.qrCodeId, qrCodes.id))
      .where(
        and(
          eq(qrCodes.userId, userId),
          gte(qrScans.scannedAt, today)
        )
      );
    
    const scansToday = scansTodayResult[0]?.count || 0;

    const [activeQRCodesResult] = await db
      .select({ count: count() })
      .from(qrCodes)
      .where(
        and(
          eq(qrCodes.userId, userId),
          eq(qrCodes.isActive, true)
        )
      );

    return {
      totalQRCodes: totalQRCodesResult?.count || 0,
      totalScans,
      scansToday,
      activeQRCodes: activeQRCodesResult?.count || 0,
    };
  }

  async getTopPerformingQRCodes(userId: string, limit = 5): Promise<(QRCode & { scanCount: number })[]> {
    const result = await db
      .select({
        id: qrCodes.id,
        userId: qrCodes.userId,
        name: qrCodes.name,
        originalUrl: qrCodes.originalUrl,
        shortCode: qrCodes.shortCode,
        type: qrCodes.type,
        description: qrCodes.description,
        isActive: qrCodes.isActive,
        createdAt: qrCodes.createdAt,
        updatedAt: qrCodes.updatedAt,
        scanCount: count(qrScans.id),
      })
      .from(qrCodes)
      .leftJoin(qrScans, eq(qrCodes.id, qrScans.qrCodeId))
      .where(eq(qrCodes.userId, userId))
      .groupBy(qrCodes.id)
      .orderBy(desc(count(qrScans.id)))
      .limit(limit);

    return result.map(row => ({
      ...row,
      scanCount: Number(row.scanCount),
    }));
  }

  async getDeviceBreakdown(userId: string): Promise<{ deviceType: string; count: number }[]> {
    const userQRCodes = await db
      .select({ id: qrCodes.id })
      .from(qrCodes)
      .where(eq(qrCodes.userId, userId));

    const qrCodeIds = userQRCodes.map(qr => qr.id);

    if (qrCodeIds.length === 0) {
      return [];
    }

    const result = await db
      .select({
        deviceType: qrScans.deviceType,
        count: count(),
      })
      .from(qrScans)
      .innerJoin(qrCodes, eq(qrScans.qrCodeId, qrCodes.id))
      .where(eq(qrCodes.userId, userId))
      .groupBy(qrScans.deviceType);

    return result.map(row => ({
      deviceType: row.deviceType || 'Unknown',
      count: Number(row.count),
    }));
  }

  async getLocationBreakdown(userId: string): Promise<{ country: string; count: number }[]> {
    const userQRCodes = await db
      .select({ id: qrCodes.id })
      .from(qrCodes)
      .where(eq(qrCodes.userId, userId));

    const qrCodeIds = userQRCodes.map(qr => qr.id);

    if (qrCodeIds.length === 0) {
      return [];
    }

    const result = await db
      .select({
        country: qrScans.country,
        count: count(),
      })
      .from(qrScans)
      .innerJoin(qrCodes, eq(qrScans.qrCodeId, qrCodes.id))
      .where(eq(qrCodes.userId, userId))
      .groupBy(qrScans.country)
      .orderBy(desc(count()))
      .limit(10);

    return result.map(row => ({
      country: row.country || 'Unknown',
      count: Number(row.count),
    }));
  }

  async getScanTrends(userId: string, days: number = 7): Promise<{ date: string; scans: number }[]> {
    const result = await db
      .select({
        date: sql<string>`DATE(${qrScans.scannedAt}) as date`,
        scans: count(),
      })
      .from(qrScans)
      .innerJoin(qrCodes, eq(qrScans.qrCodeId, qrCodes.id))
      .where(
        and(
          eq(qrCodes.userId, userId),
          gte(qrScans.scannedAt, sql`NOW() - INTERVAL '${sql.raw(days.toString())} days'`)
        )
      )
      .groupBy(sql`DATE(${qrScans.scannedAt})`)
      .orderBy(sql`DATE(${qrScans.scannedAt})`);

    // Fill in missing dates with 0 scans
    const trends: { date: string; scans: number }[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const existingData = result.find(r => r.date === dateStr);
      trends.push({
        date: dateStr,
        scans: existingData ? Number(existingData.scans) : 0
      });
    }

    return trends;
  }

  async getRecentScanActivity(userId: string, limit: number = 10): Promise<any[]> {
    const result = await db
      .select({
        id: qrScans.id,
        qrCodeName: qrCodes.name,
        qrCodeId: qrCodes.id,
        deviceType: qrScans.deviceType,
        country: qrScans.country,
        city: qrScans.city,
        scannedAt: qrScans.scannedAt,
        ipAddress: qrScans.ipAddress
      })
      .from(qrScans)
      .innerJoin(qrCodes, eq(qrScans.qrCodeId, qrCodes.id))
      .where(eq(qrCodes.userId, userId))
      .orderBy(desc(qrScans.scannedAt))
      .limit(limit);

    return result;
  }

  async getPublicStats(): Promise<{
    totalQRCodes: number;
    totalScans: number;
    totalUsers: number;
    scansToday: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get total QR codes
    const [totalQRCodesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(qrCodes);
    
    // Get total scans
    const [totalScansResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(qrScans);
    
    // Get total users
    const [totalUsersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    
    // Get scans today
    const [scansTodayResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(qrScans)
      .where(gte(qrScans.scannedAt, today));
    
    return {
      totalQRCodes: totalQRCodesResult.count || 0,
      totalScans: totalScansResult.count || 0,
      totalUsers: totalUsersResult.count || 0,
      scansToday: scansTodayResult.count || 0,
    };
  }

  private generateShortCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const storage = new DatabaseStorage();
