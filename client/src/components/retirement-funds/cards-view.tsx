import { FundCard } from "./fund-card";
import type { RetirementFund, UpdateRetirementFund } from "@shared/schema";

interface CardsViewProps {
  funds: RetirementFund[];
  onFieldUpdate: (id: number, field: keyof UpdateRetirementFund, value: string) => void;
  isUpdating: boolean;
  tableMode?: "inputs" | "flows";
}

export function CardsView({ funds, onFieldUpdate, isUpdating, tableMode = "inputs" }: CardsViewProps) {
  // Calculate totals for inputs mode
  const calculateTotal = (field: keyof RetirementFund) => {
    return funds.reduce((sum, fund) => {
      const value = fund[field] as string;
      const amount = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
      return sum + amount;
    }, 0);
  };

  const totals = {
    coverAmount: calculateTotal("coverAmount"),
    monthlyIncome: calculateTotal("monthlyIncome"),
    approvedLifeCover: calculateTotal("approvedLifeCover"),
    fundValue: calculateTotal("fundValue"),
    fundValueAtDeath: calculateTotal("fundValueAtDeath"),
  };

  return (
    <div className="space-y-6">
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

      {/* Summary Section for Inputs Mode */}
      {tableMode === "inputs" && (
        <div className="bg-white rounded shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">Summary Totals</h3>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div style={{ backgroundColor: '#EDEDED' }} className="rounded p-4 text-center">
              <div className="text-xs font-medium text-neutral-600 mb-1">Cover Amount</div>
              <div className="text-lg font-bold text-neutral-900">
                R {totals.coverAmount.toLocaleString()}
              </div>
            </div>
            <div style={{ backgroundColor: '#CBE7F6' }} className="rounded p-4 text-center">
              <div className="text-xs font-medium text-neutral-600 mb-1">Monthly Income</div>
              <div className="text-lg font-bold text-neutral-900">
                R {totals.monthlyIncome.toLocaleString()}
              </div>
            </div>
            <div style={{ backgroundColor: '#EDEDED' }} className="rounded p-4 text-center">
              <div className="text-xs font-medium text-neutral-600 mb-1">Approved Life Cover</div>
              <div className="text-lg font-bold text-neutral-900">
                R {totals.approvedLifeCover.toLocaleString()}
              </div>
            </div>
            <div style={{ backgroundColor: '#CBE7F6' }} className="rounded p-4 text-center">
              <div className="text-xs font-medium text-neutral-600 mb-1">Fund Value</div>
              <div className="text-lg font-bold text-neutral-900">
                R {totals.fundValue.toLocaleString()}
              </div>
            </div>
            <div style={{ backgroundColor: '#EDEDED' }} className="rounded p-4 text-center">
              <div className="text-xs font-medium text-neutral-600 mb-1">Fund Value at Death</div>
              <div className="text-lg font-bold text-neutral-900">
                R {totals.fundValueAtDeath.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
