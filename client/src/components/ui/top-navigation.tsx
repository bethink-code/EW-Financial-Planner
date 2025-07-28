import React from 'react';
import { TableNavigationDropdown } from './table-navigation-dropdown';

export function TopNavigation() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <TableNavigationDropdown />
          <div className="text-sm text-gray-500">
            Estate Planning Calculator
          </div>
        </div>
      </div>
    </div>
  );
}