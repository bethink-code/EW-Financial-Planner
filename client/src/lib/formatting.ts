// Centralized formatting utilities for consistent data formatting across the application

export type FieldType = 'currency' | 'percentage' | 'years' | 'text' | 'number';

/**
 * Format currency value with R prefix and proper formatting
 */
export const formatCurrencyValue = (value: string): string => {
  if (!value?.trim()) return 'R 0';
  const cleanValue = value.replace(/[^\d.-]/g, '');
  if (!cleanValue) return 'R 0';
  if (isNaN(parseFloat(cleanValue))) return 'R 0';
  const numValue = parseFloat(cleanValue);
  return `R ${numValue.toLocaleString()}`;
};

/**
 * Format percentage value with % suffix
 */
export const formatPercentageValue = (value: string): string => {
  if (!value?.trim()) return '0%';
  const cleanValue = value.replace(/[^\d.-]/g, '');
  if (!cleanValue) return '0%';
  if (isNaN(parseFloat(cleanValue))) return '0%';
  const numValue = parseFloat(cleanValue);
  return `${numValue}%`;
};

/**
 * Parse a formatted currency value back to a number
 * @param value - The formatted value
 * @returns Numeric value
 */
export const parseCurrencyValue = (value: string): number => {
  const cleanValue = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleanValue) || 0;
};

/**
 * Format years with years suffix
 */
export const formatYearsValue = (value: string): string => {
  if (!value?.trim()) return '0 years';
  const cleanValue = value.replace(/[^\d.-]/g, '');
  if (!cleanValue) return '0 years';
  if (isNaN(parseFloat(cleanValue))) return '0 years';
  const numValue = parseFloat(cleanValue);
  return `${numValue} years`;
};

/**
 * Format text value with trimming - uses "Enter here ..." as default for empty values
 */
export const formatTextValue = (value: string): string => {
  return value?.trim() || 'Enter here ...';
};

/**
 * Format numeric value
 */
export const formatNumberValue = (value: string): string => {
  if (!value?.trim()) return '0';
  const cleanValue = value.replace(/[^\d.-]/g, '');
  if (!cleanValue) return '0';
  if (isNaN(parseFloat(cleanValue))) return '0';
  const numValue = parseFloat(cleanValue);
  return numValue.toString();
};

/**
 * Universal formatting function that detects field type and applies appropriate formatting
 */
export const formatFieldValue = (value: string, fieldType: FieldType): string => {
  switch (fieldType) {
    case 'currency':
      return formatCurrencyValue(value);
    case 'percentage':
      return formatPercentageValue(value);
    case 'years':
      return formatYearsValue(value);
    case 'text':
      return formatTextValue(value);
    case 'number':
      return formatNumberValue(value);
    default:
      return formatTextValue(value);
  }
};

/**
 * Legacy formatting function for backward compatibility
 */
export const formatCurrency = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  if (isNaN(numValue)) return 'R 0';
  return `R ${Math.round(numValue).toLocaleString()}`;
};

/**
 * Legacy percentage formatting for backward compatibility
 */
export const formatPercentage = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  if (isNaN(numValue)) return '0%';
  const clampedValue = Math.max(0, Math.min(100, numValue));
  return `${clampedValue}%`;
};

/**
 * Check if a value is a default value (used for styling)
 */
export const isDefaultValue = (value: string, fieldType: FieldType): boolean => {
  if (!value || value.trim() === '') return true;
  
  switch (fieldType) {
    case 'currency':
      return value === 'R 0' || value === '0';
    case 'percentage': 
      return value === '0%' || value === '0';
    case 'years':
      return value === '0 years' || value === '0';
    case 'text':
      return value.trim() === '' || value === 'Enter here ...' || value === 'Donald Edwards';
    case 'number':
      return value === '0';
    default:
      return value.trim() === '';
  }
};

/**
 * Get CSS class for input field based on whether it has default value
 */
export const getValueClass = (value: string, fieldType: FieldType): string => {
  return isDefaultValue(value, fieldType) ? 'default-value' : 'entered-value';
};

/**
 * Handle focus event for input fields with default values
 * Automatically selects the text if it's a default value for easy overwriting
 * @param e - The focus event
 */
export const handleDefaultValueFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  const value = e.target.value;
  if (value === "Enter here ..." || value === "R 0" || value === "0%" || value === "0 years") {
    e.target.select();
  }
};

/**
 * Legacy years formatting for backward compatibility
 */
export const formatYears = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  if (isNaN(numValue)) return '0 years';
  return `${Math.round(numValue)} years`;
};

/**
 * Check if a field should be formatted as currency
 * @param fieldName - The field name to check
 * @returns Boolean indicating if field should be currency formatted
 */
export const isCurrencyField = (fieldName: string): boolean => {
  const currencyFields = [
    'amount', 'coverAmount', 'monthlyIncome', 'approvedLifeCover', 'fundValue', 
    'fundValueAtDeath', 'lumpSumTaken', 'nondeductibleContribution', 'livingAnnuity', 
    'escalationAmount', 'deathBenefit', 'premiumsByOthers', 'collateralSession',
    'baseCost', 'marketValue', 'spouse', 'others', 'benefit'
  ];
  
  return currencyFields.some(field => 
    fieldName.toLowerCase().includes(field.toLowerCase())
  );
};

/**
 * Check if a field should be formatted as percentage
 * @param fieldName - The field name to check
 * @returns Boolean indicating if field should be percentage formatted
 */
export const isPercentageField = (fieldName: string): boolean => {
  const percentageFields = [
    'percentage', 'split', 'increase', 'beneficiaryPercentageSplit'
  ];
  
  return percentageFields.some(field => 
    fieldName.toLowerCase().includes(field.toLowerCase())
  );
};