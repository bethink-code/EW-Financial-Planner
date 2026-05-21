import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrencyValue } from "@/lib/formatting";
import {
  useRetirementProjection,
  useRefreshRetirementProjection,
} from "@/hooks/use-retirement-projection";

function rand(n: number): string {
  return formatCurrencyValue(Math.round(n).toString());
}

interface RetirementProjectionRibbonProps {
  /** Optional page-specific action(s) rendered alongside the Refresh button —
   *  used by simple-table pages (future-inflows, lump-sum-needs) to surface
   *  their Add button next to Refresh instead of as a separate row. */
  actions?: React.ReactNode;
}

/**
 * Live cross-need summary. Renders as a single light-grey card with
 * segmented compartments — one per metric. Sits inside the stepper card on
 * Retirement Build *and* Project routes (rendered by RetirementLayout via
 * NeedLayout's `headerExtra` slot).
 */
export function RetirementProjectionRibbon({
  actions,
}: RetirementProjectionRibbonProps = {}) {
  const { data: projection, isLoading } = useRetirementProjection();
  const refresh = useRefreshRetirementProjection();

  const surplus = projection?.surplus ?? 0;
  const coverage = projection?.coverage ?? 0;
  const additional = projection?.additionalMonthlyContribution ?? 0;
  const yearsToRetirement = projection?.yearsToRetirement ?? 0;

  const voluntaryCapitalSurplus = projection?.voluntaryCapitalSurplus;
  const incomeSurplus = projection?.incomeSurplus;
  const surplusCapital = projection?.surplusCapital;

  const surplusLabel = surplus >= 0 ? "Surplus" : "Shortfall";
  const surplusTone =
    surplus >= 0 ? "var(--ew-positive-symbol)" : "var(--ew-tangerine)";

  const signedTone = (n: number) =>
    n >= 0 ? "var(--ew-primary-navy)" : "var(--ew-tangerine)";

  const coveragePct = Math.min(100, Math.max(0, Math.round(coverage * 100)));

  return (
    <div
      className="rounded-md overflow-hidden"
      style={{
        backgroundColor: "#FAF5EA",
      }}
    >
      {/* Meta strip — anchors "years to retirement" and the Refresh button. */}
      <div
        className="flex items-center justify-end gap-3 px-4 py-1.5"
        style={{ borderBottom: "1px solid #ECE5D3" }}
      >
        <span
          className="text-xs tabular-nums"
          style={{ color: "var(--ew-gray-700)" }}
        >
          {yearsToRetirement} yrs to retirement
        </span>
        {actions}
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={isLoading}
          className="gap-1.5 h-7 px-2 text-xs"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </Button>
      </div>

      {/* KPI segments — wrap to a new line if the viewport is too narrow. */}
      <div className="flex items-stretch flex-wrap">
        <Segment
          label="Voluntary capital surplus"
          value={rand(voluntaryCapitalSurplus?.capitalAtRetirement ?? 0)}
          secondaryValue={`${rand(
            voluntaryCapitalSurplus?.valueInCurrentTerms ?? 0
          )} in current terms`}
          valueColor={signedTone(
            voluntaryCapitalSurplus?.capitalAtRetirement ?? 0
          )}
          loading={isLoading}
        />
        <Divider />
        <Segment
          label="Income surplus"
          value={rand(incomeSurplus?.capitalAtRetirement ?? 0)}
          secondaryValue={`${rand(
            incomeSurplus?.valueInCurrentTerms ?? 0
          )} in current terms`}
          valueColor={signedTone(incomeSurplus?.capitalAtRetirement ?? 0)}
          loading={isLoading}
        />
        <Divider />
        <Segment
          label="Surplus capital"
          value={rand(surplusCapital?.capitalAtRetirement ?? 0)}
          secondaryValue={`${rand(
            surplusCapital?.valueInCurrentTerms ?? 0
          )} in current terms`}
          valueColor={signedTone(surplusCapital?.capitalAtRetirement ?? 0)}
          loading={isLoading}
        />
        <Divider />
        <Segment
          label={surplusLabel}
          value={rand(Math.abs(surplus))}
          valueColor={surplusTone}
          loading={isLoading}
        />
        <Divider />
        <CoverageSegment percentage={coveragePct} loading={isLoading} />
        <Divider />
        <Segment
          label="Recommended top-up / mo"
          value={rand(additional)}
          valueColor="var(--ew-blue)"
          loading={isLoading}
        />
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div
      className="w-px self-stretch"
      style={{ backgroundColor: "#ECE5D3" }}
      aria-hidden
    />
  );
}

function Segment({
  label,
  value,
  secondaryValue,
  valueColor,
  loading,
}: {
  label: string;
  value: string;
  secondaryValue?: string;
  valueColor?: string;
  loading?: boolean;
}) {
  return (
    <div className="px-4 py-6 flex-1 min-w-0">
      <div
        className="text-xs font-medium uppercase tracking-wide mb-1.5 truncate"
        style={{ color: "#A55A2A" }}
      >
        {label}
      </div>
      <div
        className="text-lg font-semibold tabular-nums truncate"
        style={{ color: valueColor ?? "var(--ew-primary-navy)" }}
      >
        {loading ? "…" : value}
      </div>
      {secondaryValue && !loading && (
        <div
          className="text-xs tabular-nums mt-0.5 truncate"
          style={{ color: "var(--ew-gray-700)" }}
        >
          {secondaryValue}
        </div>
      )}
    </div>
  );
}

function CoverageSegment({
  percentage,
  loading,
}: {
  percentage: number;
  loading?: boolean;
}) {
  const tone =
    percentage >= 100
      ? "var(--ew-positive-symbol)"
      : percentage >= 75
      ? "var(--ew-blue)"
      : "var(--ew-tangerine)";

  return (
    <div className="px-4 py-6 flex-1 min-w-0">
      <div
        className="text-xs font-medium uppercase tracking-wide mb-1.5 truncate"
        style={{ color: "#A55A2A" }}
      >
        Coverage
      </div>
      <div className="flex items-baseline gap-2">
        <div
          className="text-lg font-semibold tabular-nums"
          style={{ color: tone }}
        >
          {loading ? "…" : `${percentage}%`}
        </div>
        <div
          className="h-1.5 flex-1 rounded-full overflow-hidden"
          style={{ backgroundColor: "#EEEEEE" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${percentage}%`, backgroundColor: tone }}
          />
        </div>
      </div>
    </div>
  );
}
