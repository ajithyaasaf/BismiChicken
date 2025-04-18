import { useState, useEffect } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Hotel, Product, ProductPart } from "@shared/schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Building2, Plus, ArrowRight, ShoppingCart, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface QuickOrderItem {
  productId: string;
  quantityKg: string;
  ratePerKg: string;
}

const quickOrderSchema = z.object({
  hotelId: z.string().min(1, "Hotel is required"),
  billNumber: z.string().min(1, "Bill number is required"),
  date: z.string().min(1, "Date is required"),
  items: z.array(
    z.object({
      productId: z.string().min(1, "Product is required"),
      quantityKg: z.string().min(1, "Quantity is required"),
      ratePerKg: z.string().min(1, "Rate is required"),
    })
  ).min(1, "At least one item is required"),
});

type QuickOrderFormValues = z.infer<typeof quickOrderSchema>;

interface QuickHotelOrderFormProps {
  hotels: Hotel[];
  products: Product[];
  productParts: ProductPart[];
  date: Date;
  onSubmit: (data: any) => Promise<void>;
}

export default function QuickHotelOrderForm({
  hotels,
  products,
  productParts,
  date,
  onSubmit,
}: QuickHotelOrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [suggestedOrders, setSuggestedOrders] = useState<any[]>([]);

  // Generate a default bill number: BILL-YYYYMMDD-XXX
  const defaultBillNumber = `BILL-${format(date, 'yyyyMMdd')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

  const form = useForm<QuickOrderFormValues>({
    resolver: zodResolver(quickOrderSchema),
    defaultValues: {
      hotelId: "",
      billNumber: defaultBillNumber,
      date: date.toISOString().split("T")[0],
      items: [
        {
          productId: "",
          quantityKg: "",
          ratePerKg: "",
        },
      ],
    },
  });

  // When a hotel is selected, check if they have preferred products/regular orders
  useEffect(() => {
    const hotelId = form.watch("hotelId");
    if (!hotelId) {
      setSelectedHotel(null);
      setSuggestedOrders([]);
      return;
    }

    const hotel = hotels.find(h => h.id.toString() === hotelId);
    if (hotel) {
      setSelectedHotel(hotel);
      
      // Try to parse preferred products if available
      if (hotel.preferredProducts) {
        try {
          // If it's a valid JSON string, parse it
          const preferredProducts = JSON.parse(hotel.preferredProducts);
          if (Array.isArray(preferredProducts)) {
            setSuggestedOrders(preferredProducts);
          } else if (typeof preferredProducts === 'object') {
            // Convert object format to array format
            const orders = Object.entries(preferredProducts).map(([productId, details]) => {
              return {
                productId,
                ...(typeof details === 'object' ? details : { quantityKg: details }),
              };
            });
            setSuggestedOrders(orders);
          }
        } catch (e) {
          // If it's not valid JSON, try to extract information from the text
          const products = hotel.preferredProducts.split(',').map(item => item.trim());
          const extractedItems = [];
          
          for (const product of products) {
            // Try to extract quantity and product name using regex
            const match = product.match(/(\d+(?:\.\d+)?)\s*kg\s+(.+)/i);
            if (match) {
              const [_, quantity, productName] = match;
              // Find product ID by name (approximate match)
              const matchedProduct = findProductByName(productName);
              if (matchedProduct) {
                extractedItems.push({
                  productId: matchedProduct.id.toString(),
                  quantityKg: quantity,
                  // Use a default rate since products don't have a defaultRate property
                  ratePerKg: "150", // Default rate
                });
              }
            }
          }
          
          if (extractedItems.length > 0) {
            setSuggestedOrders(extractedItems);
          }
        }
      } else {
        setSuggestedOrders([]);
      }
    }
  }, [form.watch("hotelId"), hotels, products]);
  
  // Helper function to find a product by name (approximate match)
  const findProductByName = (name: string) => {
    const lowerName = name.toLowerCase();
    return products.find(p => 
      p.name.toLowerCase().includes(lowerName) || 
      lowerName.includes(p.name.toLowerCase())
    );
  };

  // Apply suggested orders to the form
  const applySuggestedOrders = () => {
    if (suggestedOrders.length === 0) return;
    
    // Convert suggested orders to form format
    const formattedItems = suggestedOrders.map(item => ({
      productId: item.productId.toString(),
      quantityKg: item.quantityKg.toString(),
      ratePerKg: item.ratePerKg.toString(),
    }));
    
    // Update the form
    form.setValue("items", formattedItems);
  };

  const handleSubmit = async (values: QuickOrderFormValues) => {
    setIsSubmitting(true);
    try {
      // Calculate totals
      const formattedData = {
        ...values,
        items: values.items.map(item => ({
          ...item,
          quantityKg: parseFloat(item.quantityKg),
          ratePerKg: parseFloat(item.ratePerKg),
          total: parseFloat(item.quantityKg) * parseFloat(item.ratePerKg),
        })),
        // Calculate total amount
        totalAmount: values.items.reduce(
          (sum, item) => sum + parseFloat(item.quantityKg) * parseFloat(item.ratePerKg),
          0
        ),
      };

      await onSubmit(formattedData);
      
      // Reset form
      form.reset({
        hotelId: "",
        billNumber: `BILL-${format(date, 'yyyyMMdd')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        date: date.toISOString().split("T")[0],
        items: [
          {
            productId: "",
            quantityKg: "",
            ratePerKg: "",
          },
        ],
      });
      
      setSelectedHotel(null);
      setSuggestedOrders([]);
    } catch (error) {
      console.error("Error submitting quick order form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get product name by id
  const getProductName = (productId: string) => {
    const product = products.find(p => p.id.toString() === productId);
    return product ? product.name : "Unknown product";
  };

  // Add a new item to the form
  const addItem = () => {
    const currentItems = form.getValues("items");
    form.setValue("items", [
      ...currentItems,
      { productId: "", quantityKg: "", ratePerKg: "" },
    ]);
  };

  // Remove an item from the form
  const removeItem = (index: number) => {
    const currentItems = form.getValues("items");
    if (currentItems.length > 1) {
      form.setValue(
        "items",
        currentItems.filter((_, i) => i !== index)
      );
    }
  };

  // Calculate the total bill amount
  const calculateTotalAmount = () => {
    const items = form.getValues("items");
    return items.reduce((total, item) => {
      const quantity = parseFloat(item.quantityKg) || 0;
      const rate = parseFloat(item.ratePerKg) || 0;
      return total + quantity * rate;
    }, 0);
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium text-gray-900 flex items-center">
          <ShoppingCart className="h-5 w-5 mr-2 text-primary" />
          Quick Hotel Order
        </CardTitle>
        <CardDescription>
          Create orders quickly for your regular hotel clients
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Order Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="hotelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
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
                          hotels.filter(hotel => hotel.isActive !== false).map((hotel) => (
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
                      <Input placeholder="Enter bill number" {...field} />
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
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Hotel Details Summary */}
            {selectedHotel && (
              <div className="bg-muted/50 p-3 rounded-md mb-2">
                <h4 className="text-sm font-medium mb-2">Hotel Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Contact:</span> {selectedHotel.contactPerson || 'Not specified'}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {selectedHotel.phone}
                  </div>
                  <div>
                    <span className="font-medium">Delivery:</span> {selectedHotel.preferredDeliveryTime || 'Not specified'}
                  </div>
                </div>
                
                {suggestedOrders.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Regular Order Pattern</p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={applySuggestedOrders}
                        className="h-7 text-xs"
                      >
                        Apply Regular Order
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {suggestedOrders.map((item, i) => (
                        <Badge key={i} variant="outline" className="bg-primary/10">
                          {getProductName(item.productId.toString())}: {item.quantityKg} kg
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Order Items */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Order Items</h4>
              
              {form.getValues("items").map((_, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                  <FormField
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-5">
                        <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                          Product
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem
                                key={product.id}
                                value={product.id.toString()}
                              >
                                {product.name}
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
                      <FormItem className="md:col-span-3">
                        <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                          Quantity (kg)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min="0.1"
                            placeholder="Quantity"
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
                      <FormItem className="md:col-span-3">
                        <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                          Rate (₹/kg)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            min="1"
                            placeholder="Rate"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-1 flex justify-end">
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="h-10 w-10 text-destructive"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>

            {/* Order Summary */}
            <div className="flex justify-between items-center bg-muted/30 p-3 rounded-md">
              <div>
                <span className="font-semibold text-lg">Total:</span>{" "}
                <span className="font-semibold text-lg text-primary">
                  ₹{calculateTotalAmount().toFixed(2)}
                </span>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? "Creating..." : "Create Order"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}