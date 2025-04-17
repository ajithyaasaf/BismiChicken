import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-500">{title}</div>
          <div className="bg-opacity-10 p-1 rounded-full">{icon}</div>
        </div>
        
        {isLoading ? (
          <>
            <div className="mt-2 flex items-end">
              <Skeleton className="h-8 w-24" />
              {secondaryValue && <Skeleton className="ml-2 h-5 w-16" />}
            </div>
            {footerText && <Skeleton className="mt-1 h-4 w-20" />}
          </>
        ) : (
          <>
            <div className="mt-2 flex items-end">
              <div className="text-2xl font-semibold">{primaryValue}</div>
              {secondaryValue && (
                <div className="ml-2 text-sm text-gray-500">{secondaryValue}</div>
              )}
            </div>
            {footerText && (
              <div className={cn("mt-1 text-xs", footerColor)}>{footerText}</div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
