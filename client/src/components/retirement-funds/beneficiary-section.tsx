import type { RetirementFund, UpdateRetirementFund } from "@shared/schema";

interface BeneficiarySectionProps {
  fund: RetirementFund;
  onFieldUpdate: (id: number, field: keyof UpdateRetirementFund, value: string) => void;
  isUpdating: boolean;
  tableMode?: "inputs" | "flows";
  layout?: "compact" | "full";
}

export function BeneficiarySection({ fund, onFieldUpdate, isUpdating, tableMode, layout }: BeneficiarySectionProps) {
  return (
    <div className="text-sm text-neutral-500">
      Beneficiary section placeholder
    </div>
  );
}
