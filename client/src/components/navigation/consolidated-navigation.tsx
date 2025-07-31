import React, { useState } from"react";
import { ChevronLeft, ChevronDown, Edit2 } from"lucide-react";
import { Link, useLocation } from"wouter";
import { Button } from"@/components/ui/button";
import { getFinancialPlanName, needs } from"@shared/navigation-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from"@/components/ui/dropdown-menu";
import { cn } from"@/lib/utils";
import { SafeFragment } from"@/lib/safe-fragment";

interface ConsolidatedNavigationProps {
  currentNeed: any;
  currentStep: any;
  stepsWithStatus: any[];
  sections: any[];
}

export function ConsolidatedNavigation({ 
  currentNeed, 
  currentStep, 
  stepsWithStatus,
  sections 
}: ConsolidatedNavigationProps) {
  const [location, setLocation] = useLocation();
  const planName = getFinancialPlanName();
  const [isNeedDropdownOpen, setIsNeedDropdownOpen] = useState(false);
  const [stepDropdownOpen, setStepDropdownOpen] = useState<string | null>(null);
  
  const handleBack = () => {
    window.history.back();
  };

  // Get content for dropdown based on selected step
  const getDropdownContent = (stepId: string) => {
    const step = stepsWithStatus.find(s => s.id === stepId);
    if (!step || !step.sections) return [];
    
    const items: any[] = [];
    
    // For Calculate step (id is still 'build'), show all calculator pages directly
    if (step.id === 'build') {
      items.push(
        { id: 'assurance', label: 'Risk & Assurance', path: '/assurance', hasContent: true },
        { id: 'retirement-funds', label: 'Retirement funds', path: '/new-retirement-funds', hasContent: true },
        { id: 'defined-benefit', label: 'Defined benefit funds (GEPF)', path: '/defined-benefit-funds', hasContent: true },
        { id: 'voluntary-investments', label: 'Voluntary investments', path: '/voluntary-investments', hasContent: true },
        { id: 'assets', label: 'Lifestyle assets', path: '/assets', hasContent: true },
        { id: 'liabilities', label: 'Liabilities', path: '/liabilities', hasContent: true },
        { id: 'income-needs', label: 'Income needs', path: '/income-needs', hasContent: true },
        { id: 'lump-sum', label: 'Lump sum needs and cash bequests', path: '/lump-sum-bequests', hasContent: true },
        { id: 'income-provisions', label: 'Income provisions', path: '/income-provisions', hasContent: true }
      );
    } 
    // For Setup step, show the actual pages
    else if (step.id === 'setup') {
      items.push(
        { id: 'client-details', label: 'Client details', path: '/setup/client-details', hasContent: false },
        { id: 'parameters', label: 'Parameters', path: '/setup/parameters', hasContent: false },
        { id: 'residue', label: 'Residue', path: '/residue', hasContent: true },
        { id: 'additional-estate-duty', label: 'Additional estate duty items', path: '/additional-estate-duty-items', hasContent: true }
      );
    }
    // For Project step, show specific project sections
    else if (step.id === 'project') {
      items.push(
        { id: 'overview', label: 'Overview', path: '/project/overview', hasContent: false },
        { id: 'estate-position', label: 'Estate position', path: '/project/estate-position', hasContent: false },
        { id: 'dependents-positions', label: 'Dependents positions', path: '/project/dependents-positions', hasContent: false },
        { id: 'total-capital-position', label: 'Total capital position', path: '/project/total-capital-position', hasContent: false },
        { id: 'income-position', label: 'Income position', path: '/project/income-position', hasContent: false }
      );
    }
    // For Implement step, show implementation options
    else if (step.id === 'implement') {
      items.push(
        { id: 'option-1', label: 'Option 1', path: '/implement/option-1', hasContent: false },
        { id: 'option-2', label: 'Option 2', path: '/implement/option-2', hasContent: false },
        { id: 'option-3', label: 'Option 3', path: '/implement/option-3', hasContent: false },
        { id: 'option-4', label: 'Option 4', path: '/implement/option-4', hasContent: false }
      );
    }
    // For other steps, use original logic
    else {
      step.sections.forEach((section: any) => {
        if (section.children && section.children.length > 0) {
          section.children.forEach((child: any) => {
            items.push({
              ...child,
              type: 'section'
            });
          });
        } else {
          items.push({
            ...section,
            type: 'section'
          });
        }
      });
    }
    
    return items;
  };

  return (
    <div className="w-full px-6 pt-4 pb-2">
      <div className="max-w-6xl bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
        <div>
          {/* Single row: Financial Plan, Need, and Steps */}
          <div className="flex items-start gap-6">
            {/* Financial Plan section */}
            <div>
              {/* FINANCIAL PLAN label */}
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1">
                FINANCIAL PLAN
              </span>
              
              {/* Financial Plan name with edit button and back button on same row */}
              <div className="flex items-center gap-2">
                <button className="flex items-center pl-4 pr-1 text-sm font-medium transition-colors h-10 rounded-[6px] focus:outline-none focus:ring-0 focus:border-0 bg-[#F5F1E8] text-gray-700 border-0 hover:bg-[#F0EBE0]">
                  <span title={planName} className="flex-1">
                    {planName}
                  </span>
                  <span className="flex items-center justify-center h-8 w-8 rounded text-sm font-semibold bg-white text-[#F97415] ml-4">
                    <Edit2 className="h-3 w-3" />
                  </span>
                </button>
                
                {/* Back to all plans button */}
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="btn-ghost px-2 text-sm h-10"
                >
                  Back to all plans
                </Button>
              </div>
            </div>

            {/* Need section */}
            <div>
              {/* NEED label */}
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1">
                NEED
              </span>
              
              {/* Need dropdown */}
              <DropdownMenu open={isNeedDropdownOpen} onOpenChange={setIsNeedDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    className="btn-need px-4 flex items-center gap-2 text-sm rounded-md h-10"
                  >
                    {currentNeed.label}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="dropdown-menu-content w-72">
                  {needs.map((need) => (
                    <DropdownMenuItem key={need.id} className="dropdown-menu-item" asChild>
                      <Link href={need.path} onClick={() => setIsNeedDropdownOpen(false)}>
                        <span className={cn(
                          need.hasContent ?"" :"text-gray-400",
                          need.id === currentNeed.id &&"text-[#F97415] font-medium"
                        )}>
                          {need.label}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Step navigation */}
            <div className="flex items-start gap-3">
              <div>
                {/* STEPS label */}
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1">
                  STEPS
                </span>
                
                <div className="flex items-center gap-2">
                {stepsWithStatus.map((step, index) => {
              const isActive = step.id === currentStep.id;
              
              return (
                <SafeFragment key={step.id}>
                  {step.sections && step.sections.length > 0 ? (
                    <DropdownMenu 
                      open={stepDropdownOpen === step.id} 
                      onOpenChange={(open) => setStepDropdownOpen(open ? step.id : null)}
                    >
                      <DropdownMenuTrigger asChild>
                        <button
                          className={cn(
"flex items-center gap-2 pl-1 pr-2 text-sm font-medium transition-colors h-10",
"rounded-[6px] focus:outline-none focus:ring-0 focus:border-0",
                            isActive
                              ?"bg-[#F97415] text-white border-0"
                              :"bg-[#F5F1E8] text-gray-700 border-0 hover:bg-[#F0EBE0]"
                          )}
                          disabled={!step.hasContent}
                        >
                          <span className={cn(
"flex items-center justify-center h-8 w-8 rounded text-sm font-semibold",
                            isActive 
                              ?"bg-white/20 text-white"
                              :"bg-white text-[#F97415]"
                          )}>
                            {step.number}
                          </span>
                          <span>{step.label}</span>
                          <ChevronDown className="h-3.5 w-3.5 ml-1" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="dropdown-menu-content w-72">
                        {getDropdownContent(step.id).map((item) => (
                          <DropdownMenuItem key={item.id} className="dropdown-menu-item" asChild={item.hasContent}>
                            {item.hasContent ? (
                              <Link href={item.path} onClick={() => setStepDropdownOpen(null)}>
                                <span className={cn(
                                  item.hasContent ?"" :"text-gray-400",
                                  location.includes(item.path) &&"text-[#F97415] font-medium"
                                )}>
                                  {item.label}
                                </span>
                              </Link>
                            ) : (
                              <span className="text-gray-400 cursor-default">
                                {item.label}
                              </span>
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <button
                      onClick={() => setLocation(step.path)}
                      className={cn(
"flex items-center gap-2 pl-1 pr-2 text-sm font-medium transition-colors h-10",
"rounded-[6px] focus:outline-none focus:ring-0 focus:border-0",
                        isActive
                          ?"bg-[#F97415] text-white border-0"
                          :"bg-[#F5F1E8] text-gray-700 border-0 hover:bg-[#F0EBE0]"
                      )}
                      disabled={!step.hasContent}
                    >
                      <span className={cn(
"flex items-center justify-center h-8 w-8 rounded text-sm font-semibold",
                        isActive 
                          ?"bg-white/20 text-white"
                          :"bg-white text-[#F97415]"
                      )}>
                        {step.number}
                      </span>
                      <span>{step.label}</span>
                      <ChevronDown className="h-3.5 w-3.5 ml-1" />
                    </button>
                  )}
                </SafeFragment>
              );
            })}
                </div>
              </div>
            </div>
            

          </div>
        </div>
      </div>
    </div>
  );
}