import type { ClientIdentity } from "@/components/navigation/client-header";

export const BEN_MEANDER: ClientIdentity = {
  name: "Ben Meander",
  refLine: "DEMO/1/1588 / Potential client / My Company",
  detailLine: "51 years old / Married ANC with accrual",
};

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
