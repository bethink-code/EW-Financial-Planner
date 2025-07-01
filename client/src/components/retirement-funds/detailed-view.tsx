import { DetailedRow } from "./detailed-row";
import type { RetirementFund, UpdateRetirementFund } from "@shared/schema";

interface DetailedViewProps {
  funds: RetirementFund[];
  onFieldUpdate: (id: number, field: keyof UpdateRetirementFund, value: string) => void;
  isUpdating: boolean;
}

export function DetailedView({ funds, onFieldUpdate, isUpdating }: DetailedViewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <div className="divide-y divide-neutral-200">
        {funds.map((fund) => (
          <DetailedRow
            key={fund.id}
            fund={fund}
            onFieldUpdate={onFieldUpdate}
            isUpdating={isUpdating}
          />
        ))}
      </div>
    </div>
  );
}
