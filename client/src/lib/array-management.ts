/**
 * Unified Array Management System for Multiple Owners/Beneficiaries
 * 
 * This module provides consistent handling of dynamic arrays (owners, beneficiaries)
 * across ALL calculator modules in the application.
 */

import { cleanTextValue } from './formatting';

// Default values for different array types
export const DEFAULT_VALUES = {
  owner: 'Donald Edwards',
  beneficiary: '', // Store empty string, display as "Enter details ..."
  percentage: '0%',
  currency: 'R 0',
  years: '0 years'
} as const;

// Helper to get default value for array position
export const getDefaultForPosition = (type: keyof typeof DEFAULT_VALUES, index: number) => {
  if (type === 'owner' && index === 0) {
    return DEFAULT_VALUES.owner; // First owner gets default name
  }
  return DEFAULT_VALUES[type]; // All others get standard defaults
};

// Create array management functions
export const createArrayManager = <T extends Record<string, any>>(
  items: T[],
  updateFunction: (id: number, field: string, value: any) => void
) => {
  
  // Add new item to array
  const handleAdd = (
    itemId: number, 
    arrayField: string, 
    relatedFields: { field: string; defaultValue: any }[] = [],
    defaultValue: any = DEFAULT_VALUES.beneficiary
  ) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    // Get current array
    const currentArray = item[arrayField] || [];
    
    // Add new item to main array with appropriate default
    const newArray = [...currentArray, defaultValue];
    updateFunction(itemId, arrayField, newArray);
    
    // Add corresponding items to related arrays
    relatedFields.forEach(({ field, defaultValue }) => {
      const relatedArray = item[field] || [];
      const newRelatedArray = [...relatedArray, defaultValue];
      updateFunction(itemId, field, newRelatedArray);
    });
  };

  // Remove item from array
  const handleRemove = (
    itemId: number,
    arrayIndex: number,
    arrayField: string,
    relatedFields: string[] = [],
    protectFirst: boolean = true
  ) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const currentArray = item[arrayField] || [];
    
    // Protection logic
    if (protectFirst && arrayIndex === 0) return;
    if (currentArray.length <= 1) return;
    
    // Remove from main array
    const newArray = [...currentArray];
    newArray.splice(arrayIndex, 1);
    updateFunction(itemId, arrayField, newArray);
    
    // Remove from related arrays at same index
    relatedFields.forEach(field => {
      const relatedArray = item[field] || [];
      const newRelatedArray = [...relatedArray];
      newRelatedArray.splice(arrayIndex, 1);
      updateFunction(itemId, field, newRelatedArray);
    });
  };

  // Update item in array
  const handleChange = (
    itemId: number,
    arrayIndex: number,
    arrayField: string,
    newValue: string,
    isTextField: boolean = true
  ) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const currentArray = item[arrayField] || [];
    const updatedArray = [...currentArray];
    
    // Clean the value if it's a text field
    const finalValue = isTextField ? (cleanTextValue(newValue) || '') : newValue;
    updatedArray[arrayIndex] = finalValue;
    
    updateFunction(itemId, arrayField, updatedArray);
  };

  return {
    handleAdd,
    handleRemove,
    handleChange
  };
};

// Specific implementations for common patterns

// Owner management (single array)
export const createOwnerManager = <T extends Record<string, any>>(
  items: T[],
  updateFunction: (id: number, field: string, value: any) => void
) => {
  const { handleAdd, handleRemove, handleChange } = createArrayManager(items, updateFunction);
  
  return {
    addOwner: (itemId: number) => {
      const item = items.find(i => i.id === itemId);
      const currentArray = item?.owners || [];
      const defaultValue = currentArray.length === 0 ? DEFAULT_VALUES.owner : '';
      handleAdd(itemId, 'owners', [], defaultValue);
    },
    
    removeOwner: (itemId: number, ownerIndex: number) => {
      handleRemove(itemId, ownerIndex, 'owners', [], true);
    },
    
    changeOwner: (itemId: number, ownerIndex: number, newOwner: string) => {
      handleChange(itemId, ownerIndex, 'owners', newOwner, true);
    }
  };
};

// Beneficiary management (with percentage splits)
export const createBeneficiaryManager = <T extends Record<string, any>>(
  items: T[],
  updateFunction: (id: number, field: string, value: any) => void,
  beneficiaryField: string = 'beneficiaries',
  percentageField: string = 'percentageSplits'
) => {
  const { handleAdd, handleRemove, handleChange } = createArrayManager(items, updateFunction);
  
  return {
    addBeneficiary: (itemId: number) => {
      const item = items.find(i => i.id === itemId);
      const currentArray = item?.[beneficiaryField] || [];
      const defaultValue = currentArray.length === 0 ? '' : ''; // Always empty for beneficiaries
      handleAdd(itemId, beneficiaryField, [
        { field: percentageField, defaultValue: DEFAULT_VALUES.percentage }
      ], defaultValue);
    },
    
    removeBeneficiary: (itemId: number, beneficiaryIndex: number) => {
      handleRemove(itemId, beneficiaryIndex, beneficiaryField, [percentageField], true);
    },
    
    changeBeneficiary: (itemId: number, beneficiaryIndex: number, newBeneficiary: string) => {
      handleChange(itemId, beneficiaryIndex, beneficiaryField, newBeneficiary, true);
    },
    
    changePercentage: (itemId: number, beneficiaryIndex: number, newPercentage: string) => {
      handleChange(itemId, beneficiaryIndex, percentageField, newPercentage, false);
    }
  };
};

// Complex beneficiary management (with percentage and currency splits)
export const createComplexBeneficiaryManager = <T extends Record<string, any>>(
  items: T[],
  updateFunction: (id: number, field: string, value: any) => void,
  beneficiaryField: string,
  percentageField: string,
  currencyField: string
) => {
  const { handleAdd, handleRemove, handleChange } = createArrayManager(items, updateFunction);
  
  return {
    addBeneficiary: (itemId: number) => {
      const item = items.find(i => i.id === itemId);
      const currentArray = item?.[beneficiaryField] || [];
      const defaultValue = currentArray.length === 0 ? '' : ''; // Always empty for beneficiaries
      handleAdd(itemId, beneficiaryField, [
        { field: percentageField, defaultValue: DEFAULT_VALUES.percentage },
        { field: currencyField, defaultValue: DEFAULT_VALUES.currency }
      ], defaultValue);
    },
    
    removeBeneficiary: (itemId: number, beneficiaryIndex: number) => {
      handleRemove(itemId, beneficiaryIndex, beneficiaryField, [percentageField, currencyField], true);
    },
    
    changeBeneficiary: (itemId: number, beneficiaryIndex: number, newBeneficiary: string) => {
      handleChange(itemId, beneficiaryIndex, beneficiaryField, newBeneficiary, true);
    },
    
    changePercentage: (itemId: number, beneficiaryIndex: number, newPercentage: string) => {
      handleChange(itemId, beneficiaryIndex, percentageField, newPercentage, false);
    },
    
    changeCurrency: (itemId: number, beneficiaryIndex: number, newCurrency: string) => {
      handleChange(itemId, beneficiaryIndex, currencyField, newCurrency, false);
    }
  };
};