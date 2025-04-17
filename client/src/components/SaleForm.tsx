import { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useBreakpoint } from "../hooks/use-mobile";

interface SaleFormProps {
  type: "retail" | "hotel";
  date: Date;
  remainingStock: number;
  onSubmit: (data: any) => Promise<void>;
}

export default function SaleForm({
  type,
  date,
  remainingStock,
  onSubmit,
}: SaleFormProps) {
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
        return `grid-cols-${type === 'hotel' ? '3' : '2'} gap-4`;
      case 'lg':
      case 'xl':
      case 'xxl':
        return "grid-cols-4 gap-4";
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4";
    }
  };

  // Define schema based on type
  const retailSaleSchema = z.object({
    quantityKg: z
      .string()
      .min(1, "Quantity is required")
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Quantity must be a positive number",
      })
      .refine((val) => Number(val) <= remainingStock, {
        message: `Cannot sell more than available stock (${remainingStock} kg)`,
      }),
    ratePerKg: z.string().min(1, "Rate is required").refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      { message: "Rate must be a positive number" }
    ),
    date: z.string().optional(),
  });

  // Define hotel sale schema as a separate complete schema to avoid type issues
  const hotelSaleSchema = z.object({
    hotelName: z.string().min(1, "Hotel name is required"),
    quantityKg: z
      .string()
      .min(1, "Quantity is required")
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Quantity must be a positive number",
      })
      .refine((val) => Number(val) <= remainingStock, {
        message: `Cannot sell more than available stock (${remainingStock} kg)`,
      }),
    ratePerKg: z.string().min(1, "Rate is required").refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      { message: "Rate must be a positive number" }
    ),
    date: z.string().optional(),
  });

  const schema = type === "retail" ? retailSaleSchema : hotelSaleSchema;
  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      quantityKg: "",
      ratePerKg: "",
      ...(type === "hotel" && { hotelName: "" }),
      date: date.toISOString().split("T")[0],
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...values,
        quantityKg: parseFloat(values.quantityKg as string),
        ratePerKg: parseFloat(values.ratePerKg as string),
        date: values.date || date.toISOString().split("T")[0],
      };
      
      await onSubmit(formattedData);
      form.reset({
        quantityKg: "",
        ratePerKg: "",
        ...(type === "hotel" && { hotelName: "" }),
        date: date.toISOString().split("T")[0],
      });
    } catch (error) {
      console.error(`Error submitting ${type} sale form:`, error);
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
          Add New {type === "retail" ? "Retail Sale" : "Hotel Sale"}
        </motion.h3>
        
        {/* Stock warning for low inventory */}
        <AnimatePresence>
          {remainingStock <= 5 && (
            <motion.div 
              className={`rounded-md mb-3 p-2 text-xs sm:text-sm flex items-center ${
                remainingStock <= 0 
                  ? "bg-red-50 text-red-700" 
                  : "bg-yellow-50 text-yellow-700"
              }`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              {remainingStock <= 0 
                ? "Out of stock! No sales can be made." 
                : `Low stock warning: Only ${remainingStock} kg remaining.`
              }
            </motion.div>
          )}
        </AnimatePresence>
        
        <Form {...form}>
          <motion.form 
            onSubmit={form.handleSubmit(handleSubmit)} 
            className={`grid ${getGridLayout()}`}
            variants={formVariants}
            initial="hidden"
            animate="visible"
          >
            {type === "hotel" && (
              <motion.div variants={itemVariants}>
                {/* Use type assertion to fix TypeScript error with dynamic form field names */}
                {type === "hotel" && (
                  <FormField
                    // @ts-ignore - We know this is valid when type is hotel
                    control={form.control}
                    name="hotelName"
                    render={({ field }) => (
                      <FormItem className="mb-3 sm:mb-4">
                        <FormLabel className="text-sm font-medium text-gray-700">Hotel Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter hotel name" 
                            className="h-9 sm:h-10 text-sm rounded-md"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />
                )}
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="quantityKg"
                render={({ field }) => (
                  <FormItem className="mb-3 sm:mb-4">
                    <FormLabel className="text-sm font-medium text-gray-700 flex items-center justify-between">
                      <span>Quantity (kg)</span>
                      {remainingStock > 0 && (
                        <span className="text-xs text-gray-500">
                          Max: {remainingStock} kg
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max={remainingStock}
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
                disabled={isSubmitting || remainingStock <= 0}
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
                <span>Add {type === "retail" ? "Retail" : "Hotel"} Sale</span>
              </Button>
            </motion.div>
          </motion.form>
        </Form>
      </CardContent>
    </Card>
  );
}
