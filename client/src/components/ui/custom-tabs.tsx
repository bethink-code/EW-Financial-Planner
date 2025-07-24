import React from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  badge?: string | number;
}

interface CustomTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

/**
 * Custom tabs component for estate liquidity calculator
 * Uses consistent brand colors and styling
 */
export function CustomTabs({ tabs, activeTab, onTabChange, className }: CustomTabsProps) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="border-b border-neutral-200 dark:border-neutral-700">
        <div className="max-w-6xl mx-auto">
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {tabs.map((tab) => (
              <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm transition-colors relative",
                activeTab === tab.id
                  ? "border-primary text-primary dark:border-primary dark:text-primary"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300"
              )}
            >
              {tab.label}
              {tab.badge && (
                <span className={cn(
                  "ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

interface TabContentProps {
  activeTab: string;
  tabId: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Tab content wrapper with consistent animations
 */
export function TabContent({ activeTab, tabId, children, className }: TabContentProps) {
  if (activeTab !== tabId) return null;
  
  return (
    <div className={cn("tab-content section-enter", className)}>
      {children}
    </div>
  );
}