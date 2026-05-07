export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  hasContent: boolean;
  children?: NavigationItem[];
}

export interface Need {
  id: string;
  label: string;
  path: string;
  hasContent: boolean;
  steps?: Step[];
}

export interface Step {
  id: string;
  number: number;
  label: string;
  path: string;
  hasContent: boolean;
  sections?: NavigationItem[];
}

// All needs in the system
export const needs: Need[] = [
  {
    id: "death",
    label: "Death",
    path: "/needs/death",
    hasContent: false
  },
  {
    // Death with estate liquidity is a self-contained need module — full step
    // structure lives in client/src/needs/death-estate-liquidity/config.ts.
    id: "death-estate-liquidity",
    label: "Death with estate liquidity",
    path: "/needs/death-estate-liquidity",
    hasContent: true
  },
  {
    id: "permanent-disability",
    label: "Permanent disability",
    path: "/needs/permanent-disability",
    hasContent: false
  },
  {
    id: "temporary-disability",
    label: "Temporary disability",
    path: "/needs/temporary-disability",
    hasContent: false
  },
  {
    id: "dread-disease",
    label: "Dread disease",
    path: "/needs/dread-disease",
    hasContent: false
  },
  {
    // Retirement is a self-contained need module — its full step / sub-step
    // structure lives in client/src/needs/retirement/config.ts. The shared
    // entry only carries enough metadata for the need-switcher dropdown.
    id: "retirement",
    label: "Retirement",
    path: "/needs/retirement",
    hasContent: true
  },
  {
    id: "lump-sum-recurring",
    label: "Lump sum and recurring investment",
    path: "/needs/lump-sum-recurring",
    hasContent: false
  },
  {
    id: "portfolio-comparison",
    label: "Portfolio comparison tool",
    path: "/needs/portfolio-comparison",
    hasContent: false
  },
  {
    id: "contribution-income-analysis",
    label: "Contribution and income analysis",
    path: "/needs/contribution-income-analysis",
    hasContent: false
  },
  {
    id: "saving-future-need",
    label: "Saving for a future need",
    path: "/needs/saving-future-need",
    hasContent: false
  },
  {
    id: "income-from-capital",
    label: "Income from capital",
    path: "/needs/income-from-capital",
    hasContent: false
  },
  {
    id: "debt-repayment",
    label: "Debt repayment",
    path: "/needs/debt-repayment",
    hasContent: false
  }
];

// Helper function to get current financial plan name
export function getFinancialPlanName(): string {
  // This could be fetched from an API or context in a real app
  return "Lambie Estate plan 2025";
}