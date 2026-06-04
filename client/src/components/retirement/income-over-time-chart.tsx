import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrencyValue } from "@/lib/formatting";

const GUARANTEED_COLOR = "var(--chart-primary-blue)";
const REQUIRED_COLOR = "#9CA3AF";

const fmtAxis = (v: number) => Math.round(v).toLocaleString("en-ZA");
const fmtRand = (v: number) => formatCurrencyValue(Math.round(v).toString());

interface IncomeChartPoint {
  age: number;
  guaranteed: number;
  required: number;
}

/**
 * "Income over time" — the guaranteed-income counterpart to the capital chart.
 * The term annuity pays a monthly cheque that escalates with CPI across the
 * retirement horizon; the dashed line is the income required, so the advisor
 * sees coverage at a glance. Both start at their at-retirement values and
 * escalate at CPI (consistent with the cards view).
 */
export function IncomeOverTimeChart({
  monthlyIncome,
  monthlyRequired,
  cpiPct,
  retirementAge,
  untilAge,
}: {
  monthlyIncome: number;
  monthlyRequired: number;
  cpiPct: number;
  retirementAge: number;
  untilAge: number;
}) {
  const cpi = cpiPct / 100;
  const data: IncomeChartPoint[] = [];
  for (
    let age = Math.round(retirementAge);
    age <= Math.round(untilAge);
    age++
  ) {
    const t = age - retirementAge;
    const esc = Math.pow(1 + cpi, t);
    data.push({
      age,
      guaranteed: monthlyIncome * esc,
      required: monthlyRequired * esc,
    });
  }

  const ticks: number[] = [];
  if (data.length) {
    const lo = data[0].age;
    const hi = data[data.length - 1].age;
    for (let a = Math.ceil(lo / 5) * 5; a <= hi; a += 5) ticks.push(a);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-4"
            style={{ borderTop: `2px solid ${GUARANTEED_COLOR}` }}
          />
          guaranteed income
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-4"
            style={{ borderTop: `2px dashed ${REQUIRED_COLOR}` }}
          />
          income required
        </span>
      </div>
      <div className="mx-auto w-full" style={{ height: 440, maxWidth: 700 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 16, right: 28, bottom: 16, left: 12 }}
          >
            <defs>
              <linearGradient id="ew-income-fill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset={0}
                  stopColor={GUARANTEED_COLOR}
                  stopOpacity={0.28}
                />
                <stop
                  offset={1}
                  stopColor={GUARANTEED_COLOR}
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#F4F4F4" vertical={false} />
            <XAxis
              dataKey="age"
              type="number"
              domain={["dataMin", "dataMax"]}
              ticks={ticks}
              padding={{ left: 14, right: 14 }}
              tick={{ fontSize: 12, fill: "#AFAFAF" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(a) => `${a}`}
            />
            <YAxis
              domain={[0, "auto"]}
              tickFormatter={fmtAxis}
              tick={{ fontSize: 12, fill: "#AFAFAF" }}
              tickLine={false}
              axisLine={false}
              width={72}
            />
            <Tooltip
              content={<IncomeTooltip />}
              cursor={{ stroke: "var(--ew-blue)", strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="guaranteed"
              name="guaranteed"
              baseValue={0}
              stroke={GUARANTEED_COLOR}
              strokeWidth={2.5}
              fill="url(#ew-income-fill)"
              dot={false}
              activeDot={{
                r: 5,
                fill: GUARANTEED_COLOR,
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
            <Line
              type="monotone"
              dataKey="required"
              name="required"
              stroke={REQUIRED_COLOR}
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              activeDot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function IncomeTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string; value?: number }>;
  label?: number | string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const guaranteed = payload.find((p) => p.dataKey === "guaranteed")?.value;
  const required = payload.find((p) => p.dataKey === "required")?.value;
  const short =
    typeof guaranteed === "number" && typeof required === "number"
      ? required - guaranteed
      : undefined;
  return (
    <div
      className="rounded-lg border bg-white px-4 py-3 shadow-lg"
      style={{ borderColor: "var(--ew-border)", minWidth: 184 }}
    >
      <div className="text-sm" style={{ color: "var(--ew-gray-700)" }}>
        Age {label}
      </div>
      <div
        className="mt-2 text-xl font-semibold tabular-nums"
        style={{ color: "var(--ew-primary-navy)" }}
      >
        {typeof guaranteed === "number" ? fmtRand(guaranteed) : "—"}
        <span className="text-sm font-normal opacity-60"> /mo</span>
      </div>
      {typeof required === "number" && (
        <div
          className="mt-1 text-sm tabular-nums"
          style={{ color: "var(--ew-gray-700)" }}
        >
          Required {fmtRand(required)}
        </div>
      )}
      {typeof short === "number" && (
        <div
          className="mt-0.5 text-sm tabular-nums"
          style={{
            color: short > 0 ? "var(--ew-negative-symbol)" : "var(--ew-blue)",
          }}
        >
          {short > 0 ? "Short " : "Surplus "}
          {fmtRand(Math.abs(short))}
        </div>
      )}
    </div>
  );
}
