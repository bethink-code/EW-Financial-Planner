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
  isFirst?: boolean;
  isLast?: boolean;
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
  isClickable = false,
  isFirst = false,
  isLast = false
}: HybridItemPreviewCardProps) {
  
  const getVariantClasses = () => {
    const topBorderClass = isFirst ? '' : 'border-t border-neutral-200';
    const bottomBorderClass = isLast ? 'border-b border-neutral-200' : '';
    switch (variant) {
      case 'active':
        return `bg-white border-l-4 ${topBorderClass} ${bottomBorderClass} -mr-px relative z-10 tab-active-border`;
      default:
        return `bg-neutral-50 ${topBorderClass} ${bottomBorderClass} hover:bg-white hover:border-l hover:border-l-neutral-300`;
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
      className={`py-4 px-5 transition-all ${getVariantClasses()} ${
        isClickable || onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      <h4 className={`font-medium text-sm mb-1 ${getTextClasses()}`}>{title}</h4>
      {subtitle && (
        <div className={`text-xs mb-1 ${getSubtitleClasses()}`} style={{ whiteSpace: 'pre-line' }}>
          {subtitle}
        </div>
      )}
      <div className={`font-semibold text-sm ${getTextClasses()}`}>{primaryValue}</div>
      {secondaryInfo && (
        <div className={`text-xs mt-1 ${getSubtitleClasses()}`}>{secondaryInfo}</div>
      )}
    </div>
  );
}

export default HybridItemPreviewCard;