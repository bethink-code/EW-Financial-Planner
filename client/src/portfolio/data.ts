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

export type ConceptId = "a" | "b";

/** The five portfolio category tabs. */
export type PortfolioTab =
  | "overview"
  | "investments"
  | "risk-lt"
  | "risk-st"
  | "medical";
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
  | "goal-medical"
  | "goal-shortterm"
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
    name: "A · Products → Goals",
    subtitle: "Start from what the client holds",
    noteLead: "View A — Products → Goals.",
    note: "Each product shows which goals it is mapped to. Drill into any product to see its details and linked goals. The default adviser view.",
  },
  {
    id: "b",
    name: "B · Goals → Products",
    subtitle: "Start from what the client is trying to achieve",
    noteLead: "View B — Goals → Products.",
    note: "Each goal shows which products are funding it. Unlinked products surface in an 'Unlinked' section — the adviser flag before pulling a report.",
  },
];

export const FOOTNOTE =
  "Portfolio views · demo data (Ben Meander) · Level 3 — the full product detail tab set (Details, Roles, Benefits, Values, Transactions, Structure, Status, Ongoing fees, Fees on premiums, Commspace, Asset split) — is unchanged in both views and reachable from every Level 2 panel.";

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
