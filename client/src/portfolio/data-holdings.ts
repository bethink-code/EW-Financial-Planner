import type { PanelId, Tone } from "./data";
import type { ProductId } from "./data-links";

/**
 * Product/holdings fixtures — portfolio tabs: investments, risk, medical aid,
 * short-term. All demo data (Ben Meander). managed=true means the adviser is
 * on record; managed=false means recorded-only (external / manually entered).
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

/** Investment subcategory — used for the chip filters on the Investments tab. */
export type InvestmentSubcategory =
  | "unit-trust"
  | "pension"
  | "offshore"
  | "shares"
  | "tax-free";

export const SUBCATEGORY_LABELS: Record<InvestmentSubcategory, string> = {
  "unit-trust": "Unit trusts",
  pension: "Pension funds",
  offshore: "Offshore",
  shares: "Direct shares",
  "tax-free": "Tax-free savings",
};

export interface InvestmentRow {
  productId: ProductId;
  name: string;
  subcategory: InvestmentSubcategory;
  policyNo: string;
  supplier: string;
  started: string;
  owners: string;
  /** Monthly contribution, or "—" when none. */
  premium: string;
  value: string;
  valueNum: number;
  date: string;
  freshness: Tone;
  /** Cooked IRR for the demo. "—" when data is too stale to be meaningful. */
  irr: string;
  /** Prior-period IRR — used to derive the direction arrow on subcategory chips. */
  irrPrior: number | null;
  /** true = adviser manages this product; false = recorded-only / external. */
  managed: boolean;
  /** Only set when managed=false — shows how current the manual entry is. */
  lastUpdated?: string;
  /** Local/offshore split as percentages (must sum to 100). */
  localPct: number;
  offshorePct: number;
  panelId: PanelId;
}

export const INVESTMENT_ROWS: InvestmentRow[] = [
  {
    productId: "absa",
    name: "ABSA Share portfolio",
    subcategory: "shares",
    policyNo: "ABS-2018-7734",
    supplier: "ABSA Stockbrokers",
    started: "12/03/2018",
    owners: "B. Meander",
    premium: "—",
    value: "R 460 000",
    valueNum: 460_000,
    date: "06/10/2025",
    freshness: "good",
    irr: "9.5%",
    irrPrior: 9.5,
    managed: false,
    lastUpdated: "06/10/2025",
    localPct: 100,
    offshorePct: 0,
    panelId: "absa",
  },
  {
    productId: "pension",
    name: "Company Pension Fund",
    subcategory: "pension",
    policyNo: "CPF-2009-0042",
    supplier: "Supplier unknown",
    started: "01/03/2009",
    owners: "B. Meander",
    premium: "R 7 500 p.m.",
    value: "R 980 000",
    valueNum: 980_000,
    date: "08/04/2020",
    freshness: "bad",
    irr: "—",
    irrPrior: null,
    managed: false,
    lastUpdated: "08/04/2020",
    localPct: 100,
    offshorePct: 0,
    panelId: "pension",
  },
  {
    productId: "momentum",
    name: "Momentum International Investment Option",
    subcategory: "offshore",
    policyNo: "PP6010105733",
    supplier: "Momentum Wealth Intl",
    started: "15/06/2016",
    owners: "B. Meander, S. Meander",
    premium: "—",
    value: "R 1 091 961",
    valueNum: 1_091_961,
    date: "08/04/2020",
    freshness: "bad",
    irr: "—",
    irrPrior: null,
    managed: true,
    localPct: 24,
    offshorePct: 76,
    panelId: "momentum",
  },
  {
    productId: "ut",
    name: "Unit Trust — Allan Gray",
    subcategory: "unit-trust",
    policyNo: "AG-UT-2021-0099",
    supplier: "Allan Gray",
    started: "16/01/2021",
    owners: "B. Meander",
    premium: "—",
    value: "R 500 000",
    valueNum: 500_000,
    date: "16/01/2023",
    freshness: "warn",
    irr: "8.2%",
    irrPrior: 7.5,
    managed: true,
    localPct: 85,
    offshorePct: 15,
    panelId: "ut",
  },
];

export interface CoverRow {
  productId: ProductId;
  name: string;
  meta1: string;
  meta2: string;
  premium: string;
  pill: { label: string; tone: Tone };
  managed: boolean;
  lastUpdated?: string;
  panelId: PanelId;
}

export const RISK_ROWS: CoverRow[] = [
  {
    productId: "liberty",
    name: "Liberty (to estate)",
    meta1: "Liberty Group Limited",
    meta2: "L123456789",
    premium: "R 3 100 p.m.",
    pill: { label: "Benefits not captured", tone: "warn" },
    managed: true,
    panelId: "liberty",
  },
  {
    productId: "myriad",
    name: "Myriad (to spouse)",
    meta1: "Momentum Myriad",
    meta2: "M123456789",
    premium: "R 2 100 p.m.",
    pill: { label: "In force", tone: "good" },
    managed: true,
    panelId: "myriad",
  },
  {
    productId: "oldmutual",
    name: "Old Mutual (to child)",
    meta1: "Old Mutual Life",
    meta2: "OM123456789",
    premium: "R 2 000 p.m.",
    pill: { label: "In force", tone: "good" },
    managed: true,
    panelId: "oldmutual",
  },
];

export const MEDICAL_ROWS: CoverRow[] = [
  {
    productId: "discovery",
    name: "Discovery Classic Delta Saver",
    meta1: "Medical Aid",
    meta2: "Discovery Health",
    premium: "R 6 700 p.m.",
    pill: { label: "In force", tone: "good" },
    managed: true,
    panelId: "discovery",
  },
];

export const SHORT_TERM_ROWS: CoverRow[] = [
  {
    productId: "santam",
    name: "Santam Short Term Product",
    meta1: "Short Term Insurance",
    meta2: "Santam",
    premium: "R 3 400 p.m.",
    pill: { label: "In force", tone: "good" },
    managed: true,
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
