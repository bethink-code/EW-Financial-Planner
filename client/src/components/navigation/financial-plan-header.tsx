import React from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFinancialPlanName } from "@shared/navigation-config";

interface FinancialPlanHeaderProps {
  currentNeed: string;
  onBack?: () => void;
}

export function FinancialPlanHeader({ currentNeed, onBack }: FinancialPlanHeaderProps) {
  const planName = getFinancialPlanName();
  
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b">
      <div className="flex items-center gap-4">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">FINANCIAL PLAN</span>
          <span className="text-sm text-gray-600">{planName}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">NEED</span>
        <Button 
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2"
        >
          {currentNeed}
        </Button>
      </div>
    </div>
  );
}