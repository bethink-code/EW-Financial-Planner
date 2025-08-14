import React from 'react';
import { ParameterTable, createCalculatedRows, createIncomeRows } from './global-parameter-table';

interface ProjectionParameterSectionsProps {
  section: 'estate' | 'dependants' | 'capital' | 'income';
  parameters: Record<string, number | boolean>;
  onParameterChange: (key: string, value: number | boolean) => void;
  calculatedValues?: {
    provided: number;
    required: number;
    surplus: number;
    percentage: number;
  };
  estateCalculatedValues?: {
    provided: number;
    required: number;
    surplus: number;
    percentage: number;
  };
  dependantsCalculatedValues?: {
    provided: number;
    required: number;
    surplus: number;
    percentage: number;
  };
}

export function ProjectionParameterSections({ 
  section, 
  parameters, 
  onParameterChange, 
  calculatedValues,
  estateCalculatedValues,
  dependantsCalculatedValues
}: ProjectionParameterSectionsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('ZAR', 'R');
  };

  const handleValueChange = (key: string, value: string) => {
    const numericValue = parseInt(value.replace(/[^\d]/g, ''), 10) || 0;
    onParameterChange(key, numericValue);
  };

  // Estate Position Pattern
  if (section === 'estate') {
    const estateProvidedRows = [
      {
        key: 'lifeCoverToEstate',
        label: 'Life cover to estate',
        value: parameters.lifeCoverToEstate as number,
        customInput: true,
        onValueChange: handleValueChange
      },
      {
        key: 'voluntaryInvestments',
        label: 'Voluntary investments and assets made available to estate',
        value: parameters.voluntaryInvestments as number,
        customInput: true,
        onValueChange: handleValueChange
      },
      {
        key: 'accrualClaimSpouse',
        label: 'Accrual claim to spouse',
        value: parameters.accrualClaimSpouse as number,
        customInput: true,
        onValueChange: handleValueChange
      }
    ];

    const estateRequiredRows = [
      {
        key: 'estateDuty',
        label: 'Estate duty',
        value: parameters.estateDuty as number,
        customInput: true,
        onValueChange: handleValueChange
      },
      {
        key: 'executorsFees',
        label: 'Executors fees',
        value: parameters.executorsFees as number,
        customInput: true,
        onValueChange: handleValueChange
      },
      {
        key: 'settleClientLiabilities',
        label: 'Settle client liabilities',
        value: parameters.settleClientLiabilities as number,
        customInput: true,
        onValueChange: handleValueChange
      },
      {
        key: 'capitalGainsTax',
        label: 'Capital gains tax',
        value: parameters.capitalGainsTax as number,
        customInput: true,
        onValueChange: handleValueChange
      }
    ];

    const allRows = [...estateProvidedRows, ...estateRequiredRows];
    return <ParameterTable rows={allRows} formatValue={(value) => typeof value === 'string' ? value : formatCurrency(value as number)} />;
  }

  // Dependants Position Pattern (perfected implementation)
  if (section === 'dependants' && calculatedValues) {
    const rows = createCalculatedRows(calculatedValues, formatCurrency);
    return <ParameterTable rows={rows} formatValue={(value) => typeof value === 'string' ? value : formatCurrency(value as number)} />;
  }

  // Total Capital Position Pattern
  if (section === 'capital') {
    if (!estateCalculatedValues || !dependantsCalculatedValues) {
      return (
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">Total Capital Position combines Estate and Dependants positions</p>
          <p className="text-sm text-gray-600 mt-1">Adjust parameters in Estate and Dependants tabs to see changes here</p>
        </div>
      );
    }

    const combinedRows = [
      {
        key: 'estateProvided',
        label: 'Estate capital provided',
        value: estateCalculatedValues.provided,
        isSubtotal: true
      },
      {
        key: 'dependantsProvided',
        label: 'Dependants capital provided',
        value: dependantsCalculatedValues.provided,
        isSubtotal: true
      },
      {
        key: 'totalProvided',
        label: 'Total capital provided',
        value: estateCalculatedValues.provided + dependantsCalculatedValues.provided,
        isTotal: true
      },
      {
        key: 'estateRequired',
        label: 'Estate capital required',
        value: estateCalculatedValues.required,
        isSubtotal: true
      },
      {
        key: 'dependantsRequired',
        label: 'Dependants capital required',
        value: dependantsCalculatedValues.required,
        isSubtotal: true
      },
      {
        key: 'totalRequired',
        label: 'Total capital required',
        value: estateCalculatedValues.required + dependantsCalculatedValues.required,
        isTotal: true
      },
      {
        key: 'totalSurplus',
        label: 'Total surplus/shortfall',
        value: (estateCalculatedValues.provided + dependantsCalculatedValues.provided) - 
               (estateCalculatedValues.required + dependantsCalculatedValues.required),
        isTotal: true
      }
    ];

    return <ParameterTable rows={combinedRows} formatValue={(value) => typeof value === 'string' ? value : formatCurrency(value as number)} />;
  }

  // Income Position Pattern
  if (section === 'income') {
    const incomeRows = createIncomeRows(formatCurrency);
    
    return (
      <div>
        <ParameterTable 
          title="Income Position Parameters"
          rows={incomeRows} 
          formatValue={(value) => typeof value === 'string' ? value : formatCurrency(value as number)}
        />
        
        <div className="mt-6">
          <ParameterTable 
            title="Monthly income position"
            rows={incomeRows}
            formatValue={(value) => typeof value === 'string' ? value : formatCurrency(value as number)}
          />
        </div>
      </div>
    );
  }

  return null;
}