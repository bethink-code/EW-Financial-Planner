import type { GuaranteedIncomeResult } from "@shared/retirement-guaranteed-income";
import { formatCurrencyValue } from "@/lib/formatting";

const navy = "var(--ew-primary-navy)";
const fmt = (n: number) => formatCurrencyValue(Math.round(n).toString());
const fmtPct = (frac: number) => `${(frac * 100).toFixed(1)}%`;

/**
 * The guaranteed-income "cheque" rail — the cream summary box. Shared by the
 * cards view and the income graph so both lead with the same headline figure.
 */
export function GuaranteedIncomeRail({
  monthlyIncome,
  monthlyRequired,
  termYears,
}: {
  monthlyIncome: number;
  monthlyRequired: number;
  termYears: number;
}) {
  const shortfall = monthlyRequired - monthlyIncome;
  return (
    <div className="w-80 flex-shrink-0 self-center">
      <div
        className="rounded-lg p-5 space-y-4"
        style={{ backgroundColor: "#FAF5EA" }}
      >
        <div>
          <div
            className="text-xs font-medium"
            style={{ color: "var(--ew-blue)" }}
          >
            Guaranteed monthly income
          </div>
          <div className="text-3xl font-semibold mt-1" style={{ color: navy }}>
            {fmt(monthlyIncome)}
            <span className="text-base font-normal opacity-60"> /mo</span>
          </div>
          <div className="text-xs mt-1" style={{ color: navy, opacity: 0.6 }}>
            escalating at CPI · guaranteed for {Math.round(termYears)} years
          </div>
        </div>

        <div className="h-px" style={{ backgroundColor: "#ECE5D3" }} />

        <Row
          label="Income required"
          value={`${fmt(monthlyRequired)} /mo`}
          muted
        />
        <Row
          label={shortfall > 0 ? "Shortfall" : "Surplus"}
          value={`${fmt(Math.abs(shortfall))} /mo`}
          tone={shortfall > 0 ? "negative" : "positive"}
        />
      </div>
    </div>
  );
}

interface GuaranteedIncomeViewProps {
  result: GuaranteedIncomeResult;
  capitalAtRetirement: number;
  monthlyRequired: number;
}

/**
 * "Guaranteed income" Project view — the term-annuity alternative to the
 * drawdown. Narrative: take the Two-Pot cash lump sum (taxed once under the
 * SARS retirement table), annuitise the residual, and draw a guaranteed
 * monthly income for the term. Left rail = the cheque; right = how it's funded.
 */
export function GuaranteedIncomeView({
  result,
  capitalAtRetirement,
  monthlyRequired,
}: GuaranteedIncomeViewProps) {
  const {
    lumpSumGross,
    lumpSumTax,
    lumpSumNet,
    annuityCapital,
    monthlyIncome,
    lumpSumTaxRate,
    termYears,
  } = result;

  const cashFrac =
    capitalAtRetirement > 0 ? lumpSumGross / capitalAtRetirement : 0;

  return (
    <div className="flex gap-6">
      <GuaranteedIncomeRail
        monthlyIncome={monthlyIncome}
        monthlyRequired={monthlyRequired}
        termYears={termYears}
      />

      {/* Right: how it's funded. */}
      <div className="flex-1 min-w-0 self-center">
        <div className="rounded-lg p-6" style={{ backgroundColor: "#F4F8FB" }}>
          {/* Wider gaps between the three blocks so each reads on its own. */}
          <div className="space-y-8">
            <div>
              <Row
                label="Capital at retirement"
                value={fmt(capitalAtRetirement)}
                bold
              />
              {/* Cash vs annuity split bar. */}
              <div className="mt-3 flex h-3 overflow-hidden rounded-full">
                <div
                  style={{
                    width: `${cashFrac * 100}%`,
                    backgroundColor: "var(--chart-primary-orange)",
                  }}
                  title="Cash lump sum"
                />
                <div
                  style={{
                    width: `${(1 - cashFrac) * 100}%`,
                    backgroundColor: "var(--chart-primary-blue)",
                  }}
                  title="Capital to annuity"
                />
              </div>
            </div>

            <div>
              <div
                className="text-sm font-semibold mb-1"
                style={{ color: "var(--chart-primary-orange)" }}
              >
                Cash lump sum (commuted)
              </div>
              <Row label="Gross" value={fmt(lumpSumGross)} indent />
              <Row
                label={`SARS tax (${fmtPct(lumpSumTaxRate)})`}
                value={`−${fmt(lumpSumTax)}`}
                indent
                tone="negative"
              />
              <Row
                label="Net cash in hand"
                value={fmt(lumpSumNet)}
                indent
                bold
              />
            </div>

            <div>
              <div
                className="text-sm font-semibold mb-1"
                style={{ color: "var(--ew-blue)" }}
              >
                Capital to annuity
              </div>
              <Row label="Invested" value={fmt(annuityCapital)} indent />
              <Row
                label={`Buys, for ${Math.round(termYears)} years`}
                value={`${fmt(monthlyIncome)} /mo`}
                indent
                bold
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  muted,
  indent,
  tone,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  indent?: boolean;
  tone?: "positive" | "negative";
}) {
  const color =
    tone === "negative"
      ? "var(--ew-negative-symbol)"
      : tone === "positive"
      ? "var(--ew-blue)"
      : navy;
  return (
    <div
      className={`flex items-baseline justify-between ${indent ? "pl-3" : ""}`}
    >
      <span
        className="text-sm"
        style={{ color: navy, opacity: muted ? 0.55 : 0.75 }}
      >
        {label}
      </span>
      <span
        className={`text-sm tabular-nums ${bold ? "font-semibold" : ""}`}
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}
