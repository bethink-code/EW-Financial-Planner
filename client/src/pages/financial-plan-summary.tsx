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
                <div className="mb-4">
                  <div className="bar-chart-title">Estate position</div>
                  <div className="text-sm font-medium text-green-600">Allocated to dependants: R2,948,748</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-[#539cc7] h-2 rounded-full" style={{ width: '66%' }}></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Provided: R5,740,981</span>
                  <span>Required: R2,918,036</span>
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <div className="bar-chart-title">Dependants position</div>
                  <div className="text-sm font-medium text-red-600">Shortfall: R1,752,411</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-[#539cc7] h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
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
              <div className="flex justify-between items-center mb-4">
<span className="bar-chart-title">Retirement funds</span>
                <span className="text-sm font-medium text-red-600">Shortfall: R8,894,312</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-[#f1b431] h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
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
              <div className="flex gap-6">
                {/* Legend on left */}
                <div className="flex flex-col justify-center space-y-3 text-sm min-w-[140px]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-[#539cc7] rounded-full"></div>
                      <span className="text-gray-600">Total (Nominal)</span>
                    </div>
                    <div className="font-medium text-gray-800">R6,450,000</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-[#539cc7] rounded-full" style={{opacity: 0.7}}></div>
                      <span className="text-gray-600">Compulsory (Nominal)</span>
                    </div>
                    <div className="font-medium text-gray-800">R4,450,000</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                      <span className="text-gray-600">Voluntary (Nominal)</span>
                    </div>
                    <div className="font-medium text-gray-800">R2,000,000</div>
                  </div>
                </div>
                
                {/* Chart on right */}
                <div className="flex-1 relative h-32">
                  <svg className="w-full h-full" viewBox="0 0 300 120">
                    <defs>
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#A5C9EA', stopOpacity: 0.7 }} />
                        <stop offset="100%" style={{ stopColor: '#A5C9EA', stopOpacity: 0.4 }} />
                      </linearGradient>
                    </defs>
                    
                    {/* Area chart background - filled between the two lines */}
                    <path d="M 0 50 L 60 50 L 90 35 L 140 30 L 180 35 L 220 45 L 260 60 L 300 85 L 300 80 L 240 75 L 180 72 L 120 70 L 60 72 L 0 75 Z" fill="url(#areaGradient)" />
                    
                    {/* Two line graphs on top */}
                    {/* Total (Nominal) line - blue */}
                    <path d="M 0 50 L 60 50 L 90 35 L 140 30 L 180 35 L 220 45 L 260 60 L 300 85" stroke="#539cc7" strokeWidth="2.5" fill="none" />
                    
                    {/* Voluntary (Nominal) line - pink */}
                    <path d="M 0 75 L 60 72 L 120 70 L 180 72 L 240 75 L 300 80" stroke="#EC4899" strokeWidth="2.5" fill="none" />
                  </svg>
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
            <div className="space-y-6 bg-[#F6F9FB] p-4 rounded-lg">
              <div>
                <div className="mb-4">
                  <div className="bar-chart-title">Lump sum disability cover</div>
                  <div className="text-sm font-medium text-green-600">Surplus: R831,961</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-[#8d7b9f] h-2 rounded-full" style={{ width: '119%', maxWidth: '100%' }}></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Provided: R3,091,961</span>
                  <span>Required: R2,260,000</span>
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <div className="bar-chart-title">Income disability cover</div>
                  <div className="text-sm font-medium text-red-600">Shortfall: R5,135,026 (R36,630 p.m.)</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-[#8d7b9f] h-2 rounded-full" style={{ width: '62%' }}></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
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
                      <CardTitle className="card-title">{need.displayName}</CardTitle>
                    </div>
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