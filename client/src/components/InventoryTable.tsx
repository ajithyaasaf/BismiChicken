import { ProductInventory } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface InventoryTableProps {
  inventory: ProductInventory[];
  isLoading?: boolean;
}

export default function InventoryTable({
  inventory,
  isLoading = false,
}: InventoryTableProps) {
  // Helper to capitalize first letter
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-1">
            <CardTitle>
              <Skeleton className="h-7 w-40" />
            </CardTitle>
            <Skeleton className="h-6 w-20" />
          </div>
          <CardDescription className="flex">
            <span className="w-56"><Skeleton className="h-4 w-full" /></span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                  <TableHead className="text-right"><Skeleton className="h-5 w-full" /></TableHead>
                  <TableHead className="text-right"><Skeleton className="h-5 w-full" /></TableHead>
                  <TableHead className="text-right"><Skeleton className="h-5 w-full" /></TableHead>
                  <TableHead className="text-right"><Skeleton className="h-5 w-full" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Simulate the grouped layout with different meat types */}
                <TableRow className="border-t-2 border-t-gray-200">
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-14 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-14 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-14 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-14 ml-auto" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-14 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-14 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-14 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-14 ml-auto" /></TableCell>
                </TableRow>
                
                <TableRow className="border-t-2 border-t-gray-200">
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-14 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-14 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-14 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-14 ml-auto" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="mt-4">
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (inventory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
          <CardDescription>Track inventory by meat type and cut</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 text-gray-500 border rounded-md flex flex-col items-center">
            <AlertCircle className="h-10 w-10 mb-2 text-amber-500" />
            <h3 className="text-lg font-medium mb-1">No Inventory Data</h3>
            <p className="text-sm max-w-md">
              Add purchases to see detailed inventory tracking by meat type and cut. 
              Inventory is calculated from purchase and sale transactions.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group inventory by meat type for better organization
  const inventoryByType = inventory.reduce((acc, item) => {
    if (!acc[item.meatType]) {
      acc[item.meatType] = [];
    }
    acc[item.meatType].push(item);
    return acc;
  }, {} as Record<string, ProductInventory[]>);

  // Sort meat types in a specific order (chicken first, then others alphabetically)
  const sortedMeatTypes = Object.keys(inventoryByType).sort((a, b) => {
    if (a === 'chicken') return -1;
    if (b === 'chicken') return 1;
    return a.localeCompare(b);
  });

  // Calculate total remaining kg
  const totalRemaining = inventory.reduce((sum, item) => sum + item.remainingKg, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center mb-1">
          <CardTitle>Current Inventory</CardTitle>
          <Badge variant={totalRemaining < 10 ? "destructive" : "outline"} className="ml-2">
            Total: {totalRemaining.toFixed(2)} kg
          </Badge>
        </div>
        <CardDescription>Track inventory by meat type and cut</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mobile-optimized card view for small screens */}
        <div className="space-y-4 md:hidden">
          {sortedMeatTypes.map((meatType) => (
            <div key={`mobile-${meatType}`} className="rounded-md border bg-white overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 border-b">
                <Badge variant="outline" className="bg-gray-50 capitalize">
                  {capitalize(meatType)}
                </Badge>
              </div>
              
              <div className="divide-y">
                {inventoryByType[meatType].map((item) => {
                  // Determine status color for remaining stock
                  const isLowStock = item.remainingKg < 5;
                  const isVeryLowStock = item.remainingKg < 2;
                  const stockStatusColor = isVeryLowStock 
                    ? 'text-red-500' 
                    : isLowStock 
                      ? 'text-amber-500' 
                      : 'text-green-600';
                  
                  return (
                    <div 
                      key={`mobile-${meatType}-${item.productCut}`} 
                      className="p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">{capitalize(item.productCut)}</span>
                        <span className={`font-semibold ${stockStatusColor} flex items-center`}>
                          {item.remainingKg.toFixed(2)} kg
                          {isVeryLowStock && (
                            <AlertCircle className="h-3.5 w-3.5 ml-1 text-red-500" />
                          )}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        <div>
                          <div className="text-gray-500">Purchased</div>
                          <div className="font-medium">{item.purchasedKg.toFixed(2)} kg</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Sold</div>
                          <div className="font-medium">{item.soldKg.toFixed(2)} kg</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Avg. Cost</div>
                          <div className="font-medium">₹{item.avgCostPerKg.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Desktop table view for larger screens */}
        <div className="rounded-md border hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meat Type</TableHead>
                <TableHead>Product Cut</TableHead>
                <TableHead className="text-right">Purchased (kg)</TableHead>
                <TableHead className="text-right">Sold (kg)</TableHead>
                <TableHead className="text-right">Remaining (kg)</TableHead>
                <TableHead className="text-right">Avg. Cost/kg</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMeatTypes.flatMap(meatType => 
                inventoryByType[meatType].map((item, index) => {
                  // Determine status color for remaining stock
                  const isLowStock = item.remainingKg < 5;
                  const isVeryLowStock = item.remainingKg < 2;
                  
                  return (
                    <TableRow key={`${meatType}-${item.productCut}`} 
                      className={index === 0 ? "border-t-2 border-t-gray-200" : ""}>
                      <TableCell className="font-medium capitalize">
                        {index === 0 ? (
                          <Badge variant="outline" className="mr-2 bg-gray-50">
                            {capitalize(item.meatType)}
                          </Badge>
                        ) : ""}
                      </TableCell>
                      <TableCell className="capitalize">{capitalize(item.productCut)}</TableCell>
                      <TableCell className="text-right">{item.purchasedKg.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{item.soldKg.toFixed(2)}</TableCell>
                      <TableCell className={`font-medium text-right ${
                        isVeryLowStock ? 'text-red-500' : 
                        isLowStock ? 'text-amber-500' : 
                        'text-green-600'
                      }`}>
                        {item.remainingKg.toFixed(2)}
                        {isVeryLowStock && (
                          <AlertCircle className="h-4 w-4 inline ml-1 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{item.avgCostPerKg.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Legend for stock status indicators */}
        <div className="mt-4 text-xs text-gray-500 flex flex-wrap items-center">
          <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
          <span className="mr-3">Very Low (&lt; 2kg)</span>
          <span className="inline-block w-3 h-3 bg-amber-500 rounded-full mr-1"></span>
          <span className="mr-3">Low (&lt; 5kg)</span>
          <span className="inline-block w-3 h-3 bg-green-600 rounded-full mr-1"></span>
          <span>Good Stock</span>
        </div>
      </CardContent>
    </Card>
  );
}