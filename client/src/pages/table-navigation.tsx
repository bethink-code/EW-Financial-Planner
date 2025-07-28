import React from 'react';
import { Link } from 'wouter';

export default function TableNavigation() {
  const tables = [
    {
      category: "Main Calculator Tables",
      items: [
        { name: "Assurance Table", path: "/assurance", description: "Life insurance policies with owners/beneficiaries" },
        { name: "Retirement Funds Table", path: "/new-retirement-funds", description: "Retirement fund management with multiple sections" },
        { name: "Defined Benefit Funds Table", path: "/defined-benefit-funds", description: "Pension fund details and calculations" },
        { name: "Voluntary Investments Table", path: "/voluntary-investments", description: "Investment portfolio management" },
        { name: "Assets-and-Liabilities Table", path: "/assets-and-liabilities", description: "Combined assets/liabilities view" },
        { name: "Income Needs Table", path: "/income-needs", description: "Income requirement calculations" },
        { name: "Income Provisions Table", path: "/income-provisions", description: "Income provision planning" },
        { name: "Residue Table", path: "/residue", description: "Estate residue calculations" },
        { name: "Lump Sum Bequests Table", path: "/lump-sum-bequests", description: "Lump sum bequest planning" },
        { name: "Additional Estate Duty Items Table", path: "/additional-estate-duty-items", description: "Estate duty calculations" }
      ]
    },
    {
      category: "Separate Assets/Liabilities Tables",
      items: [
        { name: "Assets Table (Standalone)", path: "/assets", description: "Standalone assets management" },
        { name: "Liabilities Table (Standalone)", path: "/liabilities", description: "Standalone liabilities management" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Table Testing Navigation</h1>
          <p className="text-gray-600">Direct access to all 13 distinct tables in the system</p>
        </div>

        {/* Table Categories */}
        {tables.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              {category.category}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.items.map((table, tableIndex) => (
                <Link key={tableIndex} href={table.path}>
                  <div className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-4 cursor-pointer group">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 mb-2">
                      {table.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {table.description}
                    </p>
                    <div className="text-xs text-blue-500 font-medium">
                      Test Table →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Quick Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Table Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-2xl font-bold text-blue-600">10</div>
              <div className="text-gray-600">Main Calculator Tables</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">2</div>
              <div className="text-gray-600">Standalone Tables</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-gray-600">Total Distinct Tables</div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h4 className="font-medium text-blue-800 mb-2">Testing Notes:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• All tables have standardized [+] icons in Actions header columns</li>
            <li>• Retirement Funds includes both Input Table and Flows Table modes</li>
            <li>• Assets-and-Liabilities is the combined view, Assets/Liabilities are separate</li>
            <li>• Each table supports full CRUD operations with proper validation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}