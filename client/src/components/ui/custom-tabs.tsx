import React from"react";
import { Link, useLocation } from"wouter";
import { cn } from"@/lib/utils";

interface Tab {
  id: string;
  label: string;
  badge?: string | number;
  href?: string;
}

interface CustomTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
  useLinks?: boolean;
}

/**
 * Custom tabs component for estate liquidity calculator
 * Uses consistent brand colors and styling
 * Can work as tabs or as navigation links
 */
export function CustomTabs({ tabs, activeTab, onTabChange, className, useLinks = false }: CustomTabsProps) {
  const [location] = useLocation();

  return (
    <div className={cn("mb-6", className)}>
      <div className="border-b border-neutral-200 dark:border-neutral-700">
        <div className="max-w-[1024px]">
          <nav className="flex flex-wrap gap-x-6 gap-y-2 ml-[24px] mr-[24px]">
            {tabs.map((tab) => {
              const isActive = useLinks ? location === tab.href : activeTab === tab.id;
              
              if (useLinks && tab.href) {
                return (
                  <Link key={tab.id} href={tab.href}>
                    <button
                      className={cn(
"px-1 border-b-2 font-medium text-sm transition-colors relative",
                        isActive
                          ?"border-primary text-primary dark:border-primary dark:text-primary"
                          :"border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300"
                      )}
                    >
                      {tab.label}
                      {tab.badge && (
                        <span className={cn(
"ml-2 inline-flex items-center justify-center px-2 text-xs font-bold leading-none rounded-full",
                          isActive
                            ?"bg-primary text-primary-foreground"
                            :"bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
                        )}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  </Link>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange?.(tab.id)}
                  className={cn(
"px-1 border-b-2 font-medium text-sm transition-colors relative",
                    isActive
                      ?"border-primary text-primary dark:border-primary dark:text-primary"
                      :"border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300"
                  )}
                >
                  {tab.label}
                  {tab.badge && (
                    <span className={cn(
"ml-2 inline-flex items-center justify-center px-2 text-xs font-bold leading-none rounded-full",
                      isActive
                        ?"bg-primary text-primary-foreground"
                        :"bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
                    )}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
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