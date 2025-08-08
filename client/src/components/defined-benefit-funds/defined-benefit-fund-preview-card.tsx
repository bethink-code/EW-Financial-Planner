import { DefinedBenefitFund } from '@shared/schema';

interface DefinedBenefitFundPreviewCardProps {
  fund: DefinedBenefitFund;
  isActive: boolean;
  onClick: () => void;
}

export function DefinedBenefitFundPreviewCard({ fund, isActive, onClick }: DefinedBenefitFundPreviewCardProps) {
  // Format owners display (multiple entity types on separate lines)
  const ownersDisplay = fund.owners?.length > 1 
    ? `Owners: ${fund.owners.length}\nMultiple ownership`
    : `Owner: ${fund.owners?.[0] || 'Not specified'}`;

  // Format fund summary
  const monthlySalary = fund.finalMonthlySalary && fund.finalMonthlySalary !== 'R 0' 
    ? fund.finalMonthlySalary 
    : 'R 0';
  
  const deathBenefit = fund.deathLumpSum && fund.deathLumpSum !== 'R 0' 
    ? fund.deathLumpSum 
    : 'R 0';

  return (
    <div 
      className={`p-4 border-l-4 cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'border-l-orange-500 bg-blue-50 shadow-sm' 
          : 'border-l-gray-200 bg-white hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <div className="space-y-2">
        {/* Fund name/description */}
        <h3 className="font-medium text-gray-900 leading-tight">
          {fund.description || 'Untitled Fund'}
        </h3>
        
        {/* Owners info with line breaks */}
        <div className="text-sm text-gray-600 whitespace-pre-line">
          {ownersDisplay}
        </div>
        
        {/* Fund values */}
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900">
            {monthlySalary}
          </div>
          <div className="text-xs text-gray-500">
            Monthly Salary: {monthlySalary} | Death Benefit: {deathBenefit}
          </div>
        </div>
      </div>
    </div>
  );
}