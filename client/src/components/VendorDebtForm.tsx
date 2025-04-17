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
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowDown } from "lucide-react";

const vendorPaymentSchema = z.object({
  vendorId: z.string().min(1, "Please select a vendor"),
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "Amount must be a positive number" }
  ),
  notes: z.string().optional(),
  date: z.string().optional(),
});

type VendorPaymentFormValues = z.infer<typeof vendorPaymentSchema>;

interface VendorDebtFormProps {
  vendors: Vendor[];
  date: Date;
  onSubmit: (data: any) => Promise<void>;
}

export default function VendorDebtForm({
  vendors,
  date,
  onSubmit,
}: VendorDebtFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const form = useForm<VendorPaymentFormValues>({
    resolver: zodResolver(vendorPaymentSchema),
    defaultValues: {
      vendorId: "",
      amount: "",
      notes: "",
      date: date.toISOString().split("T")[0],
    },
  });

  const handleSubmit = async (values: VendorPaymentFormValues) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        vendorId: parseInt(values.vendorId),
        amount: parseFloat(values.amount),
        notes: values.notes || "",
        date: values.date || date.toISOString().split("T")[0],
      };
      
      await onSubmit(formattedData);
      form.reset({
        vendorId: "",
        amount: "",
        notes: "",
        date: date.toISOString().split("T")[0],
      });
      setSelectedVendor(null);
    } catch (error) {
      console.error("Error submitting vendor payment form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVendorChange = (vendorId: string) => {
    const vendor = vendors.find(v => v.id.toString() === vendorId);
    setSelectedVendor(vendor || null);
    form.setValue("vendorId", vendorId);
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Make Vendor Payment</h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormField
                control={form.control}
                name="vendorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <Select
                      onValueChange={handleVendorChange}
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
                <div className="mt-2 p-3 border rounded-md bg-slate-50">
                  <p className="text-sm text-gray-500">Outstanding Debt</p>
                  <p className="text-2xl font-semibold text-red-600">₹{Number(selectedVendor.outstandingDebt).toLocaleString('en-IN')}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter payment amount"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any notes about this payment"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || vendors.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <ArrowDown className="h-4 w-4 mr-1" />
                Record Payment
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}