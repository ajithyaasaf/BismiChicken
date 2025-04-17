import * as React from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "./context/AuthContext";
// Use EnhancedDataProvider instead of DataProvider
import { EnhancedDataProvider } from "./context/EnhancedDataContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Vendors from "./pages/Vendors";
import Purchases from "./pages/Purchases";
import RetailSales from "./pages/RetailSales";
import HotelSales from "./pages/HotelSales";
import Reports from "./pages/Reports";
import NotFound from "@/pages/not-found";
// Import new pages
import Products from "./pages/Products";
import Hotels from "./pages/Hotels";
import VendorDebt from "./pages/VendorDebt";
import VendorPayments from "./pages/VendorPayments";
import HotelBills from "./pages/HotelBills";
import TestFirebase from "./pages/TestFirebase";
import { Loader2 } from "lucide-react";

// Private route component to protect routes
function PrivateRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  
  // Use useEffect for navigation to prevent "Cannot update during render" error
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  return <Component {...rest} />;
}

// Public route component for routes that shouldn't be accessed when logged in
function PublicRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  
  // Use useEffect for navigation to prevent "Cannot update during render" error
  React.useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/");
    }
  }, [loading, isAuthenticated, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return null;
  }
  
  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/login">
        {(params) => <PublicRoute component={Login} params={params} />}
      </Route>
      
      {/* Test Firebase */}
      <Route path="/test-firebase" component={TestFirebase} />
      
      {/* Dashboard */}
      <Route path="/">
        {(params) => <PrivateRoute component={Dashboard} params={params} />}
      </Route>
      
      {/* Vendor Management */}
      <Route path="/vendors">
        {(params) => <PrivateRoute component={Vendors} params={params} />}
      </Route>
      <Route path="/vendor-payments">
        {(params) => <PrivateRoute component={VendorPayments} params={params} />}
      </Route>
      <Route path="/vendor-debt">
        {(params) => <PrivateRoute component={VendorDebt} params={params} />}
      </Route>
      
      {/* Product Management */}
      <Route path="/products">
        {(params) => <PrivateRoute component={Products} params={params} />}
      </Route>
      
      {/* Transaction Routes */}
      <Route path="/purchases">
        {(params) => <PrivateRoute component={Purchases} params={params} />}
      </Route>
      <Route path="/retail-sales">
        {(params) => <PrivateRoute component={RetailSales} params={params} />}
      </Route>
      <Route path="/hotel-sales">
        {(params) => <PrivateRoute component={HotelSales} params={params} />}
      </Route>
      
      {/* Hotel Management */}
      <Route path="/hotels">
        {(params) => <PrivateRoute component={Hotels} params={params} />}
      </Route>
      <Route path="/hotel-bills">
        {(params) => <PrivateRoute component={HotelBills} params={params} />}
      </Route>
      
      {/* Reports */}
      <Route path="/reports">
        {(params) => <PrivateRoute component={Reports} params={params} />}
      </Route>
      
      {/* Error Handling */}
      <Route path="/404" component={NotFound} />
      <Route>
        <Redirect to="/404" />
      </Route>
    </Switch>
  );
}

function AppWithProviders() {
  return (
    <AuthProvider>
      <EnhancedDataProvider>
        <Layout>
          <Router />
        </Layout>
      </EnhancedDataProvider>
    </AuthProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppWithProviders />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;