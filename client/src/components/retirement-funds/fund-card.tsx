import { MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RetirementFund, UpdateRetirementFund } from "@shared/schema";

interface ColumnVisibility {
  overview: boolean;
  unapprovedLifeCover: boolean;
  monthlyDeathBenefit: boolean;
  fundValue: boolean;
  fundValueBeneficiaries: boolean;
}

interface FundCardProps {
  fund: RetirementFund;
  columnVisibility: ColumnVisibility;
  onFieldUpdate: (id: number, field: keyof UpdateRetirementFund, value: string) => void;
  isUpdating: boolean;
}

export function FundCard({ fund, columnVisibility, onFieldUpdate, isUpdating }: FundCardProps) {
  const handleFieldChange = (field: keyof UpdateRetirementFund, value: string) => {
    onFieldUpdate(fund.id, field, value);
  };

  const owners = ["John Doe", "Jane Smith", "Sarah Johnson", "David Wilson"];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-neutral-900">{fund.description}</h2>
        <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>
      
      <div className="space-y-3">
        {/* Overview Section */}
        {columnVisibility.overview && (
          <div style={{ backgroundColor: '#EFF5F9' }} className="rounded-lg p-3">
            <h3 className="text-sm font-bold text-neutral-800 mb-3">Overview</h3>
            <div className="grid grid-cols-2 gap-2">
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
            </div>
          </div>
        )}

        {/* Unapproved Life Cover Section */}
        {columnVisibility.unapprovedLifeCover && (
          <div style={{ backgroundColor: '#EFF5F9' }} className="rounded-lg p-3">
            <h3 className="text-sm font-bold text-neutral-800 mb-3">Unapproved Life Cover</h3>
            <div className="grid grid-cols-2 gap-2">
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
                <Select
                  value={fund.beneficiary || ""}
                  onValueChange={(value) => handleFieldChange("beneficiary", value)}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="h-7 text-xs">
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
            </div>
          </div>
        )}

        {/* Monthly Death Benefit Section */}
        {columnVisibility.monthlyDeathBenefit && (
          <div style={{ backgroundColor: '#EFF5F9' }} className="rounded-lg p-3">
            <h3 className="text-sm font-bold text-neutral-800 mb-3">Monthly Death Benefit</h3>
            <div className="grid grid-cols-2 gap-2">
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
              <div>
                <Label className="text-xs text-neutral-600">Escalation Amount</Label>
                <Input
                  value={fund.lumpSumDeath}
                  onChange={(e) => handleFieldChange("lumpSumDeath", e.target.value)}
                  className="h-7 text-xs text-right"
                  disabled={isUpdating}
                  placeholder="R 0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Fund Value Section */}
        {columnVisibility.fundValue && (
          <div style={{ backgroundColor: '#EFF5F9' }} className="rounded-lg p-3">
            <h3 className="text-sm font-bold text-neutral-800 mb-3">Fund Value</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-neutral-600">Approved Life Cover</Label>
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
              <div className="col-span-2">
                <Label className="text-xs text-neutral-600">Fund Value at Death</Label>
                <div className="h-7 px-3 py-1 text-xs text-right bg-neutral-50 border border-neutral-200 rounded">
                  {fund.fundValueAtDeath || "R 0"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fund Value Beneficiaries Section */}
        {columnVisibility.fundValueBeneficiaries && (
          <div style={{ backgroundColor: '#EFF5F9' }} className="rounded-lg p-3">
            <h3 className="text-sm font-bold text-neutral-800 mb-3">Fund Value Beneficiaries</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-neutral-600">Beneficiary Name</Label>
                <Select
                  value={fund.beneficiaryName || ""}
                  onValueChange={(value) => handleFieldChange("beneficiaryName", value)}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="h-7 text-xs">
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
                  className="h-7 text-xs text-right"
                  disabled={isUpdating}
                  placeholder="0%"
                />
              </div>
              <div>
                <Label className="text-xs text-neutral-600">Amount (Read-only)</Label>
                <div className="h-7 px-3 py-1 text-xs text-right bg-neutral-50 border border-neutral-200 rounded">
                  {fund.amount || "R 0"}
                </div>
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
                <Label className="text-xs text-neutral-600">Non-deductible Contribution</Label>
                <Input
                  value={fund.nondeductibleContribution}
                  onChange={(e) => handleFieldChange("nondeductibleContribution", e.target.value)}
                  className="h-7 text-xs text-right"
                  disabled={isUpdating}
                  placeholder="R 0"
                />
              </div>
              <div>
                <Label className="text-xs text-neutral-600">Living Annuity (Read-only)</Label>
                <div className="h-7 px-3 py-1 text-xs text-right bg-neutral-50 border border-neutral-200 rounded">
                  {fund.livingAnnuity || ""}
                </div>
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-neutral-600">Income Term</Label>
                <Input
                  value={fund.incomeTerm}
                  onChange={(e) => handleFieldChange("incomeTerm", e.target.value)}
                  className="h-7 text-xs text-right"
                  disabled={isUpdating}
                  placeholder="Income term"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}