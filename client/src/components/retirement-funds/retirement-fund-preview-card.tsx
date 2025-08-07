import React from 'react';
import { RetirementFund } from '@shared/schema';

interface RetirementFundPreviewCardProps {
  fund: RetirementFund;
  isActive: boolean;
  onClick: () => void;
}

export function RetirementFundPreviewCard({ fund, isActive, onClick }: RetirementFundPreviewCardProps) {
  return (
    <div 
      className={`cursor-pointer border rounded-lg p-4 transition-all duration-200 ${
        isActive 
          ? 'border-primary bg-primary/5 shadow-sm' 
          : 'border-neutral-200 hover:border-neutral-300 hover:shadow-sm'
      }`}
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Title */}
        <div className={`font-medium ${isActive ? 'text-primary' : 'text-neutral-900'}`}>
          {fund.description || 'Untitled Fund'}
        </div>

        {/* Key Details */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Owner:</span>
            <span className="text-neutral-900">
              {fund.owners?.[0] || 'Not specified'}
              {fund.owners?.length > 1 && ` +${fund.owners.length - 1} more`}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Fund Value:</span>
            <span className="text-neutral-900 font-medium">
              {fund.fundValue || 'R 0'}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Cover Amount:</span>
            <span className="text-neutral-900">
              {fund.coverAmount || 'R 0'}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Monthly Income:</span>
            <span className="text-neutral-900">
              {fund.monthlyIncome || 'R 0'}
            </span>
          </div>
        </div>

        {/* Beneficiaries Summary */}
        <div className="pt-2 border-t border-neutral-100">
          <div className="text-xs text-neutral-600 mb-1">Beneficiaries:</div>
          <div className="text-xs text-neutral-900">
            {fund.unapprovedBeneficiaries?.filter(b => b).length || 0} unapproved, {' '}
            {fund.fundValueBeneficiaries?.filter(b => b).length || 0} fund value
          </div>
        </div>
      </div>
    </div>
  );
}