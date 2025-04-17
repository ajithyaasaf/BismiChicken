import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertVendorPaymentSchema as baseVendorPaymentSchema, Vendor, MeatTypes, ProductCuts } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { formatDate } from "../utils/helpers";

// Define a form-specific schema for client-side validation
const formSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "Amount must be a positive number" }
  ),
  date: z.string(),
  notes: z.string().optional(),
  meatType: z.string().default(MeatTypes.CHICKEN),
  productCut: z.string().default(ProductCuts.WHOLE)
});

type VendorPaymentFormValues = z.infer<typeof formSchema>;

interface VendorPaymentFormProps {
  vendors: Vendor[];
  date: Date;
  onSubmit: (data: any) => Promise<void>;
}

export default function VendorPaymentForm({
  vendors,
  date,
  onSubmit
}: VendorPaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  
  const selectedVendor = selectedVendorId 
    ? vendors.find(v => v.id.toString() === selectedVendorId) 
    : null;

  const form = useForm<VendorPaymentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendorId: "",
      amount: "",
      date: formatDate(date),
      notes: "",
      meatType: MeatTypes.CHICKEN,
      productCut: ProductCuts.WHOLE
    }
  });

  // Update the date field when the date prop changes
  if (form.getValues().date !== formatDate(date)) {
    form.setValue("date", formatDate(date));
  }

  const handleSubmit = async (values: VendorPaymentFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert string values to appropriate types for the backend
      const formattedValues = {
        ...values,
        vendorId: parseInt(values.vendorId),
        amount: values.amount,  // Keep as string for the backend
        date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD for the backend
        userId: 1, // Default user ID
        meatType: values.meatType || MeatTypes.CHICKEN,
        productCut: values.productCut || ProductCuts.WHOLE
      };
      
      await onSubmit(formattedValues);
      
      // Reset form
      form.reset({
        vendorId: "",
        amount: "",
        date: formatDate(date),
        notes: "",
        meatType: MeatTypes.CHICKEN,
        productCut: ProductCuts.WHOLE
      });
      
      setSelectedVendorId(null);
    } catch (error) {
      console.error("Error submitting payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300, 
        damping: 20 
      }
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardHeader className="px-4 py-3 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">Record Vendor Payment</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Form {...form}>
          <motion.form 
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid grid-cols-1 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="vendorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Vendor</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedVendorId(value);
                      }}
                      value={field.value}
                      disabled={isSubmitting || vendors.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a vendor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id.toString()}>
                            {vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedVendor && Number(selectedVendor.balance) > 0 && (
                      <p className="text-xs text-red-500 mt-1">
                        Current outstanding balance: ₹{selectedVendor.balance}
                      </p>
                    )}
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter payment amount"
                        disabled={isSubmitting || vendors.length === 0}
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
                  <FormItem>
                    <FormLabel className="text-gray-700">Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any notes about this payment"
                        disabled={isSubmitting}
                        className="resize-none"
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
                disabled={isSubmitting || vendors.length === 0}
                className={`
                  inline-flex items-center justify-center
                  h-9 sm:h-10 px-3 sm:px-4 py-0 
                  text-xs sm:text-sm font-medium 
                  rounded-md shadow-sm 
                  text-white bg-primary hover:bg-primary/90 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50
                  transition-all duration-200
                  w-full
                `}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                )}
                <span>Record Payment</span>
              </Button>
            </motion.div>
          </motion.form>
        </Form>
      </CardContent>
    </Card>
  );
}