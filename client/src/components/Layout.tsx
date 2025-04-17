import { ReactNode, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import MobileDrawer from "./MobileDrawer";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Don't render layout for non-authenticated users
  if (!isAuthenticated || loading) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-['Roboto']">
      <Header onMobileMenuToggle={toggleMobileMenu} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>
      
      {/* Mobile navigation */}
      <MobileNav />
      
      {/* Mobile drawer menu */}
      <MobileDrawer 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </div>
  );
}
