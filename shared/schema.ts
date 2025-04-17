import { pgTable, text, serial, integer, date, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
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

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'chicken', 'goat', 'beef', 'kadai', etc.
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  userId: integer("user_id").notNull(),
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  category: true,
  description: true,
  isActive: true,
  userId: true,
});

// Product Parts (for different cuts/pieces)
export const productParts = pgTable("product_parts", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  name: text("name").notNull(),  // 'whole', 'leg', 'liver', etc.
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  userId: integer("user_id").notNull(),
});

export const insertProductPartSchema = createInsertSchema(productParts).pick({
  productId: true,
  name: true,
  description: true,
  isActive: true,
  userId: true,
});

// Vendors
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  notes: text("notes"),
  outstandingDebt: numeric("outstanding_debt").notNull().default("0"),
  userId: integer("user_id").notNull(),
});

export const insertVendorSchema = createInsertSchema(vendors).pick({
  name: true,
  phone: true,
  notes: true,
  outstandingDebt: true,
  userId: true,
});

// Hotels (Regular Clients)
export const hotels = pgTable("hotels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  contactPerson: text("contact_person"),
  notes: text("notes"),
  userId: integer("user_id").notNull(),
});

export const insertHotelSchema = createInsertSchema(hotels).pick({
  name: true,
  phone: true,
  address: true,
  contactPerson: true,
  notes: true,
  userId: true,
});

// Purchases
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull(),
  productId: integer("product_id").notNull(),
  partId: integer("part_id"),
  quantityKg: numeric("quantity_kg").notNull(),
  ratePerKg: numeric("rate_per_kg").notNull(),
  total: numeric("total").notNull(),
  date: date("date").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  userId: integer("user_id").notNull(),
});

export const insertPurchaseSchema = createInsertSchema(purchases).pick({
  vendorId: true,
  productId: true,
  partId: true,
  quantityKg: true,
  ratePerKg: true,
  total: true,
  date: true,
  userId: true,
});

// Retail Sales
export const retailSales = pgTable("retail_sales", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  partId: integer("part_id"),
  quantityKg: numeric("quantity_kg").notNull(),
  ratePerKg: numeric("rate_per_kg").notNull(),
  total: numeric("total").notNull(),
  date: date("date").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  userId: integer("user_id").notNull(),
});

export const insertRetailSaleSchema = createInsertSchema(retailSales).pick({
  productId: true,
  partId: true,
  quantityKg: true,
  ratePerKg: true,
  total: true,
  date: true,
  userId: true,
});

// Hotel Sales (Line Items)
export const hotelSaleItems = pgTable("hotel_sale_items", {
  id: serial("id").primaryKey(),
  hotelSaleId: integer("hotel_sale_id").notNull(),
  productId: integer("product_id").notNull(),
  partId: integer("part_id"),
  quantityKg: numeric("quantity_kg").notNull(),
  ratePerKg: numeric("rate_per_kg").notNull(),
  total: numeric("total").notNull(),
  userId: integer("user_id").notNull(),
});

export const insertHotelSaleItemSchema = createInsertSchema(hotelSaleItems).pick({
  hotelSaleId: true,
  productId: true,
  partId: true,
  quantityKg: true,
  ratePerKg: true,
  total: true,
  userId: true,
});

// Hotel Sales (Header)
export const hotelSales = pgTable("hotel_sales", {
  id: serial("id").primaryKey(),
  hotelId: integer("hotel_id").notNull(),
  billNumber: text("bill_number").notNull(),
  totalAmount: numeric("total_amount").notNull(),
  date: date("date").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  isPaid: boolean("is_paid").notNull().default(false),
  userId: integer("user_id").notNull(),
});

export const insertHotelSaleSchema = createInsertSchema(hotelSales).pick({
  hotelId: true,
  billNumber: true,
  totalAmount: true,
  date: true,
  isPaid: true,
  userId: true,
});

// Vendor Payments
export const vendorPayments = pgTable("vendor_payments", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull(),
  amount: numeric("amount").notNull(),
  date: date("date").notNull(),
  notes: text("notes"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  userId: integer("user_id").notNull(),
});

export const insertVendorPaymentSchema = createInsertSchema(vendorPayments).pick({
  vendorId: true,
  amount: true,
  date: true,
  notes: true,
  userId: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertProductPart = z.infer<typeof insertProductPartSchema>;
export type ProductPart = typeof productParts.$inferSelect;

export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

export type InsertHotel = z.infer<typeof insertHotelSchema>;
export type Hotel = typeof hotels.$inferSelect;

export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchases.$inferSelect;

export type InsertRetailSale = z.infer<typeof insertRetailSaleSchema>;
export type RetailSale = typeof retailSales.$inferSelect;

export type InsertHotelSale = z.infer<typeof insertHotelSaleSchema>;
export type HotelSale = typeof hotelSales.$inferSelect;

export type InsertHotelSaleItem = z.infer<typeof insertHotelSaleItemSchema>;
export type HotelSaleItem = typeof hotelSaleItems.$inferSelect;

export type InsertVendorPayment = z.infer<typeof insertVendorPaymentSchema>;
export type VendorPayment = typeof vendorPayments.$inferSelect;

// Combined types for frontend use
export type Transaction = {
  id: number;
  type: 'purchase' | 'retail' | 'hotel' | 'payment';
  details: string;
  productName?: string;
  partName?: string;
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
  vendorPayments: number;
  transactions: Transaction[];
};

// Predefined types for UI consistency
export const PRODUCT_CATEGORIES = [
  'chicken',
  'goat',
  'beef',
  'kadai',
  'other'
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];
