import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Package, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useBreakpoint } from "../hooks/use-mobile";

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();
  const currentBreakpoint = useBreakpoint();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Get logo size based on breakpoint
  const getLogoSize = () => {
    switch (currentBreakpoint) {
      case 'xs':
        return { height: "h-5", width: "w-5" };
      case 'sm':
        return { height: "h-5", width: "w-5" };
      default:
        return { height: "h-6", width: "w-6" };
    }
  };
  
  const logoSize = getLogoSize();

  return (
    <motion.header 
      className="bg-white shadow-sm"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        duration: 0.3
      }}
      style={{
        // Safe area support for notched phones
        paddingTop: 'var(--safe-area-inset-top, 0px)'
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 flex justify-between items-center h-12 sm:h-14 md:h-16 transition-all duration-200">
        <div className="flex items-center">
          {/* Mobile menu toggle button */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-1 sm:mr-2 text-primary h-8 w-8 sm:h-9 sm:w-9"
              onClick={onMobileMenuToggle}
            >
              <motion.div
                whileTap={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.div>
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, 15, -15, 10, -10, 5, -5, 0] }}
            transition={{ 
              duration: 1,
              delay: 0.3,
              ease: "easeInOut",
              times: [0, 0.1, 0.3, 0.4, 0.5, 0.7, 0.9, 1],
              repeat: 0
            }}
            className="flex items-center justify-center"
          >
            <Package className={`${logoSize.height} ${logoSize.width} text-primary mr-1.5 sm:mr-2`} />
          </motion.div>
          
          <motion.h1 
            className="text-base sm:text-lg md:text-xl font-medium text-gray-900 hidden sm:block transition-all duration-200"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            Bismi Broilers Management
          </motion.h1>
          
          <motion.h1 
            className="text-base font-medium text-gray-900 sm:hidden transition-all duration-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            Bismi
          </motion.h1>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-3 md:space-x-4">
          <motion.span 
            className="text-xs sm:text-sm text-gray-700 hidden sm:inline truncate max-w-[140px] md:max-w-[200px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {currentUser?.email}
          </motion.span>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="h-8 sm:h-9 text-xs sm:text-sm text-gray-600 hover:text-gray-900 flex items-center px-2 sm:px-3"
              aria-label="Logout"
            >
              <motion.div
                className="flex items-center"
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline ml-1">Logout</span>
              </motion.div>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
