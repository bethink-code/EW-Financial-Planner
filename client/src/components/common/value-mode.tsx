import { createContext, useContext, useState, type ReactNode } from "react";

/** Which figure surplus/capital views render: the value at retirement, or its
 *  equivalent in today's terms. Shared so the projection band's toggle and the
 *  per-tab section summaries stay in step. */
export type ValueMode = "atRetirement" | "today";

const ValueModeContext = createContext<{
  mode: ValueMode;
  setMode: (m: ValueMode) => void;
}>({ mode: "atRetirement", setMode: () => {} });

export function ValueModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ValueMode>("atRetirement");
  return (
    <ValueModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ValueModeContext.Provider>
  );
}

/** Read the shared value mode. Outside a provider it defaults to
 *  "atRetirement" with a no-op setter, so non-Retirement callers are safe. */
export function useValueMode() {
  return useContext(ValueModeContext);
}
