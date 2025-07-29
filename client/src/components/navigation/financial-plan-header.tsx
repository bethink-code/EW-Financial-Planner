import React, { useState } from "react";
import { ChevronLeft, ChevronDown, Edit2, FileText, RefreshCw } from "lucide-react";
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
  
  const handleBack = () => {
    window.history.back();
  };
  
  return (
    <div className="bg-white border-b">
      {/* First row with plan name */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Financial Plan</span>
          
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
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-gray-700"
          >
            <FileText className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Second row with need dropdown */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Need</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                className="bg-[#E97627] hover:bg-[#E97627]/90 text-white h-9 px-4 flex items-center gap-2 text-sm"
              >
                {currentNeed}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
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
    </div>
  );
}