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

/** Segmented-control container — the bordered shell holding SegmentButtons. */
export function SegmentGroup({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-0.5 rounded-[8px] border bg-white p-0.5"
      style={{ borderColor: "var(--ew-border)" }}
    >
      {children}
    </div>
  );
}

/** One segment — filled blue when active, white otherwise. */
export function SegmentButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-7 items-center gap-1.5 rounded-[6px] px-2.5 text-xs font-medium",
        active
          ? "text-white"
          : "bg-white text-gray-700 hover:bg-[var(--ew-row-tint)]"
      )}
      style={active ? { backgroundColor: "var(--ew-blue)" } : undefined}
    >
      {children}
    </button>
  );
}

/** Labelled segmented control (e.g. "Filter" + option segments). */
export function SegmentedControl({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-gray-500">{label}</span>}
      <SegmentGroup>
        {options.map((option) => (
          <SegmentButton
            key={option.value}
            active={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </SegmentButton>
        ))}
      </SegmentGroup>
    </div>
  );
}

export function ViewModeToggle({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">View</span>
      <SegmentGroup>
        <SegmentButton
          active={mode === "cards"}
          onClick={() => onChange("cards")}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Cards
        </SegmentButton>
        <SegmentButton
          active={mode === "table"}
          onClick={() => onChange("table")}
        >
          <Table2 className="h-3.5 w-3.5" />
          Table
        </SegmentButton>
      </SegmentGroup>
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
