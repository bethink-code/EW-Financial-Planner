# Global Hybrid View Pattern - Complete Implementation Guide

## Overview
This is the definitive guide for implementing hybrid view functionality across all financial planning calculators. This pattern provides 80% reusable infrastructure while allowing 20% calculator-specific customization.

## Pattern Architecture

### 1. Core Components Required

#### A. HybridViewWrapper (Already Available)
**Location**: `client/src/components/common/hybrid-view-wrapper.tsx`
**Purpose**: Provides consistent container structure across all calculators

```typescript
<HybridViewWrapper
  viewMode={viewMode}
  tableComponent={tableComponent}
  summaryCards={summaryCards}
  detailForms={detailForms}
  isUpdating={isUpdating}
  isEmpty={filteredItems.length === 0}
  emptyStateMessage="No items found"
/>
```

#### B. HybridItemPreviewCard (Already Available)
**Location**: `client/src/components/common/hybrid-item-preview-card.tsx`
**Purpose**: Standardized tab-style preview cards with proper border management

```typescript
<HybridItemPreviewCard
  key={item.id}
  title={item.title}
  subtitle={item.subtitle}
  primaryValue={item.primaryValue}
  secondaryInfo={item.secondaryInfo}
  variant={item.isSelected ? "active" : "blue"}
  onClick={() => setSelectedId(item.id)}
  isClickable={true}
  isFirst={index === 0}
  isLast={index === items.length - 1}
/>
```

#### C. GroupedDetailForm (Already Available)
**Location**: `client/src/components/common/grouped-detail-form.tsx`
**Purpose**: Structured form container with consistent spacing and field groupings

```typescript
<GroupedDetailForm>
  <FieldGroup title="OVERVIEW">
    <FormField label="Description">
      <input ... />
    </FormField>
  </FieldGroup>
</GroupedDetailForm>
```

### 2. Implementation Steps for New Calculators

#### Step 1: Create Preview Data Mapping
```typescript
// In your main calculator component
const getItemPreview = useCallback((item: YourItemType, isSelected: boolean) => {
  const validOwners = item.owners?.filter(owner => owner && owner.trim() !== '') || [];
  const ownersDisplay = validOwners.length === 0 
    ? 'Owner: Not specified' 
    : validOwners.map(owner => `Owner: ${owner}`).join('\n');
  
  return {
    id: item.id,
    title: item.description || `Item #${item.id}`,
    subtitle: ownersDisplay,
    primaryValue: `R ${item.primaryAmount?.toLocaleString() || '0'}`,
    secondaryInfo: item.secondaryInfo || undefined,
    isSelected
  };
}, []);

const previewItems = useMemo(() => 
  filteredItems.map((item) => getItemPreview(item, item.id === selectedId)), 
  [filteredItems, getItemPreview, selectedId]
);
```

#### Step 2: Create Summary Cards Container
```typescript
const summaryCards = (
  <div>
    {previewItems.map((item, index) => (
      <HybridItemPreviewCard
        key={item.id}
        title={item.title}
        subtitle={item.subtitle}
        primaryValue={item.primaryValue}
        secondaryInfo={item.secondaryInfo}
        variant={item.isSelected ? "active" : "blue"}
        onClick={() => setSelectedId(item.id)}
        isClickable={true}
        isFirst={index === 0}
        isLast={index === previewItems.length - 1}
      />
    ))}
  </div>
);
```

#### Step 3: Create Detail Form Component
Create `YourCalculatorDetailForm.tsx`:

```typescript
import { GroupedDetailForm, FieldGroup, FormField } from '@/components/common/grouped-detail-form';

export function YourCalculatorDetailForm({ item, onUpdate, ... }: Props) {
  return (
    <GroupedDetailForm>
      {/* Group 1: Entity Relationship Triad */}
      <FieldGroup title="OVERVIEW">
        <FormField label="Description">
          <input
            type="text"
            defaultValue={item.description}
            onBlur={(e) => onUpdate(item.id, 'description', e.target.value)}
          />
        </FormField>
      </FieldGroup>

      {/* Group 2: Owner & Life Assured & Death Benefits */}
      <FieldGroup title="OWNERS & LIFE ASSURED & BENEFITS">
        <FormField label="Owners">
          <EntityOwnerSelector
            owners={item.owners}
            ownershipPercentages={item.ownershipPercentages}
            onOwnerChange={(index, owner) => onOwnerChange(item.id, index, owner)}
            onPercentageChange={(index, percentage) => onPercentageChange(item.id, index, percentage)}
            onAddOwner={() => onAddOwner(item.id)}
            onRemoveOwner={(index) => onRemoveOwner(item.id, index)}
          />
        </FormField>
      </FieldGroup>

      {/* Group 3: Beneficiary Distribution */}
      <FieldGroup title="BENEFICIARY DISTRIBUTION">
        <FormField label="Beneficiaries & Controls">
          <EntityBeneficiarySelector
            beneficiaries={item.beneficiaries}
            beneficiaryPercentages={item.beneficiaryPercentages}
            onBeneficiaryChange={(index, beneficiary) => onBeneficiaryChange(item.id, index, beneficiary)}
            onPercentageChange={(index, percentage) => onBeneficiaryPercentageChange(item.id, index, percentage)}
            onAddBeneficiary={() => onAddBeneficiary(item.id)}
            onRemoveBeneficiary={(index) => onRemoveBeneficiary(item.id, index)}
          />
        </FormField>
      </FieldGroup>

      {/* Group 4: Policy-Level Financial Fields */}
      <FieldGroup title="FINANCIAL DETAILS">
        <FormField label="Amount">
          <input
            type="text"
            defaultValue={item.amount}
            onBlur={(e) => onUpdate(item.id, 'amount', e.target.value)}
          />
        </FormField>
        {/* Add other calculator-specific financial fields */}
      </FieldGroup>
    </GroupedDetailForm>
  );
}
```

#### Step 4: Integrate with Main Calculator Component
```typescript
export function YourCalculatorTable({ items, viewMode, ... }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Set default selection for hybrid view
  useEffect(() => {
    if (viewMode === 'hybrid' && items.length > 0 && selectedId === null) {
      setSelectedId(items[0].id);
    }
  }, [viewMode, items, selectedId]);

  // Get selected item
  const selectedItem = useMemo(() => 
    items.find(item => item.id === selectedId), 
    [items, selectedId]
  );

  // Create detail forms
  const detailForms = selectedItem ? (
    <YourCalculatorDetailForm
      key={`form-${selectedItem.id}`}
      item={selectedItem}
      onUpdate={handleUpdate}
      // ... other handlers
    />
  ) : (
    <div className="text-center py-8">
      <p className="text-neutral-500">Select an item from the left to view details</p>
    </div>
  );

  // Use HybridViewWrapper
  return (
    <HybridViewWrapper
      viewMode={viewMode}
      tableComponent={tableComponent}
      summaryCards={summaryCards}
      detailForms={detailForms}
      isUpdating={isUpdating}
      isEmpty={items.length === 0}
      emptyStateMessage="No items found"
    />
  );
}
```

### 3. Universal Field Groupings

Every calculator should use these 4 logical groupings:

#### Group 1: Entity Relationship Triad
- **Purpose**: Core item identification and description
- **Fields**: Description, basic identification fields
- **Title**: "OVERVIEW"

#### Group 2: Owner & Life Assured & Death Benefits  
- **Purpose**: Entity relationships and key beneficiaries
- **Fields**: Owners, Life Assured, Primary Benefits
- **Title**: "OWNERS & LIFE ASSURED & BENEFITS" (adapt as needed)

#### Group 3: Beneficiary Distribution
- **Purpose**: Beneficiary management and percentage splits
- **Fields**: Beneficiaries, Benefit splits, Percentage controls
- **Title**: "BENEFICIARY DISTRIBUTION"

#### Group 4: Policy-Level Financial Fields
- **Purpose**: Financial amounts, toggles, and calculator-specific fields
- **Fields**: Amount fields, toggles, years/percentage inputs, other financial data
- **Title**: "FINANCIAL DETAILS" or calculator-specific title

### 4. CSS Classes Available

```css
/* Container */
.hybrid-tab-container         /* No spacing between tabs */

/* Border Management */
.hybrid-tab-first            /* No top border for first tab */
.hybrid-tab-last             /* Bottom border for last tab */
.hybrid-tab-standard         /* Top border for middle tabs */

/* Visual States */
.hybrid-tab-active           /* Active tab with orange left border */
.hybrid-tab-inactive         /* Inactive tab with hover effects */

/* Legacy Support */
.tab-active-border           /* Orange left border for active tabs */
```

### 5. Border Management Rules

**Critical Requirements**:
1. Container has `border-t` for top continuity
2. Sidebar wrapper provides single `border-r` for separation
3. First tab: `isFirst={index === 0}` removes top border
4. Last tab: `isLast={index === length - 1}` adds bottom border
5. NO individual right borders on preview cards
6. NO `space-y-*` classes on tab containers
7. NO borders on GroupedDetailForm component

### 6. Multi-line Owner Display Standard

```typescript
const validOwners = item.owners?.filter(owner => owner && owner.trim() !== '') || [];
const ownersDisplay = validOwners.length === 0 
  ? 'Owner: Not specified' 
  : validOwners.map(owner => `Owner: ${owner}`).join('\n');
```

### 7. State Management Pattern

```typescript
// Selection state
const [selectedId, setSelectedId] = useState<number | null>(null);

// Auto-select first item in hybrid view
useEffect(() => {
  if (viewMode === 'hybrid' && items.length > 0 && selectedId === null) {
    setSelectedId(items[0].id);
  }
}, [viewMode, items, selectedId]);

// Memoized selected item
const selectedItem = useMemo(() => 
  items.find(item => item.id === selectedId), 
  [items, selectedId]
);
```

### 8. Implementation Checklist

When implementing a new calculator hybrid view:

- [ ] Create `getItemPreview` function with standard owner display
- [ ] Implement `summaryCards` with proper `isFirst`/`isLast` props
- [ ] Create detail form component using `GroupedDetailForm`
- [ ] Use 4 universal field groupings adapted to calculator needs
- [ ] Add selection state management with auto-selection
- [ ] Use `HybridViewWrapper` for consistent container structure
- [ ] Test border management (no double borders)
- [ ] Verify tab styling (no vertical spacing)
- [ ] Confirm multi-line owner display works
- [ ] Ensure proper empty state handling

### 9. Pattern Benefits

✓ **80% Reusable Infrastructure**: Core components work across all calculators
✓ **20% Customization**: Field groupings adapt to calculator-specific needs
✓ **Consistent Visual Design**: Professional tab interface with proper borders
✓ **Maintainable Code**: Centralized components reduce duplication
✓ **Extensible Pattern**: Easy to add new calculators following this guide

### 10. Examples in Codebase

- **Assurance**: `client/src/components/assurance/working-assurance-table.tsx`
- **Retirement Funds**: `client/src/components/retirement-funds/retirement-fund-hybrid-table.tsx`

Both demonstrate complete implementations of this pattern.

## Quick Start for New Calculator

1. Copy structure from existing calculator (Assurance or Retirement Funds)
2. Replace data types and field mappings
3. Adapt the 4 field groupings to your calculator's needs
4. Implement calculator-specific handlers
5. Test hybrid view functionality and border styling
6. Update this documentation with any new patterns discovered

This pattern ensures consistency across all calculators while providing flexibility for calculator-specific requirements.