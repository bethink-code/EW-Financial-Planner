import { Info } from "lucide-react";

interface HybridItemPreviewRowProps {
  title: string;
  onClick?: () => void;
}

/**
 * Compact one-line row used in the sidebar for items that aren't currently
 * selected. The active item renders as a full HybridItemPreviewCard above
 * the list; everything else uses this row so the sidebar stays scannable
 * even with many items.
 */
export function HybridItemPreviewRow({ title, onClick }: HybridItemPreviewRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left bg-transparent hover:bg-neutral-50 transition-colors border-b border-neutral-200"
    >
      <span
        className="text-sm font-medium truncate"
        style={{ color: "var(--ew-primary-navy)" }}
      >
        {title}
      </span>
      <Info className="h-4 w-4 text-neutral-400 flex-shrink-0" aria-hidden />
    </button>
  );
}
