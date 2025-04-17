import { useState } from "react";
import { useData } from "../context/EnhancedDataContext";
import DatePicker from "../components/DatePicker";
import HotelBillForm from "../components/HotelBillForm";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
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
import { Button } from "@/components/ui/button";
import { 
  FilePenIcon, 
  FileTextIcon,
  TrashIcon, 
  PrinterIcon,
  EyeIcon,
  ArrowDownCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from "lucide-react";
import { formatCurrency, formatDate } from "../utils/helpers";

export default function HotelBills() {
  const {
    selectedDate,
    setSelectedDate,
    hotels,
    products,
    productParts,
    hotelSales,
    hotelSaleItems,
    loadingHotels,
    loadingProducts,
    loadingProductParts,
    loadingHotelSales,
    addHotelSale,
    updateHotelSalePaid,
    deleteHotelSale
  } = useData();

  const [viewBillDialogOpen, setViewBillDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleCreateBill = async (data: any) => {
    await addHotelSale(data);
  };

  const handleViewBill = (billId: number) => {
    const bill = hotelSales.find(sale => sale.id === billId);
    if (!bill) return;
    
    const items = hotelSaleItems.filter(item => item.hotelSaleId === billId);
    setSelectedBill({ ...bill, items });
    setViewBillDialogOpen(true);
  };

  const handleTogglePaid = async (billId: number, isPaid: boolean) => {
    await updateHotelSalePaid(billId, !isPaid);
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

  // Get hotel name by id
  const getHotelName = (hotelId: number) => {
    const hotel = hotels.find(h => h.id === hotelId);
    return hotel ? hotel.name : "Unknown";
  };

  // Get product name by id
  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : "Unknown";
  };

  // Get part name by id
  const getPartName = (partId: number) => {
    const part = productParts.find(p => p.id === partId);
    return part ? part.name : "Whole";
  };

  // Filter bills for today
  const todayBills = hotelSales.filter(
    sale => new Date(sale.date).toDateString() === selectedDate.toDateString()
  );

  // Calculate today's total
  const todayTotal = todayBills.reduce((total, bill) => {
    return total + parseFloat(bill.totalAmount.toString() || "0");
  }, 0);

  // Calculate paid bills
  const paidBills = todayBills.filter(bill => bill.isPaid);
  const paidTotal = paidBills.reduce((total, bill) => {
    return total + parseFloat(bill.totalAmount.toString() || "0");
  }, 0);

  // Calculate unpaid bills
  const unpaidBills = todayBills.filter(bill => !bill.isPaid);
  const unpaidTotal = unpaidBills.reduce((total, bill) => {
    return total + parseFloat(bill.totalAmount.toString() || "0");
  }, 0);

  // Print bill function
  const printBill = () => {
    if (!selectedBill) return;
    
    // Create a new window with the bill content
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const hotel = hotels.find(h => h.id === selectedBill.hotelId);
    const items = selectedBill.items || [];
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Bill #${selectedBill.billNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .bill-header { text-align: center; margin-bottom: 20px; }
            .bill-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .bill-items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .bill-items th, .bill-items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .bill-items th { background-color: #f2f2f2; }
            .bill-total { text-align: right; font-weight: bold; }
            .bill-footer { margin-top: 30px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="bill-header">
            <h2>Bismi Chicken Shop</h2>
            <h3>Bill Receipt</h3>
          </div>
          
          <div class="bill-info">
            <div>
              <p><strong>Bill #:</strong> ${selectedBill.billNumber}</p>
              <p><strong>Date:</strong> ${formatDate(new Date(selectedBill.date))}</p>
            </div>
            <div>
              <p><strong>Hotel:</strong> ${hotel ? hotel.name : 'Unknown'}</p>
              <p><strong>Phone:</strong> ${hotel ? hotel.phone : 'N/A'}</p>
            </div>
          </div>
          
          <table class="bill-items">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity (kg)</th>
                <th>Rate (₹/kg)</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${getProductName(item.productId)} ${item.partId ? `(${getPartName(item.partId)})` : ''}</td>
                  <td>${parseFloat(item.quantityKg.toString()).toFixed(2)}</td>
                  <td>${parseFloat(item.ratePerKg.toString()).toFixed(2)}</td>
                  <td>${formatCurrency(parseFloat(item.total.toString()))}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="bill-total">Total:</td>
                <td class="bill-total">${formatCurrency(parseFloat(selectedBill.totalAmount.toString()))}</td>
              </tr>
            </tfoot>
          </table>
          
          <div class="bill-footer">
            <p>Thank you for your business!</p>
            <p>For any queries, please contact us.</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Hotel Bills</h2>
          <p className="text-gray-500 mt-1">
            Create and manage bills for hotel clients
          </p>
        </div>
        <DatePicker date={selectedDate} onDateChange={setSelectedDate} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-600">Today's Bills</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(todayTotal)}</p>
                <p className="text-xs text-blue-600">{todayBills.length} bills generated</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileTextIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-600">Paid Amount</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(paidTotal)}</p>
                <p className="text-xs text-green-600">{paidBills.length} bills paid</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-600">Pending Amount</p>
                <p className="text-2xl font-bold text-amber-700">{formatCurrency(unpaidTotal)}</p>
                <p className="text-xs text-amber-600">{unpaidBills.length} bills pending</p>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                <XCircleIcon className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bills" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="bills" className="flex items-center">
            <FileTextIcon className="h-4 w-4 mr-2" />
            Bills
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center">
            <FilePenIcon className="h-4 w-4 mr-2" />
            Create Bill
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bills" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Hotel Bills</CardTitle>
              <CardDescription>
                Bills generated for today: {formatDate(selectedDate)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHotelSales ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : todayBills.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No bills have been created for today
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill #</TableHead>
                      <TableHead>Hotel</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todayBills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">{bill.billNumber}</TableCell>
                        <TableCell>{getHotelName(bill.hotelId)}</TableCell>
                        <TableCell className="font-bold">
                          {formatCurrency(parseFloat(bill.totalAmount.toString()))}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={bill.isPaid ? "success" : "warning"}
                            className={
                              bill.isPaid 
                                ? "bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer" 
                                : "bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer"
                            }
                            onClick={() => handleTogglePaid(bill.id, bill.isPaid)}
                          >
                            {bill.isPaid ? "Paid" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleViewBill(bill.id)}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500"
                            onClick={() => handleDeleteClick(bill.id)}
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
        </TabsContent>

        <TabsContent value="create" className="mt-0">
          <HotelBillForm
            hotels={hotels}
            products={products}
            productParts={productParts}
            date={selectedDate}
            onSubmit={handleCreateBill}
          />
        </TabsContent>
      </Tabs>

      {/* View Bill Dialog */}
      {selectedBill && (
        <AlertDialog open={viewBillDialogOpen} onOpenChange={setViewBillDialogOpen}>
          <AlertDialogContent className="max-w-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center justify-between">
                <span>Bill #{selectedBill.billNumber}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center"
                  onClick={printBill}
                >
                  <PrinterIcon className="h-4 w-4 mr-1" />
                  Print
                </Button>
              </AlertDialogTitle>
              <AlertDialogDescription>
                Date: {formatDate(new Date(selectedBill.date))} | 
                Hotel: {getHotelName(selectedBill.hotelId)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity (kg)</TableHead>
                    <TableHead>Rate (₹/kg)</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(selectedBill.items || []).map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {getProductName(item.productId)}
                        {item.partId && ` (${getPartName(item.partId)})`}
                      </TableCell>
                      <TableCell>{parseFloat(item.quantityKg.toString()).toFixed(2)}</TableCell>
                      <TableCell>{parseFloat(item.ratePerKg.toString()).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(parseFloat(item.total.toString()))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="text-right font-bold py-4">Total:</td>
                    <td className="text-right font-bold py-4">
                      {formatCurrency(parseFloat(selectedBill.totalAmount.toString()))}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <Badge
                variant={selectedBill.isPaid ? "success" : "warning"}
                className={
                  selectedBill.isPaid 
                    ? "bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer" 
                    : "bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer"
                }
                onClick={() => handleTogglePaid(selectedBill.id, selectedBill.isPaid)}
              >
                {selectedBill.isPaid ? "Paid" : "Pending"}
              </Badge>
              
              <Button 
                variant="outline"
                onClick={() => setViewBillDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bill? This action cannot be undone.
              All line items associated with this bill will also be deleted.
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