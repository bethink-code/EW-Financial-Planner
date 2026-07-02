import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { BarChart2, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RISK_COVER_SUMMARY } from "./data-risk";
import { MEDICAL_ROWS, SHORT_TERM_ROWS } from "./data-holdings";
import { SectionHeading, StatusCard } from "./primitives";
import { cardSurface } from "./listings";
import { SegmentButton, SegmentGroup } from "./view";

/**
 * Monthly portfolio data — Ben Meander demo, Jan 2021 – Oct 2025.
 * Models the 2022 global market correction, three withdrawal events
 * (each creates a visible notch), and regular contribution growth.
 * Ends at the actual total: R 3 031 961 at 06/10/2025.
 */
interface PortfolioPoint {
  date: string;
  value: number;
  /** Transaction label shown in the tooltip — withdrawals and contributions. */
  tx?: string;
}

const CHART_DATA: PortfolioPoint[] = [
  { date: "Jan 2021", value: 2_400_000 },
  { date: "Feb 2021", value: 2_432_000 },
  { date: "Mar 2021", value: 2_468_000 },
  { date: "Apr 2021", value: 2_522_000 },
  { date: "May 2021", value: 2_558_000 },
  { date: "Jun 2021", value: 2_598_000 },
  { date: "Jul 2021", value: 2_642_000 },
  { date: "Aug 2021", value: 2_678_000 },
  { date: "Sep 2021", value: 2_648_000 },
  { date: "Oct 2021", value: 2_702_000 },
  { date: "Nov 2021", value: 2_755_000 },
  { date: "Dec 2021", value: 2_818_000 },
  // 2022 — Ukraine war + global rate hike correction
  { date: "Jan 2022", value: 2_852_000 },
  { date: "Feb 2022", value: 2_792_000 },
  { date: "Mar 2022", value: 2_718_000 },
  { date: "Apr 2022", value: 2_645_000 },
  { date: "May 2022", value: 2_572_000 },
  { date: "Jun 2022", value: 2_488_000 }, // correction trough
  { date: "Jul 2022", value: 2_565_000 },
  { date: "Aug 2022", value: 2_622_000 },
  { date: "Sep 2022", value: 2_568_000 }, // second leg down
  { date: "Oct 2022", value: 2_648_000 },
  { date: "Nov 2022", value: 2_722_000 },
  { date: "Dec 2022", value: 2_775_000 },
  // 2023 — recovery and growth
  { date: "Jan 2023", value: 2_842_000 },
  { date: "Feb 2023", value: 2_895_000 },
  { date: "Mar 2023", value: 2_958_000 },
  { date: "Apr 2023", value: 3_025_000 },
  { date: "May 2023", value: 3_082_000 },
  { date: "Jun 2023", value: 3_138_000 },
  { date: "Jul 2023", value: 3_198_000, tx: "Withdrawal R 253 000 — property deposit" },
  { date: "Aug 2023", value: 2_945_000 },
  { date: "Sep 2023", value: 2_988_000 },
  { date: "Oct 2023", value: 3_042_000 },
  { date: "Nov 2023", value: 3_088_000 },
  { date: "Dec 2023", value: 3_118_000 },
  // 2024
  { date: "Jan 2024", value: 3_152_000 },
  { date: "Feb 2024", value: 3_172_000, tx: "Withdrawal R 114 000 — education fees" },
  { date: "Mar 2024", value: 3_058_000 },
  { date: "Apr 2024", value: 3_092_000 },
  { date: "May 2024", value: 3_075_000 },
  { date: "Jun 2024", value: 3_128_000 },
  { date: "Jul 2024", value: 3_085_000 },
  { date: "Aug 2024", value: 3_102_000 },
  { date: "Sep 2024", value: 3_122_000 },
  { date: "Oct 2024", value: 3_148_000 },
  { date: "Nov 2024", value: 3_172_000 },
  { date: "Dec 2024", value: 3_198_000 },
  // 2025
  { date: "Jan 2025", value: 3_148_000 },
  { date: "Feb 2025", value: 3_165_000 },
  { date: "Mar 2025", value: 3_142_000 },
  { date: "Apr 2025", value: 3_158_000 },
  { date: "May 2025", value: 3_178_000 },
  { date: "Jun 2025", value: 3_162_000 },
  { date: "Jul 2025", value: 3_148_000 },
  { date: "Aug 2025", value: 3_162_000, tx: "Withdrawal R 120 000 — holiday" },
  { date: "Sep 2025", value: 3_042_000 },
  { date: "Oct 2025", value: 3_031_961 },
];

/** Months shown on the X-axis — roughly every 6 months. */
const X_TICK_DATES = new Set([
  "Jan 2021", "Jul 2021",
  "Jan 2022", "Jul 2022",
  "Jan 2023", "Jul 2023",
  "Jan 2024", "Jul 2024",
  "Jan 2025", "Jul 2025",
  "Oct 2025",
]);

/** Months with a withdrawal transaction — used for reference lines. */
const WITHDRAWAL_DATES = CHART_DATA
  .filter((d) => d.tx?.startsWith("Withdrawal"))
  .map((d) => d.date);

function fmtRand(v: number) {
  return "R " + Math.round(v).toLocaleString("en-US").replace(/,/g, " ");
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: PortfolioPoint }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div
      className="rounded-md border bg-white px-3 py-2.5 text-[13px] shadow-md"
      style={{ borderColor: "var(--ew-border)" }}
    >
      <div className="text-xs text-gray-400">{label}</div>
      <div className="mt-0.5 text-[15px] font-semibold tabular-nums text-neutral-900">
        {fmtRand(payload[0].value)}
      </div>
      <div className="text-xs text-gray-400">IRR 9.2%</div>
      {point.tx && (
        <div
          className="mt-1.5 border-t pt-1.5 text-xs"
          style={{ borderColor: "var(--ew-border)", color: "#E4410D" }}
        >
          {point.tx}
        </div>
      )}
    </div>
  );
}

function renderDot(props: {
  cx?: number;
  cy?: number;
  payload?: PortfolioPoint;
  index?: number;
}) {
  const { cx, cy, payload, index } = props;
  if (!payload?.tx || cx == null || cy == null) {
    return <g key={`dot-empty-${index}`} />;
  }
  return (
    <circle
      key={`dot-tx-${index}`}
      cx={cx}
      cy={cy}
      r={5}
      fill="#E4410D"
      stroke="white"
      strokeWidth={2}
    />
  );
}

function InvestmentChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart
        data={CHART_DATA}
        margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F97415" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#F97415" stopOpacity={0.06} />
          </linearGradient>
        </defs>

        {/* Subtle vertical reference lines at withdrawal events */}
        {WITHDRAWAL_DATES.map((date) => (
          <ReferenceLine
            key={date}
            x={date}
            stroke="#E4410D"
            strokeWidth={1}
            strokeDasharray="3 3"
            strokeOpacity={0.4}
          />
        ))}

        <XAxis
          dataKey="date"
          tick={({ x, y, payload }: { x: number; y: number; payload: { value: string } }) =>
            X_TICK_DATES.has(payload.value) ? (
              <text
                x={x}
                y={y + 12}
                textAnchor="middle"
                fill="#9CA3AF"
                fontSize={11}
              >
                {payload.value}
              </text>
            ) : (
              <g />
            )
          }
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <YAxis
          hide
          domain={[2_200_000, 3_400_000]}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#F97415"
          strokeWidth={2}
          fill="url(#portfolioFill)"
          dot={renderDot}
          activeDot={{ r: 4, fill: "#F97415", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function InvestmentTable() {
  return (
    <div className="max-h-64 overflow-y-auto">
      <table className="w-full text-[13px]">
        <thead className="sticky top-0">
          <tr style={{ backgroundColor: "var(--ew-blue-tertiary-50)" }}>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
              Period
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-600">
              Value
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
              Transaction
            </th>
          </tr>
        </thead>
        <tbody>
          {[...CHART_DATA].reverse().map((row) => (
            <tr
              key={row.date}
              className="border-b"
              style={{ borderColor: "var(--ew-border)" }}
            >
              <td className="px-3 py-2 text-gray-600">{row.date}</td>
              <td className="px-3 py-2 text-right font-medium tabular-nums text-neutral-900">
                {fmtRand(row.value)}
              </td>
              <td
                className="px-3 py-2 text-xs"
                style={{ color: row.tx ? "#E4410D" : "#9CA3AF" }}
              >
                {row.tx ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LocalOffshoreBar({
  localPct,
  offshorePct,
}: {
  localPct: number;
  offshorePct: number;
}) {
  return (
    <div className="mt-4">
      <div className="flex justify-between text-[13px]">
        <span className="text-gray-500">
          Local{" "}
          <span className="font-semibold tabular-nums text-neutral-900">
            R 2 127 071
          </span>
        </span>
        <span className="text-gray-500">
          Offshore{" "}
          <span className="font-semibold tabular-nums text-neutral-900">
            R 904 890
          </span>
        </span>
      </div>
      <div className="mt-1.5 flex h-2 overflow-hidden rounded-full">
        <div
          style={{ width: `${localPct}%`, backgroundColor: "var(--ew-blue)" }}
        />
        <div
          style={{ width: `${offshorePct}%`, backgroundColor: "#F97415" }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-gray-400">
        <span>{localPct}% local</span>
        <span>{offshorePct}% offshore</span>
      </div>
    </div>
  );
}

import type { ManagedFilter } from "./tab-investments";

export function TabOverview({ managedFilter: _managedFilter }: { managedFilter: ManagedFilter }) {
  const [chartView, setChartView] = useState<"graph" | "table">("graph");

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Investment Portfolio — 2/3 width */}
      <div className="rounded-lg border p-5 lg:col-span-2" style={cardSurface}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <SectionHeading>Investment portfolio</SectionHeading>
            <div className="mt-0.5 text-[13px] text-gray-500">
              Market value · as at 06/10/2025
            </div>
          </div>
          <SegmentGroup>
            <SegmentButton
              active={chartView === "graph"}
              onClick={() => setChartView("graph")}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              Graph
            </SegmentButton>
            <SegmentButton
              active={chartView === "table"}
              onClick={() => setChartView("table")}
            >
              <Table2 className="h-3.5 w-3.5" />
              Table
            </SegmentButton>
          </SegmentGroup>
        </div>

        <div className="mt-1 text-[28px] font-semibold tabular-nums text-neutral-900">
          R 3 031 961
          <span className="ml-3 text-base font-normal text-gray-400">
            IRR 9.2%
          </span>
        </div>

        <div className="mt-4">
          {chartView === "graph" ? <InvestmentChart /> : <InvestmentTable />}
        </div>

        {chartView === "graph" && (
          <div className="mt-2 flex items-center gap-4 text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-1.5 w-4 rounded-full"
                style={{ backgroundColor: "#E4410D", opacity: 0.5 }}
              />
              Withdrawal
            </span>
          </div>
        )}

        <LocalOffshoreBar localPct={70} offshorePct={30} />
      </div>

      {/* Right column — Risk, Medical, Short-term stacked */}
      <div className="flex flex-col gap-4">
        {/* Risk snapshot */}
        <div className="rounded-lg border p-5" style={cardSurface}>
          <SectionHeading>Risk</SectionHeading>
          <div className="mt-0.5 text-[13px] text-gray-500">
            Total cover across captured policies
          </div>
          <ul className="mt-4 space-y-0">
            {RISK_COVER_SUMMARY.map((item) => (
              <li
                key={item.label}
                className={cn(
                  "flex items-baseline justify-between gap-3 border-b py-3 last:border-b-0"
                )}
                style={{ borderColor: "var(--ew-border)" }}
              >
                <span className="text-[13px] text-gray-500">{item.label}</span>
                <span className="text-right text-[15px] font-semibold tabular-nums text-neutral-900">
                  {item.value}
                </span>
              </li>
            ))}
            <li
              className="flex items-baseline justify-between gap-3 border-b py-3 last:border-b-0"
              style={{ borderColor: "var(--ew-border)" }}
            >
              <span className="text-[13px] text-gray-500">Dread disease</span>
              <span className="text-[15px] text-gray-400">—</span>
            </li>
          </ul>
          <div
            className="mt-4 rounded-md border px-3 py-2.5 text-[12px] text-gray-500"
            style={{ backgroundColor: "#F4F8FB", borderColor: "var(--ew-border)" }}
          >
            Liberty benefits not captured — total cover understated
          </div>
          <div
            className="mt-4 border-t pt-4"
            style={{ borderColor: "var(--ew-border)" }}
          >
            <div className="text-[13px] text-gray-500">Total premiums</div>
            <div className="text-xl font-semibold tabular-nums text-neutral-900">
              R 7 200{" "}
              <span className="text-sm font-normal text-gray-400">p.m.</span>
            </div>
          </div>
        </div>

        {/* Medical aid */}
        <div className="rounded-lg border p-5" style={cardSurface}>
          <SectionHeading>Medical aid</SectionHeading>
          <ul className="mt-3 space-y-0">
            {MEDICAL_ROWS.map((row) => (
              <li
                key={row.productId}
                className="flex items-start justify-between gap-3 border-b py-3 last:border-b-0"
                style={{ borderColor: "var(--ew-border)" }}
              >
                <div>
                  <div className="text-[13px] font-medium text-neutral-900">{row.name}</div>
                  <div className="mt-0.5 text-[12px] text-gray-400">{row.meta2}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[15px] font-semibold tabular-nums text-neutral-900">
                    {row.premium}
                  </div>
                  <div className="mt-1.5">
                    <StatusCard label={row.pill.label} tone={row.pill.tone} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Short-term insurance */}
        <div className="rounded-lg border p-5" style={cardSurface}>
          <SectionHeading>Short-term insurance</SectionHeading>
          <ul className="mt-3 space-y-0">
            {SHORT_TERM_ROWS.map((row) => (
              <li
                key={row.productId}
                className="flex items-start justify-between gap-3 border-b py-3 last:border-b-0"
                style={{ borderColor: "var(--ew-border)" }}
              >
                <div>
                  <div className="text-[13px] font-medium text-neutral-900">{row.name}</div>
                  <div className="mt-0.5 text-[12px] text-gray-400">{row.meta2}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[15px] font-semibold tabular-nums text-neutral-900">
                    {row.premium}
                  </div>
                  <div className="mt-1.5">
                    <StatusCard label={row.pill.label} tone={row.pill.tone} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
