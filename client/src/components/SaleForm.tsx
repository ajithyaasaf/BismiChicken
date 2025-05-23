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
        return "grid-cols-1 gap-4";
      case 'sm':
        return "grid-cols-1 gap-4";
      case 'md':
        return `grid-cols-${type === 'hotel' ? '3' : '2'} gap-5`;
      case 'lg':
      case 'xl':
      case 'xxl':
        return "grid-cols-4 gap-5";
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5";
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
  
  // Enhanced animations for form elements
  const formVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 20,
        staggerChildren: 0.07,
        delayChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        mass: 0.8
      }
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-md overflow-hidden">
      <CardContent className="p-5 sm:p-6 md:p-7 transition-all duration-200">
        <motion.h3 
          className="text-base sm:text-lg font-medium text-gray-900 mb-4 sm:mb-5"
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          Add New {type === "retail" ? "Retail Sale" : "Hotel Sale"}
        </motion.h3>
        
        {/* Stock warning for low inventory */}
        <AnimatePresence>
          {remainingStock <= 5 && (
            <motion.div 
              className={`rounded-md mb-4 p-3 text-xs sm:text-sm flex items-center ${
                remainingStock <= 0 
                  ? "bg-red-50 text-red-700" 
                  : "bg-yellow-50 text-yellow-700"
              }`}
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                height: 'auto', 
                scale: 1,
                transition: { 
                  duration: 0.3,
                  type: "spring",
                  stiffness: 500,
                  damping: 25
                }
              }}
              exit={{ 
                opacity: 0, 
                height: 0,
                scale: 0.95,
                transition: { duration: 0.2 }
              }}
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
                    control={form.control}
                    // @ts-ignore - The schema is conditional based on type
                    name="hotelName"
                    render={({ field }) => (
                      <FormItem className="mb-1">
                        <FormLabel className="text-sm font-medium text-gray-700 mb-1.5">Hotel Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter hotel name" 
                            className="h-10 text-sm rounded-md shadow-sm border-gray-300 focus:border-primary focus:ring-primary"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm mt-1" />
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
                  <FormItem className="mb-1">
                    <FormLabel className="text-sm font-medium text-gray-700 flex items-center justify-between mb-1.5">
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
                        className="h-10 text-sm rounded-md shadow-sm border-gray-300 focus:border-primary focus:ring-primary"
                        inputMode="decimal"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm mt-1" />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="ratePerKg"
                render={({ field }) => (
                  <FormItem className="mb-1">
                    <FormLabel className="text-sm font-medium text-gray-700 mb-1.5">Rate per kg (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter rate"
                        className="h-10 text-sm rounded-md shadow-sm border-gray-300 focus:border-primary focus:ring-primary"
                        inputMode="decimal"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm mt-1" />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div 
              className="flex items-end"
              variants={itemVariants}
            >
              <motion.div
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 15 
                }}
                className="w-full sm:w-auto"
              >
                <Button
                  type="submit"
                  disabled={isSubmitting || remainingStock <= 0}
                  className={`
                    inline-flex items-center justify-center
                    h-10 px-4 py-0 
                    text-sm font-medium 
                    rounded-md shadow-sm 
                    text-white bg-primary hover:bg-primary/90 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50
                    transition-all duration-200
                    w-full
                  `}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1.5" />
                  )}
                  <span>Add {type === "retail" ? "Retail" : "Hotel"} Sale</span>
                </Button>
              </motion.div>
            </motion.div>
          </motion.form>
        </Form>
      </CardContent>
    </Card>
  );
}
