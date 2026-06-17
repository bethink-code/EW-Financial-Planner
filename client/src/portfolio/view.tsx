import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  LayoutGrid,
  Table2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Cards/table view machinery for the concept deck listings: the view-mode
 * toggle, in-memory sorting, sortable table headers (table mode) and the
 * sort dropdown (cards mode — the downstream consequence of losing column
 * headers).
 */

export type ViewMode = "cards" | "table";
export type SortDir = "asc" | "desc";

export interface SortOption {
  value: string;
  label: string;
  dir: SortDir;
}

export type Accessors<T> = Record<string, (row: T) => string | number>;

export function ViewModeToggle({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  const chip = (m: ViewMode, label: string, Icon: typeof LayoutGrid) => (
    <button
      type="button"
      onClick={() => onChange(m)}
      className={cn(
        "flex h-7 items-center gap-1.5 rounded-[6px] px-2.5 text-xs font-medium",
        mode === m
          ? "text-white"
          : "bg-white text-gray-700 hover:bg-[var(--ew-row-tint)]"
      )}
      style={mode === m ? { backgroundColor: "var(--ew-blue)" } : undefined}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">View</span>
      <div
        className="flex items-center gap-0.5 rounded-[8px] border bg-white p-0.5"
        style={{ borderColor: "var(--ew-border)" }}
      >
        {chip("cards", "Cards", LayoutGrid)}
        {chip("table", "Table", Table2)}
      </div>
    </div>
  );
}

/** "R 1 091 961" / "R 7 500 p.m." / "—" → number for sorting. */
export function parseAmount(display: string): number {
  const digits = display.replace(/[^\d.]/g, "");
  return digits ? parseFloat(digits) : 0;
}

/** 6352000 → "R 6 352 000" — space-grouped to match the deck's fixtures. */
export function formatRand(value: number): string {
  return "R " + Math.round(value).toLocaleString("en-US").replace(/,/g, " ");
}

/** "08/04/2020" → timestamp; missing dates sort after dated rows. */
export function parseDmy(date?: string): number {
  if (!date) return Number.MAX_SAFE_INTEGER;
  const [d, m, y] = date.split("/").map(Number);
  return new Date(y, m - 1, d).getTime();
}

export function useSort<T>(rows: T[], accessors: Accessors<T>) {
  const [key, setKey] = useState<string | null>(null);
  const [dir, setDir] = useState<SortDir>("asc");

  const sorted = useMemo(() => {
    if (!key) return rows;
    const get = accessors[key];
    return [...rows].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      const cmp =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb));
      return dir === "asc" ? cmp : -cmp;
    });
  }, [rows, key, dir, accessors]);

  const toggle = (k: string) => {
    if (key === k) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setKey(k);
      setDir("asc");
    }
  };

  const set = (k: string | null, d: SortDir = "asc") => {
    setKey(k);
    setDir(d);
  };

  return { sorted, key, dir, toggle, set };
}

export function SortHeader({
  label,
  right,
  active,
  dir,
  onClick,
}: {
  label: string;
  right?: boolean;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <th
      className={cn(
        "px-3 py-2 text-xs font-medium text-gray-600 !normal-case",
        right ? "text-right" : "text-left"
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 hover:text-neutral-900",
          active && "font-semibold text-neutral-900"
        )}
      >
        {label}
        {active ? (
          dir === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ChevronsUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    </th>
  );
}

export function SortSelect({
  options,
  value,
  onChange,
}: {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-gray-500">
      Sort
      <select
        className="h-7 rounded-md border border-[#E0E0E0] bg-white px-2 text-xs text-neutral-900 focus:border-[var(--ew-blue)] focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">As captured</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
