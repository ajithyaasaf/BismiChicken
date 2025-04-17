import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { Purchase, RetailSale, VendorPayment, Vendor } from "@shared/schema";

// Collection names for Firestore
const COLLECTIONS = {
  PURCHASES: "purchases",
  RETAIL_SALES: "retailSales",
  VENDOR_PAYMENTS: "vendorPayments",
  VENDORS: "vendors",
};

/**
 * Adds a purchase to both Firestore and backend API
 */
export const addPurchaseToFirestore = async (
  purchase: Omit<Purchase, "id" | "userId" | "total" | "timestamp">,
  userId: string
) => {
  try {
    // Add timestamp
    const purchaseWithTimestamp = {
      ...purchase,
      userId,
      timestamp: serverTimestamp(),
      total: (parseFloat(purchase.quantityKg) * parseFloat(purchase.ratePerKg)).toString(),
    };
    
    // Save to Firestore
    await addDoc(collection(db, COLLECTIONS.PURCHASES), purchaseWithTimestamp);
    
    return true;
  } catch (error) {
    console.error("Error saving purchase to Firestore:", error);
    throw error;
  }
};

/**
 * Adds a retail sale to both Firestore and backend API
 */
export const addRetailSaleToFirestore = async (
  sale: Omit<RetailSale, "id" | "userId" | "total" | "timestamp">,
  userId: string
) => {
  try {
    // Add timestamp and calculated total
    const saleWithTimestamp = {
      ...sale,
      userId,
      timestamp: serverTimestamp(),
      total: (parseFloat(sale.quantityKg) * parseFloat(sale.ratePerKg)).toString(),
    };
    
    // Save to Firestore
    await addDoc(collection(db, COLLECTIONS.RETAIL_SALES), saleWithTimestamp);
    
    return true;
  } catch (error) {
    console.error("Error saving retail sale to Firestore:", error);
    throw error;
  }
};

/**
 * Adds a vendor payment to both Firestore and backend API
 */
export const addVendorPaymentToFirestore = async (
  payment: Omit<VendorPayment, "id" | "userId" | "timestamp">,
  userId: string
) => {
  try {
    // Add timestamp
    const paymentWithTimestamp = {
      ...payment,
      userId,
      timestamp: serverTimestamp(),
    };
    
    // Save to Firestore
    await addDoc(collection(db, COLLECTIONS.VENDOR_PAYMENTS), paymentWithTimestamp);
    
    // If vendor exists, update their balance
    try {
      const vendorsRef = collection(db, COLLECTIONS.VENDORS);
      const q = query(
        vendorsRef, 
        where("userId", "==", userId),
        where("id", "==", payment.vendorId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Get the first matching vendor document
        const vendorDoc = querySnapshot.docs[0];
        const vendorData = vendorDoc.data() as Vendor;
        
        // Calculate new balance
        const currentBalance = parseFloat(vendorData.balance || "0");
        const paymentAmount = parseFloat(payment.amount);
        const newBalance = Math.max(0, currentBalance - paymentAmount).toString();
        
        // Update vendor balance
        await updateDoc(doc(db, COLLECTIONS.VENDORS, vendorDoc.id), {
          balance: newBalance
        });
      }
    } catch (vendorError) {
      console.error("Error updating vendor balance:", vendorError);
      // Continue with the payment even if vendor update fails
    }
    
    return true;
  } catch (error) {
    console.error("Error saving vendor payment to Firestore:", error);
    throw error;
  }
};