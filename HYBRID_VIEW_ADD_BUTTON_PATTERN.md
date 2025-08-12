# Hybrid View Add Button Pattern

## Overview
Standardized pattern for Add button placement and item actions in hybrid views across all calculators.

## Pattern Components

### 1. Add Button Placement
- **Location**: Above the first summary tab, inside the summaryCards prop
- **Styling**: `+ Add [Item]` with light styling (white background, gray text, border)
- **Container**: `hybrid-add-button-container p-4 border-b border-neutral-200`

### 2. Item Actions
Each hybrid view item must include:
- **Duplicate Button**: Right side of title area
- **Delete Button**: Right side of title area  
- **Layout**: Title on left, action buttons on right

### 3. Structure
```
summaryCards prop:
  ├── Add Button (top)
  ├── Border separator
  └── Summary tabs list
      ├── Tab 1 (with orange left border when selected)
      ├── Tab 2
      └── Tab N

detailForms:
  └── Selected item form
      ├── Title + Duplicate/Delete buttons (top right)
      └── Form content
```

### 4. Implementation Requirements

#### Add Button
- Must be inside `summaryCards` prop structure
- Wrapped in `hybrid-add-button-container` with border-b
- Followed by `hybrid-tabs-list` wrapper for tabs

#### Item Actions
- Title layout: flex justify-between
- Left: Item title (`text-lg font-semibold text-neutral-800`)
- Right: Duplicate + Delete buttons

## Current Status

### ✅ ALL HYBRID VIEWS NOW COMPLIANT (Exact `+ Add [Unit]` Pattern)
- **Lump Sum Bequests**: ✅ Plus icon + "Add Bequest", ✅ Duplicate/Delete buttons
- **Income Provisions**: ✅ Plus icon + "Add Provision", ✅ Duplicate/Delete buttons
- **Assets**: ✅ Plus icon + "Add Asset"
- **Liabilities**: ✅ Plus icon + "Add Liability"  
- **Defined Benefit Funds**: ✅ Plus icon + "Add Fund"
- **Income Needs**: ✅ Plus icon + "Add Need"
- **Retirement Funds**: ✅ Plus icon + "Add Fund"

### Pattern Successfully Implemented
All hybrid views now use: `<Plus className="h-4 w-4 mr-2" />` + "Add [Unit]" text

### Remaining Tasks
- Add Duplicate/Delete buttons to Assets, Liabilities, Defined Benefit Funds, Income Needs detail forms

### Pattern Analysis
- All components have Add button correctly positioned above tabs
- 3 components have complete pattern (Lump Sum, Income Provisions, Retirement Funds)
- 4 components need Duplicate/Delete buttons added to detail forms

## Next Steps
1. Update existing hybrid views to match this pattern
2. Ensure all new hybrid implementations follow this standard
3. Document any deviations with clear reasoning