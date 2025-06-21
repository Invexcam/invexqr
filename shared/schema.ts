import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const qrCodes = pgTable("qr_codes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  originalUrl: text("original_url").notNull(),
  shortCode: varchar("short_code").notNull().unique(),
  type: varchar("type").notNull(), // 'static' or 'dynamic'
  contentType: varchar("content_type").notNull().default("url"), // 'url', 'text', 'vcard', 'phone', 'sms', 'email', 'pdf', 'menu', 'audio'
  content: jsonb("content"), // Structured content for different types
  style: jsonb("style").default({}), // QR code styling: colors, logo, pattern
  customization: jsonb("customization").default({}), // Advanced customization options
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const qrScans = pgTable("qr_scans", {
  id: serial("id").primaryKey(),
  qrCodeId: integer("qr_code_id").notNull().references(() => qrCodes.id, { onDelete: "cascade" }),
  scannedAt: timestamp("scanned_at").defaultNow(),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  country: varchar("country"),
  city: varchar("city"),
  deviceType: varchar("device_type"), // 'mobile', 'desktop', 'tablet'
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  qrCodes: many(qrCodes),
}));

export const qrCodesRelations = relations(qrCodes, ({ one, many }) => ({
  user: one(users, {
    fields: [qrCodes.userId],
    references: [users.id],
  }),
  scans: many(qrScans),
}));

export const qrScansRelations = relations(qrScans, ({ one }) => ({
  qrCode: one(qrCodes, {
    fields: [qrScans.qrCodeId],
    references: [qrCodes.id],
  }),
}));

// Schemas
export const insertQRCodeSchema = createInsertSchema(qrCodes).omit({
  id: true,
  userId: true,
  shortCode: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQRScanSchema = createInsertSchema(qrScans).omit({
  id: true,
  scannedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type QRCode = typeof qrCodes.$inferSelect;
export type InsertQRCode = z.infer<typeof insertQRCodeSchema>;
export type QRScan = typeof qrScans.$inferSelect;
export type InsertQRScan = z.infer<typeof insertQRScanSchema>;
