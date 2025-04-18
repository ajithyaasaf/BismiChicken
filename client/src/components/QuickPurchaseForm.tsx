import { useState, useEffect } from "react";
import { useEnhancedData } from "../context/EnhancedDataContext";
import { MeatTypes, ProductCuts, Vendor } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShoppingCartIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { calculateTotal } from "../utils/helpers";
import { addPurchaseToFirestore } from "../utils/firestoreHelpers";
import { useAuth } from "../context/AuthContext";

// Define suggested rates based on meat type and cut
const SUGGESTED_RATES: Record<string, Record<string, number>> = {
  [MeatTypes.CHICKEN]: {
    [ProductCuts.WHOLE]: 180,
    [ProductCuts.BREAST]: 220,
    [ProductCuts.LEG]: 200,
    [ProductCuts.WING]: 160
  },
  [MeatTypes.GOAT]: {
    [ProductCuts.WHOLE]: 600,
    [ProductCuts.LEG]: 650,
    [ProductCuts.BONELESS]: 750
  },
  [MeatTypes.BEEF]: {
    [ProductCuts.WHOLE]: 450,
    [ProductCuts.BONELESS]: 550
  },
  [MeatTypes.KADAI]: {
    [ProductCuts.WHOLE]: 350,
    [ProductCuts.OTHER]: 400
  }
};

export default function QuickPurchaseForm() {
  const { vendors, selectedDate, addPurchase } = useEnhancedData();
  const { currentUser } = useAuth();
  
  const [vendorId, setVendorId] = useState<string>("");
  const [quantityKg, setQuantityKg] = useState<string>("");
  const [ratePerKg, setRatePerKg] = useState<string>("");
  const [meatType, setMeatType] = useState<string>(MeatTypes.CHICKEN);
  const [productCut, setProductCut] = useState<string>(ProductCuts.WHOLE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0);
  const [recentRates, setRecentRates] = useState<Record<string, number>>({});

  // Find selected vendor
  const selectedVendor = vendors.find(v => v.id.toString() === vendorId);
  
  // Calculate total when quantity or rate changes
  useEffect(() => {
    const quantity = parseFloat(quantityKg || "0");
    const rate = parseFloat(ratePerKg || "0");
    
    if (!isNaN(quantity) && !isNaN(rate)) {
      setCalculatedTotal(calculateTotal(quantity, rate));
    } else {
      setCalculatedTotal(0);
    }
  }, [quantityKg, ratePerKg]);

  // When vendor changes, lookup their specialized rates
  useEffect(() => {
    if (selectedVendor?.customPricing) {
      try {
        const customRates = JSON.parse(selectedVendor.customPricing || "{}");
        // Set a sensible default rate if available for this vendor
        const key = `${meatType}-${productCut}`;
        if (customRates[key] && !ratePerKg) {
          setRatePerKg(customRates[key].toString());
        }
      } catch (e) {
        console.error("Error parsing custom pricing", e);
      }
    }
  }, [vendorId, selectedVendor, meatType, productCut]);
  
  // Get suggested rates based on meat type and cut
  useEffect(() => {
    // Update from hardcoded suggestions
    const newRates: Record<string, number> = {};
    
    // Get rates from the suggestion map
    Object.keys(SUGGESTED_RATES).forEach(meat => {
      Object.entries(SUGGESTED_RATES[meat]).forEach(([cut, rate]) => {
        newRates[`${meat}-${cut}`] = rate;
      });
    });
    
    setRecentRates(newRates);
  }, []);

  // When meat type or cut changes, suggest a rate
  useEffect(() => {
    if (meatType && productCut) {
      const key = `${meatType}-${productCut}`;
      if (recentRates[key]) {
        setRatePerKg(recentRates[key].toString());
      }
    }
  }, [meatType, productCut, recentRates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vendorId || !quantityKg || !ratePerKg) {
      toast({
        title: "Invalid form",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format data properly for backend validation
      const purchaseData = {
        vendorId: vendorId, // Will be parsed to int on backend
        productId: "1", // Default productId as string
        quantityKg: quantityKg, // Already a string
        ratePerKg: ratePerKg, // Already a string
        meatType,
        productCut,
        date: selectedDate.toISOString().split("T")[0],
        partId: null
      };
      
      // Save to backend API
      await addPurchase(purchaseData);
      
      // Also save to Firestore for redundancy if we have a currentUser
      if (currentUser) {
        try {
          await addPurchaseToFirestore(purchaseData, currentUser.uid);
        } catch (firestoreError) {
          console.error("Firestore backup failed:", firestoreError);
          // Continue even if Firestore fails
        }
      }
      
      toast({
        title: "Purchase added",
        description: `${quantityKg} kg added for ${selectedVendor?.name}`,
      });
      
      // Reset form but keep vendor and meat type
      setQuantityKg("");
      setRatePerKg("");
    } catch (error) {
      console.error("Error adding purchase:", error);
      toast({
        title: "Failed to add purchase",
        description: "An error occurred while adding the purchase.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Meat types and product cuts from schema
  const meatTypeOptions = Object.values(MeatTypes);
  const productCutOptions = Object.values(ProductCuts);
  
  // Generate suggestions UI if we have recent rates
  const renderRateSuggestions = () => {
    if (!Object.keys(recentRates).length) return null;
    
    const currentKey = `${meatType}-${productCut}`;
    const suggestedRate = recentRates[currentKey];
    
    if (!suggestedRate) return null;
    
    return (
      <motion.button
        type="button"
        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded-md"
        whileTap={{ scale: 0.95 }}
        onClick={() => setRatePerKg(suggestedRate.toString())}
      >
        ₹{suggestedRate}/kg
      </motion.button>
    );
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center">
          <ShoppingCartIcon className="h-4 w-4 mr-1 text-blue-500" />
          Quick Purchase
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Select
              value={vendorId}
              onValueChange={setVendorId}
              disabled={isSubmitting}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem 
                    key={vendor.id} 
                    value={vendor.id.toString()}
                    className="text-xs py-1"
                  >
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <Select
                value={meatType}
                onValueChange={setMeatType}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Meat type" />
                </SelectTrigger>
                <SelectContent>
                  {meatTypeOptions.map((type) => (
                    <SelectItem 
                      key={type} 
                      value={type}
                      className="text-xs py-1"
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Select
                value={productCut}
                onValueChange={setProductCut}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Cut type" />
                </SelectTrigger>
                <SelectContent>
                  {productCutOptions.map((cut) => (
                    <SelectItem 
                      key={cut} 
                      value={cut}
                      className="text-xs py-1"
                    >
                      {cut.charAt(0).toUpperCase() + cut.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Quantity (kg)"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                className="h-8 text-xs"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="flex-1">
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Rate (₹/kg)"
                value={ratePerKg}
                onChange={(e) => setRatePerKg(e.target.value)}
                className="h-8 text-xs"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          {renderRateSuggestions()}
          
          {calculatedTotal > 0 && (
            <div className="text-xs text-right text-gray-600">
              Total: <span className="font-semibold text-green-600">₹{calculatedTotal.toFixed(2)}</span>
            </div>
          )}
          
          <Button
            type="submit"
            size="sm"
            className="w-full h-8 text-xs"
            disabled={isSubmitting || !vendorId || !quantityKg || !ratePerKg}
          >
            {isSubmitting ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              "Add Purchase"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}