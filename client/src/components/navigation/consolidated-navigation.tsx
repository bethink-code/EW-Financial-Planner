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

  // Generate a form ID (you can replace this with actual form ID logic)
  const formId = "FRM-2025-001";

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="w-full">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left side */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
              FINANCIAL PLAN
            </span>
            
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-700" title={planName}>
                {planName}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-400 hover:text-gray-600"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            {/* Need section */}
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium ml-8">
              NEED
            </span>
            
            {/* Main dropdown - shows needs when clicking the need button, sections when clicking step buttons */}
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  onClick={() => {
                    setSelectedStepForDropdown(null);
                    setIsDropdownOpen(true);
                  }}
                  className="bg-[#E97627] hover:bg-[#E97627]/90 text-white h-9 px-4 flex items-center gap-2 text-sm"
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

            {/* Step navigation */}
            <div className="flex items-center gap-2 ml-6">
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
                        "flex items-center gap-2 h-9 px-4 rounded text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[#E97627] text-white hover:bg-[#E97627]/90"
                          : "hover:bg-gray-100"
                      )}
                      disabled={!step.hasContent}
                    >
                      <span className={cn(
                        "flex items-center justify-center h-5 w-5 rounded-full text-xs font-semibold",
                        isActive 
                          ? "bg-white/20 text-white"
                          : "bg-gray-200 text-gray-600"
                      )}>
                        {step.number}
                      </span>
                      <span className={isActive ? "text-white" : "text-gray-700"}>{step.label}</span>
                    </button>
                  </SafeFragment>
                );
              })}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {formId}
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
  );
}