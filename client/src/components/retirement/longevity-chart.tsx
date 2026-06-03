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

/** A one-off event marked as a dot on the projected curve — e.g. a Two-Pot
 *  lump sum commuted at retirement. Hovering that age folds the detail into the
 *  capital tooltip. */
export interface ChartEvent {
  age: number;
  /** Balance the dot sits at on the projected curve. */
  value: number;
  title: string;
  /** Signed rand delta — negative draws as a tangerine outflow. */
  amount: number;
  /** Capital just before the event (the gross peak). Pins the tooltip headline
   *  so it stays the pre-event value even though the step puts two projected
   *  points at this age. */
  capitalBefore?: number;
}

const EVENT_COLOR = "#A55A2A"; // EW accent brown — distinct from the blue line
// Caps on the deep run-out plunge, as fractions of the peak. The VIEW floor is
// what the axis shows; the data is clamped a little LOWER so the line keeps
// descending through the bottom edge (and drops off-screen) instead of running
// flat along the visible floor.
const NEGATIVE_VIEW_FRACTION = 0.28;
const NEGATIVE_CLAMP_FRACTION = 0.42;

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
  events = [],
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string; value?: number }>;
  label?: number | string;
  events?: ChartEvent[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const projected = payload.find((p) => p.dataKey === "projected")?.value;
  const current = payload.find((p) => p.dataKey === "current")?.value;
  const hereEvents = events.filter((e) => Number(e.age) === Number(label));
  const eventDelta = hereEvents.reduce((s, e) => s + e.amount, 0);
  // At an event age the curve has two points (the step); pin the headline to
  // the pre-event peak so it reads the same whichever point the cursor catches.
  const pinned = hereEvents.find((e) => typeof e.capitalBefore === "number");
  const headline = pinned ? pinned.capitalBefore : projected;
  const projNegative = typeof headline === "number" && headline < 0;
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
      <div className="text-sm" style={{ color: "var(--ew-gray-700)" }}>
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
        {typeof headline === "number" ? fmtRand(headline) : "—"}
      </div>
      {/* The frozen-baseline comparison. Hidden at an event age, where the curve
          has two stacked points and the read is ambiguous — the breakdown below
          stands in for it there. */}
      {hereEvents.length === 0 &&
        typeof current === "number" &&
        Number.isFinite(current) && (
          <div
            className="mt-1 flex items-center gap-1 text-sm"
            style={{ color: "var(--ew-gray-700)" }}
          >
            <Info className="h-3 w-3" />
            Current {fmtRand(current)}
          </div>
        )}
      {hereEvents.length > 0 && (
        <div
          className="mt-3 space-y-1.5 border-t pt-3"
          style={{ borderColor: "var(--ew-border)" }}
        >
          {hereEvents.map((e) => {
            const outflow = e.amount < 0;
            return (
              <div
                key={e.title}
                className="flex items-baseline justify-between gap-4 text-sm"
              >
                <span style={{ color: "var(--ew-gray-700)" }}>{e.title}</span>
                <span
                  className="font-semibold tabular-nums"
                  style={{
                    color: outflow
                      ? "var(--ew-tangerine)"
                      : "var(--ew-primary-navy)",
                  }}
                >
                  {outflow ? "−" : ""}
                  {fmtRand(Math.abs(e.amount))}
                </span>
              </div>
            );
          })}
          {typeof headline === "number" && (
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span style={{ color: "var(--ew-gray-700)" }}>To annuity</span>
              <span
                className="font-semibold tabular-nums"
                style={{ color: "var(--ew-primary-navy)" }}
              >
                {fmtRand(headline + eventDelta)}
              </span>
            </div>
          )}
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
  events = [],
  capitalAtRetirement,
}: {
  data: LongevityChartPoint[];
  /** Faint vertical guide line at the retirement age. */
  retirementAge?: number;
  /** Projected run-out age — placed as a dot on the zero line. */
  depletionAge?: number | null;
  /** Major events marked as hover dots on the projected curve. */
  events?: ChartEvent[];
  /** Capital at the retirement handoff — annotated at the peak so the eye ties
   *  the chart to the rail's figure. The seam between the two phases. */
  capitalAtRetirement?: number;
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
  const trueMin = Math.min(0, ...projected);
  // An underfunded plan plunges sharply negative once capital is gone — left
  // unbounded, that drop dominates the axis and squashes the build-up and the
  // lump-sum step. So cap the deep tail. The axis floor is a shallow fraction of
  // the peak; the data is clamped a little LOWER so the line keeps descending
  // off the bottom edge rather than running flat along the floor. The run-out
  // dot on the zero line still marks the year the money is gone — nothing lost.
  const plunges = trueMin < -NEGATIVE_VIEW_FRACTION * boxTop;
  const viewFloor = plunges ? -NEGATIVE_VIEW_FRACTION * boxTop : trueMin;
  const clampFloor = plunges ? -NEGATIVE_CLAMP_FRACTION * boxTop : trueMin;
  const boxBottom = Math.min(0, clampFloor);
  const zeroOffset =
    boxTop <= 0 ? 0 : boxBottom >= 0 ? 1 : boxTop / (boxTop - boxBottom);
  const clamp = (v: number) =>
    Number.isFinite(v) ? Math.max(v, clampFloor) : v;
  const rows = data.map((d) => ({
    age: d.age,
    projected: clamp(d.projected),
    current: clamp(d.current),
  }));
  const ticks = fiveYearTicks(data);

  return (
    <div className="mx-auto w-full" style={{ height: 460, maxWidth: 700 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={rows}
          margin={{ top: 16, right: 28, bottom: 56, left: 12 }}
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
            domain={[viewFloor, "auto"]}
            allowDataOverflow
            tickFormatter={fmtAxis}
            tick={{ fontSize: 12, fill: "#AFAFAF" }}
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
            />
          )}
          <Tooltip
            content={<ChartTooltip events={events} />}
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
          {events.map((event) => (
            <ReferenceDot
              key={`${event.age}-${event.title}`}
              x={event.age}
              y={event.value}
              r={6}
              fill={EVENT_COLOR}
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
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
              const yRange = yMap.scale.range ? yMap.scale.range() : null;
              const plotBottom = yRange ? Math.max(yRange[0], yRange[1]) : 0;
              const startAge = data[0]?.age;
              const endAge = data[data.length - 1]?.age;
              const showBand =
                retirementAge !== undefined &&
                startAge !== undefined &&
                endAge !== undefined;
              const px =
                retirementAge !== undefined ? xMap.scale(retirementAge) : 0;
              const x0 = startAge !== undefined ? xMap.scale(startAge) : 0;
              const x1 = endAge !== undefined ? xMap.scale(endAge) : 0;
              // Timeline band geometry, sat in the reserved bottom margin.
              const barH = 9;
              const bandY = plotBottom + 22;
              return (
                <g>
                  {ticks.map((age) => (
                    <text
                      key={age}
                      x={xMap.scale(age)}
                      y={yZero + 15}
                      textAnchor="middle"
                      fontSize={12}
                      fill="#AFAFAF"
                    >
                      {age}
                    </text>
                  ))}
                  {/* Timeline band along the bottom: a pill split building-up /
                      drawing-down, with the retirement age marked on the seam.
                      Carries the phase story so the chart top stays clean.
                      Deliberately NOT the green/tangerine of the capital fill —
                      that's the positive/negative story; this is the phase story.
                      Cool blue (accumulating) → warm sand (spending). Provisional
                      — flagged for design. */}
                  {showBand && (
                    <>
                      <defs>
                        <clipPath id="ew-timeline-pill">
                          <rect
                            x={x0}
                            y={bandY}
                            width={x1 - x0}
                            height={barH}
                            rx={barH / 2}
                          />
                        </clipPath>
                      </defs>
                      <g clipPath="url(#ew-timeline-pill)">
                        <rect
                          x={x0}
                          y={bandY}
                          width={px - x0}
                          height={barH}
                          fill="var(--ew-blue-tertiary-100)"
                        />
                        <rect
                          x={px}
                          y={bandY}
                          width={x1 - px}
                          height={barH}
                          fill="#ECE5D3"
                        />
                      </g>
                      <line
                        x1={px}
                        y1={bandY - 4}
                        x2={px}
                        y2={bandY + barH + 4}
                        stroke="var(--ew-blue)"
                        strokeWidth={1.5}
                      />
                      <text
                        x={px}
                        y={bandY - 8}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight={600}
                        style={{ fill: "var(--ew-primary-navy)" }}
                      >
                        Retirement · {retirementAge}
                      </text>
                      <text
                        x={(x0 + px) / 2}
                        y={bandY + barH + 14}
                        textAnchor="middle"
                        fontSize={12}
                        letterSpacing="0.04em"
                        fill="#9CA3AF"
                      >
                        Building up
                      </text>
                      <text
                        x={(px + x1) / 2}
                        y={bandY + barH + 14}
                        textAnchor="middle"
                        fontSize={12}
                        letterSpacing="0.04em"
                        fill="#9CA3AF"
                      >
                        Drawing down
                      </text>
                    </>
                  )}
                  {/* The handoff: capital at retirement. Sits just right of the
                      peak, where the lump-sum step has dropped the line away and
                      left open space — clear of the Retire seam and the curve. */}
                  {capitalAtRetirement != null &&
                    retirementAge !== undefined && (
                      <>
                        <text
                          x={px + 9}
                          y={yMap.scale(capitalAtRetirement) - 4}
                          textAnchor="start"
                          fontSize={12}
                          fill="#9CA3AF"
                        >
                          Capital at retirement
                        </text>
                        <text
                          x={px + 9}
                          y={yMap.scale(capitalAtRetirement) + 11}
                          textAnchor="start"
                          fontSize={14}
                          fontWeight={600}
                          style={{ fill: "var(--ew-primary-navy)" }}
                        >
                          {fmtRand(capitalAtRetirement)}
                        </text>
                      </>
                    )}
                </g>
              );
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
