import type { PanelId } from "./data";

/**
 * Risk benefit schedules — what each policy actually pays out (death,
 * disability, income protection, dread disease), the cover lens the deck was
 * missing. Premiums live in data-holdings; this is the other half. Demo
 * numbers are invented (Ben Meander mockup).
 */

export type BenefitBasis = "Lump sum" | "Monthly" | "—";

export interface RiskBenefit {
  type: string;
  /** Display amount, or "—" when the benefit isn't carried / isn't captured. */
  amount: string;
  basis: BenefitBasis;
}

export interface RiskSchedule {
  /** false = benefits not loaded yet (the analysis-blocking gap). */
  captured: boolean;
  benefits: RiskBenefit[];
}

const BENEFIT_TYPES = [
  "Death",
  "Capital disability",
  "Income disability",
  "Sickness",
  "Dread disease",
];

/** All benefit types shown as "—" — used for a policy whose schedule isn't
 *  loaded, so the lens still shows the shape of what's missing. */
const NOT_CAPTURED: RiskBenefit[] = BENEFIT_TYPES.map((type) => ({
  type,
  amount: "—",
  basis: "—",
}));

export const RISK_BENEFITS: Partial<Record<PanelId, RiskSchedule>> = {
  myriad: {
    captured: true,
    benefits: [
      { type: "Death", amount: "R 5 000 000", basis: "Lump sum" },
      { type: "Capital disability", amount: "R 2 000 000", basis: "Lump sum" },
      { type: "Income disability", amount: "R 45 000", basis: "Monthly" },
      { type: "Sickness", amount: "R 25 000", basis: "Monthly" },
      { type: "Dread disease", amount: "—", basis: "—" },
    ],
  },
  oldmutual: {
    captured: true,
    benefits: [
      { type: "Death", amount: "R 2 000 000", basis: "Lump sum" },
      { type: "Capital disability", amount: "—", basis: "—" },
      { type: "Income disability", amount: "—", basis: "—" },
      { type: "Sickness", amount: "—", basis: "—" },
      { type: "Dread disease", amount: "—", basis: "—" },
    ],
  },
  liberty: { captured: false, benefits: NOT_CAPTURED },
};

/**
 * Total cover across the captured policies (Liberty excluded — its benefits
 * aren't loaded, which is why the Life cover intention reads "not analysed").
 * Death = Myriad 5m + Old Mutual 2m; the rest are Myriad's schedule.
 */
export const RISK_COVER_SUMMARY: { label: string; value: string }[] = [
  { label: "Death cover", value: "R 7 000 000" },
  { label: "Capital disability", value: "R 2 000 000" },
  { label: "Income protection", value: "R 45 000 p.m." },
  { label: "Sickness benefit", value: "R 25 000 p.m." },
];

/** Short tag labels for the benefit types — used for the at-a-glance chips
 *  on Concept A's risk cards (which benefits exist, not the amounts). */
const BENEFIT_TAGS: Record<string, string> = {
  Death: "Death",
  "Capital disability": "Disability",
  "Income disability": "Income",
  Sickness: "Sickness",
  "Dread disease": "Dread",
};

/** The benefits a policy actually carries, as short tags. Empty when the
 *  schedule isn't captured (Liberty) or the product isn't a risk policy. */
export function benefitTags(panelId: PanelId): string[] {
  const schedule = RISK_BENEFITS[panelId];
  if (!schedule || !schedule.captured) return [];
  return schedule.benefits
    .filter((benefit) => benefit.amount !== "—")
    .map((benefit) => BENEFIT_TAGS[benefit.type] ?? benefit.type);
}
