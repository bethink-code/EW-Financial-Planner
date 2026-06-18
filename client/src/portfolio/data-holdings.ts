import type { PanelId, Tone } from "./data";

/**
 * Product/holdings fixtures — Concept A's KPI band and category tables, and
 * Concept C's holdings table and since-last-review card.
 */

export interface Kpi {
  label: string;
  value: string;
  foot: string;
  accent?: boolean;
}

export const KPIS: Kpi[] = [
  {
    label: "Total investments",
    value: "R 3 031 961",
    foot: "4 products · 8 funds",
  },
  {
    label: "Monthly premiums",
    value: "R 17 300",
    foot: "Risk R 7 200 · Medical R 6 700 · Short term R 3 400",
  },
  {
    label: "Monthly contributions",
    value: "R 7 500",
    foot: "Company Pension Fund",
  },
  {
    label: "Next review",
    value: "07 Oct 2026",
    foot: "Last reviewed 07/10/2025",
    accent: true,
  },
];

export const HOUSEHOLD_CHIPS = [
  { label: "Ben Meander", on: true },
  { label: "Shadow (spouse)", on: true },
  { label: "Fudge (child)", on: false },
  { label: "Family Trust", on: false },
];

export interface InvestmentRow {
  name: string;
  category: string;
  supplier: string;
  premium: string;
  value: string;
  date: string;
  freshness: Tone;
  panelId: PanelId;
}

export const INVESTMENT_ROWS: InvestmentRow[] = [
  {
    name: "ABSA Share portfolio",
    category: "Direct Shares",
    supplier: "ABSA Stockbrokers",
    premium: "—",
    value: "R 460 000",
    date: "06/10/2025",
    freshness: "good",
    panelId: "absa",
  },
  {
    name: "Company Pension Fund",
    category: "Pension Fund",
    supplier: "Supplier unknown",
    premium: "R 7 500 p.m.",
    value: "R 980 000",
    date: "08/04/2020",
    freshness: "bad",
    panelId: "pension",
  },
  {
    name: "Momentum International Investment Option",
    category: "Offshore Investment",
    supplier: "Momentum Wealth Intl",
    premium: "—",
    value: "R 1 091 961",
    date: "08/04/2020",
    freshness: "bad",
    panelId: "momentum",
  },
  {
    name: "Unit Trust",
    category: "Unit Trust Portfolio",
    supplier: "Allan Gray",
    premium: "—",
    value: "R 500 000",
    date: "16/01/2023",
    freshness: "warn",
    panelId: "ut",
  },
];

export interface CoverRow {
  name: string;
  meta1: string;
  meta2: string;
  premium: string;
  pill: { label: string; tone: Tone };
  panelId: PanelId;
}

export const RISK_ROWS: CoverRow[] = [
  {
    name: "Liberty (to estate)",
    meta1: "Liberty Group Limited",
    meta2: "L123456789",
    premium: "R 3 100 p.m.",
    pill: { label: "Benefits not captured", tone: "warn" },
    panelId: "liberty",
  },
  {
    name: "Myriad (to spouse)",
    meta1: "Momentum Myriad",
    meta2: "M123456789",
    premium: "R 2 100 p.m.",
    pill: { label: "In force", tone: "good" },
    panelId: "myriad",
  },
  {
    name: "Old Mutual (to child)",
    meta1: "Old Mutual Life",
    meta2: "OM123456789",
    premium: "R 2 000 p.m.",
    pill: { label: "In force", tone: "good" },
    panelId: "oldmutual",
  },
];

export const MEDICAL_ROWS: CoverRow[] = [
  {
    name: "Discovery Classic Delta Saver",
    meta1: "Medical Aid",
    meta2: "Discovery Health",
    premium: "R 6 700 p.m.",
    pill: { label: "In force", tone: "good" },
    panelId: "discovery",
  },
];

export const SHORT_TERM_ROWS: CoverRow[] = [
  {
    name: "Santam Short Term Product",
    meta1: "Short Term Insurance",
    meta2: "Santam",
    premium: "R 3 400 p.m.",
    pill: { label: "In force", tone: "good" },
    panelId: "santam",
  },
];

export interface HoldingRow {
  name: string;
  purpose: string | null;
  value: string;
  date?: string;
  freshness?: Tone;
  panelId: PanelId;
}

export const HOLDING_ROWS: HoldingRow[] = [
  {
    name: "ABSA Share portfolio",
    purpose: null,
    value: "R 460 000",
    date: "06/10/2025",
    freshness: "good",
    panelId: "absa",
  },
  {
    name: "Company Pension Fund",
    purpose: "Retirement",
    value: "R 980 000",
    date: "08/04/2020",
    freshness: "bad",
    panelId: "pension",
  },
  {
    name: "Momentum International",
    purpose: "Retirement",
    value: "R 1 091 961",
    date: "08/04/2020",
    freshness: "bad",
    panelId: "momentum",
  },
  {
    name: "Unit Trust (Allan Gray)",
    purpose: "Education",
    value: "R 500 000",
    date: "16/01/2023",
    freshness: "warn",
    panelId: "ut",
  },
  {
    name: "Liberty (to estate)",
    purpose: "Life cover",
    value: "R 3 100 p.m.",
    panelId: "liberty",
  },
  {
    name: "Myriad (to spouse)",
    purpose: "Life cover",
    value: "R 2 100 p.m.",
    panelId: "myriad",
  },
  {
    name: "Old Mutual (to child)",
    purpose: "Life cover",
    value: "R 2 000 p.m.",
    panelId: "oldmutual",
  },
  {
    name: "Discovery Classic Delta Saver",
    purpose: "Medical aid",
    value: "R 6 700 p.m.",
    panelId: "discovery",
  },
  {
    name: "Santam Short Term",
    purpose: "Short-term insurance",
    value: "R 3 400 p.m.",
    panelId: "santam",
  },
];

export const REVIEW_ROWS = [
  {
    label: "ABSA Share portfolio revalued",
    right: "+R 460 000 · 06/10/2025",
    strong: true,
  },
  {
    label: "Asset split loaded — du Preez Rassie 100%",
    right: "07/10/2025",
  },
  {
    label: "No transactions captured in period",
    right: "10/03 – 10/06/2026",
  },
];
