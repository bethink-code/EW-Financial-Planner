import React from 'react';

interface HybridViewWrapperProps {
  viewMode: 'table' | 'hybrid';
  tableComponent: React.ReactNode;
  summaryCards: React.ReactNode;
  detailForms: React.ReactNode;
  isUpdating?: boolean;
  isEmpty?: boolean;
  emptyStateMessage?: string;
  children?: React.ReactNode;
}

/**
 * HybridViewWrapper - A reusable component that provides consistent hybrid view functionality
 * across all calculation tables in the financial planning platform.
 * 
 * Usage:
 * <HybridViewWrapper
 *   viewMode={viewMode}
 *   tableComponent={<YourTableComponent />}
 *   summaryCards={<YourSummaryCards />}
 *   detailForms={<YourDetailForms />}
 *   isEmpty={isEmpty}
 *   emptyStateMessage="No items found"
 * />
 */
export function HybridViewWrapper({
  viewMode,
  tableComponent,
  summaryCards,
  detailForms,
  isUpdating = false,
  isEmpty = false,
  emptyStateMessage = "No items found",
  children
}: HybridViewWrapperProps) {
  
  // Render table view
  if (viewMode === 'table') {
    return <>{tableComponent}</>;
  }

  // Render hybrid view - Left sidebar with summary cards + Right side detailed forms
  return (
    <div className="flex">
      {/* Left Sidebar - Summary Cards (Tabs) */}
      <div className="w-80 flex-shrink-0 border-r border-neutral-200">
        {summaryCards}
      </div>

      {/* Right Side - Detailed Forms */}
      <div className="flex-1">
        {isEmpty ? (
          <div className="text-center py-8">
            <p className="text-neutral-500 mb-4">{emptyStateMessage}</p>
          </div>
        ) : (
          detailForms
        )}
      </div>
      
      {/* Additional content can be passed as children */}
      {children}
    </div>
  );
}

export default HybridViewWrapper;