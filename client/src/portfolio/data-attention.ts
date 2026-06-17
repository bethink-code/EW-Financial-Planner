import type { PanelId } from "./data";

/**
 * Attention-layer fixtures — the same six underlying issues, phrased per
 * concept: data language (A), plan language (B), consequence language (C).
 */

export interface AttentionItem {
  queueId: number;
  severity: "high" | "med";
  title: string;
  sub: string;
  action: string;
  panelId: PanelId;
}

export interface StripCopy {
  lead: string;
  consequence: string;
  items: AttentionItem[];
}

export const STRIP_A: StripCopy = {
  lead: "6 items need attention",
  consequence:
    "2 valuations are 6 years old — the totals above can't be trusted until they're updated",
  items: [
    {
      queueId: 1,
      severity: "high",
      title: "Valuation 6 years old — Company Pension Fund",
      sub: "Last value R 980 000 on 08/04/2020",
      action: "Update",
      panelId: "fix-pension",
    },
    {
      queueId: 2,
      severity: "high",
      title: "Valuation 6 years old — Momentum International",
      sub: "Last value R 1 091 961 on 08/04/2020",
      action: "Update",
      panelId: "fix-momentum",
    },
    {
      queueId: 3,
      severity: "high",
      title: "No life assured loaded — Liberty (to estate)",
      sub: "Cover gap analysis blocked",
      action: "Fix",
      panelId: "fix-benefits",
    },
  ],
};

export const QUEUE: AttentionItem[] = [
  {
    queueId: 1,
    severity: "high",
    title: "Valuation 6 years old — Company Pension Fund",
    sub: "Affects Retirement goal & totals",
    action: "Update",
    panelId: "fix-pension",
  },
  {
    queueId: 2,
    severity: "high",
    title: "Valuation 6 years old — Momentum International",
    sub: "Affects Retirement goal & totals",
    action: "Update",
    panelId: "fix-momentum",
  },
  {
    queueId: 3,
    severity: "high",
    title: "No life assured — Liberty (to estate)",
    sub: "Cover gap analysis blocked",
    action: "Fix",
    panelId: "fix-benefits",
  },
  {
    queueId: 4,
    severity: "med",
    title: "Valuation 3 years old — Unit Trust",
    sub: "Affects Education goal",
    action: "Update",
    panelId: "fix-ut",
  },
  {
    queueId: 5,
    severity: "med",
    title: "Purpose not set — ABSA Share portfolio",
    sub: "R 460k outside the plan",
    action: "Assign",
    panelId: "fix-purpose",
  },
  {
    queueId: 6,
    severity: "med",
    title: "Ongoing fees not configured — ABSA",
    sub: "Fee reporting incomplete",
    action: "Configure",
    panelId: "fix-fees",
  },
];
