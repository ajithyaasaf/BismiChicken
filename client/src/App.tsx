import { useEffect } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Vendors from "./pages/Vendors";
import Purchases from "./pages/Purchases";
import RetailSales from "./pages/RetailSales";
import HotelSales from "./pages/HotelSales";
import Reports from "./pages/Reports";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

// Private route component to protect routes
function PrivateRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, path: string }) {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  
  // Use useEffect for navigation to prevent "Cannot update during render" error
  useEffect(() => {
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
function PublicRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, path: string }) {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  
  // Use useEffect for navigation to prevent "Cannot update during render" error
  useEffect(() => {
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
      <Route path="/login" component={(props) => <PublicRoute component={Login} {...props} />} />
      
      <Route path="/" component={(props) => <PrivateRoute component={Dashboard} {...props} />} />
      <Route path="/vendors" component={(props) => <PrivateRoute component={Vendors} {...props} />} />
      <Route path="/purchases" component={(props) => <PrivateRoute component={Purchases} {...props} />} />
      <Route path="/retail-sales" component={(props) => <PrivateRoute component={RetailSales} {...props} />} />
      <Route path="/hotel-sales" component={(props) => <PrivateRoute component={HotelSales} {...props} />} />
      <Route path="/reports" component={(props) => <PrivateRoute component={Reports} {...props} />} />
      
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
      <DataProvider>
        <Layout>
          <Router />
        </Layout>
      </DataProvider>
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
