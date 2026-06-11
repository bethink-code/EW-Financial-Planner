import { useRef } from "react";
import type { PanelId } from "./data";
import { PanelShell } from "./panel-shell";
import {
  AbsaPanel,
  DiscoveryPanel,
  LibertyPanel,
  MomentumPanel,
  MyriadPanel,
  OldMutualPanel,
  PensionPanel,
  SantamPanel,
  UtPanel,
} from "./panels-products";
import {
  GoalEduPanel,
  GoalEmergencyPanel,
  GoalProtectPanel,
  GoalRetirePanel,
  GoalUnassignedPanel,
} from "./panels-goals";
import {
  FixBenefitsPanel,
  FixFeesPanel,
  FixPurposePanel,
  ValuationFixPanel,
} from "./panels-fixes";

/**
 * Maps every PanelId to its Level 2 slide-in content. The last-shown entry is
 * kept through the close transition so the panel doesn't blank while sliding
 * out.
 */

type Resolve = (queueId: number) => void;

interface PanelEntry {
  kicker: string;
  title: string;
  render: (onResolve: Resolve) => React.ReactNode;
}

const REGISTRY: Record<PanelId, PanelEntry> = {
  absa: {
    kicker: "Product snapshot",
    title: "ABSA Share portfolio",
    render: () => <AbsaPanel />,
  },
  pension: {
    kicker: "Product snapshot",
    title: "Company Pension Fund",
    render: () => <PensionPanel />,
  },
  momentum: {
    kicker: "Product snapshot",
    title: "Momentum International Investment Option",
    render: () => <MomentumPanel />,
  },
  ut: {
    kicker: "Product snapshot",
    title: "Unit Trust — Allan Gray",
    render: () => <UtPanel />,
  },
  liberty: {
    kicker: "Product snapshot",
    title: "Liberty (to estate)",
    render: () => <LibertyPanel />,
  },
  myriad: {
    kicker: "Product snapshot",
    title: "Myriad (to spouse)",
    render: () => <MyriadPanel />,
  },
  oldmutual: {
    kicker: "Product snapshot",
    title: "Old Mutual (to child)",
    render: () => <OldMutualPanel />,
  },
  discovery: {
    kicker: "Product snapshot",
    title: "Discovery Classic Delta Saver",
    render: () => <DiscoveryPanel />,
  },
  santam: {
    kicker: "Product snapshot",
    title: "Santam Short Term Product",
    render: () => <SantamPanel />,
  },
  "goal-retire": {
    kicker: "Goal · Level 2",
    title: "Retirement — age 65",
    render: () => <GoalRetirePanel />,
  },
  "goal-edu": {
    kicker: "Goal · Level 2",
    title: "Education — Fudge (2031)",
    render: () => <GoalEduPanel />,
  },
  "goal-protect": {
    kicker: "Goal · Level 2",
    title: "Protection",
    render: () => <GoalProtectPanel />,
  },
  "goal-emergency": {
    kicker: "Goal · Level 2",
    title: "Emergency fund — gap",
    render: () => <GoalEmergencyPanel />,
  },
  "goal-unassigned": {
    kicker: "Goal · Level 2",
    title: "Assign a purpose",
    render: (onResolve) => <GoalUnassignedPanel onResolve={onResolve} />,
  },
  "fix-pension": {
    kicker: "Action · Level 2",
    title: "Update valuation — Company Pension Fund",
    render: (onResolve) => (
      <ValuationFixPanel
        lastValue="R 980 000"
        lastDate="08/04/2020 · 6 years ago"
        dateTone="bad"
        queueId={1}
        withExtras
        onResolve={onResolve}
      />
    ),
  },
  "fix-momentum": {
    kicker: "Action · Level 2",
    title: "Update valuation — Momentum International",
    render: (onResolve) => (
      <ValuationFixPanel
        lastValue="R 1 091 961"
        lastDate="08/04/2020 · 6 years ago"
        dateTone="bad"
        queueId={2}
        onResolve={onResolve}
      />
    ),
  },
  "fix-ut": {
    kicker: "Action · Level 2",
    title: "Update valuation — Unit Trust",
    render: (onResolve) => (
      <ValuationFixPanel
        lastValue="R 500 000"
        lastDate="16/01/2023 · 3 years ago"
        dateTone="warn"
        queueId={4}
        onResolve={onResolve}
      />
    ),
  },
  "fix-benefits": {
    kicker: "Action · Level 2",
    title: "Load life assured — Liberty (to estate)",
    render: (onResolve) => <FixBenefitsPanel onResolve={onResolve} />,
  },
  "fix-purpose": {
    kicker: "Action · Level 2",
    title: "Assign product purposes",
    render: (onResolve) => <FixPurposePanel onResolve={onResolve} />,
  },
  "fix-fees": {
    kicker: "Action · Level 2",
    title: "Configure fees — ABSA Share portfolio",
    render: (onResolve) => <FixFeesPanel onResolve={onResolve} />,
  },
};

export function PanelHost({
  openPanelId,
  onClose,
  onResolve,
}: {
  openPanelId: PanelId | null;
  onClose: () => void;
  onResolve: Resolve;
}) {
  const lastEntry = useRef<PanelEntry | null>(null);
  if (openPanelId) lastEntry.current = REGISTRY[openPanelId];
  const entry = lastEntry.current;

  return (
    <PanelShell
      open={openPanelId !== null}
      kicker={entry?.kicker ?? ""}
      title={entry?.title ?? ""}
      onClose={onClose}
    >
      {entry?.render(onResolve)}
    </PanelShell>
  );
}
