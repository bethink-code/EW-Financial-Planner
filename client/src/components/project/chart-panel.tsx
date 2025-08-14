import { useState } from 'react';
import { GaugeChart } from './charts/gauge-chart';
import { UnifiedSummary } from './unified-summary';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ChartPanelProps {
  title: string;
  data: {
    provided: number;
    required: number;
    surplus: number;
    percentage: number;
  };
  chartType: string;
  description?: string;
  parameters?: Record<string, number | boolean>;
  onParameterChange?: (key: string, value: number | boolean) => void;
  section?: 'estate' | 'dependants' | 'capital' | 'income';
}

export function ChartPanel({ title, data, chartType, description, parameters, onParameterChange, section }: ChartPanelProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['provided', 'required']));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('ZAR', 'R');
  };

  const handleValueChange = (key: string, value: string) => {
    if (onParameterChange) {
      const numericValue = parseInt(value.replace(/[^\d]/g, ''), 10) || 0;
      onParameterChange(key, numericValue);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  // Parameter definitions for each section
  const getParameterGroups = () => {
    if (!section || !parameters) return [];

    switch (section) {
      case 'estate':
        return [
          {
            title: 'Capital provided',
            id: 'provided',
            params: [
              { key: 'lifeCoverToEstate', label: 'Life cover to the estate', checkbox: true },
              { key: 'voluntaryInvestments', label: 'Voluntary investments and other assets made available as a provision', checkbox: true },
              { key: 'accrualClaimSpouse', label: 'Accrual claim from spouse', checkbox: true },
              { key: 'dependantsSurplus', label: "Dependants' surplus utilised to wind up estate", checkbox: false },
              { key: 'ownEstateCapital', label: 'Own estate capital provided', checkbox: false, customInput: true }
            ]
          },
          {
            title: 'Capital required',
            id: 'required',
            params: [
              { key: 'estateDuty', label: 'Estate duty', checkbox: true },
              { key: 'executorsFees', label: "Executor's fees", checkbox: true },
              { key: 'settleClientLiabilities', label: "Settle client's liabilities", checkbox: true },
              { key: 'capitalGainsTax', label: 'Capital gains tax', checkbox: true },
              { key: 'mastersFee', label: "Master's fee", checkbox: true },
              { key: 'deathBedFuneral', label: 'Death bed and funeral expenses', checkbox: false },
              { key: 'conveyancingValuation', label: 'Conveyancing and valuation fees', checkbox: true },
              { key: 'accrualClaimToSpouse', label: 'Accrual claim to spouse', checkbox: true },
              { key: 'ownEstateCapitalRequired', label: 'Own estate capital required', checkbox: false, customInput: true }
            ]
          }
        ];
      case 'dependants':
        return [
          {
            title: 'Capital provided',
            id: 'provided',
            params: [
              { key: 'lifeCoverToSpouse', label: 'Life cover to spouse', checkbox: true },
              { key: 'lifeCoverToDependants', label: 'Life cover to dependents and others', checkbox: true },
              { key: 'voluntaryInvestmentsProvision', label: 'Voluntary investments and assets made available as a provision', checkbox: true },
              { key: 'lumpSumRetirement', label: 'Lump sum from retirement funds after tax: Victoria Lambe', checkbox: false },
              { key: 'estateSurplus', label: 'Estate surplus', checkbox: false },
              { key: 'ownDependantsCapital', label: 'Own dependants capital provided', checkbox: false, customInput: true }
            ]
          },
          {
            title: 'Capital required',
            id: 'required',
            params: [
              { key: 'clientLiabilities', label: "Client's liabilities settled by dependants", checkbox: true },
              { key: 'lumpSumNeeds', label: 'Lump sum needs and cash bequests', checkbox: true },
              { key: 'incomeShortfall', label: 'Capital required to provide for income shortfall', checkbox: true },
              { key: 'ownDependantsRequired', label: 'Own dependants capital required', checkbox: false, customInput: true }
            ]
          }
        ];
      default:
        return [];
    }
  };

  const renderParameterGroup = (group: any) => {
    const isOpen = openSections.has(group.id);

    return (
      <div key={group.id} className="mb-4">
        <Collapsible>
          <CollapsibleTrigger
            className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            onClick={() => toggleSection(group.id)}
          >
            <span className="font-medium text-gray-900">{group.title}</span>
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className={isOpen ? 'block' : 'hidden'}>
            <div className="space-y-4 mt-4">
              {group.params.map((param: any) => (
                <div key={param.key} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    {param.checkbox && (
                      <Checkbox
                        checked={true}
                        className="h-4 w-4"
                      />
                    )}
                    <Label className="text-sm text-gray-700 flex-1">{param.label}</Label>
                  </div>
                  {param.customInput ? (
                    <Input
                      value={formatCurrency((parameters?.[param.key] as number) || 0)}
                      onChange={(e) => handleValueChange(param.key, e.target.value)}
                      className="w-32 text-right text-sm"
                      placeholder="R 0"
                    />
                  ) : (
                    <div className="w-32 text-right text-sm font-medium text-gray-900">
                      {formatCurrency((parameters?.[param.key] as number) || 0)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  const renderChart = () => {
    switch (chartType) {
      case 'gauge':
        return <GaugeChart data={data} title={title} />;
      case 'bar':
        return <div className="flex items-center justify-center h-64 text-gray-500">Bar Chart - Coming Soon</div>;
      case 'line':
        return <div className="flex items-center justify-center h-64 text-gray-500">Line Chart - Coming Soon</div>;
      case 'pie':
        return <div className="flex items-center justify-center h-64 text-gray-500">Pie Chart - Coming Soon</div>;
      case 'area':
        return <div className="flex items-center justify-center h-64 text-gray-500">Area Chart - Coming Soon</div>;
      default:
        return <GaugeChart data={data} title={title} />;
    }
  };

  const parameterGroups = getParameterGroups();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>

      {/* Chart and Summary - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Chart */}
        <div className="h-80 flex items-center justify-center">
          {renderChart()}
        </div>

        {/* Unified Summary Statistics */}
        <div className="-mt-8">
          <UnifiedSummary data={data} />
        </div>
      </div>

      {/* Parameters Section */}
      {parameterGroups.length > 0 && (
        <div className="mt-6 border-t pt-6">
          <h3 className="text-md font-semibold text-gray-900 mb-4">Parameters</h3>
          <div className="space-y-4">
            {parameterGroups.map(group => renderParameterGroup(group))}
          </div>
        </div>
      )}
    </div>
  );
}