import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Eye, BarChart3 } from "lucide-react";
import { FinancialPlanningLayout } from "@/components/navigation/financial-planning-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FinancialPlan, Need } from "@shared/schema";

interface PlanWithNeeds {
  plan: FinancialPlan;
  needs: Need[];
}

export default function FinancialPlanSummaryPage() {
  const { id } = useParams();
  const planId = parseInt(id || "0");

  const { data: planWithNeeds, isLoading } = useQuery({
    queryKey: ["/api/financial-plans", planId, "with-needs"],
    queryFn: () => 
      fetch(`/api/financial-plans/${planId}/with-needs`).then(res => res.json()) as Promise<PlanWithNeeds>,
    enabled: !isNaN(planId) && planId > 0,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'protection': return 'bg-red-100 text-red-800 border-red-200';
      case 'planning': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'investment': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderSummaryData = (need: Need) => {
    if (!need.summaryData) return null;

    try {
      const data = JSON.parse(need.summaryData);
      
      if (need.key === 'death-estate-liquidity') {
        return (
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Estate Position:</span>
              <span className="font-medium text-green-600">{data.estatePosition?.surplus || 'N/A'} surplus</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dependants Position:</span>
              <span className="font-medium text-orange-600">
                {data.dependantsPosition?.required || 'N/A'} required
              </span>
            </div>
          </div>
        );
      }

      if (need.key === 'retirement') {
        return (
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Retirement Funds:</span>
              <span className="font-medium text-red-600">{data.retirementFunds?.shortfall || 'N/A'} shortfall</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Required:</span>
              <span className="font-medium">{data.retirementFunds?.required || 'N/A'}</span>
            </div>
          </div>
        );
      }

      if (need.key === 'investment-planning') {
        return (
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Nominal:</span>
              <span className="font-medium">{data.totalNominal || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Compulsory:</span>
              <span className="font-medium">{data.compulsoryNominal || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Voluntary:</span>
              <span className="font-medium">{data.voluntaryNominal || 'N/A'}</span>
            </div>
          </div>
        );
      }

      if (need.key === 'permanent-disability') {
        return (
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Lump Sum Cover:</span>
              <span className="font-medium text-green-600">{data.lumpSumCover?.surplus || 'N/A'} surplus</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Income Cover:</span>
              <span className="font-medium text-red-600">{data.incomeCover?.shortfall || 'N/A'} shortfall</span>
            </div>
          </div>
        );
      }
    } catch (error) {
      console.error('Error parsing summary data:', error);
    }

    return null;
  };

  const getActionButton = (need: Need) => {
    if (need.hasDetailedSteps) {
      // For needs with detailed steps, go directly to the Project step overview
      const projectPath = need.key === 'death' ? '/needs/death-estate-liquidity/project' : `/needs/${need.key}/project`;
      return (
        <Link href={projectPath}>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            <BarChart3 className="h-4 w-4 mr-1" />
            View Details
          </Button>
        </Link>
      );
    } else {
      // For needs without detailed steps, show summary view button
      return (
        <Button size="sm" variant="outline">
          <Eye className="h-4 w-4 mr-1" />
          View Summary
        </Button>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full px-6 py-6">
          <div className="w-[1320px]">
            <div className="text-center py-8 text-gray-500">
              Loading financial plan...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!planWithNeeds) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full px-6 py-6">
          <div className="w-[1320px]">
            <div className="text-center py-8 text-gray-500">
              Financial plan not found.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { plan, needs } = planWithNeeds;

  return (
    <FinancialPlanningLayout 
      variant="summary" 
      planName={plan.name}
      planId={plan.id.toString()}
      needs={needs.map(need => ({ 
        key: need.key, 
        displayName: need.displayName, 
        hasDetailedSteps: need.hasDetailedSteps 
      }))}
    >
      <div className="min-h-screen bg-gray-50">
        <div className="w-full px-6 py-6">
          <div className="w-[1320px]">
            {/* Plan Summary Card */}
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-semibold">{plan.name}</CardTitle>
                      <p className="text-gray-600 mt-2">{plan.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Date applicable: {formatDate(plan.dateApplicable)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Total needs</div>
                      <div className="text-2xl font-bold text-blue-600">{needs.length}</div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Needs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {needs.map((need) => (
                <Card key={need.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{need.displayName}</CardTitle>
                      <Badge className={`text-xs border ${getCategoryColor(need.category || 'other')}`}>
                        {need.category?.toUpperCase() || 'OTHER'}
                      </Badge>
                    </div>
                    {need.hasDetailedSteps && (
                      <div className="text-xs text-green-600 font-medium">
                        ✓ Has detailed steps
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    {renderSummaryData(need)}
                    
                    <div className="mt-4 pt-3 border-t">
                      {getActionButton(need)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {needs.length === 0 && (
              <Card>
                <CardContent className="text-center py-8 text-gray-500">
                  No financial needs have been added to this plan yet.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

    </FinancialPlanningLayout>
  );
}