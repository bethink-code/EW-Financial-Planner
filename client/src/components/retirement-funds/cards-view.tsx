import { FundCard } from "./fund-card";
import { SummarySection } from "./summary-section";
import type { RetirementFund, UpdateRetirementFund } from "@shared/schema";

interface ColumnVisibility {
  overview: boolean;
  unapprovedLifeCover: boolean;
  monthlyDeathBenefit: boolean;
  fundValue: boolean;
  fundValueBeneficiaries: boolean;
}

interface CardsViewProps {
  funds: RetirementFund[];
  columnVisibility: ColumnVisibility;
  onFieldUpdate: (id: number, field: keyof UpdateRetirementFund, value: string) => void;
  isUpdating: boolean;
  tableMode?: "inputs" | "flows";
}

export function CardsView({ funds, columnVisibility, onFieldUpdate, isUpdating, tableMode = "inputs" }: CardsViewProps) {
  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <SummarySection funds={funds} tableMode={tableMode} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {funds.map((fund) => (
          <FundCard
            key={fund.id}
            fund={fund}
            columnVisibility={columnVisibility}
            onFieldUpdate={onFieldUpdate}
            isUpdating={isUpdating}
          />
        ))}
      </div>
    </div>
  );
}
