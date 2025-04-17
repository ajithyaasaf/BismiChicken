import { useState } from "react";
import { useData } from "../context/EnhancedDataContext";
import DatePicker from "../components/DatePicker";
import PurchaseForm from "../components/PurchaseForm";
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

export default function Purchases() {
  const {
    selectedDate,
    setSelectedDate,
    dailySummary,
    loadingSummary,
    vendors,
    loadingVendors,
    addPurchase,
    deletePurchase,
  } = useData();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Filter only purchase transactions
  const purchaseTransactions = dailySummary?.transactions.filter(
    (t) => t.type === "purchase"
  ) || [];

  // Create a vendor map for display
  const vendorMap: Record<number, string> = {};
  vendors.forEach((vendor) => {
    vendorMap[vendor.id] = vendor.name;
  });

  const handleAddPurchase = async (data: any) => {
    await addPurchase(data);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId !== null) {
      await deletePurchase(deleteId);
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Daily Purchases</h2>
        <DatePicker date={selectedDate} onDateChange={setSelectedDate} />
      </div>

      {/* Purchase Entry Form */}
      <div className="mb-6">
        <PurchaseForm 
          vendors={vendors} 
          date={selectedDate} 
          onSubmit={handleAddPurchase} 
        />
      </div>

      {/* Purchase Summary */}
      <Card className="bg-white rounded-lg shadow-sm mb-6">
        <CardHeader className="px-4 py-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <CardTitle>Today's Purchases</CardTitle>
            {!loadingSummary && dailySummary && (
              <div className="text-sm font-medium text-gray-500">
                Total: {dailySummary.totalPurchasedKg} kg • ₹{dailySummary.totalPurchaseCost.toFixed(2)}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingSummary || loadingVendors ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <TransactionTable
              transactions={purchaseTransactions}
              vendors={vendorMap}
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
              Are you sure you want to delete this purchase? This action cannot be undone.
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
