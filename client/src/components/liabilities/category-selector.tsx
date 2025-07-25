import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface CategorySelectorProps {
  onAddLiability: (category: string) => void;
  isLoading?: boolean;
}

export function CategorySelector({ onAddLiability, isLoading = false }: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const categories = [
    { key: 'BONDS', label: 'Bonds', description: 'Home bonds, property mortgages' },
    { key: 'HIRE_PURCHASES', label: 'Hire Purchases & Leases', description: 'Vehicle finance, equipment leases' },
    { key: 'OVERDRAFTS', label: 'Overdrafts & Credit Cards', description: 'Bank overdrafts, credit card debt' },
    { key: 'SHORT_TERM', label: 'Short Term Debt', description: 'Loans, personal debt' },
    { key: 'OTHER_DEBT', label: 'Other Debt', description: 'Miscellaneous liabilities' },
  ];

  const handleCategorySelect = (categoryKey: string) => {
    onAddLiability(categoryKey);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          disabled={isLoading}
          className="bg-[#016991] hover:bg-[#016991]/90 text-white border-[#016991] h-9 px-4 rounded-full"
        >
          Add Liability
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-3 py-2 text-sm font-medium text-neutral-600 border-b border-neutral-200">
          Select Liability Category
        </div>
        {categories.map((category) => (
          <DropdownMenuItem
            key={category.key}
            onClick={() => handleCategorySelect(category.key)}
            className="flex flex-col items-start p-3 hover:bg-neutral-50 cursor-pointer"
          >
            <div className="font-medium text-neutral-900">{category.label}</div>
            <div className="text-xs text-neutral-500 mt-1">{category.description}</div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}