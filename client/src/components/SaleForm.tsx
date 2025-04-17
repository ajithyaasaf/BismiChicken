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
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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

  const hotelSaleSchema = retailSaleSchema.extend({
    hotelName: z.string().min(1, "Hotel name is required"),
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

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Add New {type === "retail" ? "Retail Sale" : "Hotel Sale"}
        </h3>
        
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            {type === "hotel" && (
              <FormField
                control={form.control}
                name="hotelName"
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
            )}

            <FormField
              control={form.control}
              name="quantityKg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Quantity (kg) {remainingStock > 0 && `(Max: ${remainingStock} kg)`}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max={remainingStock}
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

            <div className="flex items-end">
              <Button
                type="submit"
                disabled={isSubmitting || remainingStock <= 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Sale
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
