import React from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface TableWrapperProps {
  children: React.ReactNode;
  title?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  className?: string;
  headerActions?: React.ReactNode;
}

/**
 * Consistent table wrapper with search and header actions
 */
export function TableWrapper({
  children,
  title,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  showSearch = false,
  className,
  headerActions
}: TableWrapperProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || showSearch || headerActions) && (
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            {title && (
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {title}
              </h2>
            )}
            
            {showSearch && onSearchChange && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent  dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
            )}
          </div>
          
          {headerActions && (
            <div className="flex items-center gap-2">
              {headerActions}
            </div>
          )}
        </div>
      )}
      
      <div>
        {children}
      </div>
    </div>
  );
}

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Consistent table component with proper styling
 */
export function ConsistentTable({ children, className }: TableProps) {
  return (
    <table className={cn(
      "w-full border-collapse  dark:bg-neutral-800  rounded-lg overflow-hidden",
      className
    )}>
      {children}
    </table>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Consistent table header
 */
export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <thead className={cn(
      "bg-neutral-50 dark:bg-neutral-700",
      className
    )}>
      {children}
    </thead>
  );
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Consistent table body
 */
export function TableBody({ children, className }: TableBodyProps) {
  return (
    <tbody className={cn(
      "divide-y divide-neutral-200 dark:divide-neutral-600",
      className
    )}>
      {children}
    </tbody>
  );
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  isTotal?: boolean;
  onClick?: () => void;
}

/**
 * Consistent table row with proper styling
 */
export function TableRow({ children, className, isTotal = false, onClick }: TableRowProps) {
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

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  isHeader?: boolean;
}

/**
 * Consistent table cell
 */
export function TableCell({ children, className, isHeader = false }: TableCellProps) {
  const Tag = isHeader ? 'th' : 'td';
  
  return (
    <Tag className={cn(
      "table-cell border-r border-neutral-200 dark:border-neutral-600 last:border-r-0",
      isHeader && "table-header-12 font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-700",
      !isHeader && "table-text-14 text-neutral-900 dark:text-neutral-100",
      className
    )}>
      {children}
    </Tag>
  );
}