import React from 'react';
import { VoluntaryInvestment } from '@shared/schema';
import { HybridItemPreviewCard } from '@/components/common/hybrid-item-preview-card';

interface VoluntaryInvestmentPreviewCardProps {
  investment: VoluntaryInvestment;
  isActive: boolean;
  onClick: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function VoluntaryInvestmentPreviewCard({ investment, isActive, onClick, isFirst = false, isLast = false }: VoluntaryInvestmentPreviewCardProps) {
  // Create subtitle with owners listed on separate lines
  const validOwners = investment.owners?.filter(owner => owner && owner.trim() !== '') || [];
  const ownerLines = validOwners.length > 0 
    ? validOwners.map(owner => `Owner: ${owner}`).join('\n')
    : 'Owner: Not specified';
  
  // Format investment info
  const liquidationInfo = investment.liquidationPercentage && investment.liquidationPercentage !== '0%' 
    ? `Liquidation: ${investment.liquidationPercentage}` 
    : 'Liquidation: Not specified';
  
  const subtitle = `${ownerLines}\n${liquidationInfo}`;
  
  // Create secondary info with financial details
  const baseCost = investment.baseCost || 'R 0';
  const marketValue = investment.marketValue || 'R 0';
  const secondaryInfo = `Base Cost: ${baseCost} | Market Value: ${marketValue}`;

  return (
    <HybridItemPreviewCard
      title={investment.description || 'Untitled Investment'}
      subtitle={subtitle}
      primaryValue={investment.marketValue || 'R 0'}
      secondaryInfo={secondaryInfo}
      variant={isActive ? 'active' : 'default'}
      onClick={onClick}
      isClickable={true}
      isFirst={isFirst}
      isLast={isLast}
    />
  );
}