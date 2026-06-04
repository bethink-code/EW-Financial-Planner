/** SA CPI+ risk-profile bands. Selecting a profile sets the premium to its
 *  band midpoint; CPI itself is set in Setup → Retirement parameters. */
const RISK_PROFILES = [
  { label: "Conservative", min: 1.5, mid: 1.75 },
  { label: "Moderate", min: 2, mid: 3 },
  { label: "Growth", min: 4, mid: 4.5 },
  { label: "Aggressive", min: 5, mid: 6 },
];

function profileFor(premium: number) {
  return (
    [...RISK_PROFILES].reverse().find((p) => premium >= p.min) ??
    RISK_PROFILES[0]
  );
}

/**
 * Yield = CPI (from Setup) + a risk-profile premium. Just the four profile
 * chips and a one-line result — the precise premium / CPI editing lives in
 * Setup, so this stays simple.
 */
export function YieldControl({
  cpiPct,
  premium,
  onPremiumChange,
}: {
  cpiPct: number;
  premium: number;
  onPremiumChange: (n: number) => void;
}) {
  const active = profileFor(premium);
  const nominal = cpiPct + premium;
  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: "#F4F8FB" }}>
      <label
        className="block text-xs font-medium mb-2"
        style={{ color: "var(--ew-blue)" }}
      >
        Yield
      </label>
      <div className="flex flex-wrap gap-1.5">
        {RISK_PROFILES.map((p) => {
          const on = p.label === active.label;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onPremiumChange(p.mid)}
              className="text-xs px-2 py-1 rounded transition-colors"
              style={{
                backgroundColor: on ? "var(--ew-blue)" : "transparent",
                color: on ? "#fff" : "var(--ew-blue)",
                border: `1px solid ${
                  on ? "var(--ew-blue)" : "var(--ew-blue-tertiary-100)"
                }`,
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <div className="text-xs mt-2" style={{ color: "var(--ew-gray-700)" }}>
        {active.label} · CPI + {premium.toFixed(2)}% = {nominal.toFixed(2)}%
      </div>
    </div>
  );
}
