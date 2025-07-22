import React from "react";
import VoluntaryInvestmentsTable from "../components/voluntary-investments/voluntary-investments-table";

export default function VoluntaryInvestments() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Voluntary Investments</h2>
        <p className="text-gray-600 mb-6">Manage voluntary investments and their ownership details</p>
      </div>
      
      <VoluntaryInvestmentsTable />
    </div>
  );
}