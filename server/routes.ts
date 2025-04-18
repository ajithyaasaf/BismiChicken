import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertVendorSchema, 
  insertPurchaseSchema, 
  insertRetailSaleSchema, 
  insertHotelSaleSchema,
  insertVendorPaymentSchema,
  MeatTypes,
  ProductCuts
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();

  // Middleware to verify if user exists by firebase ID
  async function getUserIdMiddleware(req: Request, res: Response, next: Function) {
    const firebaseId = req.headers.authorization;
    
    if (!firebaseId) {
      return res.status(401).json({ message: "Unauthorized - No Firebase ID provided" });
    }
    
    try {
      const user = await storage.getUserByFirebaseId(firebaseId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Add user ID to request object for use in route handlers
      req.body.userId = user.id;
      next();
    } catch (error) {
      console.error("Error in auth middleware:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // Auth routes
  router.post("/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists with this email" });
      }
      
      const user = await storage.createUser(userData);
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/auth/login", async (req, res) => {
    try {
      const { firebaseId } = req.body;
      
      if (!firebaseId) {
        return res.status(400).json({ message: "Firebase ID is required" });
      }
      
      const user = await storage.getUserByFirebaseId(firebaseId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Vendor routes
  router.get("/vendors", getUserIdMiddleware, async (req, res) => {
    try {
      const userId = req.body.userId;
      const vendors = await storage.getVendors(userId);
      res.json(vendors);
    } catch (error) {
      console.error("Error getting vendors:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/vendors", getUserIdMiddleware, async (req, res) => {
    try {
      const userId = req.body.userId;
      const vendorData = insertVendorSchema.parse({ ...req.body, userId });
      const vendor = await storage.createVendor(vendorData);
      res.status(201).json(vendor);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error creating vendor:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.put("/vendors/:id", getUserIdMiddleware, async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const userId = req.body.userId;
      
      // Check if vendor exists and belongs to user
      const vendor = await storage.getVendor(vendorId);
      if (!vendor || vendor.userId !== userId) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      // Update vendor
      const vendorData = {
        name: req.body.name,
        phone: req.body.phone,
        notes: req.body.notes,
        balance: req.body.balance
      };
      
      const updatedVendor = await storage.updateVendor(vendorId, vendorData);
      res.json(updatedVendor);
    } catch (error) {
      console.error("Error updating vendor:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.delete("/vendors/:id", getUserIdMiddleware, async (req, res) => {
    try {
      const vendorId = parseInt(req.params.id);
      const userId = req.body.userId;
      
      // Check if vendor exists and belongs to user
      const vendor = await storage.getVendor(vendorId);
      if (!vendor || vendor.userId !== userId) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      // Delete vendor
      await storage.deleteVendor(vendorId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vendor:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Purchase routes
  router.get("/purchases", getUserIdMiddleware, async (req, res) => {
    try {
      const userId = req.body.userId;
      const dateStr = req.query.date as string | undefined;
      let date: Date | undefined = undefined;
      
      if (dateStr) {
        date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
      }
      
      const purchases = await storage.getPurchases(userId, date);
      res.json(purchases);
    } catch (error) {
      console.error("Error getting purchases:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/purchases", getUserIdMiddleware, async (req, res) => {
    try {
      const userId = req.body.userId;
      
      // Calculate total
      const quantityKg = parseFloat(req.body.quantityKg);
      const ratePerKg = parseFloat(req.body.ratePerKg);
      const total = quantityKg * ratePerKg;
      
      // Parse the date
      let date: Date;
      if (req.body.date) {
        date = new Date(req.body.date);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
      } else {
        date = new Date(); // Default to today
      }
      
      // Validate meat type and product cut
      const meatType = req.body.meatType || MeatTypes.CHICKEN;
      const productCut = req.body.productCut || ProductCuts.WHOLE;
      
      // Validate with zod schema
      if (!Object.values(MeatTypes).includes(meatType)) {
        return res.status(400).json({ message: "Invalid meat type" });
      }
      
      if (!Object.values(ProductCuts).includes(productCut)) {
        return res.status(400).json({ message: "Invalid product cut" });
      }
      
      // Convert numeric values to strings for Zod validation
      const purchaseData = insertPurchaseSchema.parse({
        ...req.body,
        quantityKg: quantityKg.toString(),
        ratePerKg: ratePerKg.toString(),
        total: total.toString(),
        date,
        userId,
        meatType,
        productCut,
        productId: req.body.productId ? req.body.productId.toString() : undefined
      });
      
      const purchase = await storage.createPurchase(purchaseData);
      res.status(201).json(purchase);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error creating purchase:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.delete("/purchases/:id", getUserIdMiddleware, async (req, res) => {
    try {
      const purchaseId = parseInt(req.params.id);
      await storage.deletePurchase(purchaseId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting purchase:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Retail Sales routes
  router.get("/sales/retail", getUserIdMiddleware, async (req, res) => {
    try {
      const userId = req.body.userId;
      const dateStr = req.query.date as string | undefined;
      let date: Date | undefined = undefined;
      
      if (dateStr) {
        date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
      }
      
      const sales = await storage.getRetailSales(userId, date);
      res.json(sales);
    } catch (error) {
      console.error("Error getting retail sales:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/sales/retail", getUserIdMiddleware, async (req, res) => {
    try {
      const userId = req.body.userId;
      
      // Calculate total
      const quantityKg = parseFloat(req.body.quantityKg);
      const ratePerKg = parseFloat(req.body.ratePerKg);
      const total = quantityKg * ratePerKg;
      
      // Parse the date
      let date: Date;
      if (req.body.date) {
        date = new Date(req.body.date);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
      } else {
        date = new Date(); // Default to today
      }
      
      // Check if there's enough stock
      const dailySummary = await storage.getDailySummary(userId, date);
      if (dailySummary.totalSoldKg + quantityKg > dailySummary.totalPurchasedKg) {
        return res.status(400).json({ 
          message: "Cannot sell more than purchased", 
          remainingStock: dailySummary.remainingKg 
        });
      }
      
      // Validate meat type and product cut
      const meatType = req.body.meatType || MeatTypes.CHICKEN;
      const productCut = req.body.productCut || ProductCuts.WHOLE;
      
      // Validate with zod schema
      if (!Object.values(MeatTypes).includes(meatType)) {
        return res.status(400).json({ message: "Invalid meat type" });
      }
      
      if (!Object.values(ProductCuts).includes(productCut)) {
        return res.status(400).json({ message: "Invalid product cut" });
      }
      
      // Convert numeric values to strings for Zod validation
      const saleData = insertRetailSaleSchema.parse({
        ...req.body,
        quantityKg: quantityKg.toString(),
        ratePerKg: ratePerKg.toString(),
        total: total.toString(),
        date,
        userId,
        meatType,
        productCut,
        productId: req.body.productId ? req.body.productId.toString() : undefined
      });
      
      const sale = await storage.createRetailSale(saleData);
      res.status(201).json(sale);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error creating retail sale:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.delete("/sales/retail/:id", getUserIdMiddleware, async (req, res) => {
    try {
      const saleId = parseInt(req.params.id);
      await storage.deleteRetailSale(saleId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting retail sale:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Hotel Sales routes
  router.get("/sales/hotel", getUserIdMiddleware, async (req, res) => {
    try {
      const userId = req.body.userId;
      const dateStr = req.query.date as string | undefined;
      let date: Date | undefined = undefined;
      
      if (dateStr) {
        date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
      }
      
      const sales = await storage.getHotelSales(userId, date);
      res.json(sales);
    } catch (error) {
      console.error("Error getting hotel sales:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/sales/hotel", getUserIdMiddleware, async (req, res) => {
    try {
      const userId = req.body.userId;
      
      // Calculate total
      const quantityKg = parseFloat(req.body.quantityKg);
      const ratePerKg = parseFloat(req.body.ratePerKg);
      const total = quantityKg * ratePerKg;
      
      // Parse the date
      let date: Date;
      if (req.body.date) {
        date = new Date(req.body.date);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
      } else {
        date = new Date(); // Default to today
      }
      
      // Check if there's enough stock
      const dailySummary = await storage.getDailySummary(userId, date);
      if (dailySummary.totalSoldKg + quantityKg > dailySummary.totalPurchasedKg) {
        return res.status(400).json({ 
          message: "Cannot sell more than purchased", 
          remainingStock: dailySummary.remainingKg 
        });
      }
      
      // Validate meat type and product cut
      const meatType = req.body.meatType || MeatTypes.CHICKEN;
      const productCut = req.body.productCut || ProductCuts.WHOLE;
      
      // Validate with zod schema
      if (!Object.values(MeatTypes).includes(meatType)) {
        return res.status(400).json({ message: "Invalid meat type" });
      }
      
      if (!Object.values(ProductCuts).includes(productCut)) {
        return res.status(400).json({ message: "Invalid product cut" });
      }
      
      // Convert numeric values to strings for Zod validation
      const saleData = insertHotelSaleSchema.parse({
        ...req.body,
        quantityKg: quantityKg.toString(),
        ratePerKg: ratePerKg.toString(),
        total: total.toString(),
        date,
        userId,
        meatType,
        productCut,
        hotelId: req.body.hotelId ? req.body.hotelId.toString() : undefined,
        productId: req.body.productId ? req.body.productId.toString() : undefined
      });
      
      const sale = await storage.createHotelSale(saleData);
      res.status(201).json(sale);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error creating hotel sale:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.delete("/sales/hotel/:id", getUserIdMiddleware, async (req, res) => {
    try {
      const saleId = parseInt(req.params.id);
      await storage.deleteHotelSale(saleId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting hotel sale:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Report routes
  router.get("/report/daily", getUserIdMiddleware, async (req, res) => {
    try {
      const userId = req.body.userId;
      const dateStr = req.query.date as string | undefined;
      
      // Use today's date if none is provided
      let date: Date;
      if (dateStr) {
        date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
      } else {
        date = new Date();
      }
      
      const summary = await storage.getDailySummary(userId, date);
      res.json(summary);
    } catch (error) {
      console.error("Error getting daily report:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.get("/report/aggregate", getUserIdMiddleware, async (req, res) => {
    try {
      const userId = req.body.userId;
      const fromStr = req.query.from as string;
      const toStr = req.query.to as string;
      
      if (!fromStr || !toStr) {
        return res.status(400).json({ message: "From and to parameters are required" });
      }
      
      const fromDate = new Date(fromStr);
      const toDate = new Date(toStr);
      
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const summaries = await storage.getDateRangeSummary(userId, fromDate, toDate);
      res.json(summaries);
    } catch (error) {
      console.error("Error getting aggregate report:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Vendor Payment routes
  router.get("/vendors/payments", getUserIdMiddleware, async (req, res) => {
    try {
      const userId = req.body.userId;
      const vendorId = req.query.vendorId ? parseInt(req.query.vendorId as string) : undefined;
      const dateStr = req.query.date as string | undefined;
      let date: Date | undefined = undefined;
      
      if (dateStr) {
        date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
      }
      
      const payments = await storage.getVendorPayments(userId, vendorId, date);
      res.json(payments);
    } catch (error) {
      console.error("Error getting vendor payments:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.post("/vendors/payments", getUserIdMiddleware, async (req, res) => {
    try {
      const userId = req.body.userId;
      
      // Ensure the date is a string (already formatted as YYYY-MM-DD)
      if (!req.body.date) {
        // Use today's date if none provided, in YYYY-MM-DD format
        const today = new Date();
        req.body.date = today.toISOString().split('T')[0];
      }
      
      // Validate vendor exists
      const vendorId = parseInt(req.body.vendorId);
      const vendor = await storage.getVendor(vendorId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      // Convert numeric values to strings for Zod validation
      const paymentData = insertVendorPaymentSchema.parse({
        ...req.body,
        userId,
        vendorId: vendorId.toString(),
        amount: req.body.amount.toString()
      });
      
      const payment = await storage.createVendorPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error creating vendor payment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.get("/vendors/payments/:id", getUserIdMiddleware, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      const payment = await storage.getVendorPaymentById(paymentId);
      
      if (!payment) {
        return res.status(404).json({ message: "Vendor payment not found" });
      }
      
      res.json(payment);
    } catch (error) {
      console.error("Error getting vendor payment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.delete("/vendors/payments/:id", getUserIdMiddleware, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      await storage.deleteVendorPayment(paymentId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vendor payment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Register all routes with /api prefix
  app.use('/api', router);

  const httpServer = createServer(app);
  return httpServer;
}
