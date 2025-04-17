import { useState, useRef } from "react";
import { useData } from "../context/EnhancedDataContext";
import DatePicker from "../components/DatePicker";
import SummaryCard from "../components/SummaryCard";
import TransactionTable from "../components/TransactionTable";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Store,
  Building2,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Transaction } from "@shared/schema";
import { format, subDays } from "date-fns";

export default function Dashboard() {
  const {
    selectedDate,
    setSelectedDate,
    dailySummary,
    loadingSummary,
    vendors,
    deletePurchase,
    deleteRetailSale,
    deleteHotelSale,
  } = useData();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteItemRef = useRef<{ id: number; type: Transaction["type"] } | null>(
    null
  );

  // Generate mock data for charts since we don't have historical data yet
  const generateChartData = () => {
    const weeklyData = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const formattedDate = format(date, "MMM dd");
      
      // Generate random values
      const profit = Math.floor(Math.random() * 5000) + 1000;
      const purchased = Math.floor(Math.random() * 100) + 50;
      const sold = Math.floor(Math.random() * purchased);
      
      weeklyData.push({
        date: formattedDate,
        profit,
        purchased,
        sold,
      });
    }

    return weeklyData;
  };

  const weeklyData = generateChartData();

  // Create a vendor map for display
  const vendorMap: Record<number, string> = {};
  vendors.forEach(vendor => {
    vendorMap[vendor.id] = vendor.name;
  });

  const handleDeleteTransaction = (id: number, type: Transaction["type"]) => {
    deleteItemRef.current = { id, type };
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItemRef.current) return;
    
    const { id, type } = deleteItemRef.current;
    
    try {
      switch (type) {
        case "purchase":
          await deletePurchase(id);
          break;
        case "retail":
          await deleteRetailSale(id);
          break;
        case "hotel":
          await deleteHotelSale(id);
          break;
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
    
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
        <DatePicker date={selectedDate} onDateChange={setSelectedDate} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Total Purchased"
          icon={<ShoppingCart className="h-5 w-5 text-primary" />}
          primaryValue={dailySummary ? `${dailySummary.totalPurchasedKg} kg` : "0 kg"}
          secondaryValue={dailySummary ? `₹${dailySummary.totalPurchaseCost.toFixed(2)}` : "₹0"}
          footerText={`From ${vendors.length} vendors`}
          isLoading={loadingSummary}
        />
        
        <SummaryCard
          title="Retail Sales"
          icon={<Store className="h-5 w-5 text-green-600" />}
          primaryValue={dailySummary ? `${dailySummary.totalRetailSalesKg} kg` : "0 kg"}
          secondaryValue={dailySummary ? `₹${dailySummary.totalRetailSalesRevenue.toFixed(2)}` : "₹0"}
          footerText={dailySummary && dailySummary.totalRetailProfit > 0 
            ? `Profit: ₹${dailySummary.totalRetailProfit.toFixed(2)}` 
            : "No profit"
          }
          footerColor="text-green-600"
          isLoading={loadingSummary}
        />
        
        <SummaryCard
          title="Hotel Sales"
          icon={<Building2 className="h-5 w-5 text-cyan-600" />}
          primaryValue={dailySummary ? `${dailySummary.totalHotelSalesKg} kg` : "0 kg"}
          secondaryValue={dailySummary ? `₹${dailySummary.totalHotelSalesRevenue.toFixed(2)}` : "₹0"}
          footerText={dailySummary && dailySummary.totalHotelProfit > 0 
            ? `Profit: ₹${dailySummary.totalHotelProfit.toFixed(2)}` 
            : "No profit"
          }
          footerColor="text-cyan-600"
          isLoading={loadingSummary}
        />
        
        <SummaryCard
          title="Total Profit"
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          primaryValue={dailySummary ? `₹${dailySummary.netProfit.toFixed(2)}` : "₹0"}
          secondaryValue={dailySummary ? `${dailySummary.totalSoldKg} kg sold` : "0 kg sold"}
          footerText={dailySummary 
            ? `${dailySummary.remainingKg} kg remaining` 
            : "0 kg remaining"
          }
          footerColor={dailySummary && dailySummary.remainingKg < 5 ? "text-amber-600" : "text-gray-500"}
          isLoading={loadingSummary}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Profit Trend</CardTitle>
            <CardDescription>Last 7 days profit trend</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weeklyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, "Profit"]} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#2e7d32"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Flow (kg)</CardTitle>
            <CardDescription>Daily purchase vs. sale comparison</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="purchased" name="Purchased (kg)" fill="#1976d2" />
                <Bar dataKey="sold" name="Sold (kg)" fill="#4caf50" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-white rounded-lg shadow-sm mb-6">
        <CardHeader className="px-4 py-3 border-b border-gray-200">
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <TransactionTable 
            transactions={dailySummary?.transactions || []} 
            vendors={vendorMap}
            onDelete={handleDeleteTransaction}
            isLoading={loadingSummary}
          />
          
          {dailySummary && dailySummary.transactions.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 text-right">
              <Button variant="ghost" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center ml-auto">
                <span>View All Transactions</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Transaction Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
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
