// Centralized formatting utilities for consistent data formatting across the application

export type FieldType = 'currency' | 'percentage' | 'years' | 'text' | 'number';

/**
 * Format currency value with R prefix and proper formatting
 */
export const formatCurrencyValue = (value: string): string => {
  // Convert to string and handle null/undefined values
  const stringValue = String(value || '');
  if (!stringValue.trim()) return 'R 0';
  const cleanValue = stringValue.replace(/[^\d.-]/g, '');
  if (!cleanValue) return 'R 0';
  if (isNaN(parseFloat(cleanValue))) return 'R 0';
  const numValue = parseFloat(cleanValue);
  return `R ${numValue.toLocaleString()}`;
};

/**
 * Format percentage value with % suffix
 */
export const formatPercentageValue = (value: string): string => {
  // Convert to string and handle null/undefined values
  const stringValue = String(value || '');
  if (!stringValue.trim()) return '0%';
  const cleanValue = stringValue.replace(/[^\d.-]/g, '');
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
  // Convert to string and handle null/undefined values
  const stringValue = String(value || '');
  if (!stringValue.trim()) return '0 years';
  const cleanValue = stringValue.replace(/[^\d.-]/g, '');
  if (!cleanValue) return '0 years';
  if (isNaN(parseFloat(cleanValue))) return '0 years';
  const numValue = parseFloat(cleanValue);
  return `${numValue} years`;
};

/**
 * Format text value for display - shows "Enter details ..." for empty values
 */
export const formatTextValue = (value: string | null): string => {
  // Handle null, undefined, and empty values - show placeholder for display only
  if (value === null || value === undefined || value === '') return 'Enter details ...';
  const stringValue = String(value).trim();
  if (!stringValue) return 'Enter details ...';
  return stringValue;
};

/**
 * Clean text value for saving - removes placeholder text and returns null for storage
 */
export const cleanTextValue = (value: string): string | null => {
  const stringValue = String(value || '').trim();
  if (stringValue === 'Enter details ...' || stringValue === '') return null;
  return stringValue;
};

/**
 * Format numeric value
 */
export const formatNumberValue = (value: string): string => {
  // Convert to string and handle null/undefined values
  const stringValue = String(value || '');
  if (!stringValue.trim()) return '0';
  const cleanValue = stringValue.replace(/[^\d.-]/g, '');
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
      return value.trim() === '' || value === 'Donald Edwards';
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
  // Check for all default value patterns
  if (value === "" || 
      value === "R 0" || 
      value === "0%" || 
      value === "0 years" ||
      /^R \d{1,3}(,\d{3})*$/.test(value) || // Currency with formatting like "R 1,000"
      /^\d+%$/.test(value) || // Any percentage like "3%", "10%"
      /^\d+ years$/.test(value)) { // Any years like "5 years"
    e.target.select();
  }
};

/**
 * Handle blur event for input fields to restore defaults when empty
 * Restores appropriate default values when field is left empty
 * @param e - The blur event
 * @param fieldType - The type of field (text, currency, percentage, years)
 */
export const handleDefaultValueBlur = (e: React.FocusEvent<HTMLInputElement>, fieldType: string) => {
  const value = e.target.value.trim();
  if (!value) {
    let defaultValue = "";
    switch (fieldType) {
      case 'currency':
        defaultValue = "R 0";
        break;
      case 'percentage': 
        defaultValue = "0%";
        break;
      case 'years':
        defaultValue = "0 years";
        break;
      case 'text':
      default:
        defaultValue = "";
        break;
    }
    e.target.value = defaultValue;
    e.target.className = e.target.className.replace('entered-value', 'default-value');
  } else {
    e.target.className = e.target.className.replace('default-value', 'entered-value');
  }
};

/**
 * Create a wrapper for onBlur that combines existing functionality with default restoration
 * @param originalBlurHandler - The original onBlur function that expects a value
 * @param fieldType - The type of field for default restoration
 * @returns Combined blur handler
 */
export const createEnhancedBlurHandler = (
  originalBlurHandler: (value: string) => void,
  fieldType: string = 'text'
) => {
  return (e: React.FocusEvent<HTMLInputElement>) => {
    const inputElement = e.target;
    let value = inputElement.value.trim();
    
    // Format the value based on field type before saving
    switch (fieldType) {
      case 'currency':
        value = formatCurrencyValue(value);
        break;
      case 'percentage':
        value = formatPercentageValue(value);
        break;
      case 'years':
        value = formatYearsValue(value);
        break;
      case 'text':
        value = formatTextValue(value);
        break;
      case 'number':
        value = formatNumberValue(value);
        break;
    }
    
    // Update the DOM element immediately for visual feedback
    inputElement.value = value;
    
    // Update CSS classes for styling
    if (isDefaultValue(value, fieldType as FieldType)) {
      inputElement.className = inputElement.className.replace('entered-value', 'default-value');
    } else {
      inputElement.className = inputElement.className.replace('default-value', 'entered-value');
    }
    
    // Call the original blur handler with the formatted value
    originalBlurHandler(value);
  };
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