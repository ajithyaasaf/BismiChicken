import { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product, ProductPart } from "@shared/schema";
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
import { Scissors, Plus } from "lucide-react";

const productPartSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
});

type ProductPartFormValues = z.infer<typeof productPartSchema>;

interface ProductPartFormProps {
  products: Product[];
  initialData?: Partial<ProductPart>;
  onSubmit: (data: any) => Promise<void>;
  isEdit?: boolean;
}

export default function ProductPartForm({
  products,
  initialData,
  onSubmit,
  isEdit = false,
}: ProductPartFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductPartFormValues>({
    resolver: zodResolver(productPartSchema),
    defaultValues: {
      productId: initialData?.productId?.toString() || "",
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  const handleSubmit = async (values: ProductPartFormValues) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...values,
        productId: parseInt(values.productId),
      };
      
      await onSubmit(formattedData);
      if (!isEdit) {
        form.reset({
          productId: "",
          name: "",
          description: "",
        });
      }
    } catch (error) {
      console.error("Error submitting product part form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Scissors className="h-5 w-5 mr-2 text-primary" />
          {isEdit ? "Edit Product Part" : "Add New Product Part"}
        </h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isEdit}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Part Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter part name (e.g. Leg, Liver, Whole)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a description for this part"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2 flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || products.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
              >
                {isEdit ? (
                  "Update Part"
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Part
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}