import { useQuery } from "@tanstack/react-query";
import type { Assurance } from "@shared/schema";

const formatCurrency = (value: string): string => {
  if (!value?.trim()) return "R 0";
  const cleanValue = value.replace(/[^\d.-]/g, '');
  if (!cleanValue || isNaN(parseFloat(cleanValue))) return "R 0";
  const numValue = parseFloat(cleanValue);
  return `R ${numValue.toLocaleString()}`;
};

export function AssuranceSummary() {
  // Fetch assurance policies for summary calculations
  const { data: policies = [], isLoading } = useQuery({
    queryKey: ["/api/assurance"],
    queryFn: async () => {
      const response = await fetch("/api/assurance");
      if (!response.ok) throw new Error('Failed to fetch assurance policies');
      return response.json() as Promise<Assurance[]>;
    }
  });

  // Calculate totals
  const totalPolicies = policies.length;
  
  const totalDeathBenefits = policies.reduce((sum, policy) => {
    const value = parseFloat(policy.deathBenefit.replace(/[^\d.-]/g, '')) || 0;
    return sum + value;
  }, 0);
  
  const monthlyDeathBenefitAmount = policies.reduce((sum, policy) => {
    const value = parseFloat(policy.amount.replace(/[^\d.-]/g, '')) || 0;
    return sum + value;
  }, 0);
  
  const totalPremiumsByOthers = policies.reduce((sum, policy) => {
    const value = parseFloat(policy.premiumsByOthers.replace(/[^\d.-]/g, '')) || 0;
    return sum + value;
  }, 0);
  
  const totalCollateralSession = policies.reduce((sum, policy) => {
    const value = parseFloat(policy.collateralSession.replace(/[^\d.-]/g, '')) || 0;
    return sum + value;
  }, 0);

  if (isLoading) {
    return (
      <div className="px-5 pb-5">
        <div className="text-neutral-500">Loading summary...</div>
      </div>
    );
  }

  return (
    <div className="px-5 pb-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
          <div className="text-sm font-medium text-neutral-600 mb-1">Total Policies</div>
          <div className="text-xl font-bold text-neutral-900">{totalPolicies}</div>
        </div>
        
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
          <div className="text-sm font-medium text-neutral-600 mb-1">Total Death Benefits</div>
          <div className="text-xl font-bold text-neutral-900">{formatCurrency(totalDeathBenefits.toString())}</div>
        </div>
        
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
          <div className="text-sm font-medium text-neutral-600 mb-1">Monthly Death Benefit Amount</div>
          <div className="text-xl font-bold text-neutral-900">{formatCurrency(monthlyDeathBenefitAmount.toString())}</div>
        </div>
        
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
          <div className="text-sm font-medium text-neutral-600 mb-1">Total Premiums by Others</div>
          <div className="text-xl font-bold text-neutral-900">{formatCurrency(totalPremiumsByOthers.toString())}</div>
        </div>
        
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
          <div className="text-sm font-medium text-neutral-600 mb-1">Total Collateral Session</div>
          <div className="text-xl font-bold text-neutral-900">{formatCurrency(totalCollateralSession.toString())}</div>
        </div>
      </div>
    </div>
  );
}

export default AssuranceSummary;