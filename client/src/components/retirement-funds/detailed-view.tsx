import { DetailedRow } from "./detailed-row";
import type { RetirementFund, UpdateRetirementFund } from "@shared/schema";

interface ColumnVisibility {
  overview: boolean;
  unapprovedLifeCover: boolean;
  monthlyDeathBenefit: boolean;
  fundValue: boolean;
  fundValueBeneficiaries: boolean;
}

interface DetailedViewProps {
  funds: RetirementFund[];
  columnVisibility: ColumnVisibility;
  onFieldUpdate: (id: number, field: keyof UpdateRetirementFund, value: string) => void;
  isUpdating: boolean;
  tableMode?: "inputs" | "flows";
}

export function DetailedView({ funds, columnVisibility, onFieldUpdate, isUpdating, tableMode = "inputs" }: DetailedViewProps) {
  return (
    <div className="divide-y divide-neutral-200">
        {funds.map((fund) => (
          <DetailedRow
            key={fund.id}
            fund={fund}
            columnVisibility={columnVisibility}
            onFieldUpdate={onFieldUpdate}
            isUpdating={isUpdating}
          />
        ))}
    </div>
  );
}
