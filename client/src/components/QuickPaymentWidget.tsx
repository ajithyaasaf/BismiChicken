import { useState, useEffect } from "react";
import { useEnhancedData } from "../context/EnhancedDataContext";
import { useAuth } from "../context/AuthContext";
import { Vendor } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, CoinsIcon } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { addVendorPaymentToFirestore } from "../utils/firestoreHelpers";

export default function QuickPaymentWidget() {
  const { vendors, selectedDate, addVendorPayment } = useEnhancedData();
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedAmounts, setSuggestedAmounts] = useState<Array<number>>([]);

  // Find the selected vendor
  const selectedVendor = vendors.find(
    (vendor) => vendor.id.toString() === selectedVendorId
  );

  // Generate suggested amounts based on vendor balance
  useEffect(() => {
    if (selectedVendor && Number(selectedVendor.balance) > 0) {
      const balance = Number(selectedVendor.balance);
      const suggested: Array<number> = [];
      
      // Full amount
      suggested.push(balance);
      
      // Half
      suggested.push(Math.round(balance / 2));
      
      // Round to nearest thousand (if balance > 2000)
      if (balance > 2000) {
        const roundedThousand = Math.round(balance / 1000) * 1000;
        if (!suggested.includes(roundedThousand)) {
          suggested.push(roundedThousand);
        }
      }
      
      // Add a small amount option
      const smallAmount = Math.min(1000, Math.round(balance / 4));
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
  }, [selectedVendorId, selectedVendor]);

  const { currentUser } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVendorId || !amount || Number(amount) <= 0) {
      toast({
        title: "Invalid input",
        description: "Please select a vendor and enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const paymentData = {
        vendorId: parseInt(selectedVendorId),
        amount,
        date: selectedDate.toISOString().split("T")[0],
        meatType: "chicken", // Default values
        productCut: "whole",
        notes: null // Required field
      };
      
      // Save to backend API
      await addVendorPayment(paymentData);
      
      // Also save to Firestore for redundancy if we have a currentUser
      if (currentUser) {
        try {
          await addVendorPaymentToFirestore(paymentData, currentUser.uid);
        } catch (firestoreError) {
          console.error("Firestore backup failed:", firestoreError);
          // Continue even if Firestore fails
        }
      }
      
      toast({
        title: "Payment recorded",
        description: `₹${amount} paid to ${selectedVendor?.name}`,
      });
      
      // Reset form
      setSelectedVendorId("");
      setAmount("");
    } catch (error) {
      console.error("Error recording payment:", error);
      toast({
        title: "Failed to record payment",
        description: "An error occurred while recording the payment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountClick = (suggestedAmount: number) => {
    setAmount(suggestedAmount.toString());
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center">
          <CoinsIcon className="h-4 w-4 mr-1 text-amber-500" />
          Quick Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Select
              value={selectedVendorId}
              onValueChange={setSelectedVendorId}
              disabled={isSubmitting}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors
                  .filter(v => Number(v.balance) > 0)
                  .sort((a, b) => Number(b.balance) - Number(a.balance))
                  .map((vendor) => (
                    <SelectItem 
                      key={vendor.id} 
                      value={vendor.id.toString()}
                      className="text-xs py-1"
                    >
                      {vendor.name} (₹{vendor.balance})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

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
            disabled={isSubmitting || !selectedVendorId || !amount}
          >
            {isSubmitting ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              "Pay Now"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}