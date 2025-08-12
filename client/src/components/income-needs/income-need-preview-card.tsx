import React from 'react';
import { IncomeNeeds } from '@shared/schema';
import { HybridItemPreviewCard } from '@/components/common/hybrid-item-preview-card';

interface IncomeNeedPreviewCardProps {
  incomeNeed: IncomeNeeds;
  isActive: boolean;
  onClick: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function IncomeNeedPreviewCard({ 
  incomeNeed, 
  isActive, 
  onClick, 
  isFirst = false, 
  isLast = false 
}: IncomeNeedPreviewCardProps) {
  
  // Entity display with consistent empty string filtering
  const entityText = incomeNeed.personName && incomeNeed.personName.trim() !== '' 
    ? `Entity: ${incomeNeed.personName}` 
    : 'Entity: Not specified';

  // Create subtitle with entity and frequency info
  const frequencyText = `Frequency: ${incomeNeed.frequency || 'monthly'}`;
  const subtitle = `${entityText}\n${frequencyText}`;

  // Create secondary info with term and increase details
  const termInfo = incomeNeed.termYears && incomeNeed.termYears !== '0' 
    ? `Term: ${incomeNeed.termYears}` 
    : '';
  const increaseInfo = incomeNeed.increasePercentage && incomeNeed.increasePercentage !== '0%' 
    ? `Increase: ${incomeNeed.increasePercentage}` 
    : '';
  const cpiInfo = incomeNeed.cpi ? 'CPI Adjusted' : '';
  
  const secondaryParts = [termInfo, increaseInfo, cpiInfo].filter(Boolean);
  const secondaryInfo = secondaryParts.join(' | ') || 'No adjustments';

  return (
    <HybridItemPreviewCard
      title={incomeNeed.description || 'Untitled Income Need'}
      subtitle={subtitle}
      primaryValue={incomeNeed.amount || 'R 0'}
      secondaryInfo={secondaryInfo}
      variant={isActive ? 'active' : 'default'}
      onClick={onClick}
      isClickable={true}
      isFirst={isFirst}
      isLast={isLast}
    />
  );
}