import React, { useState } from "react";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { getFinancialPlanName, needs } from "@shared/navigation-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FinancialPlanHeaderProps {
  currentNeed: string;
  onBack?: () => void;
}

export function FinancialPlanHeader({ currentNeed, onBack }: FinancialPlanHeaderProps) {
  const planName = getFinancialPlanName();
  
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 flex items-center gap-2"
            >
              {currentNeed}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            {needs.map((need) => (
              <DropdownMenuItem key={need.id} asChild>
                <Link href={need.path}>
                  <span className={need.hasContent ? "" : "text-gray-400"}>
                    {need.label}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}