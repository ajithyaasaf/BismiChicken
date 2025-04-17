import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import MobileDrawer from "./MobileDrawer";
import { AnimatePresence, motion } from "framer-motion";
import { useIsMobile, useBreakpoint, useIsTablet, breakpoints } from "../hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const currentBreakpoint = useBreakpoint();
  
  // Add a safe area for devices with notches or rounded corners
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: "env(safe-area-inset-top, 0px)",
    right: "env(safe-area-inset-right, 0px)",
    bottom: "env(safe-area-inset-bottom, 0px)",
    left: "env(safe-area-inset-left, 0px)"
  });

  useEffect(() => {
    // This sets a CSS variable that we can use throughout the app
    document.documentElement.style.setProperty(
      '--safe-area-inset-top', 
      safeAreaInsets.top
    );
    document.documentElement.style.setProperty(
      '--safe-area-inset-bottom', 
      safeAreaInsets.bottom
    );
  }, [safeAreaInsets]);

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

  // Dynamic padding based on viewport size
  const getMainPadding = () => {
    switch (currentBreakpoint) {
      case 'xs': return "p-2 pb-20"; // Extra padding at bottom for mobile nav
      case 'sm': return "p-3 pb-20";
      case 'md': return "p-4 pb-4";
      default: return "p-6";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-['Roboto'] overflow-hidden">
      <Header onMobileMenuToggle={toggleMobileMenu} />
      
      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence>
          {/* Only show sidebar on non-mobile devices */}
          {!isMobile && <Sidebar />}
        </AnimatePresence>
        
        <motion.main 
          className={`flex-1 overflow-y-auto bg-gray-50 ${getMainPadding()} transition-all duration-200`}
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            // Add safe area padding for iOS devices
            paddingBottom: isMobile ? `calc(5rem + ${safeAreaInsets.bottom})` : undefined,
            paddingLeft: isTablet ? "1rem" : undefined,
            paddingRight: isTablet ? "1rem" : undefined,
          }}
        >
          <motion.div
            className="max-w-full mx-auto"
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
      
      {/* Mobile navigation - only show on mobile devices */}
      {isMobile && <MobileNav />}
      
      {/* Mobile drawer menu */}
      <MobileDrawer 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </div>
  );
}
