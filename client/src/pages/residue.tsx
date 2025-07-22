import React from "react";
import ResidueTable from "../components/residue/residue-table";

export default function Residue() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Residue</h2>
        <p className="text-gray-600 mb-6">Manage residue distribution among entities and registered charities</p>
      </div>
      
      <ResidueTable />
    </div>
  );
}