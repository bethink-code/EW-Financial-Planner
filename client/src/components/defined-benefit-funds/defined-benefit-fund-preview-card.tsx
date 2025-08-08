import React from 'react';
import { DefinedBenefitFund } from '@shared/schema';
import { HybridItemPreviewCard } from '@/components/common/hybrid-item-preview-card';

interface DefinedBenefitFundPreviewCardProps {
  fund: DefinedBenefitFund;
  isActive: boolean;
  onClick: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function DefinedBenefitFundPreviewCard({ fund, isActive, onClick, isFirst = false, isLast = false }: DefinedBenefitFundPreviewCardProps) {
  // Create subtitle with owners listed on separate lines
  const validOwners = fund.owners?.filter(owner => owner && owner.trim() !== '') || [];
  const ownerLines = validOwners.length > 0 
    ? validOwners.map(owner => `Owner: ${owner}`).join('\n')
    : 'Owner: Not specified';
  
  // Format years of service info
  const yearsInfo = fund.yearsOfService && fund.yearsOfService !== '0 years' 
    ? `Service: ${fund.yearsOfService}` 
    : 'Service: Not specified';
  
  const subtitle = `${ownerLines}\n${yearsInfo}`;
  
  // Create secondary info with financial details
  const monthlySalary = fund.finalMonthlySalary || 'R 0';
  const deathBenefit = fund.deathLumpSum || 'R 0';
  const secondaryInfo = `Monthly: ${monthlySalary} | Death: ${deathBenefit}`;

  return (
    <HybridItemPreviewCard
      title={fund.description || 'Untitled Fund'}
      subtitle={subtitle}
      primaryValue={fund.pensionIncomeAmount || 'R 0'}
      secondaryInfo={secondaryInfo}
      variant={isActive ? 'active' : 'default'}
      onClick={onClick}
      isClickable={true}
      isFirst={isFirst}
      isLast={isLast}
    />
  );
}