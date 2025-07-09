import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { Beneficiary } from "@shared/schema";
import { nanoid } from "nanoid";

interface BeneficiaryRowManagerProps {
  coverAmount: string;
  beneficiaries: Beneficiary[];
  onBeneficiariesChange: (beneficiaries: Beneficiary[]) => void;
  isUpdating: boolean;
}

export function BeneficiaryRowManager({ 
  coverAmount, 
  beneficiaries, 
  onBeneficiariesChange, 
  isUpdating 
}: BeneficiaryRowManagerProps) {
  
  // Calculate cover amount as number for calculations
  const totalCoverAmount = useMemo(() => {
    const amount = parseFloat(coverAmount.replace(/[^\d.-]/g, '')) || 0;
    return amount;
  }, [coverAmount]);

  // Auto-adjust percentages to maintain 100% total
  const adjustPercentages = useCallback((updatedBeneficiaries: Beneficiary[]) => {
    if (updatedBeneficiaries.length === 0) return updatedBeneficiaries;
    
    const totalPercentage = updatedBeneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    
    if (totalPercentage === 0) {
      // If all percentages are 0, distribute equally
      const equalPercentage = 100 / updatedBeneficiaries.length;
      return updatedBeneficiaries.map(b => ({
        ...b,
        percentage: Math.round(equalPercentage * 100) / 100,
        coverSplit: `R ${Math.round((totalCoverAmount * equalPercentage / 100)).toLocaleString()}`
      }));
    }
    
    if (totalPercentage !== 100) {
      // Adjust all percentages proportionally to total 100%
      const adjustmentFactor = 100 / totalPercentage;
      return updatedBeneficiaries.map(b => {
        const adjustedPercentage = Math.round(b.percentage * adjustmentFactor * 100) / 100;
        return {
          ...b,
          percentage: adjustedPercentage,
          coverSplit: `R ${Math.round((totalCoverAmount * adjustedPercentage / 100)).toLocaleString()}`
        };
      });
    }
    
    // Update cover splits based on current percentages
    return updatedBeneficiaries.map(b => ({
      ...b,
      coverSplit: `R ${Math.round((totalCoverAmount * b.percentage / 100)).toLocaleString()}`
    }));
  }, [totalCoverAmount]);

  const handleAddBeneficiary = useCallback(() => {
    const newBeneficiary: Beneficiary = {
      id: nanoid(),
      name: "",
      percentage: 0,
      coverSplit: "R 0"
    };
    
    const updatedBeneficiaries = [...beneficiaries, newBeneficiary];
    const adjustedBeneficiaries = adjustPercentages(updatedBeneficiaries);
    onBeneficiariesChange(adjustedBeneficiaries);
  }, [beneficiaries, adjustPercentages, onBeneficiariesChange]);

  const handleRemoveBeneficiary = useCallback((id: string) => {
    const updatedBeneficiaries = beneficiaries.filter(b => b.id !== id);
    const adjustedBeneficiaries = adjustPercentages(updatedBeneficiaries);
    onBeneficiariesChange(adjustedBeneficiaries);
  }, [beneficiaries, adjustPercentages, onBeneficiariesChange]);

  const handleUpdateBeneficiary = useCallback((id: string, field: keyof Beneficiary, value: string | number) => {
    const updatedBeneficiaries = beneficiaries.map(b => {
      if (b.id === id) {
        if (field === 'percentage') {
          const percentage = Math.max(0, Math.min(100, Number(value) || 0));
          return { ...b, [field]: percentage };
        }
        return { ...b, [field]: value };
      }
      return b;
    });
    
    // Don't auto-adjust if user is actively editing percentages
    if (field === 'percentage') {
      // Just update cover splits
      const withUpdatedSplits = updatedBeneficiaries.map(b => ({
        ...b,
        coverSplit: `R ${Math.round((totalCoverAmount * b.percentage / 100)).toLocaleString()}`
      }));
      onBeneficiariesChange(withUpdatedSplits);
    } else {
      onBeneficiariesChange(updatedBeneficiaries);
    }
  }, [beneficiaries, totalCoverAmount, onBeneficiariesChange]);

  const totalPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
  const isPercentageValid = Math.abs(totalPercentage - 100) < 0.01;

  return (
    <div className="space-y-2">
      {/* Header Row */}
      <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 rounded text-sm font-medium text-gray-700">
        <div className="col-span-1"></div>
        <div className="col-span-5">BENEFICIARY</div>
        <div className="col-span-2 text-center">%</div>
        <div className="col-span-4 text-right">COVER SPLIT</div>
      </div>

      {/* Beneficiary Rows */}
      {beneficiaries.map((beneficiary, index) => (
        <div key={beneficiary.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-white border border-gray-200 rounded">
          {/* Remove Button */}
          <div className="col-span-1">
            {beneficiaries.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveBeneficiary(beneficiary.id)}
                disabled={isUpdating}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Beneficiary Name */}
          <div className="col-span-5">
            <Input
              value={beneficiary.name}
              onChange={(e) => handleUpdateBeneficiary(beneficiary.id, 'name', e.target.value)}
              placeholder="Enter beneficiary name"
              disabled={isUpdating}
              className="text-right"
            />
          </div>

          {/* Percentage */}
          <div className="col-span-2">
            <Input
              type="number"
              value={beneficiary.percentage}
              onChange={(e) => handleUpdateBeneficiary(beneficiary.id, 'percentage', e.target.value)}
              min="0"
              max="100"
              step="0.1"
              disabled={isUpdating}
              className="text-center"
            />
          </div>

          {/* Cover Split (Read-only) */}
          <div className="col-span-4">
            <div className="px-3 py-2 text-right text-sm font-medium text-gray-900 bg-gray-50 rounded border">
              {beneficiary.coverSplit}
            </div>
          </div>
        </div>
      ))}

      {/* Add Beneficiary Button */}
      <div className="flex justify-between items-center pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddBeneficiary}
          disabled={isUpdating || beneficiaries.length >= 10}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Beneficiary
        </Button>

        {/* Percentage Validation */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Total:</span>
          <span className={`text-sm font-medium px-2 py-1 rounded ${
            isPercentageValid 
              ? 'text-green-700 bg-green-100' 
              : 'text-red-700 bg-red-100'
          }`}>
            {totalPercentage.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Percentage Warning */}
      {!isPercentageValid && (
        <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
          ⚠️ Percentages should total 100%. Current total: {totalPercentage.toFixed(1)}%
        </div>
      )}
    </div>
  );
}