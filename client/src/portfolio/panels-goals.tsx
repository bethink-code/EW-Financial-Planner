import { PURPOSE_OPTIONS } from "./data";
import { ProgressBar } from "./primitives";
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
 * mini plan strip). Action buttons are placeholders per the brief.
 */

export function GoalRetirePanel() {
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
              v: "≈ R 6.1m — shortfall R 2.4m",
              tone: "warn",
              num: true,
            },
          ]}
        />
        <ProgressBar pct={24} tone="warn" className="mt-3" />
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
          <PanelButton>Adjust target</PanelButton>
          <PanelButton ghost>Model contribution increase</PanelButton>
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

export function GoalUnassignedPanel({
  onResolve,
}: {
  onResolve: (queueId: number) => void;
}) {
  return (
    <>
      <p className="text-sm text-neutral-700">
        <span className="font-semibold">ABSA Share portfolio</span> · R 460 000
        has no product purpose captured.
      </p>
      <PanelField label="Product purpose">
        <select className={panelInputClass}>
          {PURPOSE_OPTIONS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </PanelField>
      <PanelButton onClick={() => onResolve(5)}>Save purpose</PanelButton>
      <NoteBlock>
        Uses the existing Product purpose field — no data model change. Once
        set, the product joins the plan view automatically.
      </NoteBlock>
    </>
  );
}
