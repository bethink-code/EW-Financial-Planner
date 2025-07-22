import React from "react";
import IncomeNeedsTable from "../components/income-needs/income-needs-table";

export default function IncomeNeeds() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Income Needs</h2>
        <p className="text-gray-600 mb-6">Manage income requirements and their capitalised values</p>
      </div>
      
      <IncomeNeedsTable />
    </div>
  );
}