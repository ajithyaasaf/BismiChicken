import { useState, useEffect } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Vendor, MeatTypes, ProductCuts } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { Plus, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useBreakpoint } from "../hooks/use-mobile";
import { calculateTotal } from "../utils/helpers";

const purchaseSchema = z.object({
  vendorId: z.string().min(1, "Please select a vendor"),
  quantityKg: z.string().min(1, "Quantity is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "Quantity must be a positive number" }
  ),
  ratePerKg: z.string().min(1, "Rate is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "Rate must be a positive number" }
  ),
  meatType: z.string().min(1, "Please select a meat type"),
  productCut: z.string().min(1, "Please select a cut type"),
  paymentAmount: z.string().optional(),
  date: z.string().optional(),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

interface PurchaseFormProps {
  vendors: Vendor[];
  date: Date;
  onSubmit: (data: any) => Promise<void>;
}

export default function PurchaseForm({
  vendors,
  date,
  onSubmit,
}: PurchaseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const currentBreakpoint = useBreakpoint();
  
  // Array of meat types and product cuts
  const meatTypeOptions = Object.values(MeatTypes);
  const productCutOptions = Object.values(ProductCuts);
  
  // Determine grid layout based on breakpoint
  const getGridLayout = () => {
    switch (currentBreakpoint) {
      case 'xs':
        return "grid-cols-1 gap-3";
      case 'sm':
        return "grid-cols-1 gap-3";
      case 'md':
        return "grid-cols-2 gap-4";
      case 'lg':
      case 'xl':
      case 'xxl':
        return "grid-cols-3 gap-4";
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";
    }
  };

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      vendorId: "",
      quantityKg: "",
      ratePerKg: "",
      meatType: MeatTypes.CHICKEN,
      productCut: ProductCuts.WHOLE,
      paymentAmount: "",
      date: date.toISOString().split("T")[0],
    },
  });

  // Watch form values to calculate total in real-time
  const watchedQuantity = form.watch("quantityKg");
  const watchedRate = form.watch("ratePerKg");
  const watchedVendorId = form.watch("vendorId");

  // Update calculated total when quantity or rate changes
  useEffect(() => {
    const quantity = parseFloat(watchedQuantity || "0");
    const rate = parseFloat(watchedRate || "0");
    if (!isNaN(quantity) && !isNaN(rate)) {
      setCalculatedTotal(calculateTotal(quantity, rate));
    } else {
      setCalculatedTotal(0);
    }
  }, [watchedQuantity, watchedRate]);

  // Update selected vendor when vendor ID changes
  useEffect(() => {
    if (watchedVendorId) {
      const vendor = vendors.find(v => v.id.toString() === watchedVendorId);
      setSelectedVendor(vendor || null);
    } else {
      setSelectedVendor(null);
    }
  }, [watchedVendorId, vendors]);

  const handleSubmit = async (values: PurchaseFormValues) => {
    setIsSubmitting(true);
    try {
      const paymentAmount = values.paymentAmount ? parseFloat(values.paymentAmount) : 0;
      const formattedData = {
        vendorId: parseInt(values.vendorId),
        productId: 1, // Default product ID since it's required
        quantityKg: parseFloat(values.quantityKg),
        ratePerKg: parseFloat(values.ratePerKg),
        meatType: values.meatType,
        productCut: values.productCut,
        date: values.date || date.toISOString().split("T")[0],
        payment: paymentAmount > 0 ? {
          vendorId: parseInt(values.vendorId),
          amount: paymentAmount,
          date: values.date || date.toISOString().split("T")[0],
        } : null
      };
      
      await onSubmit(formattedData);
      form.reset({
        vendorId: "",
        quantityKg: "",
        ratePerKg: "",
        meatType: MeatTypes.CHICKEN,
        productCut: ProductCuts.WHOLE,
        paymentAmount: "",
        date: date.toISOString().split("T")[0],
      });
      setCalculatedTotal(0);
    } catch (error) {
      console.error("Error submitting purchase form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Smooth animations for form elements
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
      <CardContent className={`p-3 sm:p-4 md:p-5 transition-all duration-200`}>
        <motion.h3 
          className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Add New Purchase
        </motion.h3>
        
        <Form {...form}>
          <motion.form 
            onSubmit={form.handleSubmit(handleSubmit)} 
            className={`grid ${getGridLayout()}`}
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
                    <FormLabel className="text-sm font-medium text-gray-700">Vendor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
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

            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="quantityKg"
                render={({ field }) => (
                  <FormItem className="mb-3 sm:mb-4">
                    <FormLabel className="text-sm font-medium text-gray-700">Quantity (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter quantity"
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
                name="ratePerKg"
                render={({ field }) => (
                  <FormItem className="mb-3 sm:mb-4">
                    <FormLabel className="text-sm font-medium text-gray-700">Rate per kg (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter rate"
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
                name="meatType"
                render={({ field }) => (
                  <FormItem className="mb-3 sm:mb-4">
                    <FormLabel className="text-sm font-medium text-gray-700">Meat Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 sm:h-10 text-sm rounded-md">
                          <SelectValue placeholder="Select Meat Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper">
                        {meatTypeOptions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="productCut"
                render={({ field }) => (
                  <FormItem className="mb-3 sm:mb-4">
                    <FormLabel className="text-sm font-medium text-gray-700">Cut Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 sm:h-10 text-sm rounded-md">
                          <SelectValue placeholder="Select Cut Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper">
                        {productCutOptions.map((cut) => (
                          <SelectItem key={cut} value={cut}>
                            {cut.charAt(0).toUpperCase() + cut.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Display calculated total */}
            <motion.div variants={itemVariants} className="mb-3 sm:mb-4">
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-1">Total Cost:</div>
                <div className="text-lg font-semibold text-green-700">₹{calculatedTotal.toFixed(2)}</div>
              </div>
            </motion.div>

            {/* Add payment field when vendor is selected */}
            {selectedVendor && (
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="paymentAmount"
                  render={({ field }) => (
                    <FormItem className="mb-3 sm:mb-4">
                      <FormLabel className="text-sm font-medium text-gray-700">Payment Amount (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Enter payment amount (optional)"
                          className="h-9 sm:h-10 text-sm rounded-md"
                          inputMode="decimal"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500 mt-1">
                        {Number(selectedVendor.balance) > 0 ? 
                          `Current balance: ₹${selectedVendor.balance}` : 
                          'No outstanding balance'}
                      </p>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />
              </motion.div>
            )}

            <motion.div 
              className="flex items-end col-span-1 md:col-span-2 lg:col-span-3"
              variants={itemVariants}
            >
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
                  w-full sm:w-auto
                `}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                )}
                <span>Add Purchase</span>
              </Button>
            </motion.div>
          </motion.form>
        </Form>
      </CardContent>
    </Card>
  );
}
