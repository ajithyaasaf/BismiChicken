import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useBreakpoint } from "../hooks/use-mobile";
import { motion } from "framer-motion";

interface SummaryCardProps {
  title: string;
  icon: ReactNode;
  primaryValue: string;
  secondaryValue?: string;
  footerText?: string;
  footerColor?: string;
  isLoading?: boolean;
}

export default function SummaryCard({
  title,
  icon,
  primaryValue,
  secondaryValue,
  footerText,
  footerColor = "text-gray-500",
  isLoading = false,
}: SummaryCardProps) {
  const currentBreakpoint = useBreakpoint();
  
  // Determine text sizes based on screen size
  const getTitleSize = () => {
    switch (currentBreakpoint) {
      case 'xs':
        return "text-xs";
      default:
        return "text-sm";
    }
  };
  
  const getPrimaryValueSize = () => {
    switch (currentBreakpoint) {
      case 'xs':
        return "text-xl";
      case 'sm':
        return "text-xl";
      default:
        return "text-2xl";
    }
  };
  
  const getSecondaryValueSize = () => {
    switch (currentBreakpoint) {
      case 'xs':
        return "text-xs";
      default:
        return "text-sm";
    }
  };
  
  // Determine padding based on screen size
  const getCardPadding = () => {
    switch (currentBreakpoint) {
      case 'xs':
        return "p-3";
      default:
        return "p-4";
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-white rounded-lg shadow-sm h-full">
        <CardContent className={`${getCardPadding()} flex flex-col h-full`}>
          <div className="flex items-center justify-between">
            <div className={`${getTitleSize()} font-medium text-gray-500`}>{title}</div>
            <div className="bg-opacity-10 p-1 rounded-full">{icon}</div>
          </div>
          
          {isLoading ? (
            <>
              <div className="mt-2 flex items-end">
                <Skeleton className={currentBreakpoint === 'xs' ? "h-6 w-24" : "h-8 w-24"} />
                {secondaryValue && <Skeleton className="ml-2 h-5 w-16" />}
              </div>
              {footerText && <Skeleton className="mt-1 h-4 w-20" />}
            </>
          ) : (
            <>
              <div className="mt-2 flex items-end flex-wrap gap-1">
                <div className={`${getPrimaryValueSize()} font-semibold`}>{primaryValue}</div>
                {secondaryValue && (
                  <div className={`${getSecondaryValueSize()} text-gray-500`}>{secondaryValue}</div>
                )}
              </div>
              {footerText && (
                <div className={cn(`mt-auto pt-1 ${currentBreakpoint === 'xs' ? "text-[10px]" : "text-xs"}`, footerColor)}>
                  {footerText}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
