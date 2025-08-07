import React from 'react';

interface HybridItemPreviewCardProps {
  title: string;
  subtitle?: string;
  primaryValue: string;
  secondaryInfo?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'blue' | 'green' | 'orange' | 'active';
  isClickable?: boolean;
}

/**
 * HybridItemPreviewCard - A reusable preview card for individual items in the hybrid view sidebar
 * Shows a compact preview of each item (policy, fund, asset, etc.)
 */
export function HybridItemPreviewCard({ 
  title, 
  subtitle, 
  primaryValue, 
  secondaryInfo, 
  onClick, 
  className = "",
  variant = 'blue',
  isClickable = false
}: HybridItemPreviewCardProps) {
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'blue':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'green':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'orange':
        return 'bg-orange-50 border-orange-200 text-orange-900';
      case 'active':
        return 'bg-blue-100 border-blue-300 text-blue-900 ring-2 ring-blue-500';
      default:
        return 'bg-neutral-50 border-neutral-200 text-neutral-900';
    }
  };

  const getSubtitleClasses = () => {
    switch (variant) {
      case 'blue':
        return 'text-blue-700';
      case 'green':
        return 'text-green-700';
      case 'orange':
        return 'text-orange-700';
      case 'active':
        return 'text-blue-800';
      default:
        return 'text-neutral-700';
    }
  };

  return (
    <div 
      className={`rounded-lg border p-3 transition-all ${getVariantClasses()} ${
        isClickable || onClick ? 'cursor-pointer hover:shadow-md transform hover:scale-105' : ''
      } ${className}`}
      onClick={onClick}
    >
      <h4 className="font-medium text-sm mb-1">{title}</h4>
      {subtitle && (
        <div className={`text-xs mb-1 ${getSubtitleClasses()}`}>{subtitle}</div>
      )}
      <div className="font-semibold text-sm">{primaryValue}</div>
      {secondaryInfo && (
        <div className={`text-xs mt-1 ${getSubtitleClasses()}`}>{secondaryInfo}</div>
      )}
    </div>
  );
}

export default HybridItemPreviewCard;