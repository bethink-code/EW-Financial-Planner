import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (!policies.length) {
      return {
        totalPolicies: 0,
        totalDeathBenefits: 0,
        totalMonthlyDeathBenefit: 0,
        totalPremiumsByOthers: 0,
        totalCollateralSession: 0
      };
    }

    return {
      totalPolicies: policies.length,
      totalDeathBenefits: policies.reduce((sum, policy) => {
        return sum + (parseFloat(policy.deathBenefit?.replace(/[^\d.-]/g, '') || '0') || 0);
      }, 0),
      totalMonthlyDeathBenefit: policies.reduce((sum, policy) => {
        // Calculate monthly death benefit as annual death benefit / 12
        const annualBenefit = parseFloat(policy.deathBenefit?.replace(/[^\d.-]/g, '') || '0') || 0;
        return sum + (annualBenefit / 12);
      }, 0),
      totalPremiumsByOthers: policies.reduce((sum, policy) => {
        return sum + (parseFloat(policy.premiumsByOthers?.replace(/[^\d.-]/g, '') || '0') || 0);
      }, 0),
      totalCollateralSession: policies.reduce((sum, policy) => {
        return sum + (parseFloat(policy.collateralSession?.replace(/[^\d.-]/g, '') || '0') || 0);
      }, 0)
    };
  }, [policies]);

  if (isLoading) {
    return (
      <div className="p-4 bg-neutral-100 rounded-lg">
        <div className="text-neutral-500">Loading summary...</div>
      </div>
    );
  }

  return (
    <div className=" border border-neutral-200 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Assurance Summary</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div className="bg-neutral-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-neutral-600">Total Policies</div>
          <div className="text-2xl font-bold text-neutral-900">{summary.totalPolicies}</div>
        </div>
        
        <div className="bg-neutral-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-neutral-600">Total Death Benefits</div>
          <div className="text-2xl font-bold text-neutral-900">
            R {summary.totalDeathBenefits.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-neutral-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-neutral-600">Monthly Death Benefit</div>
          <div className="text-2xl font-bold text-neutral-900">
            R {Math.round(summary.totalMonthlyDeathBenefit).toLocaleString()}
          </div>
        </div>
        
        <div className="bg-neutral-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-neutral-600">Total Premiums by Others</div>
          <div className="text-2xl font-bold text-neutral-900">
            R {summary.totalPremiumsByOthers.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-neutral-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-neutral-600">Total Collateral Session</div>
          <div className="text-2xl font-bold text-neutral-900">
            R {summary.totalCollateralSession.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssuranceSummary;