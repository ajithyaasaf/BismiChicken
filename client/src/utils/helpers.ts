import { format } from "date-fns";

/**
 * Format a number as Indian Rupees
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a number with commas for thousands
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-IN").format(num);
};

/**
 * Format a date to a readable string
 */
export const formatDate = (date: Date, formatStr: string = "PPP"): string => {
  return format(date, formatStr);
};

/**
 * Format a timestamp to a readable time
 */
export const formatTime = (date: Date): string => {
  return format(date, "h:mm a");
};

/**
 * Calculate total from quantity and rate
 */
export const calculateTotal = (quantity: number, rate: number): number => {
  return quantity * rate;
};

/**
 * Generate a CSV string from data
 */
export const generateCSV = (data: any[], columns: { field: string; header: string }[]): string => {
  if (!data || data.length === 0) return "";
  
  // Create header row
  const headerRow = columns.map(col => `"${col.header}"`).join(",");
  
  // Create data rows
  const dataRows = data.map(row => {
    return columns.map(col => {
      // Handle string values that might contain commas
      const value = row[col.field];
      if (typeof value === "string" && value.includes(",")) {
        return `"${value}"`;
      }
      return value;
    }).join(",");
  });
  
  // Combine header and data rows
  return [headerRow, ...dataRows].join("\n");
};

/**
 * Download data as CSV file
 */
export const downloadCSV = (csvData: string, fileName: string): void => {
  const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Check if inventory is running low
 */
export const isInventoryLow = (remainingKg: number, threshold: number = 5): boolean => {
  return remainingKg < threshold && remainingKg > 0;
};

/**
 * Check if inventory is out of stock
 */
export const isOutOfStock = (remainingKg: number): boolean => {
  return remainingKg <= 0;
};
