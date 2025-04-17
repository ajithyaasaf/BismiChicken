import { 
  User, InsertUser, 
  Vendor, InsertVendor, 
  Purchase, InsertPurchase, 
  RetailSale, InsertRetailSale, 
  HotelSale, InsertHotelSale,
  VendorPayment, InsertVendorPayment,
  DailySummary, Transaction
} from "@shared/schema";
import { format } from "date-fns";

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByFirebaseId(firebaseId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Vendor operations
  getVendors(userId: number): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  deleteVendor(id: number): Promise<boolean>;

  // Purchase operations
  getPurchases(userId: number, date?: Date): Promise<Purchase[]>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  deletePurchase(id: number): Promise<boolean>;

  // Retail Sales operations
  getRetailSales(userId: number, date?: Date): Promise<RetailSale[]>;
  createRetailSale(sale: InsertRetailSale): Promise<RetailSale>;
  deleteRetailSale(id: number): Promise<boolean>;

  // Hotel Sales operations
  getHotelSales(userId: number, date?: Date): Promise<HotelSale[]>;
  createHotelSale(sale: InsertHotelSale): Promise<HotelSale>;
  deleteHotelSale(id: number): Promise<boolean>;
  
  // Vendor Payment operations
  getVendorPayments(userId: number, vendorId?: number, date?: Date): Promise<VendorPayment[]>;
  createVendorPayment(payment: InsertVendorPayment): Promise<VendorPayment>;
  deleteVendorPayment(id: number): Promise<boolean>;

  // Report operations
  getDailySummary(userId: number, date: Date): Promise<DailySummary>;
  getDateRangeSummary(userId: number, startDate: Date, endDate: Date): Promise<DailySummary[]>;
}

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vendors: Map<number, Vendor>;
  private purchases: Map<number, Purchase>;
  private retailSales: Map<number, RetailSale>;
  private hotelSales: Map<number, HotelSale>;
  private vendorPayments: Map<number, VendorPayment>;
  
  private currentUserId: number;
  private currentVendorId: number;
  private currentPurchaseId: number;
  private currentRetailSaleId: number;
  private currentHotelSaleId: number;
  private currentVendorPaymentId: number;

  constructor() {
    this.users = new Map();
    this.vendors = new Map();
    this.purchases = new Map();
    this.retailSales = new Map();
    this.hotelSales = new Map();
    this.vendorPayments = new Map();
    
    this.currentUserId = 1;
    this.currentVendorId = 1;
    this.currentPurchaseId = 1;
    this.currentRetailSaleId = 1;
    this.currentHotelSaleId = 1;
    this.currentVendorPaymentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async getUserByFirebaseId(firebaseId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseId === firebaseId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Vendor methods
  async getVendors(userId: number): Promise<Vendor[]> {
    return Array.from(this.vendors.values()).filter(
      (vendor) => vendor.userId === userId
    );
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const id = this.currentVendorId++;
    const newVendor = { ...vendor, id };
    this.vendors.set(id, newVendor);
    return newVendor;
  }

  async updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const existingVendor = this.vendors.get(id);
    if (!existingVendor) return undefined;
    
    const updatedVendor = { ...existingVendor, ...vendor };
    this.vendors.set(id, updatedVendor);
    return updatedVendor;
  }

  async deleteVendor(id: number): Promise<boolean> {
    return this.vendors.delete(id);
  }

  // Purchase methods
  async getPurchases(userId: number, date?: Date): Promise<Purchase[]> {
    let purchases = Array.from(this.purchases.values()).filter(
      (purchase) => purchase.userId === userId
    );
    
    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      purchases = purchases.filter(
        (purchase) => format(purchase.date, 'yyyy-MM-dd') === dateStr
      );
    }
    
    return purchases.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const id = this.currentPurchaseId++;
    const timestamp = purchase.timestamp || new Date();
    const newPurchase = { ...purchase, id, timestamp };
    this.purchases.set(id, newPurchase);
    
    // Update vendor balance
    const vendor = this.vendors.get(purchase.vendorId);
    if (vendor) {
      const currentBalance = Number(vendor.balance) || 0;
      const newBalance = currentBalance + Number(purchase.total);
      this.updateVendor(vendor.id, { balance: newBalance.toString() });
    }
    
    return newPurchase;
  }

  async deletePurchase(id: number): Promise<boolean> {
    const purchase = this.purchases.get(id);
    if (!purchase) return false;
    
    // Revert vendor balance update
    const vendor = this.vendors.get(purchase.vendorId);
    if (vendor) {
      const currentBalance = Number(vendor.balance) || 0;
      const newBalance = currentBalance - Number(purchase.total);
      this.updateVendor(vendor.id, { balance: newBalance.toString() });
    }
    
    return this.purchases.delete(id);
  }

  // Retail Sales methods
  async getRetailSales(userId: number, date?: Date): Promise<RetailSale[]> {
    let sales = Array.from(this.retailSales.values()).filter(
      (sale) => sale.userId === userId
    );
    
    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      sales = sales.filter(
        (sale) => format(sale.date, 'yyyy-MM-dd') === dateStr
      );
    }
    
    return sales.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createRetailSale(sale: InsertRetailSale): Promise<RetailSale> {
    const id = this.currentRetailSaleId++;
    const timestamp = sale.timestamp || new Date();
    const newSale = { ...sale, id, timestamp };
    this.retailSales.set(id, newSale);
    return newSale;
  }

  async deleteRetailSale(id: number): Promise<boolean> {
    return this.retailSales.delete(id);
  }

  // Hotel Sales methods
  async getHotelSales(userId: number, date?: Date): Promise<HotelSale[]> {
    let sales = Array.from(this.hotelSales.values()).filter(
      (sale) => sale.userId === userId
    );
    
    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      sales = sales.filter(
        (sale) => format(sale.date, 'yyyy-MM-dd') === dateStr
      );
    }
    
    return sales.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createHotelSale(sale: InsertHotelSale): Promise<HotelSale> {
    const id = this.currentHotelSaleId++;
    const timestamp = sale.timestamp || new Date();
    const newSale = { ...sale, id, timestamp };
    this.hotelSales.set(id, newSale);
    return newSale;
  }

  async deleteHotelSale(id: number): Promise<boolean> {
    return this.hotelSales.delete(id);
  }

  // Vendor Payment methods
  async getVendorPayments(userId: number, vendorId?: number, date?: Date): Promise<VendorPayment[]> {
    let payments = Array.from(this.vendorPayments.values()).filter(
      (payment) => payment.userId === userId
    );
    
    if (vendorId) {
      payments = payments.filter(payment => payment.vendorId === vendorId);
    }
    
    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      payments = payments.filter(
        (payment) => format(payment.date, 'yyyy-MM-dd') === dateStr
      );
    }
    
    return payments.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createVendorPayment(payment: InsertVendorPayment): Promise<VendorPayment> {
    const id = this.currentVendorPaymentId++;
    const timestamp = payment.timestamp || new Date();
    const newPayment = { ...payment, id, timestamp };
    this.vendorPayments.set(id, newPayment);
    
    // Update vendor balance
    const vendor = this.vendors.get(payment.vendorId);
    if (vendor) {
      const currentBalance = Number(vendor.balance) || 0;
      const newBalance = currentBalance - Number(payment.amount);
      this.updateVendor(vendor.id, { balance: newBalance.toString() });
    }
    
    return newPayment;
  }

  async deleteVendorPayment(id: number): Promise<boolean> {
    const payment = this.vendorPayments.get(id);
    if (!payment) return false;
    
    // Revert vendor balance update
    const vendor = this.vendors.get(payment.vendorId);
    if (vendor) {
      const currentBalance = Number(vendor.balance) || 0;
      const newBalance = currentBalance + Number(payment.amount);
      this.updateVendor(vendor.id, { balance: newBalance.toString() });
    }
    
    return this.vendorPayments.delete(id);
  }

  // Report methods
  async getDailySummary(userId: number, date: Date): Promise<DailySummary> {
    const purchases = await this.getPurchases(userId, date);
    const retailSales = await this.getRetailSales(userId, date);
    const hotelSales = await this.getHotelSales(userId, date);
    const vendorPayments = await this.getVendorPayments(userId, undefined, date);
    
    // Calculate totals
    const totalPurchasedKg = purchases.reduce((sum, purchase) => sum + Number(purchase.quantityKg), 0);
    const totalPurchaseCost = purchases.reduce((sum, purchase) => sum + Number(purchase.total), 0);
    
    const totalRetailSalesKg = retailSales.reduce((sum, sale) => sum + Number(sale.quantityKg), 0);
    const totalRetailSalesRevenue = retailSales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const totalRetailProfit = retailSales.reduce((sum, sale) => {
      const avgCostPerKg = totalPurchasedKg > 0 ? totalPurchaseCost / totalPurchasedKg : 0;
      return sum + (Number(sale.total) - (Number(sale.quantityKg) * avgCostPerKg));
    }, 0);
    
    const totalHotelSalesKg = hotelSales.reduce((sum, sale) => sum + Number(sale.quantityKg), 0);
    const totalHotelSalesRevenue = hotelSales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const totalHotelProfit = hotelSales.reduce((sum, sale) => {
      const avgCostPerKg = totalPurchasedKg > 0 ? totalPurchaseCost / totalPurchasedKg : 0;
      return sum + (Number(sale.total) - (Number(sale.quantityKg) * avgCostPerKg));
    }, 0);
    
    const totalSoldKg = totalRetailSalesKg + totalHotelSalesKg;
    const remainingKg = totalPurchasedKg - totalSoldKg;
    const netProfit = totalRetailProfit + totalHotelProfit;
    
    // Create transactions for display
    const transactions: Transaction[] = [
      ...purchases.map(p => ({
        id: p.id,
        type: 'purchase' as const,
        details: `Vendor ID: ${p.vendorId}`,
        quantityKg: Number(p.quantityKg),
        ratePerKg: Number(p.ratePerKg),
        total: Number(p.total),
        timestamp: p.timestamp,
        meatType: p.meatType,
        productCut: p.productCut
      })),
      ...retailSales.map(s => ({
        id: s.id,
        type: 'retail' as const,
        details: 'Retail Sale',
        quantityKg: Number(s.quantityKg),
        ratePerKg: Number(s.ratePerKg),
        total: Number(s.total),
        timestamp: s.timestamp,
        meatType: s.meatType,
        productCut: s.productCut
      })),
      ...hotelSales.map(s => ({
        id: s.id,
        type: 'hotel' as const,
        details: s.hotelName,
        quantityKg: Number(s.quantityKg),
        ratePerKg: Number(s.ratePerKg),
        total: Number(s.total),
        timestamp: s.timestamp,
        meatType: s.meatType,
        productCut: s.productCut
      })),
      ...vendorPayments.map(p => ({
        id: p.id,
        type: 'payment' as const,
        details: `Payment to Vendor ID: ${p.vendorId}`,
        total: Number(p.amount),
        timestamp: p.timestamp
      }))
    ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Generate inventory data by meat type and product cut
    const inventoryMap = new Map<string, {
      meatType: string;
      productCut: string;
      purchasedKg: number;
      soldKg: number;
      remainingKg: number;
      avgCostPerKg: number;
      totalCost: number;
    }>();

    // Process purchases
    for (const purchase of purchases) {
      const key = `${purchase.meatType}-${purchase.productCut}`;
      
      if (!inventoryMap.has(key)) {
        inventoryMap.set(key, {
          meatType: purchase.meatType,
          productCut: purchase.productCut,
          purchasedKg: 0,
          soldKg: 0,
          remainingKg: 0,
          avgCostPerKg: 0,
          totalCost: 0
        });
      }
      
      const item = inventoryMap.get(key)!;
      const quantityKg = Number(purchase.quantityKg);
      const totalCost = Number(purchase.total);
      
      item.purchasedKg += quantityKg;
      item.totalCost += totalCost;
      
      if (item.purchasedKg > 0) {
        item.avgCostPerKg = item.totalCost / item.purchasedKg;
      }
    }
    
    // Process retail sales
    for (const sale of retailSales) {
      const key = `${sale.meatType}-${sale.productCut}`;
      
      if (!inventoryMap.has(key)) {
        // Should not happen in practice, but handle it just in case
        inventoryMap.set(key, {
          meatType: sale.meatType,
          productCut: sale.productCut,
          purchasedKg: 0,
          soldKg: 0,
          remainingKg: 0,
          avgCostPerKg: 0,
          totalCost: 0
        });
      }
      
      const item = inventoryMap.get(key)!;
      item.soldKg += Number(sale.quantityKg);
    }
    
    // Process hotel sales
    for (const sale of hotelSales) {
      const key = `${sale.meatType}-${sale.productCut}`;
      
      if (!inventoryMap.has(key)) {
        // Should not happen in practice, but handle it just in case
        inventoryMap.set(key, {
          meatType: sale.meatType,
          productCut: sale.productCut,
          purchasedKg: 0,
          soldKg: 0,
          remainingKg: 0,
          avgCostPerKg: 0,
          totalCost: 0
        });
      }
      
      const item = inventoryMap.get(key)!;
      item.soldKg += Number(sale.quantityKg);
    }
    
    // Calculate remaining kg for each product
    const inventory = Array.from(inventoryMap.values()).map(item => {
      const remaining = Math.max(0, item.purchasedKg - item.soldKg);
      return {
        meatType: item.meatType,
        productCut: item.productCut,
        purchasedKg: item.purchasedKg,
        soldKg: item.soldKg,
        remainingKg: remaining,
        avgCostPerKg: item.avgCostPerKg
      };
    });

    return {
      date,
      totalPurchasedKg,
      totalPurchaseCost,
      totalRetailSalesKg,
      totalRetailSalesRevenue,
      totalRetailProfit,
      totalHotelSalesKg,
      totalHotelSalesRevenue,
      totalHotelProfit,
      totalSoldKg,
      remainingKg,
      netProfit,
      transactions,
      inventory
    };
  }

  async getDateRangeSummary(userId: number, startDate: Date, endDate: Date): Promise<DailySummary[]> {
    // For simplicity, we'll just get each day's summary
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const summaries: DailySummary[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      if (date <= endDate) {
        const summary = await this.getDailySummary(userId, date);
        summaries.push(summary);
      }
    }
    
    return summaries;
  }
}

export const storage = new MemStorage();
