import React from "react";
import DefinedBenefitFundsTable from "../components/defined-benefit-funds/defined-benefit-funds-table";

export default function DefinedBenefitFunds() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Defined Benefit Funds</h2>
        <p className="text-gray-600 mb-6">Manage defined benefit pension funds and their details</p>
      </div>
      
      <DefinedBenefitFundsTable />
    </div>
  );
}