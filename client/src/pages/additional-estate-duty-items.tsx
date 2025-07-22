import React from "react";
import AdditionalEstateDutyItemsTable from "../components/additional-estate-duty-items/additional-estate-duty-items-table";

export default function AdditionalEstateDutyItems() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Estate Duty Items</h2>
        <p className="text-gray-600 mb-6">Manage additional estate duty items with deduction and joint estate options</p>
      </div>
      
      <AdditionalEstateDutyItemsTable />
    </div>
  );
}