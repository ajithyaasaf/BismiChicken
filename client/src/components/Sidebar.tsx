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
      <div 
        className={cn(
          "group flex items-center px-2 py-2 text-base font-medium rounded-md cursor-pointer",
          active 
            ? "bg-primary bg-opacity-10 text-primary"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )}
      >
        <div className={cn(
          "mr-3", 
          active ? "text-primary" : "text-gray-500"
        )}>
          {icon}
        </div>
        {label}
      </div>
    </Link>
  );
}

export default function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard" },
    { href: "/vendors", icon: <Users className="h-5 w-5" />, label: "Vendors" },
    { href: "/purchases", icon: <ShoppingCart className="h-5 w-5" />, label: "Purchases" },
    { href: "/retail-sales", icon: <Store className="h-5 w-5" />, label: "Retail Sales" },
    { href: "/hotel-sales", icon: <Building2 className="h-5 w-5" />, label: "Hotel Sales" },
    { href: "/reports", icon: <BarChart3 className="h-5 w-5" />, label: "Reports" },
  ];

  return (
    <aside className="w-64 bg-white shadow-md hidden md:block">
      <nav className="mt-5 px-2 space-y-1">
        {navItems.map((item) => (
          <NavItem 
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={location === item.href}
          />
        ))}
      </nav>
    </aside>
  );
}
