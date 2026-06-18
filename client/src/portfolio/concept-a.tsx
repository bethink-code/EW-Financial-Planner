import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PanelId } from "./data";
import { STRIP_A } from "./data-attention";
import {
  HOUSEHOLD_CHIPS,
  INVESTMENT_ROWS,
  KPIS,
  MEDICAL_ROWS,
  RISK_ROWS,
  SHORT_TERM_ROWS,
  type CoverRow,
  type InvestmentRow,
} from "./data-holdings";
import { ChipRow, FreshnessDot, KpiTile, StatusCard } from "./primitives";
import { benefitTags } from "./data-risk";
import { AttentionStrip } from "./attention";
import {
  PlanGapCallout,
  RefetchBar,
  SomethingMissing,
} from "./content-patterns";
import { ListingSection, ProductCard } from "./listings";
import { SegmentButton, SegmentGroup, type ViewMode } from "./view";
import {
  coverColumns,
  COVER_ACCESSORS,
  COVER_SORTS,
  INVESTMENT_ACCESSORS,
  INVESTMENT_COLUMNS,
  INVESTMENT_SORTS,
} from "./concept-a-config";

/**
 * Concept A — "At a glance". The familiar category-grouped product view,
 * elevated into a scannable snapshot: KPI band, attention strip, household
 * filters (decorative in the mockup), category listings (table or cards).
 */

interface ConceptAProps {
  openPanel: (id: PanelId) => void;
  readiness: number;
  resolved: Set<number>;
  expanded: boolean;
  onToggle: () => void;
  viewMode: ViewMode;
}

const tdClass = "px-3 py-2.5 align-middle";
const rowClass = "cursor-pointer border-b hover:bg-[var(--ew-row-tint)]";
const rowStyle = { borderColor: "var(--ew-border)" } as const;

export function ConceptA({
  openPanel,
  readiness,
  resolved,
  expanded,
  onToggle,
  viewMode,
}: ConceptAProps) {
  const investmentRow = (row: InvestmentRow) => (
    <tr
      key={row.name}
      className={rowClass}
      style={rowStyle}
      onClick={() => openPanel(row.panelId)}
    >
      <td
        className={cn(tdClass, "font-medium")}
        style={{ color: "var(--ew-blue)" }}
      >
        {row.name}
      </td>
      <td className={tdClass}>{row.category}</td>
      <td className={tdClass}>{row.supplier}</td>
      <td className={cn(tdClass, "text-right tabular-nums")}>{row.premium}</td>
      <td className={cn(tdClass, "text-right font-semibold tabular-nums")}>
        {row.value}
      </td>
      <td className={tdClass}>
        <span className="flex items-center gap-1.5 whitespace-nowrap tabular-nums">
          <FreshnessDot tone={row.freshness} />
          {row.date}
        </span>
      </td>
    </tr>
  );

  const investmentCard = (row: InvestmentRow) => (
    <ProductCard
      key={row.name}
      name={row.name}
      sub={`${row.category} · ${row.supplier}`}
      value={row.value}
      foot={
        <>
          <span className="flex items-center gap-1.5 tabular-nums">
            <FreshnessDot tone={row.freshness} />
            Last valued {row.date}
          </span>
          {row.premium !== "—" && (
            <span className="tabular-nums">Contributing {row.premium}</span>
          )}
        </>
      }
      onClick={() => openPanel(row.panelId)}
    />
  );

  const coverRow = (row: CoverRow) => {
    const tags = benefitTags(row.panelId);
    return (
      <tr
        key={row.name}
        className={rowClass}
        style={rowStyle}
        onClick={() => openPanel(row.panelId)}
      >
        <td
          className={cn(tdClass, "font-medium")}
          style={{ color: "var(--ew-blue)" }}
        >
          {row.name}
        </td>
        <td className={tdClass}>{row.meta1}</td>
        <td className={tdClass}>{row.meta2}</td>
        <td className={cn(tdClass, "text-right tabular-nums")}>
          {row.premium}
        </td>
        <td className={tdClass}>
          <StatusCard label={row.pill.label} tone={row.pill.tone} />
          {tags.length > 0 && (
            <div className="mt-1.5">
              <ChipRow tags={tags} />
            </div>
          )}
        </td>
      </tr>
    );
  };

  const coverCard = (row: CoverRow) => {
    const tags = benefitTags(row.panelId);
    return (
      <ProductCard
        key={row.name}
        name={row.name}
        sub={`${row.meta1} · ${row.meta2}`}
        pill={row.pill}
        value={row.premium.replace(" p.m.", "")}
        valueSuffix="p.m."
        foot={tags.length > 0 ? <ChipRow tags={tags} /> : undefined}
        onClick={() => openPanel(row.panelId)}
      />
    );
  };

  return (
    <div>
      {/* KPI band */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => (
          <KpiTile key={kpi.label} {...kpi} />
        ))}
      </div>

      <RefetchBar
        asAt="06/10/2025"
        staleNote="3 of 4 valuations need updating"
      />

      <AttentionStrip
        copy={STRIP_A}
        readiness={readiness}
        expanded={expanded}
        onToggle={onToggle}
        openPanel={openPanel}
        resolved={resolved}
      />

      <PlanGapCallout
        items={[
          {
            title: "Emergency fund — no product assigned",
            note: "≈ R 160 000 recommended (3 months' expenses)",
            onClick: () => openPanel("goal-emergency"),
          },
        ]}
      />

      {/* Household filters (decorative in the mockup) */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SegmentGroup>
          {HOUSEHOLD_CHIPS.map((chip) => (
            <SegmentButton key={chip.label} active={chip.on} onClick={() => {}}>
              {chip.label}
            </SegmentButton>
          ))}
        </SegmentGroup>
        <button
          type="button"
          className="ml-auto flex h-8 items-center rounded-md border bg-white px-3 text-[13px] text-gray-600"
          style={{ borderColor: "var(--ew-border)" }}
        >
          In force only ✓
        </button>
        <button
          type="button"
          className="flex h-8 items-center gap-1 rounded-md border bg-white px-3 text-[13px] text-gray-600"
          style={{ borderColor: "var(--ew-border)" }}
        >
          ZAR <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <ListingSection
        title="Investments — R 3 031 961"
        viewMode={viewMode}
        columns={INVESTMENT_COLUMNS}
        rows={INVESTMENT_ROWS}
        accessors={INVESTMENT_ACCESSORS}
        sortOptions={INVESTMENT_SORTS}
        renderRow={investmentRow}
        renderCard={investmentCard}
      />

      <ListingSection
        title="Risk — R 7 200 p.m."
        viewMode={viewMode}
        columns={coverColumns("Supplier", "Reference")}
        rows={RISK_ROWS}
        accessors={COVER_ACCESSORS}
        sortOptions={COVER_SORTS}
        renderRow={coverRow}
        renderCard={coverCard}
      />

      <ListingSection
        title="Medical aid — R 6 700 p.m."
        viewMode={viewMode}
        columns={coverColumns("Category", "Supplier")}
        rows={MEDICAL_ROWS}
        accessors={COVER_ACCESSORS}
        sortOptions={COVER_SORTS}
        renderRow={coverRow}
        renderCard={coverCard}
      />

      <ListingSection
        title="Short term insurance — R 3 400 p.m."
        viewMode={viewMode}
        columns={coverColumns("Category", "Supplier")}
        rows={SHORT_TERM_ROWS}
        accessors={COVER_ACCESSORS}
        sortOptions={COVER_SORTS}
        renderRow={coverRow}
        renderCard={coverCard}
      />

      <SomethingMissing
        reasons={[
          "we don't have the product captured yet",
          "the cover is held somewhere we can't see",
          "we're still capturing the latest statement",
        ]}
        note="If a policy is missing, upload a schedule or statement and we'll capture it for you."
        actions={[
          { label: "Discuss this" },
          { label: "Add a policy", primary: true },
        ]}
      />
    </div>
  );
}
