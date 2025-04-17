import { database } from './firebase-admin';
import { IStorage } from './storage';
import {
  User, InsertUser,
  Vendor, InsertVendor,
  Purchase, InsertPurchase,
  RetailSale, InsertRetailSale,
  HotelSale, InsertHotelSale, HotelSaleItem,
  VendorPayment, InsertVendorPayment,
  Hotel, InsertHotel,
  Product, InsertProduct,
  ProductPart, InsertProductPart,
  Transaction, ProductInventory, DailySummary
} from '../shared/schema';

// Utility function to convert Firebase object with keys to array
function objectToArray<T>(obj: Record<string, T> | null): T[] {
  if (!obj) return [];
  return Object.entries(obj).map(([, value]) => value);
}

// Utility to get reference path with user segments
const getRefPath = (userId: number, collection: string) => 
  `users/${userId}/${collection}`;

// Utility to parse date into a comparable format for filtering
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export class RealtimeDBStorage implements IStorage {
  private nextIds: {
    userId: number;
    vendorId: number;
    purchaseId: number;
    retailSaleId: number;
    hotelSaleId: number;
    hotelSaleItemId: number;
    vendorPaymentId: number;
    hotelId: number;
    productId: number;
    productPartId: number;
  };

  constructor() {
    this.nextIds = {
      userId: 1,
      vendorId: 1,
      purchaseId: 1,
      retailSaleId: 1,
      hotelSaleId: 1,
      hotelSaleItemId: 1,
      vendorPaymentId: 1,
      hotelId: 1,
      productId: 1,
      productPartId: 1
    };
    
    // Initialize sequence numbers
    this.initializeCounters();
  }

  private async initializeCounters() {
    try {
      const countersRef = database.ref('counters');
      const snapshot = await countersRef.once('value');
      
      if (!snapshot.exists()) {
        // Initialize counters if they don't exist
        await countersRef.set(this.nextIds);
      } else {
        // Load existing counters
        this.nextIds = snapshot.val();
      }
    } catch (error) {
      console.error('Failed to initialize counters:', error);
    }
  }

  private async getNextId(type: keyof typeof this.nextIds): Promise<number> {
    const id = this.nextIds[type];
    this.nextIds[type] += 1;
    
    // Update the counter in the database
    try {
      await database.ref(`counters/${type}`).set(this.nextIds[type]);
    } catch (error) {
      console.error(`Failed to update ${type} counter:`, error);
    }
    
    return id;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const snapshot = await database.ref(`users/${id}/profile`).once('value');
    return snapshot.exists() ? snapshot.val() as User : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const usersRef = database.ref('users');
    const snapshot = await usersRef.orderByChild('profile/email').equalTo(email).once('value');
    
    if (!snapshot.exists()) return undefined;
    
    // Get the first user with matching email
    const users = objectToArray<User>(snapshot.val());
    return users.length > 0 ? users[0] : undefined;
  }

  async getUserByFirebaseId(firebaseId: string): Promise<User | undefined> {
    const usersRef = database.ref('users');
    const snapshot = await usersRef.orderByChild('profile/firebaseId').equalTo(firebaseId).once('value');
    
    if (!snapshot.exists()) return undefined;
    
    // Extract user profile from the first matching record
    const userEntries = Object.entries(snapshot.val());
    if (userEntries.length === 0) return undefined;
    
    const [userId, userData] = userEntries[0];
    return (userData as any).profile as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = await this.getNextId('userId');
    
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date(),
    };
    
    await database.ref(`users/${id}/profile`).set(newUser);
    return newUser;
  }

  // Vendor operations
  async getVendors(userId: number): Promise<Vendor[]> {
    const snapshot = await database.ref(getRefPath(userId, 'vendors')).once('value');
    return objectToArray<Vendor>(snapshot.val());
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    // We need to find which user this vendor belongs to
    const vendorsRef = database.ref('users');
    const snapshot = await vendorsRef.orderByChild(`vendors/${id}/id`).equalTo(id).once('value');
    
    if (!snapshot.exists()) return undefined;
    
    // Extract vendor from the first matching user
    const userEntries = Object.entries(snapshot.val());
    if (userEntries.length === 0) return undefined;
    
    const [, userData] = userEntries[0];
    return (userData as any).vendors[id] as Vendor;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const id = await this.getNextId('vendorId');
    
    const newVendor: Vendor = {
      ...vendor,
      id,
      createdAt: new Date(),
    };
    
    await database.ref(`users/${vendor.userId}/vendors/${id}`).set(newVendor);
    return newVendor;
  }

  async updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const existingVendor = await this.getVendor(id);
    if (!existingVendor) return undefined;
    
    const updatedVendor: Vendor = {
      ...existingVendor,
      ...vendor,
      id, // Ensure ID doesn't change
    };
    
    await database.ref(`users/${existingVendor.userId}/vendors/${id}`).set(updatedVendor);
    return updatedVendor;
  }

  async deleteVendor(id: number): Promise<boolean> {
    const vendor = await this.getVendor(id);
    if (!vendor) return false;
    
    await database.ref(`users/${vendor.userId}/vendors/${id}`).remove();
    return true;
  }

  // Purchase operations
  async getPurchases(userId: number, date?: Date): Promise<Purchase[]> {
    const snapshot = await database.ref(getRefPath(userId, 'purchases')).once('value');
    let purchases = objectToArray<Purchase>(snapshot.val());
    
    if (date) {
      // Filter by date
      purchases = purchases.filter(purchase => {
        const purchaseDate = new Date(purchase.timestamp);
        return isSameDay(purchaseDate, date);
      });
    }
    
    return purchases;
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const id = await this.getNextId('purchaseId');
    
    const newPurchase: Purchase = {
      ...purchase,
      id,
      timestamp: new Date(),
    };
    
    await database.ref(`users/${purchase.userId}/purchases/${id}`).set(newPurchase);
    return newPurchase;
  }

  async deletePurchase(id: number): Promise<boolean> {
    // Find which user this purchase belongs to
    const purchasesRef = database.ref('users');
    const snapshot = await purchasesRef.orderByChild(`purchases/${id}/id`).equalTo(id).once('value');
    
    if (!snapshot.exists()) return false;
    
    // Extract user ID from the first matching record
    const userEntries = Object.entries(snapshot.val());
    if (userEntries.length === 0) return false;
    
    const [userId] = userEntries[0];
    
    await database.ref(`users/${userId}/purchases/${id}`).remove();
    return true;
  }

  // Retail Sales operations
  async getRetailSales(userId: number, date?: Date): Promise<RetailSale[]> {
    const snapshot = await database.ref(getRefPath(userId, 'retailSales')).once('value');
    let sales = objectToArray<RetailSale>(snapshot.val());
    
    if (date) {
      // Filter by date
      sales = sales.filter(sale => {
        const saleDate = new Date(sale.timestamp);
        return isSameDay(saleDate, date);
      });
    }
    
    return sales;
  }

  async createRetailSale(sale: InsertRetailSale): Promise<RetailSale> {
    const id = await this.getNextId('retailSaleId');
    
    const newSale: RetailSale = {
      ...sale,
      id,
      timestamp: new Date(),
    };
    
    await database.ref(`users/${sale.userId}/retailSales/${id}`).set(newSale);
    return newSale;
  }

  async deleteRetailSale(id: number): Promise<boolean> {
    // Find which user this retail sale belongs to
    const salesRef = database.ref('users');
    const snapshot = await salesRef.orderByChild(`retailSales/${id}/id`).equalTo(id).once('value');
    
    if (!snapshot.exists()) return false;
    
    // Extract user ID from the first matching record
    const userEntries = Object.entries(snapshot.val());
    if (userEntries.length === 0) return false;
    
    const [userId] = userEntries[0];
    
    await database.ref(`users/${userId}/retailSales/${id}`).remove();
    return true;
  }

  // Hotel operations
  async getHotels(userId: number): Promise<Hotel[]> {
    const snapshot = await database.ref(getRefPath(userId, 'hotels')).once('value');
    return objectToArray<Hotel>(snapshot.val());
  }

  async getHotel(id: number): Promise<Hotel | undefined> {
    // Find which user this hotel belongs to
    const hotelsRef = database.ref('users');
    const snapshot = await hotelsRef.orderByChild(`hotels/${id}/id`).equalTo(id).once('value');
    
    if (!snapshot.exists()) return undefined;
    
    // Extract hotel from the first matching user
    const userEntries = Object.entries(snapshot.val());
    if (userEntries.length === 0) return undefined;
    
    const [, userData] = userEntries[0];
    return (userData as any).hotels[id] as Hotel;
  }

  async createHotel(hotel: InsertHotel): Promise<Hotel> {
    const id = await this.getNextId('hotelId');
    
    const newHotel: Hotel = {
      ...hotel,
      id,
      createdAt: new Date(),
    };
    
    await database.ref(`users/${hotel.userId}/hotels/${id}`).set(newHotel);
    return newHotel;
  }

  async updateHotel(id: number, hotel: Partial<InsertHotel>): Promise<Hotel | undefined> {
    const existingHotel = await this.getHotel(id);
    if (!existingHotel) return undefined;
    
    const updatedHotel: Hotel = {
      ...existingHotel,
      ...hotel,
      id, // Ensure ID doesn't change
    };
    
    await database.ref(`users/${existingHotel.userId}/hotels/${id}`).set(updatedHotel);
    return updatedHotel;
  }

  async deleteHotel(id: number): Promise<boolean> {
    const hotel = await this.getHotel(id);
    if (!hotel) return false;
    
    await database.ref(`users/${hotel.userId}/hotels/${id}`).remove();
    return true;
  }

  // Product operations
  async getProducts(userId: number): Promise<Product[]> {
    const snapshot = await database.ref(getRefPath(userId, 'products')).once('value');
    return objectToArray<Product>(snapshot.val());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    // Find which user this product belongs to
    const productsRef = database.ref('users');
    const snapshot = await productsRef.orderByChild(`products/${id}/id`).equalTo(id).once('value');
    
    if (!snapshot.exists()) return undefined;
    
    // Extract product from the first matching user
    const userEntries = Object.entries(snapshot.val());
    if (userEntries.length === 0) return undefined;
    
    const [, userData] = userEntries[0];
    return (userData as any).products[id] as Product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = await this.getNextId('productId');
    
    const newProduct: Product = {
      ...product,
      id,
      createdAt: new Date(),
    };
    
    await database.ref(`users/${product.userId}/products/${id}`).set(newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = await this.getProduct(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct: Product = {
      ...existingProduct,
      ...product,
      id, // Ensure ID doesn't change
    };
    
    await database.ref(`users/${existingProduct.userId}/products/${id}`).set(updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const product = await this.getProduct(id);
    if (!product) return false;
    
    await database.ref(`users/${product.userId}/products/${id}`).remove();
    return true;
  }

  // Product Part operations
  async getProductParts(userId: number): Promise<ProductPart[]> {
    const snapshot = await database.ref(getRefPath(userId, 'productParts')).once('value');
    return objectToArray<ProductPart>(snapshot.val());
  }

  async getProductPart(id: number): Promise<ProductPart | undefined> {
    // Find which user this product part belongs to
    const partsRef = database.ref('users');
    const snapshot = await partsRef.orderByChild(`productParts/${id}/id`).equalTo(id).once('value');
    
    if (!snapshot.exists()) return undefined;
    
    // Extract product part from the first matching user
    const userEntries = Object.entries(snapshot.val());
    if (userEntries.length === 0) return undefined;
    
    const [, userData] = userEntries[0];
    return (userData as any).productParts[id] as ProductPart;
  }

  async createProductPart(part: InsertProductPart): Promise<ProductPart> {
    const id = await this.getNextId('productPartId');
    
    const newPart: ProductPart = {
      ...part,
      id,
      createdAt: new Date(),
    };
    
    await database.ref(`users/${part.userId}/productParts/${id}`).set(newPart);
    return newPart;
  }

  async updateProductPart(id: number, part: Partial<InsertProductPart>): Promise<ProductPart | undefined> {
    const existingPart = await this.getProductPart(id);
    if (!existingPart) return undefined;
    
    const updatedPart: ProductPart = {
      ...existingPart,
      ...part,
      id, // Ensure ID doesn't change
    };
    
    await database.ref(`users/${existingPart.userId}/productParts/${id}`).set(updatedPart);
    return updatedPart;
  }

  async deleteProductPart(id: number): Promise<boolean> {
    const part = await this.getProductPart(id);
    if (!part) return false;
    
    await database.ref(`users/${part.userId}/productParts/${id}`).remove();
    return true;
  }

  // Hotel Sales operations
  async getHotelSales(userId: number, date?: Date): Promise<HotelSale[]> {
    const snapshot = await database.ref(getRefPath(userId, 'hotelSales')).once('value');
    let sales = objectToArray<HotelSale>(snapshot.val());
    
    if (date) {
      // Filter by date
      sales = sales.filter(sale => {
        const saleDate = new Date(sale.timestamp);
        return isSameDay(saleDate, date);
      });
    }
    
    // Get the hotel sale items for each sale
    for (const sale of sales) {
      const itemsSnapshot = await database.ref(getRefPath(userId, `hotelSaleItems/${sale.id}`)).once('value');
      sale.items = objectToArray<HotelSaleItem>(itemsSnapshot.val()) || [];
    }
    
    return sales;
  }

  async createHotelSale(sale: InsertHotelSale): Promise<HotelSale> {
    const id = await this.getNextId('hotelSaleId');
    
    // Create the hotel sale
    const { items, ...saleData } = sale;
    const newSale: HotelSale = {
      ...saleData,
      id,
      timestamp: new Date(),
      items: [], // Will be populated below
    };
    
    // Save the hotel sale
    await database.ref(`users/${sale.userId}/hotelSales/${id}`).set({
      ...newSale,
      items: null, // Don't store items directly in the sale
    });
    
    // Create and save each item
    const savedItems: HotelSaleItem[] = [];
    if (items && items.length > 0) {
      for (const item of items) {
        const itemId = await this.getNextId('hotelSaleItemId');
        const newItem: HotelSaleItem = {
          ...item,
          id: itemId,
          saleId: id,
        };
        
        await database.ref(`users/${sale.userId}/hotelSaleItems/${id}/${itemId}`).set(newItem);
        savedItems.push(newItem);
      }
    }
    
    // Return the complete sale with items
    newSale.items = savedItems;
    return newSale;
  }

  async deleteHotelSale(id: number): Promise<boolean> {
    // Find which user this hotel sale belongs to
    const salesRef = database.ref('users');
    const snapshot = await salesRef.orderByChild(`hotelSales/${id}/id`).equalTo(id).once('value');
    
    if (!snapshot.exists()) return false;
    
    // Extract user ID from the first matching record
    const userEntries = Object.entries(snapshot.val());
    if (userEntries.length === 0) return false;
    
    const [userId] = userEntries[0];
    
    // Delete the hotel sale items first
    await database.ref(`users/${userId}/hotelSaleItems/${id}`).remove();
    
    // Then delete the hotel sale
    await database.ref(`users/${userId}/hotelSales/${id}`).remove();
    return true;
  }

  // Vendor Payment operations
  async getVendorPayments(userId: number, vendorId?: number, date?: Date): Promise<VendorPayment[]> {
    const snapshot = await database.ref(getRefPath(userId, 'vendorPayments')).once('value');
    let payments = objectToArray<VendorPayment>(snapshot.val());
    
    // Apply filters
    if (vendorId !== undefined) {
      payments = payments.filter(payment => payment.vendorId === vendorId);
    }
    
    if (date) {
      payments = payments.filter(payment => {
        const paymentDate = new Date(payment.timestamp);
        return isSameDay(paymentDate, date);
      });
    }
    
    return payments;
  }

  async getVendorPaymentById(id: number): Promise<VendorPayment | undefined> {
    // Find which user this payment belongs to
    const paymentsRef = database.ref('users');
    const snapshot = await paymentsRef.orderByChild(`vendorPayments/${id}/id`).equalTo(id).once('value');
    
    if (!snapshot.exists()) return undefined;
    
    // Extract payment from the first matching user
    const userEntries = Object.entries(snapshot.val());
    if (userEntries.length === 0) return undefined;
    
    const [, userData] = userEntries[0];
    return (userData as any).vendorPayments[id] as VendorPayment;
  }

  async createVendorPayment(payment: InsertVendorPayment): Promise<VendorPayment> {
    const id = await this.getNextId('vendorPaymentId');
    
    const newPayment: VendorPayment = {
      ...payment,
      id,
      timestamp: new Date(),
    };
    
    await database.ref(`users/${payment.userId}/vendorPayments/${id}`).set(newPayment);
    return newPayment;
  }

  async deleteVendorPayment(id: number): Promise<boolean> {
    const payment = await this.getVendorPaymentById(id);
    if (!payment) return false;
    
    await database.ref(`users/${payment.userId}/vendorPayments/${id}`).remove();
    return true;
  }

  // Report operations
  async getDailySummary(userId: number, date: Date): Promise<DailySummary> {
    // Get all data for the specified date
    const purchases = await this.getPurchases(userId, date);
    const retailSales = await this.getRetailSales(userId, date);
    const hotelSales = await this.getHotelSales(userId, date);
    const vendorPayments = await this.getVendorPayments(userId, undefined, date);
    
    // Calculate totals
    const totalPurchasedKg = purchases.reduce((sum, p) => sum + parseFloat(p.quantityKg), 0);
    const totalPurchaseCost = purchases.reduce((sum, p) => sum + parseFloat(p.total), 0);
    
    const totalRetailSalesKg = retailSales.reduce((sum, s) => sum + parseFloat(s.quantityKg), 0);
    const totalRetailSalesRevenue = retailSales.reduce((sum, s) => sum + parseFloat(s.total), 0);
    const totalRetailProfit = totalRetailSalesRevenue - (totalRetailSalesKg / totalPurchasedKg) * totalPurchaseCost;
    
    // For hotel sales, we need to calculate the total from items
    let totalHotelSalesKg = 0;
    let totalHotelSalesRevenue = 0;
    
    for (const sale of hotelSales) {
      // Sum up the quantity and total from each item
      if (sale.items && sale.items.length > 0) {
        for (const item of sale.items) {
          totalHotelSalesKg += parseFloat(item.quantityKg);
          totalHotelSalesRevenue += parseFloat(item.total);
        }
      }
    }
    
    const totalHotelProfit = totalHotelSalesRevenue - (totalHotelSalesKg / totalPurchasedKg) * totalPurchaseCost;
    
    const totalSoldKg = totalRetailSalesKg + totalHotelSalesKg;
    const remainingKg = totalPurchasedKg - totalSoldKg;
    
    const totalVendorPayments = vendorPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    const netProfit = totalRetailProfit + totalHotelProfit - totalVendorPayments;
    
    // Prepare transactions list for the timeline
    const transactions: Transaction[] = [
      ...purchases.map(p => ({
        id: p.id,
        type: 'purchase' as const,
        details: `Purchase from ${p.vendorId}`,
        quantityKg: parseFloat(p.quantityKg),
        ratePerKg: parseFloat(p.ratePerKg),
        total: parseFloat(p.total),
        timestamp: new Date(p.timestamp),
        meatType: p.meatType,
        productCut: p.productCut,
      })),
      ...retailSales.map(s => ({
        id: s.id,
        type: 'retail' as const,
        details: `Retail sale`,
        quantityKg: parseFloat(s.quantityKg),
        ratePerKg: parseFloat(s.ratePerKg),
        total: parseFloat(s.total),
        timestamp: new Date(s.timestamp),
        meatType: s.meatType,
        productCut: s.productCut,
      })),
      ...hotelSales.flatMap(s => s.items ? s.items.map(item => ({
        id: item.id,
        type: 'hotel' as const,
        details: `Sale to hotel ${s.hotelId}, Bill: ${s.billNumber}`,
        quantityKg: parseFloat(item.quantityKg),
        ratePerKg: parseFloat(item.ratePerKg),
        total: parseFloat(item.total),
        timestamp: new Date(s.timestamp),
        meatType: item.meatType,
        productCut: item.productCut,
      })) : []),
      ...vendorPayments.map(p => ({
        id: p.id,
        type: 'payment' as const,
        details: `Payment to vendor ${p.vendorId}`,
        quantityKg: 0,
        ratePerKg: 0,
        total: parseFloat(p.amount),
        timestamp: new Date(p.timestamp),
        meatType: p.meatType || '',
        productCut: p.productCut || '',
      }))
    ];
    
    // Sort transactions by timestamp
    transactions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Calculate inventory by meat type and product cut
    const inventory: Record<string, Record<string, ProductInventory>> = {};
    
    // Process purchases
    for (const p of purchases) {
      const key = `${p.meatType}-${p.productCut}`;
      if (!inventory[key]) {
        inventory[key] = {
          meatType: p.meatType,
          productCut: p.productCut,
          purchasedKg: 0,
          soldKg: 0,
          remainingKg: 0,
          avgCostPerKg: 0,
        };
      }
      
      const item = inventory[key];
      const currentCost = item.purchasedKg * item.avgCostPerKg;
      const additionalCost = parseFloat(p.quantityKg) * parseFloat(p.ratePerKg);
      const newQuantity = item.purchasedKg + parseFloat(p.quantityKg);
      
      item.purchasedKg = newQuantity;
      item.avgCostPerKg = (currentCost + additionalCost) / newQuantity;
      item.remainingKg = item.purchasedKg - item.soldKg;
    }
    
    // Process retail sales
    for (const s of retailSales) {
      const key = `${s.meatType}-${s.productCut}`;
      if (inventory[key]) {
        const item = inventory[key];
        item.soldKg += parseFloat(s.quantityKg);
        item.remainingKg = item.purchasedKg - item.soldKg;
      }
    }
    
    // Process hotel sale items
    for (const sale of hotelSales) {
      if (sale.items) {
        for (const item of sale.items) {
          const key = `${item.meatType}-${item.productCut}`;
          if (inventory[key]) {
            const invItem = inventory[key];
            invItem.soldKg += parseFloat(item.quantityKg);
            invItem.remainingKg = invItem.purchasedKg - invItem.soldKg;
          }
        }
      }
    }
    
    // Convert inventory object to array
    const inventoryArray = Object.values(inventory);
    
    // Return the complete daily summary
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
      vendorPayments: totalVendorPayments,
      transactions,
      inventory: inventoryArray,
    };
  }

  async getDateRangeSummary(userId: number, startDate: Date, endDate: Date): Promise<DailySummary[]> {
    const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const summaries: DailySummary[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const summary = await this.getDailySummary(userId, date);
      summaries.push(summary);
    }
    
    return summaries;
  }
}

export const realtimeDBStorage = new RealtimeDBStorage();