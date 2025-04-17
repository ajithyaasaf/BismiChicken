import { Link, useLocation } from "wouter";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Store, 
  Building2,
  Coins,
  BarChart3,
  Plus,
  Clock,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  index: number;
}

interface QuickActionProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  index: number;
  onClick: () => void;
}

function NavItem({ href, icon, label, active, index }: NavItemProps) {
  return (
    <Link href={href}>
      <motion.div 
        className="flex flex-col items-center text-xs cursor-pointer"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 20,
          delay: index * 0.05 + 0.1
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div 
          className={cn(
            "p-2 rounded-full",
            active ? "bg-primary text-white" : "text-gray-600"
          )}
          whileHover={{ y: -4 }}
          animate={active ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ 
            duration: active ? 0.3 : 0,
            times: active ? [0, 0.6, 1] : [0, 1],
            type: "spring"
          }}
        >
          {icon}
        </motion.div>
        <motion.span 
          className={cn(
            "mt-1",
            active ? "text-primary font-medium" : "text-gray-600"
          )}
          animate={active ? { 
            scale: [1, 1.05, 1],
            color: "#1a56db"  // assuming primary is a blue-ish color
          } : {}}
          transition={{ duration: 0.3 }}
        >
          {label}
        </motion.span>
      </motion.div>
    </Link>
  );
}

function QuickAction({ href, icon, label, description, color, index, onClick }: QuickActionProps) {
  return (
    <Link href={href} onClick={onClick}>
      <motion.div 
        className="flex items-center bg-white shadow-md rounded-xl p-3 mb-3"
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 25,
          delay: index * 0.05 
        }}
        whileTap={{ scale: 0.95 }}
      >
        <div className={`rounded-full p-2 mr-3 ${color}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{label}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </motion.div>
    </Link>
  );
}

export default function MobileNav() {
  const [location] = useLocation();
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  // Main navigation items
  const navItems = [
    { href: "/", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard" },
    { href: "/vendors", icon: <Users className="h-5 w-5" />, label: "Vendors" },
    { href: "/purchases", icon: <ShoppingCart className="h-5 w-5" />, label: "Purchases" },
    { href: "/retail-sales", icon: <Store className="h-5 w-5" />, label: "Retail" },
    { href: "/hotel-sales", icon: <Building2 className="h-5 w-5" />, label: "Hotel" },
  ];

  // Quick actions for floating action button
  const quickActions = [
    { 
      href: "/purchases", 
      icon: <ShoppingCart className="h-5 w-5 text-white" />, 
      label: "New Purchase", 
      description: "Record a new chicken purchase",
      color: "bg-blue-500"
    },
    { 
      href: "/retail-sales", 
      icon: <Store className="h-5 w-5 text-white" />, 
      label: "New Retail Sale", 
      description: "Add a walk-in customer sale",
      color: "bg-green-500"
    },
    { 
      href: "/hotel-sales", 
      icon: <Building2 className="h-5 w-5 text-white" />, 
      label: "New Hotel Sale", 
      description: "Create a bill for hotel order",
      color: "bg-cyan-500" 
    },
    { 
      href: "/vendor-debt", 
      icon: <Coins className="h-5 w-5 text-white" />, 
      label: "Vendor Payment", 
      description: "Record a payment to vendor",
      color: "bg-amber-500"
    },
    { 
      href: "/reports", 
      icon: <BarChart3 className="h-5 w-5 text-white" />, 
      label: "Today's Summary", 
      description: "View today's sales and profit",
      color: "bg-purple-500"
    },
  ];

  // Toggle quick actions panel
  const toggleQuickActions = () => {
    setShowQuickActions(!showQuickActions);
  };

  // Hide quick actions when clicking on an action
  const hideQuickActions = () => {
    setShowQuickActions(false);
  };

  return (
    <>
      {/* Quick Action Floating Button */}
      <AnimatePresence>
        {!showQuickActions && (
          <motion.button
            className="md:hidden fixed bottom-20 right-4 bg-primary text-white p-3 rounded-full shadow-lg z-50"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleQuickActions}
          >
            <Plus className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Quick Actions Panel */}
      <AnimatePresence>
        {showQuickActions && (
          <motion.div 
            className="md:hidden fixed inset-0 bg-gray-900 bg-opacity-50 z-50 p-4 flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={hideQuickActions}
          >
            <motion.div
              className="bg-gray-100 rounded-t-xl p-4 pb-20"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-500 mr-1" />
                  <h2 className="text-sm text-gray-500">Quick Actions</h2>
                </div>
                <button onClick={hideQuickActions}>
                  <XCircle className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              {quickActions.map((action, index) => (
                <QuickAction
                  key={action.href}
                  href={action.href}
                  icon={action.icon}
                  label={action.label}
                  description={action.description}
                  color={action.color}
                  index={index}
                  onClick={hideQuickActions}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <motion.div 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-lg z-10 border-t border-gray-200"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 30,
          delay: 0.2
        }}
      >
        <div className="flex justify-around py-2">
          {navItems.map((item, index) => (
            <NavItem 
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={location === item.href}
              index={index}
            />
          ))}
        </div>
      </motion.div>
    </>
  );
}
