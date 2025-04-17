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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
          <CardTitle>
            <Skeleton className="h-8 w-1/3" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Skeleton className="h-5 w-full" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-full" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-full" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-full" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-full" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 text-gray-500">
            No inventory data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
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
              {inventory.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="capitalize">{capitalize(item.meatType)}</TableCell>
                  <TableCell className="capitalize">{capitalize(item.productCut)}</TableCell>
                  <TableCell className="text-right">{item.purchasedKg.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.soldKg.toFixed(2)}</TableCell>
                  <TableCell className="font-medium text-right">
                    {item.remainingKg.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{item.avgCostPerKg.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}