import { FundCard } from "./fund-card";
import type { RetirementFund, UpdateRetirementFund } from "@shared/schema";

interface CardsViewProps {
  funds: RetirementFund[];
  onFieldUpdate: (id: number, field: keyof UpdateRetirementFund, value: string) => void;
  isUpdating: boolean;
}

export function CardsView({ funds, onFieldUpdate, isUpdating }: CardsViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {funds.map((fund) => (
        <FundCard
          key={fund.id}
          fund={fund}
          onFieldUpdate={onFieldUpdate}
          isUpdating={isUpdating}
        />
      ))}
    </div>
  );
}
