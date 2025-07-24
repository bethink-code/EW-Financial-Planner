import { useState, useCallback, memo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DeleteButton, AddButton } from "@/components/ui/action-buttons";
import { getFieldClass, getFieldWidth } from "@/lib/design-tokens";
import { Assurance } from "@shared/schema";

interface BeneficiaryRowManagerAssuranceProps {
  policy: Assurance;
  onUpdate: (id: number, updates: Partial<Assurance>) => void;
}

// Format currency value with R prefix and proper formatting
const formatCurrencyValue = (value: string, fieldType: string): string => {
  if (!value?.trim()) return value;
  
  // Remove existing formatting
  const cleanValue = value.replace(/[^\d.-]/g, '');
  if (!cleanValue || isNaN(parseFloat(cleanValue))) return value;
  
  const numValue = parseFloat(cleanValue);
  
  if (fieldType.includes('percentage') || fieldType.includes('Percentage') || fieldType.includes('Split')) {
    return `${numValue}%`;
  }
  
  // Currency fields
  if (fieldType.includes('amount') || fieldType.includes('Amount') || fieldType.includes('benefit') || fieldType.includes('Benefit')) {
    return `R ${numValue.toLocaleString()}`;
  }
  
  return value;
};

export const BeneficiaryRowManagerAssurance = memo(({ policy, onUpdate }: BeneficiaryRowManagerAssuranceProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  // Parse additional beneficiaries and splits
  const additionalBeneficiaries = policy.additionalBeneficiaries || [];
  const additionalBenefitSplits = policy.additionalBenefitSplits || [];

  // Calculate amount based on death benefit and benefit splits
  const calculateAmount = useCallback((deathBenefit: string, mainSplit: string, additionalSplits: string[]): string => {
    const benefit = parseFloat(deathBenefit.replace(/[^\d.-]/g, '')) || 0;
    const mainPercentage = parseFloat(mainSplit.replace(/[^\d.-]/g, '')) || 0;
    const additionalPercentages = additionalSplits.map(split => parseFloat(split.replace(/[^\d.-]/g, '')) || 0);
    
    const totalPercentage = mainPercentage + additionalPercentages.reduce((sum, pct) => sum + pct, 0);
    const amount = (benefit * totalPercentage) / 100;
    
    return amount.toString();
  }, []);

  const handleBeneficiaryUpdate = useCallback((field: string, value: string, index?: number) => {
    setIsUpdating(true);
    let updates: Partial<Assurance> = {};

    if (field === 'beneficiary') {
      updates.beneficiary = value;
    } else if (field === 'benefitSplit') {
      updates.benefitSplit = value;
      
      // Recalculate amount
      const newAmount = calculateAmount(policy.deathBenefit, value, additionalBenefitSplits);
      updates.amount = newAmount;
    } else if (field === 'additionalBeneficiary' && index !== undefined) {
      const newBeneficiaries = [...additionalBeneficiaries];
      newBeneficiaries[index] = value;
      updates.additionalBeneficiaries = newBeneficiaries;
    } else if (field === 'additionalBenefitSplit' && index !== undefined) {
      const newSplits = [...additionalBenefitSplits];
      newSplits[index] = value;
      updates.additionalBenefitSplits = newSplits;
      
      // Recalculate amount
      const newAmount = calculateAmount(policy.deathBenefit, policy.benefitSplit, newSplits);
      updates.amount = newAmount;
    }

    onUpdate(policy.id, updates);
    setTimeout(() => setIsUpdating(false), 300);
  }, [policy, additionalBeneficiaries, additionalBenefitSplits, calculateAmount, onUpdate]);

  const handleAddBeneficiary = useCallback(() => {
    const newBeneficiaries = [...additionalBeneficiaries, ""];
    const newSplits = [...additionalBenefitSplits, "0"];
    
    onUpdate(policy.id, {
      additionalBeneficiaries: newBeneficiaries,
      additionalBenefitSplits: newSplits
    });
  }, [policy.id, additionalBeneficiaries, additionalBenefitSplits, onUpdate]);

  const handleRemoveBeneficiary = useCallback((index: number) => {
    const newBeneficiaries = additionalBeneficiaries.filter((_, i) => i !== index);
    const newSplits = additionalBenefitSplits.filter((_, i) => i !== index);
    
    // Recalculate amount
    const newAmount = calculateAmount(policy.deathBenefit, policy.benefitSplit, newSplits);
    
    onUpdate(policy.id, {
      additionalBeneficiaries: newBeneficiaries,
      additionalBenefitSplits: newSplits,
      amount: newAmount
    });
  }, [policy, additionalBeneficiaries, additionalBenefitSplits, calculateAmount, onUpdate]);

  const handleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement>, field: string, index?: number) => {
    const value = e.target.value;
    const formattedValue = formatCurrencyValue(value, field);
    
    // Update DOM directly for immediate visual feedback
    if (e.target && formattedValue !== value) {
      e.target.value = formattedValue;
    }
    
    handleBeneficiaryUpdate(field, formattedValue, index);
  }, [handleBeneficiaryUpdate]);

  return (
    <>
      {/* Main Beneficiary Row */}
      <tr className="hover:bg-neutral-50 border-b border-neutral-200">
        <td className="px-3 py-2 text-sm text-neutral-700"></td>
        <td className="px-3 py-2 text-sm text-neutral-700"></td>
        <td className="px-3 py-2 text-sm text-neutral-700"></td>
        <td className="px-3 py-2 text-sm text-neutral-700"></td>
        <td className="px-3 py-2">
          <input
            key={`beneficiary-${policy.id}`}
            type="text"
            defaultValue={policy.beneficiary}
            onBlur={(e) => handleInputBlur(e, 'beneficiary')}
            className={getFieldClass("name")} style={getFieldWidth("name")}
            disabled={isUpdating}
          />
        </td>
        <td className="px-3 py-2">
          <input
            key={`benefitSplit-${policy.id}`}
            type="text"
            defaultValue={policy.benefitSplit}
            onBlur={(e) => handleInputBlur(e, 'benefitSplit')}
            className="table-input w-20 px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isUpdating}
          />
        </td>
        <td className="px-3 py-2 text-sm text-neutral-700 text-right bg-neutral-100">
          {formatCurrencyValue(policy.amount, 'amount')}
        </td>
        <td className="px-3 py-2 text-sm text-neutral-700"></td>
        <td className="px-3 py-2 text-sm text-neutral-700"></td>
        <td className="px-3 py-2 text-sm text-neutral-700"></td>
        <td className="px-3 py-2 text-sm text-neutral-700"></td>
        <td className="px-3 py-2 text-sm text-neutral-700"></td>
        <td className="px-3 py-2 text-sm text-neutral-700"></td>
        <td className="px-3 py-2">
          <AddButton
            onClick={handleAddBeneficiary}
          />
        </td>
      </tr>

      {/* Additional Beneficiary Rows */}
      {additionalBeneficiaries.map((beneficiary, index) => (
        <tr key={`additional-${index}`} className="hover:bg-neutral-50 border-b border-neutral-200">
          <td className="px-3 py-2 text-sm text-neutral-700"></td>
          <td className="px-3 py-2 text-sm text-neutral-700"></td>
          <td className="px-3 py-2 text-sm text-neutral-700"></td>
          <td className="px-3 py-2 text-sm text-neutral-700"></td>
          <td className="px-3 py-2">
            <input
              key={`additional-beneficiary-${policy.id}-${index}`}
              type="text"
              defaultValue={beneficiary}
              onBlur={(e) => handleInputBlur(e, 'additionalBeneficiary', index)}
              className={getFieldClass("name")} style={getFieldWidth("name")}
              disabled={isUpdating}
            />
          </td>
          <td className="px-3 py-2">
            <input
              key={`additional-split-${policy.id}-${index}`}
              type="text"
              defaultValue={additionalBenefitSplits[index] || "0"}
              onBlur={(e) => handleInputBlur(e, 'additionalBenefitSplit', index)}
              className="table-input w-20 px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isUpdating}
            />
          </td>
          <td className="px-3 py-2 text-sm text-neutral-700 text-right bg-neutral-100">
            {formatCurrencyValue(
              ((parseFloat(policy.deathBenefit.replace(/[^\d.-]/g, '')) || 0) * 
               (parseFloat((additionalBenefitSplits[index] || "0").replace(/[^\d.-]/g, '')) || 0) / 100).toString(),
              'amount'
            )}
          </td>
          <td className="px-3 py-2 text-sm text-neutral-700"></td>
          <td className="px-3 py-2 text-sm text-neutral-700"></td>
          <td className="px-3 py-2 text-sm text-neutral-700"></td>
          <td className="px-3 py-2 text-sm text-neutral-700"></td>
          <td className="px-3 py-2 text-sm text-neutral-700"></td>
          <td className="px-3 py-2 text-sm text-neutral-700"></td>
          <td className="px-3 py-2">
            <DeleteButton
              onClick={() => handleRemoveBeneficiary(index)}
            />
          </td>
        </tr>
      ))}
    </>
  );
});

BeneficiaryRowManagerAssurance.displayName = "BeneficiaryRowManagerAssurance";

export default BeneficiaryRowManagerAssurance;