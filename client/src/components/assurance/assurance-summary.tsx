import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Assurance } from "@shared/schema";

interface AssuranceSummaryProps {
  searchTerm: string;
}

export function AssuranceSummary({ searchTerm }: AssuranceSummaryProps) {
  // Fetch assurance policies for summary calculations
  const { data: policies = [], isLoading } = useQuery({
    queryKey: ["/api/assurance", { search: searchTerm }],
    queryFn: async () => {
      const response = await fetch("/api/assurance" + (searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ""));
      if (!response.ok) throw new Error('Failed to fetch assurance policies');
      return response.json() as Promise<Assurance[]>;
    }
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
        <div className="text-center text-neutral-600">Loading summary...</div>
      </div>
    );
  }

  // Calculate summary metrics
  const totalPolicies = policies.length;
  const totalDeathBenefits = policies.reduce((sum, policy) => {
    const amount = parseFloat(policy.amount.replace(/[^0-9.]/g, "")) || 0;
    return sum + amount;
  }, 0);

  const totalExcludedFromEstateDuty = policies.filter(policy => policy.excludedFromEstateDuty).length;
  const totalExcludedFromProvisions = policies.filter(policy => policy.excludedFromProvisions).length;

  // Calculate average death benefit per policy
  const averageDeathBenefit = totalPolicies > 0 ? totalDeathBenefits / totalPolicies : 0;

  return (
    <div className="bg-white rounded-lg border border-neutral-200 mb-6">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Assurance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalPolicies}</div>
            <div className="text-sm text-neutral-600 mt-1">Total Policies</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              R {totalDeathBenefits.toLocaleString()}
            </div>
            <div className="text-sm text-neutral-600 mt-1">Total Death Benefits</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalExcludedFromEstateDuty}</div>
            <div className="text-sm text-neutral-600 mt-1">Excluded from Estate Duty</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              R {averageDeathBenefit.toLocaleString()}
            </div>
            <div className="text-sm text-neutral-600 mt-1">Average per Policy</div>
          </div>
        </div>

        {/* Additional Summary Row */}
        <div className="mt-6 pt-6 border-t border-neutral-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg">
              <span className="font-medium text-neutral-700">Excluded from Provisions:</span>
              <span className="font-bold text-neutral-900">{totalExcludedFromProvisions} policies</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg">
              <span className="font-medium text-neutral-700">Estate Duty Coverage:</span>
              <span className="font-bold text-neutral-900">
                {totalPolicies > 0 ? ((totalExcludedFromEstateDuty / totalPolicies) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}