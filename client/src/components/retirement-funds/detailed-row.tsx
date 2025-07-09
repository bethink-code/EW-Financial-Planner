import { useState, useCallback, memo, useMemo } from "react";
import { ChevronRight, ChevronDown, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BeneficiarySection } from "./beneficiary-section";
import type { RetirementFund, UpdateRetirementFund } from "@shared/schema";

interface ColumnVisibility {
  overview: boolean;
  unapprovedLifeCover: boolean;
  monthlyDeathBenefit: boolean;
  fundValue: boolean;
  fundValueBeneficiaries: boolean;
}

interface DetailedRowProps {
  fund: RetirementFund;
  columnVisibility: ColumnVisibility;
  onFieldUpdate: (id: number, field: keyof UpdateRetirementFund, value: string) => void;
  isUpdating: boolean;
}

export const DetailedRow = memo(function DetailedRow({ fund, columnVisibility, onFieldUpdate, isUpdating }: DetailedRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFieldChange = useCallback((field: keyof UpdateRetirementFund, value: string) => {
    onFieldUpdate(fund.id, field, value);
  }, [fund.id, onFieldUpdate]);

  const owners = useMemo(() => ["John Doe", "Jane Smith", "Sarah Johnson", "David Wilson"], []);
  const getOwnerBadgeColor = useCallback(() => "bg-white border border-neutral-300", []);

  return (
    <div className="border border-neutral-200 rounded-lg bg-white">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown size={16} className="text-neutral-500" />
            ) : (
              <ChevronRight size={16} className="text-neutral-500" />
            )}
            <h3 className="text-lg font-bold text-neutral-900">{fund.description}</h3>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className={getOwnerBadgeColor()} style={{ color: '#EA8A2E' }}>
              {fund.owner}
            </Badge>
            <div className="text-sm text-neutral-600">
              Fund Value: <span className="font-medium text-neutral-900">{fund.fundValue}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-neutral-500 text-xs">Beneficiary:</span>
            <div className="font-medium">{fund.beneficiaryName}</div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-neutral-200 p-3 lg:p-4 space-y-3 lg:space-y-4">
          {/* Overview Section */}
          {columnVisibility.overview && (
            <div className="bg-teal-50 rounded-lg p-4">
              <h4 className="text-sm font-bold text-teal-700 mb-4">Overview</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block">Description</Label>
                  <Input
                    value={fund.description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    className="h-9 text-sm"
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block">Owner</Label>
                  <Select
                    value={fund.owner}
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

          {/* Unapproved Life Cover Section - Dynamic Beneficiaries */}
          {columnVisibility.unapprovedLifeCover && (
            <div className="bg-teal-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-teal-700">Unapproved Life Cover</h4>
                <div className="text-xs text-neutral-600">
                  Cover Amount: {fund.coverAmount}
                </div>
              </div>
              <div className="mb-4 max-w-xs">
                <Label className="text-xs text-neutral-600 mb-1 block">Cover Amount</Label>
                <Input
                  value={fund.coverAmount}
                  onChange={(e) => handleFieldChange("coverAmount", e.target.value)}
                  className="h-9 text-sm text-right"
                  disabled={isUpdating}
                  placeholder="R 0"
                />
              </div>
              <BeneficiarySection
                fund={fund}
                onFieldUpdate={onFieldUpdate}
                isUpdating={isUpdating}
                tableMode="inputs"
              />
            </div>
          )}

          {/* Monthly Death Benefit Section */}
          {columnVisibility.monthlyDeathBenefit && (
            <div className="bg-teal-50 rounded-lg p-4">
              <h4 className="text-sm font-bold text-teal-700 mb-4">Monthly Death Benefit</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 max-w-6xl">
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block">Monthly Income</Label>
                  <Input
                    value={fund.monthlyIncome}
                    onChange={(e) => handleFieldChange("monthlyIncome", e.target.value)}
                    className="h-9 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="R 0"
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block">Term Years</Label>
                  <Input
                    value={fund.termYears}
                    onChange={(e) => handleFieldChange("termYears", e.target.value)}
                    className="h-9 text-sm text-right"
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block">Increase %</Label>
                  <Input
                    value={fund.increasePercentage}
                    onChange={(e) => handleFieldChange("increasePercentage", e.target.value)}
                    className="h-9 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="5%"
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block">Escalation Amount</Label>
                  <Input
                    value={fund.lumpSumDeath}
                    onChange={(e) => handleFieldChange("lumpSumDeath", e.target.value)}
                    className="h-9 text-sm text-right"
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-5xl">
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block">Approved Life Cover</Label>
                  <Input
                    value={fund.approvedLifeCover}
                    onChange={(e) => handleFieldChange("approvedLifeCover", e.target.value)}
                    className="h-9 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="R 0"
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block">Fund Value</Label>
                  <Input
                    value={fund.fundValue}
                    onChange={(e) => handleFieldChange("fundValue", e.target.value)}
                    className="h-9 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="R 0"
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600 mb-1 block">Fund Value at Death</Label>
                  <div className="h-9 px-3 py-2 text-sm text-right bg-neutral-50 border border-neutral-200 rounded">
                    {fund.fundValueAtDeath || "R 0"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fund Value Beneficiaries Section */}
          {columnVisibility.fundValueBeneficiaries && (
            <div className="bg-teal-50 rounded-lg p-4">
              <h4 className="text-sm font-bold text-teal-700 mb-4">Fund Value Beneficiaries</h4>
              <div className="space-y-4">
                {/* First Row - Main beneficiary info */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-neutral-600 mb-1 block">Beneficiary Name</Label>
                    <Select
                      value={fund.beneficiaryName || ""}
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
                    <Label className="text-xs text-neutral-600 mb-1 block">Percentage</Label>
                    <Input
                      value={fund.beneficiaryPercentageSplit}
                      onChange={(e) => handleFieldChange("beneficiaryPercentageSplit", e.target.value)}
                      className="h-9 text-sm text-right"
                      disabled={isUpdating}
                      placeholder="0%"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-neutral-600 mb-1 block">Amount (Read-only)</Label>
                    <div className="h-9 px-3 py-2 text-sm text-right bg-neutral-50 border border-neutral-200 rounded">
                      {fund.amount || "R 0"}
                    </div>
                  </div>
                </div>

                {/* Second Row - Financial details */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs text-neutral-600 mb-1 block">Lump Sum Taken</Label>
                    <Input
                      value={fund.lumpSumTaken}
                      onChange={(e) => handleFieldChange("lumpSumTaken", e.target.value)}
                      className="h-9 text-sm text-right"
                      disabled={isUpdating}
                      placeholder="R 0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-neutral-600 mb-1 block">Non-deductible Contribution</Label>
                    <Input
                      value={fund.nondeductibleContribution}
                      onChange={(e) => handleFieldChange("nondeductibleContribution", e.target.value)}
                      className="h-9 text-sm text-right"
                      disabled={isUpdating}
                      placeholder="R 0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-neutral-600 mb-1 block">Living Annuity (Read-only)</Label>
                    <div className="h-9 px-3 py-2 text-sm text-right bg-neutral-50 border border-neutral-200 rounded">
                      {fund.livingAnnuity || ""}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-neutral-600 mb-1 block">Income Term</Label>
                    <Input
                      value={fund.incomeTerm}
                      onChange={(e) => handleFieldChange("incomeTerm", e.target.value)}
                      className="h-9 text-sm text-right"
                      disabled={isUpdating}
                      placeholder="Income term"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});