import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart2, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RISK_COVER_SUMMARY } from "./data-risk";
import { SectionHeading } from "./primitives";
import { cardSurface } from "./listings";
import { SegmentButton, SegmentGroup } from "./view";

/**
 * Cooked quarterly portfolio value — Ben Meander demo, Jan 2021 – Oct 2025.
 * Total investments = R 3 031 961 at 06/10/2025.
 */
const CHART_DATA = [
  { date: "Jan 2021", value: 2_400_000 },
  { date: "Apr 2021", value: 2_520_000 },
  { date: "Jul 2021", value: 2_680_000 },
  { date: "Oct 2021", value: 2_750_000 },
  { date: "Jan 2022", value: 2_820_000 },
  { date: "Apr 2022", value: 2_910_000 },
  { date: "Jul 2022", value: 2_650_000 },
  { date: "Oct 2022", value: 2_780_000 },
  { date: "Jan 2023", value: 2_900_000 },
  { date: "Apr 2023", value: 3_050_000 },
  { date: "Jul 2023", value: 3_200_000 },
  { date: "Oct 2023", value: 3_100_000 },
  { date: "Jan 2024", value: 2_980_000 },
  { date: "Apr 2024", value: 3_050_000 },
  { date: "Jul 2024", value: 2_900_000 },
  { date: "Oct 2024", value: 3_020_000 },
  { date: "Jan 2025", value: 3_100_000 },
  { date: "Apr 2025", value: 3_000_000 },
  { date: "Jul 2025", value: 3_050_000 },
  { date: "Oct 2025", value: 3_031_961 },
];

function fmtRand(v: number) {
  return "R " + Math.round(v).toLocaleString("en-US").replace(/,/g, " ");
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-md border bg-white px-3 py-2 text-[13px] shadow-md"
      style={{ borderColor: "var(--ew-border)" }}
    >
      <div className="text-gray-500">{label}</div>
      <div className="font-semibold tabular-nums text-neutral-900">
        {fmtRand(payload[0].value)}
      </div>
      <div className="text-xs text-gray-400">IRR 9.2%</div>
    </div>
  );
}

function InvestmentChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart
        data={CHART_DATA}
        margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F97415" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#F97415" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          tickLine={false}
          axisLine={false}
          interval={3}
        />
        <YAxis
          hide
          domain={["auto", "auto"]}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#F97415"
          strokeWidth={2}
          fill="url(#portfolioFill)"
          dot={false}
          activeDot={{ r: 4, fill: "#F97415", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function InvestmentTable() {
  return (
    <div className="max-h-56 overflow-y-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr style={{ backgroundColor: "var(--ew-blue-tertiary-50)" }}>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
              Period
            </th>
            <th className="px-3 py-2 text-right text-xs font-medium text-gray-600">
              Value
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
          style={{
            width: `${localPct}%`,
            backgroundColor: "var(--ew-blue)",
          }}
        />
        <div
          style={{ width: `${offshorePct}%`, backgroundColor: "#F97415" }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-gray-400">
        <span>{localPct}%</span>
        <span>{offshorePct}%</span>
      </div>
    </div>
  );
}

export function TabOverview() {
  const [chartView, setChartView] = useState<"graph" | "table">("graph");

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Investment Portfolio — 2/3 width */}
      <div
        className="rounded-lg border p-5 lg:col-span-2"
        style={cardSurface}
      >
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

        <LocalOffshoreBar localPct={70} offshorePct={30} />
      </div>

      {/* Risk snapshot — 1/3 width */}
      <div
        className="rounded-lg border p-5"
        style={cardSurface}
      >
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
        <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--ew-border)" }}>
          <div className="text-[13px] text-gray-500">Total premiums</div>
          <div className="text-xl font-semibold tabular-nums text-neutral-900">
            R 7 200{" "}
            <span className="text-sm font-normal text-gray-400">p.m.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
