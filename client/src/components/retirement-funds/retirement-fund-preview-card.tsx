import React from 'react';
import { RetirementFund } from '@shared/schema';
import { HybridItemPreviewCard } from '@/components/common/hybrid-item-preview-card';

interface RetirementFundPreviewCardProps {
  fund: RetirementFund;
  isActive: boolean;
  onClick: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function RetirementFundPreviewCard({ fund, isActive, onClick, isFirst = false, isLast = false }: RetirementFundPreviewCardProps) {
  // Create subtitle with owners listed on separate lines
  const validOwners = fund.owners?.filter(owner => owner && owner.trim() !== '') || [];
  const ownerLines = validOwners.length > 0 
    ? validOwners.map(owner => `Owner: ${owner}`).join('\n')
    : 'Owner: Not specified';
  
  const unapprovedCount = fund.unapprovedBeneficiaries?.filter(b => b && b.trim() !== '').length || 0;
  const fundValueCount = fund.fundValueBeneficiaries?.filter(b => b && b.trim() !== '').length || 0;
  const totalBeneficiaries = unapprovedCount + fundValueCount;
  
  // Show breakdown with each type on separate lines
  let beneficiariesText;
  if (unapprovedCount > 0 && fundValueCount > 0) {
    beneficiariesText = `Cover Beneficiaries: ${unapprovedCount}\nFund Beneficiaries: ${fundValueCount}`;
  } else if (totalBeneficiaries > 0) {
    beneficiariesText = `Beneficiaries: ${totalBeneficiaries}`;
  } else {
    beneficiariesText = 'Beneficiaries: 0';
  }
  
  const subtitle = `${ownerLines}\n${beneficiariesText}`;
  
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
      isFirst={isFirst}
      isLast={isLast}
    />
  );
}