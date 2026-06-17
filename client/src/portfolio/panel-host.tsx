import { useRef } from "react";
import type { PanelId } from "./data";
import { PanelShell } from "./panel-shell";
import {
  DiscoveryPanel,
  LibertyPanel,
  MyriadPanel,
  OldMutualPanel,
  PensionPanel,
  SantamPanel,
  UtPanel,
} from "./panels-products";
import { AbsaPanel, MomentumPanel } from "./panels-investments";
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
type Assign = (purpose: string) => void;

interface PanelEntry {
  subtitle: string;
  title: string;
  render: (onResolve: Resolve, onAssign: Assign) => React.ReactNode;
}

const REGISTRY: Record<PanelId, PanelEntry> = {
  absa: {
    subtitle: "Direct shares · ABSA Stockbrokers",
    title: "ABSA Share portfolio",
    render: () => <AbsaPanel />,
  },
  pension: {
    subtitle: "Product snapshot",
    title: "Company Pension Fund",
    render: () => <PensionPanel />,
  },
  momentum: {
    subtitle: "Offshore investment · Momentum Wealth Intl",
    title: "Momentum International Investment Option",
    render: () => <MomentumPanel />,
  },
  ut: {
    subtitle: "Product snapshot",
    title: "Unit Trust — Allan Gray",
    render: () => <UtPanel />,
  },
  liberty: {
    subtitle: "Product snapshot",
    title: "Liberty (to estate)",
    render: () => <LibertyPanel />,
  },
  myriad: {
    subtitle: "Product snapshot",
    title: "Myriad (to spouse)",
    render: () => <MyriadPanel />,
  },
  oldmutual: {
    subtitle: "Product snapshot",
    title: "Old Mutual (to child)",
    render: () => <OldMutualPanel />,
  },
  discovery: {
    subtitle: "Product snapshot",
    title: "Discovery Classic Delta Saver",
    render: () => <DiscoveryPanel />,
  },
  santam: {
    subtitle: "Product snapshot",
    title: "Santam Short Term Product",
    render: () => <SantamPanel />,
  },
  "goal-retire": {
    subtitle: "Goal · Level 2",
    title: "Retirement — age 65",
    render: () => <GoalRetirePanel />,
  },
  "goal-edu": {
    subtitle: "Goal · Level 2",
    title: "Education — Fudge (2031)",
    render: () => <GoalEduPanel />,
  },
  "goal-protect": {
    subtitle: "Goal · Level 2",
    title: "Protection",
    render: () => <GoalProtectPanel />,
  },
  "goal-emergency": {
    subtitle: "Goal · Level 2",
    title: "Emergency fund — gap",
    render: () => <GoalEmergencyPanel />,
  },
  "goal-unassigned": {
    subtitle: "Goal · Level 2",
    title: "Assign a purpose",
    render: (_onResolve, onAssign) => (
      <GoalUnassignedPanel onAssign={onAssign} />
    ),
  },
  "fix-pension": {
    subtitle: "Action · Level 2",
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
    subtitle: "Action · Level 2",
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
    subtitle: "Action · Level 2",
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
    subtitle: "Action · Level 2",
    title: "Load life assured — Liberty (to estate)",
    render: (onResolve) => <FixBenefitsPanel onResolve={onResolve} />,
  },
  "fix-purpose": {
    subtitle: "Action · Level 2",
    title: "Assign product purposes",
    render: (onResolve) => <FixPurposePanel onResolve={onResolve} />,
  },
  "fix-fees": {
    subtitle: "Action · Level 2",
    title: "Configure fees — ABSA Share portfolio",
    render: (onResolve) => <FixFeesPanel onResolve={onResolve} />,
  },
};

export function PanelHost({
  openPanelId,
  onClose,
  onResolve,
  onAssign,
}: {
  openPanelId: PanelId | null;
  onClose: () => void;
  onResolve: Resolve;
  onAssign: Assign;
}) {
  const lastEntry = useRef<PanelEntry | null>(null);
  if (openPanelId) lastEntry.current = REGISTRY[openPanelId];
  const entry = lastEntry.current;

  return (
    <PanelShell
      open={openPanelId !== null}
      subtitle={entry?.subtitle ?? ""}
      title={entry?.title ?? ""}
      onClose={onClose}
    >
      {entry?.render(onResolve, onAssign)}
    </PanelShell>
  );
}
