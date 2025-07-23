import React, { useCallback, useMemo } from "react";
import { RetirementFund, UpdateRetirementFund, Beneficiary } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit3, Plus, Trash2, UserPlus, UserMinus } from "lucide-react";
import { parseBeneficiaries } from "@/lib/beneficiaries";
import { Button } from "@/components/ui/button";
import { nanoid } from "nanoid";

interface ColumnVisibility {
  overview: boolean;
  unapprovedLifeCover: boolean;
  monthlyDeathBenefit: boolean;
  fundValue: boolean;
  fundValueBeneficiaries: boolean;
}

interface SimpleTableWithBeneficiariesProps {
  funds: RetirementFund[];
  columnVisibility: ColumnVisibility;
  tableMode: "inputs" | "flows";
  onFieldUpdate: (id: number, field: keyof UpdateRetirementFund, value: string) => void;
  isUpdating: boolean;
}

// Format currency value
const formatCurrencyValue = (value: string, field: string) => {
  const currencyFields = [
    'coverAmount', 'monthlyIncome', 'approvedLifeCover', 'fundValue', 'fundValueAtDeath', 
    'amount', 'lumpSumTaken', 'nondeductibleContribution', 'livingAnnuity', 'escalationAmount'
  ];
  
  const percentageFields = [
    'increasePercentage', 'beneficiaryPercentageSplit', 'percentage'
  ];
  
  const yearsFields = [
    'termYears', 'incomeTerm'
  ];
  
  if (!currencyFields.includes(field) && !percentageFields.includes(field) && !yearsFields.includes(field)) return value;
  
  const numericValue = value.replace(/[^\d.-]/g, '');
  if (!numericValue || isNaN(Number(numericValue))) return value;
  
  if (currencyFields.includes(field)) {
    return `R ${Math.round(Number(numericValue)).toLocaleString()}`;
  } else if (percentageFields.includes(field)) {
    return `${Number(numericValue)}%`;
  } else if (yearsFields.includes(field)) {
    return `${Number(numericValue)} years`;
  } else {
    return Math.round(Number(numericValue)).toLocaleString();
  }
};

export function SimpleTableWithBeneficiaries({ 
  funds, 
  columnVisibility, 
  tableMode, 
  onFieldUpdate, 
  isUpdating 
}: SimpleTableWithBeneficiariesProps) {
  
  const owners = ["John Doe", "Jane Smith", "Bob Wilson"];

  // Owner management handlers
  const handleOwnerChange = useCallback((fundId: number, ownerIndex: number, newOwner: string) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const currentOwners = JSON.parse(fund.owners || '["John Doe"]');
    currentOwners[ownerIndex] = newOwner;
    onFieldUpdate(fundId, 'owners', JSON.stringify(currentOwners));
  }, [funds, onFieldUpdate]);

  const handleAddOwner = useCallback((fundId: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const currentOwners = JSON.parse(fund.owners || '["John Doe"]');
    const currentPercentages = JSON.parse(fund.ownershipPercentages || '["100"]');
    
    currentOwners.push("John Doe");
    currentPercentages.push("0");
    
    onFieldUpdate(fundId, 'owners', JSON.stringify(currentOwners));
    onFieldUpdate(fundId, 'ownershipPercentages', JSON.stringify(currentPercentages));
  }, [funds, onFieldUpdate]);

  const handleRemoveOwner = useCallback((fundId: number, ownerIndex: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const currentOwners = JSON.parse(fund.owners || '["John Doe"]');
    const currentPercentages = JSON.parse(fund.ownershipPercentages || '["100"]');
    
    if (currentOwners.length <= 1) return;
    
    currentOwners.splice(ownerIndex, 1);
    currentPercentages.splice(ownerIndex, 1);
    
    onFieldUpdate(fundId, 'owners', JSON.stringify(currentOwners));
    onFieldUpdate(fundId, 'ownershipPercentages', JSON.stringify(currentPercentages));
  }, [funds, onFieldUpdate]);

  const handlePercentageChange = useCallback((fundId: number, ownerIndex: number, percentage: string) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const currentPercentages = JSON.parse(fund.ownershipPercentages || '["100"]');
    currentPercentages[ownerIndex] = percentage;
    onFieldUpdate(fundId, 'ownershipPercentages', JSON.stringify(currentPercentages));
  }, [funds, onFieldUpdate]);

  // Beneficiary management handlers
  const handleBeneficiaryUpdate = useCallback((fundId: number, beneficiaryIndex: number, field: string, value: any) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const beneficiaries = parseBeneficiaries(fund.beneficiaries);
    const updatedBeneficiaries = [...beneficiaries];
    
    if (updatedBeneficiaries[beneficiaryIndex]) {
      if (field === 'percentage') {
        updatedBeneficiaries[beneficiaryIndex] = {
          ...updatedBeneficiaries[beneficiaryIndex],
          [field]: Math.max(0, Math.min(100, Number(value) || 0))
        };
      } else {
        updatedBeneficiaries[beneficiaryIndex] = {
          ...updatedBeneficiaries[beneficiaryIndex],
          [field]: value
        };
      }
      
      if (field === 'percentage') {
        const coverAmount = parseFloat(fund.coverAmount.replace(/[^\d.-]/g, '')) || 0;
        updatedBeneficiaries[beneficiaryIndex].coverSplit = 
          `R ${Math.round((coverAmount * updatedBeneficiaries[beneficiaryIndex].percentage / 100)).toLocaleString()}`;
      }
      onFieldUpdate(fundId, 'beneficiaries', JSON.stringify(updatedBeneficiaries));
    }
  }, [funds, onFieldUpdate]);

  const handleAddBeneficiary = useCallback((fundId: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const beneficiaries = parseBeneficiaries(fund.beneficiaries);
    const newBeneficiary: Beneficiary = {
      id: nanoid(),
      name: "",
      percentage: 0,
      coverSplit: "R 0"
    };
    
    onFieldUpdate(fundId, 'beneficiaries', JSON.stringify([...beneficiaries, newBeneficiary]));
  }, [funds, onFieldUpdate]);

  const handleRemoveBeneficiary = useCallback((fundId: number, beneficiaryIndex: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const beneficiaries = parseBeneficiaries(fund.beneficiaries);
    if (beneficiaries.length <= 1) return;
    
    const updatedBeneficiaries = beneficiaries.filter((_, index) => index !== beneficiaryIndex);
    onFieldUpdate(fundId, 'beneficiaries', JSON.stringify(updatedBeneficiaries));
  }, [funds, onFieldUpdate]);

  const handleInputBlur = useCallback((fundId: number, field: keyof UpdateRetirementFund, value: string) => {
    const formattedValue = formatCurrencyValue(value, field);
    onFieldUpdate(fundId, field, formattedValue);
  }, [onFieldUpdate]);

  const renderFundRows = useMemo(() => {
    const rows: JSX.Element[] = [];
    
    funds.forEach((fund) => {
      const beneficiaries = parseBeneficiaries(fund.beneficiaries);
      const fundOwners = JSON.parse(fund.owners || '["John Doe"]');
      const ownershipPercentages = JSON.parse(fund.ownershipPercentages || '["100"]');
      
      // Main fund row
      rows.push(
        <tr key={`${fund.id}-main`} className="hover:bg-neutral-50">
          {/* Overview Section */}
          {columnVisibility.overview && (
            <>
              <td className="table-cell whitespace-nowrap table-text-14 text-neutral-900" rowSpan={fundOwners.length}>
                <input
                  defaultValue={fund.description || ""}
                  onBlur={(e) => onFieldUpdate(fund.id, "description", e.target.value)}
                  className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                  style={{ textAlign: "left", fontWeight: "500", minWidth: "140px" }}
                  placeholder="Fund description"
                  disabled={isUpdating}
                />
              </td>
              <td className="p-2 text-right">
                <div className="flex items-center gap-2">
                  <Select
                    value={fundOwners[0]}
                    onValueChange={(value) => handleOwnerChange(fund.id, 0, value)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="table-input h-7 min-w-[120px] w-full max-w-[160px] text-right border-0 focus:bg-white focus:border focus:border-primary hover:bg-neutral-50 transition-colors duration-200 group">
                      <SelectValue className="text-right pr-6" />
                      <Edit3 size={12} className="ml-1 text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </SelectTrigger>
                    <SelectContent>
                      {owners.map((ownerOption) => (
                        <SelectItem key={ownerOption} value={ownerOption}>
                          {ownerOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fundOwners.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveOwner(fund.id, 0)}
                      disabled={isUpdating}
                      className="h-6 w-6 p-0 bg-white text-[#4F4F4F] hover:text-red-600 hover:bg-red-50 border border-gray-300"
                      title="Remove owner"
                    >
                      <UserMinus className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddOwner(fund.id)}
                    disabled={isUpdating}
                    className="h-6 w-6 p-0 bg-blue-50 text-primary hover:bg-blue-100 border-0"
                    title="Add owner"
                  >
                    <UserPlus className="h-3 w-3" />
                  </Button>
                </div>
              </td>
              <td className="p-2 text-right">
                <input
                  type="text"
                  defaultValue={`${ownershipPercentages[0] || '100'}%`}
                  onBlur={(e) => {
                    const formattedValue = formatCurrencyValue(e.target.value, "percentage");
                    if (formattedValue !== e.target.value) {
                      e.target.value = formattedValue;
                    }
                    handlePercentageChange(fund.id, 0, e.target.value.replace('%', ''));
                  }}
                  className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                  style={{ textAlign: "right", minWidth: "70px" }}
                  disabled={isUpdating}
                />
              </td>
            </>
          )}
          
          
          {/* Monthly Death Benefit Section */}
          {columnVisibility.monthlyDeathBenefit && (
            <>
              <td className="p-2 text-right border-l border-neutral-300" rowSpan={fundOwners.length}>
                <input
                  defaultValue={fund.monthlyIncome || ""}
                  onBlur={(e) => {
                    const formattedValue = formatCurrencyValue(e.target.value, "monthlyIncome");
                    if (formattedValue !== e.target.value) {
                      e.target.value = formattedValue;
                    }
                    handleInputBlur(fund.id, "monthlyIncome", e.target.value);
                  }}
                  className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                  style={{ textAlign: "right", minWidth: "120px" }}
                  placeholder="R 0"
                  disabled={isUpdating}
                />
              </td>
              <td className="p-2 text-right" rowSpan={fundOwners.length}>
                <input
                  defaultValue={fund.increasePercentage || ""}
                  onBlur={(e) => {
                    const formattedValue = formatCurrencyValue(e.target.value, "increasePercentage");
                    if (formattedValue !== e.target.value) {
                      e.target.value = formattedValue;
                    }
                    handleInputBlur(fund.id, "increasePercentage", e.target.value);
                  }}
                  className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                  style={{ textAlign: "right", minWidth: "80px" }}
                  placeholder="0%"
                  disabled={isUpdating}
                />
              </td>
              <td className="p-2 text-right" rowSpan={fundOwners.length}>
                <input
                  defaultValue={fund.termYears || ""}
                  onBlur={(e) => {
                    const formattedValue = formatCurrencyValue(e.target.value, "termYears");
                    if (formattedValue !== e.target.value) {
                      e.target.value = formattedValue;
                    }
                    handleInputBlur(fund.id, "termYears", e.target.value);
                  }}
                  className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                  style={{ textAlign: "right", minWidth: "90px" }}
                  placeholder="0 years"
                  disabled={isUpdating}
                />
              </td>
            </>
          )}
          
          {/* Fund Value Section */}
          {columnVisibility.fundValue && (
            <>
              <td className="p-2 text-right border-l border-neutral-300" rowSpan={fundOwners.length}>
                <input
                  defaultValue={fund.fundValue || ""}
                  onBlur={(e) => {
                    const formattedValue = formatCurrencyValue(e.target.value, "fundValue");
                    if (formattedValue !== e.target.value) {
                      e.target.value = formattedValue;
                    }
                    handleInputBlur(fund.id, "fundValue", e.target.value);
                  }}
                  className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                  style={{ textAlign: "right", minWidth: "120px" }}
                  placeholder="R 0"
                  disabled={isUpdating}
                />
              </td>
              <td className="p-2 text-right" rowSpan={fundOwners.length}>
                <input
                  defaultValue={fund.fundValueAtDeath || ""}
                  onBlur={(e) => {
                    const formattedValue = formatCurrencyValue(e.target.value, "fundValueAtDeath");
                    if (formattedValue !== e.target.value) {
                      e.target.value = formattedValue;
                    }
                    handleInputBlur(fund.id, "fundValueAtDeath", e.target.value);
                  }}
                  className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                  style={{ textAlign: "right", minWidth: "120px" }}
                  placeholder="R 0"
                  disabled={isUpdating}
                />
              </td>
            </>
          )}
          
          {/* Fund Value Beneficiaries Section */}
          {columnVisibility.fundValueBeneficiaries && (
            <>
              <td className="p-2 text-left border-l border-neutral-300" rowSpan={fundOwners.length}>
                <input
                  defaultValue={beneficiaries[0]?.name || ""}
                  onBlur={(e) => handleBeneficiaryUpdate(fund.id, 0, 'name', e.target.value)}
                  className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                  style={{ textAlign: "left", minWidth: "120px" }}
                  placeholder="Beneficiary name"
                  disabled={isUpdating}
                />
              </td>
              <td className="p-2 text-right" rowSpan={fundOwners.length}>
                <input
                  defaultValue={`${beneficiaries[0]?.percentage || 0}%`}
                  onBlur={(e) => {
                    const formattedValue = formatCurrencyValue(e.target.value, "percentage");
                    if (formattedValue !== e.target.value) {
                      e.target.value = formattedValue;
                    }
                    handleBeneficiaryUpdate(fund.id, 0, 'percentage', parseFloat(e.target.value.replace('%', '')) || 0);
                  }}
                  className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                  style={{ textAlign: "right", minWidth: "60px" }}
                  disabled={isUpdating}
                />
              </td>
              <td className="p-2 text-right" rowSpan={fundOwners.length}>
                <input
                  defaultValue={fund.amount || ""}
                  onBlur={(e) => {
                    const formattedValue = formatCurrencyValue(e.target.value, "amount");
                    if (formattedValue !== e.target.value) {
                      e.target.value = formattedValue;
                    }
                    handleInputBlur(fund.id, "amount", e.target.value);
                  }}
                  className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                  style={{ textAlign: "right", minWidth: "120px" }}
                  placeholder="R 0"
                  disabled={isUpdating}
                />
              </td>
              <td className="p-2 text-right" rowSpan={fundOwners.length}>
                <input
                  defaultValue={fund.lumpSumTaken || ""}
                  onBlur={(e) => {
                    const formattedValue = formatCurrencyValue(e.target.value, "lumpSumTaken");
                    if (formattedValue !== e.target.value) {
                      e.target.value = formattedValue;
                    }
                    handleInputBlur(fund.id, "lumpSumTaken", e.target.value);
                  }}
                  className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                  style={{ textAlign: "right", minWidth: "120px" }}
                  placeholder="R 0"
                  disabled={isUpdating}
                />
              </td>
              <td className="p-2 text-right" rowSpan={fundOwners.length}>
                <input
                  defaultValue={fund.nondeductibleContribution || ""}
                  onBlur={(e) => {
                    const formattedValue = formatCurrencyValue(e.target.value, "nondeductibleContribution");
                    if (formattedValue !== e.target.value) {
                      e.target.value = formattedValue;
                    }
                    handleInputBlur(fund.id, "nondeductibleContribution", e.target.value);
                  }}
                  className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                  style={{ textAlign: "right", minWidth: "120px" }}
                  placeholder="R 0"
                  disabled={isUpdating}
                />
              </td>
              <td className="p-2 text-right" rowSpan={fundOwners.length}>
                <input
                  defaultValue={fund.livingAnnuity || ""}
                  onBlur={(e) => {
                    const formattedValue = formatCurrencyValue(e.target.value, "livingAnnuity");
                    if (formattedValue !== e.target.value) {
                      e.target.value = formattedValue;
                    }
                    handleInputBlur(fund.id, "livingAnnuity", e.target.value);
                  }}
                  className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                  style={{ textAlign: "right", minWidth: "120px" }}
                  placeholder="R 0"
                  disabled={isUpdating}
                />
              </td>
              <td className="p-2 text-right" rowSpan={fundOwners.length}>
                <input
                  defaultValue={fund.incomeTerm || ""}
                  onBlur={(e) => {
                    const formattedValue = formatCurrencyValue(e.target.value, "incomeTerm");
                    if (formattedValue !== e.target.value) {
                      e.target.value = formattedValue;
                    }
                    handleInputBlur(fund.id, "incomeTerm", e.target.value);
                  }}
                  className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                  style={{ textAlign: "right", minWidth: "90px" }}
                  placeholder="0 years"
                  disabled={isUpdating}
                />
              </td>
            </>
          )}
          
          {/* Unapproved Life Cover Section */}
          {columnVisibility.unapprovedLifeCover && (
            <>
              <td className="p-2 text-right border-l border-neutral-300" rowSpan={fundOwners.length}>
                <input
                  defaultValue={fund.coverAmount || ""}
                  onBlur={(e) => {
                    const formattedValue = formatCurrencyValue(e.target.value, "coverAmount");
                    if (formattedValue !== e.target.value) {
                      e.target.value = formattedValue;
                    }
                    handleInputBlur(fund.id, "coverAmount", e.target.value);
                  }}
                  className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                  style={{ textAlign: "right", minWidth: "120px" }}
                  placeholder="R 0"
                  disabled={isUpdating}
                />
              </td>
              <td className="p-2 text-left" rowSpan={fundOwners.length}>
                <input
                  defaultValue={beneficiaries[0]?.name || ""}
                  onBlur={(e) => handleBeneficiaryUpdate(fund.id, 0, 'name', e.target.value)}
                  className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                  style={{ textAlign: "left", minWidth: "120px" }}
                  placeholder="Beneficiary name"
                  disabled={isUpdating}
                />
              </td>
              <td className="p-2 text-right" rowSpan={fundOwners.length}>
                <input
                  defaultValue={`${beneficiaries[0]?.percentage || 0}%`}
                  onBlur={(e) => {
                    const formattedValue = formatCurrencyValue(e.target.value, "percentage");
                    if (formattedValue !== e.target.value) {
                      e.target.value = formattedValue;
                    }
                    handleBeneficiaryUpdate(fund.id, 0, 'percentage', parseFloat(e.target.value.replace('%', '')) || 0);
                  }}
                  className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                  style={{ textAlign: "right", minWidth: "60px" }}
                  disabled={isUpdating}
                />
              </td>
              <td className="p-2 text-right" rowSpan={fundOwners.length}>
                <span className="table-text-14 text-neutral-900">
                  {beneficiaries[0]?.coverSplit || 'R 0'}
                </span>
              </td>
              <td className="p-2" rowSpan={fundOwners.length}>
                <div className="flex items-center gap-2">
                  {beneficiaries.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveBeneficiary(fund.id, 0)}
                      disabled={isUpdating}
                      className="h-6 w-6 p-0 bg-white text-[#4F4F4F] hover:text-red-600 hover:bg-red-50 border border-gray-300"
                      title="Remove beneficiary"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddBeneficiary(fund.id)}
                    disabled={isUpdating}
                    className="h-6 w-6 p-0 bg-blue-50 text-primary hover:bg-blue-100 border-0"
                    title="Add beneficiary"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </td>
            </>
          )}
        </tr>
      );
      
      // Additional owner rows (compact nested pattern)
      if (fundOwners.length > 1) {
        fundOwners.slice(1).forEach((owner: string, index: number) => {
          const actualIndex = index + 1;
          rows.push(
            <tr key={`${fund.id}-owner-${actualIndex}`} className="hover:bg-neutral-50 border-l-2 border-blue-200">
              {/* Only show owner fields for additional owners */}
              {columnVisibility.overview && (
                <>
                  <td className="p-2 text-right pl-6">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500 mr-1">↳</span>
                      <Select
                        value={owner}
                        onValueChange={(value) => handleOwnerChange(fund.id, actualIndex, value)}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="table-input h-7 min-w-[120px] w-full max-w-[160px] text-right border-0 focus:bg-white focus:border focus:border-primary hover:bg-neutral-50 transition-colors duration-200 group">
                          <SelectValue className="text-right pr-6" />
                          <Edit3 size={12} className="ml-1 text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </SelectTrigger>
                        <SelectContent>
                          {owners.map((ownerOption) => (
                            <SelectItem key={ownerOption} value={ownerOption}>
                              {ownerOption}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOwner(fund.id, actualIndex)}
                        disabled={isUpdating}
                        className="h-6 w-6 p-0 bg-white text-[#4F4F4F] hover:text-red-600 hover:bg-red-50 border border-gray-300"
                        title="Remove owner"
                      >
                        <UserMinus className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="p-2 text-right">
                    <input
                      type="text"
                      defaultValue={`${ownershipPercentages[actualIndex] || '0'}%`}
                      onBlur={(e) => {
                        const formattedValue = formatCurrencyValue(e.target.value, "percentage");
                        if (formattedValue !== e.target.value) {
                          e.target.value = formattedValue;
                        }
                        handlePercentageChange(fund.id, actualIndex, e.target.value.replace('%', ''));
                      }}
                      className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                      style={{ textAlign: "right", minWidth: "70px" }}
                      disabled={isUpdating}
                    />
                  </td>
                </>
              )}
              
              {/* Skip other sections for additional owner rows */}
              {columnVisibility.monthlyDeathBenefit && (
                <>
                  <td></td>
                  <td></td>
                  <td></td>
                </>
              )}
              
              {columnVisibility.fundValue && (
                <>
                  <td></td>
                  <td></td>
                </>
              )}
              
              {columnVisibility.fundValueBeneficiaries && (
                <>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </>
              )}
              
              {columnVisibility.unapprovedLifeCover && (
                <>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </>
              )}
            </tr>
          );
        });
      }
      
      // Additional beneficiary rows (compact nested pattern)
      if (beneficiaries.length > 1) {
        beneficiaries.slice(1).forEach((beneficiary, index) => {
          const actualIndex = index + 1;
          rows.push(
            <tr key={`${fund.id}-beneficiary-${actualIndex}`} className="hover:bg-neutral-50 border-l-2 border-green-200">
              {/* Skip overview columns for beneficiary rows */}
              {columnVisibility.overview && (
                <>
                  <td></td>
                  <td></td>
                </>
              )}
              
              {/* Skip Monthly Death Benefit columns */}
              {columnVisibility.monthlyDeathBenefit && (
                <>
                  <td></td>
                  <td></td>
                  <td></td>
                </>
              )}
              
              {/* Skip Fund Value columns */}
              {columnVisibility.fundValue && (
                <>
                  <td></td>
                  <td></td>
                </>
              )}
              
              {/* Fund Value Beneficiaries Section - show beneficiary fields */}
              {columnVisibility.fundValueBeneficiaries && (
                <>
                  <td className="p-2 text-left pl-6">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500 mr-1">↳</span>
                      <input
                        defaultValue={beneficiary.name || ""}
                        onBlur={(e) => handleBeneficiaryUpdate(fund.id, actualIndex, 'name', e.target.value)}
                        className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                        style={{ textAlign: "left", minWidth: "120px" }}
                        placeholder="Beneficiary name"
                        disabled={isUpdating}
                      />
                    </div>
                  </td>
                  <td className="p-2 text-right">
                    <input
                      defaultValue={`${beneficiary.percentage || 0}%`}
                      onBlur={(e) => {
                        const formattedValue = formatCurrencyValue(e.target.value, "percentage");
                        if (formattedValue !== e.target.value) {
                          e.target.value = formattedValue;
                        }
                        handleBeneficiaryUpdate(fund.id, actualIndex, 'percentage', parseFloat(e.target.value.replace('%', '')) || 0);
                      }}
                      className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                      style={{ textAlign: "right", minWidth: "60px" }}
                      disabled={isUpdating}
                    />
                  </td>
                  <td className="p-2 text-right">
                    <span className="table-text-14 text-neutral-900">R 0</span>
                  </td>
                  <td className="p-2 text-right">
                    <span className="table-text-14 text-neutral-900">R 0</span>
                  </td>
                  <td className="p-2 text-right">
                    <span className="table-text-14 text-neutral-900">R 0</span>
                  </td>
                  <td className="p-2 text-right">
                    <span className="table-text-14 text-neutral-900">R 0</span>
                  </td>
                  <td className="p-2 text-right">
                    <span className="table-text-14 text-neutral-900">0 years</span>
                  </td>
                </>
              )}
              
              {/* Unapproved Life Cover Section - only show beneficiary fields */}
              {columnVisibility.unapprovedLifeCover && (
                <>
                  <td></td>
                  <td className="p-2 text-left pl-6">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500 mr-1">↳</span>
                      <input
                        defaultValue={beneficiary.name || ""}
                        onBlur={(e) => handleBeneficiaryUpdate(fund.id, actualIndex, 'name', e.target.value)}
                        className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                        style={{ textAlign: "left", minWidth: "120px" }}
                        placeholder="Beneficiary name"
                        disabled={isUpdating}
                      />
                    </div>
                  </td>
                  <td className="p-2 text-right">
                    <input
                      defaultValue={`${beneficiary.percentage || 0}%`}
                      onBlur={(e) => {
                        const formattedValue = formatCurrencyValue(e.target.value, "percentage");
                        if (formattedValue !== e.target.value) {
                          e.target.value = formattedValue;
                        }
                        handleBeneficiaryUpdate(fund.id, actualIndex, 'percentage', parseFloat(e.target.value.replace('%', '')) || 0);
                      }}
                      className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                      style={{ textAlign: "right", minWidth: "60px" }}
                      disabled={isUpdating}
                    />
                  </td>
                  <td className="p-2 text-right">
                    <span className="table-text-14 text-neutral-900">
                      {beneficiary.coverSplit || 'R 0'}
                    </span>
                  </td>
                  <td className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveBeneficiary(fund.id, actualIndex)}
                      disabled={isUpdating}
                      className="h-6 w-6 p-0 bg-white text-[#4F4F4F] hover:text-red-600 hover:bg-red-50 border border-gray-300"
                      title="Remove beneficiary"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </>
              )}
            </tr>
          );
        });
      }
    });
    
    return rows;
  }, [funds, columnVisibility, isUpdating, owners, handleOwnerChange, handleAddOwner, handleRemoveOwner, handlePercentageChange, handleBeneficiaryUpdate, handleAddBeneficiary, handleRemoveBeneficiary, onFieldUpdate]);

  if (funds.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No retirement funds to display.
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full min-w-max table-fixed">
        <thead className="sticky top-0 z-10 bg-neutral-50 border-b border-neutral-300">
          <tr>
            {columnVisibility.overview && (
              <>
                <th className="table-header text-left text-xs font-medium text-neutral-600 uppercase p-3" style={{ width: "200px" }}>
                  Fund Description
                </th>
                <th className="table-header text-right text-xs font-medium text-neutral-600 uppercase p-3" style={{ width: "160px" }}>
                  Owner
                </th>
                <th className="table-header text-right text-xs font-medium text-neutral-600 uppercase p-3" style={{ width: "80px" }}>
                  %
                </th>
              </>
            )}
            {columnVisibility.monthlyDeathBenefit && (
              <>
                <th className="table-header text-right text-xs font-medium text-neutral-600 uppercase p-3 border-l border-neutral-300" style={{ width: "140px" }}>
                  Monthly Income
                </th>
                <th className="table-header text-right text-xs font-medium text-neutral-600 uppercase p-3" style={{ width: "80px" }}>
                  Increase %
                </th>
                <th className="table-header text-right text-xs font-medium text-neutral-600 uppercase p-3" style={{ width: "90px" }}>
                  Term (Years)
                </th>
              </>
            )}
            {columnVisibility.fundValue && (
              <>
                <th className="table-header text-right text-xs font-medium text-neutral-600 uppercase p-3 border-l border-neutral-300" style={{ width: "140px" }}>
                  Fund Value
                </th>
                <th className="table-header text-right text-xs font-medium text-neutral-600 uppercase p-3" style={{ width: "140px" }}>
                  Fund Value at Death
                </th>
              </>
            )}
            {columnVisibility.fundValueBeneficiaries && (
              <>
                <th className="table-header text-left text-xs font-medium text-neutral-600 uppercase p-3 border-l border-neutral-300" style={{ width: "140px" }}>
                  Beneficiary Name
                </th>
                <th className="table-header text-right text-xs font-medium text-neutral-600 uppercase p-3" style={{ width: "80px" }}>
                  %
                </th>
                <th className="table-header text-right text-xs font-medium text-neutral-600 uppercase p-3" style={{ width: "120px" }}>
                  Amount
                </th>
                <th className="table-header text-right text-xs font-medium text-neutral-600 uppercase p-3" style={{ width: "120px" }}>
                  Lump Sum Taken
                </th>
                <th className="table-header text-right text-xs font-medium text-neutral-600 uppercase p-3" style={{ width: "140px" }}>
                  Non-deductible Contribution
                </th>
                <th className="table-header text-right text-xs font-medium text-neutral-600 uppercase p-3" style={{ width: "120px" }}>
                  Living Annuity
                </th>
                <th className="table-header text-right text-xs font-medium text-neutral-600 uppercase p-3" style={{ width: "90px" }}>
                  Income Term
                </th>
              </>
            )}
            {columnVisibility.unapprovedLifeCover && (
              <>
                <th className="table-header text-right text-xs font-medium text-neutral-600 uppercase p-3 border-l border-neutral-300" style={{ width: "140px" }}>
                  Cover Amount
                </th>
                <th className="table-header text-left text-xs font-medium text-neutral-600 uppercase p-3" style={{ width: "140px" }}>
                  Beneficiary Name
                </th>
                <th className="table-header text-right text-xs font-medium text-neutral-600 uppercase p-3" style={{ width: "80px" }}>
                  %
                </th>
                <th className="table-header text-right text-xs font-medium text-neutral-600 uppercase p-3" style={{ width: "120px" }}>
                  Cover Split
                </th>
                <th className="table-header text-center text-xs font-medium text-neutral-600 uppercase p-3" style={{ width: "80px" }}>
                  Actions
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {renderFundRows}
        </tbody>
      </table>
    </div>
  );
}