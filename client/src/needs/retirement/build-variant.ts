import { useEffect, useState } from "react";

export type BuildVariant = "long" | "lifecycle" | "by-use";

export const BUILD_VARIANTS: { id: BuildVariant; label: string; entry: string }[] = [
  { id: "long", label: "Long", entry: "/needs/retirement/build" },
  { id: "lifecycle", label: "Lifecycle", entry: "/needs/retirement/build/build-up" },
  { id: "by-use", label: "Sources / Uses", entry: "/needs/retirement/build/sources" },
];

const STORAGE_KEY = "ew.retirement.buildVariant";

/**
 * The Retirement Build step has three prototype variants (Long / Lifecycle /
 * Sources-uses). The user's choice persists across reloads in localStorage so
 * the same variant comes back in the client demo session.
 */
export function useBuildVariant(): [BuildVariant, (v: BuildVariant) => void] {
  const [variant, setVariant] = useState<BuildVariant>(() => {
    if (typeof window === "undefined") return "long";
    const stored = window.localStorage.getItem(STORAGE_KEY) as BuildVariant | null;
    return stored ?? "long";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setVariant(e.newValue as BuildVariant);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = (v: BuildVariant) => {
    setVariant(v);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, v);
    }
  };

  return [variant, update];
}
