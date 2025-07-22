import React from "react";
import IncomeProvisionsTable from "../components/income-provisions/income-provisions-table";

export default function IncomeProvisions() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Income Provisions</h2>
        <p className="text-gray-600 mb-6">Manage income provisions with tax calculations and capital shortfall requirements</p>
      </div>
      
      <IncomeProvisionsTable />
    </div>
  );
}