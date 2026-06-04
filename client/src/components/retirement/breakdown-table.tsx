import { formatCurrencyValue } from "@/lib/formatting";
import { type RetirementProjection } from "@shared/retirement-calculations";

const rand = (n: number) => formatCurrencyValue(Math.round(n).toString());

interface BreakdownItem {
  description: string;
  capitalAtRetirement: number;
  valueInCurrentTerms: number;
  key: string;
}

interface BreakdownGroup {
  category: string;
  capitalAtRetirement: number;
  valueInCurrentTerms: number;
  items: BreakdownItem[];
}

/**
 * Group the projection by category, each with its own subtotal and line items.
 * Retirement funds + defined-benefit funds are intentionally excluded — they
 * feed Surplus capital only, so the advisor reads them off the rail, not here.
 * The breakdown is for seeing the line items behind the categories that carry
 * detail: voluntary investments, future inflows, and the income/lump-sum needs.
 */
function buildGroups(projection: RetirementProjection): BreakdownGroup[] {
  const mk = (
    rows: {
      id: number;
      description: string;
      capitalAtRetirement: number;
      valueInCurrentTerms: number;
    }[],
    category: string,
    prefix: string
  ): BreakdownGroup => {
    const items = rows.map((r) => ({
      description: r.description,
      capitalAtRetirement: r.capitalAtRetirement,
      valueInCurrentTerms: r.valueInCurrentTerms,
      key: `${prefix}-${r.id}`,
    }));
    return {
      category,
      capitalAtRetirement: items.reduce((s, i) => s + i.capitalAtRetirement, 0),
      valueInCurrentTerms: items.reduce((s, i) => s + i.valueInCurrentTerms, 0),
      items,
    };
  };

  return [
    mk(projection.voluntaryInvestments, "Voluntary investments", "vi"),
    mk(projection.futureInflows, "Future inflows", "fi"),
    mk(projection.lumpSumNeeds, "Lump sum needs", "ls"),
    mk(projection.incomeRequired, "Income required", "ir"),
    mk(projection.incomeProvided, "Income provided", "ip"),
  ].filter((g) => g.items.length > 0);
}

// Shared fixed column widths so every category table aligns with the legend.
const Cols = () => (
  <colgroup>
    <col />
    <col style={{ width: 150 }} />
    <col style={{ width: 150 }} />
  </colgroup>
);

/** Per-category breakdown: each category is its own small table — a subtotal
 *  header with its line items underneath — the detail behind the Project-step
 *  figures. */
export function BreakdownTab({
  projection,
}: {
  projection: RetirementProjection;
}) {
  const groups = buildGroups(projection);

  if (groups.length === 0) {
    return (
      <p className="px-1 text-xs" style={{ color: "var(--ew-gray-700)" }}>
        No entries yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Column legend — labels the two value columns once for all groups. */}
      <table className="w-full table-fixed text-xs">
        <Cols />
        <thead>
          <tr style={{ color: "var(--ew-gray-700)" }}>
            <th />
            <th className="px-3 pb-1 text-right font-medium">Current value</th>
            <th className="px-3 pb-1 text-right font-medium">At retirement</th>
          </tr>
        </thead>
      </table>

      {groups.map((g) => (
        <CategorySection key={g.category} group={g} />
      ))}
    </div>
  );
}

function CategorySection({ group }: { group: BreakdownGroup }) {
  const navy = "var(--ew-primary-navy)";
  const itemGrey = "var(--ew-gray-900)";
  return (
    <table className="w-full table-fixed text-xs">
      <Cols />
      <tbody>
        {/* Total row — the dominant read: tinted band + bold navy. */}
        <tr style={{ backgroundColor: "var(--ew-row-tint)" }}>
          <td className="px-3 py-2 text-left font-bold" style={{ color: navy }}>
            {group.category}
          </td>
          <td
            className="px-3 py-2 text-right font-bold tabular-nums"
            style={{ color: navy }}
          >
            {rand(group.valueInCurrentTerms)}
          </td>
          <td
            className="px-3 py-2 text-right font-bold tabular-nums"
            style={{ color: navy }}
          >
            {rand(group.capitalAtRetirement)}
          </td>
        </tr>
        {/* Line items — lighter weight, subordinate to the total. */}
        {group.items.map((item) => (
          <tr key={item.key}>
            <td className="px-3 py-1.5 truncate" style={{ color: itemGrey }}>
              {item.description || "(untitled)"}
            </td>
            <td
              className="px-3 py-1.5 text-right tabular-nums"
              style={{ color: itemGrey }}
            >
              {rand(item.valueInCurrentTerms)}
            </td>
            <td
              className="px-3 py-1.5 text-right tabular-nums"
              style={{ color: itemGrey }}
            >
              {rand(item.capitalAtRetirement)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
