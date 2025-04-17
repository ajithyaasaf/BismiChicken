import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Store, 
  Building2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  index: number;
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

export default function MobileNav() {
  const [location] = useLocation();
  
  // Use only 5 main navigation items for mobile nav
  const navItems = [
    { href: "/", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard" },
    { href: "/vendors", icon: <Users className="h-5 w-5" />, label: "Vendors" },
    { href: "/purchases", icon: <ShoppingCart className="h-5 w-5" />, label: "Purchases" },
    { href: "/retail-sales", icon: <Store className="h-5 w-5" />, label: "Retail" },
    { href: "/hotel-sales", icon: <Building2 className="h-5 w-5" />, label: "Hotel" },
  ];

  return (
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
  );
}
