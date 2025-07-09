import React, { useRef, useEffect, useMemo, useCallback } from "react";
import { RetirementFund, UpdateRetirementFund, Beneficiary } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { parseBeneficiaries } from "@/lib/beneficiaries";
import { Input } from "@/components/ui/input";
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

// Auto-resizing input component
function AutoSizeInput({ 
  value, 
  onChange, 
  className = "", 
  style = {}, 
  ...props 
}: { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  className?: string; 
  style?: React.CSSProperties;
  [key: string]: any;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.width = 'auto';
      inputRef.current.style.width = Math.max(inputRef.current.scrollWidth, 60) + 'px';
    }
  }, [value]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={onChange}
      className={`compact-input bg-[#F2F7FB] border-none focus:bg-white focus:border focus:border-primary hover:bg-neutral-50 transition-colors duration-200 ${className}`}
      style={{ minWidth: '60px', ...style }}
      {...props}
    />
  );
}

export function SimpleTableWithBeneficiaries({ funds, columnVisibility, tableMode, onFieldUpdate, isUpdating }: SimpleTableWithBeneficiariesProps) {
  
  // Memoized handlers
  const handleInputChange = useCallback((fundId: number, field: keyof UpdateRetirementFund, value: string) => {
    onFieldUpdate(fundId, field, value);
  }, [onFieldUpdate]);

  const handleBeneficiaryUpdate = useCallback((fundId: number, beneficiaryIndex: number, field: keyof Beneficiary, value: string | number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;

    const currentBeneficiaries = parseBeneficiaries(fund.beneficiaries);
    const updatedBeneficiaries = [...currentBeneficiaries];
    
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

      // Update cover splits when percentages change
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

    const currentBeneficiaries = parseBeneficiaries(fund.beneficiaries);
    const coverAmount = parseFloat(fund.coverAmount?.replace(/[^\d.-]/g, '') || '0') || 0;
    const newBeneficiary: Beneficiary = {
      id: nanoid(),
      name: "",
      percentage: 100,
      coverSplit: `R ${Math.round(coverAmount).toLocaleString()}`
    };

    const updatedBeneficiaries = [...currentBeneficiaries, newBeneficiary];
    onFieldUpdate(fundId, 'beneficiaries', JSON.stringify(updatedBeneficiaries));
  }, [funds, onFieldUpdate]);

  const handleRemoveBeneficiary = useCallback((fundId: number, beneficiaryIndex: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;

    const currentBeneficiaries = parseBeneficiaries(fund.beneficiaries);
    if (currentBeneficiaries.length <= 1) return;

    const updatedBeneficiaries = currentBeneficiaries.filter((_, index) => index !== beneficiaryIndex);
    
    // Auto-adjust percentages
    const totalPercentage = updatedBeneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    if (totalPercentage > 0 && totalPercentage !== 100) {
      const adjustmentFactor = 100 / totalPercentage;
      const coverAmount = parseFloat(fund.coverAmount.replace(/[^\d.-]/g, '')) || 0;
      
      updatedBeneficiaries.forEach(b => {
        b.percentage = Math.round(b.percentage * adjustmentFactor * 100) / 100;
        b.coverSplit = `R ${Math.round((coverAmount * b.percentage / 100)).toLocaleString()}`;
      });
    }

    onFieldUpdate(fundId, 'beneficiaries', JSON.stringify(updatedBeneficiaries));
  }, [funds, onFieldUpdate]);

  const owners = useMemo(() => ["John Doe", "Jane Smith"], []);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white table-fixed" style={{ tableLayout: 'fixed' }}>
        <thead>
          {/* First level headers */}
          <tr className="border-b border-neutral-200" style={{ backgroundColor: '#D6ECF5' }}>
            {columnVisibility.overview && (
              <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs" colSpan={2}>
                Overview
              </th>
            )}
            {columnVisibility.unapprovedLifeCover && (
              <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs border-l border-neutral-300" colSpan={5}>
                Unapproved life cover
              </th>
            )}
            {columnVisibility.monthlyDeathBenefit && (
              <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs border-l border-neutral-300" colSpan={5}>
                Monthly death benefit
              </th>
            )}
            {columnVisibility.fundValue && (
              <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs border-l border-neutral-300" colSpan={4}>
                Fund value
              </th>
            )}
            {columnVisibility.fundValueBeneficiaries && (
              <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs border-l border-neutral-300" colSpan={9}>
                Fund value beneficiaries
              </th>
            )}
          </tr>
          
          {/* Second level headers */}
          <tr className="border-b border-neutral-200" style={{ backgroundColor: '#D6ECF5' }}>
            {columnVisibility.overview && (
              <>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Description
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Owner
                </th>
              </>
            )}
            {columnVisibility.unapprovedLifeCover && (
              <>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider border-l border-neutral-300">
                  Cover amount
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Beneficiary
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  %
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Cover split
                </th>
                <th className="table-cell text-center table-header-12 text-neutral-600 uppercase tracking-wider">
                  Actions
                </th>
              </>
            )}
            {columnVisibility.monthlyDeathBenefit && (
              <>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider border-l border-neutral-300">
                  Monthly income
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Term (Years)
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Increase %
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Escalation amount
                </th>
                <th className="table-cell text-center table-header-12 text-neutral-600 uppercase tracking-wider">
                  Actions
                </th>
              </>
            )}
            {columnVisibility.fundValue && (
              <>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider border-l border-neutral-300">
                  Approved life cover
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Fund value
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Fund value at death
                </th>
                <th className="table-cell text-center table-header-12 text-neutral-600 uppercase tracking-wider">
                  Actions
                </th>
              </>
            )}
            {columnVisibility.fundValueBeneficiaries && (
              <>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider border-l border-neutral-300">
                  Name
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  %
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Lump sum taken
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Fund value at death
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Non deductible contribution amount
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Living annuity
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Income term
                </th>
                <th className="table-cell text-center table-header-12 text-neutral-600 uppercase tracking-wider">
                  Actions
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {funds.flatMap((fund) => {
            const beneficiaries = parseBeneficiaries(fund.beneficiaries);
            console.log('Fund beneficiaries debug:', { fundId: fund.id, beneficiaries, raw: fund.beneficiaries });
            const rows = [];
            
            // Create main fund row
            rows.push(
              <tr key={fund.id} className="hover:bg-neutral-50">
                {/* Overview Section */}
                {columnVisibility.overview && (
                  <>
                    <td className="table-cell whitespace-nowrap table-text-14 text-neutral-900">
                      <AutoSizeInput
                        value={fund.description || ""}
                        onChange={(e) => handleInputChange(fund.id, "description", e.target.value)}
                        className="border-0 focus:bg-white focus:border focus:border-primary hover:bg-neutral-50 text-left font-medium"
                        placeholder="Fund description"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <Select
                        value={fund.owner || "John Doe"}
                        onValueChange={(value) => handleInputChange(fund.id, "owner", value)}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="compact-input border-0 focus:bg-white focus:border focus:border-primary hover:bg-neutral-50 transition-colors duration-200 group">
                          <SelectValue />
                          <Edit3 size={12} className="ml-1 text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </SelectTrigger>
                        <SelectContent>
                          {owners.map((owner) => (
                            <SelectItem key={owner} value={owner}>
                              {owner}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </>
                )}

                {/* Unapproved Life Cover Section */}
                {columnVisibility.unapprovedLifeCover && (
                  <>
                    <td className="p-2 text-right border-l border-neutral-300" style={{ width: '140px' }}>
                      <AutoSizeInput
                        value={fund.coverAmount || ""}
                        onChange={(e) => handleInputChange(fund.id, "coverAmount", e.target.value)}
                        className="table-input w-full" style={{ textAlign: "right" }}
                        placeholder="R 0"
                        disabled={isUpdating}
                      />
                    </td>
                    {beneficiaries.length > 0 ? (
                      <>
                        <td className="p-2" style={{ width: '200px' }}>
                          <Input
                            value={beneficiaries[0].name}
                            onChange={(e) => handleBeneficiaryUpdate(fund.id, 0, 'name', e.target.value)}
                            placeholder="Beneficiary name"
                            disabled={isUpdating}
                            className="w-full h-7 text-sm text-left bg-white border-gray-200 focus:border-primary"
                          />
                        </td>
                        <td className="p-2" style={{ width: '120px' }}>
                          <Input
                            type="number"
                            value={beneficiaries[0].percentage || 0}
                            onChange={(e) => handleBeneficiaryUpdate(fund.id, 0, 'percentage', e.target.value)}
                            min="0"
                            max="100"
                            step="0.1"
                            disabled={isUpdating}
                            className="w-full h-7 text-sm text-center bg-white border-gray-200 focus:border-primary"
                            placeholder="0"
                          />
                        </td>
                        <td className="p-2" style={{ width: '140px' }}>
                          <div className="w-full h-7 text-sm text-right px-2 py-1 bg-gray-100 border rounded text-gray-600 flex items-center">
                            <span className="truncate flex-1">{beneficiaries[0].coverSplit}</span>
                          </div>
                        </td>
                        <td className="p-2" style={{ width: '80px' }}>
                          <div className="flex gap-1 justify-start">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddBeneficiary(fund.id)}
                              disabled={isUpdating || beneficiaries.length >= 10}
                              className="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-2" style={{ width: '200px' }}>
                          <div className="w-full h-7 text-sm text-gray-400 px-2 py-1 bg-gray-50 border border-dashed rounded flex items-center justify-center">
                            No beneficiaries
                          </div>
                        </td>
                        <td className="p-2" style={{ width: '120px' }}></td>
                        <td className="p-2" style={{ width: '140px' }}></td>
                        <td className="p-2" style={{ width: '80px' }}>
                          <div className="flex justify-start">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddBeneficiary(fund.id)}
                              disabled={isUpdating}
                              className="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </>
                )}

                {/* Other sections for main row */}
                {columnVisibility.monthlyDeathBenefit && (
                  <>
                    <td className="p-2 text-right border-l border-neutral-300">
                      <AutoSizeInput
                        value={fund.monthlyIncome || ""}
                        onChange={(e) => handleInputChange(fund.id, "monthlyIncome", e.target.value)}
                        className="table-input" style={{ textAlign: "right" }}
                        placeholder="R 0"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <AutoSizeInput
                        value={fund.termYears || ""}
                        onChange={(e) => handleInputChange(fund.id, "termYears", e.target.value)}
                        className="table-input" style={{ textAlign: "right" }}
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <AutoSizeInput
                        value={fund.increasePercentage || ""}
                        onChange={(e) => handleInputChange(fund.id, "increasePercentage", e.target.value)}
                        className="table-input" style={{ textAlign: "right" }}
                        placeholder="0%"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <AutoSizeInput
                        value={fund.escalationAmount || ""}
                        onChange={(e) => handleInputChange(fund.id, "escalationAmount", e.target.value)}
                        className="table-input" style={{ textAlign: "right" }}
                        placeholder="R 0"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2"></td>
                  </>
                )}

                {columnVisibility.fundValue && (
                  <>
                    <td className="p-2 text-right border-l border-neutral-300">
                      <AutoSizeInput
                        value={fund.approvedLifeCover || ""}
                        onChange={(e) => handleInputChange(fund.id, "approvedLifeCover", e.target.value)}
                        className="table-input" style={{ textAlign: "right" }}
                        placeholder="R 0"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <AutoSizeInput
                        value={fund.fundValue || ""}
                        onChange={(e) => handleInputChange(fund.id, "fundValue", e.target.value)}
                        className="table-input" style={{ textAlign: "right" }}
                        placeholder="R 0"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <AutoSizeInput
                        value={fund.fundValueAtDeath || ""}
                        onChange={(e) => handleInputChange(fund.id, "fundValueAtDeath", e.target.value)}
                        className="table-input" style={{ textAlign: "right" }}
                        placeholder="R 0"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2"></td>
                  </>
                )}

                {columnVisibility.fundValueBeneficiaries && (
                  <>
                    <td className="p-2 text-right border-l border-neutral-300">
                      <AutoSizeInput
                        value={fund.beneficiaryName || ""}
                        onChange={(e) => handleInputChange(fund.id, "beneficiaryName", e.target.value)}
                        className="table-input" style={{ textAlign: "right" }}
                        placeholder="Beneficiary name"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <AutoSizeInput
                        value={fund.beneficiaryPercentageSplit || ""}
                        onChange={(e) => handleInputChange(fund.id, "beneficiaryPercentageSplit", e.target.value)}
                        className="table-input" style={{ textAlign: "right" }}
                        placeholder="0%"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <AutoSizeInput
                        value={fund.amount || ""}
                        onChange={(e) => handleInputChange(fund.id, "amount", e.target.value)}
                        className="table-input" style={{ textAlign: "right" }}
                        placeholder="R 0"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <AutoSizeInput
                        value={fund.lumpSumTaken || ""}
                        onChange={(e) => handleInputChange(fund.id, "lumpSumTaken", e.target.value)}
                        className="table-input" style={{ textAlign: "right" }}
                        placeholder="R 0"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <AutoSizeInput
                        value={fund.fundValueAtDeath || ""}
                        onChange={(e) => handleInputChange(fund.id, "fundValueAtDeath", e.target.value)}
                        className="table-input" style={{ textAlign: "right" }}
                        placeholder="R 0"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <AutoSizeInput
                        value={fund.nondeductibleContribution || ""}
                        onChange={(e) => handleInputChange(fund.id, "nondeductibleContribution", e.target.value)}
                        className="table-input" style={{ textAlign: "right" }}
                        placeholder="R 0"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <AutoSizeInput
                        value={fund.livingAnnuity || ""}
                        onChange={(e) => handleInputChange(fund.id, "livingAnnuity", e.target.value)}
                        className="table-input" style={{ textAlign: "right" }}
                        placeholder=""
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <AutoSizeInput
                        value={fund.incomeTerm || ""}
                        onChange={(e) => handleInputChange(fund.id, "incomeTerm", e.target.value)}
                        className="table-input" style={{ textAlign: "right" }}
                        placeholder="Income term"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2"></td>
                  </>
                )}
              </tr>
            );

            // Add additional beneficiary rows (starting from index 1)
            beneficiaries.slice(1).forEach((beneficiary, index) => {
              const actualIndex = index + 1; // Since we're starting from slice(1)
              rows.push(
                <tr key={`${fund.id}-beneficiary-${beneficiary.id}`} className="bg-teal-50/30 hover:bg-teal-50">
                  {/* Empty cells for overview columns */}
                  {columnVisibility.overview && (
                    <>
                      <td className="p-2 text-xs text-gray-500 pl-6">↳ Beneficiary {actualIndex + 1}</td>
                      <td className="p-2"></td>
                    </>
                  )}

                  {/* Beneficiary details in unapproved life cover section */}
                  {columnVisibility.unapprovedLifeCover && (
                    <>
                      <td className="p-2 border-l border-neutral-300" style={{ width: '140px' }}></td>
                      <td className="p-2" style={{ width: '200px' }}>
                        <Input
                          value={beneficiary.name}
                          onChange={(e) => handleBeneficiaryUpdate(fund.id, actualIndex, 'name', e.target.value)}
                          placeholder="Beneficiary name"
                          disabled={isUpdating}
                          className="w-full h-7 text-sm text-left bg-white border-gray-200 focus:border-primary"
                        />
                      </td>
                      <td className="p-2" style={{ width: '120px' }}>
                        <Input
                          type="number"
                          value={beneficiary.percentage || 0}
                          onChange={(e) => handleBeneficiaryUpdate(fund.id, actualIndex, 'percentage', e.target.value)}
                          min="0"
                          max="100"
                          step="0.1"
                          disabled={isUpdating}
                          className="w-full h-7 text-sm text-center bg-white border-gray-200 focus:border-primary"
                          placeholder="0"
                        />
                      </td>
                      <td className="p-2" style={{ width: '140px' }}>
                        <div className="w-full h-7 text-sm text-right px-2 py-1 bg-gray-100 border rounded text-gray-600 flex items-center">
                          <span className="truncate flex-1">{beneficiary.coverSplit}</span>
                        </div>
                      </td>
                      <td className="p-2" style={{ width: '80px' }}>
                        <div className="flex justify-start">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveBeneficiary(fund.id, actualIndex)}
                            disabled={isUpdating}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </>
                  )}

                  {/* Empty cells for other sections */}
                  {columnVisibility.monthlyDeathBenefit && (
                    <>
                      <td className="p-2 border-l border-neutral-300"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                    </>
                  )}

                  {columnVisibility.fundValue && (
                    <>
                      <td className="p-2 border-l border-neutral-300"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                    </>
                  )}

                  {columnVisibility.fundValueBeneficiaries && (
                    <>
                      <td className="p-2 border-l border-neutral-300"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                    </>
                  )}
                </tr>
              );
            });

            return rows;
          })}
          
          {/* Totals row */}
          <tr className="bg-gray-100 font-bold border-t-2 border-neutral-300">
            {columnVisibility.overview && (
              <>
                <td className="table-cell whitespace-nowrap table-text-14 font-bold" style={{ color: '#094161' }}>
                  Total
                </td>
                <td className="p-2 text-right"></td>
              </>
            )}
            
            {columnVisibility.unapprovedLifeCover && (
              <>
                <td className="p-2 text-right border-l border-neutral-300">
                  <span className="font-bold text-right table-text-14" style={{ color: '#094161', fontWeight: '700' }}>
                    R {funds.reduce((sum, fund) => {
                      const amount = parseInt(fund.coverAmount?.replace(/[^0-9]/g, '') || '0');
                      return sum + amount;
                    }, 0).toLocaleString()}
                  </span>
                </td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
              </>
            )}
            
            {columnVisibility.monthlyDeathBenefit && (
              <>
                <td className="p-2 text-right border-l border-neutral-300">
                  <span className="font-bold text-right table-text-14" style={{ color: '#094161', fontWeight: '700' }}>
                    R {funds.reduce((sum, fund) => {
                      const amount = parseInt(fund.monthlyIncome?.replace(/[^0-9]/g, '') || '0');
                      return sum + amount;
                    }, 0).toLocaleString()}
                  </span>
                </td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
              </>
            )}
            
            {columnVisibility.fundValue && (
              <>
                <td className="p-2 text-right border-l border-neutral-300">
                  <span className="font-bold text-right table-text-14" style={{ color: '#094161', fontWeight: '700' }}>
                    R {funds.reduce((sum, fund) => {
                      const amount = parseInt(fund.approvedLifeCover?.replace(/[^0-9]/g, '') || '0');
                      return sum + amount;
                    }, 0).toLocaleString()}
                  </span>
                </td>
                <td className="p-2 text-right">
                  <span className="font-bold text-right table-text-14" style={{ color: '#094161', fontWeight: '700' }}>
                    R {funds.reduce((sum, fund) => {
                      const amount = parseInt(fund.fundValue?.replace(/[^0-9]/g, '') || '0');
                      return sum + amount;
                    }, 0).toLocaleString()}
                  </span>
                </td>
                <td className="p-2 text-right">
                  <span className="font-bold text-right table-text-14" style={{ color: '#094161', fontWeight: '700' }}>
                    R {funds.reduce((sum, fund) => {
                      const amount = parseInt(fund.fundValueAtDeath?.replace(/[^0-9]/g, '') || '0');
                      return sum + amount;
                    }, 0).toLocaleString()}
                  </span>
                </td>
                <td className="p-2 text-right"></td>
              </>
            )}
            
            {columnVisibility.fundValueBeneficiaries && (
              <>
                <td className="p-2 text-right border-l border-neutral-300"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
              </>
            )}
          </tr>
        </tbody>
      </table>
    </div>
  );
}