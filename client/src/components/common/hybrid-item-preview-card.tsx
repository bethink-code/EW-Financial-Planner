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
      case 'active':
        return 'bg-white border-l-4 border-l-[#F97316] border-t border-neutral-200 border-b border-neutral-200 border-r border-white -mr-px relative z-10';
      default:
        return 'bg-neutral-50 border-r border-neutral-200 border-t border-neutral-200 border-b border-neutral-200 hover:bg-white';
    }
  };

  const getTextClasses = () => {
    switch (variant) {
      case 'active':
        return 'text-neutral-900';
      default:
        return 'text-neutral-700';
    }
  };

  const getSubtitleClasses = () => {
    switch (variant) {
      case 'active':
        return 'text-neutral-600';
      default:
        return 'text-neutral-500';
    }
  };

  return (
    <div 
      className={`border-b border-neutral-100 p-4 transition-all ${getVariantClasses()} ${
        isClickable || onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      <h4 className={`font-medium text-sm mb-1 ${getTextClasses()}`}>{title}</h4>
      {subtitle && (
        <div className={`text-xs mb-1 ${getSubtitleClasses()}`}>{subtitle}</div>
      )}
      <div className={`font-semibold text-sm ${getTextClasses()}`}>{primaryValue}</div>
      {secondaryInfo && (
        <div className={`text-xs mt-1 ${getSubtitleClasses()}`}>{secondaryInfo}</div>
      )}
    </div>
  );
}

export default HybridItemPreviewCard;