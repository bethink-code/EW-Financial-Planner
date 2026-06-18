import type { PanelId, Tone } from "./data";

/**
 * Plan/goal fixtures — Concept B's goal cards and Concept C's mini plan
 * strip. Goal assignments are illustrative (invented for the concepts).
 */

export interface GoalCard {
  title: string;
  sub: string;
  pill: { label: string; tone: Tone };
  value: string;
  valueSuffix?: string;
  valueMuted?: boolean;
  barPct?: number;
  barTone?: Tone;
  foot: string;
  footTone?: "bad";
  flag?: string;
  variant?: "gap" | "unassigned";
  panelId: PanelId;
  /** Numeric current/target — present on goals the unassigned value can join,
   *  so Concept B can recompute the card when a purpose is assigned. */
  currentNum?: number;
  targetNum?: number;
}

export const GOALS: GoalCard[] = [
  {
    title: "Retirement",
    sub: "Age 65 · 14 years to go · 2 products",
    pill: { label: "Behind target", tone: "warn" },
    value: "R 2 071 961",
    barPct: 24,
    barTone: "warn",
    foot: "24% of R 8.5m target · contributing R 7 500 p.m.",
    flag: "Position unreliable — both valuations are 6 years old",
    panelId: "goal-retire",
    currentNum: 2_071_961,
    targetNum: 8_500_000,
  },
  {
    title: "Education — Fudge",
    sub: "2031 · 5 years to go · 1 product",
    pill: { label: "On track", tone: "good" },
    value: "R 500 000",
    barPct: 67,
    barTone: "good",
    foot: "67% of R 750k target · no regular contribution",
    flag: "Position unreliable — Unit Trust valuation is 3 years old",
    panelId: "goal-edu",
    currentNum: 500_000,
    targetNum: 750_000,
  },
  {
    title: "Life cover",
    sub: "Life assurance to estate, spouse & child · 3 products",
    pill: { label: "Cover not analysed", tone: "warn" },
    value: "R 7 200",
    valueSuffix: "p.m.",
    barPct: 50,
    barTone: "warn",
    foot: "Cover: death R 7 000 000 · income protection R 45 000 p.m.",
    flag: "Liberty benefit amounts not captured — total cover understated",
    panelId: "goal-protect",
  },
  {
    title: "Medical aid",
    sub: "Healthcare cover · 1 product",
    pill: { label: "In force", tone: "good" },
    value: "R 6 700",
    valueSuffix: "p.m.",
    foot: "Discovery Classic Delta Saver — in force",
    panelId: "goal-medical",
  },
  {
    title: "Short-term insurance",
    sub: "Asset & liability cover · 1 product",
    pill: { label: "In force", tone: "good" },
    value: "R 3 400",
    valueSuffix: "p.m.",
    foot: "Santam Short Term Product — in force",
    panelId: "goal-shortterm",
  },
  {
    title: "Emergency fund",
    sub: "No products assigned",
    pill: { label: "Gap", tone: "bad" },
    value: "R 0",
    valueMuted: true,
    barPct: 3,
    barTone: "bad",
    foot: "≈ R 160k recommended (3 months' expenses)",
    footTone: "bad",
    variant: "gap",
    panelId: "goal-emergency",
    currentNum: 0,
    targetNum: 160_000,
  },
  {
    title: "Not yet assigned",
    sub: "1 product · no purpose captured",
    pill: { label: "Assign", tone: "neutral" },
    value: "R 460 000",
    foot: "ABSA Share portfolio — assign a purpose to include it in the plan",
    variant: "unassigned",
    panelId: "goal-unassigned",
  },
];

export interface MiniGoal {
  name: string;
  dotTone: Tone;
  dotTitle?: string;
  value: string;
  suffix?: string;
  valueMuted?: boolean;
  barPct: number;
  barTone: Tone;
  gap?: boolean;
  panelId: PanelId;
}

export const MINI_GOALS: MiniGoal[] = [
  {
    name: "Retirement",
    dotTone: "warn",
    dotTitle: "Behind target, stale data",
    value: "R 2.07m",
    barPct: 24,
    barTone: "warn",
    panelId: "goal-retire",
  },
  {
    name: "Education",
    dotTone: "good",
    value: "R 500k",
    barPct: 67,
    barTone: "good",
    panelId: "goal-edu",
  },
  {
    name: "Life cover",
    dotTone: "warn",
    dotTitle: "Cover not analysed",
    value: "R 7 200",
    suffix: "p.m.",
    barPct: 50,
    barTone: "warn",
    panelId: "goal-protect",
  },
  {
    name: "Medical aid",
    dotTone: "good",
    value: "R 6 700",
    suffix: "p.m.",
    barPct: 100,
    barTone: "good",
    panelId: "goal-medical",
  },
  {
    name: "Short-term",
    dotTone: "good",
    value: "R 3 400",
    suffix: "p.m.",
    barPct: 100,
    barTone: "good",
    panelId: "goal-shortterm",
  },
  {
    name: "Emergency",
    dotTone: "bad",
    value: "R 0",
    valueMuted: true,
    barPct: 3,
    barTone: "bad",
    gap: true,
    panelId: "goal-emergency",
  },
];
