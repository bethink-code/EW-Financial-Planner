import { formatCurrencyValue } from "@/lib/formatting";
import { type RetirementProjection } from "@shared/retirement-calculations";

const rand = (n: number) => formatCurrencyValue(Math.round(n).toString());

interface FlatRow {
  category: string;
  description: string;
  capitalAtRetirement: number;
  valueInCurrentTerms: number;
  key: string;
}

function buildFlatRows(projection: RetirementProjection): FlatRow[] {
  const section = (
    rows: {
      id: number;
      description: string;
      capitalAtRetirement: number;
      valueInCurrentTerms: number;
    }[],
    category: string,
    prefix: string
  ): FlatRow[] =>
    rows.map((r) => ({
      category,
      description: r.description,
      capitalAtRetirement: r.capitalAtRetirement,
      valueInCurrentTerms: r.valueInCurrentTerms,
      key: `${prefix}-${r.id}`,
    }));

  return [
    ...section(projection.retirementFunds, "Retirement funds", "rf"),
    ...section(projection.definedBenefitFunds, "Defined benefit", "db"),
    ...section(projection.voluntaryInvestments, "Voluntary", "vi"),
    ...section(projection.futureInflows, "Future inflow", "fi"),
    ...section(projection.lumpSumNeeds, "Lump sum need", "ls"),
    ...section(projection.incomeRequired, "Income required", "ir"),
    ...section(projection.incomeProvided, "Income provided", "ip"),
  ];
}

/** Per-vehicle breakdown table — every entry across the Build sub-tabs, with
 *  its capital at retirement and today's-terms value. Kept from the previous
 *  Project step unchanged. */
export function BreakdownTab({
  projection,
}: {
  projection: RetirementProjection;
}) {
  const flatRows = buildFlatRows(projection);
  return (
    <div className="rounded-md overflow-hidden">
      <table className="w-full text-xs no-row-borders">
        <thead>
          <tr
            style={{
              color: "var(--ew-gray-700)",
              backgroundColor: "var(--ew-row-tint)",
            }}
          >
            <th className="px-3 py-2 text-left font-medium uppercase tracking-wide w-[140px]">
              Category
            </th>
            <th className="px-3 py-2 text-left font-medium uppercase tracking-wide">
              Description
            </th>
            <th className="px-3 py-2 text-right font-medium uppercase tracking-wide w-[140px]">
              At retirement
            </th>
            <th className="px-3 py-2 text-right font-medium uppercase tracking-wide w-[140px]">
              Today's terms
            </th>
          </tr>
        </thead>
        <tbody>
          {flatRows.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="px-3 py-3 text-xs text-center"
                style={{ color: "var(--ew-gray-700)" }}
              >
                No entries yet.
              </td>
            </tr>
          ) : (
            flatRows.map((r, idx) => (
              <tr
                key={r.key}
                style={{
                  backgroundColor:
                    idx % 2 === 0 ? "white" : "var(--ew-row-tint)",
                }}
              >
                <td
                  className="px-3 py-1.5 text-xs uppercase tracking-wide"
                  style={{ color: "var(--ew-blue)" }}
                >
                  {r.category}
                </td>
                <td
                  className="px-3 py-1.5 truncate"
                  style={{ color: "var(--ew-primary-navy)" }}
                >
                  {r.description || "(untitled)"}
                </td>
                <td
                  className="px-3 py-1.5 text-right tabular-nums font-medium"
                  style={{ color: "var(--ew-gray-900)" }}
                >
                  {rand(r.capitalAtRetirement)}
                </td>
                <td
                  className="px-3 py-1.5 text-right tabular-nums"
                  style={{ color: "var(--ew-gray-700)" }}
                >
                  {rand(r.valueInCurrentTerms)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
