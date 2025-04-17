import { ReactNode } from "react";
import { Transaction } from "@shared/schema";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionBadgeProps {
  type: Transaction["type"];
  children: ReactNode;
}

function TransactionBadge({ type, children }: TransactionBadgeProps) {
  const badgeClasses = {
    purchase: "bg-primary bg-opacity-10 text-primary-dark",
    retail: "bg-green-500 bg-opacity-10 text-green-700",
    hotel: "bg-cyan-500 bg-opacity-10 text-cyan-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClasses[type]}`}
    >
      {children}
    </span>
  );
}

interface TransactionTableProps {
  transactions: Transaction[];
  vendors?: Record<number, string>;
  onDelete?: (id: number, type: Transaction["type"]) => void;
  isLoading?: boolean;
}

export default function TransactionTable({
  transactions,
  vendors = {},
  onDelete,
  isLoading = false,
}: TransactionTableProps) {
  const getVendorName = (details: string) => {
    if (details.startsWith("Vendor ID:")) {
      const vendorId = parseInt(details.split(":")[1].trim());
      return vendors[vendorId] || `Vendor ${vendorId}`;
    }
    return details;
  };

  const getTypeName = (type: Transaction["type"]) => {
    switch (type) {
      case "purchase":
        return "Purchase";
      case "retail":
        return "Retail";
      case "hotel":
        return "Hotel";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Type</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Time</TableHead>
            {onDelete && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={onDelete ? 7 : 6} className="text-center py-8 text-gray-500">
                No transactions found for this day
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={`${transaction.type}-${transaction.id}`} className="hover:bg-gray-50">
                <TableCell>
                  <TransactionBadge type={transaction.type}>
                    {getTypeName(transaction.type)}
                  </TransactionBadge>
                </TableCell>
                <TableCell className="font-medium text-gray-900">
                  {transaction.type === "purchase"
                    ? getVendorName(transaction.details)
                    : transaction.details}
                </TableCell>
                <TableCell>{transaction.quantityKg} kg</TableCell>
                <TableCell>₹{transaction.ratePerKg}</TableCell>
                <TableCell>₹{transaction.total.toFixed(2)}</TableCell>
                <TableCell className="text-gray-500">
                  {format(new Date(transaction.timestamp), "hh:mm a")}
                </TableCell>
                {onDelete && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(transaction.id, transaction.type)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
