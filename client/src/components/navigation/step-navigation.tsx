import React from "react";
import { Link, useLocation } from "wouter";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SafeFragment } from "@/lib/safe-fragment";

interface Step {
  id: string;
  number: number;
  label: string;
  path: string;
  isComplete?: boolean;
  hasContent: boolean;
}

interface StepNavigationProps {
  steps: Step[];
  currentStepId: string;
}

export function StepNavigation({ steps, currentStepId }: StepNavigationProps) {
  const [location] = useLocation();
  
  return (
    <div className="flex items-center gap-2 px-6 py-4 bg-gray-50">
      {steps.map((step, index) => {
        const isActive = step.id === currentStepId;
        const isComplete = step.isComplete;
        
        return (
          <SafeFragment key={step.id}>
            {index > 0 && (
              <div className="flex-1 h-px bg-gray-300 max-w-[40px]" />
            )}
            <Link href={step.path}>
              <button
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-lg font-normal text-base transition-colors",
                  isActive
                    ? "bg-[#E97627] text-white hover:bg-[#E97627]/90"
                    : isComplete
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : step.hasContent
                    ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
                disabled={!step.hasContent}
              >
                <span className={cn(
                  "flex items-center justify-center h-8 w-8 rounded text-sm font-medium",
                  isActive 
                    ? "bg-white/20 text-white"
                    : isComplete
                    ? "bg-transparent"
                    : "bg-[#E97627] text-white"
                )}>
                  {isComplete ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.number
                  )}
                </span>
                <span>{step.label}</span>
              </button>
            </Link>
          </SafeFragment>
        );
      })}
    </div>
  );
}