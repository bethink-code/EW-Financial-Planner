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
    id: "death-estate-liquidity",
    label: "Death with estate liquidity",
    path: "/needs/death-estate-liquidity",
    hasContent: true,
    steps: [
      {
        id: "setup",
        number: 1,
        label: "Setup",
        path: "/needs/death-estate-liquidity/setup",
        hasContent: true,
        sections: [
          {
            id: "client-details",
            label: "Client details",
            path: "/client-details",
            hasContent: true
          },
          {
            id: "parameters",
            label: "Parameters",
            path: "/needs/death-estate-liquidity/setup/parameters",
            hasContent: true,
            children: [
              {
                id: "parameters-sub",
                label: "Parameters",
                path: "/needs/death-estate-liquidity/setup/parameters/parameters",
                hasContent: false
              },
              {
                id: "residue",
                label: "Residue",
                path: "/residue",
                hasContent: true
              },
              {
                id: "additional-estate-duty",
                label: "Additional estate duty items",
                path: "/additional-estate-duty-items",
                hasContent: true
              }
            ]
          }
        ]
      },
      {
        id: "build",
        number: 2,
        label: "Build",
        path: "/needs/death-estate-liquidity/build",
        hasContent: true,
        sections: [
          {
            id: "risk-assurance",
            label: "Risk & Assurance",
            path: "/assurance",
            hasContent: true
          },
          {
            id: "retirement-funds-group",
            label: "Retirement Funds",
            path: "/needs/death-estate-liquidity/build/retirement-funds",
            hasContent: true,
            children: [
              {
                id: "retirement-funds",
                label: "Retirement funds",
                path: "/new-retirement-funds",
                hasContent: true
              },
              {
                id: "defined-benefit",
                label: "Defined benefit funds (GEPF)",
                path: "/defined-benefit-funds",
                hasContent: true
              }
            ]
          },
          {
            id: "voluntary-investments",
            label: "Voluntary investments",
            path: "/voluntary-investments",
            hasContent: true
          },
          {
            id: "assets-liabilities-group",
            label: "Assets & Liabilities",
            path: "/needs/death-estate-liquidity/build/assets-liabilities",
            hasContent: true,
            children: [
              {
                id: "lifestyle-assets",
                label: "Lifestyle assets",
                path: "/assets",
                hasContent: true
              },
              {
                id: "liabilities",
                label: "Liabilities",
                path: "/liabilities",
                hasContent: true
              }
            ]
          },
          {
            id: "income-capital-needs-group",
            label: "Income and capital needs",
            path: "/needs/death-estate-liquidity/build/income-capital-needs",
            hasContent: true,
            children: [
              {
                id: "income-needs",
                label: "Income needs",
                path: "/income-needs",
                hasContent: true
              },
              {
                id: "lump-sum-needs",
                label: "Lump sum needs and cash bequests",
                path: "/lump-sum-bequests",
                hasContent: true
              }
            ]
          },
          {
            id: "income-provisions",
            label: "Income provisions",
            path: "/income-provisions",
            hasContent: true
          }
        ]
      },
      {
        id: "project",
        number: 3,
        label: "Project",
        path: "/needs/death-estate-liquidity/project",
        hasContent: true,
        sections: []
      },
      {
        id: "implement",
        number: 4,
        label: "Implement",
        path: "/needs/death-estate-liquidity/implement",
        hasContent: true,
        sections: [
          {
            id: "action-plan",
            label: "Action plan",
            path: "/needs/death-estate-liquidity/implement/action-plan",
            hasContent: false
          },
          {
            id: "recommendations",
            label: "Recommendations",
            path: "/needs/death-estate-liquidity/implement/recommendations",
            hasContent: false
          },
          {
            id: "tracking",
            label: "Implementation tracking",
            path: "/needs/death-estate-liquidity/implement/tracking",
            hasContent: false
          }
        ]
      }
    ]
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
    id: "retirement",
    label: "Retirement",
    path: "/needs/retirement",
    hasContent: false
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