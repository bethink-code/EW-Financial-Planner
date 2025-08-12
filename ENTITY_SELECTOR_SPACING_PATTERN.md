# EntitySelector Spacing Optimization Pattern

## Overview
This pattern defines the standard approach for optimizing horizontal spacing within EntitySelector components while maintaining proper table structure and DOM validation compliance.

## Problem Statement
EntitySelector components (EntityOwnerSelector, EntityBeneficiarySelector) had excessive horizontal spacing between their internal elements (action buttons, name dropdown, percentage field), making them appear disconnected despite functioning as cohesive UI units.

## Solution Pattern

### Horizontal Spacing Optimization
Each EntitySelector component renders 3 `<td>` elements with optimized padding:

1. **Actions Column**: `pr-0.5 pl-1 py-1` - Reduced right padding to bring closer to name field
2. **Name Column**: `px-0.5 py-1` - Minimal horizontal padding for tight spacing
3. **Percentage Column**: `pl-0.5 pr-1 py-1` - Reduced left padding to stay close to name field

### Key Principles

#### ✅ DO:
- Use asymmetric horizontal padding to reduce gaps between EntitySelector elements
- Maintain `py-1` vertical padding to match other table content
- Apply consistent spacing across all EntitySelector variants
- Keep empty cell fallbacks with standard `p-1` padding

#### ❌ DON'T:
- Change vertical padding (`py-1` must remain consistent with table)
- Wrap EntitySelector components in additional `<td>` elements
- Use different spacing patterns across EntitySelector variants
- Forget to update empty cell rendering

## Implementation Template

```tsx
return (
  <>
    {/* Actions Column */}
    <td className="pr-0.5 pl-1 py-1 align-top border-r border-neutral-200" style={{ width: '60px' }}>
      <div className="pt-0.5">
        {actionButton}
      </div>
    </td>
    
    {/* Name Column */}
    <td className="px-0.5 py-1 align-top border-r border-neutral-200" style={{ width: '300px' }}>
      <select className="table-input table-dropdown w-full">
        {/* options */}
      </select>
    </td>

    {/* Percentage Column */}
    <td className="pl-0.5 pr-1 py-1 align-top border-r border-neutral-200" style={{ width: '80px' }}>
      <input className="table-input text-center" />
    </td>
  </>
);
```

## CSS Classes Reference

### Standard Padding Classes Used:
- `pr-0.5` - Right padding: 2px
- `pl-1` - Left padding: 4px  
- `px-0.5` - Horizontal padding: 2px
- `py-1` - Vertical padding: 4px (matches table standard)

### Table Styling Classes:
- `table-input` - Standard input styling
- `table-dropdown` - Standard dropdown styling
- `align-top` - Top alignment for table cells
- `border-r border-neutral-200` - Right border styling

## Components Using This Pattern

- **EntityOwnerSelector** (`client/src/components/common/entity-owner-selector.tsx`)
- **EntityBeneficiarySelector** (`client/src/components/common/entity-beneficiary-selector.tsx`)

## Visual Result
EntitySelector components now appear as cohesive UI units with minimal horizontal gaps between action buttons, name fields, and percentage inputs, while maintaining proper table alignment and DOM structure.

## Rollout Checklist
When applying this pattern to new EntitySelector components:

1. ✅ Update active cell padding with asymmetric horizontal spacing
2. ✅ Maintain `py-1` vertical padding consistency
3. ✅ Keep empty cell fallbacks with standard `p-1` padding
4. ✅ Test DOM validation (no nesting warnings)
5. ✅ Verify visual cohesion with existing components
6. ✅ Confirm table alignment remains intact

## Pattern Status
- **Created**: January 12, 2025
- **Components Updated**: EntityOwnerSelector, EntityBeneficiarySelector
- **Status**: ✅ Active Pattern - Ready for Reuse