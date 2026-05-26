import { formatCurrencyValue } from "@/lib/formatting";
import { SummaryBand, SummaryTile } from "@/components/common/summary-band";
import { useValueMode } from "@/components/common/value-mode";

const formatRand = (n: number) => formatCurrencyValue(Math.round(n).toString());

/**
 * Per-tab capital summary for the Retirement need. A single accent tile whose
 * figure follows the shared At retirement / Today toggle in the projection
 * band — so every section summary stays in step with the headline equation
 * instead of printing both values at once.
 */
export function SectionCapitalSummary({
  capitalAtRetirement,
  valueInCurrentTerms,
  count,
  noun,
}: {
  capitalAtRetirement: number;
  valueInCurrentTerms: number;
  count: number;
  /** Singular noun for the count subline, e.g. "investment", "inflow". */
  noun: string;
}) {
  const { mode } = useValueMode();
  const atRetirement = mode === "atRetirement";
  return (
    <SummaryBand>
      {/* Single tile, so cap its width — without this it stretches the full
          content column and the label/value drift far apart. */}
      <div className="max-w-md">
        <SummaryTile
          variant="accent"
          label={
            atRetirement ? "Capital at retirement" : "Value in current terms"
          }
          value={formatRand(
            atRetirement ? capitalAtRetirement : valueInCurrentTerms
          )}
          subValue={`${count} ${count === 1 ? noun : `${noun}s`}`}
        />
      </div>
    </SummaryBand>
  );
}
