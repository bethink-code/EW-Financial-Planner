import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { SafeFragment } from "@/lib/safe-fragment";
import { useNavigationDesign } from "@/contexts/navigation-design-context";

interface TabItem {
  id: string;
  label: string;
  path: string;
  hasContent: boolean;
  children?: TabItem[];
}

interface SectionTabsProps {
  tabs: TabItem[];
  activeTabId?: string;
  variant?: "primary" | "secondary";
}

export function SectionTabs({ tabs, activeTabId, variant = "primary" }: SectionTabsProps) {
  const [location] = useLocation();
  const { design } = useNavigationDesign();
  
  // For demonstration, let's show a visual indicator of the selected design
  const getDesignIndicator = () => {
    if (design === "current") return null;
    
    return (
      <div className="mb-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full inline-block">
        🎨 {design === "pill-buttons" ? "Pill Buttons Design" : 
             design === "tabs-in-header" ? "Tabs in Header Design" :
             design === "sidebar" ? "Sidebar Design" :
             design === "dropdown" ? "Dropdown Design" : "Current Design"}
      </div>
    );
  };
  
  const TabButton = ({ tab, isActive }: { tab: TabItem; isActive: boolean }) => {
    const baseClasses = "px-4 py-2 font-medium transition-colors relative";
    
    // Apply different styles based on selected design
    let variantClasses;
    
    if (design === "pill-buttons") {
      // Pill button style
      variantClasses = cn(
        baseClasses,
        "text-sm rounded-full border",
        isActive 
          ? "bg-[#016991] text-white border-[#016991]"
          : "text-gray-600 hover:bg-gray-100 border-gray-300"
      );
    } else if (design === "tabs-in-header") {
      // Enhanced tab style with more visual hierarchy
      variantClasses = variant === "primary" 
        ? cn(
            baseClasses,
            "text-gray-600 hover:text-gray-900 pb-3 border-b-2 border-transparent",
            isActive && "text-blue-600 border-blue-600 bg-blue-50"
          )
        : cn(
            baseClasses,
            "text-sm rounded-md border",
            isActive 
              ? "bg-blue-100 text-blue-700 border-blue-300"
              : "text-gray-600 hover:bg-gray-100 border-gray-200"
          );
    } else {
      // Default/current design
      variantClasses = variant === "primary" 
        ? cn(
            baseClasses,
            "text-gray-600 hover:text-gray-900 pb-3",
            isActive && "text-blue-600 border-b-2 border-blue-600"
          )
        : cn(
            baseClasses,
            "text-sm rounded-md",
            isActive 
              ? "bg-blue-100 text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          );
    }
    
    if (!tab.hasContent) {
      return (
        <span className={cn(variantClasses, "opacity-50 cursor-not-allowed")}>
          {tab.label}
        </span>
      );
    }
    
    return (
      <Link href={tab.path}>
        <button className={variantClasses}>
          {tab.label}
        </button>
      </Link>
    );
  };
  
  return (
    <div>
      {getDesignIndicator()}
      <div className={cn(
        "flex items-center gap-1",
        variant === "primary" && "border-b border-gray-200 px-6 py-0",
        variant === "secondary" && "px-6 py-2"
      )}>
        {tabs.map((tab) => {
          const isActive = tab.path === location || 
            tab.children?.some(child => child.path === location) ||
            tab.id === activeTabId;
          
          return (
            <SafeFragment key={tab.id}>
              <TabButton tab={tab} isActive={isActive} />
            </SafeFragment>
          );
        })}
      </div>
    </div>
  );
}