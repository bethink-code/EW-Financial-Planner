import { useState } from "react";
import { ChevronRight, ChevronDown, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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

export function DetailedRow({ fund, columnVisibility, onFieldUpdate, isUpdating }: DetailedRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFieldChange = (field: keyof UpdateRetirementFund, value: string) => {
    onFieldUpdate(fund.id, field, value);
  };

  const owners = ["John Doe", "Jane Smith", "Sarah Johnson", "David Wilson"];
  const getOwnerBadgeColor = (owner: string) => {
    return "bg-white border border-neutral-300";
  };

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
            <Badge variant="outline" className={getOwnerBadgeColor(fund.owner)} style={{ color: '#EA8A2E' }}>
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
        <div className="border-t border-neutral-200 p-4 space-y-4">
          {/* Overview Section */}
          {columnVisibility.overview && (
            <div className="bg-teal-50 rounded-lg p-3">
              <h4 className="text-sm font-bold text-teal-700 mb-3">Overview</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-neutral-600">Description</Label>
                  <Input
                    value={fund.description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    className="h-8 text-sm"
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600">Owner</Label>
                  <Select
                    value={fund.owner}
                    onValueChange={(value) => handleFieldChange("owner", value)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="h-8 text-sm">
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
            <div className="bg-teal-50 rounded-lg p-3">
              <h4 className="text-sm font-bold text-teal-700 mb-3">Unapproved Life Cover</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-neutral-600">Cover Amount</Label>
                  <Input
                    value={fund.coverAmount}
                    onChange={(e) => handleFieldChange("coverAmount", e.target.value)}
                    className="h-8 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="R 0"
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600">Beneficiary</Label>
                  <Select
                    value={fund.beneficiary || ""}
                    onValueChange={(value) => handleFieldChange("beneficiary", value)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select beneficiary" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No beneficiary">No beneficiary</SelectItem>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Child">Child</SelectItem>
                      <SelectItem value="Parent">Parent</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-neutral-600">% Split</Label>
                  <Input
                    value={fund.beneficiaryPercentage}
                    onChange={(e) => handleFieldChange("beneficiaryPercentage", e.target.value)}
                    className="h-8 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="100%"
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600">Cover Split</Label>
                  <Input
                    value={fund.coverSplit}
                    onChange={(e) => handleFieldChange("coverSplit", e.target.value)}
                    className="h-8 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="R 0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Monthly Death Benefit Section */}
          {columnVisibility.monthlyDeathBenefit && (
            <div className="bg-teal-50 rounded-lg p-3">
              <h4 className="text-sm font-bold text-teal-700 mb-3">Monthly Death Benefit</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-neutral-600">Monthly Income</Label>
                  <Input
                    value={fund.monthlyIncome}
                    onChange={(e) => handleFieldChange("monthlyIncome", e.target.value)}
                    className="h-8 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="R 0"
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600">Term Years</Label>
                  <Input
                    value={fund.termYears}
                    onChange={(e) => handleFieldChange("termYears", e.target.value)}
                    className="h-8 text-sm text-right"
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600">Increase %</Label>
                  <Input
                    value={fund.increasePercentage}
                    onChange={(e) => handleFieldChange("increasePercentage", e.target.value)}
                    className="h-8 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="5%"
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600">Escalation Amount</Label>
                  <Input
                    value={fund.lumpSumDeath}
                    onChange={(e) => handleFieldChange("lumpSumDeath", e.target.value)}
                    className="h-8 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="R 0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Fund Value Section */}
          {columnVisibility.fundValue && (
            <div className="bg-teal-50 rounded-lg p-3">
              <h4 className="text-sm font-bold text-teal-700 mb-3">Fund Value</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-neutral-600">Approved Life Cover</Label>
                  <Input
                    value={fund.approvedLifeCover}
                    onChange={(e) => handleFieldChange("approvedLifeCover", e.target.value)}
                    className="h-8 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="R 0"
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600">Fund Value</Label>
                  <Input
                    value={fund.fundValue}
                    onChange={(e) => handleFieldChange("fundValue", e.target.value)}
                    className="h-8 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="R 0"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-neutral-600">Fund Value at Death</Label>
                  <div className="h-8 px-3 py-1 text-sm text-right bg-neutral-50 border border-neutral-200 rounded">
                    {fund.fundValueAtDeath || "R 0"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fund Value Beneficiaries Section */}
          {columnVisibility.fundValueBeneficiaries && (
            <div className="bg-teal-50 rounded-lg p-3">
              <h4 className="text-sm font-bold text-teal-700 mb-3">Fund Value Beneficiaries</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-neutral-600">Beneficiary Name</Label>
                  <Select
                    value={fund.beneficiaryName || ""}
                    onValueChange={(value) => handleFieldChange("beneficiaryName", value)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="h-8 text-sm">
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
                  <Label className="text-xs text-neutral-600">Percentage</Label>
                  <Input
                    value={fund.beneficiaryPercentageSplit}
                    onChange={(e) => handleFieldChange("beneficiaryPercentageSplit", e.target.value)}
                    className="h-8 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="0%"
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600">Amount (Read-only)</Label>
                  <div className="h-8 px-3 py-1 text-sm text-right bg-neutral-50 border border-neutral-200 rounded">
                    {fund.amount || "R 0"}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-neutral-600">Lump Sum Taken</Label>
                  <Input
                    value={fund.lumpSumTaken}
                    onChange={(e) => handleFieldChange("lumpSumTaken", e.target.value)}
                    className="h-8 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="R 0"
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600">Non-deductible Contribution</Label>
                  <Input
                    value={fund.nondeductibleContribution}
                    onChange={(e) => handleFieldChange("nondeductibleContribution", e.target.value)}
                    className="h-8 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="R 0"
                  />
                </div>
                <div>
                  <Label className="text-xs text-neutral-600">Living Annuity (Read-only)</Label>
                  <div className="h-8 px-3 py-1 text-sm text-right bg-neutral-50 border border-neutral-200 rounded">
                    {fund.livingAnnuity || ""}
                  </div>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-neutral-600">Income Term</Label>
                  <Input
                    value={fund.incomeTerm}
                    onChange={(e) => handleFieldChange("incomeTerm", e.target.value)}
                    className="h-8 text-sm text-right"
                    disabled={isUpdating}
                    placeholder="Income term"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}