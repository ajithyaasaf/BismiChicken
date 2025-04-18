import { useState, useEffect } from "react";
import { useEnhancedData } from "../context/EnhancedDataContext";
import { useAuth } from "../context/AuthContext";
import { Hotel } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Building2, CalendarRange, BadgeIndianRupee } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format, addDays } from "date-fns";

export default function QuickHotelPaymentWidget() {
  const { hotels, selectedDate } = useEnhancedData();
  const [selectedHotelId, setSelectedHotelId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedAmounts, setSuggestedAmounts] = useState<Array<number>>([]);
  const { currentUser } = useAuth();
  
  // Find the selected hotel
  const selectedHotel = hotels.find(
    (hotel) => hotel.id.toString() === selectedHotelId
  );

  // Helper function to estimate outstanding balance for a hotel
  // In a real app, this would query actual unpaid invoices from the database
  const estimateOutstandingBalance = (hotel: Hotel) => {
    // For demo purposes, generate a random outstanding balance between 5000 and 15000
    // In a real implementation, this would calculate based on actual unpaid invoices
    const seed = hotel.id || 1; // Use hotel ID as seed
    return Math.round((5000 + (seed * 1000) % 10000) / 100) * 100; // Round to nearest 100
  };

  // Generate suggested amounts based on hotel outstanding balance
  useEffect(() => {
    if (selectedHotel) {
      const estimatedBalance = estimateOutstandingBalance(selectedHotel);
      const suggested: Array<number> = [];
      
      // Full amount
      suggested.push(estimatedBalance);
      
      // Half
      suggested.push(Math.round(estimatedBalance / 2));
      
      // Round to nearest thousand (if balance > 2000)
      if (estimatedBalance > 2000) {
        const roundedThousand = Math.round(estimatedBalance / 1000) * 1000;
        if (!suggested.includes(roundedThousand)) {
          suggested.push(roundedThousand);
        }
      }
      
      // Add a small amount option
      const smallAmount = Math.min(1000, Math.round(estimatedBalance / 4));
      if (!suggested.includes(smallAmount) && smallAmount > 0) {
        suggested.push(smallAmount);
      }
      
      // Sort and filter
      setSuggestedAmounts(
        Array.from(new Set(suggested))
          .filter(amount => amount > 0)
          .sort((a, b) => a - b)
      );
    } else {
      setSuggestedAmounts([]);
    }
  }, [selectedHotelId, selectedHotel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedHotelId || !amount || Number(amount) <= 0) {
      toast({
        title: "Invalid input",
        description: "Please select a hotel and enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, we would save the payment to the database
      // For now, we'll just show a success toast
      
      setTimeout(() => {
        toast({
          title: "Payment recorded",
          description: `₹${amount} received from ${selectedHotel?.name}`,
        });
        
        // Reset form
        setSelectedHotelId("");
        setAmount("");
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error("Error recording payment:", error);
      toast({
        title: "Failed to record payment",
        description: "An error occurred while recording the payment.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleAmountClick = (suggestedAmount: number) => {
    setAmount(suggestedAmount.toString());
  };

  // Calculate payment due date based on payment terms
  const getPaymentDueDate = (hotel: Hotel | undefined) => {
    if (!hotel || !hotel.paymentTerms) return "N/A";
    
    const today = new Date();
    let daysToAdd = 0;
    
    if (hotel.paymentTerms.includes("7days")) {
      daysToAdd = 7;
    } else if (hotel.paymentTerms.includes("15days")) {
      daysToAdd = 15;
    } else if (hotel.paymentTerms.includes("30days")) {
      daysToAdd = 30;
    } else if (hotel.paymentTerms.includes("cash")) {
      return "Immediate Payment";
    }
    
    if (daysToAdd > 0) {
      return format(addDays(today, daysToAdd), "MMM d, yyyy");
    }
    
    return "Custom Terms";
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center">
          <Building2 className="h-4 w-4 mr-1 text-cyan-500" />
          Hotel Payment Collection
        </CardTitle>
        <CardDescription className="text-xs">
          Record payments from hotel clients
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Select
              value={selectedHotelId}
              onValueChange={setSelectedHotelId}
              disabled={isSubmitting}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select hotel" />
              </SelectTrigger>
              <SelectContent>
                {hotels
                  .filter(h => h.isActive !== false)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((hotel) => (
                    <SelectItem 
                      key={hotel.id} 
                      value={hotel.id.toString()}
                      className="text-xs py-1"
                    >
                      {hotel.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedHotel && (
            <div className="bg-muted/40 p-2 rounded-md text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">Payment Terms:</span>
                {selectedHotel.paymentTerms ? (
                  <Badge 
                    variant="outline" 
                    className={`${selectedHotel.paymentTerms.includes("cash") 
                      ? "bg-green-50 text-green-700" 
                      : "bg-amber-50 text-amber-700"}`}
                  >
                    {selectedHotel.paymentTerms.includes("cash") ? "Cash on Delivery" : 
                     selectedHotel.paymentTerms.includes("7days") ? "7 Days Credit" :
                     selectedHotel.paymentTerms.includes("15days") ? "15 Days Credit" :
                     selectedHotel.paymentTerms.includes("30days") ? "30 Days Credit" :
                     selectedHotel.paymentTerms}
                  </Badge>
                ) : (
                  <span className="text-gray-500">Not specified</span>
                )}
              </div>
              
              <div className="flex items-center gap-1 mb-1">
                <CalendarRange className="h-3 w-3 text-gray-500" />
                <span className="font-medium">Due date:</span>
                <span>{getPaymentDueDate(selectedHotel)}</span>
              </div>
              
              {selectedHotel.creditLimit ? (
                <div className="flex items-center gap-1">
                  <BadgeIndianRupee className="h-3 w-3 text-gray-500" />
                  <span className="font-medium">Credit limit:</span>
                  <span>₹{Number(selectedHotel.creditLimit).toLocaleString()}</span>
                </div>
              ) : null}
            </div>
          )}

          <div>
            <Input
              type="number"
              step="0.01"
              min="0"
              className="h-8 text-xs"
              placeholder="Enter amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {suggestedAmounts.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {suggestedAmounts.map((amt) => (
                <motion.button
                  key={amt}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded-md"
                  onClick={() => handleAmountClick(amt)}
                >
                  ₹{amt.toLocaleString()}
                </motion.button>
              ))}
            </div>
          )}

          <Button
            type="submit"
            size="sm"
            className="w-full h-8 text-xs"
            disabled={isSubmitting || !selectedHotelId || !amount}
          >
            {isSubmitting ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              "Record Payment"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}