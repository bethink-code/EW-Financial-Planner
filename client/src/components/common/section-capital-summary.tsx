import { formatCurrencyValue } from "@/lib/formatting";
import { SummaryBand, SummaryTile } from "@/components/common/summary-band";
import { useValueMode } from "@/components/common/value-mode";

const formatRand = (n: number) => formatCurrencyValue(Math.round(n).toString());

/**
 * Per-tab capital summary for the Retirement need. A single accent tile: the
 * metric ("Total capital" / "Total capital required" / "...provided"), the
 * figure, and an "across N …" sub-line naming the count. The at-retirement vs
 * today basis is NOT in the label — the shared Values toggle owns it, so the
 * figure follows the toggle without the label restating it.
 */
export function SectionCapitalSummary({
  capitalAtRetirement,
  valueInCurrentTerms,
  count,
  noun,
  metricLabel = "capital",
}: {
  capitalAtRetirement: number;
  valueInCurrentTerms: number;
  count: number;
  /** Singular noun for the count subline, e.g. "investment", "need". */
  noun: string;
  /** The metric this section totals (lower-case): "capital" for sources,
   *  "capital required" for needs, "capital provided". No retirement/today
   *  qualifier — the Values toggle carries that. */
  metricLabel?: string;
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
          label={`Total ${metricLabel}`}
          value={formatRand(
            atRetirement ? capitalAtRetirement : valueInCurrentTerms
          )}
          subValue={across}
        />
      </div>
    </SummaryBand>
  );
}
