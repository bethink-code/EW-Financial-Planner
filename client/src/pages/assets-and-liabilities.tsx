import React from "react";
import AssetsAndLiabilitiesTable from "../components/assets-and-liabilities/assets-and-liabilities-table";

export default function AssetsAndLiabilities() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Assets and Liabilities</h2>
        <p className="text-gray-600 mb-6">Manage assets and liabilities by category with ownership details</p>
      </div>
      
      <AssetsAndLiabilitiesTable />
    </div>
  );
}