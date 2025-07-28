import React from 'react';
import { Link, useLocation } from 'wouter';
import { ChevronDown } from 'lucide-react';

interface TableNavItem {
  name: string;
  path: string;
  category: string;
}

const tables: TableNavItem[] = [
  // Main Calculator Tables
  { name: "Assurance", path: "/assurance", category: "Main Calculator" },
  { name: "Retirement Funds", path: "/new-retirement-funds", category: "Main Calculator" },
  { name: "Defined Benefit Funds", path: "/defined-benefit-funds", category: "Main Calculator" },
  { name: "Voluntary Investments", path: "/voluntary-investments", category: "Main Calculator" },
  { name: "Assets", path: "/assets", category: "Main Calculator" },
  { name: "Liabilities", path: "/liabilities", category: "Main Calculator" },
  { name: "Income Needs", path: "/income-needs", category: "Main Calculator" },
  { name: "Income Provisions", path: "/income-provisions", category: "Main Calculator" },
  { name: "Residue", path: "/residue", category: "Main Calculator" },
  { name: "Lump Sum Bequests", path: "/lump-sum-bequests", category: "Main Calculator" },
  { name: "Additional Estate Duty Items", path: "/additional-estate-duty-items", category: "Main Calculator" }
];

export function TableNavigationDropdown() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Find current table name
  const currentTable = tables.find(table => table.path === location);
  const currentTableName = currentTable ? currentTable.name : "Select Calculator Table";
  
  // Group tables by category
  const groupedTables = tables.reduce((acc, table) => {
    if (!acc[table.category]) {
      acc[table.category] = [];
    }
    acc[table.category].push(table);
    return acc;
  }, {} as Record<string, TableNavItem[]>);

  const handleDropdownToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = () => {
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('table-nav-dropdown');
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" id="table-nav-dropdown">
      <button
        onClick={handleDropdownToggle}
        className="flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[300px] shadow-sm"
      >
        <span className="truncate">{currentTableName}</span>
        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] max-h-96 overflow-y-auto">
          {Object.entries(groupedTables).map(([category, categoryTables]) => (
            <div key={category} className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                {category} Tables
              </div>
              {categoryTables.map((table) => (
                <Link key={table.path} href={table.path}>
                  <div
                    onClick={handleItemClick}
                    className={`block px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors ${
                      location === table.path 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : 'text-gray-700'
                    }`}
                  >
                    {table.name}
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}