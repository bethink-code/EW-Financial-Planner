import { useState } from "react";
import {
  FundList,
  KvGrid,
  Level3Block,
  NoteBlock,
  PanelButton,
  PanelSection,
} from "./panel-shell";
import {
  BreakdownBar,
  PanelTabs,
  RolesGrid,
  SegmentBar,
  SEGMENT_COLORS,
} from "./panel-parts";

/**
 * Tabbed Level 2 investment fly-ins (Funds/Holdings · Asset allocation ·
 * Policy details), matching the Final Wireframe. Asset-allocation splits are
 * illustrative where the underlying split isn't captured.
 */

export function MomentumPanel() {
  const [tab, setTab] = useState("Funds");
  return (
    <>
      <PanelTabs
        tabs={["Funds", "Asset allocation", "Policy details"]}
        active={tab}
        onChange={setTab}
      />

      {tab === "Funds" && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-semibold tabular-nums text-neutral-900">
                R 1 091 961
              </span>
            </div>
            <SegmentBar segments={[{ pct: 100, color: SEGMENT_COLORS[0] }]} />
          </div>
          <div
            className="flex items-center justify-between gap-3 rounded-md border p-3"
            style={{ borderColor: "var(--ew-border)" }}
          >
            <div>
              <div
                className="text-sm font-medium"
                style={{ color: "var(--ew-blue)" }}
              >
                Sanlam Global Best Ideas (A)
              </div>
              <div className="text-xs text-gray-500">As of 08/04/2020</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="tabular-nums text-neutral-900">R 1 091 961</span>
              <PanelButton ghost>Fund fact sheet</PanelButton>
            </div>
          </div>
        </div>
      )}

      {tab === "Asset allocation" && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Local 3%</span>
              <span className="text-gray-500">Offshore 97%</span>
            </div>
            <SegmentBar
              segments={[
                { pct: 3, color: SEGMENT_COLORS[0] },
                { pct: 97, color: SEGMENT_COLORS[5] },
              ]}
            />
          </div>
          <div>
            <BreakdownBar
              label="Equity (78%)"
              value="R 851 730"
              pct={78}
              color={SEGMENT_COLORS[0]}
            />
            <BreakdownBar
              label="Cash (9%)"
              value="R 98 277"
              pct={9}
              color={SEGMENT_COLORS[1]}
            />
            <BreakdownBar
              label="Bonds (7%)"
              value="R 76 437"
              pct={7}
              color={SEGMENT_COLORS[2]}
            />
            <BreakdownBar
              label="Property (4%)"
              value="R 43 678"
              pct={4}
              color={SEGMENT_COLORS[4]}
            />
            <BreakdownBar
              label="Other (2%)"
              value="R 21 839"
              pct={2}
              color={SEGMENT_COLORS[5]}
            />
          </div>
          <p className="text-xs text-gray-400">
            Split illustrative — last loaded 08/04/2020.
          </p>
        </div>
      )}

      {tab === "Policy details" && (
        <div className="space-y-4">
          <KvGrid
            rows={[
              { k: "Category", v: "Offshore Investment" },
              { k: "Supplier", v: "Momentum Wealth Intl" },
              {
                k: "Current value",
                v: "R 1 091 961 · 08/04/2020",
                tone: "bad",
                num: true,
              },
              { k: "Contribution", v: "None — lump sum" },
            ]}
          />
          <PanelSection title="Roles">
            <RolesGrid
              roles={[
                { label: "Owner", name: "B Meander" },
                { label: "Investor", name: "B Meander" },
                { label: "Adviser", name: "My Company" },
              ]}
            />
          </PanelSection>
        </div>
      )}

      <NoteBlock tone="bad">
        Valuation 6 years old — update before the review.
      </NoteBlock>
      <Level3Block />
    </>
  );
}

export function AbsaPanel() {
  const [tab, setTab] = useState("Holdings");
  return (
    <>
      <PanelTabs
        tabs={["Holdings", "Asset allocation", "Policy details"]}
        active={tab}
        onChange={setTab}
      />

      {tab === "Holdings" && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-semibold tabular-nums text-neutral-900">
                R 460 000
              </span>
            </div>
            <SegmentBar
              segments={[
                { pct: 56.5, color: SEGMENT_COLORS[0] },
                { pct: 21.7, color: SEGMENT_COLORS[1] },
                { pct: 21.8, color: SEGMENT_COLORS[2] },
              ]}
            />
          </div>
          <FundList
            items={[
              { label: "Vodacom Group Ltd", value: "R 260 000" },
              { label: "MTN Group Ltd Shares", value: "R 100 000" },
              { label: "Alexander Forbes Grp Hldgs", value: "R 100 000" },
            ]}
          />
        </div>
      )}

      {tab === "Asset allocation" && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Local 100%</span>
              <span className="text-gray-500">Offshore 0%</span>
            </div>
            <SegmentBar segments={[{ pct: 100, color: SEGMENT_COLORS[0] }]} />
          </div>
          <div>
            <BreakdownBar
              label="Telecoms (78%)"
              value="R 360 000"
              pct={78}
              color={SEGMENT_COLORS[0]}
            />
            <BreakdownBar
              label="Financials (22%)"
              value="R 100 000"
              pct={22}
              color={SEGMENT_COLORS[1]}
            />
          </div>
          <p className="text-xs text-gray-400">
            100% local equity · direct shares.
          </p>
        </div>
      )}

      {tab === "Policy details" && (
        <div className="space-y-4">
          <KvGrid
            rows={[
              { k: "Category", v: "Direct Shares" },
              { k: "Supplier", v: "ABSA Stockbrokers" },
              {
                k: "Current value",
                v: "R 460 000 · 06/10/2025",
                num: true,
              },
              { k: "Owner", v: "B Meander (100%)" },
              { k: "Purpose", v: "Not set", tone: "warn" },
            ]}
          />
          <NoteBlock tone="warn">
            Ongoing fees not configured — all rows at 0%.{" "}
            <span className="font-medium" style={{ color: "var(--ew-blue)" }}>
              Configure fees →
            </span>
          </NoteBlock>
        </div>
      )}

      <Level3Block />
    </>
  );
}
