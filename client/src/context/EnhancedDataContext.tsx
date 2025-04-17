import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "./AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Vendor,
  InsertVendor,
  Purchase,
  RetailSale,
  HotelSale,
  DailySummary,
  Product,
  ProductPart,
  Hotel,
  HotelSaleItem,
  VendorPayment
} from "@shared/schema";

interface EnhancedDataContextType {
  // Data
  vendors: Vendor[];
  products: Product[];
  productParts: ProductPart[];
  hotels: Hotel[];
  selectedDate: Date;
  dailySummary: DailySummary | null;
  vendorPayments: VendorPayment[];
  hotelSales: HotelSale[];
  hotelSaleItems: HotelSaleItem[];
  
  // Loading states
  loadingVendors: boolean;
  loadingProducts: boolean;
  loadingProductParts: boolean;
  loadingHotels: boolean;
  loadingSummary: boolean;
  loadingVendorPayments: boolean;
  loadingHotelSales: boolean;
  loadingHotelSaleItems: boolean;
  
  // Actions
  setSelectedDate: (date: Date) => void;
  refreshData: () => Promise<void>;
  
  // Vendor operations
  addVendor: (vendor: Omit<Vendor, "id" | "userId">) => Promise<Vendor>;
  updateVendor: (id: number, vendor: Partial<Omit<Vendor, "id" | "userId">>) => Promise<Vendor>;
  deleteVendor: (id: number) => Promise<void>;
  
  // Product operations
  addProduct: (product: Omit<Product, "id" | "userId">) => Promise<Product>;
  updateProduct: (id: number, product: Partial<Omit<Product, "id" | "userId">>) => Promise<Product>;
  deleteProduct: (id: number) => Promise<void>;
  
  // Product Part operations
  addProductPart: (part: Omit<ProductPart, "id" | "userId">) => Promise<ProductPart>;
  updateProductPart: (id: number, part: Partial<Omit<ProductPart, "id" | "userId">>) => Promise<ProductPart>;
  deleteProductPart: (id: number) => Promise<void>;
  
  // Hotel operations
  addHotel: (hotel: Omit<Hotel, "id" | "userId">) => Promise<Hotel>;
  updateHotel: (id: number, hotel: Partial<Omit<Hotel, "id" | "userId">>) => Promise<Hotel>;
  deleteHotel: (id: number) => Promise<void>;
  
  // Purchase operations
  addPurchase: (purchase: Omit<Purchase, "id" | "userId" | "total" | "timestamp">) => Promise<Purchase>;
  deletePurchase: (id: number) => Promise<void>;
  
  // Retail Sale operations
  addRetailSale: (sale: Omit<RetailSale, "id" | "userId" | "total" | "timestamp">) => Promise<RetailSale>;
  deleteRetailSale: (id: number) => Promise<void>;
  
  // Hotel Sale operations
  addHotelSale: (data: any) => Promise<HotelSale>;
  updateHotelSalePaid: (id: number, isPaid: boolean) => Promise<HotelSale>;
  deleteHotelSale: (id: number) => Promise<void>;
  
  // Vendor Payment operations
  addVendorPayment: (payment: Omit<VendorPayment, "id" | "userId" | "timestamp">) => Promise<VendorPayment>;
  deleteVendorPayment: (id: number) => Promise<void>;
}

// Create the context with default values
const EnhancedDataContext = createContext<EnhancedDataContextType | undefined>(undefined);

// Provider component
export function EnhancedDataProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Format date as YYYY-MM-DD for API requests
  const formattedDate = selectedDate.toISOString().split('T')[0];

  // Queries for fetching data
  const vendorsQuery = useQuery({
    queryKey: ['/api/vendors'],
    enabled: !!currentUser,
  });

  const productsQuery = useQuery({
    queryKey: ['/api/products'],
    enabled: !!currentUser,
  });

  const productPartsQuery = useQuery({
    queryKey: ['/api/product-parts'],
    enabled: !!currentUser,
  });

  const hotelsQuery = useQuery({
    queryKey: ['/api/hotels'],
    enabled: !!currentUser,
  });

  const dailySummaryQuery = useQuery({
    queryKey: ['/api/report/daily', formattedDate],
    enabled: !!currentUser,
  });

  const vendorPaymentsQuery = useQuery({
    queryKey: ['/api/vendor-payments', formattedDate],
    enabled: !!currentUser,
  });

  const hotelSalesQuery = useQuery({
    queryKey: ['/api/hotel-sales', formattedDate],
    enabled: !!currentUser,
  });

  const hotelSaleItemsQuery = useQuery({
    queryKey: ['/api/hotel-sale-items', formattedDate],
    enabled: !!currentUser,
  });

  // Mutations for API operations
  
  // Vendor Mutations
  const addVendorMutation = useMutation({
    mutationFn: (vendor: Omit<Vendor, "id" | "userId">) => 
      apiRequest('/api/vendors', { method: 'POST', body: vendor }),
    onSuccess: () => {
      toast({ title: "Vendor added successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
    },
    onError: (error: any) => {
      console.error("Error adding vendor:", error);
      toast({ 
        title: "Failed to add vendor", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const updateVendorMutation = useMutation({
    mutationFn: ({ id, vendor }: { id: number, vendor: Partial<Omit<Vendor, "id" | "userId">> }) => 
      apiRequest(`/api/vendors/${id}`, { method: 'PATCH', body: vendor }),
    onSuccess: () => {
      toast({ title: "Vendor updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
    },
    onError: (error: any) => {
      console.error("Error updating vendor:", error);
      toast({ 
        title: "Failed to update vendor", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const deleteVendorMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/vendors/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: "Vendor deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] });
    },
    onError: (error: any) => {
      console.error("Error deleting vendor:", error);
      toast({ 
        title: "Failed to delete vendor", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Product Mutations
  const addProductMutation = useMutation({
    mutationFn: (product: Omit<Product, "id" | "userId">) => 
      apiRequest('/api/products', { method: 'POST', body: product }),
    onSuccess: () => {
      toast({ title: "Product added successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error: any) => {
      console.error("Error adding product:", error);
      toast({ 
        title: "Failed to add product", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, product }: { id: number, product: Partial<Omit<Product, "id" | "userId">> }) => 
      apiRequest(`/api/products/${id}`, { method: 'PATCH', body: product }),
    onSuccess: () => {
      toast({ title: "Product updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error: any) => {
      console.error("Error updating product:", error);
      toast({ 
        title: "Failed to update product", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: "Product deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error: any) => {
      console.error("Error deleting product:", error);
      toast({ 
        title: "Failed to delete product", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Product Part Mutations
  const addProductPartMutation = useMutation({
    mutationFn: (part: Omit<ProductPart, "id" | "userId">) => 
      apiRequest('/api/product-parts', { method: 'POST', body: part }),
    onSuccess: () => {
      toast({ title: "Product part added successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/product-parts'] });
    },
    onError: (error: any) => {
      console.error("Error adding product part:", error);
      toast({ 
        title: "Failed to add product part", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const updateProductPartMutation = useMutation({
    mutationFn: ({ id, part }: { id: number, part: Partial<Omit<ProductPart, "id" | "userId">> }) => 
      apiRequest(`/api/product-parts/${id}`, { method: 'PATCH', body: part }),
    onSuccess: () => {
      toast({ title: "Product part updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/product-parts'] });
    },
    onError: (error: any) => {
      console.error("Error updating product part:", error);
      toast({ 
        title: "Failed to update product part", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const deleteProductPartMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/product-parts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: "Product part deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/product-parts'] });
    },
    onError: (error: any) => {
      console.error("Error deleting product part:", error);
      toast({ 
        title: "Failed to delete product part", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Hotel Mutations
  const addHotelMutation = useMutation({
    mutationFn: (hotel: Omit<Hotel, "id" | "userId">) => 
      apiRequest('/api/hotels', { method: 'POST', body: hotel }),
    onSuccess: () => {
      toast({ title: "Hotel added successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/hotels'] });
    },
    onError: (error: any) => {
      console.error("Error adding hotel:", error);
      toast({ 
        title: "Failed to add hotel", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const updateHotelMutation = useMutation({
    mutationFn: ({ id, hotel }: { id: number, hotel: Partial<Omit<Hotel, "id" | "userId">> }) => 
      apiRequest(`/api/hotels/${id}`, { method: 'PATCH', body: hotel }),
    onSuccess: () => {
      toast({ title: "Hotel updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/hotels'] });
    },
    onError: (error: any) => {
      console.error("Error updating hotel:", error);
      toast({ 
        title: "Failed to update hotel", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const deleteHotelMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/hotels/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: "Hotel deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/hotels'] });
    },
    onError: (error: any) => {
      console.error("Error deleting hotel:", error);
      toast({ 
        title: "Failed to delete hotel", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Purchase Mutations
  const addPurchaseMutation = useMutation({
    mutationFn: (purchase: Omit<Purchase, "id" | "userId" | "total" | "timestamp">) => 
      apiRequest('/api/purchases', { method: 'POST', body: purchase }),
    onSuccess: () => {
      toast({ title: "Purchase added successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/report/daily'] });
    },
    onError: (error: any) => {
      console.error("Error adding purchase:", error);
      toast({ 
        title: "Failed to add purchase", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const deletePurchaseMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/purchases/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: "Purchase deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/report/daily'] });
    },
    onError: (error: any) => {
      console.error("Error deleting purchase:", error);
      toast({ 
        title: "Failed to delete purchase", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Retail Sale Mutations
  const addRetailSaleMutation = useMutation({
    mutationFn: (sale: Omit<RetailSale, "id" | "userId" | "total" | "timestamp">) => 
      apiRequest('/api/retail-sales', { method: 'POST', body: sale }),
    onSuccess: () => {
      toast({ title: "Retail sale added successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/report/daily'] });
    },
    onError: (error: any) => {
      console.error("Error adding retail sale:", error);
      toast({ 
        title: "Failed to add retail sale", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const deleteRetailSaleMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/retail-sales/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: "Retail sale deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/report/daily'] });
    },
    onError: (error: any) => {
      console.error("Error deleting retail sale:", error);
      toast({ 
        title: "Failed to delete retail sale", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Hotel Sale Mutations
  const addHotelSaleMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest('/api/hotel-sales', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({ title: "Hotel bill created successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/hotel-sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hotel-sale-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/report/daily'] });
    },
    onError: (error: any) => {
      console.error("Error creating hotel bill:", error);
      toast({ 
        title: "Failed to create hotel bill", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const updateHotelSalePaidMutation = useMutation({
    mutationFn: ({ id, isPaid }: { id: number, isPaid: boolean }) => 
      apiRequest(`/api/hotel-sales/${id}/paid`, { method: 'PATCH', body: { isPaid } }),
    onSuccess: () => {
      toast({ title: "Payment status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/hotel-sales'] });
    },
    onError: (error: any) => {
      console.error("Error updating payment status:", error);
      toast({ 
        title: "Failed to update payment status", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const deleteHotelSaleMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/hotel-sales/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: "Hotel bill deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/hotel-sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hotel-sale-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/report/daily'] });
    },
    onError: (error: any) => {
      console.error("Error deleting hotel bill:", error);
      toast({ 
        title: "Failed to delete hotel bill", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Vendor Payment Mutations
  const addVendorPaymentMutation = useMutation({
    mutationFn: (payment: Omit<VendorPayment, "id" | "userId" | "timestamp">) => 
      apiRequest('/api/vendor-payments', { method: 'POST', body: payment }),
    onSuccess: () => {
      toast({ title: "Payment recorded successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] }); // To update debt
    },
    onError: (error: any) => {
      console.error("Error recording payment:", error);
      toast({ 
        title: "Failed to record payment", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const deleteVendorPaymentMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/vendor-payments/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: "Payment deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] }); // To update debt
    },
    onError: (error: any) => {
      console.error("Error deleting payment:", error);
      toast({ 
        title: "Failed to delete payment", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Function to refresh all data
  const refreshData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['/api/vendors'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/products'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/product-parts'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/hotels'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/report/daily'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-payments'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/hotel-sales'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/hotel-sale-items'] })
    ]);
  };

  return (
    <EnhancedDataContext.Provider
      value={{
        // Data
        vendors: vendorsQuery.data || [],
        products: productsQuery.data || [],
        productParts: productPartsQuery.data || [],
        hotels: hotelsQuery.data || [],
        selectedDate,
        dailySummary: dailySummaryQuery.data || null,
        vendorPayments: vendorPaymentsQuery.data || [],
        hotelSales: hotelSalesQuery.data || [],
        hotelSaleItems: hotelSaleItemsQuery.data || [],
        
        // Loading states
        loadingVendors: vendorsQuery.isLoading,
        loadingProducts: productsQuery.isLoading,
        loadingProductParts: productPartsQuery.isLoading,
        loadingHotels: hotelsQuery.isLoading,
        loadingSummary: dailySummaryQuery.isLoading,
        loadingVendorPayments: vendorPaymentsQuery.isLoading,
        loadingHotelSales: hotelSalesQuery.isLoading,
        loadingHotelSaleItems: hotelSaleItemsQuery.isLoading,
        
        // Actions
        setSelectedDate,
        refreshData,
        
        // Vendor operations
        addVendor: async (vendor) => {
          return await addVendorMutation.mutateAsync(vendor);
        },
        updateVendor: async (id, vendor) => {
          return await updateVendorMutation.mutateAsync({ id, vendor });
        },
        deleteVendor: async (id) => {
          await deleteVendorMutation.mutateAsync(id);
        },
        
        // Product operations
        addProduct: async (product) => {
          return await addProductMutation.mutateAsync(product);
        },
        updateProduct: async (id, product) => {
          return await updateProductMutation.mutateAsync({ id, product });
        },
        deleteProduct: async (id) => {
          await deleteProductMutation.mutateAsync(id);
        },
        
        // Product Part operations
        addProductPart: async (part) => {
          return await addProductPartMutation.mutateAsync(part);
        },
        updateProductPart: async (id, part) => {
          return await updateProductPartMutation.mutateAsync({ id, part });
        },
        deleteProductPart: async (id) => {
          await deleteProductPartMutation.mutateAsync(id);
        },
        
        // Hotel operations
        addHotel: async (hotel) => {
          return await addHotelMutation.mutateAsync(hotel);
        },
        updateHotel: async (id, hotel) => {
          return await updateHotelMutation.mutateAsync({ id, hotel });
        },
        deleteHotel: async (id) => {
          await deleteHotelMutation.mutateAsync(id);
        },
        
        // Purchase operations
        addPurchase: async (purchase) => {
          return await addPurchaseMutation.mutateAsync(purchase);
        },
        deletePurchase: async (id) => {
          await deletePurchaseMutation.mutateAsync(id);
        },
        
        // Retail Sale operations
        addRetailSale: async (sale) => {
          return await addRetailSaleMutation.mutateAsync(sale);
        },
        deleteRetailSale: async (id) => {
          await deleteRetailSaleMutation.mutateAsync(id);
        },
        
        // Hotel Sale operations
        addHotelSale: async (data) => {
          return await addHotelSaleMutation.mutateAsync(data);
        },
        updateHotelSalePaid: async (id, isPaid) => {
          return await updateHotelSalePaidMutation.mutateAsync({ id, isPaid });
        },
        deleteHotelSale: async (id) => {
          await deleteHotelSaleMutation.mutateAsync(id);
        },
        
        // Vendor Payment operations
        addVendorPayment: async (payment) => {
          return await addVendorPaymentMutation.mutateAsync(payment);
        },
        deleteVendorPayment: async (id) => {
          await deleteVendorPaymentMutation.mutateAsync(id);
        }
      }}
    >
      {children}
    </EnhancedDataContext.Provider>
  );
}

// Custom hook to use the data context
export function useEnhancedData() {
  const context = useContext(EnhancedDataContext);
  if (context === undefined) {
    throw new Error('useEnhancedData must be used within a EnhancedDataProvider');
  }
  return context;
}

// For backward compatibility, we'll also export this as useData
export const useData = useEnhancedData;