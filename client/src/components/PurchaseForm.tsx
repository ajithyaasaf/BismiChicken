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
  const currentBreakpoint = useBreakpoint();
  
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
        return "grid-cols-4 gap-4";
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4";
    }
  };

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      vendorId: "",
      quantityKg: "",
      ratePerKg: "",
      date: date.toISOString().split("T")[0],
    },
  });

  const handleSubmit = async (values: PurchaseFormValues) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        vendorId: parseInt(values.vendorId),
        quantityKg: parseFloat(values.quantityKg),
        ratePerKg: parseFloat(values.ratePerKg),
        date: values.date || date.toISOString().split("T")[0],
      };
      
      await onSubmit(formattedData);
      form.reset({
        vendorId: "",
        quantityKg: "",
        ratePerKg: "",
        date: date.toISOString().split("T")[0],
      });
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

            <motion.div 
              className="flex items-end"
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
