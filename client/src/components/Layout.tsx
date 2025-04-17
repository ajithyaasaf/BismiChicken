import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, loading } = useAuth();

  // Don't render layout for non-authenticated users
  if (!isAuthenticated || loading) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-['Roboto']">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
}
