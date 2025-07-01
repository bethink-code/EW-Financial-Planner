import { MoreVertical, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const owners = ["John Doe", "Jane Smith"];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-900">{fund.description}</h3>
        <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Basic Information Section */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-3">Basic Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-neutral-600 mb-1">Owner</Label>
              <Select
                value={fund.owner}
                onValueChange={(value) => handleFieldChange("owner", value)}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-full">
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
              <Label className="text-xs font-medium text-neutral-600 mb-1">Cover Against</Label>
              <Input
                value={fund.coverAgainst}
                onChange={(e) => handleFieldChange("coverAgainst", e.target.value)}
                className="w-full"
                disabled={isUpdating}
              />
            </div>
          </div>
        </div>

        {/* Death Benefits Section */}
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-900 mb-3">Death Benefits</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-neutral-600 mb-1">Monthly Death</Label>
              <Input
                type="number"
                value={fund.monthlyDeathBenefit}
                onChange={(e) => handleFieldChange("monthlyDeathBenefit", e.target.value)}
                className="w-full"
                disabled={isUpdating}
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-neutral-600 mb-1">Lump Sum Death</Label>
              <Input
                type="number"
                value={fund.lumpSumDeath}
                onChange={(e) => handleFieldChange("lumpSumDeath", e.target.value)}
                className="w-full"
                disabled={isUpdating}
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-neutral-600 mb-1">Previous Lump</Label>
              <Input
                type="number"
                value={fund.previousLumpSums}
                onChange={(e) => handleFieldChange("previousLumpSums", e.target.value)}
                className="w-full"
                disabled={isUpdating}
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-neutral-600 mb-1">Tax Free Amount</Label>
              <Input
                type="number"
                value={fund.taxFreeAmount}
                onChange={(e) => handleFieldChange("taxFreeAmount", e.target.value)}
                className="w-full"
                disabled={isUpdating}
              />
            </div>
          </div>
        </div>

        {/* Financial Details Section */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-900 mb-3">Financial Details</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-neutral-600 mb-1">Fund Value</Label>
              <Input
                type="number"
                value={fund.fundValue}
                onChange={(e) => handleFieldChange("fundValue", e.target.value)}
                className="w-full"
                disabled={isUpdating}
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-neutral-600 mb-1">Value at Death</Label>
              <Input
                type="number"
                value={fund.fundValueAtDeath}
                onChange={(e) => handleFieldChange("fundValueAtDeath", e.target.value)}
                className="w-full"
                disabled={isUpdating}
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-neutral-600 mb-1">Name</Label>
              <Input
                value={fund.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="Enter name"
                className="w-full"
                disabled={isUpdating}
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-neutral-600 mb-1">Amount</Label>
              <Input
                type="number"
                value={fund.amount}
                onChange={(e) => handleFieldChange("amount", e.target.value)}
                placeholder="0"
                className="w-full"
                disabled={isUpdating}
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs font-medium text-neutral-600 mb-1">Lump Sum</Label>
              <Input
                type="number"
                value={fund.lumpSumTaken}
                onChange={(e) => handleFieldChange("lumpSumTaken", e.target.value)}
                placeholder="0"
                className="w-full"
                disabled={isUpdating}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4 pt-4 border-t border-neutral-200">
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80"
          disabled={isUpdating}
        >
          <Save className="mr-1" size={16} />
          {isUpdating ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
