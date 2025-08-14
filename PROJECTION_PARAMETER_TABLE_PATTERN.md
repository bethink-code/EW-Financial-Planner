# Global Projection Parameter Table Pattern

## Overview
This pattern is derived from the perfected Dependants Position implementation and provides a reusable, consistent approach for parameter tables across all projection views.

## Pattern Components

### 1. Core Table Structure
```tsx
<table className="w-80 border border-neutral-300 rounded-md">
  <thead>
    <tr className="border-b border-neutral-300 bg-gray-50">
      <th className="px-2 py-2 text-sm font-medium text-neutral-600 uppercase tracking-wider text-left">Parameter</th>
      <th className="px-2 py-2 text-sm font-medium text-neutral-600 uppercase tracking-wider text-right">Value</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-neutral-200">
    {/* Table rows */}
  </tbody>
</table>
```

### 2. Standard Row Structure
```tsx
<tr className="hover:bg-neutral-50 {isTotal ? 'bg-gray-50' : ''}">
  <td className="px-2 py-2">
    <span className="text-sm text-gray-600 {isTotal ? 'font-medium' : ''}">{label}</span>
  </td>
  <td className="px-2 py-2 text-right text-sm font-medium text-gray-800 {isTotal ? 'font-bold' : ''}">
    {formattedValue}
  </td>
</tr>
```

## Design Specifications

### Spacing & Layout
- **Table width**: `.parameter-table` custom CSS class (600px) for optimal readability and content display
- **Cell padding**: `px-2 py-2` (8px horizontal, 8px vertical) - optimized for readability
- **Border**: `border border-neutral-300 rounded-md` for clean separation
- **Hover effects**: `hover:bg-neutral-50` for better UX

### Typography
- **Headers**: `text-sm font-medium text-neutral-600 uppercase tracking-wider`
- **Labels**: `text-sm text-gray-600` (medium gray for readability)
- **Values**: `text-sm font-medium text-gray-800` (darker gray for emphasis)
- **Totals**: `font-bold` for important summary rows

### Visual Hierarchy
- **Header row**: `bg-gray-50` background
- **Total/Subtotal rows**: `bg-gray-50` background with bold text
- **Regular rows**: White background with hover states
- **Dividers**: `divide-y divide-neutral-200` between rows

## Usage Patterns

### 1. Basic Parameter Table
For simple parameter displays with calculated values:
```tsx
import { ParameterTable, createCalculatedRows } from '@/components/project/global-parameter-table';

const rows = createCalculatedRows(calculatedValues, formatCurrency);
<ParameterTable rows={rows} />
```

### 2. Income Position Table
For income-specific parameters:
```tsx
import { ParameterTable, createIncomeRows } from '@/components/project/global-parameter-table';

const rows = createIncomeRows(formatCurrency);
<ParameterTable 
  rows={rows} 
  title="Income Position Parameters"
/>
```

### 3. Custom Table with Editable Values
For tables with input fields:
```tsx
const rows = [
  {
    key: 'parameter1',
    label: 'Parameter Name',
    value: parameterValue,
    customInput: true,
    onValueChange: handleValueChange
  }
];
<ParameterTable rows={rows} formatValue={formatCurrency} />
```

## Key Benefits

1. **Consistency**: Uniform appearance across all projection views
2. **Maintainability**: Single source of truth for table styling
3. **Flexibility**: Supports calculated values, editable inputs, and custom formatting
4. **Performance**: Optimized spacing and typography for maximum readability
5. **Accessibility**: Proper semantic structure with clear visual hierarchy

## Implementation Notes

- All tables use the same `w-80` width for consistency
- Font sizes are `text-sm` throughout for optimal readability
- Color scheme follows established gray palette (gray-600 for labels, gray-800 for values)
- Total rows are automatically styled with `bg-gray-50` and `font-bold`
- Hover effects provide good user feedback without being distracting

This pattern eliminates the need for custom table implementations and ensures consistency across Estate Position, Dependants Position, Total Capital Position, and Income Position views.