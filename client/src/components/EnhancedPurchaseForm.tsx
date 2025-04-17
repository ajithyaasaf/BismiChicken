import { useState, useEffect } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Vendor, Product, ProductPart } from "@shared/schema";
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
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, ShoppingBag } from "lucide-react";
import { calculateTotal } from "../utils/helpers";

const purchaseSchema = z.object({
  vendorId: z.string().min(1, "Please select a vendor"),
  productId: z.string().min(1, "Please select a product"),
  partId: z.string().optional(),
  quantityKg: z.string().min(1, "Quantity is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "Quantity must be a positive number" }
  ),
  ratePerKg: z.string().min(1, "Rate is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "Rate must be a positive number" }
  ),
  updateDebt: z.boolean().default(true),
  date: z.string().optional(),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

interface EnhancedPurchaseFormProps {
  vendors: Vendor[];
  products: Product[];
  productParts: ProductPart[];
  date: Date;
  onSubmit: (data: any) => Promise<void>;
}

export default function EnhancedPurchaseForm({
  vendors,
  products,
  productParts,
  date,
  onSubmit,
}: EnhancedPurchaseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [availableParts, setAvailableParts] = useState<ProductPart[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      vendorId: "",
      productId: "",
      partId: "",
      quantityKg: "",
      ratePerKg: "",
      updateDebt: true,
      date: date.toISOString().split("T")[0],
    },
  });

  // Watch form values to calculate total
  const quantityKg = form.watch("quantityKg");
  const ratePerKg = form.watch("ratePerKg");
  const vendorId = form.watch("vendorId");
  const productId = form.watch("productId");

  // Update total when quantity or rate changes
  useEffect(() => {
    if (quantityKg && ratePerKg) {
      const calculatedTotal = calculateTotal(
        parseFloat(quantityKg),
        parseFloat(ratePerKg)
      );
      setTotal(calculatedTotal);
    } else {
      setTotal(0);
    }
  }, [quantityKg, ratePerKg]);

  // Update selected vendor when vendorId changes
  useEffect(() => {
    if (vendorId) {
      const vendor = vendors.find(v => v.id.toString() === vendorId);
      setSelectedVendor(vendor || null);
    } else {
      setSelectedVendor(null);
    }
  }, [vendorId, vendors]);

  // Filter parts when product changes
  useEffect(() => {
    if (productId) {
      setSelectedProduct(productId);
      const filteredParts = productParts.filter(
        part => part.productId.toString() === productId
      );
      setAvailableParts(filteredParts);
      
      // Reset part selection when product changes
      form.setValue("partId", "");
    } else {
      setSelectedProduct(null);
      setAvailableParts([]);
    }
  }, [productId, productParts, form]);

  const handleSubmit = async (values: PurchaseFormValues) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        vendorId: parseInt(values.vendorId),
        productId: parseInt(values.productId),
        partId: values.partId ? parseInt(values.partId) : undefined,
        quantityKg: parseFloat(values.quantityKg),
        ratePerKg: parseFloat(values.ratePerKg),
        total: calculateTotal(parseFloat(values.quantityKg), parseFloat(values.ratePerKg)),
        updateDebt: values.updateDebt,
        date: values.date || date.toISOString().split("T")[0],
      };
      
      await onSubmit(formattedData);
      form.reset({
        vendorId: "",
        productId: "",
        partId: "",
        quantityKg: "",
        ratePerKg: "",
        updateDebt: true,
        date: date.toISOString().split("T")[0],
      });
      setSelectedProduct(null);
      setAvailableParts([]);
      setTotal(0);
      setSelectedVendor(null);
    } catch (error) {
      console.error("Error submitting purchase form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <ShoppingBag className="h-5 w-5 mr-2 text-primary" />
          Add New Purchase
        </h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* First Column */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="vendorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Vendor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedVendor && (
                <div className="p-3 border rounded-md bg-slate-50">
                  <p className="text-sm text-gray-500">Outstanding Debt</p>
                  <p className="text-2xl font-semibold text-red-600">₹{Number(selectedVendor.outstandingDebt).toLocaleString('en-IN')}</p>
                </div>
              )}
            </div>

            {/* Second Column */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.length === 0 ? (
                          <SelectItem value="no-products" disabled>
                            No products found
                          </SelectItem>
                        ) : (
                          products.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name} ({product.category})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="partId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!selectedProduct || availableParts.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            !selectedProduct 
                              ? "Select a product first" 
                              : availableParts.length === 0 
                              ? "No parts available" 
                              : "Select Part"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Whole (Default)</SelectItem>
                        {availableParts.map((part) => (
                          <SelectItem key={part.id} value={part.id.toString()}>
                            {part.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Third Column */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="quantityKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter quantity"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ratePerKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate per kg (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter rate"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fourth Row - Total */}
            <div className="md:col-span-2 p-3 border rounded-md bg-blue-50">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-semibold text-blue-600">₹{total.toFixed(2)}</p>
            </div>

            {/* Update Debt Checkbox */}
            <div className="flex items-center">
              <FormField
                control={form.control}
                name="updateDebt"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Add to vendor debt
                      </FormLabel>
                      <p className="text-xs text-gray-500">
                        This will update the vendor's outstanding debt
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="md:col-span-3 flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || vendors.length === 0 || products.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Purchase
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}