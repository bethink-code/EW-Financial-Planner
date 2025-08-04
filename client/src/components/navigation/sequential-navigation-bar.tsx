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
      "fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={!previousItem}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors",
              previousItem
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>
          
          {/* Progress & Breadcrumb */}
          <div className="flex-1 mx-4 text-center">
            {/* Progress Indicator */}
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Step {progress.current} of {progress.total}
            </div>
            
            {/* Breadcrumb */}
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-full">
              {currentItem.breadcrumb}
            </div>
            
            {/* Progress Bar */}
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-md mx-auto">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={!nextItem}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors",
              nextItem
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
            )}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        {/* Next Item Preview (on larger screens) */}
        {nextItem && (
          <div className="hidden md:block mt-2 text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Next: {nextItem.label}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}