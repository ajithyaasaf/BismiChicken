import { useState, useEffect } from "react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (start: Date, end: Date) => void;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onDateRangeChange,
}: DateRangePickerProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startDate,
    to: endDate,
  });

  // Update the internal state when props change
  useEffect(() => {
    setDate({
      from: startDate,
      to: endDate,
    });
  }, [startDate, endDate]);

  // Handle date range change from calendar
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDate(range);
      onDateRangeChange(range.from, range.to);
    }
  };

  // Handler for preset selections
  const handlePresetSelect = (value: string) => {
    const today = new Date();
    let newStartDate: Date;
    let newEndDate: Date = today;

    switch (value) {
      case "today":
        newStartDate = today;
        break;
      case "yesterday":
        newStartDate = subDays(today, 1);
        newEndDate = subDays(today, 1);
        break;
      case "last7days":
        newStartDate = subDays(today, 6);
        break;
      case "last30days":
        newStartDate = subDays(today, 29);
        break;
      case "thisMonth":
        newStartDate = startOfMonth(today);
        newEndDate = today;
        break;
      case "lastMonth":
        const lastMonth = subDays(startOfMonth(today), 1);
        newStartDate = startOfMonth(lastMonth);
        newEndDate = endOfMonth(lastMonth);
        break;
      default:
        return;
    }

    setDate({
      from: newStartDate,
      to: newEndDate,
    });
    onDateRangeChange(newStartDate, newEndDate);
  };

  return (
    <div className="flex items-center space-x-2">
      <Select onValueChange={handlePresetSelect}>
        <SelectTrigger className="h-9 w-[110px] border-dashed">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="yesterday">Yesterday</SelectItem>
          <SelectItem value="last7days">Last 7 days</SelectItem>
          <SelectItem value="last30days">Last 30 days</SelectItem>
          <SelectItem value="thisMonth">This month</SelectItem>
          <SelectItem value="lastMonth">Last month</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "h-9 w-[230px] justify-start text-left font-normal border-dashed",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateRangeSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}