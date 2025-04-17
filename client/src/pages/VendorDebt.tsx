import { useState } from "react";
import { useData } from "../context/DataContext";
import DatePicker from "../components/DatePicker";
import VendorDebtForm from "../components/VendorDebtForm";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  ArrowDownIcon, 
  ArrowUpIcon, 
  CalendarIcon,
  TrashIcon, 
  FileTextIcon,
  UserIcon
} from "lucide-react";
import { formatCurrency, formatDate } from "../utils/helpers";

export default function VendorDebt() {
  const {
    selectedDate,
    setSelectedDate,
    vendors,
    loadingVendors,
    vendorPayments,
    loadingVendorPayments,
    addVendorPayment,
    deleteVendorPayment
  } = useData();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleAddPayment = async (data: any) => {
    await addVendorPayment(data);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId !== null) {
      await deleteVendorPayment(deleteId);
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  // Get vendor name by id
  const getVendorName = (vendorId: number) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name : "Unknown";
  };

  // Calculate total debt
  const totalDebt = vendors.reduce((total, vendor) => {
    return total + parseFloat(vendor.outstandingDebt.toString() || "0");
  }, 0);

  // Calculate total payments for the day
  const dailyPayments = vendorPayments.filter(
    payment => new Date(payment.date).toDateString() === selectedDate.toDateString()
  ).reduce((total, payment) => {
    return total + parseFloat(payment.amount.toString() || "0");
  }, 0);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Vendor Debt Management</h2>
          <p className="text-gray-500 mt-1">
            Manage payments to vendors and track outstanding debts
          </p>
        </div>
        <DatePicker date={selectedDate} onDateChange={setSelectedDate} />
      </div>

      {/* Debt Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-600">Total Outstanding Debt</p>
                <p className="text-2xl font-bold text-red-700">{formatCurrency(totalDebt)}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <ArrowUpIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-600">Today's Payments</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(dailyPayments)}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <ArrowDownIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-600">Active Vendors</p>
                <p className="text-2xl font-bold text-blue-700">{vendors.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Payment Form */}
        <div className="lg:col-span-1">
          <VendorDebtForm 
            vendors={vendors} 
            date={selectedDate}
            onSubmit={handleAddPayment}
          />
        </div>

        {/* Vendor Debt List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileTextIcon className="h-5 w-5 mr-2 text-primary" />
                Vendor Debts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingVendors ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : vendors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No vendors have been added yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead className="text-right">Outstanding Debt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {vendor.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {vendor.phone}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-red-600">
                          {formatCurrency(parseFloat(vendor.outstandingDebt.toString()))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          
          {/* Payment History */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                Recent Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingVendorPayments ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : vendorPayments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No payments have been recorded yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(new Date(payment.date))}</TableCell>
                        <TableCell>{getVendorName(payment.vendorId)}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(parseFloat(payment.amount.toString()))}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {payment.notes || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500"
                            onClick={() => handleDeleteClick(payment.id)}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment record? This action cannot be undone.
              Deleting this payment will modify the vendor's outstanding debt.
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