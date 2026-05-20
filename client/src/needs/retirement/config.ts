import type { NeedConfig } from "@/needs/_framework";

/**
 * Retirement need's self-contained step / sub-step configuration.
 * The Build step renders a single page with all categories accessible as
 * in-page tabs — the framework's overflow-to-dropdown handling means the
 * earlier Lifecycle / Sources-uses variants are no longer needed.
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
      sections: [],
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
