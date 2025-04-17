import { firestore } from './firebase-admin';
import { IStorage } from './storage';
import { 
  User, InsertUser,
  Vendor, InsertVendor,
  Purchase, InsertPurchase,
  RetailSale, InsertRetailSale,
  HotelSale, InsertHotelSale,
  HotelSaleItem, InsertHotelSaleItem,
  VendorPayment, InsertVendorPayment,
  Hotel, InsertHotel,
  Product, InsertProduct,
  ProductPart, InsertProductPart,
  Transaction, 
  ProductInventory,
  DailySummary
} from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';
import { 
  Timestamp, 
  FieldValue 
} from 'firebase-admin/firestore';

// Helper functions
const convertTimestampToDate = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

const convertDatesToTimestamps = (obj: any): any => {
  const result = { ...obj };
  for (const key in result) {
    if (result[key] instanceof Date) {
      result[key] = Timestamp.fromDate(result[key]);
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = convertDatesToTimestamps(result[key]);
    }
  }
  return result;
};

const convertTimestampsToDates = (obj: any): any => {
  const result = { ...obj };
  for (const key in result) {
    if (result[key] instanceof Timestamp) {
      result[key] = result[key].toDate();
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = convertTimestampsToDates(result[key]);
    }
  }
  return result;
};

// FirestoreStorage implementation of IStorage
export class FirestoreStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const usersRef = firestore.collection('users');
    const snapshot = await usersRef.where('id', '==', id).get();
    
    if (snapshot.empty) {
      return undefined;
    }
    
    const userData = snapshot.docs[0].data();
    return convertTimestampsToDates(userData) as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const usersRef = firestore.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      return undefined;
    }
    
    const userData = snapshot.docs[0].data();
    return convertTimestampsToDates(userData) as User;
  }

  async getUserByFirebaseId(firebaseId: string): Promise<User | undefined> {
    const usersRef = firestore.collection('users');
    const snapshot = await usersRef.where('firebaseId', '==', firebaseId).get();
    
    if (snapshot.empty) {
      return undefined;
    }
    
    const userData = snapshot.docs[0].data();
    return convertTimestampsToDates(userData) as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    // Get the next id by checking the counters collection
    const counterRef = firestore.collection('counters').doc('users');
    const counterSnap = await counterRef.get();
    
    let nextId = 1;
    if (counterSnap.exists) {
      nextId = (counterSnap.data()?.currentId || 0) + 1;
    }
    
    // Update the counter
    await counterRef.set({ currentId: nextId }, { merge: true });
    
    // Create the new user
    const newUser: User = {
      id: nextId,
      ...user,
      createdAt: new Date()
    };
    
    // Store in Firestore
    const docRef = firestore.collection('users').doc(nextId.toString());
    await docRef.set(convertDatesToTimestamps(newUser));
    
    return newUser;
  }

  // Vendor operations
  async getVendors(userId: number): Promise<Vendor[]> {
    const vendorsRef = firestore.collection('vendors');
    const snapshot = await vendorsRef.where('userId', '==', userId).get();
    
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(doc => convertTimestampsToDates(doc.data()) as Vendor);
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    const docRef = firestore.collection('vendors').doc(id.toString());
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return undefined;
    }
    
    return convertTimestampsToDates(doc.data()) as Vendor;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    // Get the next id
    const counterRef = firestore.collection('counters').doc('vendors');
    const counterSnap = await counterRef.get();
    
    let nextId = 1;
    if (counterSnap.exists) {
      nextId = (counterSnap.data()?.currentId || 0) + 1;
    }
    
    // Update the counter
    await counterRef.set({ currentId: nextId }, { merge: true });
    
    // Create the new vendor
    const newVendor: Vendor = {
      id: nextId,
      ...vendor,
      createdAt: new Date()
    };
    
    // Store in Firestore
    const docRef = firestore.collection('vendors').doc(nextId.toString());
    await docRef.set(convertDatesToTimestamps(newVendor));
    
    return newVendor;
  }

  async updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const docRef = firestore.collection('vendors').doc(id.toString());
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return undefined;
    }
    
    const updatedVendor = {
      ...doc.data(),
      ...convertDatesToTimestamps(vendor),
      updatedAt: Timestamp.now()
    };
    
    await docRef.update(updatedVendor);
    
    return convertTimestampsToDates(updatedVendor) as Vendor;
  }

  async deleteVendor(id: number): Promise<boolean> {
    const docRef = firestore.collection('vendors').doc(id.toString());
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return false;
    }
    
    await docRef.delete();
    return true;
  }

  // Purchase operations
  async getPurchases(userId: number, date?: Date): Promise<Purchase[]> {
    let query = firestore.collection('purchases').where('userId', '==', userId);
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query.where('timestamp', '>=', Timestamp.fromDate(startOfDay))
                   .where('timestamp', '<=', Timestamp.fromDate(endOfDay));
    }
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(doc => convertTimestampsToDates(doc.data()) as Purchase);
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    // Get the next id
    const counterRef = firestore.collection('counters').doc('purchases');
    const counterSnap = await counterRef.get();
    
    let nextId = 1;
    if (counterSnap.exists) {
      nextId = (counterSnap.data()?.currentId || 0) + 1;
    }
    
    // Update the counter
    await counterRef.set({ currentId: nextId }, { merge: true });
    
    // Create the new purchase
    const newPurchase: Purchase = {
      id: nextId,
      ...purchase,
      timestamp: purchase.timestamp || new Date()
    };
    
    // Store in Firestore
    const docRef = firestore.collection('purchases').doc(nextId.toString());
    await docRef.set(convertDatesToTimestamps(newPurchase));
    
    return newPurchase;
  }

  async deletePurchase(id: number): Promise<boolean> {
    const docRef = firestore.collection('purchases').doc(id.toString());
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return false;
    }
    
    await docRef.delete();
    return true;
  }

  // Retail Sales operations
  async getRetailSales(userId: number, date?: Date): Promise<RetailSale[]> {
    let query = firestore.collection('retailSales').where('userId', '==', userId);
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query.where('timestamp', '>=', Timestamp.fromDate(startOfDay))
                   .where('timestamp', '<=', Timestamp.fromDate(endOfDay));
    }
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(doc => convertTimestampsToDates(doc.data()) as RetailSale);
  }

  async createRetailSale(sale: InsertRetailSale): Promise<RetailSale> {
    // Get the next id
    const counterRef = firestore.collection('counters').doc('retailSales');
    const counterSnap = await counterRef.get();
    
    let nextId = 1;
    if (counterSnap.exists) {
      nextId = (counterSnap.data()?.currentId || 0) + 1;
    }
    
    // Update the counter
    await counterRef.set({ currentId: nextId }, { merge: true });
    
    // Create the new sale
    const newSale: RetailSale = {
      id: nextId,
      ...sale,
      timestamp: sale.timestamp || new Date()
    };
    
    // Store in Firestore
    const docRef = firestore.collection('retailSales').doc(nextId.toString());
    await docRef.set(convertDatesToTimestamps(newSale));
    
    return newSale;
  }

  async deleteRetailSale(id: number): Promise<boolean> {
    const docRef = firestore.collection('retailSales').doc(id.toString());
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return false;
    }
    
    await docRef.delete();
    return true;
  }

  // Hotel Sales operations
  async getHotelSales(userId: number, date?: Date): Promise<HotelSale[]> {
    let query = firestore.collection('hotelSales').where('userId', '==', userId);
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query.where('timestamp', '>=', Timestamp.fromDate(startOfDay))
                   .where('timestamp', '<=', Timestamp.fromDate(endOfDay));
    }
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return [];
    }

    const sales = snapshot.docs.map(doc => convertTimestampsToDates(doc.data()) as HotelSale);
    
    // Get hotel sale items for these sales
    const itemPromises = sales.map(async (sale) => {
      const itemsSnapshot = await firestore.collection('hotelSaleItems')
        .where('hotelSaleId', '==', sale.id).get();
      
      const items = itemsSnapshot.docs.map(doc => convertTimestampsToDates(doc.data()) as HotelSaleItem);
      return { ...sale, items };
    });
    
    return Promise.all(itemPromises);
  }

  async createHotelSale(sale: InsertHotelSale): Promise<HotelSale> {
    // Start a batch operation for transaction-like behavior
    const batch = firestore.batch();
    
    // Get the next sale id
    const counterRef = firestore.collection('counters').doc('hotelSales');
    const counterSnap = await counterRef.get();
    
    let saleId = 1;
    if (counterSnap.exists) {
      saleId = (counterSnap.data()?.currentId || 0) + 1;
    }
    
    // Update the counter
    batch.set(counterRef, { currentId: saleId }, { merge: true });
    
    // Prepare the new sale
    const newSale: HotelSale = {
      id: saleId,
      userId: sale.userId,
      hotelId: sale.hotelId,
      totalAmount: sale.totalAmount,
      timestamp: sale.timestamp || new Date(),
      notes: sale.notes || ""
    };
    
    // Store the sale
    const saleRef = firestore.collection('hotelSales').doc(saleId.toString());
    batch.set(saleRef, convertDatesToTimestamps(newSale));
    
    // Also get a counter for items
    const itemsCounterRef = firestore.collection('counters').doc('hotelSaleItems');
    const itemsCounterSnap = await itemsCounterRef.get();
    
    let itemId = 1;
    if (itemsCounterSnap.exists) {
      itemId = (itemsCounterSnap.data()?.currentId || 0) + 1;
    }
    
    // Prepare items if any
    const items = sale.items || [];
    const createdItems: HotelSaleItem[] = [];
    
    for (const item of items) {
      const newItem: HotelSaleItem = {
        id: itemId++,
        hotelSaleId: saleId,
        productId: item.productId,
        productPartId: item.productPartId,
        quantityKg: item.quantityKg,
        ratePerKg: item.ratePerKg,
        totalAmount: item.totalAmount
      };
      
      createdItems.push(newItem);
      
      const itemRef = firestore.collection('hotelSaleItems').doc(newItem.id.toString());
      batch.set(itemRef, convertDatesToTimestamps(newItem));
    }
    
    // Update the items counter
    batch.set(itemsCounterRef, { currentId: itemId - 1 }, { merge: true });
    
    // Commit the batch
    await batch.commit();
    
    // Return the created sale with items
    return {
      ...newSale,
      items: createdItems
    };
  }

  async deleteHotelSale(id: number): Promise<boolean> {
    const batch = firestore.batch();
    
    // Get the sale
    const saleRef = firestore.collection('hotelSales').doc(id.toString());
    const saleDoc = await saleRef.get();
    
    if (!saleDoc.exists) {
      return false;
    }
    
    // Get all related items
    const itemsSnapshot = await firestore.collection('hotelSaleItems')
      .where('hotelSaleId', '==', id).get();
    
    // Delete items
    itemsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete the sale
    batch.delete(saleRef);
    
    // Commit the batch
    await batch.commit();
    
    return true;
  }

  // Vendor Payment operations
  async getVendorPayments(userId: number, vendorId?: number, date?: Date): Promise<VendorPayment[]> {
    let query = firestore.collection('vendorPayments').where('userId', '==', userId);
    
    if (vendorId) {
      query = query.where('vendorId', '==', vendorId);
    }
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query.where('timestamp', '>=', Timestamp.fromDate(startOfDay))
                   .where('timestamp', '<=', Timestamp.fromDate(endOfDay));
    }
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(doc => convertTimestampsToDates(doc.data()) as VendorPayment);
  }

  async getVendorPaymentById(id: number): Promise<VendorPayment | undefined> {
    const docRef = firestore.collection('vendorPayments').doc(id.toString());
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return undefined;
    }
    
    return convertTimestampsToDates(doc.data()) as VendorPayment;
  }

  async createVendorPayment(payment: InsertVendorPayment): Promise<VendorPayment> {
    // Get the next id
    const counterRef = firestore.collection('counters').doc('vendorPayments');
    const counterSnap = await counterRef.get();
    
    let nextId = 1;
    if (counterSnap.exists) {
      nextId = (counterSnap.data()?.currentId || 0) + 1;
    }
    
    // Update the counter
    await counterRef.set({ currentId: nextId }, { merge: true });
    
    // Create the new payment
    const newPayment: VendorPayment = {
      id: nextId,
      ...payment,
      timestamp: payment.timestamp || new Date()
    };
    
    // Store in Firestore
    const docRef = firestore.collection('vendorPayments').doc(nextId.toString());
    await docRef.set(convertDatesToTimestamps(newPayment));
    
    return newPayment;
  }

  async deleteVendorPayment(id: number): Promise<boolean> {
    const docRef = firestore.collection('vendorPayments').doc(id.toString());
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return false;
    }
    
    await docRef.delete();
    return true;
  }

  // Hotel operations
  async getHotels(userId: number): Promise<Hotel[]> {
    const hotelsRef = firestore.collection('hotels');
    const snapshot = await hotelsRef.where('userId', '==', userId).get();
    
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(doc => convertTimestampsToDates(doc.data()) as Hotel);
  }
  
  async getHotel(id: number): Promise<Hotel | undefined> {
    const docRef = firestore.collection('hotels').doc(id.toString());
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return undefined;
    }
    
    return convertTimestampsToDates(doc.data()) as Hotel;
  }
  
  async createHotel(hotel: InsertHotel): Promise<Hotel> {
    // Get the next id
    const counterRef = firestore.collection('counters').doc('hotels');
    const counterSnap = await counterRef.get();
    
    let nextId = 1;
    if (counterSnap.exists) {
      nextId = (counterSnap.data()?.currentId || 0) + 1;
    }
    
    // Update the counter
    await counterRef.set({ currentId: nextId }, { merge: true });
    
    // Create the new hotel
    const newHotel: Hotel = {
      id: nextId,
      ...hotel,
      createdAt: new Date()
    };
    
    // Store in Firestore
    const docRef = firestore.collection('hotels').doc(nextId.toString());
    await docRef.set(convertDatesToTimestamps(newHotel));
    
    return newHotel;
  }
  
  async updateHotel(id: number, hotel: Partial<InsertHotel>): Promise<Hotel | undefined> {
    const docRef = firestore.collection('hotels').doc(id.toString());
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return undefined;
    }
    
    const updatedHotel = {
      ...doc.data(),
      ...convertDatesToTimestamps(hotel),
      updatedAt: Timestamp.now()
    };
    
    await docRef.update(updatedHotel);
    
    return convertTimestampsToDates(updatedHotel) as Hotel;
  }
  
  async deleteHotel(id: number): Promise<boolean> {
    const docRef = firestore.collection('hotels').doc(id.toString());
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return false;
    }
    
    await docRef.delete();
    return true;
  }

  // Product operations
  async getProducts(userId: number): Promise<Product[]> {
    const productsRef = firestore.collection('products');
    const snapshot = await productsRef.where('userId', '==', userId).get();
    
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(doc => convertTimestampsToDates(doc.data()) as Product);
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    const docRef = firestore.collection('products').doc(id.toString());
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return undefined;
    }
    
    return convertTimestampsToDates(doc.data()) as Product;
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    // Get the next id
    const counterRef = firestore.collection('counters').doc('products');
    const counterSnap = await counterRef.get();
    
    let nextId = 1;
    if (counterSnap.exists) {
      nextId = (counterSnap.data()?.currentId || 0) + 1;
    }
    
    // Update the counter
    await counterRef.set({ currentId: nextId }, { merge: true });
    
    // Create the new product
    const newProduct: Product = {
      id: nextId,
      ...product,
      createdAt: new Date()
    };
    
    // Store in Firestore
    const docRef = firestore.collection('products').doc(nextId.toString());
    await docRef.set(convertDatesToTimestamps(newProduct));
    
    return newProduct;
  }
  
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const docRef = firestore.collection('products').doc(id.toString());
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return undefined;
    }
    
    const updatedProduct = {
      ...doc.data(),
      ...convertDatesToTimestamps(product),
      updatedAt: Timestamp.now()
    };
    
    await docRef.update(updatedProduct);
    
    return convertTimestampsToDates(updatedProduct) as Product;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const docRef = firestore.collection('products').doc(id.toString());
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return false;
    }
    
    await docRef.delete();
    return true;
  }

  // Product Part operations
  async getProductParts(userId: number): Promise<ProductPart[]> {
    const partsRef = firestore.collection('productParts');
    const snapshot = await partsRef.where('userId', '==', userId).get();
    
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(doc => convertTimestampsToDates(doc.data()) as ProductPart);
  }
  
  async getProductPart(id: number): Promise<ProductPart | undefined> {
    const docRef = firestore.collection('productParts').doc(id.toString());
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return undefined;
    }
    
    return convertTimestampsToDates(doc.data()) as ProductPart;
  }
  
  async createProductPart(part: InsertProductPart): Promise<ProductPart> {
    // Get the next id
    const counterRef = firestore.collection('counters').doc('productParts');
    const counterSnap = await counterRef.get();
    
    let nextId = 1;
    if (counterSnap.exists) {
      nextId = (counterSnap.data()?.currentId || 0) + 1;
    }
    
    // Update the counter
    await counterRef.set({ currentId: nextId }, { merge: true });
    
    // Create the new product part
    const newPart: ProductPart = {
      id: nextId,
      ...part,
      createdAt: new Date()
    };
    
    // Store in Firestore
    const docRef = firestore.collection('productParts').doc(nextId.toString());
    await docRef.set(convertDatesToTimestamps(newPart));
    
    return newPart;
  }
  
  async updateProductPart(id: number, part: Partial<InsertProductPart>): Promise<ProductPart | undefined> {
    const docRef = firestore.collection('productParts').doc(id.toString());
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return undefined;
    }
    
    const updatedPart = {
      ...doc.data(),
      ...convertDatesToTimestamps(part),
      updatedAt: Timestamp.now()
    };
    
    await docRef.update(updatedPart);
    
    return convertTimestampsToDates(updatedPart) as ProductPart;
  }
  
  async deleteProductPart(id: number): Promise<boolean> {
    const docRef = firestore.collection('productParts').doc(id.toString());
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return false;
    }
    
    await docRef.delete();
    return true;
  }

  // Report operations
  async getDailySummary(userId: number, date: Date): Promise<DailySummary> {
    // First, get all transactions for the given day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Get purchases for the day
    const purchases = await this.getPurchases(userId, date);
    
    // Get retail sales for the day
    const retailSales = await this.getRetailSales(userId, date);
    
    // Get hotel sales for the day
    const hotelSales = await this.getHotelSales(userId, date);
    
    // Get vendor payments for the day
    const payments = await this.getVendorPayments(userId, undefined, date);
    
    // Calculate summary statistics
    const totalPurchasedKg = purchases.reduce((sum, p) => sum + p.quantityKg, 0);
    const totalPurchaseCost = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    
    const totalRetailSalesKg = retailSales.reduce((sum, s) => sum + s.quantityKg, 0);
    const totalRetailSalesRevenue = retailSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalRetailProfit = retailSales.reduce((sum, s) => sum + (s.totalAmount - (s.quantityKg * purchases.reduce((avg, p) => avg + (p.totalAmount / p.quantityKg), 0) / purchases.length)), 0);
    
    const totalHotelSalesKg = hotelSales.reduce((sum, s) => {
      const saleItems = s.items || [];
      return sum + saleItems.reduce((itemSum, item) => itemSum + item.quantityKg, 0);
    }, 0);
    
    const totalHotelSalesRevenue = hotelSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalHotelProfit = totalHotelSalesRevenue - (totalHotelSalesKg * (totalPurchaseCost / totalPurchasedKg));
    
    const totalSoldKg = totalRetailSalesKg + totalHotelSalesKg;
    const remainingKg = totalPurchasedKg - totalSoldKg;
    const netProfit = totalRetailProfit + totalHotelProfit;
    const vendorPaymentsTotal = payments.reduce((sum, p) => sum + p.amount, 0);
    
    // Create transactions list
    const transactions: Transaction[] = [
      // Add purchase transactions
      ...purchases.map(p => ({
        id: p.id,
        type: 'purchase' as const,
        details: `Purchased from ${p.vendorName}`,
        quantityKg: p.quantityKg,
        ratePerKg: p.ratePerKg,
        total: p.totalAmount,
        timestamp: p.timestamp,
        productName: p.productName,
        meatType: p.meatType,
        productCut: p.productCut
      })),
      
      // Add retail sale transactions
      ...retailSales.map(s => ({
        id: s.id,
        type: 'retail' as const,
        details: `Retail sale`,
        quantityKg: s.quantityKg,
        ratePerKg: s.ratePerKg,
        total: s.totalAmount,
        timestamp: s.timestamp,
        productName: s.productName,
        partName: s.partName,
        meatType: s.meatType,
        productCut: s.productCut
      })),
      
      // Add hotel sale transactions
      ...hotelSales.map(s => ({
        id: s.id,
        type: 'hotel' as const,
        details: `Sale to ${s.hotelName || 'hotel'}`,
        quantityKg: (s.items || []).reduce((sum, item) => sum + item.quantityKg, 0),
        ratePerKg: s.totalAmount / (s.items || []).reduce((sum, item) => sum + item.quantityKg, 0),
        total: s.totalAmount,
        timestamp: s.timestamp
      })),
      
      // Add payment transactions
      ...payments.map(p => ({
        id: p.id,
        type: 'payment' as const,
        details: `Payment to ${p.vendorName}`,
        quantityKg: 0,
        ratePerKg: 0,
        total: p.amount,
        timestamp: p.timestamp
      }))
    ];
    
    // Sort transactions by timestamp
    transactions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Calculate inventory by product type
    const inventory: ProductInventory[] = [];
    
    // Combine purchases by meat type and cut
    const purchasesByType = new Map<string, { type: string, cut: string, purchasedKg: number, totalCost: number }>();
    
    for (const purchase of purchases) {
      const key = `${purchase.meatType}-${purchase.productCut}`;
      if (!purchasesByType.has(key)) {
        purchasesByType.set(key, {
          type: purchase.meatType,
          cut: purchase.productCut,
          purchasedKg: 0,
          totalCost: 0
        });
      }
      
      const current = purchasesByType.get(key)!;
      current.purchasedKg += purchase.quantityKg;
      current.totalCost += purchase.totalAmount;
    }
    
    // Combine sales by meat type and cut
    const salesByType = new Map<string, { type: string, cut: string, soldKg: number }>();
    
    for (const sale of retailSales) {
      const key = `${sale.meatType}-${sale.productCut}`;
      if (!salesByType.has(key)) {
        salesByType.set(key, {
          type: sale.meatType,
          cut: sale.productCut,
          soldKg: 0
        });
      }
      
      const current = salesByType.get(key)!;
      current.soldKg += sale.quantityKg;
    }
    
    // Create inventory entries
    for (const [key, purchase] of purchasesByType.entries()) {
      const sale = salesByType.get(key) || { type: purchase.type, cut: purchase.cut, soldKg: 0 };
      
      inventory.push({
        meatType: purchase.type,
        productCut: purchase.cut,
        purchasedKg: purchase.purchasedKg,
        soldKg: sale.soldKg,
        remainingKg: purchase.purchasedKg - sale.soldKg,
        avgCostPerKg: purchase.totalCost / purchase.purchasedKg
      });
    }
    
    // Create and return the daily summary
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
      vendorPayments: vendorPaymentsTotal,
      transactions,
      inventory
    };
  }

  async getDateRangeSummary(userId: number, startDate: Date, endDate: Date): Promise<DailySummary[]> {
    const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const summaries: DailySummary[] = [];
    
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const summary = await this.getDailySummary(userId, currentDate);
      summaries.push(summary);
    }
    
    return summaries;
  }
}

// Create and export an instance of the FirestoreStorage
export const firestoreStorage = new FirestoreStorage();