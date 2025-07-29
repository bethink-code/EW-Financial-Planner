import React, { useState } from "react";
import { ChevronLeft, ChevronDown, Edit2, FileText, RefreshCw, Palette } from "lucide-react";
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

const navigationOptions = [
  {
    id: "current",
    label: "Current Design",
    description: "Default navigation layout"
  },
  {
    id: "tabs-in-header",
    label: "Tabs in Card Header",
    description: "Traditional tab pattern with visual hierarchy"
  },
  {
    id: "pill-buttons",
    label: "Pill Buttons (Recommended)",
    description: "Compact modern design with rounded buttons"
  },
  {
    id: "sidebar",
    label: "Sidebar Navigation",
    description: "Always visible navigation in sidebar"
  },
  {
    id: "dropdown",
    label: "Dropdown Selector",
    description: "Most compact with dropdown selection"
  }
];

export function FinancialPlanHeader({ currentNeed, onBack }: FinancialPlanHeaderProps) {
  const planName = getFinancialPlanName();
  const [selectedNavOption, setSelectedNavOption] = useState("current");
  
  const handleBack = () => {
    window.history.back();
  };

  const handleNavOptionChange = (optionId: string) => {
    setSelectedNavOption(optionId);
    // Here you could trigger different navigation layouts based on selection
    console.log("Navigation design changed to:", optionId);
  };
  
  return (
    <div className="bg-white border-b">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side with plan info */}
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
          
          {/* Need section on same line */}
          <div className="flex items-center gap-3 ml-8">
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
        
        {/* Right side with icons */}
        <div className="flex items-center gap-2">
          {/* Navigation Design Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
                title="Navigation Design Options"
              >
                <Palette className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-3 py-2 border-b">
                <h4 className="text-sm font-medium">Navigation Design Options</h4>
                <p className="text-xs text-gray-500 mt-1">Choose how secondary navigation integrates with summary cards</p>
              </div>
              {navigationOptions.map((option) => (
                <DropdownMenuItem 
                  key={option.id} 
                  onClick={() => handleNavOptionChange(option.id)}
                  className="flex-col items-start py-3 cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium text-sm">
                      {option.label}
                      {option.id === "pill-buttons" && (
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          Recommended
                        </span>
                      )}
                    </span>
                    {selectedNavOption === option.id && (
                      <div className="w-2 h-2 bg-[#016991] rounded-full" />
                    )}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{option.description}</span>
                </DropdownMenuItem>
              ))}
              <div className="px-3 py-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.open('/navigation-options', '_blank')}
                >
                  View Full Demo
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
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
    </div>
  );
}