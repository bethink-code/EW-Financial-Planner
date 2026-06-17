import { useState } from "react";
import { ProgressBar } from "./primitives";
import { formatRand } from "./view";
import {
  FundList,
  KvGrid,
  Level3Block,
  NoteBlock,
  PanelButton,
  PanelField,
  PanelSection,
  panelInputClass,
} from "./panel-shell";

/**
 * Level 2 goal drill-in panels (Concept B, also reachable from Concept C's
 * mini plan strip).
 */

// Retirement what-if: future value at 65 of R1/month over 14 years at an
// assumed ~5.5% p.a. The base projection anchors to the fixture (≈ R 6.1m),
// so extra = 0 reproduces the displayed R 2.4m shortfall.
const RETIRE_BASE_PROJECTED = 6_100_000;
const RETIRE_TARGET = 8_500_000;
const RETIRE_BASE_SHORTFALL = RETIRE_TARGET - RETIRE_BASE_PROJECTED;
const FV_PER_RAND_PM = 252;

export function GoalRetirePanel() {
  const [extra, setExtra] = useState(0);
  const projected = RETIRE_BASE_PROJECTED + extra * FV_PER_RAND_PM;
  const shortfall = Math.max(0, RETIRE_TARGET - projected);
  const gapClosed = Math.min(extra * FV_PER_RAND_PM, RETIRE_BASE_SHORTFALL);
  const pctGap = (gapClosed / RETIRE_BASE_SHORTFALL) * 100;
  const onTrack = shortfall === 0;

  return (
    <>
      <PanelSection title="Position">
        <KvGrid
          rows={[
            { k: "Target", v: "R 8 500 000 by 2040", num: true },
            { k: "Current", v: "R 2 071 961 (24%)", num: true },
            { k: "Contributing", v: "R 7 500 p.m.", num: true },
            {
              k: "Projected at 65",
              v: onTrack
                ? `${formatRand(projected)} — on track`
                : `${formatRand(projected)} — shortfall ${formatRand(
                    shortfall
                  )}`,
              tone: onTrack ? "good" : "warn",
              num: true,
            },
          ]}
        />
        <ProgressBar pct={24} tone="warn" className="mt-3" />
      </PanelSection>

      <PanelSection title="Model a contribution increase">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Increase by</span>
            <span className="font-semibold tabular-nums text-neutral-900">
              {formatRand(extra)} p.m.
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={10000}
            step={250}
            value={extra}
            onChange={(event) => setExtra(Number(event.target.value))}
            className="w-full accent-[#016991]"
            aria-label="Extra monthly contribution"
          />
          <KvGrid
            rows={[
              {
                k: "New contribution",
                v: `${formatRand(7500 + extra)} p.m.`,
                num: true,
              },
              {
                k: "Shortfall",
                v: onTrack ? "None — on track" : formatRand(shortfall),
                tone: onTrack ? "good" : "warn",
                num: true,
              },
            ]}
          />
          <div>
            <ProgressBar pct={pctGap} tone={onTrack ? "good" : "warn"} />
            <div className="mt-1 text-xs text-gray-500">
              Closes {formatRand(gapClosed)} of the R 2 400 000 shortfall (
              {Math.round(pctGap)}%)
            </div>
          </div>
        </div>
      </PanelSection>

      <PanelSection title="Products serving this goal">
        <FundList
          items={[
            {
              label: "Company Pension Fund",
              value: "R 980 000",
              dotTone: "bad",
            },
            {
              label: "Momentum International",
              value: "R 1 091 961",
              dotTone: "bad",
            },
          ]}
        />
      </PanelSection>
      <NoteBlock>
        Two of two valuations are 6 years old — the on-track position is
        unreliable until they're updated.
      </NoteBlock>
      <PanelSection title="Actions">
        <div className="flex flex-wrap gap-2">
          <PanelButton ghost>Adjust target</PanelButton>
        </div>
      </PanelSection>
      <Level3Block />
    </>
  );
}

export function GoalEduPanel() {
  return (
    <>
      <PanelSection title="Position">
        <KvGrid
          rows={[
            { k: "Target", v: "R 750 000 by 2031", num: true },
            { k: "Current", v: "R 500 000 (67%)", num: true },
            { k: "Contributing", v: "None" },
          ]}
        />
        <ProgressBar pct={67} tone="good" className="mt-3" />
      </PanelSection>
      <PanelSection title="Products serving this goal">
        <FundList
          items={[
            {
              label: "Unit Trust — Coronation Balanced Plus A",
              value: "R 500 000",
            },
          ]}
        />
      </PanelSection>
      <Level3Block />
    </>
  );
}

export function GoalProtectPanel() {
  return (
    <>
      <PanelSection title="Cover in place">
        <FundList
          items={[
            {
              label: "Liberty (to estate)",
              value: "R 3 100 p.m.",
              dotTone: "warn",
            },
            { label: "Myriad (to spouse)", value: "R 2 100 p.m." },
            { label: "Old Mutual (to child)", value: "R 2 000 p.m." },
            { label: "Discovery Classic Delta Saver", value: "R 6 700 p.m." },
            { label: "Santam Short Term", value: "R 3 400 p.m." },
          ]}
        />
      </PanelSection>
      <NoteBlock tone="warn">
        Benefit amounts are missing on the Liberty policy, so cover vs need
        can't be analysed yet.
      </NoteBlock>
      <PanelSection title="Actions">
        <div className="flex flex-wrap gap-2">
          <PanelButton>Capture benefits</PanelButton>
          <PanelButton ghost>Run cover gap analysis</PanelButton>
        </div>
      </PanelSection>
      <Level3Block />
    </>
  );
}

export function GoalEmergencyPanel() {
  return (
    <>
      <p className="text-sm text-neutral-700">
        No product in Ben's portfolio is assigned to emergency provision.
      </p>
      <PanelSection title="Suggested basis">
        <KvGrid
          rows={[
            { k: "Monthly expenses (budget)", v: "≈ R 53 000", num: true },
            { k: "3-month buffer", v: "≈ R 160 000", num: true },
          ]}
        />
      </PanelSection>
      <NoteBlock>
        This is the conversation starter for the review — either assign an
        existing liquid product or open a recommendation.
      </NoteBlock>
      <PanelSection title="Actions">
        <div className="flex flex-wrap gap-2">
          <PanelButton>Assign existing product</PanelButton>
          <PanelButton ghost>Add to advice record</PanelButton>
        </div>
      </PanelSection>
    </>
  );
}

/** Purposes that map to an existing goal in the demo plan. */
const ASSIGNABLE_PURPOSES = [
  "Retirement",
  "Emergency",
  "Saving for a goal: Education",
];

export function GoalUnassignedPanel({
  onAssign,
}: {
  onAssign: (purpose: string) => void;
}) {
  const [purpose, setPurpose] = useState(ASSIGNABLE_PURPOSES[0]);
  return (
    <>
      <p className="text-sm text-neutral-700">
        <span className="font-semibold">ABSA Share portfolio</span> · R 460 000
        has no product purpose captured.
      </p>
      <PanelField label="Product purpose">
        <select
          className={panelInputClass}
          value={purpose}
          onChange={(event) => setPurpose(event.target.value)}
        >
          {ASSIGNABLE_PURPOSES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </PanelField>
      <PanelButton onClick={() => onAssign(purpose)}>Save purpose</PanelButton>
      <NoteBlock>
        Uses the existing Product purpose field — no data model change. Once
        set, the product joins the plan view automatically.
      </NoteBlock>
    </>
  );
}
