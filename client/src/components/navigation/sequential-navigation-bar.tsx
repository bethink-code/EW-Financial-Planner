import React from "react";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getCurrentNavItem,
  getPreviousNavItem,
  getNextNavItem,
  getNavigationProgress
} from "@/lib/sequential-navigation";

interface SequentialNavigationBarProps {
  className?: string;
}

export function SequentialNavigationBar({ className }: SequentialNavigationBarProps) {
  const [location, setLocation] = useLocation();
  
  const currentItem = getCurrentNavItem(location);
  const previousItem = getPreviousNavItem(location);
  const nextItem = getNextNavItem(location);
  const progress = getNavigationProgress(location);
  
  // Don't show navigation if we can't determine current position
  if (!currentItem) {
    return null;
  }
  
  const handlePrevious = () => {
    if (previousItem) {
      setLocation(previousItem.path);
    }
  };
  
  const handleNext = () => {
    if (nextItem) {
      setLocation(nextItem.path);
    }
  };
  
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50",
      "shadow-[0_-8px_25px_-8px_rgba(0,_0,_0,_0.25)]",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={!previousItem}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-colors text-sm",
              previousItem
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>
          
          {/* Progress & Breadcrumb */}
          <div className="flex-1 mx-2 min-w-0">
            <div className="flex flex-col items-center gap-1">
              {/* Full Breadcrumb - no truncation */}
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center w-full">
                (Step {progress.current} of {progress.total}) - {currentItem.breadcrumb}
              </div>
              
              {/* Bottom row: Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 max-w-md mx-auto">
                <div 
                  className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Next Button with Preview */}
          <button
            onClick={handleNext}
            disabled={!nextItem}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-colors text-sm",
              nextItem
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
            )}
            title={nextItem ? `Next: ${nextItem.label}` : undefined}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}