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
  },
  {
    title: "Education — Fudge",
    sub: "2031 · 5 years to go · 1 product",
    pill: { label: "On track", tone: "good" },
    value: "R 500 000",
    barPct: 67,
    barTone: "good",
    foot: "67% of R 750k target · no regular contribution",
    panelId: "goal-edu",
  },
  {
    title: "Protection",
    sub: "Life, medical & short term · 5 products",
    pill: { label: "Cover not analysed", tone: "warn" },
    value: "R 17 300",
    valueSuffix: "p.m.",
    barPct: 50,
    barTone: "warn",
    foot: "Benefit amounts missing on 1 of 3 life policies",
    panelId: "goal-protect",
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
    name: "Protection",
    dotTone: "warn",
    value: "R 17 300",
    suffix: "p.m.",
    barPct: 50,
    barTone: "warn",
    panelId: "goal-protect",
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
