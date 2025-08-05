import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface EstatePositionParameters {
  id: number;
  // Capital Provided
  lifeCoverToEstate: string;
  voluntaryInvestments: string;
  accrualClaimFromSpouse: string;
  dependantsSurplusUtilised: string;
  ownEstateCapitalProvided: string;
  // Capital Required
  estateDuty: string;
  executorsFees: string;
  settleClientLiabilities: string;
  capitalGainsTax: string;
  mastersFee: string;
  deathBedFuneralExpenses: string;
  conveyancingValuationFees: string;
  accrualClaimToSpouse: string;
  ownEstateCapitalRequired: string;
  // Results
  surplus: string;
  estateSurplusUtilisedForDependants: string;
  estatePositionAfterAllocation: string;
  lastUpdated: string;
}

interface EstatePositionParametersProps {
  onParameterChange?: (parameters: EstatePositionParameters) => void;
}

export function EstatePositionParameters({ onParameterChange }: EstatePositionParametersProps) {
  const queryClient = useQueryClient();
  const [editingField, setEditingField] = useState<string | null>(null);

  // Fetch estate position parameters
  const { data: parameters, isLoading } = useQuery<EstatePositionParameters>({
    queryKey: ['/api/estate-position-parameters'],
    queryFn: async () => {
      const response = await fetch('/api/estate-position-parameters');
      if (!response.ok) throw new Error('Failed to fetch estate position parameters');
      return response.json();
    },
  });

  // Update parameters mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<EstatePositionParameters>) => {
      if (!parameters) throw new Error('No parameters to update');
      const response = await fetch(`/api/estate-position-parameters/${parameters.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update parameters');
      return response.json();
    },
    onSuccess: (updatedParameters: EstatePositionParameters) => {
      queryClient.invalidateQueries({ queryKey: ['/api/estate-position-parameters'] });
      onParameterChange?.(updatedParameters);
    },
  });

  const formatCurrency = (value: string) => {
    // Parse the currency value and reformat it
    const numericValue = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
    return `R ${numericValue.toLocaleString()}`;
  };

  const handleFieldUpdate = (field: string, value: string) => {
    const formattedValue = formatCurrency(value);
    updateMutation.mutate({ [field]: formattedValue });
    setEditingField(null);
  };

  const calculateOwnEstateCapitalProvided = () => {
    if (!parameters) return "R 0";
    const parseCurrency = (val: string) => parseFloat(val.replace(/[^\d.-]/g, '')) || 0;
    
    const total = parseCurrency(parameters.lifeCoverToEstate) +
                  parseCurrency(parameters.voluntaryInvestments) +
                  parseCurrency(parameters.accrualClaimFromSpouse) +
                  parseCurrency(parameters.dependantsSurplusUtilised);
    
    return `R ${total.toLocaleString()}`;
  };

  const calculateOwnEstateCapitalRequired = () => {
    if (!parameters) return "R 0";
    const parseCurrency = (val: string) => parseFloat(val.replace(/[^\d.-]/g, '')) || 0;
    
    const total = parseCurrency(parameters.estateDuty) +
                  parseCurrency(parameters.executorsFees) +
                  parseCurrency(parameters.settleClientLiabilities) +
                  parseCurrency(parameters.capitalGainsTax) +
                  parseCurrency(parameters.mastersFee) +
                  parseCurrency(parameters.deathBedFuneralExpenses) +
                  parseCurrency(parameters.conveyancingValuationFees) +
                  parseCurrency(parameters.accrualClaimToSpouse);
    
    return `R ${total.toLocaleString()}`;
  };

  const calculateSurplus = () => {
    if (!parameters) return "R 0";
    const parseCurrency = (val: string) => parseFloat(val.replace(/[^\d.-]/g, '')) || 0;
    
    const provided = parseCurrency(calculateOwnEstateCapitalProvided());
    const required = parseCurrency(calculateOwnEstateCapitalRequired());
    const surplus = provided - required;
    
    return `R ${surplus.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <Card className="h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-sm text-gray-500">Loading estate position parameters...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!parameters) {
    return (
      <Card className="h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-sm text-red-500">Failed to load estate position parameters</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const capitalProvidedFields = [
    { key: 'lifeCoverToEstate', label: 'Life cover to the estate', editable: true },
    { key: 'voluntaryInvestments', label: 'Voluntary investments and other assets made available as a provision', editable: true },
    { key: 'accrualClaimFromSpouse', label: 'Accrual claim from spouse', editable: true },
    { key: 'dependantsSurplusUtilised', label: "Dependants' surplus utilised to wind up estate", editable: true },
    { key: 'ownEstateCapitalProvided', label: 'Own estate capital provided', editable: false, calculated: true },
  ];

  const capitalRequiredFields = [
    { key: 'estateDuty', label: 'Estate duty', editable: true },
    { key: 'executorsFees', label: "Executor's fees", editable: true },
    { key: 'settleClientLiabilities', label: "Settle client's liabilities", editable: true },
    { key: 'capitalGainsTax', label: 'Capital gains tax', editable: true },
    { key: 'mastersFee', label: "Master's fee", editable: true },
    { key: 'deathBedFuneralExpenses', label: 'Death bed and funeral expenses', editable: true },
    { key: 'conveyancingValuationFees', label: 'Conveyancing and valuation fees', editable: true },
    { key: 'accrualClaimToSpouse', label: 'Accrual claim to spouse', editable: true },
    { key: 'ownEstateCapitalRequired', label: 'Own estate capital required', editable: false, calculated: true },
  ];

  const resultsFields = [
    { key: 'surplus', label: 'Surplus', calculated: true },
    { key: 'estateSurplusUtilisedForDependants', label: 'Estate surplus utilised for dependants', calculated: true },
    { key: 'estatePositionAfterAllocation', label: 'Estate position after allocating surplus to dependants', calculated: true },
  ];

  const renderFieldValue = (field: any) => {
    let value = parameters[field.key as keyof EstatePositionParameters] as string;
    
    // Use calculated values for specific fields
    switch (field.key) {
      case 'ownEstateCapitalProvided':
        value = calculateOwnEstateCapitalProvided();
        break;
      case 'ownEstateCapitalRequired':
        value = calculateOwnEstateCapitalRequired();
        break;
      case 'surplus':
        value = calculateSurplus();
        break;
      case 'estateSurplusUtilisedForDependants':
        value = calculateSurplus(); // Same as surplus for now
        break;
      case 'estatePositionAfterAllocation':
        value = "R 0"; // After allocation, typically zero
        break;
    }

    if (field.editable && editingField === field.key) {
      return (
        <Input
          value={value}
          onChange={(e) => {
            // Update local state immediately for better UX
            const updatedParams = { ...parameters, [field.key]: e.target.value };
            // Don't call API on every keystroke, just update local view
          }}
          onBlur={(e) => handleFieldUpdate(field.key, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleFieldUpdate(field.key, e.currentTarget.value);
            }
            if (e.key === 'Escape') {
              setEditingField(null);
            }
          }}
          className="w-32 text-right text-sm"
          autoFocus
        />
      );
    }

    return (
      <div
        className={`w-32 text-right text-sm font-medium cursor-pointer p-2 rounded ${
          field.calculated 
            ? 'calculated-field bg-gray-50 text-gray-600' 
            : field.editable 
              ? 'text-gray-900 hover:bg-gray-50' 
              : 'text-gray-700'
        }`}
        onClick={() => field.editable && setEditingField(field.key)}
      >
        {value}
      </div>
    );
  };

  const renderTable = (title: string, fields: any[]) => (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide border-b border-gray-200 pb-2">
        {title}
      </h3>
      <div className="space-y-0">
        {fields.map((field, index) => (
          <div 
            key={field.key} 
            className={`flex items-center justify-between gap-3 py-2 px-3 ${
              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            } ${index === fields.length - 1 ? 'border-b-2 border-gray-300' : 'border-b border-gray-100'}`}
          >
            <div className="flex-1">
              <div className="text-sm text-gray-700">{field.label}</div>
            </div>
            {renderFieldValue(field)}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="h-[600px] overflow-y-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Estate Position Parameters</CardTitle>
            <CardDescription>
              Adjust parameters to see real-time projections. Click values to edit.
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/estate-position-parameters'] })}
            disabled={updateMutation.isPending}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderTable('Capital Provided', capitalProvidedFields)}
        {renderTable('Capital Required', capitalRequiredFields)}
        {renderTable('Results', resultsFields)}
        
        {parameters.lastUpdated && (
          <div className="text-xs text-gray-500 text-center pt-4 border-t">
            Last updated: {new Date(parameters.lastUpdated).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}