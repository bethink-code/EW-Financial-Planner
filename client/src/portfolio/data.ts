import type { ClientIdentity } from "@/components/navigation/client-header";

/**
 * Shared types and presenter copy for the portfolio concept deck — Ben
 * Meander demo data per Scratch/elite-wealth-portfolio-concepts/BRIEF.md §5.
 * Row/card fixtures live in data-holdings.ts, data-plan.ts and
 * data-attention.ts. Presentation only — nothing here touches the API or
 * database.
 */

export const BEN_MEANDER: ClientIdentity = {
  name: "Ben Meander",
  refLine: "DEMO/1/1588 / Potential client / My Company",
  detailLine: "51 years old / Married ANC with accrual",
};

export type ConceptId = "a" | "b" | "c";
export type Tone = "good" | "warn" | "bad" | "neutral";

export type PanelId =
  | "absa"
  | "pension"
  | "momentum"
  | "ut"
  | "liberty"
  | "myriad"
  | "oldmutual"
  | "discovery"
  | "santam"
  | "goal-retire"
  | "goal-edu"
  | "goal-protect"
  | "goal-emergency"
  | "goal-unassigned"
  | "fix-pension"
  | "fix-momentum"
  | "fix-ut"
  | "fix-benefits"
  | "fix-purpose"
  | "fix-fees";

export interface ConceptMeta {
  id: ConceptId;
  name: string;
  subtitle: string;
  noteLead: string;
  note: string;
}

export const CONCEPTS: ConceptMeta[] = [
  {
    id: "a",
    name: "A · At a glance",
    subtitle: "Holdings-first, elevated",
    noteLead: "Concept A — At a glance.",
    note: "The familiar category structure, elevated into a scannable snapshot: totals, premiums, household context up front. The attention layer runs in parallel as a collapsible strip and inline freshness flags. Lowest change cost; every existing mental model survives. Click any product row to open the Level 2 panel.",
  },
  {
    id: "b",
    name: "B · Plan view",
    subtitle: "Goals & purpose-first",
    noteLead: "Concept B — Plan view.",
    note: "The portfolio organised around what the money is for, using the Product purpose data the platform already captures. The attention layer is woven into the goals themselves — a stale valuation isn't a separate to-do, it's a reliability warning on the Retirement goal. Click a goal to open the Level 2 panel.",
  },
  {
    id: "c",
    name: "C · Command centre",
    subtitle: "Plan + holdings + attention rail",
    noteLead: "Concept C — Command centre.",
    note: "Doesn't choose between lenses: plan strip on top, holdings below, and the attention queue as a persistent rail running alongside both. The most complete answer — and the densest. Click queue items to action them; resolving updates readiness live.",
  },
];

export const FOOTNOTE =
  "Concept mockups · demo data (Ben Meander) · Level 3 — the full product detail tab set (Details, Roles, Benefits, Values, Transactions, Structure, Status, Ongoing fees, Fees on premiums, Commspace, Asset split) — is unchanged in all three concepts and reachable from every Level 2 panel.";

export const READINESS_BASE = 45;
export const READINESS_PER_ITEM = 9;

export const PURPOSE_OPTIONS = [
  "[ -- Please select an entry -- ]",
  "Emergency",
  "Retirement",
  "Saving for a goal: Education",
  "Saving for a goal: Holiday",
  "Saving for a goal: Other",
  "Saving for a goal: Property",
  "Saving for a goal: Vehicle",
];

export const LEVEL3_TABS = [
  "Details",
  "Roles",
  "Benefits",
  "Values",
  "Transactions",
  "Structure",
  "Status",
  "Ongoing fees",
  "Fees on premiums",
  "Commspace",
  "Asset split",
];
