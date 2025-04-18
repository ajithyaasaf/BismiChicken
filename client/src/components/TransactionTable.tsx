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

// Define transaction types to match schema
type TransactionType = "purchase" | "retail" | "hotel" | "payment";

interface TransactionBadgeProps {
  type: TransactionType;
  children: ReactNode;
}

function TransactionBadge({ type, children }: TransactionBadgeProps) {
  // Map transaction types to their respective styles
  const getTypeClass = (transactionType: TransactionType): string => {
    switch (transactionType) {
      case 'purchase':
        return "bg-primary bg-opacity-10 text-primary-dark";
      case 'retail':
        return "bg-green-500 bg-opacity-10 text-green-700";
      case 'hotel':
        return "bg-cyan-500 bg-opacity-10 text-cyan-700";
      case 'payment':
        return "bg-amber-500 bg-opacity-10 text-amber-700";
      default:
        return "bg-gray-500 bg-opacity-10 text-gray-700";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeClass(type)}`}
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

  // Helper function to get a display name for transaction type
  const getTypeName = (type: TransactionType) => {
    switch (type) {
      case "purchase":
        return "Purchase";
      case "retail":
        return "Retail";
      case "hotel":
        return "Hotel";
      case "payment":
        return "Payment";
      default:
        return "Unknown";
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

  // Mobile card view for small screens
  const renderMobileView = () => {
    if (transactions.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 border rounded-md">
          No transactions found for this day
        </div>
      );
    }

    return (
      <div className="space-y-3 md:hidden">
        {transactions.map((transaction) => (
          <div 
            key={`mobile-${transaction.type}-${transaction.id}`} 
            className="border rounded-md p-3 bg-white shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <TransactionBadge type={transaction.type as TransactionType}>
                {getTypeName(transaction.type as TransactionType)}
              </TransactionBadge>
              <span className="text-xs text-gray-500">
                {format(new Date(transaction.timestamp), "hh:mm a")}
              </span>
            </div>
            
            <div className="font-medium text-gray-900 mb-1 text-sm">
              {transaction.type === "purchase"
                ? getVendorName(transaction.details)
                : transaction.details}
            </div>
            
            <div className="grid grid-cols-3 gap-1 text-xs border-t pt-2 mt-2">
              <div>
                <div className="text-gray-500">Quantity</div>
                <div className="font-medium">{transaction.quantityKg} kg</div>
              </div>
              <div>
                <div className="text-gray-500">Rate</div>
                <div className="font-medium">₹{transaction.ratePerKg}</div>
              </div>
              <div>
                <div className="text-gray-500">Amount</div>
                <div className="font-medium">₹{transaction.total.toFixed(2)}</div>
              </div>
            </div>
            
            {onDelete && (
              <div className="mt-2 pt-2 border-t text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(transaction.id, transaction.type)}
                  className="h-8 px-2"
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500 mr-1" />
                  <span className="text-xs">Delete</span>
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Desktop table view for larger screens
  const renderDesktopView = () => (
    <div className="overflow-x-auto hidden md:block">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Type</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Product</TableHead>
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
              <TableCell colSpan={onDelete ? 8 : 7} className="text-center py-8 text-gray-500">
                No transactions found for this day
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={`${transaction.type}-${transaction.id}`} className="hover:bg-gray-50">
                <TableCell>
                  <TransactionBadge type={transaction.type as TransactionType}>
                    {getTypeName(transaction.type as TransactionType)}
                  </TransactionBadge>
                </TableCell>
                <TableCell className="font-medium text-gray-900">
                  {transaction.type === "purchase"
                    ? getVendorName(transaction.details)
                    : transaction.details}
                </TableCell>
                <TableCell>
                  {transaction.meatType && transaction.productCut ? 
                    `${transaction.meatType} ${transaction.productCut}` : 
                    "-"}
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

  return (
    <>
      {renderMobileView()}
      {renderDesktopView()}
    </>
  );
}
