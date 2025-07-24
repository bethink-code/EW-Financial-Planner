// Default Field Types System for Estate Liquidity Application
export type FieldType = 
  | 'text'
  | 'currency'
  | 'percentage'
  | 'years'
  | 'number'
  | 'email'
  | 'phone'
  | 'checkbox'
  | 'date'
  | 'select'
  | 'textarea';

export interface FieldTypeConfig {
  type: FieldType;
  label: string;
  placeholder?: string;
  defaultValue: string | boolean;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    customValidator?: (value: any) => boolean;
  };
  formatting?: {
    prefix?: string;
    suffix?: string;
    decimals?: number;
    thousandsSeparator?: boolean;
  };
  inputProps?: {
    className?: string;
    disabled?: boolean;
    readOnly?: boolean;
    maxLength?: number;
    minWidth?: string;
    maxWidth?: string;
  };
}

// Standard field configurations used across all calculators
export const defaultFieldTypes: Record<string, FieldTypeConfig> = {
  // Text Fields
  description: {
    type: 'text',
    label: 'Description',
    placeholder: 'Enter description',
    defaultValue: '',
    inputProps: {
      className: 'table-input text-left',
      minWidth: '150px',
      maxWidth: '300px'
    }
  },
  
  name: {
    type: 'text',
    label: 'Name',
    placeholder: 'Enter name',
    defaultValue: '',
    validation: {
      required: true
    },
    inputProps: {
      className: 'table-input text-left',
      minWidth: '150px',
      maxWidth: '300px'
    }
  },

  owner: {
    type: 'text',
    label: 'Owner',
    placeholder: 'Enter owner name',
    defaultValue: 'Donald Edwards',
    validation: {
      required: true
    },
    inputProps: {
      className: 'table-input text-left',
      minWidth: '150px',
      maxWidth: '300px'
    }
  },

  beneficiary: {
    type: 'text',
    label: 'Beneficiary',
    placeholder: 'Enter beneficiary name',
    defaultValue: '',
    validation: {
      required: true
    },
    inputProps: {
      className: 'table-input text-left',
      minWidth: '150px',
      maxWidth: '300px'
    }
  },

  // Currency Fields
  amount: {
    type: 'currency',
    label: 'Amount',
    placeholder: '0',
    defaultValue: '0',
    formatting: {
      prefix: 'R ',
      decimals: 0,
      thousandsSeparator: true
    },
    inputProps: {
      className: 'table-input text-right',
      minWidth: '90px',
      maxWidth: '150px'
    }
  },

  deathBenefit: {
    type: 'currency',
    label: 'Death Benefit',
    placeholder: '0',
    defaultValue: '0',
    formatting: {
      prefix: 'R ',
      decimals: 0,
      thousandsSeparator: true
    },
    inputProps: {
      className: 'table-input text-right',
      minWidth: '100px',
      maxWidth: '180px'
    }
  },

  fundValue: {
    type: 'currency',
    label: 'Fund Value',
    placeholder: '0',
    defaultValue: '0',
    formatting: {
      prefix: 'R ',
      decimals: 0,
      thousandsSeparator: true
    },
    inputProps: {
      className: 'table-input text-right',
      minWidth: '100px',
      maxWidth: '180px'
    }
  },

  premiums: {
    type: 'currency',
    label: 'Premiums',
    placeholder: '0',
    defaultValue: '0',
    formatting: {
      prefix: 'R ',
      decimals: 0,
      thousandsSeparator: true
    },
    inputProps: {
      className: 'table-input text-right',
      minWidth: '90px',
      maxWidth: '150px'
    }
  },

  lumpSum: {
    type: 'currency',
    label: 'Lump Sum',
    placeholder: '0',
    defaultValue: '0',
    formatting: {
      prefix: 'R ',
      decimals: 0,
      thousandsSeparator: true
    },
    inputProps: {
      className: 'table-input text-right',
      minWidth: '90px',
      maxWidth: '150px'
    }
  },

  // Percentage Fields
  percentage: {
    type: 'percentage',
    label: 'Percentage',
    placeholder: '0',
    defaultValue: '0',
    formatting: {
      suffix: '%',
      decimals: 1
    },
    validation: {
      min: 0,
      max: 100
    },
    inputProps: {
      className: 'table-input text-right',
      minWidth: '60px',
      maxWidth: '80px'
    }
  },

  benefitSplit: {
    type: 'percentage',
    label: 'Benefit Split',
    placeholder: '0',
    defaultValue: '0',
    formatting: {
      suffix: '%',
      decimals: 1
    },
    validation: {
      min: 0,
      max: 100
    },
    inputProps: {
      className: 'table-input text-right',
      minWidth: '70px',
      maxWidth: '90px'
    }
  },

  // Years Fields
  years: {
    type: 'years',
    label: 'Years',
    placeholder: '0',
    defaultValue: '0',
    formatting: {
      suffix: ' years',
      decimals: 0
    },
    validation: {
      min: 0,
      max: 100
    },
    inputProps: {
      className: 'table-input text-right',
      minWidth: '80px',
      maxWidth: '100px'
    }
  },

  // Number Fields
  number: {
    type: 'number',
    label: 'Number',
    placeholder: '0',
    defaultValue: '0',
    inputProps: {
      className: 'table-input text-right',
      minWidth: '60px',
      maxWidth: '100px'
    }
  },

  // Boolean Fields
  checkbox: {
    type: 'checkbox',
    label: 'Checkbox',
    defaultValue: false,
    inputProps: {
      className: 'h-4 w-4 text-blue-600 bg-white border-neutral-300 rounded focus:ring-primary focus:ring-2'
    }
  },

  // Special Fields
  additionalInfo: {
    type: 'textarea',
    label: 'Additional Info',
    placeholder: 'Enter additional information',
    defaultValue: '',
    inputProps: {
      className: 'table-input',
      minWidth: '200px',
      maxWidth: '400px'
    }
  }
};

// Utility function to format values based on field type
export const formatFieldValue = (value: string, fieldType: FieldType, config?: FieldTypeConfig): string => {
  if (!value?.trim()) return value;
  
  const cleanValue = value.replace(/[^\d.-]/g, '');
  if (!cleanValue || isNaN(parseFloat(cleanValue))) return value;
  
  const numValue = parseFloat(cleanValue);
  
  switch (fieldType) {
    case 'currency':
      return `R ${numValue.toLocaleString()}`;
      
    case 'percentage':
      return `${numValue}%`;
      
    case 'years':
      return `${numValue} years`;
      
    case 'number':
      return numValue.toString();
      
    default:
      return value;
  }
};

// Utility function to get field configuration
export const getFieldConfig = (fieldName: string): FieldTypeConfig => {
  return defaultFieldTypes[fieldName] || defaultFieldTypes.text;
};

// Utility function to validate field value
export const validateFieldValue = (value: any, config: FieldTypeConfig): boolean => {
  if (!config.validation) return true;
  
  const { required, min, max, pattern, customValidator } = config.validation;
  
  // Required validation
  if (required && (!value || value.toString().trim() === '')) {
    return false;
  }
  
  // Numeric validations
  if (typeof value === 'number' || !isNaN(parseFloat(value))) {
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    
    if (min !== undefined && numValue < min) return false;
    if (max !== undefined && numValue > max) return false;
  }
  
  // Pattern validation
  if (pattern && typeof value === 'string' && !pattern.test(value)) {
    return false;
  }
  
  // Custom validation
  if (customValidator && !customValidator(value)) {
    return false;
  }
  
  return true;
};

// Utility to create standardized input props
export const getInputProps = (fieldName: string, overrides?: Partial<FieldTypeConfig>): any => {
  const config = getFieldConfig(fieldName);
  const mergedConfig = { ...config, ...overrides };
  
  return {
    type: mergedConfig.type === 'currency' || mergedConfig.type === 'percentage' || mergedConfig.type === 'years' ? 'text' : mergedConfig.type,
    placeholder: mergedConfig.placeholder,
    defaultValue: mergedConfig.defaultValue,
    className: mergedConfig.inputProps?.className || 'table-input',
    disabled: mergedConfig.inputProps?.disabled || false,
    readOnly: mergedConfig.inputProps?.readOnly || false,
    maxLength: mergedConfig.inputProps?.maxLength,
    style: {
      minWidth: mergedConfig.inputProps?.minWidth,
      maxWidth: mergedConfig.inputProps?.maxWidth
    }
  };
};