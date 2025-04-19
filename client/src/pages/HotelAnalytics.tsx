import { useState, useEffect } from "react";
import { useEnhancedData } from "../context/EnhancedDataContext";
import { DateRange } from "react-day-picker";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Printer, Download, Building2, DollarSign, TrendingUp, AlertTriangle, BarChart3, PieChart as PieChartIcon, CalendarIcon } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, differenceInDays, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

// Define hotel analytics data types
interface HotelAnalyticsSummary {
  totalSales: number;
  totalQuantity: number;
  totalHotels: number;
  totalPending: number;
  avgOrderValue: number;
  percentPaid: number;
}

interface HotelSalesByHotel {
  hotelId: number;
  hotelName: string;
  totalSales: number;
  totalQuantity: number;
  salesCount: number;
  pendingAmount: number;
  lastOrderDate: Date;
}

// Custom DateRangePicker component
function DateRangePicker({ 
  startDate,
  endDate,
  onDateRangeChange 
}: { 
  startDate: Date; 
  endDate: Date; 
  onDateRangeChange: (start: Date, end: Date) => void;
}) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startDate,
    to: endDate,
  });

  // Update the internal state when props change
  useEffect(() => {
    setDate({
      from: startDate,
      to: endDate,
    });
  }, [startDate, endDate]);

  // Handle date range change from calendar
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDate(range);
      onDateRangeChange(range.from, range.to);
    }
  };

  // Handler for preset selections
  const handlePresetSelect = (value: string) => {
    const today = new Date();
    let newStartDate: Date;
    let newEndDate: Date = today;

    switch (value) {
      case "today":
        newStartDate = today;
        break;
      case "yesterday":
        newStartDate = subDays(today, 1);
        newEndDate = subDays(today, 1);
        break;
      case "last7days":
        newStartDate = subDays(today, 6);
        break;
      case "last30days":
        newStartDate = subDays(today, 29);
        break;
      case "thisMonth":
        newStartDate = startOfMonth(today);
        newEndDate = today;
        break;
      case "lastMonth":
        const lastMonth = subDays(startOfMonth(today), 1);
        newStartDate = startOfMonth(lastMonth);
        newEndDate = endOfMonth(lastMonth);
        break;
      default:
        return;
    }

    setDate({
      from: newStartDate,
      to: newEndDate,
    });
    onDateRangeChange(newStartDate, newEndDate);
  };

  return (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full">
      <Select onValueChange={handlePresetSelect}>
        <SelectTrigger className="h-9 w-full sm:w-[110px] border-dashed">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="yesterday">Yesterday</SelectItem>
          <SelectItem value="last7days">Last 7 days</SelectItem>
          <SelectItem value="last30days">Last 30 days</SelectItem>
          <SelectItem value="thisMonth">This month</SelectItem>
          <SelectItem value="lastMonth">Last month</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "h-9 w-full sm:w-[230px] justify-start text-left font-normal border-dashed",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  <span className="hidden xs:inline">{format(date.from, "LLL dd, y")}</span>
                  <span className="inline xs:hidden">{format(date.from, "MM/dd")}</span>
                  {" - "}
                  <span className="hidden xs:inline">{format(date.to, "LLL dd, y")}</span>
                  <span className="inline xs:hidden">{format(date.to, "MM/dd")}</span>
                </>
              ) : (
                <>
                  <span className="hidden xs:inline">{format(date.from, "LLL dd, y")}</span>
                  <span className="inline xs:hidden">{format(date.from, "MM/dd/yy")}</span>
                </>
              )
            ) : (
              <span>Date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateRangeSelect}
            numberOfMonths={window.innerWidth < 768 ? 1 : 2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function HotelAnalytics() {
  const {
    hotels,
    hotelSales,
    loadingHotels,
    loadingHotelSales,
  } = useEnhancedData();

  const [startDate, setStartDate] = useState<Date>(() => startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(() => new Date());
  const [activeTab, setActiveTab] = useState("overview");
  const [analyticsData, setAnalyticsData] = useState<any>({
    summary: null,
    hotelBreakdown: [],
    dateWiseSales: [],
    productBreakdown: []
  });

  // Prepare analytics data whenever date range or sales data changes
  useEffect(() => {
    if (loadingHotels || loadingHotelSales || !hotels || !hotelSales) return;

    // Filter sales within date range
    const filteredSales = hotelSales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    });

    // Summary calculations
    const totalSales = filteredSales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const totalQuantity = filteredSales.reduce((sum, sale) => {
      return sum + sale.items.reduce((itemSum, item) => itemSum + Number(item.quantityKg), 0);
    }, 0);
    
    const uniqueHotels = new Set(filteredSales.map(sale => sale.hotelId));
    const totalPaid = filteredSales.filter(sale => sale.isPaid).reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const totalPending = totalSales - totalPaid;
    
    const summary: HotelAnalyticsSummary = {
      totalSales,
      totalQuantity,
      totalHotels: uniqueHotels.size,
      totalPending,
      avgOrderValue: filteredSales.length ? totalSales / filteredSales.length : 0,
      percentPaid: totalSales ? (totalPaid / totalSales) * 100 : 0
    };

    // Hotel-wise breakdown
    const hotelMap = new Map<number, HotelSalesByHotel>();
    
    filteredSales.forEach(sale => {
      const hotelId = sale.hotelId;
      const hotel = hotels.find(h => h.id === hotelId);
      if (!hotel) return;
      
      const hotelName = hotel.name;
      const saleAmount = Number(sale.totalAmount);
      const saleQuantity = sale.items.reduce((sum, item) => sum + Number(item.quantityKg), 0);
      const isPaid = sale.isPaid;
      const saleDate = new Date(sale.date);
      
      if (hotelMap.has(hotelId)) {
        const data = hotelMap.get(hotelId)!;
        data.totalSales += saleAmount;
        data.totalQuantity += saleQuantity;
        data.salesCount += 1;
        if (!isPaid) data.pendingAmount += saleAmount;
        if (saleDate > new Date(data.lastOrderDate)) {
          data.lastOrderDate = saleDate;
        }
      } else {
        hotelMap.set(hotelId, {
          hotelId,
          hotelName,
          totalSales: saleAmount,
          totalQuantity: saleQuantity,
          salesCount: 1,
          pendingAmount: isPaid ? 0 : saleAmount,
          lastOrderDate: saleDate
        });
      }
    });
    
    const hotelBreakdown = Array.from(hotelMap.values()).sort((a, b) => b.totalSales - a.totalSales);
    
    // Date-wise sales
    const dateMap = new Map<string, { date: string, sales: number, quantity: number, count: number }>();
    
    filteredSales.forEach(sale => {
      const dateStr = format(new Date(sale.date), 'yyyy-MM-dd');
      const saleAmount = Number(sale.totalAmount);
      const saleQuantity = sale.items.reduce((sum, item) => sum + Number(item.quantityKg), 0);
      
      if (dateMap.has(dateStr)) {
        const data = dateMap.get(dateStr)!;
        data.sales += saleAmount;
        data.quantity += saleQuantity;
        data.count += 1;
      } else {
        dateMap.set(dateStr, {
          date: dateStr,
          sales: saleAmount,
          quantity: saleQuantity,
          count: 1
        });
      }
    });
    
    const dateWiseSales = Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => ({
        ...item,
        formattedDate: format(new Date(item.date), 'MMM dd')
      }));
    
    // Product breakdown
    const productMap = new Map<string, { name: string, quantity: number, amount: number }>();
    
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const productName = item.meatType + " " + item.productCut;
        const quantity = Number(item.quantityKg);
        const amount = Number(item.total);
        
        if (productMap.has(productName)) {
          const data = productMap.get(productName)!;
          data.quantity += quantity;
          data.amount += amount;
        } else {
          productMap.set(productName, {
            name: productName,
            quantity,
            amount
          });
        }
      });
    });
    
    const productBreakdown = Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity);
    
    setAnalyticsData({
      summary,
      hotelBreakdown,
      dateWiseSales,
      productBreakdown
    });
  }, [startDate, endDate, hotels, hotelSales, loadingHotels, loadingHotelSales]);

  // Date range change handler
  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // COLORS for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="w-full md:w-auto">
          <h2 className="text-2xl font-semibold text-gray-900">Hotel Analytics</h2>
          <p className="text-gray-500 mt-1">
            Track and analyze hotel sales, payments, and performance metrics
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <div className="w-full">
            <DateRangePicker 
              startDate={startDate} 
              endDate={endDate} 
              onDateRangeChange={handleDateRangeChange} 
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Analytics Tabs */}
      <Tabs 
        defaultValue="overview" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="hotels" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>Hotels</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            <span>Products</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Total Sales */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingHotelSales || !analyticsData.summary ? (
                  <Skeleton className="h-9 w-32" />
                ) : (
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold">
                      {formatCurrency(analyticsData.summary.totalSales)}
                    </div>
                    <div className="text-xl font-medium text-gray-500">
                      {analyticsData.summary.totalQuantity.toFixed(1)} kg
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Pending Amount */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Pending Payments</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingHotelSales || !analyticsData.summary ? (
                  <Skeleton className="h-9 w-32" />
                ) : (
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold text-amber-600">
                      {formatCurrency(analyticsData.summary.totalPending)}
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700">
                      {analyticsData.summary.percentPaid.toFixed(0)}% Paid
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Hotels Served */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Hotels Served</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingHotels || !analyticsData.summary ? (
                  <Skeleton className="h-9 w-32" />
                ) : (
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold">
                      {analyticsData.summary.totalHotels}
                    </div>
                    <div className="text-xl font-medium text-gray-500">
                      ₹{analyticsData.summary.avgOrderValue.toFixed(0)} avg
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sales Trend Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHotelSales || !analyticsData.dateWiseSales.length ? (
                <div className="h-80 w-full flex items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart
                    data={analyticsData.dateWiseSales}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="formattedDate" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="sales"
                      name="Sales (₹)"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="quantity"
                      name="Quantity (kg)"
                      stroke="#82ca9d"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hotels Tab */}
        <TabsContent value="hotels">
          <Card>
            <CardHeader>
              <CardTitle>Hotel Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHotels || !analyticsData.hotelBreakdown.length ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div>
                  {/* Hotel Performance Chart */}
                  <div className="mb-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={analyticsData.hotelBreakdown.slice(0, 10)}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hotelName" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="totalSales" name="Sales (₹)" fill="#8884d8" />
                        <Bar dataKey="pendingAmount" name="Pending (₹)" fill="#ff8042" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                
                  {/* Hotel Performance Table - Desktop version */}
                  <div className="rounded-md border hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Hotel</TableHead>
                          <TableHead className="text-right">Orders</TableHead>
                          <TableHead className="text-right">Total Sales</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Pending</TableHead>
                          <TableHead>Last Order</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analyticsData.hotelBreakdown.map((hotel: any) => (
                          <TableRow key={hotel.hotelId}>
                            <TableCell className="font-medium">{hotel.hotelName}</TableCell>
                            <TableCell className="text-right">{hotel.salesCount}</TableCell>
                            <TableCell className="text-right">{formatCurrency(hotel.totalSales)}</TableCell>
                            <TableCell className="text-right">{hotel.totalQuantity.toFixed(1)} kg</TableCell>
                            <TableCell className="text-right">
                              {hotel.pendingAmount > 0 ? (
                                <span className="text-amber-600">{formatCurrency(hotel.pendingAmount)}</span>
                              ) : (
                                <span className="text-green-600">Paid</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span title={format(new Date(hotel.lastOrderDate), 'PPP')}>
                                {formatDistanceToNow(new Date(hotel.lastOrderDate), { addSuffix: true })}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Hotel Performance Cards - Mobile version */}
                  <div className="space-y-4 md:hidden">
                    {analyticsData.hotelBreakdown.map((hotel: any) => (
                      <Card key={hotel.hotelId} className="overflow-hidden">
                        <CardHeader className="p-4 pb-2 flex flex-row justify-between items-center">
                          <CardTitle className="text-base">{hotel.hotelName}</CardTitle>
                          <Badge variant={hotel.pendingAmount > 0 ? "outline" : "secondary"} className={hotel.pendingAmount > 0 ? "bg-amber-50 text-amber-700" : ""}>
                            {hotel.pendingAmount > 0 ? "Pending" : "Paid"}
                          </Badge>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Orders:</span>
                              <p className="font-medium">{hotel.salesCount}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Quantity:</span>
                              <p className="font-medium">{hotel.totalQuantity.toFixed(1)} kg</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Sales:</span>
                              <p className="font-medium">{formatCurrency(hotel.totalSales)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Pending:</span>
                              <p className={hotel.pendingAmount > 0 ? "font-medium text-amber-600" : "font-medium text-green-600"}>
                                {hotel.pendingAmount > 0 ? formatCurrency(hotel.pendingAmount) : "Paid"}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Last order: {formatDistanceToNow(new Date(hotel.lastOrderDate), { addSuffix: true })}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Distribution Chart */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Product Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingHotelSales || !analyticsData.productBreakdown.length ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.productBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="quantity"
                      >
                        {analyticsData.productBreakdown.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Product Breakdown Table */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Product Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingHotelSales || !analyticsData.productBreakdown.length ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <div>
                    {/* Product Breakdown Table - Desktop */}
                    <div className="rounded-md border hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Quantity (kg)</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Avg Rate/kg</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analyticsData.productBreakdown.map((product: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium capitalize">{product.name}</TableCell>
                              <TableCell className="text-right">{product.quantity.toFixed(1)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(product.amount)}</TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(product.amount / product.quantity)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {/* Product Breakdown Cards - Mobile */}
                    <div className="space-y-3 md:hidden">
                      {analyticsData.productBreakdown.map((product: any, index: number) => (
                        <Card key={index} className="overflow-hidden">
                          <CardHeader className="p-3 pb-1 flex flex-row justify-between items-center">
                            <CardTitle className="text-base capitalize">{product.name}</CardTitle>
                            <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-medium">
                              {(product.quantity / analyticsData.summary.totalQuantity * 100).toFixed(0)}%
                            </div>
                          </CardHeader>
                          <CardContent className="p-3">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <span className="text-gray-500 text-xs">Quantity</span>
                                <p className="font-medium">{product.quantity.toFixed(1)} kg</p>
                              </div>
                              <div>
                                <span className="text-gray-500 text-xs">Amount</span>
                                <p className="font-medium">{formatCurrency(product.amount)}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 text-xs">Rate/kg</span>
                                <p className="font-medium">{formatCurrency(product.amount / product.quantity)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}