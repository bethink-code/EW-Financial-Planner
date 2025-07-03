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
    // All beneficiary badges use white background with orange text
    return "bg-white border border-neutral-300";
  };

  return (
    <div className="border border-neutral-200 rounded-lg bg-white">
      <div 
        className="p-4 cursor-pointer hover:bg-neutral-50 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="text-teal-600">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            <h3 className="text-base font-semibold text-neutral-900">{fund.description}</h3>
            <Badge className={`${getOwnerBadgeColor(fund.owner)} text-xs px-2 py-0.5`} style={{ color: '#EA8A2E' }}>
              {fund.owner}
            </Badge>
          </div>
        </div>

        {/* Compact Summary Row */}
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-neutral-500 text-xs">Cover Amount:</span>
            <div className="font-medium">{fund.coverAmount}</div>
          </div>
          <div>
            <span className="text-neutral-500 text-xs">Monthly Income:</span>
            <div className="font-medium">{fund.monthlyIncome}</div>
          </div>
          <div>
            <span className="text-neutral-500 text-xs">Fund Value:</span>
            <div className="font-medium">{fund.fundValue}</div>
          </div>
          <div>
            <span className="text-neutral-500 text-xs">Beneficiary:</span>
            <div className="font-medium">{fund.beneficiaryName}</div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-neutral-200 p-4 space-y-4">
          {/* Overview Section */}
          <div className="bg-teal-50 rounded-lg p-2">
            <h4 className="text-sm font-bold text-teal-700 mb-3">Overview</h4>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <Label className="text-xs text-neutral-600">Description</Label>
                <Input
                  value={fund.description}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  className="h-7 text-xs text-right"
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
                  <SelectTrigger className="h-7 text-xs">
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
              <div>
                <Label className="text-xs text-neutral-600">Cover Amount</Label>
                <Input
                  value={fund.coverAmount}
                  onChange={(e) => handleFieldChange("coverAmount", e.target.value)}
                  className="h-7 text-xs text-right"
                  disabled={isUpdating}
                  placeholder="R 0"
                />
              </div>
              <div>
                <Label className="text-xs text-neutral-600">Beneficiary</Label>
                <Input
                  value={fund.beneficiary}
                  onChange={(e) => handleFieldChange("beneficiary", e.target.value)}
                  className="h-7 text-xs text-right"
                  disabled={isUpdating}
                />
              </div>
            </div>
          </div>

          {/* Additional Fields Section */}
          <div className="bg-teal-50 rounded-lg p-2">
            <h4 className="text-sm font-bold text-teal-600 mb-3">Additional Details</h4>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <Label className="text-xs text-neutral-600">% Split</Label>
                <Input
                  value={fund.beneficiaryPercentage}
                  onChange={(e) => handleFieldChange("beneficiaryPercentage", e.target.value)}
                  className="h-7 text-xs text-right"
                  disabled={isUpdating}
                  placeholder="100%"
                />
              </div>
              <div>
                <Label className="text-xs text-neutral-600">Cover Split</Label>
                <Input
                  value={fund.coverSplit}
                  onChange={(e) => handleFieldChange("coverSplit", e.target.value)}
                  className="h-7 text-xs text-right"
                  disabled={isUpdating}
                  placeholder="R 0"
                />
              </div>
              <div>
                <Label className="text-xs text-neutral-600">Term Years</Label>
                <Input
                  value={fund.termYears}
                  onChange={(e) => handleFieldChange("termYears", e.target.value)}
                  className="h-7 text-xs text-right"
                  disabled={isUpdating}
                />
              </div>
              <div>
                <Label className="text-xs text-neutral-600">Increase %</Label>
                <Input
                  value={fund.increasePercentage}
                  onChange={(e) => handleFieldChange("increasePercentage", e.target.value)}
                  className="h-7 text-xs text-right"
                  disabled={isUpdating}
                  placeholder="5%"
                />
              </div>
            </div>
          </div>

          {/* Financial Values Section */}
          <div className="bg-teal-50 rounded-lg p-2">
            <h4 className="text-sm font-bold text-teal-800 mb-3">Financial Values</h4>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <Label className="text-xs text-neutral-600">Monthly Income</Label>
                <Input
                  value={fund.monthlyIncome}
                  onChange={(e) => handleFieldChange("monthlyIncome", e.target.value)}
                  className="h-7 text-xs text-right"
                  disabled={isUpdating}
                  placeholder="R 0"
                />
              </div>
              <div>
                <Label className="text-xs text-neutral-600">Approved Cover</Label>
                <Input
                  value={fund.approvedLifeCover}
                  onChange={(e) => handleFieldChange("approvedLifeCover", e.target.value)}
                  className="h-7 text-xs text-right"
                  disabled={isUpdating}
                  placeholder="R 0"
                />
              </div>
              <div>
                <Label className="text-xs text-neutral-600">Fund Value</Label>
                <Input
                  value={fund.fundValue}
                  onChange={(e) => handleFieldChange("fundValue", e.target.value)}
                  className="h-7 text-xs text-right"
                  disabled={isUpdating}
                  placeholder="R 0"
                />
              </div>
              <div>
                <Label className="text-xs text-neutral-600">Value at Death</Label>
                <Input
                  value={fund.fundValueAtDeath}
                  onChange={(e) => handleFieldChange("fundValueAtDeath", e.target.value)}
                  className="h-7 text-xs text-right"
                  disabled={isUpdating}
                  placeholder="R 0"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-neutral-600 mb-1">Fund Value</Label>
                <Input
                  value={fund.fundValue}
                  onChange={(e) => handleFieldChange("fundValue", e.target.value)}
                  className="h-8 text-xs"
                  disabled={isUpdating}
                  placeholder="R 0"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-neutral-600 mb-1">Value at Death</Label>
                <Input
                  value={fund.fundValueAtDeath}
                  onChange={(e) => handleFieldChange("fundValueAtDeath", e.target.value)}
                  className="h-8 text-xs"
                  disabled={isUpdating}
                  placeholder="R 0"
                />
              </div>
            </div>
          </div>

          {/* Fund Value Beneficiaries Section */}
          <div className="bg-orange-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-orange-700 mb-3">Fund Value Beneficiaries</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-medium text-neutral-600 mb-1">Name</Label>
                <Input
                  value={fund.beneficiaryName}
                  onChange={(e) => handleFieldChange("beneficiaryName", e.target.value)}
                  className="h-8 text-xs"
                  disabled={isUpdating}
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-neutral-600 mb-1">% Split</Label>
                <Input
                  value={fund.beneficiaryPercentageSplit}
                  onChange={(e) => handleFieldChange("beneficiaryPercentageSplit", e.target.value)}
                  className="h-8 text-xs"
                  disabled={isUpdating}
                  placeholder="100%"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-neutral-600 mb-1">Amount</Label>
                <Input
                  value={fund.amount}
                  onChange={(e) => handleFieldChange("amount", e.target.value)}
                  className="h-8 text-xs"
                  disabled={isUpdating}
                  placeholder="R 0"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-neutral-600 mb-1">Lump Sum Taken</Label>
                <Input
                  value={fund.lumpSumTaken}
                  onChange={(e) => handleFieldChange("lumpSumTaken", e.target.value)}
                  className="h-8 text-xs"
                  disabled={isUpdating}
                  placeholder="R 0"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-neutral-600 mb-1">Nondeductible Contribution</Label>
                <Input
                  value={fund.nondeductibleContribution}
                  onChange={(e) => handleFieldChange("nondeductibleContribution", e.target.value)}
                  className="h-8 text-xs"
                  disabled={isUpdating}
                  placeholder="R 0"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-neutral-600 mb-1">Living Annuity</Label>
                <Input
                  value={fund.livingAnnuity}
                  onChange={(e) => handleFieldChange("livingAnnuity", e.target.value)}
                  className="h-8 text-xs"
                  disabled={isUpdating}
                  placeholder="R 0"
                />
              </div>
              <div className="col-span-full">
                <Label className="text-xs font-medium text-neutral-600 mb-1">Income Term</Label>
                <Input
                  value={fund.incomeTerm}
                  onChange={(e) => handleFieldChange("incomeTerm", e.target.value)}
                  className="h-8 text-xs"
                  disabled={isUpdating}
                  placeholder="20 years"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}