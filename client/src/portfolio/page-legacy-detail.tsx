import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, Copy, RotateCcw, Trash2 } from "lucide-react";
import { CustomTabs } from "@/components/ui/custom-tabs";
import { SummaryBand, SummaryTile } from "@/components/common/summary-band";
import { Button } from "@/components/ui/button";

const L_TEAL = "#014C66";
const L_BORDER = "#BFD9E4";

const PRODUCT_TABS = [
  { id: "Details", label: "Details" },
  { id: "Roles", label: "Roles" },
  { id: "Benefits", label: "Benefits" },
  { id: "Values", label: "Values" },
  { id: "Transactions", label: "Transactions" },
  { id: "Structure", label: "Structure" },
  { id: "Status", label: "Status" },
  { id: "Ongoing fees", label: "Ongoing fees" },
  { id: "Fees on premiums", label: "Fees on premiums" },
  { id: "Commspace", label: "Commspace" },
  { id: "Asset split", label: "Asset split" },
];

function LegacyField({
  label,
  value,
  shaded,
}: {
  label: string;
  value?: string;
  shaded?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2 py-1">
      <div
        className="w-44 shrink-0 text-right text-[13px] font-semibold"
        style={{ color: L_TEAL }}
      >
        {label}
      </div>
      <div
        className="min-w-0 flex-1 max-w-xs rounded px-2 py-0.5 text-[13px]"
        style={{
          backgroundColor: shaded ? "#EEF4F8" : "transparent",
          color: "#1C2B33",
        }}
      >
        {value ?? ""}
      </div>
    </div>
  );
}

function LegacyInput({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-baseline gap-2 py-1">
      <div
        className="w-44 shrink-0 text-right text-[13px] font-semibold"
        style={{ color: L_TEAL }}
      >
        {label}
      </div>
      <input
        readOnly
        defaultValue={value ?? ""}
        className="rounded border px-2 py-0.5 text-[13px] w-48"
        style={{ borderColor: "#BDBDBD", color: "#1C2B33" }}
      />
    </div>
  );
}

function LegacyDropdown({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline gap-2 py-1">
      <div
        className="w-44 shrink-0 text-right text-[13px] font-semibold"
        style={{ color: L_TEAL }}
      >
        {label}
      </div>
      <select
        className="rounded border px-2 py-0.5 text-[13px] w-64"
        style={{ borderColor: "#BDBDBD", color: "#1C2B33" }}
        disabled
        defaultValue={value ?? ""}
      >
        <option>{value ?? "[ -- Please select an entry -- ]"}</option>
      </select>
    </div>
  );
}

function DetailsTabAbsa() {
  return (
    <div>
      {/* Save / Cancel */}
      <div className="mb-4 flex gap-2">
        <button
          className="rounded px-4 py-1.5 text-sm font-semibold text-white"
          style={{ backgroundColor: L_TEAL }}
        >
          Save
        </button>
        <button
          className="rounded border px-4 py-1.5 text-sm"
          style={{ borderColor: L_BORDER, color: "#51656F" }}
        >
          Cancel
        </button>
      </div>

      {/* Two-column form */}
      <div className="grid grid-cols-2 gap-x-12">
        <div>
          <LegacyField label="Product category" value="Direct Shares" shaded />
          <LegacyField label="Description" value="ABSA Share portfolio" shaded />
          <LegacyDropdown label="Product purpose" />
          <LegacyInput label="Reference number" />
          <LegacyInput label="Astute package number" />
          <LegacyInput label="External ID" />
          <LegacyField label="Supplier" value="ABSA Stockbrokers" shaded />
          <LegacyDropdown label="Commspace category" />
          <LegacyDropdown label="Source of funds" />
        </div>
        <div>
          <LegacyInput label="Inception date" value="01/10/2025" />
          <div className="ml-46 pl-2 text-[11px] text-gray-400 mb-2">dd/mm/yyyy</div>
          <LegacyInput label="Maturity date" />
          <div className="pl-2 text-[11px] text-gray-400 mb-2 ml-44">dd/mm/yyyy</div>
          <LegacyInput label="Anniversary date" />
          <div className="pl-2 text-[11px] text-gray-400 mb-2 ml-44">dd/mm</div>
        </div>
      </div>

      {/* Footer metadata */}
      <div
        className="mt-6 border-t pt-4 flex justify-between text-[12px]"
        style={{ borderColor: L_BORDER, color: "#51656F" }}
      >
        <span>Managed since 01/10/2025.</span>
        <span>In force since 01/10/2025.</span>
      </div>

      <div className="mt-4 border-t pt-3 flex gap-6 text-[11px]" style={{ borderColor: L_BORDER, color: "#9CA3AF" }}>
        <span><span className="font-medium text-gray-600">Portfolio entry ID</span> &nbsp;7a60ef52-fc5d-4757-95dd-d10f15f1e717</span>
        <span><span className="font-medium text-gray-600">Created by</span> &nbsp;Support Support</span>
        <span><span className="font-medium text-gray-600">Created on</span> &nbsp;07/10/2025 11:55:09</span>
      </div>

      {/* Save / Cancel (bottom) */}
      <div className="mt-4 flex gap-2">
        <button
          className="rounded px-4 py-1.5 text-sm font-semibold text-white"
          style={{ backgroundColor: L_TEAL }}
        >
          Save
        </button>
        <button
          className="rounded border px-4 py-1.5 text-sm"
          style={{ borderColor: L_BORDER, color: "#51656F" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function TabPlaceholder({ tab }: { tab: string }) {
  return (
    <div className="py-16 text-center text-sm" style={{ color: "#9CA3AF" }}>
      <div className="mb-1 font-medium" style={{ color: "#51656F" }}>{tab}</div>
      Content served by existing EW system
    </div>
  );
}

export default function LegacyProductDetail() {
  const [activeTab, setActiveTab] = useState("Details");

  return (
    <div className="px-6 pt-4" style={{ backgroundColor: "#F2F7FA", minHeight: "100vh" }}>

      {/* ── Zone 1 · Context band — where you came from ── */}
      <div className="mb-4 rounded-lg border border-gray-200 bg-white px-6 py-4 shadow-sm">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500">
          Portfolio
        </span>
        <Link
          href="/portfolio"
          className="flex w-fit items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--ew-blue)" }}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to portfolio
        </Link>
      </div>

      {/* ── Zone 2 · Product sub-tabs ── */}
      <CustomTabs
        tabs={PRODUCT_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-0"
      />

      {/* ── Card frame — merges with the tab strip above (Mode B: item detail) ── */}
      <div className="-mt-px overflow-hidden rounded-b-lg border border-neutral-200 bg-white shadow-sm">

        {/* Zone 3 · Summary band — product KPIs (constant across sub-tabs) */}
        <div className="border-b border-neutral-200">
          <SummaryBand firstColIsSidebar={false} tileFit="hug">
            <SummaryTile
              variant="accent"
              label="Current value"
              value="R 460 000"
              subValue="Valued 06/10/2025"
            />
            <SummaryTile label="IRR" value="9.5%" subValue="Since inception" />
            <SummaryTile
              label="Category"
              value="Direct shares"
              subValue="ABSA Stockbrokers"
            />
          </SummaryBand>
        </div>

        {/* Zone 4 · Item toolbar — product title + item actions */}
        <div className="flex items-center gap-3 border-b border-neutral-200 px-5 py-4">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--ew-primary-navy)" }}
          >
            ABSA Share portfolio
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" className="btn-secondary gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="btn-secondary gap-1.5">
              <Copy className="h-3.5 w-3.5" />
              Duplicate
            </Button>
            <Button variant="outline" size="sm" className="btn-secondary gap-1.5">
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>

        {/* Zone 5 · Content pane — legacy system's territory */}
        <div className="p-6" style={{ minHeight: 400 }}>
          {activeTab === "Details" ? (
            <DetailsTabAbsa />
          ) : (
            <TabPlaceholder tab={activeTab} />
          )}
        </div>
      </div>
    </div>
  );
}
