import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Vendor, Purchase, RetailSale, HotelSale, DailySummary, Transaction
} from "@shared/schema";
import { format } from "date-fns";

interface DataContextType {
  // Data
  vendors: Vendor[];
  selectedDate: Date;
  dailySummary: DailySummary | null;
  
  // Loading states
  loadingVendors: boolean;
  loadingSummary: boolean;
  
  // Actions
  setSelectedDate: (date: Date) => void;
  refreshData: () => Promise<void>;
  
  // Vendor operations
  addVendor: (vendor: Omit<Vendor, "id" | "userId">) => Promise<Vendor>;
  updateVendor: (id: number, vendor: Partial<Omit<Vendor, "id" | "userId">>) => Promise<Vendor>;
  deleteVendor: (id: number) => Promise<void>;
  
  // Purchase operations
  addPurchase: (purchase: Omit<Purchase, "id" | "userId" | "total" | "timestamp">) => Promise<Purchase>;
  deletePurchase: (id: number) => Promise<void>;
  
  // Retail Sale operations
  addRetailSale: (sale: Omit<RetailSale, "id" | "userId" | "total" | "timestamp">) => Promise<RetailSale>;
  deleteRetailSale: (id: number) => Promise<void>;
  
  // Hotel Sale operations
  addHotelSale: (sale: Omit<HotelSale, "id" | "userId" | "total" | "timestamp">) => Promise<HotelSale>;
  deleteHotelSale: (id: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  // Fetch vendors when authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchVendors();
    }
  }, [isAuthenticated, currentUser]);
  
  // Fetch daily summary when date changes or after authentication
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchDailySummary();
    }
  }, [isAuthenticated, currentUser, selectedDate]);
  
  // Helper function to fetch vendors
  const fetchVendors = async () => {
    setLoadingVendors(true);
    try {
      const response = await apiRequest("GET", "/api/vendors", undefined);
      const data = await response.json();
      setVendors(data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast({
        title: "Error",
        description: "Failed to load vendors",
        variant: "destructive"
      });
    } finally {
      setLoadingVendors(false);
    }
  };
  
  // Helper function to fetch daily summary
  const fetchDailySummary = async () => {
    setLoadingSummary(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const response = await apiRequest("GET", `/api/report/daily?date=${dateStr}`, undefined);
      const data = await response.json();
      setDailySummary(data);
    } catch (error) {
      console.error("Error fetching daily summary:", error);
      toast({
        title: "Error",
        description: "Failed to load daily summary",
        variant: "destructive"
      });
      setDailySummary(null);
    } finally {
      setLoadingSummary(false);
    }
  };
  
  // Refresh all data
  const refreshData = async () => {
    try {
      await Promise.all([fetchVendors(), fetchDailySummary()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };
  
  // Vendor operations
  const addVendor = async (vendor: Omit<Vendor, "id" | "userId">) => {
    try {
      const response = await apiRequest("POST", "/api/vendors", vendor);
      const data = await response.json();
      
      // Update local vendors state
      setVendors(prev => [...prev, data]);
      
      toast({
        title: "Success",
        description: "Vendor added successfully"
      });
      
      return data;
    } catch (error) {
      console.error("Error adding vendor:", error);
      toast({
        title: "Error",
        description: "Failed to add vendor",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const updateVendor = async (id: number, vendor: Partial<Omit<Vendor, "id" | "userId">>) => {
    try {
      const response = await apiRequest("PUT", `/api/vendors/${id}`, vendor);
      const data = await response.json();
      
      // Update local vendors state
      setVendors(prev => prev.map(v => v.id === id ? data : v));
      
      toast({
        title: "Success",
        description: "Vendor updated successfully"
      });
      
      return data;
    } catch (error) {
      console.error("Error updating vendor:", error);
      toast({
        title: "Error",
        description: "Failed to update vendor",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const deleteVendor = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/vendors/${id}`);
      
      // Update local vendors state
      setVendors(prev => prev.filter(v => v.id !== id));
      
      toast({
        title: "Success",
        description: "Vendor deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting vendor:", error);
      toast({
        title: "Error",
        description: "Failed to delete vendor",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  // Purchase operations
  const addPurchase = async (purchase: Omit<Purchase, "id" | "userId" | "total" | "timestamp">) => {
    try {
      const response = await apiRequest("POST", "/api/purchases", purchase);
      const data = await response.json();
      
      // Refresh daily summary to update with new purchase
      await fetchDailySummary();
      
      toast({
        title: "Success",
        description: "Purchase added successfully"
      });
      
      return data;
    } catch (error) {
      console.error("Error adding purchase:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add purchase",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const deletePurchase = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/purchases/${id}`);
      
      // Refresh daily summary to update
      await fetchDailySummary();
      
      toast({
        title: "Success",
        description: "Purchase deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting purchase:", error);
      toast({
        title: "Error",
        description: "Failed to delete purchase",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  // Retail Sale operations
  const addRetailSale = async (sale: Omit<RetailSale, "id" | "userId" | "total" | "timestamp">) => {
    try {
      const response = await apiRequest("POST", "/api/sales/retail", sale);
      const data = await response.json();
      
      // Refresh daily summary to update with new sale
      await fetchDailySummary();
      
      toast({
        title: "Success",
        description: "Retail sale added successfully"
      });
      
      return data;
    } catch (error) {
      console.error("Error adding retail sale:", error);
      
      let errorMessage = "Failed to add retail sale";
      if (error instanceof Error && error.message.includes("Cannot sell more than purchased")) {
        errorMessage = "Cannot sell more than purchased. Check your inventory.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const deleteRetailSale = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/sales/retail/${id}`);
      
      // Refresh daily summary to update
      await fetchDailySummary();
      
      toast({
        title: "Success",
        description: "Retail sale deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting retail sale:", error);
      toast({
        title: "Error",
        description: "Failed to delete retail sale",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  // Hotel Sale operations
  const addHotelSale = async (sale: Omit<HotelSale, "id" | "userId" | "total" | "timestamp">) => {
    try {
      const response = await apiRequest("POST", "/api/sales/hotel", sale);
      const data = await response.json();
      
      // Refresh daily summary to update with new sale
      await fetchDailySummary();
      
      toast({
        title: "Success",
        description: "Hotel sale added successfully"
      });
      
      return data;
    } catch (error) {
      console.error("Error adding hotel sale:", error);
      
      let errorMessage = "Failed to add hotel sale";
      if (error instanceof Error && error.message.includes("Cannot sell more than purchased")) {
        errorMessage = "Cannot sell more than purchased. Check your inventory.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const deleteHotelSale = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/sales/hotel/${id}`);
      
      // Refresh daily summary to update
      await fetchDailySummary();
      
      toast({
        title: "Success",
        description: "Hotel sale deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting hotel sale:", error);
      toast({
        title: "Error",
        description: "Failed to delete hotel sale",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const value = {
    // Data
    vendors,
    selectedDate,
    dailySummary,
    
    // Loading states
    loadingVendors,
    loadingSummary,
    
    // Actions
    setSelectedDate,
    refreshData,
    
    // Vendor operations
    addVendor,
    updateVendor,
    deleteVendor,
    
    // Purchase operations
    addPurchase,
    deletePurchase,
    
    // Retail Sale operations
    addRetailSale,
    deleteRetailSale,
    
    // Hotel Sale operations
    addHotelSale,
    deleteHotelSale
  };
  
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  
  return context;
}
