import { useState, useEffect } from "react";
import { useEnhancedData } from "../context/EnhancedDataContext";
import { MeatTypes, ProductCuts } from "@shared/schema";
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
import { StoreIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { calculateTotal } from "../utils/helpers";

// Common retail sale quantities
const COMMON_QUANTITIES = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5];

// Price suggestions by meat type and cut (simulated default prices)
const SUGGESTED_RATES: Record<string, Record<string, number>> = {
  [MeatTypes.CHICKEN]: {
    [ProductCuts.WHOLE]: 280,
    [ProductCuts.BREAST]: 320,
    [ProductCuts.LEG]: 300,
    [ProductCuts.WINGS]: 250,
    [ProductCuts.BONELESS]: 380,
  },
  [MeatTypes.MUTTON]: {
    [ProductCuts.WHOLE]: 800,
    [ProductCuts.LEG]: 850,
    [ProductCuts.BONELESS]: 950,
  },
  [MeatTypes.BEEF]: {
    [ProductCuts.WHOLE]: 450,
    [ProductCuts.BONELESS]: 550,
  }
};

export default function QuickRetailSaleForm() {
  const { selectedDate, addRetailSale } = useEnhancedData();
  
  const [quantityKg, setQuantityKg] = useState<string>("");
  const [ratePerKg, setRatePerKg] = useState<string>("");
  const [meatType, setMeatType] = useState<string>(MeatTypes.CHICKEN);
  const [productCut, setProductCut] = useState<string>(ProductCuts.WHOLE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0);
  
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

  // Update suggested rate when meat type or cut changes
  useEffect(() => {
    if (SUGGESTED_RATES[meatType]?.[productCut]) {
      setRatePerKg(SUGGESTED_RATES[meatType][productCut].toString());
    }
  }, [meatType, productCut]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quantityKg || !ratePerKg) {
      toast({
        title: "Invalid form",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const saleData = {
        quantityKg: parseFloat(quantityKg),
        ratePerKg: parseFloat(ratePerKg),
        meatType,
        productCut,
        date: selectedDate.toISOString().split("T")[0],
        productId: 1, // Default product ID - typically would be determined based on meat type and cut
      };
      
      await addRetailSale(saleData);
      
      toast({
        title: "Sale recorded",
        description: `${quantityKg} kg ${meatType} sold`,
      });
      
      // Reset form but keep meat type and cut
      setQuantityKg("");
      // Rate will be automatically set based on meat type and cut
    } catch (error) {
      console.error("Error recording sale:", error);
      toast({
        title: "Failed to record sale",
        description: "An error occurred while recording the sale.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Meat types and product cuts from schema
  const meatTypeOptions = Object.values(MeatTypes);
  const productCutOptions = Object.values(ProductCuts);
  
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center">
          <StoreIcon className="h-4 w-4 mr-1 text-green-500" />
          Quick Retail Sale
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-3">
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
          
          {/* Common quantity quick picks */}
          <div className="flex flex-wrap gap-1 mb-2">
            {COMMON_QUANTITIES.map((qty) => (
              <motion.button
                key={qty}
                type="button"
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setQuantityKg(qty.toString())}
              >
                {qty} kg
              </motion.button>
            ))}
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
          
          {calculatedTotal > 0 && (
            <div className="text-xs text-right text-gray-600">
              Total: <span className="font-semibold text-green-600">₹{calculatedTotal.toFixed(2)}</span>
            </div>
          )}
          
          <Button
            type="submit"
            size="sm"
            className="w-full h-8 text-xs"
            disabled={isSubmitting || !quantityKg || !ratePerKg}
          >
            {isSubmitting ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              "Record Sale"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}