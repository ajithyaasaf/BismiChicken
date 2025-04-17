import { useState, useEffect } from "react";
import * as z from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Hotel, Product, ProductPart } from "@shared/schema";
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
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Plus, Trash2, FileText, PlusCircle } from "lucide-react";
import { calculateTotal } from "../utils/helpers";
import { format } from "date-fns";

// Schema for line items
const billItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  partId: z.string().optional(),
  quantityKg: z.string().min(1, "Quantity is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "Quantity must be a positive number" }
  ),
  ratePerKg: z.string().min(1, "Rate is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "Rate must be a positive number" }
  ),
});

// Schema for the entire bill
const hotelBillSchema = z.object({
  hotelId: z.string().min(1, "Please select a hotel"),
  billNumber: z.string().min(1, "Bill number is required"),
  date: z.string().optional(),
  items: z.array(billItemSchema).min(1, "At least one item is required"),
});

type BillItemValues = z.infer<typeof billItemSchema>;
type HotelBillFormValues = z.infer<typeof hotelBillSchema>;

interface HotelBillFormProps {
  hotels: Hotel[];
  products: Product[];
  productParts: ProductPart[];
  date: Date;
  onSubmit: (data: any) => Promise<void>;
}

export default function HotelBillForm({
  hotels,
  products,
  productParts,
  date,
  onSubmit,
}: HotelBillFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Record<number, string>>({});
  const [availableParts, setAvailableParts] = useState<Record<number, ProductPart[]>>({});
  const [billTotal, setBillTotal] = useState(0);

  // Generate a default bill number: BILL-YYYYMMDD-XXX
  const defaultBillNumber = `BILL-${format(date, 'yyyyMMdd')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

  const form = useForm<HotelBillFormValues>({
    resolver: zodResolver(hotelBillSchema),
    defaultValues: {
      hotelId: "",
      billNumber: defaultBillNumber,
      date: date.toISOString().split("T")[0],
      items: [
        {
          productId: "",
          partId: "",
          quantityKg: "",
          ratePerKg: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Calculate bill total whenever items change
  const items = form.watch("items");
  
  useEffect(() => {
    let total = 0;
    items.forEach((item) => {
      if (item.quantityKg && item.ratePerKg) {
        total += calculateTotal(
          parseFloat(item.quantityKg),
          parseFloat(item.ratePerKg)
        );
      }
    });
    setBillTotal(total);
  }, [items]);

  // Handle product selection in a specific row
  const handleProductChange = (productId: string, index: number) => {
    form.setValue(`items.${index}.productId`, productId);
    form.setValue(`items.${index}.partId`, ""); // Reset part selection
    
    // Store the selected product for this row
    setSelectedProducts(prev => ({
      ...prev,
      [index]: productId
    }));

    // Filter parts for this product
    const filteredParts = productParts.filter(
      part => part.productId.toString() === productId
    );
    
    // Store available parts for this row
    setAvailableParts(prev => ({
      ...prev,
      [index]: filteredParts
    }));
  };

  const handleSubmit = async (values: HotelBillFormValues) => {
    setIsSubmitting(true);
    try {
      const formattedItems = values.items.map(item => ({
        productId: parseInt(item.productId),
        partId: item.partId ? parseInt(item.partId) : undefined,
        quantityKg: parseFloat(item.quantityKg),
        ratePerKg: parseFloat(item.ratePerKg),
        total: calculateTotal(parseFloat(item.quantityKg), parseFloat(item.ratePerKg)),
      }));

      const formattedData = {
        hotelId: parseInt(values.hotelId),
        billNumber: values.billNumber,
        date: values.date || date.toISOString().split("T")[0],
        totalAmount: billTotal,
        items: formattedItems,
      };
      
      await onSubmit(formattedData);
      
      // Reset form to initial state
      form.reset({
        hotelId: "",
        billNumber: `BILL-${format(date, 'yyyyMMdd')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        date: date.toISOString().split("T")[0],
        items: [
          {
            productId: "",
            partId: "",
            quantityKg: "",
            ratePerKg: "",
          },
        ],
      });
      
      setSelectedProducts({});
      setAvailableParts({});
      setBillTotal(0);
    } catch (error) {
      console.error("Error submitting hotel bill form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add another line item
  const addLineItem = () => {
    append({
      productId: "",
      partId: "",
      quantityKg: "",
      ratePerKg: "",
    });
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-primary" />
          Create Hotel Bill
        </h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {/* Header Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <FormField
                control={form.control}
                name="hotelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Hotel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hotels.length === 0 ? (
                          <SelectItem value="no-hotels" disabled>
                            No hotels found
                          </SelectItem>
                        ) : (
                          hotels.map((hotel) => (
                            <SelectItem key={hotel.id} value={hotel.id.toString()}>
                              {hotel.name}
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
                name="billNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter bill number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Line Items */}
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-700 mb-2">Bill Items</h4>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-md bg-gray-50 relative">
                    {index > 0 && (
                      <Button 
                        type="button" 
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 rounded-full"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <FormField
                      control={form.control}
                      name={`items.${index}.productId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product</FormLabel>
                          <Select
                            onValueChange={(value) => handleProductChange(value, index)}
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
                      name={`items.${index}.partId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Part</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={!selectedProducts[index] || !availableParts[index]?.length}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={
                                  !selectedProducts[index] 
                                    ? "Select product first" 
                                    : !availableParts[index]?.length
                                    ? "No parts available"
                                    : "Select Part"
                                } />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Whole (Default)</SelectItem>
                              {availableParts[index]?.map((part) => (
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

                    <FormField
                      control={form.control}
                      name={`items.${index}.quantityKg`}
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
                      name={`items.${index}.ratePerKg`}
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

                    <div>
                      <FormLabel>Amount</FormLabel>
                      <div className="h-10 px-3 py-2 rounded-md border border-gray-300 bg-white flex items-center">
                        ₹{items[index].quantityKg && items[index].ratePerKg
                            ? calculateTotal(
                                parseFloat(items[index].quantityKg),
                                parseFloat(items[index].ratePerKg)
                              ).toFixed(2)
                            : "0.00"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={addLineItem}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="flex justify-between items-center mt-6">
              <div className="p-4 border rounded-md bg-blue-50">
                <p className="text-sm text-gray-500">Bill Total</p>
                <p className="text-2xl font-semibold text-blue-600">₹{billTotal.toFixed(2)}</p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || hotels.length === 0 || products.length === 0}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
              >
                <FileText className="h-4 w-4 mr-1" />
                Create Bill
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}