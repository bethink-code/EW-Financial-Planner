import React, { useCallback, useMemo } from 'react';
import { RetirementFund } from '@shared/schema';
import { Plus, UserPlus, UserMinus, Trash2, Copy } from 'lucide-react';
import { formatCurrencyValue, formatPercentageValue, formatTextValue, formatYearsValue, getValueClass, isDefaultValue, handleDefaultValueFocus, createEnhancedBlurHandler } from "@/lib/formatting";
import { getFieldClass } from "@/lib/field-types";
import { ActionButtonGroup, DuplicateButton, DeleteButton, AddButton } from "@/components/ui/action-buttons";

interface NewRetirementTableProps {
  funds: RetirementFund[];
  onFieldUpdate: (fundId: number, field: string, value: any) => void;
  onRemoveFund: (id: number) => void;
  onDuplicateFund: (fund: RetirementFund) => void;
  isUpdating?: boolean;
}

export function NewRetirementTable({ 
  funds, 
  onFieldUpdate, 
  onRemoveFund, 
  onDuplicateFund, 
  isUpdating 
}: NewRetirementTableProps) {

  // Helper function to calculate cover splits
  const calculateCoverSplit = useCallback((coverAmount: string, percentage: string) => {
    const amount = parseFloat(coverAmount.replace(/[^\d.]/g, '')) || 0;
    const percent = parseFloat(percentage.replace('%', '')) || 0;
    const result = (amount * percent) / 100;
    return `R ${result.toLocaleString()}`;
  }, []);

  // Helper function to calculate fund value at death (example: fund value * 1.1)
  const calculateFundValueAtDeath = useCallback((fundValue: string) => {
    const amount = parseFloat(fundValue.replace(/[^\d.]/g, '')) || 0;
    const result = amount * 1.1; // Example calculation
    return `R ${result.toLocaleString()}`;
  }, []);

  // Helper function to calculate living annuity (example: fund value * 0.05)
  const calculateLivingAnnuity = useCallback((fundValue: string) => {
    const amount = parseFloat(fundValue.replace(/[^\d.]/g, '')) || 0;
    const result = amount * 0.05; // Example calculation
    return `R ${result.toLocaleString()}`;
  }, []);

  const handleCellUpdate = useCallback((fundId: number, field: string, value: any) => {
    onFieldUpdate(fundId, field, value);
  }, [onFieldUpdate]);

  // Owner management
  const handleAddOwner = useCallback((fundId: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    const updatedOwners = [...fund.owners, "Donald Edwards"];
    onFieldUpdate(fundId, 'owners', updatedOwners);
  }, [funds, onFieldUpdate]);

  const handleRemoveOwner = useCallback((fundId: number, ownerIndex: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund || fund.owners.length <= 1 || ownerIndex === 0) return; // Protect first owner
    
    // Create copy and remove using splice for consistent array handling
    const newOwners = [...fund.owners];
    newOwners.splice(ownerIndex, 1);
    onFieldUpdate(fundId, 'owners', newOwners);
  }, [funds, onFieldUpdate]);

  const handleOwnerChange = useCallback((fundId: number, ownerIndex: number, newOwner: string) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    const updatedOwners = [...fund.owners];
    updatedOwners[ownerIndex] = newOwner;
    onFieldUpdate(fundId, 'owners', updatedOwners);
  }, [funds, onFieldUpdate]);

  // Unapproved beneficiary management
  const handleAddUnapprovedBeneficiary = useCallback((fundId: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    const updatedBeneficiaries = [...fund.unapprovedBeneficiaries, "Enter details ..."];
    const updatedSplits = [...fund.unapprovedPercentageSplits, "0%"];
    const updatedCoverSplits = [...fund.unapprovedCoverSplits, "R 0"];
    onFieldUpdate(fundId, 'unapprovedBeneficiaries', updatedBeneficiaries);
    onFieldUpdate(fundId, 'unapprovedPercentageSplits', updatedSplits);
    onFieldUpdate(fundId, 'unapprovedCoverSplits', updatedCoverSplits);
  }, [funds, onFieldUpdate]);

  const handleRemoveUnapprovedBeneficiary = useCallback((fundId: number, beneficiaryIndex: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund || fund.unapprovedBeneficiaries.length <= 1 || beneficiaryIndex === 0) return; // Protect first beneficiary
    
    // Create copies and remove from all arrays simultaneously
    const newBeneficiaries = [...fund.unapprovedBeneficiaries];
    const newSplits = [...fund.unapprovedPercentageSplits];
    const newCoverSplits = [...fund.unapprovedCoverSplits];
    
    // Remove at the same index from all arrays
    newBeneficiaries.splice(beneficiaryIndex, 1);
    newSplits.splice(beneficiaryIndex, 1);
    newCoverSplits.splice(beneficiaryIndex, 1);
    
    // Update all arrays in sequence
    onFieldUpdate(fundId, 'unapprovedBeneficiaries', newBeneficiaries);
    onFieldUpdate(fundId, 'unapprovedPercentageSplits', newSplits);
    onFieldUpdate(fundId, 'unapprovedCoverSplits', newCoverSplits);
  }, [funds, onFieldUpdate]);

  // Fund value beneficiary management
  const handleAddFundValueBeneficiary = useCallback((fundId: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    const updatedBeneficiaries = [...fund.fundValueBeneficiaries, "Enter details ..."];
    const updatedSplits = [...fund.fundValuePercentageSplits, "0%"];
    const updatedCoverSplits = [...fund.fundValueCoverSplits, "R 0"];
    onFieldUpdate(fundId, 'fundValueBeneficiaries', updatedBeneficiaries);
    onFieldUpdate(fundId, 'fundValuePercentageSplits', updatedSplits);
    onFieldUpdate(fundId, 'fundValueCoverSplits', updatedCoverSplits);
  }, [funds, onFieldUpdate]);

  const handleRemoveFundValueBeneficiary = useCallback((fundId: number, beneficiaryIndex: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund || fund.fundValueBeneficiaries.length <= 1 || beneficiaryIndex === 0) return; // Protect first beneficiary
    
    // Create copies and remove from all arrays simultaneously
    const newBeneficiaries = [...fund.fundValueBeneficiaries];
    const newSplits = [...fund.fundValuePercentageSplits];
    const newCoverSplits = [...fund.fundValueCoverSplits];
    
    // Remove at the same index from all arrays
    newBeneficiaries.splice(beneficiaryIndex, 1);
    newSplits.splice(beneficiaryIndex, 1);
    newCoverSplits.splice(beneficiaryIndex, 1);
    
    // Update all arrays in sequence
    onFieldUpdate(fundId, 'fundValueBeneficiaries', newBeneficiaries);
    onFieldUpdate(fundId, 'fundValuePercentageSplits', newSplits);
    onFieldUpdate(fundId, 'fundValueCoverSplits', newCoverSplits);
  }, [funds, onFieldUpdate]);

  // Calculate totals for summary display
  const totals = useMemo(() => {
    if (!funds || funds.length === 0) return {
      coverAmount: 0,
      monthlyIncome: 0,
      approvedLifeCover: 0,
      fundValue: 0,
      fundValueAtDeath: 0
    };

    return funds.reduce((acc, fund) => {
      const parseCurrency = (value: string) => parseFloat(value.replace(/[^\d.]/g, '')) || 0;
      
      return {
        coverAmount: acc.coverAmount + parseCurrency(fund.coverAmount),
        monthlyIncome: acc.monthlyIncome + parseCurrency(fund.monthlyIncome),
        approvedLifeCover: acc.approvedLifeCover + parseCurrency(fund.approvedLifeCover),
        fundValue: acc.fundValue + parseCurrency(fund.fundValue),
        fundValueAtDeath: acc.fundValueAtDeath + parseCurrency(fund.fundValueAtDeath)
      };
    }, {
      coverAmount: 0,
      monthlyIncome: 0,
      approvedLifeCover: 0,
      fundValue: 0,
      fundValueAtDeath: 0
    });
  }, [funds]);

  const formatTotal = useCallback((amount: number) => `R ${amount.toLocaleString()}`, []);

  if (!funds || funds.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No retirement funds found. Click "Add Fund" to create your first fund.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <table>
        <thead>
          {/* Main section headers */}
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" rowSpan={2}>Actions</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={2}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={4}>Unapproved Life Cover</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={4}>Monthly Death Benefit</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={3}>Approved Life Cover</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" colSpan={7}>Fund Value Beneficiaries</th>
          </tr>
          
          {/* Individual column headers */}
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Description</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Owners</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Cover Amount</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Beneficiaries</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Percentage Split</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Cover Split</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Monthly Income</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Checkbox</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Term Years</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Increase %</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Cover</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Fund Value</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Fund Value at Death</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Beneficiary Name</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Percentage</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Amount</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Lump Sum Taken</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Non-deductible Contribution</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Living Annuity</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-end">Income Term</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {funds.map((fund, fundIndex) => {
            const maxRows = Math.max(
              fund.owners.length,
              fund.unapprovedBeneficiaries.length,
              fund.fundValueBeneficiaries.length
            );

            return Array.from({ length: maxRows }, (_, rowIndex) => (
              <tr key={`${fund.id}-${rowIndex}-${fund.owners.length}-${fund.unapprovedBeneficiaries.length}-${fund.fundValueBeneficiaries.length}`} className="hover:bg-neutral-50">
                {/* Actions */}
                <td className="table-actions-cell p-1 text-center section-start section-end">
                  {rowIndex === 0 && (
                    <ActionButtonGroup>
                      <DuplicateButton 
                        onClick={() => onDuplicateFund(fund)} 
                        disabled={isUpdating}
                      />
                      <DeleteButton 
                        onClick={() => onRemoveFund(fund.id)} 
                        disabled={isUpdating}
                      />
                    </ActionButtonGroup>
                  )}
                </td>

                {/* Overview - Description */}
                <td className="p-1 section-start">
                  {rowIndex === 0 && (
                    <input
                      type="text"
                      defaultValue={formatTextValue(fund.description)}
                      className={`table-input ${getFieldClass('text')} ${getValueClass(fund.description, 'text')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => {
                        const value = e.target.value;
                        handleCellUpdate(fund.id, 'description', value);
                      }}
                    />
                  )}
                </td>

                {/* Overview - Owner */}
                <td className="p-1">
                  {rowIndex < fund.owners.length && (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        defaultValue={fund.owners[rowIndex]}
                        className={`table-input ${getFieldClass('text')} flex-1`}
                        onBlur={(e) => handleOwnerChange(fund.id, rowIndex, e.target.value)}
                      />
                      {rowIndex === 0 ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddOwner(fund.id);
                          }}
                          className="h-6 w-6 rounded text-blue-600 hover:bg-blue-50 flex items-center justify-center"
                          title="Add Owner"
                          disabled={isUpdating}
                        >
                          <UserPlus className="h-3 w-3" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveOwner(fund.id, rowIndex);
                          }}
                          className="h-6 w-6 rounded text-red-600 hover:bg-red-50 flex items-center justify-center"
                          title="Remove Owner"
                          disabled={isUpdating}
                        >
                          <UserMinus className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                </td>

                {/* Unapproved Life Cover - Cover Amount */}
                <td className="p-1 section-start">
                  {rowIndex === 0 && (
                    <input
                      type="text"
                      defaultValue={formatCurrencyValue(fund.coverAmount)}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.coverAmount, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => {
                        const value = e.target.value;
                        handleCellUpdate(fund.id, 'coverAmount', value);
                      }}
                    />
                  )}
                </td>

                {/* Unapproved Life Cover - Beneficiary */}
                <td className="p-1">
                  {rowIndex < fund.unapprovedBeneficiaries.length && (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        defaultValue={fund.unapprovedBeneficiaries[rowIndex]}
                        className={`table-input ${getFieldClass('text')} flex-1`}
                        onBlur={(e) => {
                          const updatedBeneficiaries = [...fund.unapprovedBeneficiaries];
                          updatedBeneficiaries[rowIndex] = e.target.value;
                          onFieldUpdate(fund.id, 'unapprovedBeneficiaries', updatedBeneficiaries);
                        }}
                      />
                      {rowIndex === 0 ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddUnapprovedBeneficiary(fund.id);
                          }}
                          className="h-6 w-6 rounded text-blue-600 hover:bg-blue-50 flex items-center justify-center"
                          title="Add Beneficiary"
                          disabled={isUpdating}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveUnapprovedBeneficiary(fund.id, rowIndex);
                          }}
                          className="h-6 w-6 rounded text-red-600 hover:bg-red-50 flex items-center justify-center"
                          title="Remove Beneficiary"
                          disabled={isUpdating}
                        >
                          <UserMinus className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                </td>

                {/* Unapproved Life Cover - Percentage Split */}
                <td className="p-1">
                  {rowIndex < fund.unapprovedPercentageSplits.length && (
                    <input
                      type="text"
                      defaultValue={formatPercentageValue(fund.unapprovedPercentageSplits[rowIndex])}
                      className={`table-input ${getFieldClass('percentage')} ${getValueClass(fund.unapprovedPercentageSplits[rowIndex], 'percentage')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => {
                        const updatedSplits = [...fund.unapprovedPercentageSplits];
                        updatedSplits[rowIndex] = e.target.value;
                        onFieldUpdate(fund.id, 'unapprovedPercentageSplits', updatedSplits);
                        // Update calculated cover split
                        const updatedCoverSplits = [...fund.unapprovedCoverSplits];
                        updatedCoverSplits[rowIndex] = calculateCoverSplit(fund.coverAmount, e.target.value);
                        onFieldUpdate(fund.id, 'unapprovedCoverSplits', updatedCoverSplits);
                      }}
                    />
                  )}
                </td>

                {/* Unapproved Life Cover - Cover Split (Calculated) */}
                <td className="p-1 bg-neutral-100">
                  {rowIndex < fund.unapprovedCoverSplits.length && (
                    <span className="text-xs text-neutral-600">
                      {fund.unapprovedCoverSplits[rowIndex]}
                    </span>
                  )}
                </td>

                {/* Monthly Death Benefit - Monthly Income */}
                <td className="p-1 section-start">
                  {rowIndex === 0 && (
                    <input
                      type="text"
                      defaultValue={formatCurrencyValue(fund.monthlyIncome)}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.monthlyIncome, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => {
                        const value = e.target.value;
                        handleCellUpdate(fund.id, 'monthlyIncome', value);
                      }}
                    />
                  )}
                </td>

                {/* Monthly Death Benefit - Checkbox */}
                <td className="p-1 text-center">
                  {rowIndex === 0 && (
                    <input
                      type="checkbox"
                      checked={fund.monthlyIncomeCheckbox}
                      onChange={(e) => handleCellUpdate(fund.id, 'monthlyIncomeCheckbox', e.target.checked)}
                      className="text-xs"
                    />
                  )}
                </td>

                {/* Monthly Death Benefit - Term Years */}
                <td className="p-1">
                  {rowIndex === 0 && (
                    <input
                      type="text"
                      defaultValue={formatYearsValue(fund.termYears)}
                      className={`table-input ${getFieldClass('years')} ${getValueClass(fund.termYears, 'years')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => {
                        const value = e.target.value;
                        handleCellUpdate(fund.id, 'termYears', value);
                      }}
                    />
                  )}
                </td>

                {/* Monthly Death Benefit - Increase % */}
                <td className="p-1">
                  {rowIndex === 0 && (
                    <input
                      type="text"
                      defaultValue={formatPercentageValue(fund.increasePercentage)}
                      className={`table-input ${getFieldClass('percentage')} ${getValueClass(fund.increasePercentage, 'percentage')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => {
                        const value = e.target.value;
                        handleCellUpdate(fund.id, 'increasePercentage', value);
                      }}
                    />
                  )}
                </td>

                {/* Approved Life Cover - Cover */}
                <td className="p-1 section-start">
                  {rowIndex === 0 && (
                    <input
                      type="text"
                      defaultValue={formatCurrencyValue(fund.approvedLifeCover)}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.approvedLifeCover, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => {
                        const value = e.target.value;
                        handleCellUpdate(fund.id, 'approvedLifeCover', value);
                      }}
                    />
                  )}
                </td>

                {/* Approved Life Cover - Fund Value */}
                <td className="p-1">
                  {rowIndex === 0 && (
                    <input
                      type="text"
                      defaultValue={formatCurrencyValue(fund.fundValue)}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.fundValue, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => {
                        const value = e.target.value;
                        handleCellUpdate(fund.id, 'fundValue', value);
                        // Update calculated fund value at death
                        const calculatedValue = calculateFundValueAtDeath(value);
                        handleCellUpdate(fund.id, 'fundValueAtDeath', calculatedValue);
                      }}
                    />
                  )}
                </td>

                {/* Approved Life Cover - Fund Value at Death (Calculated) */}
                <td className="p-1 bg-neutral-100">
                  {rowIndex === 0 && (
                    <span className="text-xs text-neutral-600">
                      {fund.fundValueAtDeath}
                    </span>
                  )}
                </td>

                {/* Fund Value Beneficiaries - Beneficiary */}
                <td className="p-1 section-start">
                  {rowIndex < fund.fundValueBeneficiaries.length && (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        defaultValue={fund.fundValueBeneficiaries[rowIndex]}
                        className={`table-input ${getFieldClass('text')} flex-1`}
                        onBlur={(e) => {
                          const updatedBeneficiaries = [...fund.fundValueBeneficiaries];
                          updatedBeneficiaries[rowIndex] = e.target.value;
                          onFieldUpdate(fund.id, 'fundValueBeneficiaries', updatedBeneficiaries);
                        }}
                      />
                      {rowIndex === 0 ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddFundValueBeneficiary(fund.id);
                          }}
                          className="h-6 w-6 rounded text-blue-600 hover:bg-blue-50 flex items-center justify-center"
                          title="Add Beneficiary"
                          disabled={isUpdating}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveFundValueBeneficiary(fund.id, rowIndex);
                          }}
                          className="h-6 w-6 rounded text-red-600 hover:bg-red-50 flex items-center justify-center"
                          title="Remove Beneficiary"
                          disabled={isUpdating}
                        >
                          <UserMinus className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                </td>

                {/* Fund Value Beneficiaries - Cover % Split */}
                <td className="p-1">
                  {rowIndex < fund.fundValuePercentageSplits.length && (
                    <input
                      type="text"
                      defaultValue={formatPercentageValue(fund.fundValuePercentageSplits[rowIndex])}
                      className={`table-input ${getFieldClass('percentage')} ${getValueClass(fund.fundValuePercentageSplits[rowIndex], 'percentage')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => {
                        const updatedSplits = [...fund.fundValuePercentageSplits];
                        updatedSplits[rowIndex] = e.target.value;
                        onFieldUpdate(fund.id, 'fundValuePercentageSplits', updatedSplits);
                        // Update calculated cover split
                        const updatedCoverSplits = [...fund.fundValueCoverSplits];
                        updatedCoverSplits[rowIndex] = calculateCoverSplit(fund.fundValue, e.target.value);
                        onFieldUpdate(fund.id, 'fundValueCoverSplits', updatedCoverSplits);
                      }}
                    />
                  )}
                </td>

                {/* Fund Value Beneficiaries - Cover (Calculated) */}
                <td className="p-1 bg-neutral-100">
                  {rowIndex < fund.fundValueCoverSplits.length && (
                    <span className="text-xs text-neutral-600">
                      {fund.fundValueCoverSplits[rowIndex]}
                    </span>
                  )}
                </td>

                {/* Fund Value Beneficiaries - Lump Assessed */}
                <td className="p-1">
                  {rowIndex === 0 && (
                    <input
                      type="text"
                      defaultValue={formatCurrencyValue(fund.lumpSumTaken)}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.lumpSumTaken, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => {
                        const value = e.target.value;
                        handleCellUpdate(fund.id, 'lumpSumTaken', value);
                      }}
                    />
                  )}
                </td>

                {/* Fund Value Beneficiaries - Non Deductible */}
                <td className="p-1">
                  {rowIndex === 0 && (
                    <input
                      type="text"
                      defaultValue={formatCurrencyValue(fund.nonDeductibleContribution)}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.nonDeductibleContribution, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => {
                        const value = e.target.value;
                        handleCellUpdate(fund.id, 'nonDeductibleContribution', value);
                      }}
                    />
                  )}
                </td>

                {/* Fund Value Beneficiaries - Living Annuity (Calculated) */}
                <td className="p-1 bg-neutral-100">
                  {rowIndex === 0 && (
                    <span className="text-xs text-neutral-600">
                      {fund.livingAnnuity}
                    </span>
                  )}
                </td>

                {/* Fund Value Beneficiaries - Checkbox */}
                <td className="p-1 text-center">
                  {rowIndex === 0 && (
                    <input
                      type="checkbox"
                      checked={fund.livingAnnuityCheckbox}
                      onChange={(e) => handleCellUpdate(fund.id, 'livingAnnuityCheckbox', e.target.checked)}
                      className="text-xs"
                    />
                  )}
                </td>

                {/* Fund Value Beneficiaries - Income Term */}
                <td className="p-1 section-end">
                  {rowIndex === 0 && (
                    <input
                      type="text"
                      defaultValue={formatYearsValue(fund.incomeTerm)}
                      className={`table-input ${getFieldClass('years')} ${getValueClass(fund.incomeTerm, 'years')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => {
                        const value = e.target.value;
                        handleCellUpdate(fund.id, 'incomeTerm', value);
                      }}
                    />
                  )}
                </td>
              </tr>
            ));
          })}
          
          {/* Totals Row */}
          <tr className="border-t-2 border-border font-bold">
            <td className="p-2 text-center font-bold text-sm section-start section-end">Totals</td>
            <td className="p-2 section-start"></td>
            <td className="p-2"></td>
            <td className="p-2 font-bold text-sm section-start">
              {formatTotal(totals.coverAmount)}
            </td>
            <td className="p-2"></td>
            <td className="p-2"></td>
            <td className="p-2"></td>
            <td className="p-2 font-bold text-sm section-start">
              {formatTotal(totals.monthlyIncome)}
            </td>
            <td className="p-2"></td>
            <td className="p-2"></td>
            <td className="p-2"></td>
            <td className="p-2 font-bold text-sm section-start">
              {formatTotal(totals.approvedLifeCover)}
            </td>
            <td className="p-2 font-bold text-sm">
              {formatTotal(totals.fundValue)}
            </td>
            <td className="p-2 font-bold text-sm">
              {formatTotal(totals.fundValueAtDeath)}
            </td>
            <td className="p-2 section-start"></td>
            <td className="p-2"></td>
            <td className="p-2"></td>
            <td className="p-2"></td>
            <td className="p-2"></td>
            <td className="p-2"></td>
            <td className="p-2 section-end"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}