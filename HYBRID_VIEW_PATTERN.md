# Hybrid View Pattern for Financial Calculators

## Overview
The Hybrid View Pattern provides a standardized approach for implementing dual-view calculator interfaces with left-side preview cards and right-side detailed forms. This pattern ensures consistency across all financial calculators while maintaining optimal usability and data integrity.

## Pattern Architecture

### 1. Component Structure
```
HybridViewWrapper
├── Left Panel: Preview Cards (Tabs)
│   └── HybridItemPreviewCard (per item)
└── Right Panel: Detailed Form
    ├── ActionButtonGroup (Edit/Delete)
    ├── FieldGroup 1: Entity Relationships
    ├── FieldGroup 2: Beneficiary Distribution  
    ├── FieldGroup 3: Amount Toggle Patterns
    └── FieldGroup 4: Policy-Level Fields
```

### 2. Logical Field Groupings

#### Group 1: Entity Relationship Triad
- **Pattern**: Owner → Life Assured → Death Benefit
- **Table Structure**: Actions | Owner | Ownership % | Life Assured | Death Benefit
- **Column Widths**: 60px | 300px | 80px | 300px | 100px
- **Components**: EntityOwnerSelector (renders 3 table cells)

#### Group 2: Beneficiary Distribution
- **Pattern**: Beneficiary → Benefit Split percentages
- **Table Structure**: Actions | Beneficiary | Benefit % | Benefit Split
- **Column Widths**: 60px | 300px | 80px | 100px
- **Components**: EntityBeneficiarySelector (renders 3 table cells)

#### Group 3: Amount Toggle Pattern
- **Pattern**: Amount → Toggle → Years/% input
- **Table Structure**: Amount | Toggle | Years/%
- **Column Widths**: 90px | 70px | 80px
- **Per-beneficiary independence**: Each row has its own toggle state

#### Group 4: Policy-Level Financial Fields
- **Pattern**: Description, totals, calculated fields
- **Layout**: Standard form inputs with consistent styling
- **Width**: fit-content with minimum widths

## Technical Implementation Standards

### Table Structure Requirements

#### Fixed Layout System
```css
table {
  table-layout: 'fixed';
  width: 'fit-content';
  min-width: 'calculated-based-on-columns';
  border-collapse: collapse;
}
```

#### Column Width Specifications
- **Actions**: 60px (buttons, icons)
- **Entity Names**: 300px (dropdowns, selectors)
- **Percentages**: 80px (numeric inputs)
- **Currency**: 90-100px (formatted inputs)
- **Toggles**: 70px (Y/% buttons)

#### Header Alignment
```jsx
<th style={{ width: 'XXXpx' }} className="table-header-12 px-1 py-2 border">
```

#### Cell Alignment
```jsx
<td style={{ width: 'XXXpx' }} className="px-1 py-1 border-r">
```

### Component-as-Table-Cells Pattern

#### EntityOwnerSelector Structure
```jsx
return (
  <>
    <td style={{ width: '60px' }}>Actions</td>
    <td style={{ width: '300px' }}>Owner Dropdown</td>
    <td style={{ width: '80px' }}>Percentage Input</td>
  </>
);
```

#### EntityBeneficiarySelector Structure
```jsx
return (
  <>
    <td style={{ width: '60px' }}>Actions</td>
    <td style={{ width: '300px' }}>Beneficiary Dropdown</td>
    <td style={{ width: '80px' }}>Percentage Input</td>
  </>
);
```

### Data Structure Requirements

#### Array-Based Per-Beneficiary Fields
```typescript
interface PolicyData {
  // Basic arrays
  owners: string[];
  beneficiaries: string[];
  ownershipPercentages: string[];
  beneficiaryPercentages: string[];
  
  // Toggle pattern arrays (per-beneficiary independence)
  amountToggles: boolean[];
  amountYearsValues: string[];
  amountIncreaseValues: string[];
}
```

#### Array Synchronization Rules
- When adding beneficiary: extend all arrays with default values
- When removing beneficiary: remove corresponding index from all arrays
- Default toggle state: false (percentage mode)
- Default values: "0 years", "0%", "R 0"

### State Management Patterns

#### Array Field Updates
```typescript
const handleArrayFieldUpdate = (field: string, index: number, value: any) => {
  if (field === 'amountToggles') {
    // Handle boolean arrays specially
    const newToggles = [...(currentData[field] || [])];
    newToggles[index] = value;
    return newToggles;
  }
  // Handle other array types
};
```

#### Toggle State Management
```typescript
const isAmountYearsMode = (policy: PolicyData, beneficiaryIndex: number): boolean => {
  return (policy.amountToggles || [])[beneficiaryIndex] || false;
};
```

### Validation Patterns

#### Percentage Validation
```typescript
const validatePercentageTotal = (percentages: string[]): boolean => {
  const total = percentages.reduce((sum, p) => sum + parseFloat(p.replace('%', '')), 0);
  return Math.abs(total - 100) <= 0.01;
};
```

#### Array Length Validation
```typescript
const ensureArrayConsistency = (policy: PolicyData): PolicyData => {
  const maxLength = Math.max(policy.beneficiaries.length, 1);
  return {
    ...policy,
    amountToggles: ensureArrayLength(policy.amountToggles, maxLength, false),
    amountYearsValues: ensureArrayLength(policy.amountYearsValues, maxLength, "0 years"),
    amountIncreaseValues: ensureArrayLength(policy.amountIncreaseValues, maxLength, "0%")
  };
};
```

## Styling Standards

### Table Styling
```css
.table-header-12 {
  font-size: 12px;
  text-transform: uppercase;
  font-weight: normal;
}

.table-input {
  border: 1px solid #e5e5e5;
  padding: 4px 8px;
  border-radius: 4px;
}
```

### Compact Spacing
- Table padding: `px-1 py-1` (4px horizontal, 4px vertical)
- Header padding: `px-1 py-2` (4px horizontal, 8px vertical)
- Form spacing: `space-y-4` between field groups

### Border System
```css
/* Section borders */
.border-neutral-200 { border-color: #e5e5e5; }

/* Table borders */
border-collapse: collapse;
border: 1px solid #e5e5e5;
border-r: 1px solid #e5e5e5; /* Right borders between cells */
```

## Navigation and UX Patterns

### Tab System
- Left panel shows preview cards as tabs
- Active tab highlighted with Elite Wealth blue
- Card content shows key identifiers (description, amounts)
- Smooth transitions between tabs

### Form Interaction
- Uncontrolled inputs with defaultValue
- onBlur for data persistence
- Focus handling for default value selection
- Immediate array operations, debounced text updates

### Loading States
- Global loading system with Elite Wealth branding
- Progress indicators during CRUD operations
- Optimistic updates with rollback capability

## Implementation Checklist

### Before Starting
- [ ] Identify logical field groupings for the calculator
- [ ] Map entity relationships (Owner → Life Assured pattern)
- [ ] Determine which fields need per-beneficiary independence
- [ ] Calculate total table width requirements

### Table Implementation
- [ ] Create fixed-width table with fit-content sizing
- [ ] Implement component-as-table-cells pattern
- [ ] Ensure exact width matching between headers and cells
- [ ] Apply consistent border and padding system

### Data Structure
- [ ] Define array-based fields for multi-row data
- [ ] Implement array synchronization helpers
- [ ] Create toggle state management functions
- [ ] Add percentage validation helpers

### Component Integration
- [ ] Wrap in HybridViewWrapper
- [ ] Create preview cards for left panel
- [ ] Implement ActionButtonGroup
- [ ] Apply FieldGroup organization

### Testing and Validation
- [ ] Test column alignment across different screen sizes
- [ ] Verify array synchronization during add/remove operations
- [ ] Validate percentage totals and error states
- [ ] Test toggle functionality per beneficiary
- [ ] Ensure proper loading states and error handling

## Reusability Across Calculators

This pattern is designed to be applied across:
- **Assurance**: Owner → Life Assured → Death Benefit relationships
- **Defined Benefit Funds**: Member → Beneficiary → Fund allocations
- **Retirement Annuities**: Owner → Beneficiary → Investment distributions
- **Living Annuities**: Owner → Beneficiary → Income distributions

Each calculator adapts the 4 logical field groupings to its specific domain while maintaining the same underlying structure, styling, and interaction patterns.

## Benefits of This Pattern

1. **Consistency**: Unified UX across all calculators
2. **Maintainability**: Shared components and styling patterns
3. **Scalability**: Easy to add new calculators following the same structure
4. **Data Integrity**: Robust validation and synchronization
5. **Performance**: Optimized table layout and state management
6. **Accessibility**: Proper table semantics and keyboard navigation