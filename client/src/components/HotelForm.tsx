import { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Hotel } from "@shared/schema";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Plus, Calendar, ClockIcon, Bell, Truck, CreditCard } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";

// Define constants for dropdown options
const ORDER_FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "alternate_days", label: "Alternate Days" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "on_demand", label: "On Demand" },
];

const PAYMENT_TERMS_OPTIONS = [
  { value: "cash", label: "Cash on Delivery" },
  { value: "7days", label: "7 Days Credit" },
  { value: "15days", label: "15 Days Credit" },
  { value: "30days", label: "30 Days Credit" },
  { value: "prepaid", label: "Prepaid" },
  { value: "custom", label: "Custom Terms" },
];

const DELIVERY_TIME_OPTIONS = [
  { value: "morning", label: "Morning (6am-10am)" },
  { value: "midday", label: "Midday (10am-2pm)" },
  { value: "afternoon", label: "Afternoon (2pm-6pm)" },
  { value: "evening", label: "Evening (6pm-10pm)" },
  { value: "custom", label: "Custom Time" },
];

// Enhanced schema with all fields
const hotelSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  notes: z.string().optional(),
  // New fields
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  orderFrequency: z.string().optional(),
  preferredDeliveryTime: z.string().optional(),
  deliveryNotes: z.string().optional(),
  paymentTerms: z.string().optional(),
  creditLimit: z.number().nonnegative("Credit limit must be a positive value").optional().or(z.coerce.number().nonnegative()),
  preferredProducts: z.string().optional(), // JSON string will be handled in the form
  isActive: z.boolean().default(true),
});

type HotelFormValues = z.infer<typeof hotelSchema>;

interface HotelFormProps {
  initialData?: Partial<Hotel>;
  onSubmit: (data: any) => Promise<void>;
  isEdit?: boolean;
}

export default function HotelForm({
  initialData,
  onSubmit,
  isEdit = false,
}: HotelFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const form = useForm<HotelFormValues>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      contactPerson: initialData?.contactPerson || "",
      notes: initialData?.notes || "",
      // New fields with defaults
      email: initialData?.email || "",
      orderFrequency: initialData?.orderFrequency || "",
      preferredDeliveryTime: initialData?.preferredDeliveryTime || "",
      deliveryNotes: initialData?.deliveryNotes || "",
      paymentTerms: initialData?.paymentTerms || "",
      creditLimit: initialData?.creditLimit ? Number(initialData.creditLimit) : 0,
      preferredProducts: initialData?.preferredProducts || "",
      isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    },
  });

  const handleSubmit = async (values: HotelFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      if (!isEdit) {
        form.reset({
          name: "",
          phone: "",
          address: "",
          contactPerson: "",
          notes: "",
          // Reset new fields too
          email: "",
          orderFrequency: "",
          preferredDeliveryTime: "",
          deliveryNotes: "",
          paymentTerms: "",
          creditLimit: 0,
          preferredProducts: "",
          isActive: true,
        });
      }
    } catch (error) {
      console.error("Error submitting hotel form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium text-gray-900 flex items-center">
          <Building2 className="h-5 w-5 mr-2 text-primary" />
          {isEdit ? "Edit Hotel" : "Add New Hotel"}
        </CardTitle>
        <CardDescription>
          Add hotel details with order preferences for easier daily sales
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Tabs 
              defaultValue="basic" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="orders">Order Preferences</TabsTrigger>
                <TabsTrigger value="billing">Billing & Payments</TabsTrigger>
              </TabsList>
              
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hotel Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter hotel name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email address" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact person name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter hotel address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Active Status</FormLabel>
                          <FormDescription>
                            Mark this hotel as active for regular business
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              {/* Order Preferences Tab */}
              <TabsContent value="orders" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="orderFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select order frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ORDER_FREQUENCY_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How often this hotel typically orders from you
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="preferredDeliveryTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Delivery Time</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select delivery time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DELIVERY_TIME_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          When they prefer to receive deliveries
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="deliveryNotes"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Delivery Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Special delivery instructions or notes"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Special instructions for deliveries (e.g., "Deliver to kitchen entrance")
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="preferredProducts"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Regular Products</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Notes about their regular product orders"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Note their typical order quantities (e.g., "10kg chicken, 5kg mutton daily")
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              {/* Billing & Payments Tab */}
              <TabsContent value="billing" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Terms</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment terms" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PAYMENT_TERMS_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How they typically pay for orders
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="creditLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credit Limit (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            step="100"
                            placeholder="Enter credit limit" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum credit allowed (0 for no credit)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional notes about this hotel"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 flex justify-between">
              {activeTab !== "basic" && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    if (activeTab === "orders") setActiveTab("basic");
                    if (activeTab === "billing") setActiveTab("orders");
                  }}
                >
                  Previous
                </Button>
              )}
              
              <div className="ml-auto flex gap-2">
                {activeTab !== "billing" ? (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      if (activeTab === "basic") setActiveTab("orders");
                      if (activeTab === "orders") setActiveTab("billing");
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center"
                  >
                    {isEdit ? (
                      "Update Hotel"
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Hotel
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}