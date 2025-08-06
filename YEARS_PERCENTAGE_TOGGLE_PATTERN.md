# Years/% Toggle Pattern - Reusable Implementation Guide

## Overview
This pattern creates a dynamic toggle button that switches between Years mode and Percentage mode for income-related calculations. The toggle shows "Years" when active (checkbox = true) and "%" when inactive (checkbox = false).

## Core Pattern Components

### 1. Database Schema Fields Required
```typescript
// Add these fields to your table schema:
{fieldName}Checkbox: boolean("{field_name}_checkbox").notNull().default(true), // Toggle: true = Years mode, false = % mode
{fieldName}Years: text("{field_name}_years").notNull().default("0 years"),
{fieldName}Increase: text("{field_name}_increase").notNull().default("0%"),
```

### 2. Helper Functions
```typescript
// Dynamic Toggle Pattern Helper Functions
const hasIncomeAmount = (item: YourItemType) => {
  const income = item.{incomeAmountField} || "";
  const cleanValue = income.replace(/[^\d]/g, '');
  return cleanValue && cleanValue !== "0";
};

const getControlsEnabled = (item: YourItemType) => {
  return hasIncomeAmount(item) && !isUpdating;
};

// Toggle shows "Years" when checked (true), "%" when unchecked (false)
const isYearsMode = (item: YourItemType) => {
  return item.{fieldName}Checkbox === true;
};
```

### 3. onBlur Handler with Years Formatting
```typescript
const handleInputBlur = useCallback((id: number, field: string, value: string, element: HTMLInputElement, fieldType: string) => {
  let formattedValue;
  
  // Special handling for years fields
  if (fieldType.includes('years') || fieldType.includes('Years') || field === '{fieldName}Years') {
    if (!value || value === "0" || value.trim() === "") {
      formattedValue = "0 years";
    } else {
      const cleanValue = value.toString().replace(/\s*years?\s*/gi, '').trim();
      if (cleanValue === "" || cleanValue === "0") {
        formattedValue = "0 years";
      } else {
        const numValue = parseFloat(cleanValue);
        if (isNaN(numValue)) {
          formattedValue = "0 years";
        } else {
          formattedValue = `${numValue} years`;
        }
      }
    }
  } else {
    // Use standard formatting for other fields
    formattedValue = fieldType === 'percentage' ? formatPercentageValue(value) : 
                      fieldType === 'currency' ? formatCurrencyValue(value) : 
                      value;
  }

  // Update the DOM directly to avoid re-render jump
  if (formattedValue !== value) {
    element.value = formattedValue;
  }
  
  // Update the database
  handleUpdateItem(id, field as keyof YourItemType, formattedValue);
}, [handleUpdateItem]);
```

### 4. Table Header Structure
```typescript
{/* Update colspan to accommodate new toggle column */}
<th className="section-start" colSpan={3}>{Section Name}</th>

{/* Second header row */}
<th className="section-start">{Amount Field}</th>
<th>Toggle</th>
<th>Years / %</th>
```

### 5. Table Cell Implementation
```typescript
{/* Amount Field */}
{rowIndex === 0 && (
  <td className={`p-2 section-start align-top ${getCellClass('currency')}`} rowSpan={maxRows}>
    <input
      key={`{amountField}-${item.id}-${item.{amountField}}`}
      type="text"
      defaultValue={item.{amountField}}
      className={`table-input ${getFieldClass('currency')} ${getValueClass(item.{amountField}, 'currency')}`}
      onFocus={handleDefaultValueFocus}
      onBlur={(e) => handleUpdateItem(item.id, '{amountField}', e.target.value)}
      disabled={isUpdating}
    />
  </td>
)}

{/* Toggle Button */}
{rowIndex === 0 && (
  <td className="table-actions-cell align-top" rowSpan={maxRows}>
    <div className="pt-0.5">
      <button
        type="button"
        onClick={() => handleUpdateItem(item.id, '{fieldName}Checkbox', !item.{fieldName}Checkbox)}
        className={`h-8 px-3 min-w-[48px] bg-[#E8F3F8] border border-[#E0E0E0] text-[#016991] hover:bg-[#D1E7F0] rounded-md flex items-center justify-center transition-colors text-sm font-medium ${
          !getControlsEnabled(item) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        disabled={!getControlsEnabled(item) || isUpdating}
      >
        {isYearsMode(item) ? 'Years' : '%'}
      </button>
    </div>
  </td>
)}

{/* Dynamic Field (Years OR Percentage) */}
{rowIndex === 0 && (
  <td className="p-1 align-top" rowSpan={maxRows}>
    {isYearsMode(item) ? (
      // Years Mode
      <input
        key={`{fieldName}-years-${item.id}`}
        type="text"
        defaultValue={formatYearsValue(item.{fieldName}Years)}
        className={`table-input ${getFieldClass('years')} ${getValueClass(item.{fieldName}Years, 'years')} ${
          !getControlsEnabled(item) ? 'bg-neutral-100 cursor-not-allowed' : ''
        }`}
        onFocus={handleDefaultValueFocus}
        onBlur={(e) => handleInputBlur(item.id, '{fieldName}Years', e.target.value, e.target)}
        disabled={!getControlsEnabled(item) || isUpdating}
      />
    ) : (
      // Percentage Mode
      <input
        key={`{fieldName}-increase-${item.id}`}
        type="text"
        defaultValue={item.{fieldName}Increase || "0%"}
        className={`table-input ${getFieldClass('percentage')} ${getValueClass(item.{fieldName}Increase || "0%", 'percentage')} ${
          !getControlsEnabled(item) ? 'bg-neutral-100 cursor-not-allowed' : ''
        }`}
        onFocus={handleDefaultValueFocus}
        onBlur={(e) => handleInputBlur(item.id, '{fieldName}Increase', e.target.value, e.target)}
        disabled={!getControlsEnabled(item) || isUpdating}
      />
    )}
  </td>
)}
```

### 6. Insert Schema Updates
```typescript
// Add new fields to insert mutations
const newItem: InsertItemType = {
  // ... existing fields
  {fieldName}Checkbox: true, // Default to Years mode
  {fieldName}Years: "0 years",
  {fieldName}Increase: "0%",
};

// Add to duplicate function
const duplicatedItem: InsertItemType = {
  // ... existing fields
  {fieldName}Checkbox: item.{fieldName}Checkbox,
  {fieldName}Years: item.{fieldName}Years,
  {fieldName}Increase: item.{fieldName}Increase,
};
```

### 7. Footer Column Count Update
```typescript
{/* Update colspan to match new column structure */}
<td className="totals-cell-label text-right" colSpan={X}>Totals</td>
{/* Add empty cells for toggle and dynamic columns */}
<td className="totals-cell-label"></td>
<td className="totals-cell-label"></td>
```

## Styling Guidelines

### Toggle Button Styling
- **Background**: `bg-[#E8F3F8]` (light blue)
- **Text**: `text-[#016991]` (dark blue)
- **Hover**: `hover:bg-[#D1E7F0]`
- **Size**: `h-8 px-3 min-w-[48px]`
- **Alignment**: Use `pt-0.5` for vertical alignment with input fields

### Disabled State
- **Opacity**: `opacity-50 cursor-not-allowed`
- **Background**: `bg-neutral-100 cursor-not-allowed` for input fields

## Usage Rules

1. **Control Dependency**: Toggle buttons are only enabled when the income amount field has a non-zero value
2. **Years Formatting**: Years fields automatically append "years" suffix on blur (e.g., "10" becomes "10 years")
3. **Database Defaults**: Default to Years mode (checkbox = true) for new items
4. **Consistent Styling**: All toggle buttons must use the same light blue styling pattern

## Implementation Checklist

- [ ] Add database schema fields ({fieldName}Checkbox, {fieldName}Years, {fieldName}Increase)
- [ ] Run database migration (`npm run db:push`)
- [ ] Add helper functions (hasIncomeAmount, getControlsEnabled, isYearsMode)
- [ ] Implement onBlur handler with years formatting
- [ ] Update table headers (colspan and field names)
- [ ] Implement toggle button with correct styling
- [ ] Implement dynamic field (Years OR Percentage)
- [ ] Update insert mutations and duplicate functions
- [ ] Update footer column count
- [ ] Test toggle functionality and years formatting

## References

### Successfully Implemented
- **New Retirement Funds**: `/new-retirement-funds` (Monthly Death Benefit section)
- **Defined Benefit Funds**: `/defined-benefit-funds` (Pension Income at Death section)

### Pattern Variations
- **Field Names**: Customize {fieldName} prefix (e.g., monthlyIncome, pensionIncome)
- **Section Names**: Adapt headers to match business context
- **Income Dependencies**: Different income amount fields can control toggle visibility