import React from 'react';
import { getFieldConfig, formatFieldValue, validateFieldValue, getInputProps, type FieldType } from '@/lib/field-types';

interface FieldInputProps {
  fieldName: string;
  value?: string | boolean;
  onChange?: (value: string | boolean) => void;
  onBlur?: (value: string | boolean) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  overrides?: {
    type?: FieldType;
    placeholder?: string;
    className?: string;
    minWidth?: string;
    maxWidth?: string;
  };
}

export function FieldInput({ 
  fieldName, 
  value, 
  onChange, 
  onBlur, 
  disabled = false,
  className,
  style,
  overrides 
}: FieldInputProps) {
  const config = getFieldConfig(fieldName);
  const inputProps = getInputProps(fieldName, overrides);
  
  // Merge classes
  const mergedClassName = [
    inputProps.className,
    className,
    overrides?.className
  ].filter(Boolean).join(' ');

  // Merge styles
  const mergedStyle = {
    ...inputProps.style,
    ...style
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatFieldValue(rawValue, config.type, config);
    
    // Update the DOM directly for immediate visual feedback
    e.target.value = formattedValue;
    
    if (onBlur) {
      onBlur(formattedValue);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  if (config.type === 'checkbox') {
    return (
      <input
        type="checkbox"
        checked={value as boolean || false}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
        className={mergedClassName}
        style={mergedStyle}
      />
    );
  }

  if (config.type === 'textarea') {
    return (
      <textarea
        defaultValue={value as string || inputProps.defaultValue}
        placeholder={inputProps.placeholder}
        onBlur={(e) => onBlur?.(e.target.value)}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled || inputProps.disabled}
        className={mergedClassName}
        style={mergedStyle}
        rows={3}
      />
    );
  }

  return (
    <input
      type={inputProps.type}
      defaultValue={value as string || inputProps.defaultValue}
      placeholder={inputProps.placeholder}
      onBlur={handleBlur}
      onChange={handleChange}
      disabled={disabled || inputProps.disabled}
      readOnly={inputProps.readOnly}
      maxLength={inputProps.maxLength}
      className={mergedClassName}
      style={mergedStyle}
    />
  );
}

// Specialized components for common field types
export function CurrencyInput(props: Omit<FieldInputProps, 'fieldName'>) {
  return <FieldInput {...props} fieldName="amount" />;
}

export function PercentageInput(props: Omit<FieldInputProps, 'fieldName'>) {
  return <FieldInput {...props} fieldName="percentage" />;
}

export function YearsInput(props: Omit<FieldInputProps, 'fieldName'>) {
  return <FieldInput {...props} fieldName="years" />;
}

export function NameInput(props: Omit<FieldInputProps, 'fieldName'>) {
  return <FieldInput {...props} fieldName="name" />;
}

export function OwnerInput(props: Omit<FieldInputProps, 'fieldName'>) {
  return <FieldInput {...props} fieldName="owner" />;
}

export function BeneficiaryInput(props: Omit<FieldInputProps, 'fieldName'>) {
  return <FieldInput {...props} fieldName="beneficiary" />;
}