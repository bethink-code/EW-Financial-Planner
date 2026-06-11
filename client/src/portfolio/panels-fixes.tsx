import type { Tone } from "./data";
import {
  KvGrid,
  Level3Block,
  NoteBlock,
  PanelButton,
  PanelField,
  PanelSection,
  panelInputClass,
} from "./panel-shell";

/**
 * Level 2 action panels — the six attention-queue fixes. Saving calls
 * onResolve(queueId), which marks the queue item done and lifts the review
 * readiness ring in Concept C.
 */

export function ValuationFixPanel({
  lastValue,
  lastDate,
  dateTone,
  queueId,
  withExtras,
  onResolve,
}: {
  lastValue: string;
  lastDate: string;
  dateTone: Tone;
  queueId: number;
  /** The pension panel carries the ghost action + data-store note. */
  withExtras?: boolean;
  onResolve: (queueId: number) => void;
}) {
  return (
    <>
      <KvGrid
        rows={[
          { k: "Last value", v: lastValue, num: true },
          { k: "Value date", v: lastDate, tone: dateTone },
        ]}
      />
      <PanelSection title="New value">
        <div className="space-y-3">
          <PanelField label="Value (ZAR)">
            <input type="text" placeholder="0.00" className={panelInputClass} />
          </PanelField>
          <PanelField label="Value date">
            <input
              type="text"
              defaultValue="10/06/2026"
              className={panelInputClass}
            />
          </PanelField>
          <div className="flex flex-wrap gap-2">
            <PanelButton onClick={() => onResolve(queueId)}>
              Save value
            </PanelButton>
            {withExtras && <PanelButton ghost>Request statement</PanelButton>}
          </div>
        </div>
      </PanelSection>
      {withExtras && (
        <NoteBlock>
          Saving here writes to the same Values store as the existing tab —
          Level 2 is a faster door, not a new database.
        </NoteBlock>
      )}
      <Level3Block />
    </>
  );
}

export function FixBenefitsPanel({
  onResolve,
}: {
  onResolve: (queueId: number) => void;
}) {
  return (
    <>
      <p className="text-sm text-neutral-700">
        Benefits can't be captured because no life assured is loaded on this
        policy.
      </p>
      <PanelField label="Life assured">
        <select className={panelInputClass}>
          <option>Ben Meander</option>
          <option>Shadow Meander (spouse)</option>
          <option>Fudge Meander (child)</option>
        </select>
      </PanelField>
      <PanelButton onClick={() => onResolve(3)}>
        Save & capture benefits
      </PanelButton>
      <Level3Block />
    </>
  );
}

const PURPOSE_ASSIGNMENTS = [
  {
    label: "ABSA Share portfolio · R 460 000",
    options: [
      "[ -- select -- ]",
      "Emergency",
      "Retirement",
      "Saving for a goal: Education",
      "Saving for a goal: Property",
    ],
  },
  { label: "Company Pension Fund · R 980 000", options: ["Retirement"] },
  { label: "Momentum International · R 1 091 961", options: ["Retirement"] },
  {
    label: "Unit Trust · R 500 000",
    options: ["Saving for a goal: Education"],
  },
];

export function FixPurposePanel({
  onResolve,
}: {
  onResolve: (queueId: number) => void;
}) {
  return (
    <>
      <p className="text-sm text-neutral-700">
        4 investment products have no purpose set. Assign them in one pass:
      </p>
      <div className="space-y-3">
        {PURPOSE_ASSIGNMENTS.map((field) => (
          <PanelField key={field.label} label={field.label}>
            <select className={panelInputClass}>
              {field.options.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </PanelField>
        ))}
      </div>
      <PanelButton onClick={() => onResolve(5)}>Save all</PanelButton>
      <NoteBlock>
        Same Product purpose field as the Details tab — captured once, used
        everywhere (including Concept B's plan view).
      </NoteBlock>
    </>
  );
}

export function FixFeesPanel({
  onResolve,
}: {
  onResolve: (queueId: number) => void;
}) {
  return (
    <>
      <p className="text-sm text-neutral-700">
        All ongoing fee rows are at 0% for this product.
      </p>
      <KvGrid
        rows={[
          { k: "Adviser fee (ongoing)", v: "0% · not set" },
          { k: "Platform fee", v: "0% · not set" },
          { k: "Fund manager fee", v: "0% · not set" },
        ]}
      />
      <NoteBlock>
        Opens the consolidated fees configuration (separate workstream, in
        progress) pre-filtered to this product.
      </NoteBlock>
      <PanelButton onClick={() => onResolve(6)}>
        Open fee configuration
      </PanelButton>
      <Level3Block />
    </>
  );
}
