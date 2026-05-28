import {
  Area,
  CartesianGrid,
  ComposedChart,
  Customized,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Info } from "lucide-react";
import { formatCurrencyValue } from "@/lib/formatting";

export interface LongevityChartPoint {
  age: number;
  /** Current (frozen baseline) capital balance. */
  current: number;
  /** Projected capital balance under the live slider values. */
  projected: number;
}

const CURRENT_COLOR = "#9CA3AF"; // muted grey — the frozen baseline
const PROJECTED_COLOR = "var(--chart-primary-blue)";

const fmtAxis = (v: number) => Math.round(v).toLocaleString("en-ZA");
const fmtRand = (v: number) => formatCurrencyValue(Math.round(v).toString());

/**
 * EW "highlighted item" callout — white card with title, the age, the big
 * value, and a secondary comparison line. Replaces the default tooltip.
 */
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string; value?: number }>;
  label?: number | string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const projected = payload.find((p) => p.dataKey === "projected")?.value;
  const current = payload.find((p) => p.dataKey === "current")?.value;
  const projNegative = typeof projected === "number" && projected < 0;
  return (
    <div
      className="rounded-lg border bg-white px-4 py-3 shadow-lg"
      style={{ borderColor: "var(--ew-border)", minWidth: 184 }}
    >
      <div
        className="text-sm font-semibold"
        style={{ color: "var(--ew-primary-navy)" }}
      >
        Projected capital
      </div>
      <div className="text-xs" style={{ color: "var(--ew-gray-700)" }}>
        Age {label}
      </div>
      <div
        className="mt-2 text-xl font-semibold tabular-nums"
        style={{
          color: projNegative
            ? "var(--ew-tangerine)"
            : "var(--ew-primary-navy)",
        }}
      >
        {typeof projected === "number" ? fmtRand(projected) : "—"}
      </div>
      {typeof current === "number" && Number.isFinite(current) && (
        <div
          className="mt-1 flex items-center gap-1 text-xs"
          style={{ color: "var(--ew-gray-700)" }}
        >
          <Info className="h-3 w-3" />
          Current {fmtRand(current)}
        </div>
      )}
    </div>
  );
}

/** Tick marks every five years across the age domain. */
function fiveYearTicks(data: LongevityChartPoint[]): number[] {
  if (data.length === 0) return [];
  const lo = data[0].age;
  const hi = data[data.length - 1].age;
  const ticks: number[] = [];
  for (let a = Math.ceil(lo / 5) * 5; a <= hi; a += 5) ticks.push(a);
  return ticks;
}

/**
 * Capital-balance-over-age chart in the EW "Discuss" style: a clean projected
 * line (solid EW blue) with the area shaded light green above the zero line
 * (capital in hand) and tangerine below it (capital exhausted), plus the frozen
 * Current baseline as a dashed grey line. The axes are intentionally muted so
 * the data leads; a faint retirement guide line and a tangerine run-out dot are
 * the only marks.
 */
export function LongevityChart({
  data,
  retirementAge,
  depletionAge,
}: {
  data: LongevityChartPoint[];
  /** Faint vertical guide line at the retirement age. */
  retirementAge?: number;
  /** Projected run-out age — placed as a dot on the zero line. */
  depletionAge?: number | null;
}) {
  // The fill gradient maps to the projected Area's own bounding box (SVG
  // objectBoundingBox), which spans from the projected max down to zero (or to
  // the projected min when it goes negative). So the green/tangerine split must
  // be computed from the PROJECTED series alone — not the dashed current line,
  // whose range would put the split in the wrong place.
  const projected = data
    .map((d) => d.projected)
    .filter(Number.isFinite as (n: number) => n is number);
  const boxTop = Math.max(0, ...projected);
  const boxBottom = Math.min(0, ...projected);
  const zeroOffset =
    boxTop <= 0 ? 0 : boxBottom >= 0 ? 1 : boxTop / (boxTop - boxBottom);
  const ticks = fiveYearTicks(data);

  return (
    <div className="mx-auto w-full" style={{ height: 460, maxWidth: 700 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 28, right: 28, bottom: 16, left: 12 }}
        >
          <defs>
            {/* Light green above the zero line (capital in hand), tangerine
                below it (capital exhausted), split exactly at zero. */}
            <linearGradient id="ew-longevity-fill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset={0}
                stopColor="var(--chart-secondary-green-light)"
                stopOpacity={0.55}
              />
              <stop
                offset={zeroOffset}
                stopColor="var(--chart-secondary-green-light)"
                stopOpacity={0.55}
              />
              <stop
                offset={zeroOffset}
                stopColor="var(--ew-tangerine)"
                stopOpacity={0.2}
              />
              <stop
                offset={1}
                stopColor="var(--ew-tangerine)"
                stopOpacity={0.2}
              />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#F4F4F4" vertical={false} />
          {/* Scale only — the age labels are drawn on the zero line below. */}
          <XAxis
            dataKey="age"
            type="number"
            domain={["dataMin", "dataMax"]}
            padding={{ left: 14, right: 14 }}
            tick={false}
            tickLine={false}
            axisLine={false}
            height={1}
          />
          <YAxis
            tickFormatter={fmtAxis}
            tick={{ fontSize: 10, fill: "#AFAFAF" }}
            tickLine={false}
            axisLine={false}
            width={72}
          />
          <ReferenceLine y={0} stroke="#D7D7D7" strokeWidth={1} />
          {retirementAge !== undefined && (
            <ReferenceLine
              x={retirementAge}
              stroke="#D7D7D7"
              strokeDasharray="4 4"
              label={{
                value: `Retire · ${retirementAge}`,
                position: "top",
                fontSize: 10,
                fill: "#AFAFAF",
              }}
            />
          )}
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "var(--ew-blue)", strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="current"
            name="current"
            stroke={CURRENT_COLOR}
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            activeDot={false}
            connectNulls
          />
          <Area
            type="monotone"
            dataKey="projected"
            name="projected"
            baseValue={0}
            stroke={PROJECTED_COLOR}
            strokeWidth={2.5}
            fill="url(#ew-longevity-fill)"
            dot={false}
            activeDot={{
              r: 5,
              fill: PROJECTED_COLOR,
              stroke: "#fff",
              strokeWidth: 2,
            }}
            connectNulls
          />
          {depletionAge != null && (
            <ReferenceDot
              x={depletionAge}
              y={0}
              r={5}
              fill="var(--ew-tangerine)"
              stroke="#fff"
              strokeWidth={2}
            />
          )}
          {/* Age labels sit on the zero line, so the timeline reads as the
              axis with capital fanning above (positive) and below (negative). */}
          <Customized
            component={(props: { xAxisMap?: any; yAxisMap?: any }) => {
              const xMap =
                props.xAxisMap &&
                props.xAxisMap[Object.keys(props.xAxisMap)[0]];
              const yMap =
                props.yAxisMap &&
                props.yAxisMap[Object.keys(props.yAxisMap)[0]];
              if (!xMap || !yMap) return <g />;
              const yZero = yMap.scale(0);
              return (
                <g>
                  {ticks.map((age) => (
                    <text
                      key={age}
                      x={xMap.scale(age)}
                      y={yZero + 15}
                      textAnchor="middle"
                      fontSize={10}
                      fill="#AFAFAF"
                    >
                      {age}
                    </text>
                  ))}
                </g>
              );
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
