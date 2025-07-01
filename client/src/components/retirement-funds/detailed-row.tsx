import { useState } from "react";
import { ChevronRight, ChevronDown, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { RetirementFund, UpdateRetirementFund } from "@shared/schema";

interface DetailedRowProps {
  fund: RetirementFund;
  onFieldUpdate: (id: number, field: keyof UpdateRetirementFund, value: string) => void;
  isUpdating: boolean;
}

export function DetailedRow({ fund, onFieldUpdate, isUpdating }: DetailedRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFieldChange = (field: keyof UpdateRetirementFund, value: string) => {
    onFieldUpdate(fund.id, field, value);
  };

  const owners = ["John Doe", "Jane Smith", "Sarah Johnson", "David Wilson"];
  const getOwnerBadgeColor = (owner: string) => {
    switch (owner) {
      case "John Doe": return "bg-teal-100 text-teal-800";
      case "Jane Smith": return "bg-orange-100 text-orange-800";
      case "Sarah Johnson": return "bg-teal-100 text-teal-700";
      default: return "bg-neutral-100 text-neutral-800";
    }
  };

  return (
    <div className="border border-neutral-200 rounded-lg bg-white">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-teal-600 hover:text-teal-700 transition-colors"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            <h3 className="text-base font-semibold text-neutral-900">{fund.description}</h3>
            <Badge className={`${getOwnerBadgeColor(fund.owner)} text-xs px-2 py-0.5`}>
              {fund.owner}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
              <Edit size={14} />
            </button>
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
          <div className="bg-teal-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-teal-700 mb-3">Overview</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-medium text-neutral-600 mb-1">Description</Label>
                <Input
                  value={fund.description}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  className="h-8 text-xs"
                  disabled={isUpdating}
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-neutral-600 mb-1">Owner</Label>
                <Select
                  value={fund.owner}
                  onValueChange={(value) => handleFieldChange("owner", value)}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="h-8 text-xs">
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
                <Label className="text-xs font-medium text-neutral-600 mb-1">Cover Amount</Label>
                <Input
                  value={fund.coverAmount}
                  onChange={(e) => handleFieldChange("coverAmount", e.target.value)}
                  className="h-8 text-xs"
                  disabled={isUpdating}
                  placeholder="R 0"
                />
              </div>
            </div>
          </div>

          {/* Unapproved Life Cover Section */}
          <div className="bg-teal-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-teal-600 mb-3">Unapproved Life Cover</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-medium text-neutral-600 mb-1">Beneficiary</Label>
                <Input
                  value={fund.beneficiary}
                  onChange={(e) => handleFieldChange("beneficiary", e.target.value)}
                  className="h-8 text-xs"
                  disabled={isUpdating}
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-neutral-600 mb-1">% Split</Label>
                <Input
                  value={fund.beneficiaryPercentage}
                  onChange={(e) => handleFieldChange("beneficiaryPercentage", e.target.value)}
                  className="h-8 text-xs"
                  disabled={isUpdating}
                  placeholder="100%"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-neutral-600 mb-1">Cover Split</Label>
                <Input
                  value={fund.coverSplit}
                  onChange={(e) => handleFieldChange("coverSplit", e.target.value)}
                  className="h-8 text-xs"
                  disabled={isUpdating}
                  placeholder="R 0"
                />
              </div>
            </div>
          </div>

          {/* Monthly Death Benefit Section */}
          <div className="bg-teal-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-teal-800 mb-3">Monthly Death Benefit</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-medium text-neutral-600 mb-1">Monthly Income</Label>
                <Input
                  value={fund.monthlyIncome}
                  onChange={(e) => handleFieldChange("monthlyIncome", e.target.value)}
                  className="h-8 text-xs"
                  disabled={isUpdating}
                  placeholder="R 0"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-neutral-600 mb-1">Term Years</Label>
                <Input
                  value={fund.termYears}
                  onChange={(e) => handleFieldChange("termYears", e.target.value)}
                  className="h-8 text-xs"
                  disabled={isUpdating}
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-neutral-600 mb-1">Increase %</Label>
                <Input
                  value={fund.increasePercentage}
                  onChange={(e) => handleFieldChange("increasePercentage", e.target.value)}
                  className="h-8 text-xs"
                  disabled={isUpdating}
                  placeholder="5%"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-neutral-600 mb-1">Approved Life Cover</Label>
                <Input
                  value={fund.approvedLifeCover}
                  onChange={(e) => handleFieldChange("approvedLifeCover", e.target.value)}
                  className="h-8 text-xs"
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