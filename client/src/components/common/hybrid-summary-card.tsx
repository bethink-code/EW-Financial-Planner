import React from 'react';

interface SummaryItem {
  label: string;
  value: string | number;
  className?: string;
}

interface HybridSummaryCardProps {
  title: string;
  items: SummaryItem[];
  className?: string;
  variant?: 'default' | 'blue' | 'green' | 'orange';
}

/**
 * HybridSummaryCard - A reusable summary card component for the hybrid view sidebar
 * Provides consistent styling and structure for displaying totals and key metrics
 */
export function HybridSummaryCard({ 
  title, 
  items, 
  className = "", 
  variant = 'default' 
}: HybridSummaryCardProps) {
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'blue':
        return 'bg-blue-50 border-blue-200';
      case 'green':
        return 'bg-green-50 border-green-200';
      case 'orange':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-white border-neutral-200';
    }
  };

  return (
    <div className={`rounded-lg shadow-sm border p-4 ${getVariantClasses()} ${className}`}>
      <h3 className="text-lg font-semibold text-neutral-800 mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-sm text-neutral-600">{item.label}:</span>
            <span className={`font-semibold ${item.className || ''}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HybridSummaryCard;