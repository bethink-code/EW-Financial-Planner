import ResidueTable from "../components/residue/residue-table";
import { CalculatorHeader } from "@/components/ui/calculator-header";

export default function Residue() {
  return (
    <div className="w-full px-6 pb-6">
      <div className="w-fit">
        <CalculatorHeader>
          <ResidueTable />
        </CalculatorHeader>
      </div>
    </div>
  );
}
