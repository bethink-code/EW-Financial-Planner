import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface HybridHeaderBarProps {
  /** Add button at the left edge of the strip. Omit to hide. */
  add?: AddAction;
  /** Title of the currently-selected item — sits centred. */
  title?: string | null;
  /** Placeholder shown when `title` is empty. Omit to render nothing in the
   *  centre slot (e.g. before anything is selected). */
  emptyTitle?: string;
  /** When provided, a pencil button next to the title opens inline rename. */
  onTitleChange?: (value: string) => void;
  /** Duplicate the selected item. */
  onDuplicate?: () => void;
  /** Delete the selected item. */
  onDelete?: () => void;
  /** Disables every button while a mutation is in flight. */
  disabled?: boolean;
}

/**
 * The full-width top action strip that sits inside the form card, above the
 * sidebar + detail form. Mirrors the body row's column structure so the
 * title in the right region left-aligns with the FieldGroup headings below:
 *
 *   ┌──────────────┬──────────────────────────────────────────────┐
 *   │ Add Entity   │ Title ✎                  Duplicate  Delete   │
 *   ├──────────────┼──────────────────────────────────────────────┤
 *   │ sidebar      │ ENTITY                                       │
 *   │ items        │   …form fields…                              │
 *
 * Replaces the historical pair of: (a) Add button living inside the sidebar
 * and (b) DetailFormHeader living at the top of the detail form. Both now
 * surface in one consistent strip.
 */
export function HybridHeaderBar({
  add,
  title,
  emptyTitle,
  onTitleChange,
  onDuplicate,
  onDelete,
  disabled = false,
}: HybridHeaderBarProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const currentTitle = title?.trim() ?? "";
  const displayTitle = currentTitle || emptyTitle || "";

  const startEdit = () => {
    setDraft(currentTitle);
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next !== currentTitle) {
      onTitleChange?.(next);
    }
  };

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
        <div className="min-w-0 flex items-center gap-2">
          {editing ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") setEditing(false);
              }}
              placeholder={emptyTitle}
              className="text-lg font-semibold bg-transparent outline-none border-b min-w-0"
              style={{ color: "var(--ew-primary-navy)", borderColor: "var(--ew-blue)" }}
            />
          ) : displayTitle ? (
            <>
              <h2
                className="text-lg font-semibold truncate"
                style={{ color: "var(--ew-primary-navy)" }}
              >
                {displayTitle}
              </h2>
              {onTitleChange && (
                <button
                  type="button"
                  onClick={startEdit}
                  disabled={disabled}
                  aria-label="Rename"
                  className="flex-shrink-0 p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
            </>
          ) : null}
        </div>

        <div className="ml-auto flex gap-2">
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
