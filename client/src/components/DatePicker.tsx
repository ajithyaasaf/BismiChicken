import { useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useBreakpoint } from "../hooks/use-mobile";

interface DatePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export default function DatePicker({ date, onDateChange }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const currentBreakpoint = useBreakpoint();
  const isMobile = currentBreakpoint === "xs" || currentBreakpoint === "sm";

  const handlePreviousDay = () => {
    onDateChange(subDays(date, 1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(date, 1));
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  // Format date differently based on screen size
  const getFormattedDate = () => {
    if (isMobile) {
      return format(date, "d MMM");
    }
    return format(date, "PPP");
  };

  return (
    <div className="flex items-center space-x-2">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousDay}
          className="bg-white h-8 w-8 border-gray-200 shadow-sm"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </Button>
      </motion.div>

      {/* Today button for quick navigation - visible on larger screens */}
      {!isMobile && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden sm:block"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="bg-white border-gray-200 shadow-sm text-xs h-8"
          >
            Today
          </Button>
        </motion.div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              className={cn(
                "bg-white border-gray-200 shadow-sm flex items-center justify-center",
                isMobile ? "px-3 py-1 h-8" : "px-4 py-2"
              )}
            >
              <CalendarIcon className={cn("text-gray-500", isMobile ? "h-3.5 w-3.5 mr-1" : "h-4 w-4 mr-2")} />
              <span className={isMobile ? "text-sm" : ""}>{getFormattedDate()}</span>
            </Button>
          </motion.div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-gray-200 shadow-lg" align="center">
          {/* Calendar navigation header */}
          <div className="p-2 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousDay}
              className="h-8 px-2 text-xs flex items-center text-gray-700"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="h-8 px-3 text-xs bg-white"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextDay}
              className="h-8 px-2 text-xs flex items-center text-gray-700"
            >
              Next
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
          
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              if (newDate) {
                onDateChange(newDate);
                setOpen(false);
              }
            }}
            initialFocus
            className={isMobile ? "p-2" : "p-3"}
          />
        </PopoverContent>
      </Popover>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextDay}
          className="bg-white h-8 w-8 border-gray-200 shadow-sm"
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </Button>
      </motion.div>
    </div>
  );
}
