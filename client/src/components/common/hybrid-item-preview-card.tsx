interface HybridItemPreviewCardProps {
  title: string;
  subtitle?: string;
  primaryValue: string;
  secondaryInfo?: string;
  /** When true, the card draws its own bottom border. Used by HybridSidebar
   *  when the active card is the only item in the list (no inactive rows
   *  below to provide the cap). */
  isLast?: boolean;
}

/**
 * HybridItemPreviewCard — the expanded "active" card at the top of a
 * HybridSidebar. Always uses the active styling (white background, orange
 * left rule, navy text). Inactive items use HybridItemPreviewRow instead.
 */
export function HybridItemPreviewCard({
  title,
  subtitle,
  primaryValue,
  secondaryInfo,
  isLast = false,
}: HybridItemPreviewCardProps) {
  const bottomBorder = isLast ? 'border-b border-neutral-200' : '';
  return (
    <div className={`py-4 px-5 bg-white border-l-4 ${bottomBorder} -mr-px relative z-10 tab-active-border`}>
      <h4 className="font-medium text-sm mb-1 text-neutral-900">{title}</h4>
      {subtitle && (
        <div className="text-xs mb-1 text-neutral-600" style={{ whiteSpace: 'pre-line' }}>
          {subtitle}
        </div>
      )}
      <div className="font-semibold text-sm text-neutral-900">{primaryValue}</div>
      {secondaryInfo && (
        <div className="text-xs mt-1 text-neutral-600">{secondaryInfo}</div>
      )}
    </div>
  );
}

export default HybridItemPreviewCard;
