import React from 'react';

interface CategorySelectorProps {
  value: string;
  onChange: (category: string) => void;
  className?: string;
}

export function CategorySelector({ value, onChange, className = "" }: CategorySelectorProps) {
  const assetCategories = [
    { value: 'PROPERTY', label: 'Property' },
    { value: 'VEHICLES', label: 'Vehicles' },
    { value: 'INVESTMENTS', label: 'Investments' },
    { value: 'CASH_BANK', label: 'Cash & Bank Accounts' },
    { value: 'PERSONAL_ASSETS', label: 'Personal Assets' },
    { value: 'BUSINESS_ASSETS', label: 'Business Assets' },
    { value: 'INSURANCE_POLICIES', label: 'Insurance Policies' },
    { value: 'OTHER_ASSETS', label: 'Other Assets' }
  ];

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className={`table-input ${className}`}
    >
      <option value="">Select category...</option>
      {assetCategories.map((category) => (
        <option key={category.value} value={category.value}>
          {category.label}
        </option>
      ))}
    </select>
  );
}