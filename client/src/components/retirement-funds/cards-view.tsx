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
      {/* Summary Section for Inputs Mode */}
      {tableMode === "inputs" && (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Summary</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div style={{ backgroundColor: '#F1B071' }} className="rounded-lg p-4 text-center">
              <div className="text-xs font-medium text-neutral-800 mb-1">Cover Amount</div>
              <div className="text-lg font-bold text-neutral-900">
                R {totals.coverAmount.toLocaleString()}
              </div>
            </div>
            <div style={{ backgroundColor: '#F1B071' }} className="rounded-lg p-4 text-center">
              <div className="text-xs font-medium text-neutral-800 mb-1">Monthly Income</div>
              <div className="text-lg font-bold text-neutral-900">
                R {totals.monthlyIncome.toLocaleString()}
              </div>
            </div>
            <div style={{ backgroundColor: '#F1B071' }} className="rounded-lg p-4 text-center">
              <div className="text-xs font-medium text-neutral-800 mb-1">Approved Life Cover</div>
              <div className="text-lg font-bold text-neutral-900">
                R {totals.approvedLifeCover.toLocaleString()}
              </div>
            </div>
            <div style={{ backgroundColor: '#F1B071' }} className="rounded-lg p-4 text-center">
              <div className="text-xs font-medium text-neutral-800 mb-1">Fund Value</div>
              <div className="text-lg font-bold text-neutral-900">
                R {totals.fundValue.toLocaleString()}
              </div>
            </div>
            <div style={{ backgroundColor: '#F1B071' }} className="rounded-lg p-4 text-center">
              <div className="text-xs font-medium text-neutral-800 mb-1">Fund Value at Death</div>
              <div className="text-lg font-bold text-neutral-900">
                R {totals.fundValueAtDeath.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Retirement Summary Section */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Retirement Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div style={{ backgroundColor: '#F1B071' }} className="rounded-lg p-4">
            <h3 className="text-base font-bold text-neutral-900 mb-3">Total Fund Portfolio</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Number of Funds:</span>
                <span className="font-medium">{funds.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Total Value:</span>
                <span className="font-medium">R {totals.fundValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Death Benefit:</span>
                <span className="font-medium">R {totals.fundValueAtDeath.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#F1B071' }} className="rounded-lg p-4">
            <h3 className="text-base font-bold text-neutral-900 mb-3">Life Cover Protection</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Total Cover:</span>
                <span className="font-medium">R {totals.coverAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Approved Cover:</span>
                <span className="font-medium">R {totals.approvedLifeCover.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Monthly Income:</span>
                <span className="font-medium">R {totals.monthlyIncome.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#F1B071' }} className="rounded-lg p-4">
            <h3 className="text-base font-bold text-neutral-900 mb-3">Key Ratios</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Cover vs Fund:</span>
                <span className="font-medium">
                  {totals.fundValue > 0 ? Math.round((totals.coverAmount / totals.fundValue) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Death Benefit:</span>
                <span className="font-medium">
                  {totals.fundValue > 0 ? Math.round(((totals.fundValueAtDeath - totals.fundValue) / totals.fundValue) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Annual Income:</span>
                <span className="font-medium">R {(totals.monthlyIncome * 12).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}
