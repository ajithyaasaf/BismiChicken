import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Package, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();
  
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
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center">
          {/* Mobile menu toggle button */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-2 text-primary"
              onClick={onMobileMenuToggle}
            >
              <motion.div
                whileTap={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <Menu className="h-6 w-6" />
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
          >
            <Package className="h-6 w-6 text-primary mr-2" />
          </motion.div>
          
          <motion.h1 
            className="text-lg font-medium text-gray-900 hidden sm:block"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            Chicken Business Management
          </motion.h1>
          
          <motion.h1 
            className="text-lg font-medium text-gray-900 sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            CBM
          </motion.h1>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <motion.span 
            className="text-sm text-gray-700 hidden sm:inline"
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
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
            >
              <motion.div
                className="flex items-center"
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <LogOut className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </motion.div>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
