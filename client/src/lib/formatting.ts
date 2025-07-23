// Centralized formatting utilities for consistent data formatting across the application

/**
 * Format currency value with R prefix and proper formatting
 * @param value - The value to format
 * @param fieldType - The type of field for context-aware formatting
 * @returns Formatted string
 */
export const formatCurrencyValue = (value: string, fieldType: string = ''): string => {
  if (!value?.trim()) return value;
  
  // Remove existing formatting
  const cleanValue = value.replace(/[^\d.-]/g, '');
  if (!cleanValue || isNaN(parseFloat(cleanValue))) return value;
  
  const numValue = parseFloat(cleanValue);
  
  // Percentage fields
  if (fieldType.toLowerCase().includes('percentage') || 
      fieldType.toLowerCase().includes('split') ||
      fieldType.toLowerCase().includes('percent')) {
    return `${numValue}%`;
  }
  
  // Years fields
  if (fieldType.toLowerCase().includes('year') || 
      fieldType.toLowerCase().includes('term')) {
    return `${numValue} years`;
  }
  
  // Currency fields - always format as currency unless specifically numeric
  const numericOnlyFields = [
    'lumpSumLeftOverProvisions', 'currentAnnualIncome', 'annualIncomeAtDeath', 
    'estateDeploymentDeceased', 'lumpSumDeath', 'previousLumpSums', 'additionalTaxFreeAmount'
  ];
  
  if (numericOnlyFields.some(field => fieldType.includes(field))) {
    return Math.round(numValue).toLocaleString();
  }
  
  // Default to currency formatting
  return `R ${Math.round(numValue).toLocaleString()}`;
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
 * Format percentage with proper validation
 * @param value - The percentage value
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  if (isNaN(numValue)) return '0%';
  
  const clampedValue = Math.max(0, Math.min(100, numValue));
  return `${clampedValue}%`;
};

/**
 * Format years with proper validation
 * @param value - The years value
 * @returns Formatted years string
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