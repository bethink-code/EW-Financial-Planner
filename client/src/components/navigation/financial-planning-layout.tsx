import React from "react";
import { useLocation, Link } from "wouter";
import { ChevronDown, Edit2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import headerImage from "@assets/EW Header_1753945516780.png";

interface FinancialPlanningLayoutProps {
  children: React.ReactNode;
  variant?: "list" | "summary";
  planName?: string;
  planId?: string;
  needs?: Array<{ key: string; displayName: string; hasDetailedSteps: boolean }>;
}

export function FinancialPlanningLayout({ 
  children, 
  variant = "list",
  planName,
  planId,
  needs = []
}: FinancialPlanningLayoutProps) {
  const [location] = useLocation();

  const handleBack = () => {
    window.history.back();
  };

  return (
    <>
      {/* Client Header Image */}
      <div className="w-full overflow-x-auto">
        <div className="pl-6">
          <img 
            src={headerImage} 
            alt="Client Header - Donald Edward" 
            className="block"
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>
      </div>
      
      {/* Financial Planning Navigation */}
      <div className="w-full px-6 pt-8 pb-2">
        <div className="w-[1320px] bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
          {variant === "list" ? (
            // Financial Plans List Navigation
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">Financial plans</h1>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create a new plan
              </Button>
            </div>
          ) : (
            // Financial Plan Summary Navigation
            <div className="flex items-start gap-6">
              {/* Financial Plan section */}
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1">
                  FINANCIAL PLAN
                </span>
                
                <div className="flex items-center gap-2">
                  <button className="flex items-center pl-4 pr-1 text-sm font-medium transition-colors h-10 rounded-[6px] focus:outline-none focus:ring-0 focus:border-0 bg-[#F5F1E8] text-gray-700 border-0 hover:bg-[#F0EBE0]">
                    <span title={planName} className="flex-1">
                      {planName || "Financial Plan"}
                    </span>
                    <span className="flex items-center justify-center h-8 w-8 rounded text-sm font-semibold bg-white text-[#F97415] ml-4">
                      <Edit2 className="h-3 w-3" />
                    </span>
                  </button>
                  
                  <Link href="/financial-plans">
                    <Button
                      variant="ghost"
                      className="btn-ghost px-2 text-sm h-10"
                    >
                      Back to all plans
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Manage Needs section */}
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1">
                  &nbsp;
                </span>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline"
                      className="px-4 flex items-center gap-2 text-sm rounded-md h-10"
                    >
                      Manage financial needs
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="dropdown-menu-content w-72">
                    {needs.map((need) => (
                      <DropdownMenuItem key={need.key} className="dropdown-menu-item" asChild>
                        <Link href={`/needs/${need.key}`}>
                          <div className="flex items-center justify-between w-full">
                            <span>{need.displayName}</span>
                            {need.hasDetailedSteps && (
                              <span className="text-xs text-green-600">✓ Detailed</span>
                            )}
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="dropdown-menu-item">
                      <span className="text-gray-700">Add more needs to this plan</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div style={{ paddingBottom: '80px' }}>
        {children}
      </div>
    </>
  );
}