import { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Vendor } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "../utils/helpers";

const vendorPaymentSchema = z.object({
  vendorId: z.string().min(1, "Please select a vendor"),
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "Amount must be a positive number" }
  ),
  notes: z.string().optional(),
  date: z.string().optional(),
});

type VendorPaymentFormValues = z.infer<typeof vendorPaymentSchema>;

interface VendorPaymentFormProps {
  vendors: Vendor[];
  date: Date;
  onSubmit: (data: any) => Promise<void>;
}

export default function VendorPaymentForm({
  vendors,
  date,
  onSubmit,
}: VendorPaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const form = useForm<VendorPaymentFormValues>({
    resolver: zodResolver(vendorPaymentSchema),
    defaultValues: {
      vendorId: "",
      amount: "",
      notes: "",
      date: date.toISOString().split("T")[0],
    },
  });

  // Watch for vendor changes
  const watchedVendorId = form.watch("vendorId");

  // Update selected vendor when ID changes
  const handleVendorChange = (vendorId: string) => {
    form.setValue("vendorId", vendorId);
    const vendor = vendors.find(v => v.id.toString() === vendorId);
    setSelectedVendor(vendor || null);
  };

  const handleSubmit = async (values: VendorPaymentFormValues) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        vendorId: parseInt(values.vendorId),
        amount: parseFloat(values.amount),
        notes: values.notes || "",
        date: values.date || date.toISOString().split("T")[0],
      };
      
      await onSubmit(formattedData);
      form.reset({
        vendorId: "",
        amount: "",
        notes: "",
        date: date.toISOString().split("T")[0],
      });
      setSelectedVendor(null);
    } catch (error) {
      console.error("Error submitting vendor payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardHeader className="px-4 py-3 border-b border-gray-200">
        <CardTitle className="text-base sm:text-lg font-medium text-gray-900">Make Vendor Payment</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Form {...form}>
          <motion.form 
            onSubmit={form.handleSubmit(handleSubmit)} 
            className="space-y-4"
            variants={formVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="vendorId"
                render={({ field }) => (
                  <FormItem className="mb-3 sm:mb-4">
                    <FormLabel className="text-sm font-medium text-gray-700">Select Vendor</FormLabel>
                    <Select
                      onValueChange={handleVendorChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 sm:h-10 text-sm rounded-md">
                          <SelectValue placeholder="Select Vendor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper" className="max-h-60 overflow-y-auto">
                        {vendors.length === 0 ? (
                          <SelectItem value="no-vendors" disabled>
                            No vendors found
                          </SelectItem>
                        ) : (
                          vendors.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id.toString()}>
                              {vendor.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
            </motion.div>

            {selectedVendor && (
              <motion.div 
                variants={itemVariants}
                className="bg-gray-50 p-3 rounded-md border border-gray-200 mb-3"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-gray-500">Vendor</div>
                    <div className="text-sm font-medium">{selectedVendor.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Outstanding Balance</div>
                    <div className={`text-sm font-medium ${Number(selectedVendor.balance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(Number(selectedVendor.balance))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="mb-3 sm:mb-4">
                    <FormLabel className="text-sm font-medium text-gray-700">Payment Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter payment amount"
                        className="h-9 sm:h-10 text-sm rounded-md"
                        inputMode="decimal"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="mb-3 sm:mb-4">
                    <FormLabel className="text-sm font-medium text-gray-700">Payment Notes</FormLabel>
                    <FormDescription className="text-xs text-gray-500">
                      Optional notes about this payment
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Add any notes about this payment"
                        className="min-h-[60px] text-sm resize-y"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                disabled={isSubmitting || vendors.length === 0 || !selectedVendor}
                className="w-full sm:w-auto flex items-center justify-center"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                <span>Make Payment</span>
              </Button>
            </motion.div>
          </motion.form>
        </Form>
      </CardContent>
    </Card>
  );
}