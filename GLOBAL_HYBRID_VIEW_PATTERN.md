# Global Hybrid View Pattern - Complete Implementation Guide

## Overview
This is the definitive guide for implementing hybrid view functionality across all financial planning calculators. This pattern provides 80% reusable infrastructure while allowing 20% calculator-specific customization.

**CRITICAL**: This pattern has been battle-tested across multiple calculators. Follow it exactly or expect broken UI.

## Implementation Rules
1. **NO EXCEPTIONS**: Border management props (`isFirst`/`isLast`) are mandatory
2. **NO SHORTCUTS**: Use provided templates and checklist completely  
3. **NO VARIATIONS**: Visual protocol must be followed exactly
4. **ZERO TOLERANCE**: Any deviation will cause UI issues

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
  {/* Header with Actions - MANDATORY PATTERN */}
  <div className="flex justify-between items-start">
    <h2 className="text-lg font-semibold text-neutral-800">
      {item.description || 'Untitled Item'}
    </h2>
    <ActionButtonGroup>
      <DuplicateButton onClick={() => onDuplicate(item)} disabled={disabled} />
      <DeleteButton onClick={() => onDelete(item.id)} disabled={disabled} />
    </ActionButtonGroup>
  </div>

  <FieldGroup title="OVERVIEW">
    <FormField label="Description">
      <input ... />
    </FormField>
  </FieldGroup>
</GroupedDetailForm>
```

**Required Detail Form Container Styling**:
```typescript
// EXACT container classes required for consistency
<div className="space-y-12 p-6 bg-white">
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

### 5. Title Styling Standards

**MANDATORY Title Pattern for Detail Forms**:
```typescript
{/* Header with Actions - USE EXACT STYLING */}
<div className="flex justify-between items-start">
  <h2 className="text-lg font-semibold text-neutral-800">
    {item.description || 'Untitled Item'}
  </h2>
  <ActionButtonGroup>
    <DuplicateButton onClick={() => onDuplicate(item)} disabled={disabled} />
    <DeleteButton onClick={() => onDelete(item.id)} disabled={disabled} />
  </ActionButtonGroup>
</div>
```

**Typography Requirements**:
- **Font Size**: `text-lg` (18px)
- **Font Weight**: `font-semibold` (600)
- **Color**: `text-neutral-800` (dark gray)
- **Dynamic Content**: Show item description (e.g., "Policy 1", "Sanlam Protector")
- **Fallback**: "Untitled Item" (adapt to calculator type)

### 6. Border Management Rules

**Critical Requirements**:
1. Container has `border-t` for top continuity
2. Sidebar wrapper provides single `border-r` for separation
3. First tab: `isFirst={index === 0}` removes top border
4. Last tab: `isLast={index === length - 1}` adds bottom border
5. NO individual right borders on preview cards
6. NO `space-y-*` classes on tab containers
7. NO borders on GroupedDetailForm component

**MANDATORY IMPLEMENTATION**:
```typescript
// Always apply both isFirst AND isLast props
{items.map((item, index) => (
  <HybridItemPreviewCard
    key={item.id}
    // ... other props
    isFirst={index === 0}
    isLast={index === items.length - 1}
  />
))}

// Container wrapper with proper borders
<div className="flex border-t border-neutral-200">
  <div className="w-80 flex-shrink-0 border-r border-neutral-200 bg-neutral-50">
    <div> {/* NO space-y-* classes here */}
      {summaryCards}
    </div>
  </div>
  <div className="flex-1 p-6">
    {detailForms}
  </div>
</div>
```

### 6. Multi-line Owner Display Standard

```typescript
const validOwners = item.owners?.filter(owner => owner && owner.trim() !== '') || [];
const ownersDisplay = validOwners.length === 0 
  ? 'Owner: Not specified' 
  : validOwners.map(owner => `Owner: ${owner}`).join('\n');
```

### 7. Data Consistency Rules

**CRITICAL**: Preview card data MUST match detail form content exactly.

**Common Issues**:
- Preview shows total count but detail form has multiple sections
- Different beneficiary/owner types counted together without clarity

**Solutions**:
```typescript
// For multiple beneficiary types (like retirement funds)
const type1Count = item.type1Beneficiaries?.filter(b => b).length || 0;
const type2Count = item.type2Beneficiaries?.filter(b => b).length || 0;

// Show breakdown with each type on separate lines (preferred format)
if (type1Count > 0 && type2Count > 0) {
  beneficiariesText = `Type1 Beneficiaries: ${type1Count}\nType2 Beneficiaries: ${type2Count}`;
} else {
  beneficiariesText = `Beneficiaries: ${type1Count + type2Count}`;
}
```

**Formatting Rule**: When displaying multiple entity types in preview cards, use separate lines (`\n`) for better readability.

**Display Rule**: Preview cards show beneficiary type breakdown; detail forms can use separate sections or unified tables based on calculator requirements.

```typescript
// Option 1: Separate sections (standard approach)
<FieldGroup title="Type 1 Beneficiaries">
  <table>
    {/* Type 1 table */}
  </table>
</FieldGroup>

<FieldGroup title="Type 2 Beneficiaries">  
  <table>
    {/* Type 2 table */}
  </table>
</FieldGroup>

// Option 2: Unified table with type identification (optional)
<FieldGroup title="All Beneficiaries">
  <table>
    <tbody>
      {/* Type 1 rows with type identifier column */}
      {/* Type 2 rows with type identifier column */}
    </tbody>
  </table>
</FieldGroup>
```

### 8. State Management Pattern

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

### 9. Implementation Checklist

**MANDATORY STEPS** - Every calculator MUST follow this checklist:

- [ ] **Border Management**: Apply `isFirst={index === 0}` AND `isLast={index === items.length - 1}` to ALL preview cards
- [ ] **Container Structure**: Use `HybridViewWrapper` with proper border classes (`border-t`, `border-r`)
- [ ] **Tab Spacing**: NO `space-y-*` classes on summary cards container
- [ ] **GroupedDetailForm**: NO borders on detail form component - keep it clean
- [ ] **Multi-line Owners**: Standard owner display format with `join('\n')`
- [ ] **State Management**: Auto-select first item in hybrid view
- [ ] **Field Groupings**: Use 4 universal groupings adapted to calculator
- [ ] **Error Handling**: Proper empty states and loading indicators
- [ ] **Visual Testing**: Verify no double borders anywhere in interface
- [ ] **Data Consistency**: Ensure preview card counts match detail form sections exactly
- [ ] **Accessibility**: All tabs keyboard navigable and properly labeled

**FAILURE TO FOLLOW = BROKEN UI** - These are not suggestions, they are requirements.

### 10. Pattern Benefits

✓ **80% Reusable Infrastructure**: Core components work across all calculators
✓ **20% Customization**: Field groupings adapt to calculator-specific needs
✓ **Consistent Visual Design**: Professional tab interface with proper borders
✓ **Maintainable Code**: Centralized components reduce duplication
✓ **Extensible Pattern**: Easy to add new calculators following this guide

### 11. Examples in Codebase

- **Assurance**: `client/src/components/assurance/working-assurance-table.tsx`
- **Retirement Funds**: `client/src/components/retirement-funds/retirement-fund-hybrid-table.tsx`

**Recent Success Stories**:
- **Assurance Calculator**: Full implementation with all patterns and consistent title styling
- **Retirement Funds Calculator**: Complete hybrid view integration with matching title typography  
- **Title Consistency**: Both calculators now display individual item names with identical styling
- **Border Resolution**: All double border issues resolved with global CSS fixes

Both demonstrate complete implementations of this pattern.

## MANDATORY Implementation Protocol

**STEP 1: Copy Working Template**
```bash
# Copy from working implementation
cp client/src/components/assurance/working-assurance-table.tsx client/src/components/[new-calculator]/[new-calculator]-table.tsx
cp client/src/components/assurance/assurance-detail-form.tsx client/src/components/[new-calculator]/[new-calculator]-detail-form.tsx
```

**STEP 2: Required Replacements**
- Replace ALL data type imports and interfaces
- Update field mappings and handlers
- Adapt 4 field groupings to calculator needs
- Update entity selection logic if needed

**STEP 3: Border Management Verification**
```typescript
// VERIFY these exact patterns exist:
isFirst={index === 0}
isLast={index === items.length - 1}
<div> {/* NO space-y-* */}
  {summaryCards}
</div>
```

**STEP 4: Visual Testing Protocol**
1. Check first tab has no top border
2. Check last tab has bottom border 
3. Verify no double borders anywhere (including table bottoms)
4. Confirm tab container has no vertical spacing
5. Test detail form has clean borders
6. Verify table borders are consistent thin style (1px) on all edges
7. **Verify title styling matches pattern exactly**:
   - Individual item name displayed (not generic section name)
   - Font: `text-lg font-semibold text-neutral-800`
   - Layout: Title left, action buttons right
   - Spacing: Consistent with other calculators

**STEP 5: Commit All Changes to Pattern**
1. Document any new styling requirements in this guide
2. Update container classes and typography standards
3. Add visual testing steps for new features
4. Update success stories with implementation notes

**STEP 5: Update Documentation**
- Add new calculator to examples list
- Document any calculator-specific variations
- Update this guide with new patterns if discovered

**WARNING**: Skipping any step will result in broken UI. This pattern has been battle-tested across multiple calculators - follow it exactly.