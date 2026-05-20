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
 * sidebar + detail form. Three regions on a 3-column grid:
 *
 *   [ Add Entity ]            Policy 2 ✎             [ Duplicate ] [ Delete ]
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
    <div className="grid grid-cols-3 items-center gap-3 px-4 py-3">
      {/* Add — left */}
      <div className="justify-self-start">
        {add && (
          <Button
            onClick={add.onClick}
            disabled={add.disabled || disabled}
            variant="outline"
            size="sm"
            className="bg-white text-gray-700 border border-neutral-200 hover:bg-gray-50 hover:text-gray-900 font-normal"
          >
            <Plus className="h-4 w-4 mr-2" />
            {add.label}
          </Button>
        )}
      </div>

      {/* Title — centred */}
      <div className="justify-self-center min-w-0 max-w-full flex items-center gap-2">
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
            className="text-lg font-semibold bg-transparent outline-none text-center border-b min-w-0"
            style={{ color: "var(--ew-primary-navy)", borderColor: "var(--ew-blue)" }}
          />
        ) : displayTitle ? (
          <>
            <h2
              className="text-lg font-semibold truncate text-center"
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

      {/* Actions — right */}
      <div className="justify-self-end flex gap-2">
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
