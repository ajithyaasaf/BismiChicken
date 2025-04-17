import { useState, useEffect } from "react";
import { useData } from "../context/EnhancedDataContext";
import ProductForm from "../components/ProductForm";
import ProductPartForm from "../components/ProductPartForm";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  PencilIcon, 
  TrashIcon, 
  PackageIcon,
  ScissorsIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product, ProductPart } from "@shared/schema";

export default function Products() {
  const {
    products,
    productParts,
    loadingProducts,
    loadingProductParts,
    addProduct,
    addProductPart,
    deleteProduct,
    deleteProductPart
  } = useData();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState<"product" | "part">("product");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleAddProduct = async (data: any) => {
    await addProduct(data);
  };

  const handleAddProductPart = async (data: any) => {
    await addProductPart(data);
  };

  const handleDeleteClick = (id: number, type: "product" | "part") => {
    setDeleteId(id);
    setDeleteItemType(type);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId !== null) {
      if (deleteItemType === "product") {
        await deleteProduct(deleteId);
      } else {
        await deleteProductPart(deleteId);
      }
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  // Get product name by id (for parts display)
  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : "Unknown";
  };

  // Group parts by product for easier viewing
  const partsByProduct = productParts.reduce((acc, part) => {
    if (!acc[part.productId]) {
      acc[part.productId] = [];
    }
    acc[part.productId].push(part);
    return acc;
  }, {} as Record<number, ProductPart[]>);

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Products Management</h2>
        <p className="text-gray-500 mt-1">
          Add and manage products and parts that you sell in your shop
        </p>
      </div>

      <Tabs defaultValue="products" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="products" className="flex items-center">
            <PackageIcon className="h-4 w-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger value="parts" className="flex items-center">
            <ScissorsIcon className="h-4 w-4 mr-2" />
            Product Parts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Form */}
            <div className="lg:col-span-1">
              <ProductForm onSubmit={handleAddProduct} />
            </div>

            {/* Products List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Product List</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingProducts ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No products have been added yet
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {product.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[300px] truncate">
                              {product.description || "-"}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500"
                                onClick={() => handleDeleteClick(product.id, "product")}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="parts">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Part Form */}
            <div className="lg:col-span-1">
              <ProductPartForm 
                products={products} 
                onSubmit={handleAddProductPart} 
              />
            </div>

            {/* Parts List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Product Parts List</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingProductParts ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : productParts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No product parts have been added yet
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Part Name</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productParts.map((part) => (
                          <TableRow key={part.id}>
                            <TableCell className="font-medium">{part.name}</TableCell>
                            <TableCell>{getProductName(part.productId)}</TableCell>
                            <TableCell className="max-w-[300px] truncate">
                              {part.description || "-"}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500"
                                onClick={() => handleDeleteClick(part.id, "part")}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {deleteItemType === "product" ? "product" : "product part"}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}