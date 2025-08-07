import React, { useState } from 'react';
import { RetirementFund, UpdateRetirementFund } from '@shared/schema';

import { RetirementFundPreviewCard } from './retirement-fund-preview-card';
import { RetirementFundDetailForm } from './retirement-fund-detail-form';

interface RetirementFundHybridTableProps {
  funds: RetirementFund[];
  onUpdate: (id: number, field: keyof UpdateRetirementFund, value: any) => void;
  onDuplicate: (fund: RetirementFund) => void;
  onDelete: (id: number) => void;
  disabled?: boolean;
}

export function RetirementFundHybridTable({ 
  funds, 
  onUpdate, 
  onDuplicate, 
  onDelete, 
  disabled = false 
}: RetirementFundHybridTableProps) {
  const [activeFundId, setActiveFundId] = useState<number | null>(
    funds.length > 0 ? funds[0].id : null
  );

  const activeFund = funds.find(fund => fund.id === activeFundId);

  const previewCards = funds.map(fund => (
    <RetirementFundPreviewCard
      key={fund.id}
      fund={fund}
      isActive={fund.id === activeFundId}
      onClick={() => setActiveFundId(fund.id)}
    />
  ));

  const detailForm = activeFund ? (
    <RetirementFundDetailForm
      fund={activeFund}
      onUpdate={onUpdate}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      disabled={disabled}
    />
  ) : (
    <div className="flex items-center justify-center h-64 text-neutral-500">
      No fund selected
    </div>
  );

  return (
    <div className="flex border-t border-neutral-200">
      {/* Left Sidebar - Preview Cards (Tabs) */}
      <div className="w-80 flex-shrink-0 border-r border-neutral-200 bg-neutral-50">
        {previewCards}
      </div>

      {/* Right Side - Detail Form */}
      <div className="flex-1 p-6">
        {detailForm}
      </div>
    </div>
  );
}