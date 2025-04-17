import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import MobileDrawer from "./MobileDrawer";
import { AnimatePresence, motion } from "framer-motion";
import { useIsMobile } from "../hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when switching to desktop view
  useEffect(() => {
    if (!isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile, isMobileMenuOpen]);

  // Don't render layout for non-authenticated users
  if (!isAuthenticated || loading) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-['Roboto']">
      <Header onMobileMenuToggle={toggleMobileMenu} />
      
      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence>
          <Sidebar />
        </AnimatePresence>
        
        <motion.main 
          className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6"
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4,
              type: "spring", 
              stiffness: 100, 
              damping: 15 
            }}
          >
            {children}
          </motion.div>
        </motion.main>
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
