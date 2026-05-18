import type { NeedConfig } from "@/needs/_framework";
import type { BuildVariant } from "./build-variant";

/**
 * Retirement need's self-contained step / sub-step configuration.
 * The Build step's sub-sections depend on the chosen prototype variant
 * (Long / Lifecycle / Sources & Uses) — see ./build-variant.ts.
 */
function buildStepSections(variant: BuildVariant) {
  switch (variant) {
    case "long":
      return [];
    case "lifecycle":
      return [
        { id: "build-up", label: "Build-up", path: "/needs/retirement/build/build-up" },
        { id: "events", label: "Retirement events", path: "/needs/retirement/build/events" },
        { id: "lifestyle", label: "Lifestyle", path: "/needs/retirement/build/lifestyle" },
      ];
    case "by-use":
      return [
        { id: "sources", label: "Sources", path: "/needs/retirement/build/sources" },
        { id: "uses", label: "Uses", path: "/needs/retirement/build/uses" },
      ];
  }
}

export function buildRetirementConfig(variant: BuildVariant): NeedConfig {
  return {
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
        path: variant === "long" ? "/needs/retirement/build" : (buildStepSections(variant)[0]?.path ?? "/needs/retirement/build"),
        sections: buildStepSections(variant),
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
}

// Kept for back-compat with any importers that haven't migrated yet — defaults
// to the "long" variant config.
export const retirementConfig: NeedConfig = buildRetirementConfig("long");
