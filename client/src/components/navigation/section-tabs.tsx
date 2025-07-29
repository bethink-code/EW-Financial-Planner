import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { SafeFragment } from "@/lib/safe-fragment";

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
  
  const TabButton = ({ tab, isActive }: { tab: TabItem; isActive: boolean }) => {
    const baseClasses = "px-4 py-2 font-medium transition-colors relative";
    
    const variantClasses = variant === "primary" 
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
    <div className={cn(
      "flex items-center gap-1",
      variant === "primary" && "border-b border-gray-200 px-6",
      variant === "secondary" && "px-6 py-2 bg-gray-50"
    )}>
      {tabs.map((tab) => {
        const isActive = tab.path === location || 
          tab.children?.some(child => child.path === location) ||
          tab.id === activeTabId;
        
        return (
          <SafeFragment key={tab.id}>
            <TabButton tab={tab} isActive={isActive} />
            
            {tab.children && isActive && variant === "primary" && (
              <div className="ml-4">
                <SectionTabs 
                  tabs={tab.children} 
                  variant="secondary"
                />
              </div>
            )}
          </SafeFragment>
        );
      })}
    </div>
  );
}