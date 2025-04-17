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
import { Building2 } from "lucide-react";

export default function HotelSales() {
  const {
    selectedDate,
    setSelectedDate,
    dailySummary,
    loadingSummary,
    addHotelSale,
    deleteHotelSale,
  } = useEnhancedData();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Filter only hotel sale transactions
  const hotelTransactions = dailySummary?.transactions.filter(
    (t: { type: string }) => t.type === "hotel"
  ) || [];

  const handleAddHotelSale = async (data: any) => {
    await addHotelSale(data);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId !== null) {
      await deleteHotelSale(deleteId);
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  // Calculate remaining stock
  const remainingStock = dailySummary?.remainingKg || 0;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Hotel Sales</h2>
        <DatePicker date={selectedDate} onDateChange={setSelectedDate} />
      </div>

      {/* Summary Card */}
      <div className="mb-6">
        <SummaryCard
          title="Hotel Sales Summary"
          icon={<Building2 className="h-5 w-5 text-cyan-600" />}
          primaryValue={dailySummary ? `${dailySummary.totalHotelSalesKg} kg` : "0 kg"}
          secondaryValue={dailySummary ? `₹${dailySummary.totalHotelSalesRevenue.toFixed(2)}` : "₹0"}
          footerText={dailySummary && dailySummary.totalHotelProfit > 0 
            ? `Profit: ₹${dailySummary.totalHotelProfit.toFixed(2)}` 
            : "No profit yet"
          }
          footerColor="text-cyan-600"
          isLoading={loadingSummary}
        />
      </div>

      {/* Sales Entry Form */}
      <div className="mb-6">
        <SaleForm 
          type="hotel"
          date={selectedDate}
          remainingStock={remainingStock}
          onSubmit={handleAddHotelSale}
        />
      </div>

      {/* Sales Transactions */}
      <Card className="bg-white rounded-lg shadow-sm mb-6">
        <CardHeader className="px-4 py-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <CardTitle>Hotel Sales Transactions</CardTitle>
            {!loadingSummary && dailySummary && (
              <div className="text-sm font-medium text-cyan-600">
                Total Sales: ₹{dailySummary.totalHotelSalesRevenue.toFixed(2)}
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
              transactions={hotelTransactions}
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
              Are you sure you want to delete this hotel sale? This action cannot be undone.
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
