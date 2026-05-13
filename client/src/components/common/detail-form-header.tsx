import { Button } from "@/components/ui/button";

interface DetailFormHeaderProps {
  /** The current title (e.g. fund/investment description). Falls back to `emptyTitle` when empty. */
  title?: string | null;
  /** Placeholder shown when `title` is empty. */
  emptyTitle?: string;
  /** Optional. If omitted, the Duplicate button is not rendered. */
  onDuplicate?: () => void;
  /** Delete action. */
  onDelete?: () => void;
  /** Disables both buttons (e.g. while a mutation is in flight). */
  disabled?: boolean;
}

/**
 * Shared header strip for every hybrid-view detail form.
 *
 * Replaces hand-rolled `<div className="flex justify-between"...>` blocks that
 * each used a slightly different button variant. One source of truth — EW
 * Secondary buttons on the right, navy title on the left.
 */
export function DetailFormHeader({
  title,
  emptyTitle = "Untitled",
  onDuplicate,
  onDelete,
  disabled = false,
}: DetailFormHeaderProps) {
  return (
    <div className="flex justify-between items-center pb-4" style={{ borderBottom: "1px solid var(--ew-border)" }}>
      <h2
        className="text-lg font-semibold truncate"
        style={{ color: "var(--ew-primary-navy)" }}
      >
        {title?.trim() || emptyTitle}
      </h2>
      <div className="flex gap-2 flex-shrink-0">
        {onDuplicate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDuplicate}
            disabled={disabled}
            className="btn-secondary"
          >
            Duplicate
          </Button>
        )}
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            disabled={disabled}
            className="btn-secondary"
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
