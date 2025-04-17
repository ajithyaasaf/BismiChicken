import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Package, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

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
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center">
          {/* Mobile menu toggle button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden mr-2 text-primary"
            onClick={onMobileMenuToggle}
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <Package className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-lg font-medium text-gray-900 hidden sm:block">Chicken Business Management</h1>
          <h1 className="text-lg font-medium text-gray-900 sm:hidden">CBM</h1>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <span className="text-sm text-gray-700 hidden sm:inline">
            {currentUser?.email}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
          >
            <LogOut className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
