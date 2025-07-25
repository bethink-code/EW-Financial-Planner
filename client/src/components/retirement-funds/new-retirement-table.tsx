import React, { useCallback, useMemo } from 'react';
import { RetirementFund } from '@shared/schema';
import { Plus, UserPlus, UserMinus, Trash2, Copy } from 'lucide-react';
import { formatCurrencyValue, formatPercentageValue, formatTextValue, formatYearsValue, getValueClass, isDefaultValue, handleDefaultValueFocus, createEnhancedBlurHandler } from "@/lib/formatting";
import { getFieldClass } from "@/lib/field-types";

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
    
    const newOwners = fund.owners.filter((_, i) => i !== ownerIndex);
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
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          {/* Main section headers */}
          <tr className="bg-gray-100">
            <th className="border border-neutral-300 p-2 text-xs font-semibold">ACTIONS</th>
            <th className="border border-neutral-300 p-2 text-xs font-semibold" colSpan={2}>OVERVIEW</th>
            <th className="border border-neutral-300 p-2 text-xs font-semibold" colSpan={4}>UNAPPROVED LIFE COVER</th>
            <th className="border border-neutral-300 p-2 text-xs font-semibold" colSpan={4}>MONTHLY DEATH BENEFIT</th>
            <th className="border border-neutral-300 p-2 text-xs font-semibold" colSpan={3}>APPROVED LIFE COVER</th>
            <th className="border border-neutral-300 p-2 text-xs font-semibold" colSpan={8}>FUND VALUE BENEFICIARIES</th>
          </tr>
          
          {/* Individual column headers */}
          <tr className="bg-gray-50">
            <th className="border border-neutral-300 p-1 text-xs border-b border-neutral-200">Actions</th>
            <th className="border border-neutral-300 p-1 text-xs border-b border-neutral-200">Description</th>
            <th className="border border-neutral-300 p-1 text-xs border-b border-neutral-200">Owner</th>
            <th className="border border-neutral-300 p-1 text-xs border-b border-neutral-200">Cover Amount</th>
            <th className="border border-neutral-300 p-1 text-xs border-b border-neutral-200">Beneficiary</th>
            <th className="border border-neutral-300 p-1 text-xs border-b border-neutral-200">Percentage Split</th>
            <th className="border border-neutral-300 p-1 text-xs border-b border-neutral-200">Cover Split</th>
            <th className="border border-neutral-300 p-1 text-xs border-b border-neutral-200">Monthly Income</th>
            <th className="border border-neutral-300 p-1 text-xs border-b border-neutral-200">Checkbox</th>
            <th className="border border-neutral-300 p-1 text-xs border-b border-neutral-200">Term Years</th>
            <th className="border border-neutral-300 p-1 text-xs border-b border-neutral-200">Increase %</th>
            <th className="border border-neutral-300 p-1 text-xs border-b border-neutral-200">Cover</th>
            <th className="border border-neutral-300 p-1 text-xs border-b border-neutral-200">Fund Value</th>
            <th className="border border-neutral-300 p-1 text-xs border-b border-neutral-200">Fund Value at Death</th>
            <th className="border border-neutral-300 p-1 text-xs border-b border-neutral-200">Beneficiary</th>
            <th className="border border-neutral-300 p-1 text-xs border-b border-neutral-200">Cover % Split</th>
            <th className="border border-neutral-300 p-1 text-xs border-b border-neutral-200">Cover</th>
            <th className="border border-neutral-300 p-1 text-xs border-b border-neutral-200">Lump Assessed</th>
            <th className="border border-neutral-300 p-1 text-xs border-b border-neutral-200">Non Deductible</th>
            <th className="border border-neutral-300 p-1 text-xs border-b border-neutral-200">Living Annuity</th>
            <th className="border border-neutral-300 p-1 text-xs border-b border-neutral-200">Checkbox</th>
            <th className="border border-neutral-300 p-1 text-xs border-b border-neutral-200">Income Term</th>
          </tr>
        </thead>
        <tbody>
          {funds.map((fund, fundIndex) => {
            const maxRows = Math.max(
              fund.owners.length,
              fund.unapprovedBeneficiaries.length,
              fund.fundValueBeneficiaries.length
            );

            return Array.from({ length: maxRows }, (_, rowIndex) => (
              <tr key={`${fund.id}-${rowIndex}-${fund.unapprovedBeneficiaries.length}-${fund.fundValueBeneficiaries.length}`} className="hover:bg-gray-50">
                {/* Actions */}
                <td className="border border-neutral-300 p-1">
                  {rowIndex === 0 && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => onDuplicateFund(fund)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Duplicate"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => onRemoveFund(fund.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </td>

                {/* Overview - Description */}
                <td className="border border-neutral-300 p-1">
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
                <td className="border border-neutral-300 p-1">
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
                          onClick={() => handleAddOwner(fund.id)}
                          className="p-0.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Add Owner"
                        >
                          <UserPlus className="h-3 w-3" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRemoveOwner(fund.id, rowIndex)}
                          className="p-0.5 text-red-600 hover:bg-red-50 rounded"
                          title="Remove Owner"
                        >
                          <UserMinus className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                </td>

                {/* Unapproved Life Cover - Cover Amount */}
                <td className="border border-neutral-300 p-1">
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
                <td className="border border-neutral-300 p-1">
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
                          onClick={() => handleAddUnapprovedBeneficiary(fund.id)}
                          className="p-0.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Add Beneficiary"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRemoveUnapprovedBeneficiary(fund.id, rowIndex)}
                          className="p-0.5 text-red-600 hover:bg-red-50 rounded"
                          title="Remove Beneficiary"
                        >
                          <UserMinus className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                </td>

                {/* Unapproved Life Cover - Percentage Split */}
                <td className="border border-neutral-300 p-1">
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
                <td className="border border-neutral-300 p-1 bg-gray-100">
                  {rowIndex < fund.unapprovedCoverSplits.length && (
                    <span className="text-xs text-gray-600">
                      {fund.unapprovedCoverSplits[rowIndex]}
                    </span>
                  )}
                </td>

                {/* Monthly Death Benefit - Monthly Income */}
                <td className="border border-neutral-300 p-1">
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
                <td className="border border-neutral-300 p-1 text-center">
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
                <td className="border border-neutral-300 p-1">
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
                <td className="border border-neutral-300 p-1">
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
                <td className="border border-neutral-300 p-1">
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
                <td className="border border-neutral-300 p-1">
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
                <td className="border border-neutral-300 p-1 bg-gray-100">
                  {rowIndex === 0 && (
                    <span className="text-xs text-gray-600">
                      {fund.fundValueAtDeath}
                    </span>
                  )}
                </td>

                {/* Fund Value Beneficiaries - Beneficiary */}
                <td className="border border-neutral-300 p-1">
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
                          onClick={() => handleAddFundValueBeneficiary(fund.id)}
                          className="p-0.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Add Beneficiary"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRemoveFundValueBeneficiary(fund.id, rowIndex)}
                          className="p-0.5 text-red-600 hover:bg-red-50 rounded"
                          title="Remove Beneficiary"
                        >
                          <UserMinus className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                </td>

                {/* Fund Value Beneficiaries - Cover % Split */}
                <td className="border border-neutral-300 p-1">
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
                <td className="border border-neutral-300 p-1 bg-gray-100">
                  {rowIndex < fund.fundValueCoverSplits.length && (
                    <span className="text-xs text-gray-600">
                      {fund.fundValueCoverSplits[rowIndex]}
                    </span>
                  )}
                </td>

                {/* Fund Value Beneficiaries - Lump Assessed */}
                <td className="border border-neutral-300 p-1">
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
                <td className="border border-neutral-300 p-1">
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
                <td className="border border-neutral-300 p-1 bg-gray-100">
                  {rowIndex === 0 && (
                    <span className="text-xs text-gray-600">
                      {fund.livingAnnuity}
                    </span>
                  )}
                </td>

                {/* Fund Value Beneficiaries - Checkbox */}
                <td className="border border-neutral-300 p-1 text-center">
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
                <td className="border border-neutral-300 p-1">
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
          <tr className="bg-blue-50 border-t-2 border-blue-200 font-bold">
            <td className="border border-neutral-300 p-2 text-center text-xs font-semibold">TOTALS</td>
            <td className="border border-neutral-300 p-1"></td>
            <td className="border border-neutral-300 p-1"></td>
            <td className="border border-neutral-300 p-1 text-center text-xs font-bold">
              {formatTotal(totals.coverAmount)}
            </td>
            <td className="border border-neutral-300 p-1"></td>
            <td className="border border-neutral-300 p-1"></td>
            <td className="border border-neutral-300 p-1"></td>
            <td className="border border-neutral-300 p-1 text-center text-xs font-bold">
              {formatTotal(totals.monthlyIncome)}
            </td>
            <td className="border border-neutral-300 p-1"></td>
            <td className="border border-neutral-300 p-1"></td>
            <td className="border border-neutral-300 p-1"></td>
            <td className="border border-neutral-300 p-1 text-center text-xs font-bold">
              {formatTotal(totals.approvedLifeCover)}
            </td>
            <td className="border border-neutral-300 p-1 text-center text-xs font-bold">
              {formatTotal(totals.fundValue)}
            </td>
            <td className="border border-neutral-300 p-1 text-center text-xs font-bold">
              {formatTotal(totals.fundValueAtDeath)}
            </td>
            <td className="border border-neutral-300 p-1"></td>
            <td className="border border-neutral-300 p-1"></td>
            <td className="border border-neutral-300 p-1"></td>
            <td className="border border-neutral-300 p-1"></td>
            <td className="border border-neutral-300 p-1"></td>
            <td className="border border-neutral-300 p-1"></td>
            <td className="border border-neutral-300 p-1"></td>
            <td className="border border-neutral-300 p-1"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}