import type { NeedConfig } from "@/needs/_framework";

/**
 * Retirement need's self-contained step / sub-step configuration.
 * Conforms to the generic NeedConfig the framework consumes.
 */
export const retirementConfig: NeedConfig = {
  id: "retirement",
  label: "Retirement",
  basePath: "/needs/retirement",
  steps: [
    {
      id: "setup",
      number: 1,
      label: "Setup",
      path: "/needs/retirement/setup",
      sections: [
        { id: "parameters", label: "Retirement parameters", path: "/needs/retirement/setup/parameters" },
        { id: "client-details", label: "Client details", path: "/needs/retirement/setup/client-details" },
      ],
    },
    {
      id: "build",
      number: 2,
      label: "Build",
      path: "/needs/retirement/build",
      sections: [
        { id: "retirement-funds", label: "Retirement funds", path: "/needs/retirement/build/retirement-funds" },
        { id: "defined-benefit-funds", label: "Defined benefit funds (GEPF)", path: "/needs/retirement/build/defined-benefit-funds" },
        { id: "voluntary-investments", label: "Voluntary investments", path: "/needs/retirement/build/voluntary-investments" },
        { id: "future-inflows", label: "Future inflows", path: "/needs/retirement/build/future-inflows" },
        { id: "lump-sum-needs", label: "Lump sum needs", path: "/needs/retirement/build/lump-sum-needs" },
        { id: "income-required", label: "Regular income required", path: "/needs/retirement/build/income-required" },
        { id: "income-provided", label: "Regular income provided", path: "/needs/retirement/build/income-provided" },
      ],
    },
    {
      id: "project",
      number: 3,
      label: "Project",
      path: "/needs/retirement/project",
      sections: [],
    },
    {
      id: "implement",
      number: 4,
      label: "Implement",
      path: "/needs/retirement/implement",
      sections: [],
    },
  ],
};
