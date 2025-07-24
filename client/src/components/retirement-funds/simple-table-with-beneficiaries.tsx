import React, { useCallback, useMemo } from "react";
import { RetirementFund, UpdateRetirementFund, Beneficiary } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit3, Plus, Trash2, UserPlus, UserMinus, Copy } from "lucide-react";
import { parseBeneficiaries } from "@/lib/beneficiaries";
import { Button } from "@/components/ui/button";
import { DuplicateButton, DeleteButton, ActionButtonGroup, AddButton } from "@/components/ui/action-buttons";
import { getFieldClass, getFieldWidth } from "@/lib/design-tokens";
import { formatPercentageValue, getValueClass, isDefaultValue, handleDefaultValueFocus } from "@/lib/formatting";
import { nanoid } from "nanoid";

interface ColumnVisibility {
  overview: boolean;
  unapprovedLifeCover: boolean;
  monthlyDeathBenefit: boolean;
  fundValue: boolean;
  fundValueBeneficiaries: boolean;
}

interface SimpleTableWithBeneficiariesProps {
  funds: RetirementFund[];
  columnVisibility: ColumnVisibility;
  tableMode: "inputs" | "flows";
  onFieldUpdate: (id: number, field: keyof UpdateRetirementFund, value: string) => void;
  onRemoveFund?: (id: number) => void;
  onDuplicateFund?: (fund: RetirementFund) => void;
  isUpdating: boolean;
}

// Format currency value
const formatCurrencyValue = (value: string, field: string) => {
  const currencyFields = [
    'coverAmount', 'monthlyIncome', 'approvedLifeCover', 'fundValue', 'fundValueAtDeath', 
    'amount', 'lumpSumTaken', 'nondeductibleContribution', 'livingAnnuity', 'escalationAmount'
  ];
  
  const percentageFields = [
    'increasePercentage', 'beneficiaryPercentageSplit', 'percentage'
  ];
  
  const yearsFields = [
    'termYears', 'incomeTerm'
  ];
  
  if (!currencyFields.includes(field) && !percentageFields.includes(field) && !yearsFields.includes(field)) return value;
  
  const numericValue = value.replace(/[^\d.-]/g, '');
  if (!numericValue || isNaN(Number(numericValue))) return value;
  
  if (currencyFields.includes(field)) {
    return `R ${Math.round(Number(numericValue)).toLocaleString()}`;
  } else if (percentageFields.includes(field)) {
    return `${Number(numericValue)}%`;
  } else if (yearsFields.includes(field)) {
    return `${Number(numericValue)} years`;
  } else {
    return Math.round(Number(numericValue)).toLocaleString();
  }
};

export function SimpleTableWithBeneficiaries({ 
  funds, 
  columnVisibility, 
  tableMode, 
  onFieldUpdate, 
  onRemoveFund,
  onDuplicateFund,
  isUpdating 
}: SimpleTableWithBeneficiariesProps) {
  
  const owners = ["Donald Edwards", "Betty Edwards"];

  // Owner management handlers
  const handleOwnerChange = useCallback((fundId: number, ownerIndex: number, newOwner: string) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const currentOwners = JSON.parse(fund.owners || '["Donald Edwards"]');
    currentOwners[ownerIndex] = newOwner;
    onFieldUpdate(fundId, 'owners', JSON.stringify(currentOwners));
  }, [funds, onFieldUpdate]);

  const handleAddOwner = useCallback((fundId: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const currentOwners = JSON.parse(fund.owners || '["Donald Edwards"]');
    const currentPercentages = JSON.parse(fund.ownershipPercentages || '["100"]');
    
    currentOwners.push("Donald Edwards");
    currentPercentages.push("0");
    
    onFieldUpdate(fundId, 'owners', JSON.stringify(currentOwners));
    onFieldUpdate(fundId, 'ownershipPercentages', JSON.stringify(currentPercentages));
  }, [funds, onFieldUpdate]);

  const handleRemoveOwner = useCallback((fundId: number, ownerIndex: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const currentOwners = JSON.parse(fund.owners || '["Donald Edwards"]');
    const currentPercentages = JSON.parse(fund.ownershipPercentages || '["100"]');
    
    if (currentOwners.length <= 1) return;
    
    currentOwners.splice(ownerIndex, 1);
    currentPercentages.splice(ownerIndex, 1);
    
    onFieldUpdate(fundId, 'owners', JSON.stringify(currentOwners));
    onFieldUpdate(fundId, 'ownershipPercentages', JSON.stringify(currentPercentages));
  }, [funds, onFieldUpdate]);

  const handlePercentageChange = useCallback((fundId: number, ownerIndex: number, percentage: string) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const currentPercentages = JSON.parse(fund.ownershipPercentages || '["100"]');
    currentPercentages[ownerIndex] = percentage;
    onFieldUpdate(fundId, 'ownershipPercentages', JSON.stringify(currentPercentages));
  }, [funds, onFieldUpdate]);

  // Beneficiary management handlers
  const handleBeneficiaryUpdate = useCallback((fundId: number, beneficiaryIndex: number, field: string, value: any) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const beneficiaries = parseBeneficiaries(fund.beneficiaries);
    const updatedBeneficiaries = [...beneficiaries];
    
    if (updatedBeneficiaries[beneficiaryIndex]) {
      if (field === 'percentage') {
        updatedBeneficiaries[beneficiaryIndex] = {
          ...updatedBeneficiaries[beneficiaryIndex],
          [field]: Math.max(0, Math.min(100, Number(value) || 0))
        };
      } else {
        updatedBeneficiaries[beneficiaryIndex] = {
          ...updatedBeneficiaries[beneficiaryIndex],
          [field]: value
        };
      }
      
      if (field === 'percentage') {
        const coverAmount = parseFloat(fund.coverAmount.replace(/[^\d.-]/g, '')) || 0;
        updatedBeneficiaries[beneficiaryIndex].coverSplit = 
          `R ${Math.round((coverAmount * updatedBeneficiaries[beneficiaryIndex].percentage / 100)).toLocaleString()}`;
      }
      onFieldUpdate(fundId, 'beneficiaries', JSON.stringify(updatedBeneficiaries));
    }
  }, [funds, onFieldUpdate]);

  const handleAddBeneficiary = useCallback((fundId: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const beneficiaries = parseBeneficiaries(fund.beneficiaries);
    const newBeneficiary: Beneficiary = {
      id: nanoid(),
      name: "",
      percentage: 0,
      coverSplit: "R 0"
    };
    
    onFieldUpdate(fundId, 'beneficiaries', JSON.stringify([...beneficiaries, newBeneficiary]));
  }, [funds, onFieldUpdate]);

  const handleRemoveBeneficiary = useCallback((fundId: number, beneficiaryIndex: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const beneficiaries = parseBeneficiaries(fund.beneficiaries);
    if (beneficiaries.length <= 1) return;
    
    const updatedBeneficiaries = beneficiaries.filter((_, index) => index !== beneficiaryIndex);
    onFieldUpdate(fundId, 'beneficiaries', JSON.stringify(updatedBeneficiaries));
  }, [funds, onFieldUpdate]);

  const handleInputBlur = useCallback((fundId: number, field: keyof UpdateRetirementFund, value: string, element?: HTMLInputElement) => {
    const formattedValue = formatCurrencyValue(value, field);
    if (element && formattedValue !== value) {
      element.value = formattedValue;
    }
    onFieldUpdate(fundId, field, formattedValue);
  }, [onFieldUpdate]);

  const renderFundRows = useMemo(() => {
    const fundsWithRows = funds.map((fund) => {
      const beneficiaries = parseBeneficiaries(fund.beneficiaries);
      const fundOwners = JSON.parse(fund.owners || '["John Doe"]');
      const ownershipPercentages = JSON.parse(fund.ownershipPercentages || '["100"]');
      
      // Calculate max rows needed - like assurance pattern
      const maxRows = Math.max(fundOwners.length, beneficiaries.length || 1);
      
      // Create rows for each owner/beneficiary combination
      return Array.from({ length: maxRows }, (_, rowIndex) => {
        const currentOwner = fundOwners[rowIndex];
        const currentBeneficiary = beneficiaries[rowIndex];
        const currentOwnershipPercentage = ownershipPercentages[rowIndex];
        
        return (
          <tr key={`${fund.id}-row-${rowIndex}`} >
            {/* Actions Column - rowSpan for main fund data */}
            {rowIndex === 0 && (
              <td rowSpan={maxRows} className="table-actions-cell text-center">
                <ActionButtonGroup className="justify-center">
                  <DuplicateButton
                    onClick={() => onDuplicateFund?.(fund)}
                    disabled={isUpdating}
                  />
                  <DeleteButton
                    onClick={() => onRemoveFund?.(fund.id)}
                    disabled={isUpdating}
                  />
                </ActionButtonGroup>
              </td>
            )}
            
            {/* Overview Section */}
            {columnVisibility.overview && (
              <>
                {/* Fund Description - rowSpan for main fund data */}
                {rowIndex === 0 && (
                  <td rowSpan={maxRows} className="px-3 py-2 border-r border-neutral-200 align-top">
                    <input
                      defaultValue={fund.description || "Enter here ..."} 
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => onFieldUpdate(fund.id, "description", e.target.value)}
                      className={`${getFieldClass('text')} table-input`}
                      placeholder="Fund description"
                      disabled={isUpdating}
                    />
                  </td>
                )}
                
                {/* Owner Column - inline pattern like assurance */}
                <td className="px-3 py-2 border-r border-neutral-200">
                  {currentOwner ? (
                    <div className="flex items-center gap-1">
                      {rowIndex > 0 && (
                        <span className="text-blue-500 mr-1">↳</span>
                      )}
                      {rowIndex === 0 && (
                        <AddButton
                          onClick={() => handleAddOwner(fund.id)}
                          disabled={isUpdating}
                          size="sm"
                        />
                      )}
                      <Select
                        value={currentOwner}
                        onValueChange={(value) => handleOwnerChange(fund.id, rowIndex, value)}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className={`${getFieldClass('text')} table-input`}>
                          <SelectValue className="text-right truncate" />
                          <Edit3 size={12} className="ml-1 text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                        </SelectTrigger>
                        <SelectContent>
                          {owners.map((ownerOption) => (
                            <SelectItem key={ownerOption} value={ownerOption}>
                              {ownerOption}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {rowIndex > 0 && (
                        <DeleteButton
                          onClick={() => handleRemoveOwner(fund.id, rowIndex)}
                          disabled={isUpdating}
                          size="sm"
                        />
                      )}
                    </div>
                  ) : (
                    <span className="text-neutral-400">-</span>
                  )}
                </td>
                
                {/* Owner Percentage */}
                <td className="px-3 py-2 border-r border-neutral-200">
                  {currentOwner ? (
                    <input
                      type="text"
                      defaultValue={`${currentOwnershipPercentage || '0'}%`}
                      onBlur={(e) => {
                        const formattedValue = formatCurrencyValue(e.target.value, "percentage");
                        if (formattedValue !== e.target.value) {
                          e.target.value = formattedValue;
                        }
                        handlePercentageChange(fund.id, rowIndex, e.target.value.replace('%', ''));
                      }}
                      className={`${getFieldClass('percentage')} table-input text-right`}
                      disabled={isUpdating}
                    />
                  ) : (
                    <span className="text-neutral-400">-</span>
                  )}
                </td>
              </>
            )}
            
            {/* Monthly Death Benefit Section - rowSpant for main fund data */}
            {columnVisibility.monthlyDeathBenefit && rowIndex === 0 && (
              <>
                <td className="px-3 py-2 border-l border-neutral-200 border-r border-neutral-200" rowSpan={maxRows}>
                  <input
                    defaultValue={fund.monthlyIncome || "Enter here ..."} 
                    onFocus={handleDefaultValueFocus}
                    onBlur={(e) => {
                      const formattedValue = formatCurrencyValue(e.target.value, "monthlyIncome");
                      if (formattedValue !== e.target.value) {
                        e.target.value = formattedValue;
                      }
                      handleInputBlur(fund.id, "monthlyIncome", e.target.value, e.target);
                    }}
                    className={`${getFieldClass('currency')} table-input text-right`}
                    placeholder="R 0"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2 border-r border-neutral-200" rowSpan={maxRows}>
                  <input
                    defaultValue={fund.increasePercentage || "0%"}
                    onFocus={handleDefaultValueFocus}
                    onBlur={(e) => {
                      const formattedValue = formatPercentageValue(e.target.value);
                      if (formattedValue !== e.target.value) {
                        e.target.value = formattedValue;
                      }
                      handleInputBlur(fund.id, "increasePercentage", e.target.value, e.target);
                    }}
                    className={`${getFieldClass('percentage')} ${getValueClass(fund.increasePercentage || "0%", 'percentage')} table-input text-right`}
                    placeholder="0%"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2 border-r border-neutral-200" rowSpan={maxRows}>
                  <input
                    key={`termYears-${fund.id}-${fund.termYears}`}
                    defaultValue={fund.termYears.includes('years') ? fund.termYears : `${fund.termYears} years`}
                    onBlur={(e) => {
                      const formattedValue = formatCurrencyValue(e.target.value, "termYears");
                      if (formattedValue !== e.target.value) {
                        e.target.value = formattedValue;
                      }
                      handleInputBlur(fund.id, "termYears", e.target.value, e.target);
                    }}
                    className={`${getFieldClass('years')} table-input text-right`}
                    placeholder="0 years"
                    disabled={isUpdating}
                  />
                </td>
              </>
            )}
            
            {/* Fund Value Section - rowSpan for main fund data */}
            {columnVisibility.fundValue && rowIndex === 0 && (
              <>
                <td className="px-3 py-2 border-l border-neutral-200 border-r border-neutral-200" rowSpan={maxRows}>
                  <input
                    defaultValue={fund.fundValue || "Enter here ..."} 
                    onFocus={handleDefaultValueFocus}
                    onBlur={(e) => {
                      const formattedValue = formatCurrencyValue(e.target.value, "fundValue");
                      if (formattedValue !== e.target.value) {
                        e.target.value = formattedValue;
                      }
                      handleInputBlur(fund.id, "fundValue", e.target.value, e.target);
                    }}
                    className={`${getFieldClass('currency')} table-input text-right`}
                    placeholder="R 0"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2 border-r border-neutral-200" rowSpan={maxRows}>
                  <input
                    defaultValue={fund.fundValue || "Enter here ..."} 
                    onFocus={handleDefaultValueFocus}
                    onBlur={(e) => {
                      const formattedValue = formatCurrencyValue(e.target.value, "fundValue");
                      if (formattedValue !== e.target.value) {
                        e.target.value = formattedValue;
                      }
                      handleInputBlur(fund.id, "fundValue", e.target.value, e.target);
                    }}
                    className={`${getFieldClass('currency')} table-input text-right`}
                    placeholder="R 0"
                    disabled={isUpdating}
                  />
                </td>
              </>
            )}
            
            {/* Fund Value Beneficiaries Section - inline pattern like assurance */}
            {columnVisibility.fundValueBeneficiaries && (
              <>
                <td className="px-3 py-2 border-l border-neutral-200 border-r border-neutral-200">
                  {currentBeneficiary ? (
                    <div className="flex items-center gap-1">
                      {rowIndex > 0 && (
                        <span className="text-green-500 mr-1">↳</span>
                      )}
                      {rowIndex === 0 && (
                        <AddButton
                          onClick={() => handleAddBeneficiary(fund.id)}
                          disabled={isUpdating}
                          size="sm"
                        />
                      )}
                      <input
                        defaultValue={currentBeneficiary.name || "Enter here ..."} 
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => handleBeneficiaryUpdate(fund.id, rowIndex, 'name', e.target.value)}
                        className={`${getFieldClass('text')} table-input`}
                        placeholder="Beneficiary name"
                        disabled={isUpdating}
                      />
                      {rowIndex > 0 && (
                        <DeleteButton
                          onClick={() => handleRemoveBeneficiary(fund.id, rowIndex)}
                          disabled={isUpdating}
                          size="sm"
                        />
                      )}
                    </div>
                  ) : (
                    <span className="text-neutral-400">-</span>
                  )}
                </td>
                <td className="px-3 py-2 border-r border-neutral-200">
                  {currentBeneficiary ? (
                    <input
                      defaultValue={`${currentBeneficiary.percentage || 0}%`}
                      onBlur={(e) => {
                        const formattedValue = formatCurrencyValue(e.target.value, "percentage");
                        if (formattedValue !== e.target.value) {
                          e.target.value = formattedValue;
                        }
                        handleBeneficiaryUpdate(fund.id, rowIndex, 'percentage', parseFloat(e.target.value.replace('%', '')) || 0);
                      }}
                      className={`${getFieldClass('percentage')} table-input text-right`}
                      disabled={isUpdating}
                    />
                  ) : (
                    <span className="text-neutral-400">-</span>
                  )}
                </td>
                <td className="px-3 py-2 border-r border-neutral-200">
                  <span className="table-text-14 text-neutral-900">R 0</span>
                </td>
                <td className="px-3 py-2 border-r border-neutral-200">
                  <span className="table-text-14 text-neutral-900">R 0</span>
                </td>
                <td className="px-3 py-2 border-r border-neutral-200">
                  <span className="table-text-14 text-neutral-900">R 0</span>
                </td>
                <td className="px-3 py-2 border-r border-neutral-200">
                  <span className="table-text-14 text-neutral-900">R 0</span>
                </td>
                <td className="px-3 py-2 border-r border-neutral-200">
                  <span className="table-text-14 text-neutral-900">0 years</span>
                </td>
              </>
            )}
            
            {/* Unapproved Life Cover Section - rowSpan for main fund data */}
            {columnVisibility.unapprovedLifeCover && rowIndex === 0 && (
              <>
                <td className="px-3 py-2 border-l border-neutral-200 border-r border-neutral-200" rowSpan={maxRows}>
                  <input
                    defaultValue={fund.coverAmount || "Enter here ..."} 
                    onFocus={handleDefaultValueFocus}
                    onBlur={(e) => {
                      const formattedValue = formatCurrencyValue(e.target.value, "coverAmount");
                      if (formattedValue !== e.target.value) {
                        e.target.value = formattedValue;
                      }
                      handleInputBlur(fund.id, "coverAmount", e.target.value, e.target);
                    }}
                    className={`${getFieldClass('currency')} table-input text-right`}
                    placeholder="R 0"
                    disabled={isUpdating}
                  />
                </td>
              </>
            )}
          </tr>
        );
      });
    });

    return fundsWithRows.flat();
  }, [funds, columnVisibility, isUpdating, owners, handleOwnerChange, handleAddOwner, handleRemoveOwner, handlePercentageChange, handleBeneficiaryUpdate, handleAddBeneficiary, handleRemoveBeneficiary, onFieldUpdate, formatCurrencyValue, handleInputBlur]);

  if (funds.length === 0) {
    return (
      <div className="text-center py-4 text-neutral-500">
        No retirement funds to display
      </div>
    );
  }

  return (
    <table className="min-w-full border-collapse">
        <thead className="bg-neutral-50">
          <tr>
            <th className="px-3 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Actions</th>
            {columnVisibility.overview && (
              <>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Fund Description
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  %
                </th>
              </>
            )}
            {columnVisibility.monthlyDeathBenefit && (
              <>
                <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider border-l border-neutral-200">
                  Monthly Income
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Increase %
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Term (Years)
                </th>
              </>
            )}
            {columnVisibility.fundValue && (
              <>
                <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider border-l border-neutral-200">
                  Fund Value
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Fund Value at Death
                </th>
              </>
            )}
            {columnVisibility.fundValueBeneficiaries && (
              <>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider border-l border-neutral-200">
                  Beneficiary Name
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  %
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Lump Sum Taken
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Non-deductible Contribution
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Living Annuity
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Income Term
                </th>
              </>
            )}
            {columnVisibility.unapprovedLifeCover && (
              <>
                <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider border-l border-neutral-200">
                  Cover Amount
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {renderFundRows}
        </tbody>
      </table>
  );
}
