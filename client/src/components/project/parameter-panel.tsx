import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';
import { EstatePositionParameters } from './estate-position-parameters';

interface ParameterPanelProps {
  title: string;
  parameters: Record<string, number | boolean>;
  onParameterChange: (key: string, value: number | boolean) => void;
  section: 'estate' | 'dependants' | 'capital' | 'income';
  calculatedValues?: {
    provided: number;
    required: number;
    surplus: number;
    percentage: number;
  };
}

export function ParameterPanel({ title, parameters, onParameterChange, section, calculatedValues }: ParameterPanelProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['provided', 'required']));

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

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

  const resetToDefaults = () => {
    // Reset to default values
    const defaults = {
      lifeCoverToEstate: 4000000,
      voluntaryInvestments: 7812990,
      accrualClaimSpouse: 0,
      dependantsSurplus: 0,
      ownEstateCapital: 0,
      estateDuty: 177457,
      executorsFees: 813573,
      settleClientLiabilities: 1380000,
      capitalGainsTax: 886663,
      mastersFee: 7000,
      deathBedFuneral: 60000,
      conveyancingValuation: 132130,
      accrualClaimToSpouse: 6081350,
      ownEstateCapitalRequired: 0
    };

    Object.entries(defaults).forEach(([key, value]) => {
      onParameterChange(key, value);
    });
  };

  const estateProvidedParams = [
    { key: 'lifeCoverToEstate', label: 'Life cover to the estate', checkbox: true },
    { key: 'voluntaryInvestments', label: 'Voluntary investments and other assets made available as a provision', checkbox: true },
    { key: 'accrualClaimSpouse', label: 'Accrual claim from spouse', checkbox: true },
    { key: 'dependantsSurplus', label: "Dependants' surplus utilised to wind up estate", checkbox: false },
    { key: 'ownEstateCapital', label: 'Own estate capital provided', checkbox: false, customInput: true }
  ];

  const estateRequiredParams = [
    { key: 'estateDuty', label: 'Estate duty', checkbox: true },
    { key: 'executorsFees', label: "Executor's fees", checkbox: true },
    { key: 'settleClientLiabilities', label: "Settle client's liabilities", checkbox: true },
    { key: 'capitalGainsTax', label: 'Capital gains tax', checkbox: true },
    { key: 'mastersFee', label: "Master's fee", checkbox: true },
    { key: 'deathBedFuneral', label: 'Death bed and funeral expenses', checkbox: false },
    { key: 'conveyancingValuation', label: 'Conveyancing and valuation fees', checkbox: true },
    { key: 'accrualClaimToSpouse', label: 'Accrual claim to spouse', checkbox: true },
    { key: 'ownEstateCapitalRequired', label: 'Own estate capital required', checkbox: false, customInput: true }
  ];

  const dependantsProvidedParams = [
    { key: 'lifeCoverToSpouse', label: 'Life cover to spouse', checkbox: true },
    { key: 'lifeCoverToDependants', label: 'Life cover to dependents and others', checkbox: true },
    { key: 'voluntaryInvestmentsProvision', label: 'Voluntary investments and assets made available as a provision', checkbox: true },
    { key: 'lumpSumRetirement', label: 'Lump sum from retirement funds after tax: Victoria Lambe', checkbox: false },
    { key: 'estateSurplus', label: 'Estate surplus', checkbox: false },
    { key: 'ownDependantsCapital', label: 'Own dependants capital provided', checkbox: false, customInput: true }
  ];

  const dependantsRequiredParams = [
    { key: 'clientLiabilities', label: "Client's liabilities settled by dependants", checkbox: true },
    { key: 'lumpSumNeeds', label: 'Lump sum needs and cash bequests', checkbox: true },
    { key: 'incomeShortfall', label: 'Capital required to provide for income shortfall', checkbox: true },
    { key: 'ownDependantsRequired', label: 'Own dependants capital required', checkbox: false, customInput: true }
  ];

  const renderParameterGroup = (title: string, params: any[], sectionId: string) => {
    const isOpen = openSections.has(sectionId);

    return (
      <Collapsible>
        <CollapsibleTrigger
          className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
          onClick={() => toggleSection(sectionId)}
        >
          <span className="font-medium text-gray-600">{title}</span>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className={isOpen ? 'block' : 'hidden'}>
          <div className="space-y-4 mt-4">
            {params.map((param) => (
              <div key={param.key} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  {param.checkbox && (
                    <Checkbox
                      checked={true}
                      className="h-4 w-4"
                    />
                  )}
                  <Label className="text-sm text-gray-600 flex-1">{param.label}</Label>
                </div>
                {param.customInput ? (
                  <Input
                    value={formatCurrency(parameters[param.key] as number)}
                    onChange={(e) => handleValueChange(param.key, e.target.value)}
                    className="w-32 text-right text-sm"
                    placeholder="R 0"
                  />
                ) : (
                  <div className="w-32 text-right text-sm font-medium text-gray-800">
                    {formatCurrency(parameters[param.key] as number)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <>      
      {section === 'estate' && (
        <table className="parameter-table table-fixed">
          <thead>
            <tr className="border-b border-neutral-300 bg-gray-50">
              <th className="px-2 py-2 text-sm font-medium text-neutral-600 uppercase tracking-wider text-left">Parameter</th>
              <th className="px-2 py-2 text-sm font-medium text-neutral-600 uppercase tracking-wider text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {[...estateProvidedParams, ...estateRequiredParams].map((param, index) => (
              <tr key={param.key} className="hover:bg-neutral-50">
                <td className="px-2 py-2">
                  <span className="text-sm text-gray-600">{param.label}</span>
                </td>
                <td className="px-2 py-2 text-right text-sm font-medium text-gray-800">
                  {param.customInput ? (
                    <input
                      type="text"
                      value={formatCurrency(parameters[param.key] as number)}
                      onChange={(e) => handleValueChange(param.key, e.target.value)}
                      className="table-input w-full text-right text-sm bg-transparent border-0 px-1 py-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="R 0"
                    />
                  ) : (
                    formatCurrency(parameters[param.key] as number)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
        
        {section === 'dependants' && calculatedValues && (
          <table className="parameter-table table-fixed">
            <thead>
              <tr className="border-b border-neutral-300 bg-gray-50">
                <th className="px-2 py-2 text-sm font-medium text-neutral-600 uppercase tracking-wider text-left">Parameter</th>
                <th className="px-2 py-2 text-sm font-medium text-neutral-600 uppercase tracking-wider text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              <tr className="hover:bg-neutral-50">
                <td className="px-2 py-2">
                  <span className="text-sm text-gray-600">Life cover to spouse</span>
                </td>
                <td className="px-2 py-2 text-right text-sm font-medium text-gray-800">
                  {formatCurrency(calculatedValues.provided * 0.4)}
                </td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="px-2 py-2">
                  <span className="text-sm text-gray-600">Life cover to dependents and others</span>
                </td>
                <td className="px-2 py-2 text-right text-sm font-medium text-gray-800">
                  {formatCurrency(calculatedValues.provided * 0.3)}
                </td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="px-2 py-2">
                  <span className="text-sm text-gray-600">Voluntary investments and assets made available as a provision</span>
                </td>
                <td className="px-2 py-2 text-right text-sm font-medium text-gray-800">
                  {formatCurrency(calculatedValues.provided * 0.2)}
                </td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="px-2 py-2">
                  <span className="text-sm text-gray-600">Lump sum from retirement funds after tax: Victoria Lambe</span>
                </td>
                <td className="px-2 py-2 text-right text-sm font-medium text-gray-800">
                  {formatCurrency(calculatedValues.provided * 0.1)}
                </td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="px-2 py-2">
                  <span className="text-sm text-gray-600">Estate surplus</span>
                </td>
                <td className="px-2 py-2 text-right text-sm font-medium text-gray-800">
                  {formatCurrency(calculatedValues.surplus)}
                </td>
              </tr>
              <tr className="hover:bg-neutral-50 bg-gray-50">
                <td className="px-2 py-2">
                  <span className="text-sm text-gray-600 font-medium">Own dependants capital provided</span>
                </td>
                <td className="px-2 py-2 text-right text-sm font-bold text-gray-800">
                  {formatCurrency(calculatedValues.provided)}
                </td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="px-2 py-2">
                  <span className="text-sm text-gray-600">Client's liabilities settled by dependants</span>
                </td>
                <td className="px-2 py-2 text-right text-sm font-medium text-gray-800">
                  {formatCurrency(calculatedValues.required * 0.4)}
                </td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="px-2 py-2">
                  <span className="text-sm text-gray-600">Lump sum needs and cash bequests</span>
                </td>
                <td className="px-2 py-2 text-right text-sm font-medium text-gray-800">
                  {formatCurrency(calculatedValues.required * 0.35)}
                </td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="px-2 py-2">
                  <span className="text-sm text-gray-600">Capital required to provide for income shortfall</span>
                </td>
                <td className="px-2 py-2 text-right text-sm font-medium text-gray-800">
                  {formatCurrency(calculatedValues.required * 0.25)}
                </td>
              </tr>
              <tr className="hover:bg-neutral-50 bg-gray-50">
                <td className="px-2 py-2">
                  <span className="text-sm text-gray-600 font-medium">Own dependants capital required</span>
                </td>
                <td className="px-2 py-2 text-right text-sm font-bold text-gray-800">
                  {formatCurrency(calculatedValues.required)}
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {section === 'capital' && calculatedValues && (
          <table className="parameter-table table-fixed">
            <thead>
              <tr className="border-b border-neutral-300 bg-gray-50">
                <th className="px-2 py-2 text-sm font-medium text-neutral-600 uppercase tracking-wider text-left">Parameter</th>
                <th className="px-2 py-2 text-sm font-medium text-neutral-600 uppercase tracking-wider text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              <tr className="hover:bg-neutral-50">
                <td className="px-2 py-2">
                  <span className="text-sm text-gray-600">Estate capital provided</span>
                </td>
                <td className="px-2 py-2 text-right text-sm font-medium text-gray-800">
                  {formatCurrency(calculatedValues.provided * 0.6)}
                </td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="px-2 py-2">
                  <span className="text-sm text-gray-600">Dependants capital provided</span>
                </td>
                <td className="px-2 py-2 text-right text-sm font-medium text-gray-800">
                  {formatCurrency(calculatedValues.provided * 0.4)}
                </td>
              </tr>
              <tr className="hover:bg-neutral-50 bg-gray-50">
                <td className="px-2 py-2">
                  <span className="text-sm text-gray-600 font-medium">Total capital provided</span>
                </td>
                <td className="px-2 py-2 text-right text-sm font-bold text-gray-800">
                  {formatCurrency(calculatedValues.provided)}
                </td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="px-2 py-2">
                  <span className="text-sm text-gray-600">Estate capital required</span>
                </td>
                <td className="px-2 py-2 text-right text-sm font-medium text-gray-800">
                  {formatCurrency(calculatedValues.required * 0.45)}
                </td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="px-2 py-2">
                  <span className="text-sm text-gray-600">Dependants capital required</span>
                </td>
                <td className="px-2 py-2 text-right text-sm font-medium text-gray-800">
                  {formatCurrency(calculatedValues.required * 0.55)}
                </td>
              </tr>
              <tr className="hover:bg-neutral-50 bg-gray-50">
                <td className="px-2 py-2">
                  <span className="text-sm text-gray-600 font-medium">Total capital required</span>
                </td>
                <td className="px-2 py-2 text-right text-sm font-bold text-gray-800">
                  {formatCurrency(calculatedValues.required)}
                </td>
              </tr>
              <tr className="hover:bg-neutral-50 bg-gray-50">
                <td className="px-2 py-2">
                  <span className="text-sm text-gray-600 font-medium">Net capital surplus/shortfall</span>
                </td>
                <td className="px-2 py-2 text-right text-sm font-bold text-gray-800">
                  {formatCurrency(calculatedValues.surplus)}
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {section === 'capital' && !calculatedValues && (
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600">Total Capital Position combines Estate and Dependants positions</p>
            <p className="text-sm text-gray-600 mt-1">Adjust parameters in Estate and Dependants tabs to see changes here</p>
          </div>
        )}

        {section === 'income' && (
          <div>
            <table className="parameter-table table-fixed">
              <thead>
                <tr className="border-b border-neutral-300 bg-gray-50">
                  <th className="px-2 py-2 text-sm font-medium text-neutral-600 uppercase tracking-wider text-left">Income Source</th>
                  <th className="px-2 py-2 text-sm font-medium text-neutral-600 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr className="hover:bg-neutral-50">
                  <td className="px-2 py-2">
                    <span className="text-sm text-gray-600">From retirement funds and existing living annuities after deducting income tax</span>
                  </td>
                  <td className="px-2 py-2 text-right text-sm font-medium text-gray-800">R 29,193</td>
                </tr>
                <tr className="hover:bg-neutral-50">
                  <td className="px-2 py-2">
                    <span className="text-sm text-gray-600">Defined benefit pension fund</span>
                  </td>
                  <td className="px-2 py-2 text-right text-sm font-medium text-gray-800">R 0</td>
                </tr>
                <tr className="hover:bg-neutral-50">
                  <td className="px-2 py-2">
                    <span className="text-sm text-gray-600">Monthly death benefit</span>
                  </td>
                  <td className="px-2 py-2 text-right text-sm font-medium text-gray-800">R 0</td>
                </tr>
                <tr className="hover:bg-neutral-50">
                  <td className="px-2 py-2">
                    <span className="text-sm text-gray-600">From existing capital provisions after deducting capital needs</span>
                  </td>
                  <td className="px-2 py-2 text-right">
                    <div className="text-sm font-medium text-gray-600">R 6,895,118</div>
                    <div className="text-sm text-gray-500">R 35,571</div>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-600 mb-3">Monthly income position</h4>
              <table className="parameter-table table-fixed">
                <thead>
                  <tr className="border-b border-neutral-300 bg-gray-50">
                    <th className="px-2 py-2 text-sm font-medium text-neutral-600 uppercase tracking-wider text-left">Income Source</th>
                    <th className="px-2 py-2 text-sm font-medium text-neutral-600 uppercase tracking-wider text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  <tr className="hover:bg-neutral-50">
                    <td className="px-2 py-2">
                      <span className="text-sm text-gray-600">From retirement funds and existing living annuities after deducting income tax</span>
                    </td>
                    <td className="px-2 py-2 text-right text-sm font-medium text-gray-800">R 29,193</td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="px-2 py-2">
                      <span className="text-sm text-gray-600">Defined benefit pension fund</span>
                    </td>
                    <td className="px-2 py-2 text-right text-sm font-medium text-gray-800">R 0</td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="px-2 py-2">
                      <span className="text-sm text-gray-600">Monthly death benefit</span>
                    </td>
                    <td className="px-2 py-2 text-right text-sm font-medium text-gray-800">R 0</td>
                  </tr>
                  <tr className="hover:bg-neutral-50">
                    <td className="px-2 py-2">
                      <span className="text-sm text-gray-600">From existing capital provisions after deducting capital needs</span>
                    </td>
                    <td className="px-2 py-2 text-right">
                      <div className="text-sm font-medium text-gray-600">R 6,895,118</div>
                      <div className="text-sm text-gray-500">R 35,571</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
    </>
  );
}