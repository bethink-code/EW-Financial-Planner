import { useState } from "react";
import { FileText } from "lucide-react";
import type { PanelId } from "./data";
import { MEDICAL_ROWS, type CoverRow } from "./data-holdings";
import { productGoalLabels, type ProductId } from "./data-links";
import { ChipRow, StatusCard } from "./primitives";
import { cardSurface, ListingSection } from "./listings";
import {
  ViewModeToggle,
  type Accessors,
  type SortOption,
  type ViewMode,
} from "./view";
import type { ManagedFilter } from "./tab-investments";

function RecordedBadge() {
  return (
    <span
      className="inline-flex items-center rounded-md border bg-white px-2 py-0.5 text-[11px] font-medium text-gray-500"
      style={{ borderColor: "#BDBDBD" }}
    >
      Recorded
    </span>
  );
}

const ACCESSORS: Accessors<CoverRow> = {
  name: (r) => r.name,
  premium: (r) => parseFloat(r.premium.replace(/[^\d.]/g, "")),
};

const SORT_OPTIONS: SortOption[] = [
  { value: "name", label: "Name (A–Z)", dir: "asc" },
  { value: "premium", label: "Premium (high–low)", dir: "desc" },
];

const TABLE_COLUMNS = [
  { label: "Plan", sortKey: "name" },
  { label: "Provider" },
  { label: "Premium", right: true, sortKey: "premium" },
  { label: "Status" },
  { label: "Goals" },
];

interface TabMedicalProps {
  openPanel: (id: PanelId) => void;
  managedFilter: ManagedFilter;
}

export function TabMedical({ openPanel, managedFilter }: TabMedicalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const tdClass = "px-3 py-3 align-middle";
  const rowClass =
    "cursor-pointer border-b hover:bg-[var(--ew-row-tint)] transition-colors";

  const rows = MEDICAL_ROWS.filter((r) => {
    if (managedFilter === "managed") return r.managed;
    if (managedFilter === "recorded") return !r.managed;
    return true;
  });

  const renderRow = (row: CoverRow) => {
    const goals = productGoalLabels(row.productId as ProductId);
    return (
      <tr
        key={row.productId}
        className={rowClass}
        style={{ borderColor: "var(--ew-border)" }}
        onClick={() => openPanel(row.panelId)}
      >
        <td className={tdClass}>
          <div className="flex items-start gap-2">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <div className="text-sm font-medium" style={{ color: "var(--ew-blue)" }}>
                {row.name}
              </div>
              <div className="mt-0.5 text-xs text-gray-500">{row.meta1}</div>
              {!row.managed && <div className="mt-1"><RecordedBadge /></div>}
            </div>
          </div>
        </td>
        <td className="px-3 py-3 align-middle text-[13px] text-gray-500">
          {row.meta2}
        </td>
        <td className="px-3 py-3 align-middle text-right font-semibold tabular-nums text-neutral-900">
          {row.premium}
        </td>
        <td className={tdClass}>
          <StatusCard label={row.pill.label} tone={row.pill.tone} />
        </td>
        <td className={tdClass}>
          <ChipRow tags={goals} />
        </td>
      </tr>
    );
  };

  const renderCard = (row: CoverRow) => {
    const goals = productGoalLabels(row.productId as ProductId);
    return (
      <div
        key={row.productId}
        className="cursor-pointer rounded-lg border p-3.5 transition-shadow hover:shadow-sm"
        style={cardSurface}
        onClick={() => openPanel(row.panelId)}
        role="button"
      >
        <div className="flex items-start gap-2">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-medium" style={{ color: "var(--ew-blue)" }}>
                {row.name}
              </div>
              {!row.managed && <RecordedBadge />}
            </div>
            <div className="mt-0.5 text-xs text-gray-500">
              {row.meta1} · {row.meta2}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-lg font-semibold tabular-nums text-neutral-900">
                {row.premium.replace(" p.m.", "")}
                <span className="ml-1 text-xs font-normal text-gray-500">p.m.</span>
              </div>
              <StatusCard label={row.pill.label} tone={row.pill.tone} />
            </div>
            {goals.length > 0 && (
              <div className="mt-2">
                <div className="mb-1 text-[11px] text-gray-400">Goals</div>
                <ChipRow tags={goals} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[13px] text-gray-500">Total premiums</div>
          <div className="text-[28px] font-semibold tabular-nums text-neutral-900">
            R 6 700{" "}
            <span className="text-base font-normal text-gray-400">p.m.</span>
          </div>
          <div className="text-xs text-gray-400">1 plan</div>
        </div>
        <ViewModeToggle mode={viewMode} onChange={setViewMode} />
      </div>

      <ListingSection
        viewMode={viewMode}
        columns={TABLE_COLUMNS}
        rows={rows}
        accessors={ACCESSORS}
        sortOptions={SORT_OPTIONS}
        renderRow={renderRow}
        renderCard={renderCard}
        addLabel="Add a medical aid plan"
      />
    </div>
  );
}
