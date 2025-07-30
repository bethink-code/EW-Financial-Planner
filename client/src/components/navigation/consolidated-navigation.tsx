import React, { useState } from "react";
import { ChevronLeft, ChevronDown, Edit2, RefreshCw } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { getFinancialPlanName, needs } from "@shared/navigation-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { SafeFragment } from "@/lib/safe-fragment";

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStepForDropdown, setSelectedStepForDropdown] = useState<string | null>(null);
  
  const handleBack = () => {
    window.history.back();
  };

  // Get content for dropdown based on selected step
  const getDropdownContent = () => {
    if (!selectedStepForDropdown) return [];
    
    const step = stepsWithStatus.find(s => s.id === selectedStepForDropdown);
    if (!step || !step.sections) return [];
    
    const items: any[] = [];
    step.sections.forEach((section: any) => {
      items.push({
        ...section,
        isSection: true,
        type: 'section'
      });
      if (section.children) {
        section.children.forEach((child: any) => {
          items.push({
            ...child,
            isChild: true,
            parentId: section.id,
            type: 'subsection'
          });
        });
      }
    });
    return items;
  };

  return (
    <div className="w-full px-6 pt-6 pb-4">
      <div className="max-w-6xl bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
        <div>
          {/* First row: Back button and Financial Plan */}
          <div className="flex items-start gap-3 mb-3">
            {/* Back button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8 -ml-2 mt-5"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </Button>
            
            {/* Financial Plan section */}
            <div>
              {/* FINANCIAL PLAN label */}
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1">
                FINANCIAL PLAN
              </span>
              
              {/* Financial Plan name with edit */}
              <div className="flex items-center gap-2 bg-[#F5F1E8] rounded px-3 py-1.5">
                <span className="text-sm text-gray-700" title={planName}>
                  {planName}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0 text-gray-500 hover:text-gray-700"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Second row: Need, Steps, and Right side items */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Need section */}
              <div className="ml-10">
                {/* NEED label */}
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1">
                  NEED
                </span>
                
                {/* Need dropdown */}
                <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                onClick={() => {
                  setSelectedStepForDropdown(null);
                  setIsDropdownOpen(true);
                }}
                className="bg-[#E97627] hover:bg-[#E97627]/90 text-white h-9 px-5 flex items-center gap-2 text-sm rounded-md"
              >
                {currentNeed.label}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              {!selectedStepForDropdown ? (
                // Show needs
                needs.map((need) => (
                  <DropdownMenuItem key={need.id} asChild>
                    <Link href={need.path} onClick={() => setIsDropdownOpen(false)}>
                      <span className={cn(
                        need.hasContent ? "" : "text-gray-400",
                        need.id === currentNeed.id && "text-[#E97627] font-medium"
                      )}>
                        {need.label}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                ))
              ) : (
                // Show sections for selected step
                getDropdownContent().map((item) => (
                  <DropdownMenuItem key={item.id} asChild>
                    <Link href={item.path} onClick={() => setIsDropdownOpen(false)}>
                      <span className={cn(
                        item.hasContent ? "" : "text-gray-400",
                        item.isChild && "pl-6",
                        location.includes(item.path) && "text-[#E97627] font-medium"
                      )}>
                        {item.label}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
              </div>

              {/* Step navigation */}
              <div className="flex items-center gap-2 ml-4">
                {stepsWithStatus.map((step, index) => {
              const isActive = step.id === currentStep.id;
              
              return (
                <SafeFragment key={step.id}>
                  <button
                    onClick={() => {
                      if (step.sections && step.sections.length > 0) {
                        setSelectedStepForDropdown(step.id);
                        setIsDropdownOpen(true);
                      } else {
                        setLocation(step.path);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2 h-9 px-4 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#E97627] text-white hover:bg-[#E97627]/90"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                    disabled={!step.hasContent}
                  >
                    <span className={cn(
                      "flex items-center justify-center h-5 w-5 rounded-full text-xs font-semibold",
                      isActive 
                        ? "bg-white/20 text-white"
                        : "bg-white text-gray-700"
                    )}>
                      {step.number}
                    </span>
                    <span>{step.label}</span>
                  </button>
                </SafeFragment>
              );
            })}
              </div>
            </div>
            
            {/* Right side */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                FRM-2025-001
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}