import React from 'react';
import { formatYearsValue, formatPercentageValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';
import { getFieldClass } from '@/lib/field-types';

interface DynamicTermSelectorProps {
  policyId: number;
  monthlyIncome: string;
  isChecked: boolean;
  termYears: string;
  increasePercentage: string;
  onCheckboxChange: (id: number, checked: boolean) => void;
  onTermChange: (id: number, termYears: string) => void;
  onIncreaseChange: (id: number, increasePercentage: string) => void;
  disabled?: boolean;
  defaultPercentage?: string;
}

/**
 * Dynamic Term Selector Component
 * 
 * Behavior:
 * - When income is entered AND checkbox is checked: User can edit term years directly
 * - When income is entered BUT checkbox is NOT checked: Term field shows percentage from settings (not editable)
 * - When no income is entered: Both checkbox and term should be disabled/inactive
 */
export function DynamicTermSelector({
  policyId,
  monthlyIncome,
  isChecked,
  termYears,
  increasePercentage,
  onCheckboxChange,
  onTermChange,
  onIncreaseChange,
  disabled = false,
  defaultPercentage = "0%"
}: DynamicTermSelectorProps) {
  
  // Check if income has been entered (not empty and not default values)
  const hasIncome = monthlyIncome && 
                   monthlyIncome !== "R 0" && 
                   monthlyIncome !== "0" && 
                   monthlyIncome.trim() !== "";
  
  // Determine if controls should be enabled
  const controlsEnabled = hasIncome && !disabled;
  
  // Determine if term field should be editable
  const termEditable = controlsEnabled && isChecked;
  
  // Get display value for term field
  const getTermDisplayValue = () => {
    if (termEditable) {
      return formatYearsValue(termYears);
    } else if (controlsEnabled) {
      // Show percentage from settings when checkbox unchecked but income exists
      return defaultPercentage;
    } else {
      // Show default years when no income
      return formatYearsValue(termYears);
    }
  };



  return (
    <>
      {/* Checkbox */}
      <td className="p-1 text-center align-top">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => onCheckboxChange(policyId, e.target.checked)}
          className="text-xs"
          disabled={!controlsEnabled}
        />
      </td>

      {/* Term Years */}
      <td className="p-1 align-top">
        <input
          key={`term-years-${policyId}-${isChecked}`}
          type="text"
          value={getTermDisplayValue()}
          className={`${getFieldClass('years')} ${getValueClass(getTermDisplayValue(), 'years')} ${
            !termEditable ? 'bg-neutral-100 cursor-not-allowed' : ''
          }`}
          onFocus={termEditable ? handleDefaultValueFocus : undefined}
          onBlur={termEditable ? (e) => {
            const value = e.target.value;
            onTermChange(policyId, value);
          } : undefined}
          disabled={!termEditable}
          readOnly={!termEditable}
        />
      </td>

      {/* Increase % */}
      <td className="p-1 align-top">
        <input
          key={`increase-percent-${policyId}`}
          type="text"
          defaultValue={formatPercentageValue(increasePercentage)}
          className={`${getFieldClass('percentage')} ${getValueClass(increasePercentage, 'percentage')} ${
            !controlsEnabled ? 'bg-neutral-100 cursor-not-allowed' : ''
          }`}
          onFocus={controlsEnabled ? handleDefaultValueFocus : undefined}
          onBlur={controlsEnabled ? (e) => {
            const value = e.target.value;
            onIncreaseChange(policyId, value);
          } : undefined}
          disabled={!controlsEnabled}
        />
      </td>
    </>
  );
}