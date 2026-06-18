import { useState } from "react";
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
import { RISK_COVER_SUMMARY } from "./data-risk";

/**
 * Level 2 goal drill-in panels (Concept B, also reachable from Concept C's
 * mini plan strip). The retirement what-if panel lives in
 * panels-goal-retire.tsx.
 */

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
      <PanelSection title="Total cover in place">
        <KvGrid
          rows={RISK_COVER_SUMMARY.map((cover) => ({
            k: cover.label,
            v: cover.value,
            num: true,
          }))}
        />
      </PanelSection>
      <PanelSection title="Premiums by policy">
        <FundList
          items={[
            {
              label: "Liberty (to estate)",
              value: "R 3 100 p.m.",
              dotTone: "warn",
            },
            { label: "Myriad (to spouse)", value: "R 2 100 p.m." },
            { label: "Old Mutual (to child)", value: "R 2 000 p.m." },
          ]}
        />
      </PanelSection>
      <NoteBlock tone="warn">
        Benefit amounts are missing on the Liberty policy, so total cover is
        understated and cover vs need can't be analysed yet.
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

export function GoalMedicalPanel() {
  return (
    <>
      <PanelSection title="Cover in place">
        <KvGrid
          rows={[
            { k: "Plan", v: "Discovery Classic Delta Saver" },
            { k: "Supplier", v: "Discovery Health" },
            { k: "Premium", v: "R 6 700 p.m.", num: true },
            { k: "Status", v: "In force", tone: "good" },
          ]}
        />
      </PanelSection>
      <NoteBlock>
        Healthcare cover for the household. Plan-versus-needs analysis lives in
        the medical aid review.
      </NoteBlock>
      <Level3Block />
    </>
  );
}

export function GoalShortTermPanel() {
  return (
    <>
      <PanelSection title="Cover in place">
        <KvGrid
          rows={[
            { k: "Product", v: "Santam Short Term Product" },
            { k: "Supplier", v: "Santam" },
            { k: "Premium", v: "R 3 400 p.m.", num: true },
            { k: "Status", v: "In force", tone: "good" },
          ]}
        />
      </PanelSection>
      <NoteBlock>
        Asset and liability cover (vehicle, home, contents). Sums insured aren't
        captured here yet.
      </NoteBlock>
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
