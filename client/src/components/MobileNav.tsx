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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div 
          className={cn(
            "p-2 rounded-lg flex items-center justify-center",
            active 
              ? "bg-primary/10 text-primary" 
              : "text-slate-600 hover:text-primary hover:bg-slate-100"
          )}
          whileHover={{ y: -2 }}
          animate={active ? { scale: [1, 1.1, 1] } : { scale: 1 }}
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
            "mt-1 font-medium",
            active ? "text-primary" : "text-slate-600"
          )}
          animate={active ? { 
            scale: [1, 1.05, 1]
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
        className="flex items-center bg-white shadow-md rounded-xl p-3.5 mb-3 border border-slate-100"
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
        <div className={`rounded-full p-2.5 mr-3.5 ${color.replace('bg-blue-500', 'bg-primary').replace('bg-green-500', 'bg-emerald-500').replace('bg-cyan-500', 'bg-primary/90').replace('bg-amber-500', 'bg-amber-500').replace('bg-purple-500', 'bg-violet-500')}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-slate-800">{label}</h3>
          <p className="text-xs text-slate-500">{description}</p>
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
            className="md:hidden fixed bottom-20 right-4 bg-primary text-white p-3.5 rounded-full shadow-xl z-50"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.95 }}
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
            className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 p-4 flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={hideQuickActions}
          >
            <motion.div
              className="bg-slate-50 rounded-t-xl p-5 pb-20 shadow-lg"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-primary mr-2" />
                  <h2 className="text-base font-medium text-slate-700">Quick Actions</h2>
                </div>
                <button 
                  onClick={hideQuickActions}
                  className="text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <XCircle className="h-5 w-5" />
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
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-2xl z-10 border-t border-slate-200"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 30,
          delay: 0.2
        }}
        style={{
          paddingBottom: 'var(--safe-area-inset-bottom, 0px)'
        }}
      >
        <div className="flex justify-around py-3">
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
