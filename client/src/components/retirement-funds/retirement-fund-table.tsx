import React, { useState } from 'react';
import { RetirementFund, UpdateRetirementFund } from '@shared/schema';
import { RetirementFundPreviewCard } from './retirement-fund-preview-card';
import { RetirementFundDetailForm } from './retirement-fund-detail-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface RetirementFundTableProps {
  funds: RetirementFund[];
  onUpdate: (id: number, field: keyof UpdateRetirementFund, value: any) => void;
  onDuplicate: (fund: RetirementFund) => void;
  onDelete: (id: number) => void;
  onAddFund?: () => void;
  disabled?: boolean;
}

export function RetirementFundTable({ 
  funds, 
  onUpdate, 
  onDuplicate, 
  onDelete, 
  onAddFund,
  disabled = false 
}: RetirementFundTableProps) {
  const [activeFundId, setActiveFundId] = useState<number | null>(
    funds.length > 0 ? funds[0].id : null
  );

  const activeFund = funds.find(fund => fund.id === activeFundId);

  const previewCards = funds.map((fund, index) => (
    <RetirementFundPreviewCard
      key={fund.id}
      fund={fund}
      isActive={fund.id === activeFundId}
      onClick={() => setActiveFundId(fund.id)}
      isFirst={index === 0}
      isLast={index === funds.length - 1}
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
        {onAddFund && (
          <div className="hybrid-add-button-container p-4 border-b border-neutral-200">
            <Button
              onClick={onAddFund}
              disabled={disabled}
              className="bg-white text-gray-700 border border-neutral-200 hover:bg-gray-50 hover:text-gray-900 font-normal"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Fund
            </Button>
          </div>
        )}
        <div className="hybrid-tabs-list">
          {previewCards}
        </div>
      </div>

      {/* Right Side - Detail Form */}
      <div className="flex-1">
        {detailForm}
      </div>
    </div>
  );
}