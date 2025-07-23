import React from "react";
import { cn } from "@/lib/utils";
import { formatCurrencyValue } from "@/lib/formatting";
import { designTokens } from "@/lib/design-tokens";

interface SummaryItem {
  label: string;
  value: string | number;
  type?: "currency" | "percentage" | "text";
  highlight?: boolean;
}

interface CalculatorSummaryProps {
  title: string;
  items: SummaryItem[];
  className?: string;
  columns?: 2 | 3 | 4;
}

/**
 * Consistent summary component for all calculators
 * Uses design tokens for consistent styling
 */
export function CalculatorSummary({ 
  title, 
  items, 
  className,
  columns = 3 
}: CalculatorSummaryProps) {
  const getColumnClass = () => {
    switch (columns) {
      case 2: return "grid-cols-1 md:grid-cols-2";
      case 3: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
      default: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };

  const formatValue = (item: SummaryItem): string => {
    const { value, type } = item;
    const stringValue = value.toString();
    
    if (type === "currency") {
      return formatCurrencyValue(stringValue, "amount");
    } else if (type === "percentage") {
      return formatCurrencyValue(stringValue, "percentage");
    }
    
    return stringValue;
  };

  return (
    <div className={cn(designTokens.layout.section, className)}>
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {title}
      </h3>
      
      <div className={cn("grid gap-4", getColumnClass())}>
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "bg-card rounded-lg border border-border p-4 transition-colors",
              item.highlight && "border-primary bg-primary/5"
            )}
          >
            <div className="text-sm font-medium text-muted-foreground mb-1">
              {item.label}
            </div>
            <div className={cn(
              "text-xl font-bold",
              item.highlight ? "text-primary" : "text-foreground"
            )}>
              {formatValue(item)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CalculatorHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Consistent header component for all calculators
 */
export function CalculatorHeader({ 
  title, 
  description, 
  actions, 
  className 
}: CalculatorHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-6", className)}>
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

interface CalculatorSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

/**
 * Consistent section wrapper for calculator components
 */
export function CalculatorSection({ 
  title, 
  children, 
  className,
  collapsible = false,
  defaultExpanded = true 
}: CalculatorSectionProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  return (
    <div className={cn(designTokens.layout.section, className)}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {title}
          </h3>
          
          {collapsible && (
            <button
              onClick={() => setExpanded(!expanded)}
              className={cn(
                "text-sm text-muted-foreground hover:text-foreground transition-colors",
                designTokens.animations.transition
              )}
            >
              {expanded ? "Collapse" : "Expand"}
            </button>
          )}
        </div>
      )}
      
      {(!collapsible || expanded) && (
        <div className={expanded && collapsible ? designTokens.animations.fadeIn : ""}>
          {children}
        </div>
      )}
    </div>
  );
}