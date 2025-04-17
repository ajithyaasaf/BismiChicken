import { pgTable, text, serial, integer, date, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firebaseId: text("firebase_id").notNull().unique(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firebaseId: true,
});

// Vendors
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  notes: text("notes"),
  userId: integer("user_id").notNull(),
});

export const insertVendorSchema = createInsertSchema(vendors).pick({
  name: true,
  phone: true,
  notes: true,
  userId: true,
});

// Purchases
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull(),
  quantityKg: numeric("quantity_kg").notNull(),
  ratePerKg: numeric("rate_per_kg").notNull(),
  total: numeric("total").notNull(),
  date: date("date").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  userId: integer("user_id").notNull(),
});

export const insertPurchaseSchema = createInsertSchema(purchases).pick({
  vendorId: true,
  quantityKg: true,
  ratePerKg: true,
  total: true,
  date: true,
  userId: true,
});

// Retail Sales
export const retailSales = pgTable("retail_sales", {
  id: serial("id").primaryKey(),
  quantityKg: numeric("quantity_kg").notNull(),
  ratePerKg: numeric("rate_per_kg").notNull(),
  total: numeric("total").notNull(),
  date: date("date").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  userId: integer("user_id").notNull(),
});

export const insertRetailSaleSchema = createInsertSchema(retailSales).pick({
  quantityKg: true,
  ratePerKg: true,
  total: true,
  date: true,
  userId: true,
});

// Hotel Sales
export const hotelSales = pgTable("hotel_sales", {
  id: serial("id").primaryKey(),
  hotelName: text("hotel_name").notNull(),
  quantityKg: numeric("quantity_kg").notNull(),
  ratePerKg: numeric("rate_per_kg").notNull(),
  total: numeric("total").notNull(),
  date: date("date").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  userId: integer("user_id").notNull(),
});

export const insertHotelSaleSchema = createInsertSchema(hotelSales).pick({
  hotelName: true,
  quantityKg: true,
  ratePerKg: true,
  total: true,
  date: true,
  userId: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchases.$inferSelect;

export type InsertRetailSale = z.infer<typeof insertRetailSaleSchema>;
export type RetailSale = typeof retailSales.$inferSelect;

export type InsertHotelSale = z.infer<typeof insertHotelSaleSchema>;
export type HotelSale = typeof hotelSales.$inferSelect;

// Combined types for frontend use
export type Transaction = {
  id: number;
  type: 'purchase' | 'retail' | 'hotel';
  details: string;
  quantityKg: number;
  ratePerKg: number;
  total: number;
  timestamp: Date;
};

export type DailySummary = {
  date: Date;
  totalPurchasedKg: number;
  totalPurchaseCost: number;
  totalRetailSalesKg: number;
  totalRetailSalesRevenue: number;
  totalRetailProfit: number;
  totalHotelSalesKg: number;
  totalHotelSalesRevenue: number;
  totalHotelProfit: number;
  totalSoldKg: number;
  remainingKg: number;
  netProfit: number;
  transactions: Transaction[];
};
