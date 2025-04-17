import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import * as Dialog from "@radix-ui/react-dialog";
import { 
  X, 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Store, 
  Building2, 
  BarChart3 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "../context/AuthContext";

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
      <div 
        className={cn(
          "flex items-center px-4 py-3 text-base font-medium cursor-pointer rounded-md transition-colors",
          active 
            ? "bg-primary text-white"
            : "text-gray-700 hover:bg-gray-100"
        )}
        onClick={onClick}
      >
        <div className="mr-3">{icon}</div>
        {label}
      </div>
    </Link>
  );
}

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
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs bg-white shadow-xl">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="font-semibold text-lg text-primary">Menu</div>
              <Dialog.Close asChild>
                <button className="p-1 rounded-full hover:bg-gray-100">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </Dialog.Close>
            </div>
            
            <div className="flex-1 overflow-y-auto py-2">
              <div className="px-4 py-2">
                <div className="text-sm font-medium text-gray-400">Account</div>
                <div className="mt-1 text-sm font-medium text-gray-800">{currentUser?.email}</div>
              </div>
              
              <div className="border-t my-2"></div>
              
              <nav className="mt-2 space-y-1 px-2">
                {navItems.map((item) => (
                  <NavItem 
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    active={location === item.href}
                    onClick={onClose}
                  />
                ))}
              </nav>
            </div>
            
            <div className="border-t p-4">
              <button 
                onClick={() => logout()}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                <X className="h-4 w-4 mr-3 text-gray-500" />
                Logout
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}