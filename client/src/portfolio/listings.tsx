import { cn } from "@/lib/utils";
import type { Tone } from "./data";
import { SectionHeading, StatusPill } from "./primitives";
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
    </div>
  );
}

/** Card rendering of a listing row: name, optional pill, label/value lines. */
export function ProductCard({
  name,
  sub,
  pill,
  stats,
  onClick,
}: {
  name: string;
  sub?: string;
  pill?: { label: string; tone: Tone };
  stats: { label: string; value: React.ReactNode }[];
  onClick: () => void;
}) {
  return (
    <div
      className="cursor-pointer rounded-lg border bg-white p-4 transition-shadow hover:shadow-sm motion-reduce:transition-none"
      style={{ borderColor: "var(--ew-border)" }}
      onClick={onClick}
      role="button"
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="text-sm font-medium"
          style={{ color: "var(--ew-blue)" }}
        >
          {name}
        </div>
        {pill && <StatusPill label={pill.label} tone={pill.tone} />}
      </div>
      {sub && <div className="mt-0.5 text-xs text-gray-500">{sub}</div>}
      <div className="mt-3 space-y-1.5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="text-xs text-gray-500">{stat.label}</span>
            <span className="tabular-nums text-neutral-900">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
