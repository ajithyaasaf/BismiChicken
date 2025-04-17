import { useState, useId } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MeatTypes, ProductCuts, Vendor } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useBreakpoint } from "../hooks/use-mobile";
import { Loader2, X } from "lucide-react";
import { motion } from "framer-motion";

const vendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  phone: z.string().min(10, "Phone number should be at least 10 digits"),
  notes: z.string().optional(),
  balance: z.string().transform(val => val === "" ? "0" : val).pipe(
    z.string().refine(
      (val) => !isNaN(Number(val)),
      { message: "Balance must be a valid number" }
    )
  ),
  specializedMeatTypes: z.string().optional(),
  specializedProductCuts: z.string().optional(),
  customPricing: z.string().optional(),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: VendorFormValues) => Promise<void>;
  initialData?: Partial<Vendor>;
  isEdit?: boolean;
}

export default function VendorForm({
  open,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
}: VendorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentBreakpoint = useBreakpoint();
  
  // Generate unique IDs for accessibility
  const dialogDescriptionId = useId();
  
  // Determine the grid columns for checkbox layout based on screen size
  const getCheckboxGridCols = () => {
    switch (currentBreakpoint) {
      case 'xs':
        return "grid-cols-1";
      case 'sm': 
        return "grid-cols-2";
      case 'md':
        return "grid-cols-2";
      default:
        return "grid-cols-3";
    }
  };
  
  // Get the right dialog width based on breakpoint
  const getDialogWidth = () => {
    switch (currentBreakpoint) {
      case 'xs':
        return "max-w-[92vw]";
      case 'sm':
        return "max-w-[85vw] sm:max-w-[450px]";
      default:
        return "max-w-[85vw] sm:max-w-[500px]";
    }
  };

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      notes: initialData?.notes || "",
      balance: initialData?.balance?.toString() || "0",
      specializedMeatTypes: initialData?.specializedMeatTypes || "",
      specializedProductCuts: initialData?.specializedProductCuts || "",
      customPricing: initialData?.customPricing || "",
    },
  });

  const handleSubmit = async (values: VendorFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error submitting vendor form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className={`${getDialogWidth()} p-3 sm:p-4 md:p-6 max-h-[90vh] overflow-y-auto rounded-md sm:rounded-lg`}
        aria-describedby={dialogDescriptionId}
      >
        <DialogHeader className="space-y-1 sm:space-y-2 mb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base sm:text-lg md:text-xl">
              {isEdit ? "Edit Vendor" : "Add New Vendor"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full absolute right-3 top-3"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <DialogDescription id={dialogDescriptionId} className="text-xs sm:text-sm">
            {isEdit
              ? "Update vendor information"
              : "Fill in the details to add a new vendor"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 sm:space-y-4 py-1 sm:py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm font-medium">Vendor Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter vendor name" 
                        className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm rounded-md"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm font-medium">Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter phone number" 
                        className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm rounded-md"
                        inputMode="tel"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm font-medium">Outstanding Balance (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter balance amount" 
                        className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm rounded-md"
                        inputMode="decimal"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-[10px] sm:text-xs text-gray-500">
                      {isEdit ? "Current outstanding balance owed to vendor" : "Initial balance owed to this vendor"}
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm font-medium">Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional notes about this vendor"
                      className="min-h-[50px] sm:min-h-[60px] text-xs sm:text-sm rounded-md resize-y"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <motion.div 
              className="space-y-3 sm:space-y-4 py-1"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 border-b pb-1">
                Vendor Specializations
              </h3>

              <FormField
                control={form.control}
                name="specializedMeatTypes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm font-medium">Specialized Meat Types</FormLabel>
                    <FormDescription className="text-[10px] sm:text-xs text-gray-500">
                      Select meat types this vendor specializes in
                    </FormDescription>
                    <FormControl>
                      <Input 
                        placeholder="e.g. chicken,goat,beef" 
                        className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm rounded-md mb-1.5 sm:mb-2"
                        {...field} 
                      />
                    </FormControl>
                    <div className={`grid ${getCheckboxGridCols()} gap-1 sm:gap-2 mt-1`}>
                      {Object.values(MeatTypes).map(type => (
                        <div key={type} className="flex items-center space-x-1.5 sm:space-x-2">
                          <Checkbox 
                            id={`meat-${type}`} 
                            checked={field.value?.includes(type)}
                            className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                            onCheckedChange={(checked) => {
                              const types = field.value ? field.value.split(',').filter(t => t.trim() !== '') : [];
                              if (checked) {
                                if (!types.includes(type)) types.push(type);
                              } else {
                                const index = types.indexOf(type);
                                if (index > -1) types.splice(index, 1);
                              }
                              field.onChange(types.join(','));
                            }}
                          />
                          <Label 
                            htmlFor={`meat-${type}`} 
                            className="capitalize text-[10px] sm:text-xs md:text-sm"
                          >
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specializedProductCuts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm font-medium">Specialized Product Cuts</FormLabel>
                    <FormDescription className="text-[10px] sm:text-xs text-gray-500">
                      Select product cuts this vendor specializes in
                    </FormDescription>
                    <FormControl>
                      <Input 
                        placeholder="e.g. leg,eeral,whole" 
                        className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm rounded-md mb-1.5 sm:mb-2"
                        {...field} 
                      />
                    </FormControl>
                    <div className={`grid ${getCheckboxGridCols()} gap-1 sm:gap-2 mt-1`}>
                      {Object.values(ProductCuts).map(cut => (
                        <div key={cut} className="flex items-center space-x-1.5 sm:space-x-2">
                          <Checkbox 
                            id={`cut-${cut}`} 
                            checked={field.value?.includes(cut)}
                            className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                            onCheckedChange={(checked) => {
                              const cuts = field.value ? field.value.split(',').filter(c => c.trim() !== '') : [];
                              if (checked) {
                                if (!cuts.includes(cut)) cuts.push(cut);
                              } else {
                                const index = cuts.indexOf(cut);
                                if (index > -1) cuts.splice(index, 1);
                              }
                              field.onChange(cuts.join(','));
                            }}
                          />
                          <Label 
                            htmlFor={`cut-${cut}`} 
                            className="capitalize text-[10px] sm:text-xs md:text-sm"
                          >
                            {cut}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customPricing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm font-medium">Custom Pricing</FormLabel>
                    <FormDescription className="text-[10px] sm:text-xs text-gray-500">
                      Add custom pricing for specific product types (JSON format)
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder='e.g. {"chicken-leg": 250, "goat-whole": 800}'
                        className="min-h-[50px] sm:min-h-[60px] text-xs sm:text-sm rounded-md resize-y"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </motion.div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 pt-2 mt-2 sm:mt-3">
              <Button 
                variant="outline" 
                type="button" 
                onClick={onClose}
                className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{isEdit ? "Update Vendor" : "Add Vendor"}</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
