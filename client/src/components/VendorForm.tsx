import { useState } from "react";
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

const vendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  phone: z.string().min(10, "Phone number should be at least 10 digits"),
  notes: z.string().optional(),
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

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      notes: initialData?.notes || "",
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update vendor information"
              : "Fill in the details to add a new vendor"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter vendor name" {...field} />
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional notes about this vendor"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Vendor Specializations</h3>

              <FormField
                control={form.control}
                name="specializedMeatTypes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialized Meat Types</FormLabel>
                    <FormDescription>
                      Select meat types this vendor specializes in (comma-separated)
                    </FormDescription>
                    <FormControl>
                      <Input 
                        placeholder="e.g. chicken,goat,beef" 
                        {...field} 
                      />
                    </FormControl>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {Object.values(MeatTypes).map(type => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`meat-${type}`} 
                            checked={field.value?.includes(type)}
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
                          <Label htmlFor={`meat-${type}`} className="capitalize">{type}</Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specializedProductCuts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialized Product Cuts</FormLabel>
                    <FormDescription>
                      Select product cuts this vendor specializes in (comma-separated)
                    </FormDescription>
                    <FormControl>
                      <Input 
                        placeholder="e.g. leg,eeral,whole" 
                        {...field} 
                      />
                    </FormControl>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {Object.values(ProductCuts).map(cut => (
                        <div key={cut} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`cut-${cut}`} 
                            checked={field.value?.includes(cut)}
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
                          <Label htmlFor={`cut-${cut}`} className="capitalize">{cut}</Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customPricing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Pricing</FormLabel>
                    <FormDescription>
                      Add custom pricing for specific product types (JSON format)
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder='e.g. {"chicken-leg": 250, "goat-whole": 800}'
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : isEdit
                  ? "Update Vendor"
                  : "Add Vendor"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
