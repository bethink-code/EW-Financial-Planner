import { useState } from "react";
import { FileText } from "lucide-react";
import { HybridViewWrapper } from "@/components/common/hybrid-view-wrapper";
import { HybridHeaderBar } from "@/components/common/hybrid-header-bar";
import { SummaryBand, SummaryTile } from "@/components/common/summary-band";
import { SubcategoryNav, type SubcatItem } from "./subcategory-nav";
import { FreshnessDot, MiniCard } from "./primitives";
import { INVESTMENT_ROWS, type InvestmentRow } from "./data-holdings";
import { productGoalLabels, type ProductId } from "./data-links";
import type { PanelId, Tone } from "./data";

export type Dir = "subcategory" | "need";
export type ManagedFilter = "all" | "managed" | "not-managed";

const SUBCATS: SubcatItem[] = [
  { id: "all",        label: "All investments",  summary: "R 3 031 961" },
  { id: "unit-trust", label: "Unit trusts",       summary: "R 500 000" },
  { id: "pension",    label: "Pension funds",     summary: "R 980 000" },
  { id: "offshore",   label: "Offshore",          summary: "R 1 091 961" },
  { id: "shares",     label: "Direct shares",     summary: "R 460 000" },
  { id: "tax-free",   label: "Tax-free savings",  summary: "R 0", empty: true },
];

const NEED_SUBCATS: SubcatItem[] = [
  { id: "all",        label: "All",               summary: "4 products",        tone: "neutral" },
  { id: "retirement", label: "Retirement",        summary: "24% of target",     tone: "warn" },
  { id: "education",  label: "Education",         summary: "67% of target",     tone: "good" },
  { id: "unassigned", label: "Not yet assigned",  summary: "1 product",         tone: "warn" },
  { id: "emergency",  label: "Emergency fund",    summary: "Gap — no products", tone: "bad", empty: true },
];

const NEED_PRODUCT_IDS: Record<string, string[]> = {
  all:        ["absa", "pension", "momentum", "ut"],
  retirement: ["pension", "momentum"],
  education:  ["ut"],
  unassigned: ["absa"],
  emergency:  [],
};

function goalMiniCards(row: InvestmentRow): { label: string; value: string; tone: Tone }[] {
  const goals = productGoalLabels(row.productId as ProductId);
  if (goals.length === 0) return [{ label: "Goal", value: "Not yet assigned", tone: "warn" }];
  return goals.map((label) => {
    const tone: Tone =
      label === "Retirement" ? "warn" :
      label.startsWith("Education") ? "good" :
      "good";
    return {
      label,
      value: label === "Retirement" ? "24% · Behind target" : "67% · On track",
      tone,
    };
  });
}

function PolicyCard({ row, openPanel }: { row: InvestmentRow; openPanel: (id: PanelId) => void }) {
  const miniCards = goalMiniCards(row);
  return (
    <div
      className="cursor-pointer rounded-lg border bg-white p-4 transition-shadow hover:shadow-sm"
      style={{ borderColor: "var(--ew-border)" }}
      onClick={() => openPanel(row.panelId)}
      role="button"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <div>
            <div className="text-[14px] font-semibold leading-tight" style={{ color: "var(--ew-primary-navy)" }}>
              {row.name}
            </div>
            <div className="mt-0.5 text-[11px] text-gray-500">{row.supplier}</div>
          </div>
        </div>
        {!row.managed && (
          <span className="shrink-0 rounded-md border bg-white px-2 py-0.5 text-[11px] text-gray-500" style={{ borderColor: "#BDBDBD" }}>
            Not managed
          </span>
        )}
      </div>

      <div className="mt-3">
        <div className="text-[22px] font-bold tabular-nums text-neutral-900">{row.value}</div>
        <div className="flex items-center gap-2 text-[12px]">
          <span className="flex items-center gap-1 text-gray-400">
            <FreshnessDot tone={row.freshness} />
            {row.date}
          </span>
          {row.irr !== "—" && <span className="text-gray-500">· IRR {row.irr}</span>}
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Goals this covers
        </div>
        <div className="flex flex-wrap gap-2">
          {miniCards.map((mc) => (
            <MiniCard key={mc.label} label={mc.label} value={mc.value} tone={mc.tone} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface TabInvestmentsProps {
  dir: Dir;
  managedFilter: ManagedFilter;
  openPanel: (id: PanelId) => void;
  viewActions?: React.ReactNode;
}

export function TabInvestments({ dir, managedFilter, openPanel, viewActions }: TabInvestmentsProps) {
  const [selected, setSelected] = useState("all");

  const allNavItems = dir === "subcategory" ? SUBCATS : NEED_SUBCATS;
  const selectedLabel = allNavItems.find((s) => s.id === selected)?.label ?? "Investments";

  const visibleRows = (() => {
    let rows = INVESTMENT_ROWS;
    if (selected !== "all") {
      if (dir === "subcategory") {
        rows = rows.filter((r) => r.subcategory === selected);
      } else {
        const ids = NEED_PRODUCT_IDS[selected] ?? [];
        rows = rows.filter((r) => ids.includes(r.productId));
      }
    }
    if (managedFilter === "managed")     rows = rows.filter((r) => r.managed);
    if (managedFilter === "not-managed") rows = rows.filter((r) => !r.managed);
    return rows;
  })();

  const productCount = INVESTMENT_ROWS.length;

  return (
    <HybridViewWrapper
      summary={
        <SummaryBand
          tileFit="hug"
          firstSlot={
            <SummaryTile
              variant="accent"
              label="Total investments"
              value="R 3 031 961"
              subValue={`across ${productCount} products`}
            />
          }
        >
          {dir === "subcategory" ? (
            <>
              <SummaryTile label="Managed"     value="R 2 571 961" subValue="3 products" />
              <SummaryTile label="Not managed" value="R 460 000"   subValue="1 product" />
            </>
          ) : (
            <>
              <SummaryTile label="Retirement" value="24% funded" subValue="Behind target" />
              <SummaryTile label="Education"  value="67% funded" subValue="On track" />
            </>
          )}
        </SummaryBand>
      }
      header={
        <HybridHeaderBar
          add={{ label: "Add investment", onClick: () => {} }}
          title={selectedLabel}
          actions={viewActions}
        />
      }
      summaryCards={
        <SubcategoryNav items={allNavItems} selected={selected} onChange={setSelected} />
      }
      detailForms={
        visibleRows.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-gray-400">No products in this selection</div>
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            {visibleRows.map((row) => (
              <PolicyCard key={row.productId} row={row} openPanel={openPanel} />
            ))}
          </div>
        )
      }
    />
  );
}
