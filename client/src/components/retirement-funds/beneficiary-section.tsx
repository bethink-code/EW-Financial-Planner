import React, { useCallback, useMemo } from "react";
import { RetirementFund, Beneficiary } from "@shared/schema";
import { BeneficiaryRowManager } from "./beneficiary-row-manager";
import { parseBeneficiaries, stringifyBeneficiaries } from "@/lib/beneficiaries";

interface BeneficiarySectionProps {
  fund: RetirementFund;
  onFieldUpdate: (id: number, field: 'beneficiaries', value: string) => void;
  isUpdating: boolean;
  tableMode?: "inputs" | "flows";
}

export function BeneficiarySection({ 
  fund, 
  onFieldUpdate, 
  isUpdating,
  tableMode = "inputs" 
}: BeneficiarySectionProps) {
  
  const beneficiaries = useMemo(() => {
    return parseBeneficiaries(fund.beneficiaries);
  }, [fund.beneficiaries]);

  const handleBeneficiariesChange = useCallback((updatedBeneficiaries: Beneficiary[]) => {
    const beneficiariesJson = stringifyBeneficiaries(updatedBeneficiaries);
    onFieldUpdate(fund.id, 'beneficiaries', beneficiariesJson);
  }, [fund.id, onFieldUpdate]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">
          {tableMode === "inputs" ? "Unapproved Life Cover" : "Life Cover Beneficiaries"}
        </h3>
        <div className="text-sm text-neutral-600">
          Cover Amount: {fund.coverAmount}
        </div>
      </div>
      
      <BeneficiaryRowManager
        coverAmount={fund.coverAmount}
        beneficiaries={beneficiaries}
        onBeneficiariesChange={handleBeneficiariesChange}
        isUpdating={isUpdating}
      />
    </div>
  );
}