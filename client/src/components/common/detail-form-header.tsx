import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DetailFormHeaderProps {
  /** The current title (e.g. fund/investment description). Falls back to `emptyTitle` when empty. */
  title?: string | null;
  /** Placeholder shown when `title` is empty. */
  emptyTitle?: string;
  /** Optional. When provided, a pencil button appears for inline renaming. */
  onTitleChange?: (value: string) => void;
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
 * Secondary buttons on the right, navy title on the left. When `onTitleChange`
 * is supplied, the title becomes inline-editable via a pencil button.
 */
export function DetailFormHeader({
  title,
  emptyTitle = "Untitled",
  onTitleChange,
  onDuplicate,
  onDelete,
  disabled = false,
}: DetailFormHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const currentTitle = title?.trim() ?? "";

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
    <div className="flex justify-between items-center pb-4" style={{ borderBottom: "1px solid var(--ew-border)" }}>
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
          className="text-lg font-semibold bg-transparent outline-none flex-1 mr-2 border-b"
          style={{ color: "var(--ew-primary-navy)", borderColor: "var(--ew-blue)" }}
        />
      ) : (
        <div className="flex items-center gap-2 min-w-0">
          <h2
            className="text-lg font-semibold truncate"
            style={{ color: "var(--ew-primary-navy)" }}
          >
            {currentTitle || emptyTitle}
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
        </div>
      )}
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
