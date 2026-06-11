import {
  FundList,
  KvGrid,
  Level3Block,
  NoteBlock,
  PanelButton,
  PanelField,
  PanelSection,
  panelInputClass,
} from "./panel-shell";

/**
 * Level 2 product snapshot panels — one per product row. Content from the
 * concept brief; the risk/medical snapshots beyond Liberty are thin key-facts
 * panels so every row in the deck opens its own product, not a stand-in.
 */

export function AbsaPanel() {
  return (
    <>
      <PanelSection title="Key facts">
        <KvGrid
          rows={[
            { k: "Category", v: "Direct Shares" },
            { k: "Supplier", v: "ABSA Stockbrokers" },
            { k: "Current value", v: "R 460 000 · 06/10/2025", num: true },
            { k: "Owner", v: "B Meander (100%)" },
            { k: "Purpose", v: "Not set", tone: "warn" },
            { k: "Status", v: "Managed · In force since 01/10/2025" },
          ]}
        />
      </PanelSection>
      <PanelSection title="Funds">
        <FundList
          items={[
            { label: "Alexander Forbes Grp Hldgs", value: "R 100 000" },
            { label: "MTN Group Ltd Shares", value: "R 100 000" },
            { label: "Vodacom Group Ltd", value: "R 260 000" },
          ]}
        />
      </PanelSection>
      <PanelSection title="Fees">
        <p className="text-[13px] text-gray-500">
          Ongoing fees not configured — all rows at 0%.{" "}
          <span className="font-medium" style={{ color: "var(--ew-blue)" }}>
            Configure fees →
          </span>
        </p>
      </PanelSection>
      <Level3Block />
    </>
  );
}

export function PensionPanel() {
  return (
    <>
      <PanelSection title="Key facts">
        <KvGrid
          rows={[
            { k: "Category", v: "Pension Fund" },
            { k: "Supplier", v: "Unknown" },
            {
              k: "Current value",
              v: "R 980 000 · 08/04/2020",
              tone: "bad",
              num: true,
            },
            { k: "Contribution", v: "R 7 500 p.m.", num: true },
            { k: "Owner", v: "B Meander" },
          ]}
        />
      </PanelSection>
      <NoteBlock tone="bad">
        <span className="font-semibold">Valuation 6 years old.</span> Everything
        this page says about Ben's retirement position is built on this number.
      </NoteBlock>
      <PanelSection title="Quick update">
        <div className="space-y-3">
          <PanelField label="New value (ZAR)">
            <input type="text" placeholder="0.00" className={panelInputClass} />
          </PanelField>
          <PanelField label="Value date">
            <input
              type="text"
              defaultValue="10/06/2026"
              className={panelInputClass}
            />
          </PanelField>
          <PanelButton>Save value</PanelButton>
        </div>
      </PanelSection>
      <Level3Block />
    </>
  );
}

export function MomentumPanel() {
  return (
    <>
      <PanelSection title="Key facts">
        <KvGrid
          rows={[
            { k: "Category", v: "Offshore Investment" },
            { k: "Supplier", v: "Momentum Wealth Intl" },
            {
              k: "Current value",
              v: "R 1 091 961 · 08/04/2020",
              tone: "bad",
              num: true,
            },
            { k: "Fund", v: "Sanlam Global Best Ideas (A)" },
          ]}
        />
      </PanelSection>
      <NoteBlock tone="bad">
        Valuation 6 years old — update before the review.
      </NoteBlock>
      <Level3Block />
    </>
  );
}

export function UtPanel() {
  return (
    <>
      <PanelSection title="Key facts">
        <KvGrid
          rows={[
            { k: "Category", v: "Unit Trust Portfolio" },
            {
              k: "Current value",
              v: "R 500 000 · 16/01/2023",
              tone: "warn",
              num: true,
            },
            { k: "Fund", v: "Coronation Balanced Plus A" },
          ]}
        />
      </PanelSection>
      <Level3Block />
    </>
  );
}

export function LibertyPanel() {
  return (
    <>
      <PanelSection title="Key facts">
        <KvGrid
          rows={[
            { k: "Category", v: "Risk Product" },
            { k: "Supplier", v: "Liberty Group Limited" },
            { k: "Reference", v: "L123456789" },
            { k: "Premium", v: "R 3 100 p.m.", num: true },
            { k: "Beneficiary", v: "Estate" },
          ]}
        />
      </PanelSection>
      <NoteBlock tone="warn">
        No life assured loaded — benefits can't be captured for this policy.
      </NoteBlock>
      <Level3Block />
    </>
  );
}

export function MyriadPanel() {
  return (
    <>
      <PanelSection title="Key facts">
        <KvGrid
          rows={[
            { k: "Category", v: "Risk Product" },
            { k: "Supplier", v: "Momentum Myriad" },
            { k: "Reference", v: "M123456789" },
            { k: "Premium", v: "R 2 100 p.m.", num: true },
            { k: "Beneficiary", v: "Shadow Meander (spouse)" },
            { k: "Status", v: "In force" },
          ]}
        />
      </PanelSection>
      <Level3Block />
    </>
  );
}

export function OldMutualPanel() {
  return (
    <>
      <PanelSection title="Key facts">
        <KvGrid
          rows={[
            { k: "Category", v: "Risk Product" },
            { k: "Supplier", v: "Old Mutual Life" },
            { k: "Reference", v: "OM123456789" },
            { k: "Premium", v: "R 2 000 p.m.", num: true },
            { k: "Beneficiary", v: "Fudge Meander (child)" },
            { k: "Status", v: "In force" },
          ]}
        />
      </PanelSection>
      <Level3Block />
    </>
  );
}

export function DiscoveryPanel() {
  return (
    <>
      <PanelSection title="Key facts">
        <KvGrid
          rows={[
            { k: "Category", v: "Medical Aid" },
            { k: "Supplier", v: "Discovery Health" },
            { k: "Plan", v: "Classic Delta Saver" },
            { k: "Premium", v: "R 6 700 p.m.", num: true },
            { k: "Status", v: "In force" },
          ]}
        />
      </PanelSection>
      <Level3Block />
    </>
  );
}

export function SantamPanel() {
  return (
    <>
      <PanelSection title="Key facts">
        <KvGrid
          rows={[
            { k: "Category", v: "Short Term Insurance" },
            { k: "Supplier", v: "Santam" },
            { k: "Premium", v: "R 3 400 p.m.", num: true },
            { k: "Status", v: "In force" },
          ]}
        />
      </PanelSection>
      <Level3Block />
    </>
  );
}
