import React from 'react';
import { Plus } from 'lucide-react';

interface HybridViewWrapperProps {
  viewMode: 'table' | 'hybrid';
  tableComponent: React.ReactNode;
  summaryCards: React.ReactNode;
  detailForms: React.ReactNode;
  onAddItem?: () => void;
  addButtonLabel?: string;
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
 *   onAddItem={handleAddItem}
 *   addButtonLabel="Add Policy"
 * />
 */
export function HybridViewWrapper({
  viewMode,
  tableComponent,
  summaryCards,
  detailForms,
  onAddItem,
  addButtonLabel = "Add Item",
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
    <div className="flex gap-6">
      {/* Left Sidebar - Summary Cards */}
      <div className="w-80 flex-shrink-0 space-y-4">
        {summaryCards}
        
        {/* Add Item Button */}
        {onAddItem && (
          <button
            onClick={onAddItem}
            disabled={isUpdating}
            className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {addButtonLabel}
          </button>
        )}
      </div>

      {/* Right Side - Detailed Forms */}
      <div className="flex-1 space-y-6">
        {isEmpty ? (
          <div className="text-center py-8">
            <p className="text-neutral-500 mb-4">{emptyStateMessage}</p>
            {onAddItem && (
              <button
                onClick={onAddItem}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                {addButtonLabel}
              </button>
            )}
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