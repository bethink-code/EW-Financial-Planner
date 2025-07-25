import React from 'react';

export default function RoughTableDemo() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Retirement Funds - Rough Table Structure</h2>
      
      <table className="border border-gray-300 w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-center" colSpan={1}>ACTIONS</th>
            <th className="border border-gray-300 p-2 text-center" colSpan={2}>OVERVIEW</th>
            <th className="border border-gray-300 p-2 text-center" colSpan={4}>UNAPPROVED LIFE COVER</th>
            <th className="border border-gray-300 p-2 text-center" colSpan={4}>MONTHLY DEATH BENEFIT</th>
            <th className="border border-gray-300 p-2 text-center" colSpan={3}>APPROVED LIFE COVER</th>
            <th className="border border-gray-300 p-2 text-center" colSpan={8}>FUND VALUE BENEFICIARIES</th>
          </tr>
          <tr className="bg-gray-50">
            {/* Actions */}
            <th className="border border-gray-300 p-1 text-xs">Actions</th>
            
            {/* Overview */}
            <th className="border border-gray-300 p-1 text-xs">Description<br/>(Editable/Text)</th>
            <th className="border border-gray-300 p-1 text-xs">Owner<br/>(Multiple Add/Delete)</th>
            
            {/* Unapproved Life Cover */}
            <th className="border border-gray-300 p-1 text-xs">Cover Amount<br/>(Editable/Currency)</th>
            <th className="border border-gray-300 p-1 text-xs">Beneficiary<br/>(Multiple Add/Delete)</th>
            <th className="border border-gray-300 p-1 text-xs">Percentage Split<br/>(Editable/%)</th>
            <th className="border border-gray-300 p-1 text-xs">Cover Split<br/>(Calculated)</th>
            
            {/* Monthly Death Benefit */}
            <th className="border border-gray-300 p-1 text-xs">Monthly Income<br/>(Editable/Currency)</th>
            <th className="border border-gray-300 p-1 text-xs">Checkbox</th>
            <th className="border border-gray-300 p-1 text-xs">Term Years<br/>(Editable/Years)</th>
            <th className="border border-gray-300 p-1 text-xs">Increase %<br/>(Editable/%)</th>
            
            {/* Approved Life Cover */}
            <th className="border border-gray-300 p-1 text-xs">Cover<br/>(Editable/Currency)</th>
            <th className="border border-gray-300 p-1 text-xs">Fund Value<br/>(Editable/Currency)</th>
            <th className="border border-gray-300 p-1 text-xs">Fund Value at Death<br/>(Calculated)</th>
            
            {/* Fund Value Beneficiaries */}
            <th className="border border-gray-300 p-1 text-xs">Beneficiary<br/>(Multiple Add/Delete)</th>
            <th className="border border-gray-300 p-1 text-xs">Cover % Split<br/>(Editable/%)</th>
            <th className="border border-gray-300 p-1 text-xs">Cover<br/>(Calculated)</th>
            <th className="border border-gray-300 p-1 text-xs">Lump Assessed<br/>(Editable/Currency)</th>
            <th className="border border-gray-300 p-1 text-xs">Non Deductible<br/>(Editable/Currency)</th>
            <th className="border border-gray-300 p-1 text-xs">Living Annuity<br/>(Calculated)</th>
            <th className="border border-gray-300 p-1 text-xs">Checkbox</th>
            <th className="border border-gray-300 p-1 text-xs">Income Term<br/>(Editable/Years)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {/* Actions */}
            <td className="border border-gray-300 p-1">
              <button className="text-xs bg-blue-500 text-white px-1 py-0.5 mr-1">Duplicate</button>
              <button className="text-xs bg-red-500 text-white px-1 py-0.5">Delete</button>
            </td>
            
            {/* Overview */}
            <td className="border border-gray-300 p-1">
              <input type="text" defaultValue="Enter details ..." className="w-full text-xs border-0 p-1" />
            </td>
            <td className="border border-gray-300 p-1">
              <div className="text-xs">
                <div>Donald Edwards <button className="text-red-500 ml-1">×</button></div>
                <button className="text-blue-500 text-xs">+ Add Owner</button>
              </div>
            </td>
            
            {/* Unapproved Life Cover */}
            <td className="border border-gray-300 p-1">
              <input type="text" defaultValue="R 0" className="w-full text-xs border-0 p-1" />
            </td>
            <td className="border border-gray-300 p-1">
              <div className="text-xs">
                <div>Enter details ... <button className="text-red-500 ml-1">×</button></div>
                <button className="text-blue-500 text-xs">+ Add Beneficiary</button>
              </div>
            </td>
            <td className="border border-gray-300 p-1">
              <input type="text" defaultValue="0%" className="w-full text-xs border-0 p-1" />
            </td>
            <td className="border border-gray-300 p-1 bg-gray-100">
              <span className="text-xs text-gray-600">R 0 (calc)</span>
            </td>
            
            {/* Monthly Death Benefit */}
            <td className="border border-gray-300 p-1">
              <input type="text" defaultValue="R 0" className="w-full text-xs border-0 p-1" />
            </td>
            <td className="border border-gray-300 p-1 text-center">
              <input type="checkbox" className="text-xs" />
            </td>
            <td className="border border-gray-300 p-1">
              <input type="text" defaultValue="0 years" className="w-full text-xs border-0 p-1" />
            </td>
            <td className="border border-gray-300 p-1">
              <input type="text" defaultValue="0%" className="w-full text-xs border-0 p-1" />
            </td>
            
            {/* Approved Life Cover */}
            <td className="border border-gray-300 p-1">
              <input type="text" defaultValue="R 0" className="w-full text-xs border-0 p-1" />
            </td>
            <td className="border border-gray-300 p-1">
              <input type="text" defaultValue="R 0" className="w-full text-xs border-0 p-1" />
            </td>
            <td className="border border-gray-300 p-1 bg-gray-100">
              <span className="text-xs text-gray-600">R 0 (calc)</span>
            </td>
            
            {/* Fund Value Beneficiaries */}
            <td className="border border-gray-300 p-1">
              <div className="text-xs">
                <div>Enter details ... <button className="text-red-500 ml-1">×</button></div>
                <button className="text-blue-500 text-xs">+ Add Beneficiary</button>
              </div>
            </td>
            <td className="border border-gray-300 p-1">
              <input type="text" defaultValue="0%" className="w-full text-xs border-0 p-1" />
            </td>
            <td className="border border-gray-300 p-1 bg-gray-100">
              <span className="text-xs text-gray-600">R 0 (calc)</span>
            </td>
            <td className="border border-gray-300 p-1">
              <input type="text" defaultValue="R 0" className="w-full text-xs border-0 p-1" />
            </td>
            <td className="border border-gray-300 p-1">
              <input type="text" defaultValue="R 0" className="w-full text-xs border-0 p-1" />
            </td>
            <td className="border border-gray-300 p-1 bg-gray-100">
              <span className="text-xs text-gray-600">R 0 (calc)</span>
            </td>
            <td className="border border-gray-300 p-1 text-center">
              <input type="checkbox" className="text-xs" />
            </td>
            <td className="border border-gray-300 p-1">
              <input type="text" defaultValue="0 years" className="w-full text-xs border-0 p-1" />
            </td>
          </tr>
        </tbody>
      </table>
      
      <div className="mt-4 text-sm">
        <h3 className="font-semibold mb-2">Structure Summary:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>ACTIONS:</strong> Duplicate & Delete buttons</li>
          <li><strong>OVERVIEW:</strong> Description (text), Owner (multiple with add/delete)</li>
          <li><strong>UNAPPROVED LIFE COVER:</strong> Cover Amount (currency), Beneficiary (multiple), Percentage Split (%), Cover Split (calculated)</li>
          <li><strong>MONTHLY DEATH BENEFIT:</strong> Monthly Income (currency), Checkbox, Term Years (years), Increase % (%)</li>
          <li><strong>APPROVED LIFE COVER:</strong> Cover (currency), Fund Value (currency), Fund Value at Death (calculated)</li>
          <li><strong>FUND VALUE BENEFICIARIES:</strong> Beneficiary (multiple), Cover % Split (%), Cover (calculated), Lump Assessed (currency), Non Deductible (currency), Living Annuity (calculated), Checkbox, Income Term (years)</li>
        </ul>
      </div>
    </div>
  );
}