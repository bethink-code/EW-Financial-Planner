import type { RetirementFund } from "@shared/schema";

interface SummarySectionProps {
  funds: RetirementFund[];
  tableMode?: "inputs" | "flows";
}

export function SummarySection({ funds, tableMode = "inputs" }: SummarySectionProps) {
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
    /* Summary Section for Inputs Mode */
    tableMode === "inputs" ? (
      <div className="rounded-lg shadow-sm border border-neutral-200 p-6">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Summary</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div style={{ backgroundColor: '#F9F0E5' }} className="bg-white rounded-lg p-4 text-center border border-neutral-200 shadow-sm">
            <div className="text-xs font-medium text-neutral-600 mb-1">Cover Amount</div>
            <div className="text-xs text-neutral-900">
              R {totals.coverAmount.toLocaleString()}
            </div>
          </div>
          <div style={{ backgroundColor: '#F9F0E5' }} className="bg-white rounded-lg p-4 text-center border border-neutral-200 shadow-sm">
            <div className="text-xs font-medium text-neutral-600 mb-1">Monthly Income</div>
            <div className="text-xs text-neutral-900">
              R {totals.monthlyIncome.toLocaleString()}
            </div>
          </div>
          <div style={{ backgroundColor: '#F9F0E5' }} className="bg-white rounded-lg p-4 text-center border border-neutral-200 shadow-sm">
            <div className="text-xs font-medium text-neutral-600 mb-1">Approved Life Cover</div>
            <div className="text-xs text-neutral-900">
              R {totals.approvedLifeCover.toLocaleString()}
            </div>
          </div>
          <div style={{ backgroundColor: '#F9F0E5' }} className="bg-white rounded-lg p-4 text-center border border-neutral-200 shadow-sm">
            <div className="text-xs font-medium text-neutral-600 mb-1">Fund Value</div>
            <div className="text-xs text-neutral-900">
              R {totals.fundValue.toLocaleString()}
            </div>
          </div>
          <div style={{ backgroundColor: '#F9F0E5' }} className="bg-white rounded-lg p-4 text-center border border-neutral-200 shadow-sm">
            <div className="text-xs font-medium text-neutral-600 mb-1">Fund Value at Death</div>
            <div className="text-xs text-neutral-900">
              R {totals.fundValueAtDeath.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    ) : null
  );
}