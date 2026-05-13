import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrencyValue } from "@/lib/formatting";
import { OverviewDashboard } from "@/components/project/overview-dashboard";
import { ChartPanel } from "@/components/project/chart-panel";
import type { DelProjection, EstateBreakdownItem, PositionResult } from "@shared/del-calculations";

const PLAN_ID = 1;

type TabId = "overview" | "estate" | "dependants" | "capital" | "income";

function rand(n: number): string {
  return formatCurrencyValue(Math.round(n).toString());
}

function PositionBreakdown({
  items,
  position,
  format = "currency",
}: {
  items: EstateBreakdownItem[];
  position: PositionResult;
  format?: "currency" | "monthly";
}) {
  const provided = items.filter(i => i.side === "provided");
  const required = items.filter(i => i.side === "required");
  const fmt = (n: number) => (format === "monthly" ? `${rand(n)} / mo` : rand(n));

  const surplusBg = position.surplus >= 0 ? "var(--ew-positive-bg)" : "var(--ew-negative-bg)";
  const surplusColor = position.surplus >= 0 ? "var(--ew-positive-symbol)" : "var(--ew-negative-symbol)";

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-xs font-medium tracking-wide uppercase mb-2" style={{ color: "var(--ew-blue)" }}>Capital provided</h4>
        <div className="rounded-md overflow-hidden" style={{ backgroundColor: "var(--ew-row-tint)" }}>
          <table className="w-full text-sm">
            <tbody>
              {provided.map((item, idx) => (
                <tr key={item.label} style={{ backgroundColor: idx % 2 === 0 ? "white" : "var(--ew-row-tint)" }}>
                  <td className="py-2 px-3" style={{ color: "var(--ew-gray-900)" }}>{item.label}</td>
                  <td className="py-2 px-3 text-right tabular-nums" style={{ color: "var(--ew-gray-900)" }}>{fmt(item.amount)}</td>
                </tr>
              ))}
              <tr style={{ backgroundColor: "var(--ew-blue-tertiary-50)" }}>
                <td className="py-2.5 px-3 font-semibold" style={{ color: "var(--ew-primary-navy)" }}>Total provided</td>
                <td className="py-2.5 px-3 text-right tabular-nums font-bold" style={{ color: "var(--ew-primary-navy)" }}>{fmt(position.provided)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h4 className="text-xs font-medium tracking-wide uppercase mb-2" style={{ color: "var(--ew-blue)" }}>Capital required</h4>
        <div className="rounded-md overflow-hidden" style={{ backgroundColor: "var(--ew-row-tint)" }}>
          <table className="w-full text-sm">
            <tbody>
              {required.map((item, idx) => (
                <tr key={item.label} style={{ backgroundColor: idx % 2 === 0 ? "white" : "var(--ew-row-tint)" }}>
                  <td className="py-2 px-3" style={{ color: "var(--ew-gray-900)" }}>{item.label}</td>
                  <td className="py-2 px-3 text-right tabular-nums" style={{ color: "var(--ew-gray-900)" }}>{fmt(item.amount)}</td>
                </tr>
              ))}
              <tr style={{ backgroundColor: "var(--ew-blue-tertiary-50)" }}>
                <td className="py-2.5 px-3 font-semibold" style={{ color: "var(--ew-primary-navy)" }}>Total required</td>
                <td className="py-2.5 px-3 text-right tabular-nums font-bold" style={{ color: "var(--ew-primary-navy)" }}>{fmt(position.required)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="rounded-md p-4 flex items-baseline justify-between" style={{ backgroundColor: surplusBg }}>
        <div>
          <div className="text-xs font-medium tracking-wide uppercase" style={{ color: surplusColor }}>
            {position.surplus >= 0 ? "Surplus" : "Shortfall"}
          </div>
          <div className="text-xl font-bold tabular-nums" style={{ color: "var(--ew-primary-navy)" }}>
            {fmt(Math.abs(position.surplus))}
          </div>
        </div>
        <div className="text-2xl font-bold tabular-nums" style={{ color: surplusColor }}>
          {position.percentage.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}

export default function DELProjectStep() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [chartType, setChartType] = useState("gauge");

  const { data: projection, isLoading } = useQuery<DelProjection>({
    queryKey: [`/api/del-projection/${PLAN_ID}`],
    queryFn: () => fetch(`/api/del-projection/${PLAN_ID}`).then(r => r.json()),
  });

  if (isLoading || !projection) {
    return <div className="px-6 py-6 text-neutral-500">Loading projection…</div>;
  }

  const { estatePosition, dependantsPosition, totalCapitalPosition, incomePosition } = projection;

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "estate", label: "Estate position" },
    { id: "dependants", label: "Dependants position" },
    { id: "capital", label: "Total capital position" },
    { id: "income", label: "Income position" },
  ];

  return (
    <div className="w-full px-6 py-8 space-y-6">
      <div className="flex items-end justify-between pb-4 border-b" style={{ borderColor: "var(--ew-border)" }}>
        <div>
          <div className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--ew-gray-700)" }}>
            Death with estate liquidity &nbsp;&rsaquo;&nbsp; Projection
          </div>
          <h2 className="text-2xl font-bold mt-1 tracking-tight" style={{ color: "var(--ew-primary-navy)" }}>
            POSITION
          </h2>
        </div>
        {activeTab !== "overview" && (
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gauge">Gauge</SelectItem>
              <SelectItem value="bar">Bar</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Tab navigation — text tabs with underline, per UX principle. */}
      <div className="border-b border-neutral-200">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <OverviewDashboard
          data={{
            estatePosition,
            dependantsPosition,
            totalCapitalPosition,
            incomePosition,
          }}
          chartType={chartType}
        />
      )}

      {activeTab === "estate" && (
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-2">
            <ChartPanel title="Estate position" data={estatePosition} chartType={chartType} />
          </Card>
          <Card className="p-6">
            <h3 className="text-base font-semibold text-neutral-800 mb-4">Breakdown</h3>
            <PositionBreakdown items={estatePosition.breakdown} position={estatePosition} />
          </Card>
        </div>
      )}

      {activeTab === "dependants" && (
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-2">
            <ChartPanel title="Dependants position" data={dependantsPosition} chartType={chartType} />
          </Card>
          <Card className="p-6">
            <h3 className="text-base font-semibold text-neutral-800 mb-4">Breakdown</h3>
            <PositionBreakdown items={dependantsPosition.breakdown} position={dependantsPosition} />
          </Card>
        </div>
      )}

      {activeTab === "capital" && (
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-2">
            <ChartPanel title="Total capital position" data={totalCapitalPosition} chartType={chartType} />
          </Card>
          <Card className="p-6">
            <h3 className="text-base font-semibold text-neutral-800 mb-4">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-neutral-600">Estate capital provided</span><span className="tabular-nums">{rand(estatePosition.provided)}</span></div>
              <div className="flex justify-between"><span className="text-neutral-600">Dependants capital provided</span><span className="tabular-nums">{rand(dependantsPosition.provided)}</span></div>
              <div className="flex justify-between font-semibold border-t border-neutral-200 pt-2"><span>Total capital provided</span><span className="tabular-nums">{rand(totalCapitalPosition.provided)}</span></div>
              <div className="flex justify-between"><span className="text-neutral-600">Estate capital required</span><span className="tabular-nums">{rand(estatePosition.required)}</span></div>
              <div className="flex justify-between"><span className="text-neutral-600">Dependants capital required</span><span className="tabular-nums">{rand(dependantsPosition.required)}</span></div>
              <div className="flex justify-between font-semibold border-t border-neutral-200 pt-2"><span>Total capital required</span><span className="tabular-nums">{rand(totalCapitalPosition.required)}</span></div>
              <div className={`flex justify-between font-semibold p-3 rounded ${totalCapitalPosition.surplus >= 0 ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-900"}`}>
                <span>{totalCapitalPosition.surplus >= 0 ? "Net capital surplus" : "Net capital shortfall"}</span>
                <span className="tabular-nums">{rand(Math.abs(totalCapitalPosition.surplus))}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "income" && (
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-2">
            <ChartPanel title="Income position" data={incomePosition} chartType={chartType} />
          </Card>
          <Card className="p-6">
            <h3 className="text-base font-semibold text-neutral-800 mb-4">Monthly breakdown</h3>
            <PositionBreakdown items={incomePosition.breakdown} position={incomePosition} format="monthly" />
          </Card>
        </div>
      )}
    </div>
  );
}
