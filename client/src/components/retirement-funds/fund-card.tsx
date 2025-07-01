import { MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RetirementFund, UpdateRetirementFund } from "@shared/schema";

interface FundCardProps {
  fund: RetirementFund;
  onFieldUpdate: (id: number, field: keyof UpdateRetirementFund, value: string) => void;
  isUpdating: boolean;
}

export function FundCard({ fund, onFieldUpdate, isUpdating }: FundCardProps) {
  const handleFieldChange = (field: keyof UpdateRetirementFund, value: string) => {
    onFieldUpdate(fund.id, field, value);
  };

  const owners = ["John Doe", "Jane Smith", "Sarah Johnson", "David Wilson"];

  return (
    <div className="bg-white rounded shadow-sm border border-neutral-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-neutral-900">{fund.description}</h3>
        <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>
      
      <div className="space-y-3">
        {/* Overview Section */}
        <div style={{ backgroundColor: '#EDEDED' }} className="rounded p-2">
          <h4 className="text-xs font-medium text-neutral-700 mb-2">Overview</h4>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs text-neutral-600">Description</Label>
              <Input
                value={fund.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                className="h-7 text-xs"
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
          </div>
        </div>

        {/* Unapproved Life Cover Section */}
        <div style={{ backgroundColor: '#CBE7F6' }} className="rounded p-2">
          <h4 className="text-xs font-medium text-neutral-700 mb-2">Unapproved Life Cover</h4>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs text-neutral-600">Beneficiary</Label>
              <Input
                value={fund.beneficiary}
                onChange={(e) => handleFieldChange("beneficiary", e.target.value)}
                className="h-7 text-xs"
                disabled={isUpdating}
              />
            </div>
            <div>
              <Label className="text-xs text-neutral-600">% Split</Label>
              <Input
                value={fund.beneficiaryPercentage}
                onChange={(e) => handleFieldChange("beneficiaryPercentage", e.target.value)}
                className="h-7 text-xs text-center"
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
          </div>
        </div>

        {/* Monthly Death Benefit Section */}
        <div style={{ backgroundColor: '#EDEDED' }} className="rounded p-2">
          <h4 className="text-xs font-medium text-neutral-700 mb-2">Monthly Death Benefit</h4>
          <div className="grid grid-cols-3 gap-2">
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
              <Label className="text-xs text-neutral-600">Term Years</Label>
              <Input
                value={fund.termYears}
                onChange={(e) => handleFieldChange("termYears", e.target.value)}
                className="h-7 text-xs text-center"
                disabled={isUpdating}
              />
            </div>
            <div>
              <Label className="text-xs text-neutral-600">Increase %</Label>
              <Input
                value={fund.increasePercentage}
                onChange={(e) => handleFieldChange("increasePercentage", e.target.value)}
                className="h-7 text-xs text-center"
                disabled={isUpdating}
                placeholder="5%"
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
          </div>
        </div>

        {/* Fund Value Beneficiaries Section */}
        <div style={{ backgroundColor: '#CBE7F6' }} className="rounded p-2">
          <h4 className="text-xs font-medium text-neutral-700 mb-2">Fund Value Beneficiaries</h4>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs text-neutral-600">Name</Label>
              <Input
                value={fund.beneficiaryName}
                onChange={(e) => handleFieldChange("beneficiaryName", e.target.value)}
                className="h-7 text-xs"
                disabled={isUpdating}
              />
            </div>
            <div>
              <Label className="text-xs text-neutral-600">% Split</Label>
              <Input
                value={fund.beneficiaryPercentageSplit}
                onChange={(e) => handleFieldChange("beneficiaryPercentageSplit", e.target.value)}
                className="h-7 text-xs text-center"
                disabled={isUpdating}
                placeholder="100%"
              />
            </div>
            <div>
              <Label className="text-xs text-neutral-600">Amount</Label>
              <Input
                value={fund.amount}
                onChange={(e) => handleFieldChange("amount", e.target.value)}
                className="h-7 text-xs text-right"
                disabled={isUpdating}
                placeholder="R 0"
              />
            </div>
            <div>
              <Label className="text-xs text-neutral-600">Lump Sum Taken</Label>
              <Input
                value={fund.lumpSumTaken}
                onChange={(e) => handleFieldChange("lumpSumTaken", e.target.value)}
                className="h-7 text-xs text-right"
                disabled={isUpdating}
                placeholder="R 0"
              />
            </div>
            <div>
              <Label className="text-xs text-neutral-600">Nondeductible</Label>
              <Input
                value={fund.nondeductibleContribution}
                onChange={(e) => handleFieldChange("nondeductibleContribution", e.target.value)}
                className="h-7 text-xs text-right"
                disabled={isUpdating}
                placeholder="R 0"
              />
            </div>
            <div>
              <Label className="text-xs text-neutral-600">Living Annuity</Label>
              <Input
                value={fund.livingAnnuity}
                onChange={(e) => handleFieldChange("livingAnnuity", e.target.value)}
                className="h-7 text-xs text-right"
                disabled={isUpdating}
                placeholder="R 0"
              />
            </div>
            <div className="col-span-full">
              <Label className="text-xs text-neutral-600">Income Term</Label>
              <Input
                value={fund.incomeTerm}
                onChange={(e) => handleFieldChange("incomeTerm", e.target.value)}
                className="h-7 text-xs text-center"
                disabled={isUpdating}
                placeholder="20 years"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}