import React from 'react';
import { RetirementFund } from '@shared/schema';
import { HybridItemPreviewCard } from '@/components/common/hybrid-item-preview-card';

interface RetirementFundPreviewCardProps {
  fund: RetirementFund;
  isActive: boolean;
  onClick: () => void;
}

export function RetirementFundPreviewCard({ fund, isActive, onClick }: RetirementFundPreviewCardProps) {
  // Create subtitle with owner and beneficiary information
  const ownerInfo = fund.owners?.[0] || 'Not specified';
  const ownerCount = fund.owners?.length > 1 ? ` +${fund.owners.length - 1} more` : '';
  const beneficiariesCount = (fund.unapprovedBeneficiaries?.filter(b => b).length || 0) + 
                           (fund.fundValueBeneficiaries?.filter(b => b).length || 0);
  
  const subtitle = `Owner: ${ownerInfo}${ownerCount}\nBeneficiaries: ${beneficiariesCount}`;
  
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