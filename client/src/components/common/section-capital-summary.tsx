import { formatCurrencyValue } from "@/lib/formatting";
import { SummaryBand, SummaryTile } from "@/components/common/summary-band";
import { useValueMode } from "@/components/common/value-mode";

const formatRand = (n: number) => formatCurrencyValue(Math.round(n).toString());

/**
 * Per-tab capital summary for the Retirement need. A single accent tile: a
 * section-specific total ("Total future inflows" / "Total lump sum needs" /
 * "Total regular income required" …), the figure, and an "across N …" sub-line
 * naming the count. Each section names its own group explicitly (client
 * request) rather than a generic "Total capital". The at-retirement vs today
 * basis is NOT in the label — the shared Values toggle owns it, so the figure
 * follows the toggle without the label restating it.
 */
export function SectionCapitalSummary({
  capitalAtRetirement,
  valueInCurrentTerms,
  count,
  noun,
  label = "capital",
}: {
  capitalAtRetirement: number;
  valueInCurrentTerms: number;
  count: number;
  /** Singular noun for the count subline, e.g. "investment", "need". */
  noun: string;
  /** What this section totals, lower-case, prefixed with "Total " — the
   *  explicit group name, e.g. "future inflows", "lump sum needs", "regular
   *  income required". No retirement/today qualifier — the Values toggle
   *  carries that. */
  label?: string;
}) {
  const { mode } = useValueMode();
  const atRetirement = mode === "atRetirement";
  const across = count === 1 ? `1 ${noun}` : `across ${count} ${noun}s`;
  return (
    <SummaryBand>
      {/* Single tile, so cap its width — without this it stretches the full
          content column and the label/value drift far apart. */}
      <div className="max-w-md">
        <SummaryTile
          variant="accent"
          label={`Total ${label}`}
          value={formatRand(
            atRetirement ? capitalAtRetirement : valueInCurrentTerms
          )}
          subValue={across}
        />
      </div>
    </SummaryBand>
  );
}
