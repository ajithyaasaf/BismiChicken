import { useState } from "react";
import { useEnhancedData } from "../context/EnhancedDataContext";
import DatePicker from "../components/DatePicker";
import VendorPaymentForm from "../components/VendorPaymentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "../utils/helpers";

export default function VendorPayments() {
  const {
    vendors,
    selectedDate,
    setSelectedDate,
    vendorPayments,
    loadingVendors,
    loadingVendorPayments,
    addVendorPayment,
    deleteVendorPayment,
  } = useEnhancedData();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState<number | null>(null);

  // Get vendor name by ID
  const getVendorName = (vendorId: number) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name : "Unknown Vendor";
  };

  const handleDeletePayment = (id: number) => {
    setDeletingPaymentId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingPaymentId) {
      try {
        await deleteVendorPayment(deletingPaymentId);
      } catch (error) {
        console.error("Error deleting payment:", error);
      }
      setDeleteDialogOpen(false);
    }
  };

  const handleSubmitPayment = async (data: any) => {
    await addVendorPayment(data);
  };

  // Group payments by vendor for better display
  const vendorGroupedPayments = vendorPayments.reduce((acc, payment) => {
    const vendorName = getVendorName(payment.vendorId);
    if (!acc[vendorName]) {
      acc[vendorName] = [];
    }
    acc[vendorName].push(payment);
    return acc;
  }, {} as Record<string, typeof vendorPayments>);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Vendor Payments</h2>
        <DatePicker date={selectedDate} onDateChange={setSelectedDate} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor Payment Form */}
        <div className="lg:col-span-1">
          <VendorPaymentForm
            vendors={vendors}
            date={selectedDate}
            onSubmit={handleSubmitPayment}
          />
        </div>

        {/* Payment History */}
        <div className="lg:col-span-2">
          <Card className="bg-white rounded-lg shadow-sm">
            <CardHeader className="px-4 py-3 border-b border-gray-200">
              <CardTitle className="text-lg font-medium text-gray-900">Payment History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingVendorPayments || loadingVendors ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : vendorPayments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <p className="text-gray-500 mb-2">No payments found for this date</p>
                  <p className="text-sm text-gray-400">Payments made to vendors will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(vendorGroupedPayments).map(([vendorName, payments]) => (
                        payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">{vendorName}</TableCell>
                            <TableCell className="text-green-600 font-medium">
                              {formatCurrency(Number(payment.amount))}
                            </TableCell>
                            <TableCell>{formatDate(new Date(payment.date))}</TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {payment.notes || "-"}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletePayment(payment.id)}
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete payment</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Vendor Balance Summary */}
      <div className="mt-6">
        <Card className="bg-white rounded-lg shadow-sm">
          <CardHeader className="px-4 py-3 border-b border-gray-200">
            <CardTitle className="text-lg font-medium text-gray-900">Vendor Balances</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingVendors ? (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : vendors.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 text-center">
                <p className="text-gray-500">No vendors found</p>
                <p className="text-sm text-gray-400">Add vendors to track balances</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Outstanding Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">{vendor.name}</TableCell>
                        <TableCell>{vendor.phone}</TableCell>
                        <TableCell className={Number(vendor.balance) > 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                          {formatCurrency(Number(vendor.balance))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Payment Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}