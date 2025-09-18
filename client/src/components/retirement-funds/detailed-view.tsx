import { useState, useCallback, memo, useMemo, useRef, useEffect } from"react";
import { ChevronRight, ChevronDown, Edit, Plus } from"lucide-react";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { Label } from"@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from"@/components/ui/select";
import { Badge } from"@/components/ui/badge";
import { BeneficiarySection } from"./beneficiary-section";
import { FundActions } from"./fund-actions";
import { parseBeneficiaries } from"@/lib/beneficiaries";
import { getValueClass, isDefaultValue, handleDefaultValueFocus } from"@/lib/formatting";
import type { RetirementFund, UpdateRetirementFund } from"@shared/schema";

// Removed AutoSizeInput component - simplified for better performance

interface ColumnVisibility {
  overview: boolean;
  unapprovedLifeCover: boolean;
  monthlyDeathBenefit: boolean;
  fundValue: boolean;
  fundValueBeneficiaries: boolean;
}

interface DetailedViewProps {
  funds: RetirementFund[];
  columnVisibility: ColumnVisibility;
  onFieldUpdate: (id: number, field: keyof UpdateRetirementFund, value: string) => void;
  isUpdating: boolean;
  tableMode?:"inputs" |"flows";
  onAddFund: () => void;
}

export function DetailedView({ funds, columnVisibility, onFieldUpdate, isUpdating, tableMode ="inputs", onAddFund }: DetailedViewProps) {
  const [selectedFundId, setSelectedFundId] = useState<number | null>(funds.length > 0 ? funds[0].id : null);
  
  const selectedFund = useMemo(() => {
    return funds.find(f => f.id === selectedFundId) || funds[0];
  }, [funds, selectedFundId]);

  // Format currency value
  const formatCurrencyValue = useCallback((value: string, field: string) => {
    // Fields that should have currency formatting
    const currencyFields = [
      'coverAmount', 'monthlyIncome', 'approvedLifeCover', 'fundValue', 'fundValueAtDeath', 
      'amount', 'lumpSumTaken', 'nondeductibleContribution', 'livingAnnuity', 'escalationAmount',
      'currentAnnualIncome', 'annualIncomeAtDeath', 'estateDeploymentDeceased', 'monthlyProvisionOffered',
      'lumpSumProvisionEstate', 'lumpSumProvisionSpouse', 'lumpSumProvisionOther'
    ];
    
    // Fields that should have percentage formatting (% suffix)
    const percentageFields = [
      'increasePercentage', 'beneficiaryPercentageSplit', 'percentage', 'incomeEscalation',
      'executorsFee', 'mastersFee', 'estateDutyPoliciesOnLife', 'estateDutyToSpouse', 'estateDutyToOthers'
    ];
    
    // Fields that should have years formatting (years suffix)
    const yearsFields = [
      'termYears', 'incomeTerm'
    ];
    
    if (!currencyFields.includes(field) && !percentageFields.includes(field) && !yearsFields.includes(field)) return value;
    
    // Remove existing formatting and non-numeric characters except decimals
    const numericValue = value.replace(/[^\d.-]/g, '');
    if (!numericValue || isNaN(Number(numericValue))) return value;
    
    if (currencyFields.includes(field)) {
      // Add R prefix and format with thousands separators
      return `R ${Math.round(Number(numericValue)).toLocaleString()}`;
    } else if (percentageFields.includes(field)) {
      // Add % suffix
      return `${Number(numericValue)}%`;
    } else if (yearsFields.includes(field)) {
      // Add years suffix
      return `${Number(numericValue)} years`;
    }
    
    return value;
  }, []);

  const handleFieldChange = useCallback((field: keyof UpdateRetirementFund, value: string) => {
    if (selectedFund) {
      const formattedValue = formatCurrencyValue(value, field);
      onFieldUpdate(selectedFund.id, field, formattedValue);
      
      // Recalculate cover splits when cover amount changes
      if (field === 'coverAmount') {
        const beneficiaries = parseBeneficiaries(selectedFund.beneficiaries);
        if (beneficiaries.length > 0) {
          const newCoverAmount = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
          const updatedBeneficiaries = beneficiaries.map(b => ({
            ...b,
            coverSplit: `R ${Math.round((newCoverAmount * b.percentage / 100)).toLocaleString()}`
          }));
          onFieldUpdate(selectedFund.id, 'beneficiaries', JSON.stringify(updatedBeneficiaries));
        }
      }
    }
  }, [selectedFund, onFieldUpdate, formatCurrencyValue]);

  const handleFieldBlur = useCallback((field: keyof UpdateRetirementFund, value: string) => {
    if (selectedFund) {
      const formattedValue = formatCurrencyValue(value, field);
      onFieldUpdate(selectedFund.id, field, formattedValue);
    }
  }, [selectedFund, onFieldUpdate, formatCurrencyValue]);

  const owners = useMemo(() => ["Donald Edwards","Betty Edwards"], []);
  const getOwnerBadgeColor = useCallback(() =>" border border-neutral-300", []);

  // Helper function to get primary beneficiary display
  const getPrimaryBeneficiary = useCallback((fund: RetirementFund) => {
    // First check if there are dynamic beneficiaries from the beneficiaries field
    const beneficiaries = parseBeneficiaries(fund.beneficiaries);
    if (beneficiaries.length > 0) {
      const primaryBeneficiary = beneficiaries[0];
      if (beneficiaries.length === 1) {
        return primaryBeneficiary.name;
      } else {
        return `${primaryBeneficiary.name} +${beneficiaries.length - 1} more`;
      }
    }
    
    // Fallback to the single beneficiaryName field
    return fund.beneficiaryName ||"No beneficiary";
  }, []);

  if (!selectedFund) {
    return <div className="p-8 text-center text-gray-500">No funds available</div>;
  }

  return (
    <div className="flex  rounded-lg border border-neutral-200">
      {/* Left Sidebar - Fund List */}
      <div className="w-80 border-r border-neutral-200 flex flex-col">
        <div className="p-4 border-b border-neutral-200 sticky top-0  z-10 min-h-[73px] flex items-center">
          <h3 className="font-semibold text-neutral-900">Funds ({funds.length})</h3>
        </div>
        <div className="flex-1">
          {funds.map((fund) => (
            <div
              key={fund.id}
              className={`p-4 border-b border-neutral-100 cursor-pointer hover:bg-gray-50 ${
                selectedFundId === fund.id ? 'border-l-4 border-l-[hsl(var(--primary))]' : ''
              }`}
              style={{ 
                backgroundColor: selectedFundId === fund.id ? '#F6F7F9' : undefined 
              }}
              onClick={() => setSelectedFundId(fund.id)}
            >
              <div className="space-y-2">
                <div className="font-medium text-neutral-900 truncate">{fund.description}</div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getOwnerBadgeColor()} style={{ color: '#EA8A2E' }}>
                    {fund.owner}
                  </Badge>
                </div>
                <div className="text-sm text-neutral-600">
                  Fund Value: <span className="font-medium text-neutral-900">{fund.fundValue}</span>
                </div>
                <div className="text-sm text-neutral-600">
                  Beneficiary: <span className="font-medium">{getPrimaryBeneficiary(fund)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Selected Fund Details */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 bg-gray-50 sticky top-0 z-10 min-h-[73px]">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-neutral-900">{selectedFund.description}</h2>
              <Badge variant="outline" className={getOwnerBadgeColor()} style={{ color: '#EA8A2E' }}>
                {selectedFund.owner}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <FundActions fund={selectedFund} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-4 pb-8">
          {/* Overview Section */}
          {columnVisibility.overview && (
            <div className="bg-teal-50 rounded-lg p-4">
              <h4 className="text-sm font-bold text-teal-700 mb-4">Overview</h4>
              <div className="flex flex-wrap gap-6 items-end">
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Description</Label>
                  <input
                    key={`description-${selectedFund.id}`}
                    defaultValue={selectedFund.description ||"Enter here ..."} onFocus={handleDefaultValueFocus}
                    onBlur={(e) => {
                      const formattedValue = formatCurrencyValue(e.target.value,"description");
                      if (formattedValue !== e.target.value) {
                        e.target.value = formattedValue;
                      }
                      handleFieldChange("description", e.target.value);
                    }}
                    className="h-9 px-3 text-sm  border border-neutral-200 rounded focus:border-primary focus:outline-none w-[200px]"
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Owner</Label>
                  <Select
                    value={selectedFund.owner}
                    onValueChange={(value) => handleFieldChange("owner", value)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="h-9 text-sm w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {owners.filter(owner => owner && owner.trim() !== "").map((owner) => (
                        <SelectItem key={owner} value={owner}>
                          {owner}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Unapproved Life Cover Section */}
          {columnVisibility.unapprovedLifeCover && (
            <div className="bg-teal-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-teal-700">Unapproved Life Cover</h4>
                <div className="text-xs text-neutral-600">
                  Cover Amount: {selectedFund.coverAmount}
                </div>
              </div>
              <div className="mb-4">
                <Label className="text-xs text-neutral-600 mb-1 block">Cover Amount</Label>
                <input
                  key={`coverAmount-${selectedFund.id}`}
                  defaultValue={selectedFund.coverAmount ||"Enter here ..."} onFocus={handleDefaultValueFocus}
                  onBlur={(e) => {
                    const formattedValue = formatCurrencyValue(e.target.value,"coverAmount");
                    if (formattedValue !== e.target.value) {
                      e.target.value = formattedValue;
                    }
                    handleFieldChange("coverAmount", e.target.value);
                  }}
                  className="h-9 px-3 text-sm text-right  border border-neutral-200 rounded focus:border-primary focus:outline-none w-[140px]"
                  disabled={isUpdating}
                  placeholder="R 0"
                />
              </div>
              <BeneficiarySection
                fund={selectedFund}
                onFieldUpdate={onFieldUpdate}
                isUpdating={isUpdating}
                tableMode="inputs"
                layout="compact"
              />
            </div>
          )}

          {/* Monthly Death Benefit Section */}
          {columnVisibility.monthlyDeathBenefit && (
            <div className="bg-teal-50 rounded-lg p-4">
              <h4 className="text-sm font-bold text-teal-700 mb-4">Monthly Death Benefit</h4>
              <div className="flex flex-wrap gap-6 items-end">
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Monthly Income</Label>
                  <input
                    key={`monthlyIncome-${selectedFund.id}`}
                    defaultValue={selectedFund.monthlyIncome ||"Enter here ..."} onFocus={handleDefaultValueFocus}
                    onBlur={(e) => {
                      const formattedValue = formatCurrencyValue(e.target.value,"monthlyIncome");
                      if (formattedValue !== e.target.value) {
                        e.target.value = formattedValue;
                      }
                      handleFieldChange("monthlyIncome", e.target.value);
                    }}
                    className="h-9 px-3 text-sm text-right  border border-neutral-200 rounded focus:border-primary focus:outline-none w-[140px]"
                    disabled={isUpdating}
                    placeholder="R 0"
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Term Years</Label>
                  <input
                    key={`termYears-${selectedFund.id}`}
                    defaultValue={selectedFund.termYears ||"Enter here ..."} onFocus={handleDefaultValueFocus}
                    onBlur={(e) => {
                      const formattedValue = formatCurrencyValue(e.target.value,"termYears");
                      if (formattedValue !== e.target.value) {
                        e.target.value = formattedValue;
                      }
                      handleFieldChange("termYears", e.target.value);
                    }}
                    className="h-9 px-3 text-sm text-right  border border-neutral-200 rounded focus:border-primary focus:outline-none w-[80px]"
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Increase %</Label>
                  <input
                    key={`increasePercentage-${selectedFund.id}`}
                    defaultValue={selectedFund.increasePercentage ||"Enter here ..."} onFocus={handleDefaultValueFocus}
                    onBlur={(e) => {
                      const formattedValue = formatCurrencyValue(e.target.value,"increasePercentage");
                      if (formattedValue !== e.target.value) {
                        e.target.value = formattedValue;
                      }
                      handleFieldChange("increasePercentage", e.target.value);
                    }}
                    className="h-9 px-3 text-sm text-right  border border-neutral-200 rounded focus:border-primary focus:outline-none w-[80px]"
                    disabled={isUpdating}
                    placeholder="5%"
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Escalation Amount</Label>
                  <input
                    key={`escalationAmount-${selectedFund.id}`}
                    defaultValue={selectedFund.approvedLifeCover ||"Enter here ..."} onFocus={handleDefaultValueFocus}
                    onBlur={(e) => {
                      const formattedValue = formatCurrencyValue(e.target.value,"approvedLifeCover");
                      if (formattedValue !== e.target.value) {
                        e.target.value = formattedValue;
                      }
                      handleFieldChange("approvedLifeCover", e.target.value);
                    }}
                    className="h-9 px-3 text-sm text-right  border border-neutral-200 rounded focus:border-primary focus:outline-none w-[140px]"
                    disabled={isUpdating}
                    placeholder="R 0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Fund Value Section */}
          {columnVisibility.fundValue && (
            <div className="bg-teal-50 rounded-lg p-4">
              <h4 className="text-sm font-bold text-teal-700 mb-4">Fund Value</h4>
              <div className="flex flex-wrap gap-6 items-end">
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Approved Life Cover</Label>
                  <input
                    key={`approvedLifeCover-${selectedFund.id}`}
                    defaultValue={selectedFund.approvedLifeCover ||"Enter here ..."} onFocus={handleDefaultValueFocus}
                    onBlur={(e) => {
                      const formattedValue = formatCurrencyValue(e.target.value,"approvedLifeCover");
                      if (formattedValue !== e.target.value) {
                        e.target.value = formattedValue;
                      }
                      handleFieldChange("approvedLifeCover", e.target.value);
                    }}
                    className="h-9 px-3 text-sm text-right  border border-neutral-200 rounded focus:border-primary focus:outline-none w-[140px]"
                    disabled={isUpdating}
                    placeholder="R 0"
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Fund Value</Label>
                  <input
                    key={`fundValue-${selectedFund.id}`}
                    defaultValue={formatCurrencyValue(selectedFund.fundValue ||"","fundValue")}
                    onBlur={(e) => {
                      const formattedValue = formatCurrencyValue(e.target.value,"fundValue");
                      if (formattedValue !== e.target.value) {
                        e.target.value = formattedValue;
                      }
                      handleFieldChange("fundValue", e.target.value);
                    }}
                    className="h-9 px-3 text-sm text-right  border border-neutral-200 rounded focus:border-primary focus:outline-none w-[140px]"
                    disabled={isUpdating}
                    placeholder="R 0"
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Fund Value at Death</Label>
                  <div className="h-9 px-3 text-sm text-right bg-neutral-50 border border-neutral-200 rounded w-[140px]">
                    {selectedFund.fundValueAtDeath ||"R 0"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fund Value Beneficiaries Section */}
          {columnVisibility.fundValueBeneficiaries && (
            <div className="bg-teal-50 rounded-lg p-4">
              <h4 className="text-sm font-bold text-teal-700 mb-4">Fund Value Beneficiaries</h4>
              <div className="flex flex-wrap gap-6 items-end">
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Beneficiary Name</Label>
                  <Select
                    value={selectedFund.beneficiaryName ||""}
                    onValueChange={(value) => handleFieldChange("beneficiaryName", value)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="h-9 text-sm w-[120px]">
                      <SelectValue placeholder="Select beneficiary" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Child">Child</SelectItem>
                      <SelectItem value="Estate">Estate</SelectItem>
                      <SelectItem value="Trust">Trust</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Percentage</Label>
                  <input
                    key={`beneficiaryPercentageSplit-${selectedFund.id}`}
                    defaultValue={selectedFund.beneficiaryPercentageSplit ||"Enter here ..."} onFocus={handleDefaultValueFocus}
                    onBlur={(e) => {
                      const formattedValue = formatCurrencyValue(e.target.value,"beneficiaryPercentageSplit");
                      if (formattedValue !== e.target.value) {
                        e.target.value = formattedValue;
                      }
                      handleFieldChange("beneficiaryPercentageSplit", e.target.value);
                    }}
                    className="h-9 px-2 text-sm text-right  border border-neutral-200 rounded focus:border-primary focus:outline-none w-[70px]"
                    disabled={isUpdating}
                    placeholder="0%"
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Amount (Read-only)</Label>
                  <div className="h-9 px-3 text-sm text-right bg-neutral-50 border border-neutral-200 rounded w-[140px]">
                    {selectedFund.amount ||"R 0"}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Lump Sum Taken</Label>
                  <input
                    key={`lumpSumTaken-${selectedFund.id}`}
                    defaultValue={selectedFund.lumpSumTaken ||"Enter here ..."} onFocus={handleDefaultValueFocus}
                    onBlur={(e) => {
                      const formattedValue = formatCurrencyValue(e.target.value,"lumpSumTaken");
                      if (formattedValue !== e.target.value) {
                        e.target.value = formattedValue;
                      }
                      handleFieldChange("lumpSumTaken", e.target.value);
                    }}
                    className="h-9 px-3 text-sm text-right  border border-neutral-200 rounded focus:border-primary focus:outline-none w-[140px]"
                    disabled={isUpdating}
                    placeholder="R 0"
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Non-deductible Contribution</Label>
                  <input
                    key={`nondeductibleContribution-${selectedFund.id}`}
                    defaultValue={selectedFund.nondeductibleContribution ||"Enter here ..."} onFocus={handleDefaultValueFocus}
                    onBlur={(e) => {
                      const formattedValue = formatCurrencyValue(e.target.value,"nondeductibleContribution");
                      if (formattedValue !== e.target.value) {
                        e.target.value = formattedValue;
                      }
                      handleFieldChange("nondeductibleContribution", e.target.value);
                    }}
                    className="h-9 px-3 text-sm text-right  border border-neutral-200 rounded focus:border-primary focus:outline-none w-[140px]"
                    disabled={isUpdating}
                    placeholder="R 0"
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Living Annuity (Read-only)</Label>
                  <div className="h-9 px-3 text-sm text-right bg-neutral-50 border border-neutral-200 rounded w-[140px]">
                    {selectedFund.livingAnnuity ||""}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Income Term</Label>
                  <input
                    key={`incomeTerm-${selectedFund.id}`}
                    defaultValue={selectedFund.incomeTerm ||"Enter here ..."} onFocus={handleDefaultValueFocus}
                    onBlur={(e) => {
                      const formattedValue = formatCurrencyValue(e.target.value,"incomeTerm");
                      if (formattedValue !== e.target.value) {
                        e.target.value = formattedValue;
                      }
                      handleFieldChange("incomeTerm", e.target.value);
                    }}
                    className="h-9 px-3 text-sm text-right  border border-neutral-200 rounded focus:border-primary focus:outline-none w-[100px]"
                    disabled={isUpdating}
                    placeholder="Income term"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
