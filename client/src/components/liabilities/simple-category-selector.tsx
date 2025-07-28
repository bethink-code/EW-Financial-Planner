import React from 'react';

interface SimpleCategorySelectorProps {
  value: string;
  onChange: (category: string) => void;
  className?: string;
}

export function SimpleCategorySelector({ value, onChange, className = "" }: SimpleCategorySelectorProps) {
  const liabilityCategories = [
    { value: 'BONDS', label: 'Bonds' },
    { value: 'HIRE_PURCHASES', label: 'Hire Purchases' },
    { value: 'OVERDRAFTS', label: 'Overdrafts' },
    { value: 'SHORT_TERM_DEBT', label: 'Short Term Debt' },
    { value: 'OTHER_DEBT', label: 'Other Debt' }
  ];

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = event.target.value;
    onChange(selectedCategory);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className={`table-input ${className}`}
    >
      <option value="">Select category...</option>
      {liabilityCategories.map((category) => (
        <option key={category.value} value={category.value}>
          {category.label}
        </option>
      ))}
    </select>
  );
}