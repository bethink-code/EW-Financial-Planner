import { FileText, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PanelId, Tone } from "./data";
import type { CoverRow } from "./data-holdings";
import { SectionHeading, StatusCard } from "./primitives";
import {
  parseAmount,
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

/**
 * Thin policy card shared by the cover tabs (long-term risk, short-term risk,
 * medical aid): name + status up top, premium below. The depth (goals,
 * benefits, holdings) lives in the product's slide-in panel, one click away.
 */
export function CoverPolicyCard({
  row,
  openPanel,
}: {
  row: CoverRow;
  openPanel: (id: PanelId) => void;
}) {
  return (
    <div
      className="cursor-pointer rounded-lg border bg-white p-4 transition-shadow hover:shadow-sm"
      style={{ borderColor: "var(--ew-border)" }}
      onClick={() => openPanel(row.panelId)}
      role="button"
    >
      <div className="flex items-start gap-2">
        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
        <div className="min-w-0">
          <div className="text-[14px] font-semibold leading-tight" style={{ color: "var(--ew-primary-navy)" }}>
            {row.name}
          </div>
          <div className="mt-0.5 text-[11px] text-gray-500">{row.meta1} · {row.meta2}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <div className="text-[22px] font-bold tabular-nums text-neutral-900">{row.premium}</div>
          <div className="text-[11px] text-gray-400">Monthly premium</div>
        </div>
        <StatusCard label={row.pill.label} tone={row.pill.tone} />
      </div>
    </div>
  );
}

/**
 * Table rendering of the cover rows — the table half of the cards/table
 * toggle on the cover tabs. Sortable headers, rows click through to the
 * product's slide-in panel like the cards do.
 */
export function CoverPolicyTable({
  rows,
  openPanel,
}: {
  rows: CoverRow[];
  openPanel: (id: PanelId) => void;
}) {
  const accessors: Accessors<CoverRow> = {
    name:    (r) => r.name,
    premium: (r) => parseAmount(r.premium),
    status:  (r) => r.pill.label,
  };
  const sort = useSort(rows, accessors);

  return (
    <div className="p-5">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: "var(--ew-blue-tertiary-50)" }}>
            <SortHeader label="Policy"  active={sort.key === "name"}    dir={sort.dir} onClick={() => sort.toggle("name")} />
            <th className={cn(plainThClass, "text-left")}>Details</th>
            <SortHeader label="Premium" right active={sort.key === "premium"} dir={sort.dir} onClick={() => sort.toggle("premium")} />
            <SortHeader label="Status"  active={sort.key === "status"}  dir={sort.dir} onClick={() => sort.toggle("status")} />
          </tr>
        </thead>
        <tbody>
          {sort.sorted.map((row) => (
            <tr
              key={row.productId}
              className="cursor-pointer border-b hover:bg-[var(--ew-row-tint)]"
              style={{ borderColor: "var(--ew-border)" }}
              onClick={() => openPanel(row.panelId)}
            >
              <td className="px-3 py-2.5 font-medium" style={{ color: "var(--ew-primary-navy)" }}>
                {row.name}
              </td>
              <td className="px-3 py-2.5 text-gray-500">{row.meta1} · {row.meta2}</td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right font-medium tabular-nums text-neutral-900">
                {row.premium}
              </td>
              <td className="px-3 py-2.5">
                <StatusCard label={row.pill.label} tone={row.pill.tone} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
    <div className="mt-10">
      {(title || sortControl) && (
        <div className="flex min-h-[20px] items-center justify-between gap-3">
          {title ? <SectionHeading>{title}</SectionHeading> : <span />}
          {sortControl}
        </div>
      )}

      {viewMode === "table" ? (
        <>
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
          {addLabel && (
            <div className="mt-3 sm:max-w-xs">
              <SectionAdd label={addLabel} />
            </div>
          )}
        </>
      ) : (
        <div
          className={cn(
            "mt-2 grid gap-3",
            gridClass ?? "sm:grid-cols-2 xl:grid-cols-3"
          )}
        >
          {sort.sorted.map(renderCard)}
          {addLabel && <SectionAdd label={addLabel} />}
        </div>
      )}
    </div>
  );
}

/**
 * Per-section "add" card — advisor-facing and contextual to the section
 * (e.g. "Add a risk policy"). A dashed card with a + that sits in the card
 * grid or below the table. The advisor captures the policy properly, so
 * there's no upload-a-statement shortcut. Replaces the generic
 * "Something missing?" panel.
 */
export function SectionAdd({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-2 self-start rounded-lg border border-dashed px-4 py-3 text-[13px] font-medium transition-colors hover:bg-[var(--ew-row-tint)] motion-reduce:transition-none"
      style={{ borderColor: "var(--ew-border)", color: "var(--ew-blue)" }}
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
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
