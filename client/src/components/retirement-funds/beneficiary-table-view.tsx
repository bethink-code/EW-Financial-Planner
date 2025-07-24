import React, { useMemo, useCallback } from "react";
import { RetirementFund, UpdateRetirementFund, Beneficiary } from "@shared/schema";
import { parseBeneficiaries } from "@/lib/beneficiaries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { AddButton, DeleteButton } from "@/components/ui/action-buttons";
import { nanoid } from "nanoid";

interface BeneficiaryTableViewProps {
  funds: RetirementFund[];
  onFieldUpdate: (id: number, field: keyof UpdateRetirementFund, value: string) => void;
  isUpdating: boolean;
}

export function BeneficiaryTableView({ funds, onFieldUpdate, isUpdating }: BeneficiaryTableViewProps) {
  
  // Get all unique beneficiaries across all funds
  const allBeneficiaryData = useMemo(() => {
    const fundBeneficiaries = funds.map(fund => ({
      fundId: fund.id,
      fundDescription: fund.description,
      coverAmount: fund.coverAmount,
      beneficiaries: parseBeneficiaries(fund.beneficiaries)
    }));
    
    return fundBeneficiaries;
  }, [funds]);

  // Get the maximum number of beneficiaries across all funds for table structure
  const maxBeneficiaries = useMemo(() => {
    return Math.max(1, ...allBeneficiaryData.map(f => f.beneficiaries.length));
  }, [allBeneficiaryData]);

  const handleBeneficiaryUpdate = useCallback((fundId: number, beneficiaryIndex: number, field: keyof Beneficiary, value: string | number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;

    const currentBeneficiaries = parseBeneficiaries(fund.beneficiaries);
    const updatedBeneficiaries = [...currentBeneficiaries];
    
    if (updatedBeneficiaries[beneficiaryIndex]) {
      if (field === 'percentage') {
        updatedBeneficiaries[beneficiaryIndex] = {
          ...updatedBeneficiaries[beneficiaryIndex],
          [field]: Math.max(0, Math.min(100, Number(value) || 0))
        };
      } else {
        updatedBeneficiaries[beneficiaryIndex] = {
          ...updatedBeneficiaries[beneficiaryIndex],
          [field]: value
        };
      }

      // Update cover splits when percentages change
      if (field === 'percentage') {
        const coverAmount = parseFloat(fund.coverAmount.replace(/[^\d.-]/g, '')) || 0;
        updatedBeneficiaries[beneficiaryIndex].coverSplit = 
          `R ${Math.round((coverAmount * updatedBeneficiaries[beneficiaryIndex].percentage / 100)).toLocaleString()}`;
      }

      onFieldUpdate(fundId, 'beneficiaries', JSON.stringify(updatedBeneficiaries));
    }
  }, [funds, onFieldUpdate]);

  const handleAddBeneficiary = useCallback((fundId: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;

    const currentBeneficiaries = parseBeneficiaries(fund.beneficiaries);
    const newBeneficiary: Beneficiary = {
      id: nanoid(),
      name: "",
      percentage: 0,
      coverSplit: "R 0"
    };

    const updatedBeneficiaries = [...currentBeneficiaries, newBeneficiary];
    onFieldUpdate(fundId, 'beneficiaries', JSON.stringify(updatedBeneficiaries));
  }, [funds, onFieldUpdate]);

  const handleRemoveBeneficiary = useCallback((fundId: number, beneficiaryIndex: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;

    const currentBeneficiaries = parseBeneficiaries(fund.beneficiaries);
    if (currentBeneficiaries.length <= 1) return; // Don't remove if it's the last one

    const updatedBeneficiaries = currentBeneficiaries.filter((_, index) => index !== beneficiaryIndex);
    
    // Auto-adjust percentages
    const totalPercentage = updatedBeneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    if (totalPercentage > 0 && totalPercentage !== 100) {
      const adjustmentFactor = 100 / totalPercentage;
      const coverAmount = parseFloat(fund.coverAmount.replace(/[^\d.-]/g, '')) || 0;
      
      updatedBeneficiaries.forEach(b => {
        b.percentage = Math.round(b.percentage * adjustmentFactor * 100) / 100;
        b.coverSplit = `R ${Math.round((coverAmount * b.percentage / 100)).toLocaleString()}`;
      });
    }

    onFieldUpdate(fundId, 'beneficiaries', JSON.stringify(updatedBeneficiaries));
  }, [funds, onFieldUpdate]);

  return (
    <div style={{ backgroundColor: '#F0F9FF' }} className="border border-teal-200 rounded-lg p-4">
      <h3 className="table-text-14 font-semibold text-teal-800 mb-3">Unapproved Life Cover - Beneficiaries</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-teal-200">
              <th className="text-left p-2 w-32">Client name</th>
              <th className="text-right p-2 w-24">Cover Amount</th>
              {Array.from({ length: maxBeneficiaries }, (_, i) => (
                <React.Fragment key={i}>
                  <th className="text-left p-2 w-32">Beneficiary {i + 1}</th>
                  <th className="text-center p-2 w-16">%</th>
                  <th className="text-right p-2 w-24">Cover Split</th>
                  <th className="text-center p-2 w-12">Actions</th>
                </React.Fragment>
              ))}
              <th className="text-center p-2 w-16">Add</th>
            </tr>
          </thead>
          <tbody>
            {allBeneficiaryData.map((fundData, index) => (
              <tr key={fundData.fundId} className={index % 2 === 0 ? "bg-white" : "bg-teal-50/30"}>
                <td className="p-2">{fundData.fundDescription}</td>
                <td className="p-2 text-right font-medium">{fundData.coverAmount}</td>
                
                {Array.from({ length: maxBeneficiaries }, (_, beneficiaryIndex) => {
                  const beneficiary = fundData.beneficiaries[beneficiaryIndex];
                  return (
                    <React.Fragment key={beneficiaryIndex}>
                      {/* Beneficiary Name */}
                      <td className="p-2">
                        {beneficiary ? (
                          <Input
                            value={beneficiary.name}
                            onChange={(e) => handleBeneficiaryUpdate(fundData.fundId, beneficiaryIndex, 'name', e.target.value)}
                            placeholder="Beneficiary name"
                            disabled={isUpdating}
                            className="h-6 text-xs text-right bg-[#F2F7FB] border-none focus:bg-white focus:border focus:border-primary"
                          />
                        ) : (
                          <div className="h-6"></div>
                        )}
                      </td>
                      
                      {/* Percentage */}
                      <td className="p-2">
                        {beneficiary ? (
                          <Input
                            type="number"
                            value={beneficiary.percentage}
                            onChange={(e) => handleBeneficiaryUpdate(fundData.fundId, beneficiaryIndex, 'percentage', e.target.value)}
                            min="0"
                            max="100"
                            step="0.1"
                            disabled={isUpdating}
                            className="h-6 text-xs text-center bg-[#F2F7FB] border-none focus:bg-white focus:border focus:border-primary"
                          />
                        ) : (
                          <div className="h-6"></div>
                        )}
                      </td>
                      
                      {/* Cover Split */}
                      <td className="p-2">
                        {beneficiary ? (
                          <div className="h-6 text-xs text-right px-2 py-1 bg-gray-50 border rounded">
                            {beneficiary.coverSplit}
                          </div>
                        ) : (
                          <div className="h-6"></div>
                        )}
                      </td>
                      
                      {/* Remove Button */}
                      <td className="p-2 text-center">
                        {beneficiary && fundData.beneficiaries.length > 1 ? (
                          <DeleteButton
                            onClick={() => handleRemoveBeneficiary(fundData.fundId, beneficiaryIndex)}
                            disabled={isUpdating}
                          />
                        ) : (
                          <div className="h-6"></div>
                        )}
                      </td>
                    </React.Fragment>
                  );
                })}
                
                {/* Add Beneficiary Button */}
                <td className="p-2 text-center">
                  <AddButton
                    onClick={() => handleAddBeneficiary(fundData.fundId)}
                    disabled={isUpdating || fundData.beneficiaries.length >= 10}
                  />
                </td>
              </tr>
            ))}
            
            {/* Totals row */}
            <tr className="bg-gray-100 font-bold border-t-2 border-neutral-300">
              <td className="p-2 font-bold">Total</td>
              <td className="p-2 text-right font-bold">
                R {allBeneficiaryData.reduce((total, fund) => {
                  const amount = parseFloat(fund.coverAmount.replace(/[^\d.-]/g, '')) || 0;
                  return total + amount;
                }, 0).toLocaleString()}
              </td>
              {Array.from({ length: maxBeneficiaries }, (_, i) => (
                <React.Fragment key={i}>
                  <td className="p-2"></td>
                  <td className="p-2"></td>
                  <td className="p-2"></td>
                  <td className="p-2"></td>
                </React.Fragment>
              ))}
              <td className="p-2"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}