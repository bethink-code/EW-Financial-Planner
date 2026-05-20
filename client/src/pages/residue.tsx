import ResidueTable from "../components/residue/residue-table";
import { CalculatorHeader } from "@/components/ui/calculator-header";

export default function Residue() {
  return (
    <div className="">
      <div className="w-full px-6 py-6">
        {/* Header and Table without Summary - Compact Card */}
        <div className="w-fit">
          <CalculatorHeader className="mb-6">
            {/* Table with compact layout */}
            <div className="table-container-wrapper">
              <ResidueTable />
            </div>
          </CalculatorHeader>
        </div>
      </div>
    </div>
  );
}
