import React from 'react';

interface ParameterTableRow {
  key: string;
  label: string;
  value: number | string;
  isTotal?: boolean;
  isSubtotal?: boolean;
  customInput?: boolean;
  onValueChange?: (key: string, value: string) => void;
}

interface ParameterTableProps {
  title?: string;
  rows: ParameterTableRow[];
  width?: string;
  formatValue?: (value: number | string) => string;
  className?: string;
}

export function ParameterTable({ 
  title, 
  rows, 
  width = "w-80", 
  formatValue = (value) => value.toString(),
  className = ""
}: ParameterTableProps) {
  const handleValueChange = (key: string, value: string, onChange?: (key: string, value: string) => void) => {
    if (onChange) {
      onChange(key, value);
    }
  };

  return (
    <div className={className}>
      {title && (
        <div className="pb-3">
          <h4 className="text-sm font-medium text-gray-900 mb-3">{title}</h4>
        </div>
      )}
      
      <table className={`${width} border border-neutral-300 rounded-md`}>
        <thead>
          <tr className="border-b border-neutral-300 bg-gray-50">
            <th className="px-2 py-2 text-sm font-medium text-neutral-600 uppercase tracking-wider text-left">Parameter</th>
            <th className="px-2 py-2 text-sm font-medium text-neutral-600 uppercase tracking-wider text-right">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {rows.map((row, index) => (
            <tr 
              key={row.key} 
              className={`hover:bg-neutral-50 ${row.isTotal || row.isSubtotal ? 'bg-gray-50' : ''}`}
            >
              <td className="px-2 py-2">
                <span className={`text-sm text-gray-600 ${row.isTotal || row.isSubtotal ? 'font-medium' : ''}`}>
                  {row.label}
                </span>
              </td>
              <td className="px-2 py-2">
                {row.customInput ? (
                  <input
                    type="text"
                    value={formatValue(row.value)}
                    onChange={(e) => handleValueChange(row.key, e.target.value, row.onValueChange)}
                    className="table-input w-full text-right text-sm bg-transparent border-0 px-1 py-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="R 0"
                  />
                ) : (
                  <div className={`text-right text-sm font-medium text-gray-800 ${row.isTotal ? 'font-bold' : ''}`}>
                    {formatValue(row.value)}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Helper function to create calculated value rows with percentage splits
export function createCalculatedRows(
  calculatedValues: {
    provided: number;
    required: number;
    surplus: number;
    percentage: number;
  },
  formatCurrency: (value: number) => string
): ParameterTableRow[] {
  return [
    // Capital Provided Section
    {
      key: 'lifeCoverSpouse',
      label: 'Life cover to spouse',
      value: calculatedValues.provided * 0.4
    },
    {
      key: 'lifeCoverDependents',
      label: 'Life cover to dependents and others',
      value: calculatedValues.provided * 0.3
    },
    {
      key: 'voluntaryInvestments',
      label: 'Voluntary investments and assets made available as a provision',
      value: calculatedValues.provided * 0.2
    },
    {
      key: 'retirementFundsLumpSum',
      label: 'Lump sum from retirement funds after tax: Victoria Lambe',
      value: calculatedValues.provided * 0.1
    },
    {
      key: 'estateSurplus',
      label: 'Estate surplus',
      value: calculatedValues.surplus
    },
    {
      key: 'totalProvided',
      label: 'Own dependants capital provided',
      value: calculatedValues.provided,
      isTotal: true
    },
    
    // Capital Required Section
    {
      key: 'clientLiabilities',
      label: "Client's liabilities settled by dependants",
      value: calculatedValues.required * 0.4
    },
    {
      key: 'lumpSumNeeds',
      label: 'Lump sum needs and cash bequests',
      value: calculatedValues.required * 0.35
    },
    {
      key: 'incomeShortfall',
      label: 'Capital required to provide for income shortfall',
      value: calculatedValues.required * 0.25
    },
    {
      key: 'totalRequired',
      label: 'Own dependants capital required',
      value: calculatedValues.required,
      isTotal: true
    }
  ];
}

// Helper function to create income position rows
export function createIncomeRows(
  formatCurrency: (value: number) => string
): ParameterTableRow[] {
  return [
    {
      key: 'retirementIncome',
      label: 'From retirement funds and existing living annuities after deducting income tax',
      value: 'R 29,193'
    },
    {
      key: 'definedBenefit',
      label: 'Defined benefit pension fund',
      value: 'R 0'
    },
    {
      key: 'monthlyDeathBenefit',
      label: 'Monthly death benefit',
      value: 'R 0'
    },
    {
      key: 'existingCapital',
      label: 'From existing capital provisions after deducting capital needs',
      value: 'R 6,895,118 / R 35,571' // Special formatting for dual values
    }
  ];
}