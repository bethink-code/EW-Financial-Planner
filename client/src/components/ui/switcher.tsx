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
    sm: "text-sm h-8 px-6 min-w-[80px]",
    md: "text-sm h-8 px-8 min-w-[100px]", 
    lg: "text-base h-9 px-10 min-w-[120px]"
  };

  const containerClasses = {
    sm: "px-1.5 py-1",
    md: "px-1.5 py-1",
    lg: "px-1.5 py-1"
  };

  return (
    <div 
      className={cn(
        "inline-flex bg-[#EDF4F9] rounded-lg",
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
              "relative flex items-center justify-center font-medium rounded-md transition-all duration-200 ease-in-out",
              sizeClasses[size],
              isSelected
                ? "bg-white text-[#016991] font-semibold rounded-md"
                : "text-[#6B7280] hover:text-gray-700"
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
    { value: "hybrid", label: "Hybrid" }
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