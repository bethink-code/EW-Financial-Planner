import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface HybridHeaderBarProps {
  /** Add button at the left edge of the strip. Omit to hide. */
  add?: AddAction;
  /** Title of the currently-selected item — display-only. Names are edited
   *  in the form's Name/Description field, not here. */
  title?: string | null;
  /** Placeholder shown when `title` is empty. */
  emptyTitle?: string;
  /** Optional inline stat rendered after the title (e.g. "R 6 700 p.m. ·
   *  1 policy") — lets a tab fold a one-number summary into the toolbar
   *  instead of carrying a full summary band. */
  meta?: React.ReactNode;
  /** Duplicate the selected item. */
  onDuplicate?: () => void;
  /** Delete the selected item. */
  onDelete?: () => void;
  /** Optional right-aligned slot for view-level controls (e.g. view-by /
   *  filter segmented controls). Renders before Duplicate/Delete. */
  actions?: React.ReactNode;
  /** Disables every button while a mutation is in flight. */
  disabled?: boolean;
}

/**
 * The full-width top action strip that sits inside the form card, above the
 * sidebar + detail form. Mirrors the body row's column structure so the
 * title in the right region left-aligns with the FieldGroup headings below:
 *
 *   ┌──────────────┬──────────────────────────────────────────────┐
 *   │ Add Entity   │ Title                    Duplicate  Delete   │
 *   ├──────────────┼──────────────────────────────────────────────┤
 *   │ sidebar      │ ENTITY                                       │
 *   │ items        │   …form fields…                              │
 *
 * Title is display-only — the name field lives in the form, so editing
 * happens there. Header just reflects the current value.
 */
export function HybridHeaderBar({
  add,
  title,
  emptyTitle,
  meta,
  onDuplicate,
  onDelete,
  actions,
  disabled = false,
}: HybridHeaderBarProps) {
  const displayTitle = title?.trim() || emptyTitle || "";

  return (
    <div className="flex items-stretch">
      {/* Sidebar column — Add button. Matches body's w-80 sidebar so the
          right region's left edge aligns with the detail form below. */}
      <div className="w-80 flex-shrink-0 flex items-center px-4 py-5">
        {add && (
          <Button
            onClick={add.onClick}
            disabled={add.disabled || disabled}
            variant="outline"
            size="sm"
            className="border-transparent font-normal hover:bg-[var(--ew-blue-tertiary-100)]"
            style={{
              backgroundColor: "var(--ew-blue-tertiary-50)",
              color: "var(--ew-blue)",
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {add.label}
          </Button>
        )}
      </div>

      {/* Detail column — title left, actions right. p-6 left matches
          GroupedDetailForm so the title sits over ENTITY etc. */}
      <div className="flex-1 flex items-center gap-3 pl-6 pr-4 py-5">
        {displayTitle && (
          <h2
            className="text-lg font-semibold truncate min-w-0"
            style={{ color: "var(--ew-primary-navy)" }}
          >
            {displayTitle}
          </h2>
        )}
        {meta && (
          <div className="whitespace-nowrap text-[13px] text-gray-500">
            {meta}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {actions}
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
    </div>
  );
}
