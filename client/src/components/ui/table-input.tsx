import React, { useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatCurrencyValue, isCurrencyField, isPercentageField } from "@/lib/formatting";

interface TableInputProps {
  value: string;
  onBlur?: (value: string) => void;
  onChange?: (value: string) => void;
  fieldType?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFormat?: boolean;
  textAlign?: "left" | "right" | "center";
}

/**
 * Optimized table input component with consistent formatting
 * Handles currency, percentage, and text fields automatically
 */
export function TableInput({
  value,
  onBlur,
  onChange,
  fieldType = '',
  placeholder = '',
  className,
  disabled = false,
  autoFormat = true,
  textAlign = "right"
}: TableInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const currentValue = e.target.value;
    
    if (autoFormat && currentValue.trim()) {
      const formattedValue = formatCurrencyValue(currentValue, fieldType);
      e.target.value = formattedValue;
      onBlur?.(formattedValue);
    } else {
      onBlur?.(currentValue);
    }
  }, [onBlur, fieldType, autoFormat]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  }, [onChange]);

  // Apply automatic text alignment based on field type
  const getTextAlign = useCallback(() => {
    if (textAlign !== "right") return textAlign;
    
    if (isCurrencyField(fieldType) || isPercentageField(fieldType)) {
      return "right";
    }
    
    return "left";
  }, [textAlign, fieldType]);

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={value}
      onBlur={handleBlur}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        "table-input",
        `text-${getTextAlign()}`,
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    />
  );
}

interface TableSelectProps {
  value: string;
  options: { value: string; label: string }[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Optimized table select component
 */
export function TableSelect({
  value,
  options,
  onValueChange,
  placeholder = "Select...",
  className,
  disabled = false
}: TableSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      disabled={disabled}
      className={cn(
        "table-input text-left",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}