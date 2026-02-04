# Elite Wealth Table Pattern Specification

## Overview

This document provides a comprehensive, architectural specification for building Elite Wealth-styled data tables. It defines a **Base Table Pattern** that developers can extend with functional modules as needed. All tables in the system follow this consistent pattern to ensure visual harmony and maintainability.

---

## Architecture Philosophy

### Layered Design Approach

Tables are built using a modular, layered architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 5: Functional Extensions               │
│         (Entity Selectors, Calculated Fields, Actions)         │
├─────────────────────────────────────────────────────────────────┤
│                    LAYER 4: Data Formatting                     │
│        (Currency, Percentage, Years, Text Formatting)          │
├─────────────────────────────────────────────────────────────────┤
│                    LAYER 3: Column Groups                       │
│           (Section Borders, Column Spans, Grouping)            │
├─────────────────────────────────────────────────────────────────┤
│                    LAYER 2: Table Regions                       │
│              (Header, Body, Footer/Totals, Sections)           │
├─────────────────────────────────────────────────────────────────┤
│                    LAYER 1: Base Structure                      │
│            (Container, Scroll, Basic Cell Styling)             │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Composition over Configuration** - Build complex tables by composing simple, well-defined patterns
2. **CSS-First Styling** - Use global CSS classes rather than inline styles for consistency
3. **Semantic Structure** - HTML structure reflects data hierarchy (groups, sections, totals)
4. **Progressive Enhancement** - Start with base pattern, add extensions as needed

---

## Layer 1: Base Structure

### Table Container Pattern

Every table must be wrapped in a container that handles overflow and spacing:

```jsx
{/* Container Wrapper */}
<div className="table-container-wrapper">
  {/* Scroll Container */}
  <div className="overflow-x-auto">
    {/* Table Element */}
    <table>
      <thead>...</thead>
      <tbody>...</tbody>
      <tfoot>...</tfoot>
    </table>
  </div>
</div>
```

### Container CSS

```css
.table-container-wrapper {
  margin-top: 1.5rem;
  margin-left: 1.25rem;
  margin-right: 1.25rem;
  margin-bottom: 1.25rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  caption-side: bottom;
  font-size: 0.875rem;
}
```

### Base Cell Dimensions

| Element | Height | Padding | Line Height |
|---------|--------|---------|-------------|
| Standard Cell | 2rem min | 0.5rem 0.75rem | 2rem |
| Header Cell | 2.5rem | 0.25rem 0.6rem | 1.2 |
| Footer Cell | 3rem | 0 0.5rem | 1.3rem |
| Input Field | 2rem | 0.125rem 0.25rem | 1.2 |

---

## Layer 2: Table Regions

### 2.1 Header Region

Headers support both single-row and double-row configurations.

#### Single Row Header

```jsx
<thead>
  <tr>
    <th className="section-start table-actions-cell">{/* Actions */}</th>
    <th className="section-start">Column 1</th>
    <th>Column 2</th>
    <th className="section-start">Column 3</th>
  </tr>
</thead>
```

#### Double Row Header (Grouped Columns)

The double-row header pattern creates visual hierarchy for related columns:

```jsx
<thead>
  {/* First Row: Group Headers */}
  <tr className="double-row-header-first">
    <th className="section-start table-actions-cell" rowSpan={2}>
      {/* Add Button */}
    </th>
    <th className="section-start" colSpan={1}>Overview</th>
    <th className="section-start" colSpan={2}>Financial Details</th>
    <th className="section-start" colSpan={3}>Distribution</th>
  </tr>
  
  {/* Second Row: Column Headers */}
  <tr className="double-row-header-second">
    <th className="section-start">Description</th>
    <th className="section-start">Value</th>
    <th>Premium</th>
    <th className="section-start">Estate</th>
    <th>Others</th>
    <th>Client</th>
  </tr>
</thead>
```

#### Header CSS Classes

```css
/* First row of double header */
.double-row-header-first {
  height: 1.5rem !important;
  min-height: 1.5rem !important;
  max-height: 1.5rem !important;
}

table thead tr.double-row-header-first th {
  padding: 0 0.5rem !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.025em !important;
  color: #9ca3af !important;           /* Lighter grey */
  background-color: #f8fafc !important;
  vertical-align: bottom !important;
  line-height: 1.3rem !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  border-bottom: none !important;
}

/* Second row of double header */
.double-row-header-second {
  height: 1.5rem !important;
  min-height: 1.5rem !important;
  max-height: 1.5rem !important;
}

table thead tr.double-row-header-second th {
  padding: 0 0.5rem !important;
  font-size: 10px !important;
  font-weight: 500 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.025em !important;
  color: #9ca3af !important;
  background-color: #f8fafc !important;
  vertical-align: top !important;
  line-height: 1.3rem !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

/* Standard single-row header */
table thead th {
  padding: 0.25rem 0.6rem 0.4rem 0.6rem !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.025em !important;
  color: #4b5563 !important;
  background-color: #f8fafc !important;
  vertical-align: bottom !important;
  line-height: 1.2 !important;
  height: 2.5rem !important;
  min-height: 2.5rem !important;
  max-height: 2.5rem !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  border-bottom: 1px solid #e5e7eb !important;
}
```

### 2.2 Body Region

The body contains data rows, optionally organized into sections:

```jsx
<tbody className="divide-y divide-neutral-200">
  {/* Optional: Section Header Row */}
  <tr className="bg-blue-50">
    <td colSpan={totalColumns} className="px-4 text-sm font-medium text-neutral-700 uppercase tracking-wider">
      SECTION NAME
    </td>
  </tr>
  
  {/* Data Rows - use Tailwind hover:bg-neutral-50 for hover effect */}
  <tr className="hover:bg-neutral-50">
    <td className="table-actions-cell p-1 text-center section-start">...</td>
    <td className="p-1 text-left section-start">...</td>
    <td className="p-1 text-right">...</td>
  </tr>
</tbody>
```

#### Body Row CSS

```css
/* Standard row borders - applied via CSS with high specificity */
html body table tbody tr {
  border-bottom: 1px solid #e5e7eb !important;
}

html body table tbody tr td {
  border-bottom: 1px solid #e5e7eb !important;
}

/* Note: Hover state is applied via Tailwind class hover:bg-neutral-50 */
/* Section header row background */
.bg-blue-50 {
  background-color: #eff6ff;
}
```

### 2.3 Footer/Totals Region

The footer displays aggregate values with emphasized styling:

```jsx
<tfoot>
  <tr className="bg-neutral-50 border-t border-neutral-300">
    <td className="totals-cell-label section-start"></td>
    <td className="totals-cell-label text-right section-start">Totals</td>
    <td className="totals-cell-value section-start text-right">R 1,250,000</td>
    <td className="totals-cell-value text-right">R 750,000</td>
    <td className="totals-cell-value text-right">R 500,000</td>
  </tr>
</tfoot>
```

#### Footer CSS

```css
tfoot {
  background-color: #f9fafb !important;
}

tfoot tr {
  border-top: 1px solid #d1d5db !important;
  height: 3rem !important;
  min-height: 3rem !important;
  max-height: 3rem !important;
}

/* Remove borders from footer cells (except section borders) */
tfoot td:not(.section-start):not(.section-end) {
  border-left: none !important;
  border-right: none !important;
  border-bottom: none !important;
}

tfoot tr td {
  border-bottom: none !important;
}

.totals-cell-label {
  color: #374151 !important;
  font-size: 0.875rem !important;
  font-weight: normal !important;
  padding: 0 0.5rem !important;
  vertical-align: middle !important;
  line-height: 1.3rem !important;
}

.totals-cell-value {
  text-align: right !important;
  font-weight: 600 !important;
  color: #374151 !important;
  font-size: 0.875rem !important;
  padding: 0 0.5rem !important;
  vertical-align: middle !important;
  line-height: 1.3rem !important;
}

/* Right-align currency values in footer */
tfoot td.totals-cell-value {
  text-align: right !important;
}
```

---

## Layer 3: Column Groups & Section Borders

### Section Border System

Tables use vertical borders to visually separate logical column groups. The `.section-start` class marks the beginning of each group:

```
┌─────────┬────────────────────┬─────────────────┬──────────────────────┐
│ Actions │ Overview           │ Financial       │ Distribution         │
├─────────┼────────────────────┼─────────────────┼──────────────────────┤
│    +    │ Description        │ Value │ Premium │ Estate │ Others │ Client │
├─────────┼────────────────────┼─────────────────┼──────────────────────┤
│  ⋮ ✕   │ Property 1         │ R 500K│ R 1,200 │ R 250K │ R 150K │ R 100K │
└─────────┴────────────────────┴─────────────────┴──────────────────────┘
     ↑              ↑                  ↑               ↑
  section        section            section         section
   start          start              start           start
```

### Section Border CSS

```css
.section-start {
  border-left: 1px solid #d1d5db !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  padding-left: 6px !important;
  padding-right: 6px !important;
}

/* Remove left border from first column (Actions) */
thead tr:first-child th:first-child.section-start[rowSpan],
tbody tr td:first-child.section-start,
tfoot tr td:first-child.section-start {
  border-left: none !important;
}

/* Section end (right border) - for explicit group endings */
.section-end {
  border-right: 2px solid #9ca3af !important;
}
```

### Column Group Pattern

When using `colSpan` in headers, ensure corresponding cells in body rows have matching `.section-start` placement:

```jsx
{/* Header defines groups */}
<tr className="double-row-header-first">
  <th className="section-start" rowSpan={2}>Actions</th>
  <th className="section-start" colSpan={1}>Overview</th>      {/* 1 column */}
  <th className="section-start" colSpan={2}>Financial</th>      {/* 2 columns */}
  <th className="section-start" colSpan={3}>Distribution</th>   {/* 3 columns */}
</tr>

{/* Body rows must align section-start with group boundaries */}
<tr>
  <td className="section-start">...</td>                        {/* Actions */}
  <td className="section-start">Description</td>                {/* Overview start */}
  <td className="section-start">Value</td>                      {/* Financial start */}
  <td>Premium</td>                                              {/* Financial cont. */}
  <td className="section-start">Estate</td>                     {/* Distribution start */}
  <td>Others</td>                                               {/* Distribution cont. */}
  <td>Client</td>                                               {/* Distribution cont. */}
</tr>
```

---

## Layer 4: Data Formatting

### Field Type System

All inputs follow a standardized field type system with consistent widths and formatting:

| Field Type | CSS Class | Min Width | Max Width | Fixed Width | Alignment |
|------------|-----------|-----------|-----------|-------------|-----------|
| Text | `.field-text` | 150px | 300px | auto | left |
| Currency | `.field-currency` | 100px | 140px | 120px | right |
| Percentage | `.field-percentage` | 50px | 65px | 65px | right |
| Years | `.field-years` | 80px | 80px | 80px | right |
| Number | `.field-number` | 70px | 120px | auto | right |

### Input Field Pattern

```jsx
<td className="p-1 text-right section-start">
  <input
    type="text"
    defaultValue="R 500,000"
    className="table-input field-currency entered-value"
    onFocus={handleDefaultValueFocus}
    onBlur={(e) => handleInputBlur(id, 'fieldName', e.target.value)}
  />
</td>
```

### Input CSS

```css
.table-input {
  height: 2rem !important;
  padding: 0.125rem 0.25rem !important;
  background-color: hsl(var(--primary) / 0.05);
  border: 1px solid hsl(var(--border));
  outline: none;
  font-size: 0.875rem !important;
  text-align: left;
  box-sizing: border-box;
  resize: none;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: hsl(var(--foreground));
  line-height: 1.2;
}

.table-input:hover {
  background-color: hsl(var(--accent));
  border-color: hsl(var(--primary) / 0.3);
}

.table-input:focus {
  background-color: hsl(var(--background));
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
}

/* Right-aligned for numeric fields */
.table-input.text-right {
  text-align: right;
}
```

### Field Type CSS Classes

```css
.field-text {
  min-width: 150px !important;
  max-width: 300px !important;
  width: auto !important;
  text-align: left !important;
  font-size: 0.875rem !important;
}

.field-currency {
  min-width: 100px !important;
  max-width: 140px !important;
  width: 120px !important;
  text-align: right !important;
  font-size: 0.875rem !important;
}

.field-percentage {
  min-width: 50px !important;
  max-width: 65px !important;
  width: 65px !important;
  text-align: right !important;
  font-size: 0.875rem !important;
}

.field-years {
  min-width: 80px !important;
  max-width: 80px !important;
  width: 80px !important;
  text-align: right !important;
  font-size: 0.875rem !important;
}

.field-number {
  min-width: 70px !important;
  max-width: 120px !important;
  text-align: right !important;
  font-size: 0.875rem !important;
}
```

### Value State Classes

Values display differently based on whether they are defaults or user-entered:

```css
/* Default/placeholder values - grey text */
.default-value {
  color: #9ca3af !important;
}

.default-value:focus {
  color: #374151 !important;
}

/* User-entered values - standard dark text */
.entered-value {
  color: #374151 !important;
}
```

### Formatting Functions

```typescript
// Currency: "R 1,234,567"
function formatCurrencyValue(value: string): string {
  const cleanValue = value.replace(/[^\d.-]/g, '');
  if (!cleanValue || isNaN(parseFloat(cleanValue))) return 'R 0';
  return `R ${parseFloat(cleanValue).toLocaleString()}`;
}

// Percentage: "45.5%"
function formatPercentageValue(value: string): string {
  const cleanValue = value.replace(/[^\d.-]/g, '');
  if (!cleanValue || isNaN(parseFloat(cleanValue))) return '0%';
  return `${parseFloat(cleanValue)}%`;
}

// Years: "10 years"
function formatYearsValue(value: string): string {
  const cleanValue = value.replace(/[^\d.-]/g, '');
  if (!cleanValue || isNaN(parseFloat(cleanValue))) return '0 years';
  return `${parseFloat(cleanValue)} years`;
}

// Determine value class based on content
function getValueClass(value: string, fieldType: string): string {
  if (!value || isDefaultValue(value, fieldType)) {
    return 'default-value';
  }
  return 'entered-value';
}
```

---

## Layer 5: Functional Extensions

### 5.1 Actions Column

The first column typically contains action buttons:

```jsx
{/* Header with Add Button */}
<th className="section-start table-actions-cell" rowSpan={2}>
  <button className="table-header-add-button" onClick={handleAdd}>
    <Plus />
  </button>
</th>

{/* Body with Row Actions */}
<td className="table-actions-cell p-1 text-center section-start">
  <div className="action-button-group">
    <button className="btn-icon-white" onClick={handleDuplicate}>
      <Copy size={14} />
    </button>
    <button className="btn-icon-white" onClick={handleDelete}>
      <Trash2 size={14} />
    </button>
  </div>
</td>
```

#### Actions Column CSS

```css
.table-actions-cell {
  vertical-align: top !important;
  text-align: center;
}

.table-actions-cell > div {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 2.3rem;
}

.table-header-add-button {
  width: 24px;
  height: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #016991;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.table-header-add-button:hover {
  background-color: #014a66;
}

.table-header-add-button svg {
  width: 14px;
  height: 14px;
}
```

### 5.2 Calculated Fields

Read-only calculated fields have distinct styling:

```jsx
<td className="p-1 text-right">
  <span className="calculated-field field-currency">
    R 1,500,000
  </span>
</td>
```

#### Calculated Field CSS

```css
.calculated-field {
  background-color: transparent !important;
  border: 1px solid transparent !important;
  cursor: default !important;
  user-select: none !important;
  outline: none !important;
  box-shadow: none !important;
  color: #374151 !important;
  padding: 0.25rem 0.5rem !important;
  font-size: 0.875rem !important;
  text-align: right !important;
  height: auto !important;
  width: auto !important;
  line-height: 1.2 !important;
}

.calculated-field:hover {
  background-color: transparent !important;
  border: 1px solid transparent !important;
  box-shadow: none !important;
}
```

### 5.3 Dropdown Fields

Select/dropdown fields in tables:

```jsx
<td className="p-1 section-start">
  <select className="table-input table-dropdown">
    <option value="">Select...</option>
    <option value="option1">Option 1</option>
    <option value="option2">Option 2</option>
  </select>
</td>
```

#### Dropdown CSS

```css
select.table-input,
.table-dropdown {
  height: 2rem !important;
  padding: 0 0.25rem !important;
  background-color: hsl(var(--primary) / 0.05);
  border: 1px solid hsl(var(--border));
  outline: none;
  font-size: 0.875rem;
  text-align: left;
  box-sizing: border-box;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: hsl(var(--foreground)) !important;
  line-height: 2rem !important;
}

select.table-input:hover,
.table-dropdown:hover {
  background-color: hsl(var(--accent));
  border-color: hsl(var(--primary) / 0.3);
}

select.table-input:focus,
.table-dropdown:focus {
  background-color: hsl(var(--background));
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
}
```

### 5.4 Policy/Record Separation

When displaying multiple related records (policies), add visual separation:

```jsx
{/* First record of a group */}
<tr className="policy-first-row hover:bg-neutral-50">
  <td>...</td>
</tr>

{/* Last record of a group */}
<tr className="policy-last-row hover:bg-neutral-50">
  <td>...</td>
</tr>
```

#### Policy Separation CSS

```css
.policy-first-row {
  border-top: 2px solid #d1d5db !important;
}

.policy-first-row:first-child {
  border-top: none !important;
}

.policy-last-row {
  margin-bottom: 20px;
  border-bottom: 1px solid transparent;
}

.policy-last-row td {
  padding-bottom: 20px !important;
}

.policy-group {
  border-top: 2px solid hsl(var(--border));
  margin-top: 0.5rem;
}

.policy-group:first-child {
  border-top: none;
  margin-top: 0;
}
```

---

## Complete Base Pattern Template

Here is a complete, copy-paste-ready base pattern:

```tsx
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { TableHeaderAddButton } from '@/components/ui/table-header-add-button';
import { ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass, getValueClass, formatCurrencyValue } from '@/lib/formatting';

interface BaseTableProps {
  searchTerm?: string;
  onAdd?: () => void;
}

function BaseTable({ searchTerm, onAdd }: BaseTableProps) {
  // 1. Data fetching
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['/api/items'],
  });

  // 2. Mutations
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const response = await fetch(`/api/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
    },
  });

  // 3. Calculate totals
  const totals = useMemo(() => {
    return items.reduce((sum, item) => {
      const value = parseFloat((item.amount || '').replace(/[^\d.-]/g, '')) || 0;
      return sum + value;
    }, 0);
  }, [items]);

  // 4. Event handlers
  const handleInputBlur = useCallback((id: number, field: string, value: string) => {
    const formattedValue = formatCurrencyValue(value);
    updateMutation.mutate({ id, updates: { [field]: formattedValue } });
  }, [updateMutation]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="table-container-wrapper">
      <div className="overflow-x-auto">
        <table>
          {/* HEADER */}
          <thead>
            <tr className="double-row-header-first">
              <th className="section-start table-actions-cell" rowSpan={2}>
                {onAdd && <TableHeaderAddButton onClick={onAdd} />}
              </th>
              <th className="section-start" colSpan={1}>Overview</th>
              <th className="section-start" colSpan={2}>Financial</th>
            </tr>
            <tr className="double-row-header-second">
              <th className="section-start">Description</th>
              <th className="section-start">Amount</th>
              <th>Value</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-neutral-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50">
                {/* Actions */}
                <td className="table-actions-cell p-1 text-center section-start">
                  <ActionButtonGroup>
                    <DuplicateButton onClick={() => {}} />
                    <DeleteButton onClick={() => {}} />
                  </ActionButtonGroup>
                </td>

                {/* Description (text field) */}
                <td className="p-1 text-left section-start">
                  <input
                    type="text"
                    defaultValue={item.description}
                    className={`table-input ${getFieldClass('text')} ${getValueClass(item.description, 'text')}`}
                    onBlur={(e) => handleInputBlur(item.id, 'description', e.target.value)}
                  />
                </td>

                {/* Amount (currency field) */}
                <td className="p-1 text-right section-start">
                  <input
                    type="text"
                    defaultValue={item.amount}
                    className={`table-input ${getFieldClass('currency')} ${getValueClass(item.amount, 'currency')}`}
                    onBlur={(e) => handleInputBlur(item.id, 'amount', e.target.value)}
                  />
                </td>

                {/* Value (currency field) */}
                <td className="p-1 text-right">
                  <input
                    type="text"
                    defaultValue={item.value}
                    className={`table-input ${getFieldClass('currency')} ${getValueClass(item.value, 'currency')}`}
                    onBlur={(e) => handleInputBlur(item.id, 'value', e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>

          {/* FOOTER */}
          <tfoot>
            <tr className="bg-neutral-50 border-t border-neutral-300">
              <td className="totals-cell-label section-start"></td>
              <td className="totals-cell-label text-right section-start">Totals</td>
              <td className="totals-cell-value section-start text-right">
                R {totals.toLocaleString()}
              </td>
              <td className="totals-cell-value text-right"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default BaseTable;
```

---

## Extension Patterns

### Adding Entity Selector Columns

For tables with owner/beneficiary selection:

```tsx
// Import entity selector components
import { EntityOwnerSelector } from '@/components/common/entity-owner-selector';

// In the header
<th className="section-start" colSpan={clientEntities.length}>Ownership Split</th>

// In the body (entity selector renders its own <td>)
{clientEntities.map((entity, index) => (
  <td key={entity.id} className={`p-1 text-right ${index === 0 ? 'section-start' : ''}`}>
    <input
      type="text"
      defaultValue={ownership[entity.name] || '0%'}
      className="table-input field-percentage"
      onBlur={handleOwnershipChange}
    />
  </td>
))}
```

### Adding Sectioned/Grouped Data

For tables with category groupings:

```tsx
{Object.entries(groupedItems).map(([sectionName, sectionItems]) => [
  // Section Header Row
  <tr key={`section-${sectionName}`} className="bg-blue-50">
    <td colSpan={totalColumns} className="px-4 text-sm font-medium text-neutral-700 uppercase tracking-wider">
      {sectionName}
    </td>
  </tr>,
  // Section Items
  ...sectionItems.map((item) => (
    <tr key={item.id} className="hover:bg-neutral-50">
      {/* ... cells ... */}
    </tr>
  ))
]).flat()}
```

### Adding Calculated Column

For columns that display computed values:

```tsx
<td className="p-1 text-right">
  <span className="calculated-field field-currency">
    R {(parseFloat(item.a) + parseFloat(item.b)).toLocaleString()}
  </span>
</td>
```

---

## Responsive Behavior

Tables extend horizontally with `overflow-x-auto` for scrolling on smaller screens. The width constraint is applied at the view level, not the table level:

```tsx
// In page component
<div className={viewMode === 'table' ? 'w-full' : 'w-[1320px]'}>
  <div className="table-container-wrapper">
    {/* Table component */}
  </div>
</div>
```

---

## CSS Variables Reference

Tables use these CSS custom properties for theming:

```css
:root {
  --primary: 199 78% 29%;         /* Elite Wealth Blue #016991 */
  --primary-foreground: 0 0% 100%;
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --accent: 210 40% 96%;
  --border: 214 32% 91%;
  --neutral-50: #f9fafb;
  --neutral-200: #e5e7eb;
  --neutral-300: #d1d5db;
  --neutral-700: #374151;
}
```

---

## Checklist for Implementation

When implementing a new table:

- [ ] Container uses `.table-container-wrapper` and `overflow-x-auto`
- [ ] Headers use appropriate class (`.double-row-header-first/second` or standard)
- [ ] First column of each section uses `.section-start`
- [ ] Actions column uses `.table-actions-cell`
- [ ] Input fields use `.table-input` with appropriate `.field-*` class
- [ ] Numeric fields are right-aligned (`.text-right`)
- [ ] Footer uses `.totals-cell-label` and `.totals-cell-value`
- [ ] Values use `.default-value` or `.entered-value` appropriately
- [ ] Calculated fields use `.calculated-field`
- [ ] Row hover uses `hover:bg-neutral-50`
- [ ] Body uses `divide-y divide-neutral-200`
