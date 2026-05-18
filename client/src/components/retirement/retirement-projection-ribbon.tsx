import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrencyValue } from "@/lib/formatting";
import { useRetirementProjection, useRefreshRetirementProjection } from "@/hooks/use-retirement-projection";

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
 * Live cross-category projection ribbon. Renders as a single light-grey card
 * with segmented compartments — one per metric — rather than a row of
 * independent chip cards. Sits inside the stepper card on Retirement Build
 * routes (rendered by RetirementLayout via NeedLayout's `headerExtra` slot).
 */
export function RetirementProjectionRibbon({ actions }: RetirementProjectionRibbonProps = {}) {
  const { data: projection, isLoading } = useRetirementProjection();
  const refresh = useRefreshRetirementProjection();

  const provided = projection?.capitalProvided ?? 0;
  const required = projection?.capitalRequired ?? 0;
  const surplus = projection?.surplus ?? 0;
  const coverage = projection?.coverage ?? 0;
  const additional = projection?.additionalMonthlyContribution ?? 0;
  const yearsToRetirement = projection?.yearsToRetirement ?? 0;

  const surplusLabel = surplus >= 0 ? "Surplus" : "Shortfall";
  const surplusTone = surplus >= 0 ? "var(--ew-positive-symbol)" : "var(--ew-tangerine)";

  const coveragePct = Math.min(100, Math.max(0, Math.round(coverage * 100)));

  return (
    <div className="flex items-stretch gap-3">
      <div
        className="flex items-stretch rounded-md overflow-hidden flex-1 min-w-0"
        style={{
          backgroundColor: "#F7F7F7",
          border: "1px solid #EEEEEE",
        }}
      >
        <Segment label="Capital at retirement" value={rand(provided)} loading={isLoading} />
        <Divider />
        <Segment label="Capital required" value={rand(required)} loading={isLoading} />
        <Divider />
        <Segment
          label={surplusLabel}
          value={rand(Math.abs(surplus))}
          valueColor={surplusTone}
          loading={isLoading}
        />
        <Divider />
        <CoverageSegment percentage={coveragePct} loading={isLoading} />
        {additional > 0 && (
          <>
            <Divider />
            <Segment
              label="Recommended top-up / mo"
              value={rand(additional)}
              valueColor="var(--ew-blue)"
              loading={isLoading}
            />
          </>
        )}
      </div>
      <div className="flex items-end shrink-0">
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs tabular-nums" style={{ color: "var(--ew-gray-700)" }}>
            {yearsToRetirement} yrs to retirement
          </span>
          <div className="flex items-center gap-2">
            {actions}
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
              className="gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div
      className="w-px self-stretch"
      style={{ backgroundColor: "#EEEEEE" }}
      aria-hidden
    />
  );
}

function Segment({
  label,
  value,
  valueColor,
  loading,
}: {
  label: string;
  value: string;
  valueColor?: string;
  loading?: boolean;
}) {
  return (
    <div className="px-4 py-10 flex-1 min-w-0">
      <div
        className="text-xs font-medium uppercase tracking-wide mb-1.5 truncate"
        style={{ color: "var(--ew-blue)" }}
      >
        {label}
      </div>
      <div
        className="text-lg font-semibold tabular-nums truncate"
        style={{ color: valueColor ?? "var(--ew-primary-navy)" }}
      >
        {loading ? "…" : value}
      </div>
    </div>
  );
}

function CoverageSegment({ percentage, loading }: { percentage: number; loading?: boolean }) {
  const tone =
    percentage >= 100
      ? "var(--ew-positive-symbol)"
      : percentage >= 75
      ? "var(--ew-blue)"
      : "var(--ew-tangerine)";

  return (
    <div className="px-4 py-10 flex-1 min-w-0">
      <div
        className="text-xs font-medium uppercase tracking-wide mb-1.5 truncate"
        style={{ color: "var(--ew-blue)" }}
      >
        Coverage
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-lg font-semibold tabular-nums" style={{ color: tone }}>
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
