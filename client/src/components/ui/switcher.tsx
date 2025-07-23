import React from "react";
import { cn } from "@/lib/utils";

interface SwitcherOption {
  value: string;
  label: string;
}

interface SwitcherProps {
  options: SwitcherOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Switcher component with rounded design and blue accent color
 * Based on the Graph/Table switcher pattern
 */
export function Switcher({ 
  options, 
  value, 
  onChange, 
  className,
  size = "md"
}: SwitcherProps) {
  const sizeClasses = {
    sm: "text-xs py-1 px-2",
    md: "text-sm py-2 px-3", 
    lg: "text-base py-2.5 px-4"
  };

  const containerClasses = {
    sm: "p-1",
    md: "p-1.5",
    lg: "p-2"
  };

  return (
    <div 
      className={cn(
        "inline-flex bg-neutral-100 rounded-lg",
        containerClasses[size],
        className
      )}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative font-medium rounded-md transition-all duration-200 ease-in-out",
              sizeClasses[size],
              isSelected
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Preset Graph/Table switcher component
 */
export function GraphTableSwitcher({ 
  value, 
  onChange, 
  className,
  size = "md"
}: Omit<SwitcherProps, 'options'>) {
  const options = [
    { value: "table", label: "Table" },
    { value: "graph", label: "Hybrid" }
  ];

  return (
    <Switcher
      options={options}
      value={value}
      onChange={onChange}
      className={className}
      size={size}
    />
  );
}

/**
 * Preset Input/Flow switcher component for retirement funds
 */
export function InputFlowSwitcher({ 
  value, 
  onChange, 
  className,
  size = "md"
}: Omit<SwitcherProps, 'options'>) {
  const options = [
    { value: "input", label: "Inputs" },
    { value: "flow", label: "Flows" }
  ];

  return (
    <Switcher
      options={options}
      value={value}
      onChange={onChange}
      className={className}
      size={size}
    />
  );
}