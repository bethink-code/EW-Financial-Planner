import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Eye, BarChart3 } from "lucide-react";
import { FinancialPlanningLayout } from "@/components/navigation/financial-planning-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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


  const renderSummaryData = (need: Need) => {
    if (!need.summaryData) return null;

    try {
      const data = JSON.parse(need.summaryData);
      
      if (need.key === 'death-estate-liquidity') {
        return (
          <div className="mt-3 space-y-4">
            <div className="space-y-6 bg-[#F6F9FB] p-4 rounded-lg">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-800">Estate position</span>
                  <span className="text-sm font-medium text-green-600">Allocated to dependants: R2,948,748</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '66%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Provided: R5,740,981</span>
                  <span>Required: R2,918,036</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-800">Dependants position</span>
                  <span className="text-sm font-medium text-red-600">Shortfall: R1,752,411</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Provided: R7,822,945</span>
                  <span>Required: R9,575,356</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-3">
              <button className="text-sm text-gray-500 hover:text-gray-700">Remove from plan</button>
              <button className="px-4 py-2 border border-[#016991] text-[#016991] bg-white rounded hover:bg-[#016991]/5 text-sm">Launch</button>
            </div>
          </div>
        );
      }

      if (need.key === 'retirement') {
        return (
          <div className="mt-3 space-y-4">
            <div className="bg-[#F6F9FB] p-4 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-800">Retirement funds</span>
                <span className="text-sm font-medium text-red-600">Shortfall: R8,894,312</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-orange-400 h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Provided: R19,071,067</span>
                <span>Required: R27,965,380</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-3">
              <button className="text-sm text-gray-500 hover:text-gray-700">Remove from plan</button>
              <button className="px-4 py-2 border border-[#016991] text-[#016991] bg-white rounded hover:bg-[#016991]/5 text-sm">Launch</button>
            </div>
          </div>
        );
      }

      if (need.key === 'investment-planning') {
        return (
          <div className="mt-3 space-y-4">
            <div className="bg-[#F6F9FB] p-4 rounded-lg">
            <div className="relative h-32 mb-4">
              {/* Simple area chart representation */}
              <svg className="w-full h-full" viewBox="0 0 300 120">
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#93C5FD', stopOpacity: 0.8 }} />
                    <stop offset="100%" style={{ stopColor: '#93C5FD', stopOpacity: 0.2 }} />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#60A5FA', stopOpacity: 0.8 }} />
                    <stop offset="100%" style={{ stopColor: '#60A5FA', stopOpacity: 0.2 }} />
                  </linearGradient>
                  <linearGradient id="gradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#EC4899', stopOpacity: 0.8 }} />
                    <stop offset="100%" style={{ stopColor: '#EC4899', stopOpacity: 0.2 }} />
                  </linearGradient>
                </defs>
                
                {/* Total area */}
                <path d="M 0 90 Q 75 70 150 75 Q 225 80 300 85 L 300 120 L 0 120 Z" fill="url(#gradient1)" />
                {/* Compulsory area */}
                <path d="M 0 90 Q 75 85 150 88 Q 225 90 300 95 L 300 120 L 0 120 Z" fill="url(#gradient2)" />
                {/* Voluntary area */}
                <path d="M 0 90 Q 75 95 150 100 Q 225 105 300 110 L 300 120 L 0 120 Z" fill="url(#gradient3)" />
                
                {/* Lines */}
                <path d="M 0 90 Q 75 70 150 75 Q 225 80 300 85" stroke="#3B82F6" strokeWidth="2" fill="none" />
                <path d="M 0 90 Q 75 85 150 88 Q 225 90 300 95" stroke="#1D4ED8" strokeWidth="2" fill="none" />
                <path d="M 0 90 Q 75 95 150 100 Q 225 105 300 110" stroke="#EC4899" strokeWidth="2" fill="none" />
              </svg>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-gray-600">Total (Nominal)</span>
                <span className="font-medium ml-auto">R6,450,000</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span className="text-gray-600">Compulsory (Nominal)</span>
                <span className="font-medium ml-auto">R4,450,000</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span className="text-gray-600">Voluntary (Nominal)</span>
                <span className="font-medium ml-auto">R2,000,000</span>
              </div>
            </div>
            </div>
            
            <div className="flex justify-between items-center pt-3">
              <button className="text-sm text-gray-500 hover:text-gray-700">Remove from plan</button>
              <button className="px-4 py-2 border border-[#016991] text-[#016991] bg-white rounded hover:bg-[#016991]/5 text-sm">Launch</button>
            </div>
          </div>
        );
      }

      if (need.key === 'permanent-disability') {
        return (
          <div className="mt-3 space-y-4">
            <div className="space-y-3 bg-[#F6F9FB] p-4 rounded-lg">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-800">Lump sum disability cover</span>
                  <span className="text-sm font-medium text-green-600">Surplus: R831,961</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '119%', maxWidth: '100%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Provided: R3,091,961</span>
                  <span>Required: R2,260,000</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-800">Income disability cover</span>
                  <span className="text-sm font-medium text-red-600">Shortfall: R5,135,026 (R36,630 p.m.)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-purple-400 h-2 rounded-full" style={{ width: '62%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Provided: R8,535,631 (R60,888 p.m.)</span>
                  <span>Required: R13,670,518 (R97,518 p.m.)</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-3">
              <button className="text-sm text-gray-500 hover:text-gray-700">Remove from plan</button>
              <button className="px-4 py-2 border border-[#016991] text-[#016991] bg-white rounded hover:bg-[#016991]/5 text-sm">Launch</button>
            </div>
          </div>
        );
      }

      // Add default rendering for any other needs
      return (
        <div className="mt-3 space-y-4">
          <div className="text-sm text-gray-600">
            Financial data not available for this need type.
          </div>
          
          <div className="flex justify-between items-center pt-3 border-t">
            <button className="text-sm text-gray-500 hover:text-gray-700">Remove from plan</button>
            <button className="px-4 py-2 border border-[#016991] text-[#016991] bg-white rounded hover:bg-[#016991]/5 text-sm">Launch</button>
          </div>
        </div>
      );
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
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
      <div className="min-h-screen bg-[#F6F9FB]">
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
      <div className="min-h-screen bg-[#F6F9FB]">
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
      <div className="min-h-screen bg-[#F6F9FB]">
        <div className="w-full px-6 py-6">
          <div className="w-[1320px]">
            {/* Needs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {needs.map((need) => (
                <Card key={need.id} className="bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900">{need.displayName}</CardTitle>
                    </div>
                    {need.hasDetailedSteps && (
                      <div className="text-xs text-green-600 font-medium mt-1">
                        ✓ Has detailed steps
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    {renderSummaryData(need)}
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