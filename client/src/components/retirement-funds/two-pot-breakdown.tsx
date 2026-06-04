import type {
  TwoPotBreakdown as TwoPotBreakdownData,
  ComponentSlice,
} from "@shared/retirement-calculations";

interface TwoPotBreakdownProps {
  twoPot: TwoPotBreakdownData;
  atRetirement: boolean;
  formatRand: (n: number | undefined) => string;
}

const COMPONENT_ROWS = [
  { key: "vested", label: "Vested", rule: "⅓ commutable" },
  { key: "retirement", label: "Retirement", rule: "must annuitise" },
  { key: "savings", label: "Savings", rule: "100% commutable" },
] as const;

/**
 * Per-component Two-Pot breakdown shown below the fund's capture fields.
 * Splits the projected capital into the cash lump sum vs the residual that
 * buys an annuity, per component — the consequence of the component balances
 * the advisor just captured. Basis follows the shared At-retirement / Today
 * toggle.
 */
export function TwoPotBreakdown({
  twoPot,
  atRetirement,
  formatRand,
}: TwoPotBreakdownProps) {
  // Scale the nominal lump sum / annuity split into the chosen basis.
  const basisValue = (s: ComponentSlice) =>
    atRetirement ? s.valueAtRetirement : s.valueInCurrentTerms;
  const scale = (s: ComponentSlice) =>
    s.valueAtRetirement > 0 ? basisValue(s) / s.valueAtRetirement : 0;

  const rows = twoPot.optedOut
    ? [
        {
          label: "Opted out",
          rule: "vested rules · ⅓ commutable",
          slice: twoPot.vested,
        },
      ]
    : COMPONENT_ROWS.map((r) => ({
        label: r.label,
        rule: r.rule,
        slice: twoPot[r.key],
      }));

  const total = rows.reduce(
    (acc, r) => ({
      value: acc.value + basisValue(r.slice),
      lump: acc.lump + r.slice.lumpSum * scale(r.slice),
      annuity: acc.annuity + r.slice.toAnnuity * scale(r.slice),
    }),
    { value: 0, lump: 0, annuity: 0 }
  );

  const navy = "var(--ew-primary-navy)";
  const valueHeader = atRetirement
    ? "Value at retirement"
    : "Value in current terms";

  return (
    <div className="mt-6">
      <div
        className="text-xs font-medium mb-2"
        style={{ color: navy, opacity: 0.7 }}
      >
        Breakdown by component
      </div>
      <table className="w-full text-sm" style={{ color: navy }}>
        <thead>
          <tr className="text-xs" style={{ opacity: 0.6 }}>
            <th className="text-left font-medium pb-1.5">Component</th>
            <th className="text-right font-medium pb-1.5">{valueHeader}</th>
            <th className="text-right font-medium pb-1.5">Lump sum</th>
            <th className="text-right font-medium pb-1.5">To annuity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td className="py-1.5">
                <span className="font-medium">{r.label}</span>
                <span className="text-xs ml-2" style={{ opacity: 0.55 }}>
                  {r.rule}
                </span>
              </td>
              <td className="text-right py-1.5 tabular-nums">
                {formatRand(basisValue(r.slice))}
              </td>
              <td className="text-right py-1.5 tabular-nums">
                {formatRand(r.slice.lumpSum * scale(r.slice))}
              </td>
              <td className="text-right py-1.5 tabular-nums">
                {formatRand(r.slice.toAnnuity * scale(r.slice))}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-semibold" style={{ backgroundColor: "#E5ECF3" }}>
            <td className="py-2 pl-2 rounded-l-md">Total</td>
            <td className="text-right py-2 tabular-nums">
              {formatRand(total.value)}
            </td>
            <td className="text-right py-2 tabular-nums">
              {formatRand(total.lump)}
            </td>
            <td className="text-right py-2 pr-2 rounded-r-md tabular-nums">
              {formatRand(total.annuity)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
