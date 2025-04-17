import { useState } from "react";
import { useData } from "../context/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays, subMonths, subWeeks, isSameDay, parseISO } from "date-fns";
import { Loader2, FileDown, BarChart, LineChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { generateCSV } from "../utils/helpers";
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Reports() {
  const { toast } = useToast();
  const { dailySummary, loadingSummary } = useData();
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">("daily");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(new Date(), reportType === "weekly" ? 7 : 30),
    to: new Date(),
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loadingChartData, setLoadingChartData] = useState(false);

  // Generate some mock data for now - in a real app, fetch this from API
  const generateReportData = () => {
    setLoadingChartData(true);
    
    // This would be replaced with actual API calls
    setTimeout(() => {
      const newData = [];
      const startDate = dateRange.from;
      const endDate = dateRange.to;
      
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        // Generate random but reasonable values
        const purchased = Math.floor(Math.random() * 100) + 50;
        const sold = Math.floor(Math.random() * purchased);
        const retailSales = Math.floor(Math.random() * sold * 180); // at ~₹180/kg
        const hotelSales = Math.floor(Math.random() * sold * 170);  // at ~₹170/kg
        const cost = purchased * 150; // at ~₹150/kg purchase price
        const revenue = retailSales + hotelSales;
        const profit = revenue - cost;
        
        newData.push({
          date: format(currentDate, "MMM dd"),
          rawDate: new Date(currentDate),
          purchased,
          sold,
          remaining: purchased - sold,
          revenue,
          cost,
          profit,
        });
        
        currentDate = reportType === "daily" 
          ? subDays(currentDate, -1) 
          : (reportType === "weekly" ? subDays(currentDate, -7) : subMonths(currentDate, -1));
      }
      
      setChartData(newData.sort((a, b) => a.rawDate - b.rawDate));
      setLoadingChartData(false);
    }, 1000);
  };

  // Update date range when report type changes
  const handleReportTypeChange = (value: string) => {
    const type = value as "daily" | "weekly" | "monthly";
    setReportType(type);
    
    let from;
    switch (type) {
      case "weekly":
        from = subWeeks(new Date(), 1);
        break;
      case "monthly":
        from = subMonths(new Date(), 1);
        break;
      default:
        from = subDays(new Date(), 1);
    }
    
    setDateRange({ from, to: new Date() });
    generateReportData();
  };

  // Initialize data on first load
  useState(() => {
    generateReportData();
  });

  // Export report as CSV
  const handleExportCSV = () => {
    try {
      const csvData = generateCSV(chartData, [
        { field: 'date', header: 'Date' },
        { field: 'purchased', header: 'Purchased (kg)' },
        { field: 'sold', header: 'Sold (kg)' },
        { field: 'remaining', header: 'Remaining (kg)' },
        { field: 'revenue', header: 'Revenue (₹)' },
        { field: 'cost', header: 'Cost (₹)' },
        { field: 'profit', header: 'Profit (₹)' },
      ]);
      
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `chicken-business-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: "Your report has been downloaded as a CSV file."
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your report.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h2>
        <Button 
          onClick={handleExportCSV}
          className="flex items-center"
          disabled={loadingChartData || chartData.length === 0}
        >
          <FileDown className="h-4 w-4 mr-1" />
          Export as CSV
        </Button>
      </div>

      <Tabs defaultValue="daily" onValueChange={handleReportTypeChange}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="daily">Today</TabsTrigger>
            <TabsTrigger value="weekly">This Week</TabsTrigger>
            <TabsTrigger value="monthly">This Month</TabsTrigger>
          </TabsList>
          
          <div className="text-sm text-gray-500">
            {reportType === "daily" 
              ? format(selectedDate, "PPP")
              : `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`
            }
          </div>
        </div>

        <TabsContent value="daily" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Daily Profit</span>
                  <LineChart className="h-5 w-5 text-gray-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {loadingChartData ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={chartData.filter(d => isSameDay(d.rawDate, selectedDate))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value}`, "Amount"]} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#4caf50" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="cost" name="Cost" stroke="#f44336" />
                      <Line type="monotone" dataKey="profit" name="Profit" stroke="#2196f3" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Inventory Flow</span>
                  <BarChart className="h-5 w-5 text-gray-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {loadingChartData ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={chartData.filter(d => isSameDay(d.rawDate, selectedDate))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="purchased" name="Purchased (kg)" fill="#1976d2" />
                      <Bar dataKey="sold" name="Sold (kg)" fill="#4caf50" />
                      <Bar dataKey="remaining" name="Remaining (kg)" fill="#ff9800" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Daily Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSummary ? (
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ) : dailySummary ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Purchases</h4>
                        <p className="text-lg font-semibold">{dailySummary.totalPurchasedKg} kg (₹{dailySummary.totalPurchaseCost.toFixed(2)})</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Sales</h4>
                        <p className="text-lg font-semibold">{dailySummary.totalSoldKg} kg (₹{(dailySummary.totalRetailSalesRevenue + dailySummary.totalHotelSalesRevenue).toFixed(2)})</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Retail Profit</h4>
                        <p className="text-lg font-semibold text-green-600">₹{dailySummary.totalRetailProfit.toFixed(2)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Hotel Profit</h4>
                        <p className="text-lg font-semibold text-cyan-600">₹{dailySummary.totalHotelProfit.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-500">Net Profit</h4>
                      <p className="text-xl font-bold text-green-600">₹{dailySummary.netProfit.toFixed(2)}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {dailySummary.remainingKg > 0 
                          ? `${dailySummary.remainingKg} kg remaining in inventory`
                          : "All inventory sold"
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No data available for the selected date.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="mt-0">
          <div className="grid grid-cols-1 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Weekly Profit Trend</span>
                  <LineChart className="h-5 w-5 text-gray-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {loadingChartData ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value}`, "Amount"]} />
                      <Legend />
                      <Line type="monotone" dataKey="profit" name="Daily Profit" stroke="#2e7d32" strokeWidth={2} />
                      <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#4caf50" />
                      <Line type="monotone" dataKey="cost" name="Cost" stroke="#f44336" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Weekly Inventory Flow</span>
                  <BarChart className="h-5 w-5 text-gray-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {loadingChartData ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="purchased" name="Purchased (kg)" fill="#1976d2" />
                      <Bar dataKey="sold" name="Sold (kg)" fill="#4caf50" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="mt-0">
          <div className="grid grid-cols-1 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Monthly Profit Trend</span>
                  <LineChart className="h-5 w-5 text-gray-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {loadingChartData ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value}`, "Amount"]} />
                      <Legend />
                      <Line type="monotone" dataKey="profit" name="Daily Profit" stroke="#2e7d32" strokeWidth={2} />
                      <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#4caf50" />
                      <Line type="monotone" dataKey="cost" name="Cost" stroke="#f44336" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Monthly Sales Breakdown</span>
                  <BarChart className="h-5 w-5 text-gray-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {loadingChartData ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sold" name="Total Sold (kg)" fill="#4caf50" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
