import { FileText, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tone } from "./data";
import { SectionHeading, StatusCard } from "./primitives";
import {
  SortHeader,
  SortSelect,
  useSort,
  type Accessors,
  type SortOption,
  type ViewMode,
} from "./view";

/**
 * Shared listing shell: one set of rows rendered as a sortable table or a
 * card grid, switched by the view-mode toggle. Table mode sorts via column
 * headers; cards mode via the sort dropdown.
 */

export interface ColumnDef {
  label: string;
  right?: boolean;
  sortKey?: string;
}

const plainThClass = "px-3 py-2 text-xs font-medium text-gray-600 !normal-case";

/**
 * Card surface: white with the EW drop shadow that lifts a white card off the
 * white page (Figma token: #627C95 @ 10%, offset 1/4, radius 9). Summary/KPI
 * tiles keep their tint — see KpiTile.
 */
export const cardSurface = {
  backgroundColor: "#FFFFFF",
  borderColor: "#F1F2F4",
  boxShadow: "1px 4px 9px 0 rgba(98, 124, 149, 0.1)",
} as const;

export function ListingSection<T>({
  title,
  viewMode,
  columns,
  rows,
  accessors,
  sortOptions,
  renderRow,
  renderCard,
  gridClass,
  addLabel,
}: {
  /** Omit to render the listing without its own heading row. */
  title?: string;
  viewMode: ViewMode;
  columns: ColumnDef[];
  rows: T[];
  accessors: Accessors<T>;
  sortOptions: SortOption[];
  renderRow: (row: T) => React.ReactNode;
  renderCard: (row: T) => React.ReactNode;
  gridClass?: string;
  /** Advisor-facing "add to this section" label, e.g. "Add a risk policy". */
  addLabel?: string;
}) {
  const sort = useSort(rows, accessors);

  const sortControl =
    viewMode === "cards" ? (
      <SortSelect
        options={sortOptions}
        value={sort.key ?? ""}
        onChange={(value) => {
          if (!value) {
            sort.set(null);
          } else {
            const option = sortOptions.find((o) => o.value === value)!;
            sort.set(option.value, option.dir);
          }
        }}
      />
    ) : null;

  return (
    <div className="mt-6">
      {(title || sortControl) && (
        <div className="flex min-h-[20px] items-center justify-between gap-3">
          {title ? <SectionHeading>{title}</SectionHeading> : <span />}
          {sortControl}
        </div>
      )}

      {viewMode === "table" ? (
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--ew-blue-tertiary-50)" }}>
              {columns.map((column) =>
                column.sortKey ? (
                  <SortHeader
                    key={column.label}
                    label={column.label}
                    right={column.right}
                    active={sort.key === column.sortKey}
                    dir={sort.dir}
                    onClick={() => sort.toggle(column.sortKey!)}
                  />
                ) : (
                  <th
                    key={column.label}
                    className={cn(
                      plainThClass,
                      column.right ? "text-right" : "text-left"
                    )}
                  >
                    {column.label}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>{sort.sorted.map(renderRow)}</tbody>
        </table>
      ) : (
        <div
          className={cn(
            "mt-2 grid gap-3",
            gridClass ?? "sm:grid-cols-2 xl:grid-cols-3"
          )}
        >
          {sort.sorted.map(renderCard)}
        </div>
      )}

      {addLabel && <SectionAdd label={addLabel} />}
    </div>
  );
}

/**
 * Per-section "add" footer — advisor-facing and contextual to the section
 * (e.g. "Add a risk policy"), with an upload shortcut. Replaces the single
 * generic "Something missing?" panel.
 */
export function SectionAdd({ label }: { label: string }) {
  return (
    <div
      className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-[13px]"
      style={{ borderColor: "var(--ew-blue-tertiary-50)" }}
    >
      <button
        type="button"
        className="flex items-center gap-1.5 font-medium hover:underline"
        style={{ color: "var(--ew-blue)" }}
      >
        <Plus className="h-3.5 w-3.5" />
        {label}
      </button>
      <button type="button" className="text-gray-500 hover:underline">
        Upload a statement
      </button>
    </div>
  );
}

/**
 * Card rendering of a listing row, hero-value layout (the KPI-tile shape):
 * name + optional pill, context line, one big number, small foot line.
 */
export function ProductCard({
  name,
  sub,
  pill,
  value,
  valueSuffix,
  foot,
  onClick,
}: {
  name: string;
  sub?: string;
  pill?: { label: string; tone: Tone };
  value: string;
  valueSuffix?: string;
  foot?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <div
      className="cursor-pointer rounded-lg border p-3.5 transition-shadow hover:shadow-sm motion-reduce:transition-none"
      style={cardSurface}
      onClick={onClick}
      role="button"
    >
      <div className="flex gap-1.5">
        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div
              className="text-sm font-medium"
              style={{ color: "var(--ew-blue)" }}
            >
              {name}
            </div>
            {pill && <StatusCard label={pill.label} tone={pill.tone} />}
          </div>
          {sub && <div className="mt-0.5 text-xs text-gray-500">{sub}</div>}
          <div className="mt-2 text-lg font-semibold tabular-nums text-neutral-900">
            {value}
            {valueSuffix && (
              <span className="ml-1 text-xs font-normal text-gray-500">
                {valueSuffix}
              </span>
            )}
          </div>
          {foot && (
            <div className="mt-1 flex items-center justify-between gap-2 text-xs text-gray-500">
              {foot}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
