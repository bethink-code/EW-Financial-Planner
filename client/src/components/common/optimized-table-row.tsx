import React from "react";
import { cn } from "@/lib/utils";
import { getTableCellClass } from "@/lib/design-tokens";

interface OptimizedTableRowProps {
  children: React.ReactNode;
  className?: string;
  isTotal?: boolean;
  onClick?: () => void;
}

/**
 * Optimized table row component that avoids React Fragment warnings
 * by properly handling metadata attributes
 */
export function OptimizedTableRow({ 
  children, 
  className, 
  isTotal = false, 
  onClick 
}: OptimizedTableRowProps) {
  return (
    <tr 
      className={cn(
        "table-row  dark:hover:bg-neutral-700 transition-colors",
        isTotal && "table-total-row  dark:bg-neutral-600 font-bold",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface OptimizedTableCellProps {
  children: React.ReactNode;
  className?: string;
  isHeader?: boolean;
  isTotal?: boolean;
  colSpan?: number;
}

/**
 * Optimized table cell component with consistent styling
 */
export function OptimizedTableCell({ 
  children, 
  className, 
  isHeader = false, 
  isTotal = false,
  colSpan 
}: OptimizedTableCellProps) {
  const Tag = isHeader ? 'th' : 'td';
  
  return (
    <Tag 
      className={cn(
        getTableCellClass(isHeader, isTotal),
        className
      )}
      colSpan={colSpan}
    >
      {children}
    </Tag>
  );
}

interface OptimizedTableProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Optimized table wrapper with consistent styling
 */
export function OptimizedTable({ children, className }: OptimizedTableProps) {
  return (
    <table className={cn(
      "w-full border-collapse  dark:bg-neutral-800 shadow-sm rounded-lg overflow-hidden",
      className
    )}>
      {children}
    </table>
  );
}

interface OptimizedTableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Optimized table header
 */
export function OptimizedTableHeader({ children, className }: OptimizedTableHeaderProps) {
  return (
    <thead className={cn(
      "bg-neutral-50 dark:bg-neutral-700",
      className
    )}>
      {children}
    </thead>
  );
}

interface OptimizedTableBodyProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Optimized table body
 */
export function OptimizedTableBody({ children, className }: OptimizedTableBodyProps) {
  return (
    <tbody className={cn(
      "divide-y divide-neutral-200 dark:divide-neutral-600",
      className
    )}>
      {children}
    </tbody>
  );
}