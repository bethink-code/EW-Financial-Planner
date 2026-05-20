import React, { useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const TAB_GAP_PX = 24;
// Reserve enough room for the "More ▼" trigger when overflow kicks in.
const MORE_TRIGGER_RESERVE_PX = 92;

/**
 * Custom tabs component for the EW design system.
 *
 * - Underline-active styling in brand primary.
 * - Can run as state-driven tabs or as `wouter` links.
 * - **Overflow handling**: when the tab strip is too wide for its container,
 *   trailing tabs collapse into a "More ▼" dropdown styled with the existing
 *   `.dropdown-menu-content` / `.dropdown-menu-item` brand classes. Always on
 *   — tabs that fit show no trigger.
 */
export function CustomTabs({ tabs, activeTab, onTabChange, className, useLinks = false }: CustomTabsProps) {
  const [location] = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const measureRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [visibleCount, setVisibleCount] = useState(tabs.length);
  const [moreOpen, setMoreOpen] = useState(false);

  useLayoutEffect(() => {
    const compute = () => {
      if (!navRef.current) return;
      const containerWidth = navRef.current.clientWidth;

      let used = 0;
      let fit = tabs.length;

      for (let i = 0; i < tabs.length; i++) {
        const tabWidth = measureRefs.current[i]?.offsetWidth ?? 0;
        const nextUsed = used + tabWidth + (i > 0 ? TAB_GAP_PX : 0);
        // Reserve room for the "More" trigger unless this is the last tab.
        const reserve = i < tabs.length - 1 ? MORE_TRIGGER_RESERVE_PX : 0;
        if (nextUsed + reserve > containerWidth) {
          fit = i;
          break;
        }
        used = nextUsed;
      }

      setVisibleCount(fit);
    };

    compute();
    if (!navRef.current) return;
    const ro = new ResizeObserver(compute);
    ro.observe(navRef.current);
    return () => ro.disconnect();
  }, [tabs]);

  const visibleTabs = tabs.slice(0, visibleCount);
  const overflowTabs = tabs.slice(visibleCount);
  const overflowHasActive = overflowTabs.some(t =>
    useLinks ? location === t.href : activeTab === t.id
  );

  const tabClass = (isActive: boolean) => cn(
    "px-1 pb-3 border-b-2 font-medium text-sm transition-colors relative whitespace-nowrap",
    isActive
      ? "border-primary text-primary dark:border-primary dark:text-primary"
      : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300"
  );

  const renderBadge = (tab: Tab, isActive: boolean) => tab.badge != null && (
    <span className={cn(
      "ml-2 inline-flex items-center justify-center px-2 text-xs font-bold leading-none rounded-full",
      isActive
        ? "bg-primary text-primary-foreground"
        : "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
    )}>
      {tab.badge}
    </span>
  );

  const renderVisibleTab = (tab: Tab) => {
    const isActive = useLinks ? location === tab.href : activeTab === tab.id;
    if (useLinks && tab.href) {
      return (
        <Link key={tab.id} href={tab.href}>
          <button className={tabClass(isActive)}>
            {tab.label}
            {renderBadge(tab, isActive)}
          </button>
        </Link>
      );
    }
    return (
      <button
        key={tab.id}
        onClick={() => onTabChange?.(tab.id)}
        className={tabClass(isActive)}
      >
        {tab.label}
        {renderBadge(tab, isActive)}
      </button>
    );
  };

  return (
    <div className={cn("mb-6", className)}>
      <div className="border-b border-neutral-200 dark:border-neutral-700 relative">
        {/* Hidden measurement layer — every tab at its natural width so the
            overflow calculation is accurate even when `tabs` changes. */}
        <div
          aria-hidden
          className="absolute top-0 left-0 right-0 invisible pointer-events-none"
          style={{ height: 0, overflow: "hidden" }}
        >
          <div className="flex flex-nowrap gap-x-6 ml-[24px] mr-[24px]">
            {tabs.map((tab, i) => (
              <span
                key={`m-${tab.id}`}
                ref={el => { measureRefs.current[i] = el; }}
                className="px-1 font-medium text-sm whitespace-nowrap"
              >
                {tab.label}
                {tab.badge != null && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 text-xs font-bold">
                    {tab.badge}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>

        <nav
          ref={navRef}
          className="flex flex-nowrap items-end gap-x-6 ml-[24px] mr-[24px]"
        >
          {visibleTabs.map(renderVisibleTab)}

          {overflowTabs.length > 0 && (
            <DropdownMenu open={moreOpen} onOpenChange={setMoreOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    tabClass(overflowHasActive),
                    "inline-flex items-center gap-1"
                  )}
                >
                  More
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="dropdown-menu-content w-64">
                {overflowTabs.map(tab => {
                  const isActive = useLinks ? location === tab.href : activeTab === tab.id;
                  const itemClass = cn(
                    "dropdown-menu-item",
                    isActive && "text-primary font-medium"
                  );

                  if (useLinks && tab.href) {
                    return (
                      <DropdownMenuItem key={tab.id} className={itemClass} asChild>
                        <Link href={tab.href} onClick={() => setMoreOpen(false)}>
                          <span>{tab.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  }

                  return (
                    <DropdownMenuItem
                      key={tab.id}
                      className={itemClass}
                      onClick={() => {
                        onTabChange?.(tab.id);
                        setMoreOpen(false);
                      }}
                    >
                      {tab.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
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
