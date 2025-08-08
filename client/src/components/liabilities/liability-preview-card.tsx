import React from 'react';
import { Liabilities } from '@shared/liabilities-schema';
import { HybridItemPreviewCard } from '@/components/common/hybrid-item-preview-card';
import { parseEntityOwnership } from '@/lib/entity-columns-utils';

interface LiabilityPreviewCardProps {
  liability: Liabilities;
  isActive: boolean;
  onClick: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function LiabilityPreviewCard({ liability, isActive, onClick, isFirst = false, isLast = false }: LiabilityPreviewCardProps) {
  // Parse entity ownership from JSON
  const ownership = parseEntityOwnership(liability.entityOwnership);
  
  // Create owner lines from dynamic entity ownership
  const ownerLines = Object.entries(ownership)
    .filter(([entityName, percentage]) => percentage && percentage !== '0%')
    .map(([entityName, percentage]) => `Owner: ${entityName} (${percentage})`)
    .join('\n');
  
  // Create subtitle with ownership info and category
  const categoryInfo = `Category: ${liability.category || 'Not specified'}`;
  const currencyInfo = `Currency: ${liability.currency || 'ZAR'}`;
  const subtitle = ownerLines || 'Owner: Not specified';
  const fullSubtitle = `${subtitle}\n${categoryInfo}\n${currencyInfo}`;
  
  // Create secondary info with settlement details
  const estateInfo = liability.estate && liability.estate !== 'R 0' ? `Estate: ${liability.estate}` : '';
  const othersInfo = liability.others && liability.others !== 'R 0' ? `Others: ${liability.others}` : '';
  const clientInfo = liability.client && liability.client !== 'R 0' ? `Client: ${liability.client}` : '';
  
  const secondaryParts = [estateInfo, othersInfo, clientInfo].filter(Boolean);
  const secondaryInfo = secondaryParts.join(' | ') || 'No settlement set';

  return (
    <HybridItemPreviewCard
      title={liability.description || 'Untitled Liability'}
      subtitle={fullSubtitle}
      primaryValue={liability.debtAmount || 'R 0'}
      secondaryInfo={secondaryInfo}
      variant={isActive ? 'active' : 'default'}
      onClick={onClick}
      isClickable={true}
      isFirst={isFirst}
      isLast={isLast}
    />
  );
}