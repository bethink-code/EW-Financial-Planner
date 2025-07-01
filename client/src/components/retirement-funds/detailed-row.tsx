import { useState } from "react";
import { ChevronRight, ChevronDown, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const owners = ["John Doe", "Jane Smith"];
  const getOwnerBadgeColor = (owner: string) => {
    return owner === "John Doe" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800";
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
          <h3 className="text-lg font-semibold text-neutral-900">{fund.description}</h3>
          <Badge className={getOwnerBadgeColor(fund.owner)}>
            Owner: {fund.owner}
          </Badge>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-neutral-500">Last updated: 2 hours ago</span>
          <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
            <Edit size={18} />
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Fund Value</div>
          <div className="text-lg font-semibold text-neutral-900">${fund.fundValue}</div>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Monthly Death</div>
          <div className="text-lg font-semibold text-neutral-900">${fund.monthlyDeathBenefit}</div>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Lump Sum Death</div>
          <div className="text-lg font-semibold text-neutral-900">${fund.lumpSumDeath}</div>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Tax Free Amount</div>
          <div className="text-lg font-semibold text-neutral-900">${fund.taxFreeAmount}</div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-neutral-200 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-neutral-900 border-b border-neutral-200 pb-2">Basic Information</h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-neutral-600 mb-1">Description</Label>
                  <Input
                    value={fund.description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    className="w-full"
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

            {/* Death Benefits */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-neutral-900 border-b border-neutral-200 pb-2">Death Benefits</h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-neutral-600 mb-1">Monthly Death Benefit</Label>
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
                  <Label className="text-xs font-medium text-neutral-600 mb-1">Previous Lump Sums</Label>
                  <Input
                    type="number"
                    value={fund.previousLumpSums}
                    onChange={(e) => handleFieldChange("previousLumpSums", e.target.value)}
                    className="w-full"
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-neutral-600 mb-1">Additional Tax Free Amount</Label>
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

            {/* Financial Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-neutral-900 border-b border-neutral-200 pb-2">Financial Details</h4>
              <div className="space-y-3">
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
                  <Label className="text-xs font-medium text-neutral-600 mb-1">Fund Value at Death</Label>
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
                <div>
                  <Label className="text-xs font-medium text-neutral-600 mb-1">Lump Sum Taken</Label>
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

          <div className="flex justify-end mt-6 pt-4 border-t border-neutral-200">
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                Cancel
              </Button>
              <Button size="sm" disabled={isUpdating}>
                <Save className="mr-2" size={16} />
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
