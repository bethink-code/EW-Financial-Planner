import React from 'react';
import { Assets } from '@shared/assets-schema';
import { HybridItemPreviewCard } from '@/components/common/hybrid-item-preview-card';
import { parseEntityOwnership } from '@/lib/entity-columns-utils';

interface AssetPreviewCardProps {
  asset: Assets;
  isActive: boolean;
  onClick: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function AssetPreviewCard({ asset, isActive, onClick, isFirst = false, isLast = false }: AssetPreviewCardProps) {
  // Parse ownership and create owner lines
  const ownership = parseEntityOwnership(asset.entityOwnership);
  const ownerLines = Object.entries(ownership)
    .filter(([_, percentage]) => percentage && percentage !== '0%')
    .map(([owner, percentage]) => `Owner: ${owner} (${percentage})`)
    .join('\n');
  
  // Create subtitle with ownership info and section
  const sectionInfo = `Category: ${asset.section?.replace('_', ' ') || 'Other'}`;
  const subtitle = ownerLines || 'Owner: Not specified';
  const fullSubtitle = `${subtitle}\n${sectionInfo}`;
  
  // Create secondary info with additional details
  const estateInfo = asset.estate && asset.estate !== 'R 0' ? `Estate: ${asset.estate}` : '';
  const othersInfo = asset.others && asset.others !== 'R 0' ? `Others: ${asset.others}` : '';
  const clientInfo = asset.client && asset.client !== 'R 0' ? `Client: ${asset.client}` : '';
  
  const secondaryParts = [estateInfo, othersInfo, clientInfo].filter(Boolean);
  const secondaryInfo = secondaryParts.join(' | ') || 'No distribution set';

  return (
    <HybridItemPreviewCard
      title={asset.description || 'Untitled Asset'}
      subtitle={fullSubtitle}
      primaryValue={asset.marketValue || 'R 0'}
      secondaryInfo={secondaryInfo}
      variant={isActive ? 'active' : 'default'}
      onClick={onClick}
      isClickable={true}
      isFirst={isFirst}
      isLast={isLast}
    />
  );
}