import { 
  User, InsertUser, 
  Vendor, InsertVendor, 
  Purchase, InsertPurchase, 
  RetailSale, InsertRetailSale, 
  HotelSale, InsertHotelSale, 
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
  
  private currentUserId: number;
  private currentVendorId: number;
  private currentPurchaseId: number;
  private currentRetailSaleId: number;
  private currentHotelSaleId: number;

  constructor() {
    this.users = new Map();
    this.vendors = new Map();
    this.purchases = new Map();
    this.retailSales = new Map();
    this.hotelSales = new Map();
    
    this.currentUserId = 1;
    this.currentVendorId = 1;
    this.currentPurchaseId = 1;
    this.currentRetailSaleId = 1;
    this.currentHotelSaleId = 1;
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
    return newPurchase;
  }

  async deletePurchase(id: number): Promise<boolean> {
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

  // Report methods
  async getDailySummary(userId: number, date: Date): Promise<DailySummary> {
    const purchases = await this.getPurchases(userId, date);
    const retailSales = await this.getRetailSales(userId, date);
    const hotelSales = await this.getHotelSales(userId, date);
    
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
        timestamp: p.timestamp
      })),
      ...retailSales.map(s => ({
        id: s.id,
        type: 'retail' as const,
        details: 'Retail Sale',
        quantityKg: Number(s.quantityKg),
        ratePerKg: Number(s.ratePerKg),
        total: Number(s.total),
        timestamp: s.timestamp
      })),
      ...hotelSales.map(s => ({
        id: s.id,
        type: 'hotel' as const,
        details: s.hotelName,
        quantityKg: Number(s.quantityKg),
        ratePerKg: Number(s.ratePerKg),
        total: Number(s.total),
        timestamp: s.timestamp
      }))
    ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
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
      transactions
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
