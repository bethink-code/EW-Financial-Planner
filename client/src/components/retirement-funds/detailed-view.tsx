import { useState, useCallback, memo, useMemo, useRef, useEffect } from "react";
import { ChevronRight, ChevronDown, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BeneficiarySection } from "./beneficiary-section";
import { FundActions } from "./fund-actions";
import { parseBeneficiaries } from "@/lib/beneficiaries";
import type { RetirementFund, UpdateRetirementFund } from "@shared/schema";

// Auto-sizing input component for split-pane view
const AutoSizeInput = ({ 
  value, 
  onChange, 
  className = "", 
  placeholder = "",
  disabled = false,
  style = {},
  fundId,
  field,
  ...props 
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  fundId?: number;
  field?: string;
  type?: string;
}) => {
  return (
    <input
      key={`${field}-${fundId}-${value.length}`}
      defaultValue={value}
      onBlur={onChange}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
      style={{ 
        ...style, 
        minWidth: '120px', 
        maxWidth: '300px'
      }}
      {...props}
    />
  );
};

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
  tableMode?: "inputs" | "flows";
}

export function DetailedView({ funds, columnVisibility, onFieldUpdate, isUpdating, tableMode = "inputs" }: DetailedViewProps) {
  const [selectedFundId, setSelectedFundId] = useState<number | null>(funds.length > 0 ? funds[0].id : null);
  
  const selectedFund = useMemo(() => {
    return funds.find(f => f.id === selectedFundId) || funds[0];
  }, [funds, selectedFundId]);

  const handleFieldChange = useCallback((field: keyof UpdateRetirementFund, value: string) => {
    if (selectedFund) {
      onFieldUpdate(selectedFund.id, field, value);
    }
  }, [selectedFund, onFieldUpdate]);

  const owners = useMemo(() => ["John Doe", "Jane Smith", "Sarah Johnson", "David Wilson"], []);
  const getOwnerBadgeColor = useCallback(() => "bg-white border border-neutral-300", []);

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
    return fund.beneficiaryName || "No beneficiary";
  }, []);

  if (!selectedFund) {
    return <div className="p-8 text-center text-gray-500">No funds available</div>;
  }

  return (
    <div className="flex min-h-screen bg-white rounded-lg border border-neutral-200">
      {/* Left Sidebar - Fund List */}
      <div className="w-80 border-r border-neutral-200 flex flex-col">
        <div className="p-4 border-b border-neutral-200 sticky top-0 bg-white z-10 min-h-[73px] flex items-center">
          <h3 className="font-semibold text-neutral-900">Funds ({funds.length})</h3>
        </div>
        <div className="flex-1">
          {funds.map((fund) => (
            <div
              key={fund.id}
              className={`p-4 border-b border-neutral-100 cursor-pointer hover:bg-gray-50 ${
                selectedFundId === fund.id ? 'border-l-4 border-l-[#016991]' : ''
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
              <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-8 gap-4 items-end">
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Description</Label>
                  <AutoSizeInput
                    value={selectedFund.description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    className="h-9 text-sm"
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
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {owners.map((owner) => (
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
                <AutoSizeInput
                  value={selectedFund.coverAmount}
                  onChange={(e) => handleFieldChange("coverAmount", e.target.value)}
                  className="h-9 text-sm text-right"
                  disabled={isUpdating}
                  placeholder="R 0"
                  style={{ textAlign: 'right' }}
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
              <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-8 gap-4 items-end">
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Monthly Income</Label>
                  <AutoSizeInput
                    value={selectedFund.monthlyIncome}
                    onChange={(e) => handleFieldChange("monthlyIncome", e.target.value)}
                    className="h-9 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="R 0"
                    style={{ textAlign: 'right' }}
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Term Years</Label>
                  <AutoSizeInput
                    value={selectedFund.termYears}
                    onChange={(e) => handleFieldChange("termYears", e.target.value)}
                    className="h-9 text-sm text-right"
                    disabled={isUpdating}
                    style={{ textAlign: 'right' }}
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Increase %</Label>
                  <AutoSizeInput
                    value={selectedFund.increasePercentage}
                    onChange={(e) => handleFieldChange("increasePercentage", e.target.value)}
                    className="h-9 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="5%"
                    style={{ textAlign: 'right' }}
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Escalation Amount</Label>
                  <AutoSizeInput
                    value={selectedFund.lumpSumDeath}
                    onChange={(e) => handleFieldChange("lumpSumDeath", e.target.value)}
                    className="h-9 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="R 0"
                    style={{ textAlign: 'right' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Fund Value Section */}
          {columnVisibility.fundValue && (
            <div className="bg-teal-50 rounded-lg p-4">
              <h4 className="text-sm font-bold text-teal-700 mb-4">Fund Value</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-8 gap-4 items-end">
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Approved Life Cover</Label>
                  <AutoSizeInput
                    value={selectedFund.approvedLifeCover}
                    onChange={(e) => handleFieldChange("approvedLifeCover", e.target.value)}
                    className="h-9 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="R 0"
                    style={{ textAlign: 'right' }}
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Fund Value</Label>
                  <AutoSizeInput
                    value={selectedFund.fundValue}
                    onChange={(e) => handleFieldChange("fundValue", e.target.value)}
                    className="h-9 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="R 0"
                    style={{ textAlign: 'right' }}
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Fund Value at Death</Label>
                  <div className="h-9 px-3 py-2 text-sm text-right bg-neutral-50 border border-neutral-200 rounded">
                    {selectedFund.fundValueAtDeath || "R 0"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fund Value Beneficiaries Section */}
          {columnVisibility.fundValueBeneficiaries && (
            <div className="bg-teal-50 rounded-lg p-4">
              <h4 className="text-sm font-bold text-teal-700 mb-4">Fund Value Beneficiaries</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-8 gap-4 items-end">
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Beneficiary Name</Label>
                  <Select
                    value={selectedFund.beneficiaryName || ""}
                    onValueChange={(value) => handleFieldChange("beneficiaryName", value)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="h-9 text-sm">
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
                  <AutoSizeInput
                    value={selectedFund.beneficiaryPercentageSplit}
                    onChange={(e) => handleFieldChange("beneficiaryPercentageSplit", e.target.value)}
                    className="h-9 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="0%"
                    style={{ textAlign: 'right' }}
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Amount (Read-only)</Label>
                  <div className="h-9 px-3 py-2 text-sm text-right bg-neutral-50 border border-neutral-200 rounded">
                    {selectedFund.amount || "R 0"}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Lump Sum Taken</Label>
                  <AutoSizeInput
                    value={selectedFund.lumpSumTaken}
                    onChange={(e) => handleFieldChange("lumpSumTaken", e.target.value)}
                    className="h-9 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="R 0"
                    style={{ textAlign: 'right' }}
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Non-deductible Contribution</Label>
                  <AutoSizeInput
                    value={selectedFund.nondeductibleContribution}
                    onChange={(e) => handleFieldChange("nondeductibleContribution", e.target.value)}
                    className="h-9 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="R 0"
                    style={{ textAlign: 'right' }}
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Living Annuity (Read-only)</Label>
                  <div className="h-9 px-3 py-2 text-sm text-right bg-neutral-50 border border-neutral-200 rounded">
                    {selectedFund.livingAnnuity || ""}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block h-8 flex items-end">Income Term</Label>
                  <AutoSizeInput
                    value={selectedFund.incomeTerm}
                    onChange={(e) => handleFieldChange("incomeTerm", e.target.value)}
                    className="h-9 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="Income term"
                    style={{ textAlign: 'right' }}
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
