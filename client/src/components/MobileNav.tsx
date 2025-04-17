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
          "p-1",
          active ? "text-primary" : "text-gray-500"
        )}>
          {icon}
        </div>
        <span className={cn(
          "mt-1",
          active ? "text-primary" : "text-gray-500"
        )}>
          {label}
        </span>
      </div>
    </Link>
  );
}

export default function MobileNav() {
  const [location] = useLocation();
  
  const navItems = [
    { href: "/", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard" },
    { href: "/vendors", icon: <Users className="h-5 w-5" />, label: "Vendors" },
    { href: "/purchases", icon: <ShoppingCart className="h-5 w-5" />, label: "Purchases" },
    { href: "/retail-sales", icon: <Store className="h-5 w-5" />, label: "Retail" },
    { href: "/hotel-sales", icon: <Building2 className="h-5 w-5" />, label: "Hotel" },
    { href: "/reports", icon: <BarChart3 className="h-5 w-5" />, label: "Reports" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-lg z-10">
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
