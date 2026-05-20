import type { NeedConfig } from "@/needs/_framework";

/**
 * Death with estate liquidity — the original "brief" need.
 * Self-contained config conforming to the generic NeedConfig.
 */
export const delConfig: NeedConfig = {
  id: "death-estate-liquidity",
  label: "Death with estate liquidity",
  basePath: "/needs/death-estate-liquidity",
  steps: [
    {
      id: "setup",
      number: 1,
      label: "Setup",
      path: "/needs/death-estate-liquidity/setup",
      sections: [
        {
          id: "client-details",
          label: "Client details",
          path: "/needs/death-estate-liquidity/setup/client-details",
        },
        {
          id: "residue",
          label: "Residue",
          path: "/needs/death-estate-liquidity/setup/residue",
        },
        {
          id: "additional-estate-duty",
          label: "Additional Estate Duty Items",
          path: "/needs/death-estate-liquidity/setup/additional-estate-duty-items",
        },
      ],
    },
    {
      id: "build",
      number: 2,
      label: "Build",
      path: "/needs/death-estate-liquidity/build",
      sections: [
        {
          id: "risk-assurance",
          label: "Risk & Assurance",
          path: "/needs/death-estate-liquidity/build/assurance",
        },
        {
          id: "retirement-funds-group",
          label: "Retirement Funds",
          path: "/needs/death-estate-liquidity/build/retirement-funds-group",
          children: [
            {
              id: "retirement-funds",
              label: "Retirement funds",
              path: "/needs/death-estate-liquidity/build/retirement-funds",
            },
            {
              id: "defined-benefit",
              label: "Defined benefit funds (GEPF)",
              path: "/needs/death-estate-liquidity/build/defined-benefit-funds",
            },
          ],
        },
        {
          id: "voluntary-investments",
          label: "Voluntary investments",
          path: "/needs/death-estate-liquidity/build/voluntary-investments",
        },
        {
          id: "assets-liabilities",
          label: "Assets & Liabilities",
          path: "/needs/death-estate-liquidity/build/assets-liabilities",
        },
        {
          id: "income-capital-needs-group",
          label: "Income and capital needs",
          path: "/needs/death-estate-liquidity/build/income-capital-needs-group",
          children: [
            {
              id: "income-needs",
              label: "Income needs",
              path: "/needs/death-estate-liquidity/build/income-needs",
            },
            {
              id: "lump-sum-needs",
              label: "Lump sum needs and cash bequests",
              path: "/needs/death-estate-liquidity/build/lump-sum-bequests",
            },
          ],
        },
        {
          id: "income-provisions",
          label: "Income provisions",
          path: "/needs/death-estate-liquidity/build/income-provisions",
        },
      ],
    },
    {
      id: "project",
      number: 3,
      label: "Project",
      path: "/needs/death-estate-liquidity/project",
      sections: [],
    },
    {
      id: "implement",
      number: 4,
      label: "Implement",
      path: "/needs/death-estate-liquidity/implement",
      sections: [],
    },
  ],
};
