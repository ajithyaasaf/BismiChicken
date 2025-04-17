import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Store, 
  Building2, 
  BarChart3 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

function NavItem({ href, icon, label, active }: NavItemProps) {
  return (
    <Link href={href}>
      <div className="flex flex-col items-center text-xs cursor-pointer">
        <div className={cn(
          "p-2 rounded-full transition-colors",
          active ? "bg-primary text-white" : "text-gray-600"
        )}>
          {icon}
        </div>
        <span className={cn(
          "mt-1",
          active ? "text-primary font-medium" : "text-gray-600"
        )}>
          {label}
        </span>
      </div>
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-lg z-10 border-t border-gray-200">
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <NavItem 
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={location === item.href}
          />
        ))}
      </div>
    </div>
  );
}
