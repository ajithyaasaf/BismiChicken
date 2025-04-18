import { 
  database, 
  ref, 
  get, 
  set, 
  push, 
  update, 
  remove, 
  query, 
  orderByChild, 
  equalTo, 
  snapshotToArray,
  getRefPath
} from './firebase-client';

import { IStorage } from './storage';
import {
  User, InsertUser,
  Vendor, InsertVendor,
  Purchase, InsertPurchase,
  RetailSale, InsertRetailSale,
  HotelSale, InsertHotelSale, HotelSaleItem, InsertHotelSaleItem,
  VendorPayment, InsertVendorPayment,
  Hotel, InsertHotel,
  Product, InsertProduct,
  ProductPart, InsertProductPart,
  Transaction, ProductInventory, DailySummary
} from '../shared/schema';

// Utility to parse date into a comparable format for filtering
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export class FirebaseDBStorage implements IStorage {
  private countersRef = ref(database, 'counters');
  
  // Counter to generate unique IDs
  private nextIds = {
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

  constructor() {
    // Initialize counters
    this.initializeCounters();
  }

  private async initializeCounters() {
    try {
      const snapshot = await get(this.countersRef);
      if (snapshot.exists()) {
        // Load existing counters
        const counters = snapshot.val();
        Object.assign(this.nextIds, counters);
      } else {
        // Initialize counters if they don't exist
        await set(this.countersRef, this.nextIds);
      }
    } catch (error) {
      console.error('Failed to initialize counters:', error);
    }
  }

  private async getNextId(type: keyof typeof this.nextIds): Promise<number> {
    const id = this.nextIds[type];
    this.nextIds[type] += 1;
    
    // Update the counter in Firebase
    try {
      const counterRef = ref(database, `counters/${type}`);
      await set(counterRef, this.nextIds[type]);
    } catch (error) {
      console.error(`Failed to update ${type} counter:`, error);
    }
    
    return id;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const userRef = ref(database, `users/${id}/profile`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        return snapshot.val() as User;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      // Query all users
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (!snapshot.exists()) return undefined;
      
      // Manual search for a user with matching email
      const users = snapshot.val();
      for (const userId in users) {
        const user = users[userId].profile;
        if (user && user.email === email) {
          return user as User;
        }
      }
      
      return undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async getUserByFirebaseId(firebaseId: string): Promise<User | undefined> {
    try {
      // Query all users
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (!snapshot.exists()) return undefined;
      
      // Manual search for a user with matching firebaseId
      const users = snapshot.val();
      for (const userId in users) {
        const user = users[userId].profile;
        if (user && user.firebaseId === firebaseId) {
          return user as User;
        }
      }
      
      return undefined;
    } catch (error) {
      console.error('Error getting user by firebaseId:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const id = await this.getNextId('userId');
      
      const newUser: User = {
        ...user,
        id
      };
      
      const userRef = ref(database, `users/${id}/profile`);
      await set(userRef, newUser);
      
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Vendor operations
  async getVendors(userId: number): Promise<Vendor[]> {
    try {
      const vendorsRef = ref(database, getRefPath(userId, 'vendors'));
      const snapshot = await get(vendorsRef);
      
      return snapshotToArray<Vendor>(snapshot);
    } catch (error) {
      console.error('Error getting vendors:', error);
      return [];
    }
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    try {
      // Query all users to find which user owns this vendor
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (!snapshot.exists()) return undefined;
      
      // Search through each user's vendors
      const users = snapshot.val();
      for (const userId in users) {
        const vendors = users[userId].vendors;
        if (vendors && vendors[id]) {
          return vendors[id] as Vendor;
        }
      }
      
      return undefined;
    } catch (error) {
      console.error('Error getting vendor:', error);
      return undefined;
    }
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    try {
      const id = await this.getNextId('vendorId');
      
      const newVendor: Vendor = {
        ...vendor,
        id
      };
      
      const vendorRef = ref(database, `users/${vendor.userId}/vendors/${id}`);
      await set(vendorRef, newVendor);
      
      return newVendor;
    } catch (error) {
      console.error('Error creating vendor:', error);
      throw error;
    }
  }

  async updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined> {
    try {
      const existingVendor = await this.getVendor(id);
      if (!existingVendor) return undefined;
      
      const updatedVendor: Vendor = {
        ...existingVendor,
        ...vendor,
        id // Ensure ID doesn't change
      };
      
      const vendorRef = ref(database, `users/${existingVendor.userId}/vendors/${id}`);
      await set(vendorRef, updatedVendor);
      
      return updatedVendor;
    } catch (error) {
      console.error('Error updating vendor:', error);
      return undefined;
    }
  }

  async deleteVendor(id: number): Promise<boolean> {
    try {
      const vendor = await this.getVendor(id);
      if (!vendor) return false;
      
      const vendorRef = ref(database, `users/${vendor.userId}/vendors/${id}`);
      await remove(vendorRef);
      
      return true;
    } catch (error) {
      console.error('Error deleting vendor:', error);
      return false;
    }
  }

  // Purchase operations
  async getPurchases(userId: number, date?: Date): Promise<Purchase[]> {
    try {
      const purchasesRef = ref(database, getRefPath(userId, 'purchases'));
      const snapshot = await get(purchasesRef);
      
      let purchases = snapshotToArray<Purchase>(snapshot);
      
      if (date) {
        // Filter by date
        purchases = purchases.filter(purchase => {
          const purchaseDate = new Date(purchase.timestamp);
          return isSameDay(purchaseDate, date);
        });
      }
      
      return purchases;
    } catch (error) {
      console.error('Error getting purchases:', error);
      return [];
    }
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    try {
      const id = await this.getNextId('purchaseId');
      
      const newPurchase: Purchase = {
        ...purchase,
        id,
        timestamp: new Date(),
        meatType: purchase.meatType || '', // Ensure meatType is not undefined
        productCut: purchase.productCut || '', // Ensure productCut is not undefined
        partId: purchase.partId || null // Ensure partId is not undefined
      };
      
      const purchaseRef = ref(database, `users/${purchase.userId}/purchases/${id}`);
      await set(purchaseRef, newPurchase);
      
      return newPurchase;
    } catch (error) {
      console.error('Error creating purchase:', error);
      throw error;
    }
  }

  async deletePurchase(id: number): Promise<boolean> {
    try {
      // Query all users to find which user owns this purchase
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (!snapshot.exists()) return false;
      
      // Search through each user's purchases
      const users = snapshot.val();
      for (const userId in users) {
        const purchases = users[userId].purchases;
        if (purchases && purchases[id]) {
          const purchaseRef = ref(database, `users/${userId}/purchases/${id}`);
          await remove(purchaseRef);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting purchase:', error);
      return false;
    }
  }

  // Retail Sales operations
  async getRetailSales(userId: number, date?: Date): Promise<RetailSale[]> {
    try {
      const salesRef = ref(database, getRefPath(userId, 'retailSales'));
      const snapshot = await get(salesRef);
      
      let sales = snapshotToArray<RetailSale>(snapshot);
      
      if (date) {
        // Filter by date
        sales = sales.filter(sale => {
          const saleDate = new Date(sale.timestamp);
          return isSameDay(saleDate, date);
        });
      }
      
      return sales;
    } catch (error) {
      console.error('Error getting retail sales:', error);
      return [];
    }
  }

  async createRetailSale(sale: InsertRetailSale): Promise<RetailSale> {
    try {
      const id = await this.getNextId('retailSaleId');
      
      const newSale: RetailSale = {
        ...sale,
        id,
        timestamp: new Date(),
        meatType: sale.meatType || '', // Ensure meatType is not undefined
        productCut: sale.productCut || '', // Ensure productCut is not undefined
        partId: sale.partId || null // Ensure partId is not undefined
      };
      
      const saleRef = ref(database, `users/${sale.userId}/retailSales/${id}`);
      await set(saleRef, newSale);
      
      return newSale;
    } catch (error) {
      console.error('Error creating retail sale:', error);
      throw error;
    }
  }

  async deleteRetailSale(id: number): Promise<boolean> {
    try {
      // Query all users to find which user owns this sale
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (!snapshot.exists()) return false;
      
      // Search through each user's retail sales
      const users = snapshot.val();
      for (const userId in users) {
        const sales = users[userId].retailSales;
        if (sales && sales[id]) {
          const saleRef = ref(database, `users/${userId}/retailSales/${id}`);
          await remove(saleRef);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting retail sale:', error);
      return false;
    }
  }

  // Hotel operations
  async getHotels(userId: number): Promise<Hotel[]> {
    try {
      const hotelsRef = ref(database, getRefPath(userId, 'hotels'));
      const snapshot = await get(hotelsRef);
      
      return snapshotToArray<Hotel>(snapshot);
    } catch (error) {
      console.error('Error getting hotels:', error);
      return [];
    }
  }

  async getHotel(id: number): Promise<Hotel | undefined> {
    try {
      // Query all users to find which user owns this hotel
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (!snapshot.exists()) return undefined;
      
      // Search through each user's hotels
      const users = snapshot.val();
      for (const userId in users) {
        const hotels = users[userId].hotels;
        if (hotels && hotels[id]) {
          return hotels[id] as Hotel;
        }
      }
      
      return undefined;
    } catch (error) {
      console.error('Error getting hotel:', error);
      return undefined;
    }
  }

  async createHotel(hotel: InsertHotel): Promise<Hotel> {
    try {
      const id = await this.getNextId('hotelId');
      
      const newHotel: Hotel = {
        ...hotel,
        id
      };
      
      const hotelRef = ref(database, `users/${hotel.userId}/hotels/${id}`);
      await set(hotelRef, newHotel);
      
      return newHotel;
    } catch (error) {
      console.error('Error creating hotel:', error);
      throw error;
    }
  }

  async updateHotel(id: number, hotel: Partial<InsertHotel>): Promise<Hotel | undefined> {
    try {
      const existingHotel = await this.getHotel(id);
      if (!existingHotel) return undefined;
      
      const updatedHotel: Hotel = {
        ...existingHotel,
        ...hotel,
        id // Ensure ID doesn't change
      };
      
      const hotelRef = ref(database, `users/${existingHotel.userId}/hotels/${id}`);
      await set(hotelRef, updatedHotel);
      
      return updatedHotel;
    } catch (error) {
      console.error('Error updating hotel:', error);
      return undefined;
    }
  }

  async deleteHotel(id: number): Promise<boolean> {
    try {
      const hotel = await this.getHotel(id);
      if (!hotel) return false;
      
      const hotelRef = ref(database, `users/${hotel.userId}/hotels/${id}`);
      await remove(hotelRef);
      
      return true;
    } catch (error) {
      console.error('Error deleting hotel:', error);
      return false;
    }
  }

  // Product operations
  async getProducts(userId: number): Promise<Product[]> {
    try {
      const productsRef = ref(database, getRefPath(userId, 'products'));
      const snapshot = await get(productsRef);
      
      return snapshotToArray<Product>(snapshot);
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  async getProduct(id: number): Promise<Product | undefined> {
    try {
      // Query all users to find which user owns this product
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (!snapshot.exists()) return undefined;
      
      // Search through each user's products
      const users = snapshot.val();
      for (const userId in users) {
        const products = users[userId].products;
        if (products && products[id]) {
          return products[id] as Product;
        }
      }
      
      return undefined;
    } catch (error) {
      console.error('Error getting product:', error);
      return undefined;
    }
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    try {
      const id = await this.getNextId('productId');
      
      const newProduct: Product = {
        ...product,
        id
      };
      
      const productRef = ref(database, `users/${product.userId}/products/${id}`);
      await set(productRef, newProduct);
      
      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    try {
      const existingProduct = await this.getProduct(id);
      if (!existingProduct) return undefined;
      
      const updatedProduct: Product = {
        ...existingProduct,
        ...product,
        id // Ensure ID doesn't change
      };
      
      const productRef = ref(database, `users/${existingProduct.userId}/products/${id}`);
      await set(productRef, updatedProduct);
      
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      return undefined;
    }
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      const product = await this.getProduct(id);
      if (!product) return false;
      
      const productRef = ref(database, `users/${product.userId}/products/${id}`);
      await remove(productRef);
      
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  // Product Part operations
  async getProductParts(userId: number): Promise<ProductPart[]> {
    try {
      const partsRef = ref(database, getRefPath(userId, 'productParts'));
      const snapshot = await get(partsRef);
      
      return snapshotToArray<ProductPart>(snapshot);
    } catch (error) {
      console.error('Error getting product parts:', error);
      return [];
    }
  }

  async getProductPart(id: number): Promise<ProductPart | undefined> {
    try {
      // Query all users to find which user owns this product part
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (!snapshot.exists()) return undefined;
      
      // Search through each user's product parts
      const users = snapshot.val();
      for (const userId in users) {
        const parts = users[userId].productParts;
        if (parts && parts[id]) {
          return parts[id] as ProductPart;
        }
      }
      
      return undefined;
    } catch (error) {
      console.error('Error getting product part:', error);
      return undefined;
    }
  }

  async createProductPart(part: InsertProductPart): Promise<ProductPart> {
    try {
      const id = await this.getNextId('productPartId');
      
      const newPart: ProductPart = {
        ...part,
        id
      };
      
      const partRef = ref(database, `users/${part.userId}/productParts/${id}`);
      await set(partRef, newPart);
      
      return newPart;
    } catch (error) {
      console.error('Error creating product part:', error);
      throw error;
    }
  }

  async updateProductPart(id: number, part: Partial<InsertProductPart>): Promise<ProductPart | undefined> {
    try {
      const existingPart = await this.getProductPart(id);
      if (!existingPart) return undefined;
      
      const updatedPart: ProductPart = {
        ...existingPart,
        ...part,
        id // Ensure ID doesn't change
      };
      
      const partRef = ref(database, `users/${existingPart.userId}/productParts/${id}`);
      await set(partRef, updatedPart);
      
      return updatedPart;
    } catch (error) {
      console.error('Error updating product part:', error);
      return undefined;
    }
  }

  async deleteProductPart(id: number): Promise<boolean> {
    try {
      const part = await this.getProductPart(id);
      if (!part) return false;
      
      const partRef = ref(database, `users/${part.userId}/productParts/${id}`);
      await remove(partRef);
      
      return true;
    } catch (error) {
      console.error('Error deleting product part:', error);
      return false;
    }
  }

  // Hotel Sales operations
  async getHotelSales(userId: number, date?: Date): Promise<HotelSale[]> {
    try {
      const salesRef = ref(database, getRefPath(userId, 'hotelSales'));
      const salesSnapshot = await get(salesRef);
      
      let sales = snapshotToArray<HotelSale>(salesSnapshot);
      
      if (date) {
        // Filter by date
        sales = sales.filter(sale => {
          const saleDate = new Date(sale.timestamp);
          return isSameDay(saleDate, date);
        });
      }
      
      // Get the items for each sale
      for (const sale of sales) {
        const itemsRef = ref(database, getRefPath(userId, `hotelSaleItems/${sale.id}`));
        const itemsSnapshot = await get(itemsRef);
        sale.items = snapshotToArray<HotelSaleItem>(itemsSnapshot);
      }
      
      return sales;
    } catch (error) {
      console.error('Error getting hotel sales:', error);
      return [];
    }
  }

  async createHotelSale(sale: InsertHotelSale): Promise<HotelSale> {
    try {
      const id = await this.getNextId('hotelSaleId');
      
      // Extract items from the sale data
      const { items, ...saleData } = sale;
      
      // Create the hotel sale
      const newSale: HotelSale = {
        ...saleData,
        id,
        timestamp: new Date(),
        meatType: sale.meatType || '', // Ensure meatType is not undefined
        productCut: sale.productCut || '', // Ensure productCut is not undefined
        isPaid: sale.isPaid ?? false, // Ensure isPaid is not undefined
        items: [] // Will be populated below
      };
      
      // Save the hotel sale
      const saleRef = ref(database, `users/${sale.userId}/hotelSales/${id}`);
      await set(saleRef, {
        ...newSale,
        items: null // Don't store items directly in the sale
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
            meatType: item.meatType || '', // Ensure meatType is not undefined
            productCut: item.productCut || '', // Ensure productCut is not undefined
          };
          
          const itemRef = ref(database, `users/${sale.userId}/hotelSaleItems/${id}/${itemId}`);
          await set(itemRef, newItem);
          savedItems.push(newItem);
        }
      }
      
      // Return the complete sale with items
      newSale.items = savedItems;
      return newSale;
    } catch (error) {
      console.error('Error creating hotel sale:', error);
      throw error;
    }
  }

  async deleteHotelSale(id: number): Promise<boolean> {
    try {
      // Query all users to find which user owns this hotel sale
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (!snapshot.exists()) return false;
      
      // Search through each user's hotel sales
      const users = snapshot.val();
      for (const userId in users) {
        const sales = users[userId].hotelSales;
        if (sales && sales[id]) {
          // Delete the hotel sale items first
          const itemsRef = ref(database, `users/${userId}/hotelSaleItems/${id}`);
          await remove(itemsRef);
          
          // Then delete the hotel sale
          const saleRef = ref(database, `users/${userId}/hotelSales/${id}`);
          await remove(saleRef);
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting hotel sale:', error);
      return false;
    }
  }

  // Vendor Payment operations
  async getVendorPayments(userId: number, vendorId?: number, date?: Date): Promise<VendorPayment[]> {
    try {
      const paymentsRef = ref(database, getRefPath(userId, 'vendorPayments'));
      const snapshot = await get(paymentsRef);
      
      let payments = snapshotToArray<VendorPayment>(snapshot);
      
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
    } catch (error) {
      console.error('Error getting vendor payments:', error);
      return [];
    }
  }

  async getVendorPaymentById(id: number): Promise<VendorPayment | undefined> {
    try {
      // Query all users to find which user owns this payment
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (!snapshot.exists()) return undefined;
      
      // Search through each user's vendor payments
      const users = snapshot.val();
      for (const userId in users) {
        const payments = users[userId].vendorPayments;
        if (payments && payments[id]) {
          return payments[id] as VendorPayment;
        }
      }
      
      return undefined;
    } catch (error) {
      console.error('Error getting vendor payment by ID:', error);
      return undefined;
    }
  }

  async createVendorPayment(payment: InsertVendorPayment): Promise<VendorPayment> {
    try {
      const id = await this.getNextId('vendorPaymentId');
      
      const newPayment: VendorPayment = {
        ...payment,
        id,
        timestamp: new Date(),
        meatType: payment.meatType || '', // Ensure meatType is not undefined
        productCut: payment.productCut || '', // Ensure productCut is not undefined
        notes: payment.notes || null // Ensure notes is not undefined
      };
      
      // Record the payment
      const paymentRef = ref(database, `users/${payment.userId}/vendorPayments/${id}`);
      await set(paymentRef, newPayment);
      
      // Update vendor balance
      const vendor = await this.getVendor(payment.vendorId);
      if (vendor) {
        // Parse current balance, subtract payment amount, and ensure it's properly formatted
        const currentBalance = parseFloat(vendor.balance.toString());
        const paymentAmount = parseFloat(payment.amount.toString());
        const newBalance = (currentBalance - paymentAmount).toString();
        
        // Update vendor with new balance
        await this.updateVendor(payment.vendorId, {
          ...vendor,
          balance: newBalance
        });
      }
      
      return newPayment;
    } catch (error) {
      console.error('Error creating vendor payment:', error);
      throw error;
    }
  }

  async deleteVendorPayment(id: number): Promise<boolean> {
    try {
      const payment = await this.getVendorPaymentById(id);
      if (!payment) return false;
      
      // Update vendor balance - add the payment amount back
      const vendor = await this.getVendor(payment.vendorId);
      if (vendor) {
        // Parse current balance, add back payment amount, and ensure it's properly formatted
        const currentBalance = parseFloat(vendor.balance.toString());
        const paymentAmount = parseFloat(payment.amount.toString());
        const newBalance = (currentBalance + paymentAmount).toString();
        
        // Update vendor with new balance
        await this.updateVendor(payment.vendorId, {
          ...vendor,
          balance: newBalance
        });
      }
      
      // Delete the payment
      const paymentRef = ref(database, `users/${payment.userId}/vendorPayments/${id}`);
      await remove(paymentRef);
      
      return true;
    } catch (error) {
      console.error('Error deleting vendor payment:', error);
      return false;
    }
  }

  // Report operations
  async getDailySummary(userId: number, date: Date): Promise<DailySummary> {
    try {
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
      const totalRetailProfit = totalRetailSalesRevenue - (totalRetailSalesKg / (totalPurchasedKg || 1)) * totalPurchaseCost;
      
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
      
      const totalHotelProfit = totalHotelSalesRevenue - (totalHotelSalesKg / (totalPurchasedKg || 1)) * totalPurchaseCost;
      
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
          meatType: p.meatType,
          productCut: p.productCut,
        }))
      ];
      
      // Sort transactions by timestamp
      transactions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      // Calculate inventory by meat type and product cut
      const inventoryMap = new Map<string, ProductInventory>();
      
      // Process purchases
      for (const p of purchases) {
        const key = `${p.meatType}-${p.productCut}`;
        let item = inventoryMap.get(key);
        
        if (!item) {
          item = {
            meatType: p.meatType,
            productCut: p.productCut,
            purchasedKg: 0,
            soldKg: 0,
            remainingKg: 0,
            avgCostPerKg: 0,
          };
          inventoryMap.set(key, item);
        }
        
        const currentCost = item.purchasedKg * item.avgCostPerKg;
        const additionalCost = parseFloat(p.quantityKg) * parseFloat(p.ratePerKg);
        const newQuantity = item.purchasedKg + parseFloat(p.quantityKg);
        
        item.purchasedKg = newQuantity;
        item.avgCostPerKg = newQuantity > 0 ? (currentCost + additionalCost) / newQuantity : 0;
        item.remainingKg = item.purchasedKg - item.soldKg;
      }
      
      // Process retail sales
      for (const s of retailSales) {
        const key = `${s.meatType}-${s.productCut}`;
        const item = inventoryMap.get(key);
        
        if (item) {
          item.soldKg += parseFloat(s.quantityKg);
          item.remainingKg = item.purchasedKg - item.soldKg;
        }
      }
      
      // Process hotel sale items
      for (const sale of hotelSales) {
        if (sale.items) {
          for (const item of sale.items) {
            const key = `${item.meatType}-${item.productCut}`;
            const invItem = inventoryMap.get(key);
            
            if (invItem) {
              invItem.soldKg += parseFloat(item.quantityKg);
              invItem.remainingKg = invItem.purchasedKg - invItem.soldKg;
            }
          }
        }
      }
      
      // Convert inventory Map to array
      const inventoryArray = Array.from(inventoryMap.values());
      
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
    } catch (error) {
      console.error('Error getting daily summary:', error);
      
      // Return empty summary
      return {
        date,
        totalPurchasedKg: 0,
        totalPurchaseCost: 0,
        totalRetailSalesKg: 0,
        totalRetailSalesRevenue: 0,
        totalRetailProfit: 0,
        totalHotelSalesKg: 0,
        totalHotelSalesRevenue: 0,
        totalHotelProfit: 0,
        totalSoldKg: 0,
        remainingKg: 0,
        netProfit: 0,
        vendorPayments: 0,
        transactions: [],
        inventory: [],
      };
    }
  }

  async getDateRangeSummary(userId: number, startDate: Date, endDate: Date): Promise<DailySummary[]> {
    try {
      const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const summaries: DailySummary[] = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const summary = await this.getDailySummary(userId, date);
        summaries.push(summary);
      }
      
      return summaries;
    } catch (error) {
      console.error('Error getting date range summary:', error);
      return [];
    }
  }
}

export const firebaseDBStorage = new FirebaseDBStorage();