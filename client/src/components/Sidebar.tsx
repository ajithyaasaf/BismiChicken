import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Store, 
  Building2, 
  BarChart3,
  CreditCard,
  ChevronRight,
  Hotel,
  Receipt,
  LineChart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

interface NavGroupProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  isActive: boolean;
}

function NavItem({ href, icon, label, active }: NavItemProps) {
  return (
    <Link href={href}>
      <motion.div 
        className={cn(
          "group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-all",
          active 
            ? "bg-primary/10 text-primary border-l-2 border-primary"
            : "text-slate-700 hover:bg-slate-100 hover:text-primary"
        )}
        whileHover={{ 
          scale: 1.01,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.98 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17
        }}
      >
        <motion.div 
          className={cn("mr-3 flex items-center justify-center", 
            active ? "text-primary" : "text-slate-500 group-hover:text-primary"
          )}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
        >
          {icon}
        </motion.div>
        <span className="font-medium">{label}</span>
      </motion.div>
    </Link>
  );
}

function NavGroup({ icon, label, children, isOpen, onToggle, isActive }: NavGroupProps) {
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onToggle}
      className="w-full"
    >
      <CollapsibleTrigger asChild>
        <motion.div 
          className={cn(
            "group flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-all",
            isActive 
              ? "bg-primary/10 text-primary border-l-2 border-primary"
              : "text-slate-700 hover:bg-slate-100 hover:text-primary"
          )}
          whileHover={{ 
            scale: 1.01,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 17
          }}
        >
          <div className="flex items-center">
            <motion.div 
              className={cn("mr-3 flex items-center justify-center", 
                isActive ? "text-primary" : "text-slate-500 group-hover:text-primary"
              )}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
            >
              {icon}
            </motion.div>
            <span className="font-medium">{label}</span>
          </div>
          <ChevronRight 
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isActive ? "text-primary" : "text-slate-500 group-hover:text-primary",
              isOpen ? "transform rotate-90" : ""
            )}
          />
        </motion.div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pl-6 space-y-1 mt-1 border-l border-slate-200 ml-4">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function Sidebar({ isOpen }: { isOpen?: boolean }) {
  const [location] = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    hotels: false
  });

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  // Check if the current location is within a group
  const isGroupActive = (paths: string[]): boolean => {
    return paths.some(path => location.startsWith(path));
  };

  const singleNavItems = [
    { href: "/", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard" },
    { href: "/vendors", icon: <Users className="h-5 w-5" />, label: "Vendors" },
    { href: "/vendor-payments", icon: <CreditCard className="h-5 w-5" />, label: "Vendor Payments" },
    { href: "/purchases", icon: <ShoppingCart className="h-5 w-5" />, label: "Purchases" },
    { href: "/retail-sales", icon: <Store className="h-5 w-5" />, label: "Retail Sales" },
    { href: "/reports", icon: <BarChart3 className="h-5 w-5" />, label: "Reports" },
  ];

  return (
    <motion.aside 
      className="w-64 bg-white shadow-lg hidden md:block border-r border-slate-200"
      initial={{ x: -20, opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
    >
      <motion.div 
        className="py-5 px-4 bg-gradient-to-r from-primary to-primary/90 text-white font-semibold flex items-center"
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-lg tracking-tight">Chicken Business Management</div>
      </motion.div>
      <nav className="mt-5 px-3 space-y-1.5">
        {/* Single nav items */}
        {singleNavItems.map((item, index) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              delay: index * 0.05,
              duration: 0.3,
              ease: "easeOut"
            }}
          >
            <NavItem 
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={location === item.href}
            />
          </motion.div>
        ))}

        {/* Hotels group */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            delay: singleNavItems.length * 0.05,
            duration: 0.3,
            ease: "easeOut"
          }}
        >
          <NavGroup
            icon={<Building2 className="h-5 w-5" />}
            label="Hotels"
            isOpen={openGroups.hotels || isGroupActive(['/hotels', '/hotel-sales', '/hotel-analytics'])}
            onToggle={() => toggleGroup('hotels')}
            isActive={isGroupActive(['/hotels', '/hotel-sales', '/hotel-analytics'])}
          >
            <NavItem
              href="/hotels"
              icon={<Hotel className="h-4 w-4" />}
              label="Hotels Management"
              active={location === '/hotels'}
            />
            <NavItem
              href="/hotel-sales"
              icon={<Receipt className="h-4 w-4" />}
              label="Hotel Sales"
              active={location === '/hotel-sales'}
            />
            <NavItem
              href="/hotel-analytics"
              icon={<LineChart className="h-4 w-4" />}
              label="Hotel Analytics"
              active={location === '/hotel-analytics'}
            />
          </NavGroup>
        </motion.div>
      </nav>
    </motion.aside>
  );
}
