import { useState } from "react";
import { useEnhancedData } from "../context/EnhancedDataContext";
import DatePicker from "../components/DatePicker";
import SaleForm from "../components/SaleForm";
import TransactionTable from "../components/TransactionTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import SummaryCard from "../components/SummaryCard";
import { Store } from "lucide-react";

export default function RetailSales() {
  const {
    selectedDate,
    setSelectedDate,
    dailySummary,
    loadingSummary,
    addRetailSale,
    deleteRetailSale,
  } = useEnhancedData();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Filter only retail sale transactions
  const retailTransactions = dailySummary?.transactions.filter(
    (t: { type: string }) => t.type === "retail"
  ) || [];

  const handleAddRetailSale = async (data: any) => {
    await addRetailSale(data);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId !== null) {
      await deleteRetailSale(deleteId);
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  // Calculate remaining stock
  const remainingStock = dailySummary?.remainingKg || 0;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Retail Sales</h2>
        <DatePicker date={selectedDate} onDateChange={setSelectedDate} />
      </div>

      {/* Summary Card */}
      <div className="mb-6">
        <SummaryCard
          title="Retail Sales Summary"
          icon={<Store className="h-5 w-5 text-green-600" />}
          primaryValue={dailySummary ? `${dailySummary.totalRetailSalesKg} kg` : "0 kg"}
          secondaryValue={dailySummary ? `₹${dailySummary.totalRetailSalesRevenue.toFixed(2)}` : "₹0"}
          footerText={dailySummary && dailySummary.totalRetailProfit > 0 
            ? `Profit: ₹${dailySummary.totalRetailProfit.toFixed(2)}` 
            : "No profit yet"
          }
          footerColor="text-green-600"
          isLoading={loadingSummary}
        />
      </div>

      {/* Sales Entry Form */}
      <div className="mb-6">
        <SaleForm 
          type="retail"
          date={selectedDate}
          remainingStock={remainingStock}
          onSubmit={handleAddRetailSale}
        />
      </div>

      {/* Sales Transactions */}
      <Card className="bg-white rounded-lg shadow-sm mb-6">
        <CardHeader className="px-4 py-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <CardTitle>Retail Sales Transactions</CardTitle>
            {!loadingSummary && dailySummary && (
              <div className="text-sm font-medium text-green-600">
                Total Sales: ₹{dailySummary.totalRetailSalesRevenue.toFixed(2)}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingSummary ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <TransactionTable
              transactions={retailTransactions}
              onDelete={(id) => handleDeleteClick(id)}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this retail sale? This action cannot be undone.
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
