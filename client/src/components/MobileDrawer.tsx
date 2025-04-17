import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import * as Dialog from "@radix-ui/react-dialog";
import { 
  X, 
  LogOut,
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Store, 
  Building2, 
  BarChart3 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ href, icon, label, active, onClick }: NavItemProps) {
  return (
    <Link href={href}>
      <motion.div 
        className={cn(
          "flex items-center px-4 py-3 text-base font-medium cursor-pointer rounded-md",
          active 
            ? "bg-primary text-white"
            : "text-gray-700 hover:bg-gray-100"
        )}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{
          type: "spring",
          stiffness: 400, 
          damping: 17
        }}
      >
        <motion.div 
          className="mr-3"
          initial={{ rotate: 0 }}
          whileHover={{ rotate: [0, -10, 10, -5, 5, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          {icon}
        </motion.div>
        {label}
      </motion.div>
    </Link>
  );
}

// Variants for parent animations
const drawerVariants = {
  hidden: { x: "-100%" },
  visible: { 
    x: 0,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 30,
      when: "beforeChildren",
      staggerChildren: 0.05
    }
  },
  exit: {
    x: "-100%",
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 35,
      when: "afterChildren",
      staggerChildren: 0.03,
      staggerDirection: -1
    }
  }
};

// Variants for child animations
const itemVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 20 
    }
  },
  exit: { 
    opacity: 0,
    x: -15,
    transition: { duration: 0.2 }
  }
};

// Overlay animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const [location] = useLocation();
  const { currentUser, logout } = useAuth();
  
  const navItems = [
    { href: "/", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard" },
    { href: "/vendors", icon: <Users className="h-5 w-5" />, label: "Vendors" },
    { href: "/purchases", icon: <ShoppingCart className="h-5 w-5" />, label: "Purchases" },
    { href: "/retail-sales", icon: <Store className="h-5 w-5" />, label: "Retail Sales" },
    { href: "/hotel-sales", icon: <Building2 className="h-5 w-5" />, label: "Hotel Sales" },
    { href: "/reports", icon: <BarChart3 className="h-5 w-5" />, label: "Reports" },
  ];

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div 
                className="fixed inset-0 bg-black/50 z-40"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={overlayVariants}
              />
            </Dialog.Overlay>
            
            <Dialog.Content asChild>
              <motion.div 
                className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs bg-white shadow-xl"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={drawerVariants}
              >
                <div className="flex flex-col h-full">
                  <motion.div 
                    className="flex items-center justify-between p-4 border-b"
                    variants={itemVariants}
                  >
                    <motion.div 
                      className="font-semibold text-lg text-primary"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                    >
                      Menu
                    </motion.div>
                    <Dialog.Close asChild>
                      <motion.button 
                        className="p-1 rounded-full hover:bg-gray-100"
                        whileHover={{ 
                          scale: 1.1,
                          rotate: [0, 5, -5, 0],
                          transition: { duration: 0.3 }
                        }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="h-5 w-5 text-gray-500" />
                      </motion.button>
                    </Dialog.Close>
                  </motion.div>
                  
                  <div className="flex-1 overflow-y-auto py-2">
                    <motion.div 
                      className="px-4 py-2"
                      variants={itemVariants}
                    >
                      <motion.div 
                        className="text-sm font-medium text-gray-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        Account
                      </motion.div>
                      <motion.div 
                        className="mt-1 text-sm font-medium text-gray-800"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {currentUser?.email}
                      </motion.div>
                    </motion.div>
                    
                    <motion.div 
                      className="border-t my-2"
                      variants={itemVariants}
                    />
                    
                    <nav className="mt-2 space-y-1 px-2">
                      {navItems.map((item, index) => (
                        <motion.div
                          key={item.href}
                          variants={itemVariants}
                          custom={index}
                        >
                          <NavItem 
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                            active={location === item.href}
                            onClick={onClose}
                          />
                        </motion.div>
                      ))}
                    </nav>
                  </div>
                  
                  <motion.div 
                    className="border-t p-4"
                    variants={itemVariants}
                  >
                    <motion.button 
                      onClick={() => logout()}
                      className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                      whileHover={{ 
                        scale: 1.02,
                        backgroundColor: "rgba(239, 68, 68, 0.1)" 
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <LogOut className="h-4 w-4 mr-3 text-gray-500" />
                      Logout
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}