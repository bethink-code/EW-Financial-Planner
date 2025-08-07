import React from 'react';
import { RetirementFund } from '@shared/schema';
import { HybridItemPreviewCard } from '@/components/common/hybrid-item-preview-card';

interface RetirementFundPreviewCardProps {
  fund: RetirementFund;
  isActive: boolean;
  onClick: () => void;
}

export function RetirementFundPreviewCard({ fund, isActive, onClick }: RetirementFundPreviewCardProps) {
  // Create subtitle with owners listed on separate lines
  const validOwners = fund.owners?.filter(owner => owner && owner.trim() !== '') || [];
  const ownerLines = validOwners.length > 0 
    ? validOwners.map(owner => `Owner: ${owner}`).join('\n')
    : 'Owner: Not specified';
  
  const beneficiariesCount = (fund.unapprovedBeneficiaries?.filter(b => b).length || 0) + 
                           (fund.fundValueBeneficiaries?.filter(b => b).length || 0);
  
  const subtitle = `${ownerLines}\nBeneficiaries: ${beneficiariesCount}`;
  
  // Create secondary info with financial details
  const secondaryInfo = `Cover: ${fund.coverAmount || 'R 0'} | Monthly: ${fund.monthlyIncome || 'R 0'}`;

  return (
    <HybridItemPreviewCard
      title={fund.description || 'Untitled Fund'}
      subtitle={subtitle}
      primaryValue={fund.fundValue || 'R 0'}
      secondaryInfo={secondaryInfo}
      variant={isActive ? 'active' : 'default'}
      onClick={onClick}
      isClickable={true}
    />
  );
}