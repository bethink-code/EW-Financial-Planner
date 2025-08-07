# Global Hybrid View Pattern Documentation

## Overview
The Global Hybrid View Pattern provides a consistent, reusable approach to implementing table/hybrid view functionality across all calculation tables in the financial planning platform. This pattern allows users to choose between:

- **Table View**: Traditional wide horizontal table layout for users who prefer compact, tabular data presentation
- **Hybrid View**: Left sidebar with summary cards + Right detailed vertical forms for users who prefer form-based data entry

## Architecture Components

### 1. Core Wrapper Component
**File**: `client/src/components/common/hybrid-view-wrapper.tsx`

The main orchestrator that conditionally renders either table view or hybrid view layout.

```tsx
<HybridViewWrapper
  viewMode={viewMode} // 'table' | 'hybrid'
  tableComponent={<YourTableComponent />}
  summaryCards={<YourSummaryCards />}
  detailForms={<YourDetailForms />}
  onAddItem={handleAddItem}
  addButtonLabel="Add Policy"
  isUpdating={isUpdating}
  isEmpty={isEmpty}
  emptyStateMessage="No items found"
/>
```

### 2. Reusable UI Components

#### HybridSummaryCard
**File**: `client/src/components/common/hybrid-summary-card.tsx`
- Displays totals and key metrics in the left sidebar
- Supports multiple color variants (default, blue, green, orange)
- Consistent styling and structure

#### HybridDetailCard  
**File**: `client/src/components/common/hybrid-detail-card.tsx`
- Container for individual item detail forms
- Includes action buttons (duplicate, delete) in the header
- Clean, consistent layout for form fields

#### HybridItemPreviewCard
**File**: `client/src/components/common/hybrid-item-preview-card.tsx`
- Compact preview cards for individual items in the sidebar
- Shows title, subtitle, primary value, and secondary info
- Color variants match the summary cards

### 3. Data Preparation Hook
**File**: `client/src/hooks/use-hybrid-view-data.tsx`

Custom hook that abstracts data preparation for hybrid view components:

```tsx
const hybridData = useHybridViewData({
  items: filteredItems,
  getTotals: (items) => ({ /* calculate totals */ }),
  getSummaryItems: (totals, items) => [/* summary data */],
  getItemPreview: (item) => ({ /* preview data */ }),
  maxPreviewItems: 5
});
```

## Implementation Pattern

### Step 1: Prepare Hybrid View Data
```tsx
const hybridData = useHybridViewData({
  items: filteredPolicies,
  getTotals: useCallback((policies: Assurance[]) => ({
    deathBenefit: policies.reduce((sum, policy) => /* calculate */, 0),
    // ... other totals
  }), []),
  getSummaryItems: useCallback((totals, policies) => [
    { label: 'Total Death Benefit', value: `R ${totals.deathBenefit.toLocaleString()}` },
    // ... other summary items
  ], []),
  getItemPreview: useCallback((policy) => ({
    id: policy.id,
    title: policy.description || `Policy #${policy.id}`,
    subtitle: `Owner: ${policy.owners[0]}`,
    primaryValue: policy.deathBenefit
  }), [])
});
```

### Step 2: Define Table Component
```tsx
const tableComponent = (
  <div className="space-y-6">
    <table>
      {/* Your existing table implementation */}
    </table>
  </div>
);
```

### Step 3: Define Summary Cards
```tsx
const summaryCards = (
  <>
    <HybridSummaryCard
      title="Assurance Summary"
      items={hybridData.summaryItems}
      variant="default"
    />
    <div className="space-y-3">
      {hybridData.previewItems.map((item) => (
        <HybridItemPreviewCard
          key={item.id}
          title={item.title}
          subtitle={item.subtitle}
          primaryValue={item.primaryValue}
          variant="blue"
        />
      ))}
    </div>
  </>
);
```

### Step 4: Define Detail Forms
```tsx
const detailForms = (
  <>
    {filteredPolicies.map((policy) => (
      <HybridDetailCard
        key={policy.id}
        title={policy.description || `Policy #${policy.id}`}
        onDuplicate={() => handleDuplicatePolicy(policy)}
        onDelete={() => handleDeletePolicy(policy.id)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Your form fields */}
        </div>
      </HybridDetailCard>
    ))}
  </>
);
```

### Step 5: Use HybridViewWrapper
```tsx
return (
  <HybridViewWrapper
    viewMode={viewMode}
    tableComponent={tableComponent}
    summaryCards={summaryCards}
    detailForms={detailForms}
    onAddItem={onAddPolicy}
    addButtonLabel="Add Policy"
    isUpdating={isUpdating}
    isEmpty={hybridData.isEmpty}
    emptyStateMessage="No assurance policies found"
  />
);
```

## Benefits

### 1. **Consistency**
- All calculation tables now have identical hybrid view UX
- Standardized component styling and behavior
- Unified interaction patterns

### 2. **Maintainability**  
- Single source of truth for hybrid view logic
- Easy to update styling or behavior globally
- Reduced code duplication across tables

### 3. **Scalability**
- New calculation tables can adopt the pattern in minutes
- Easy to add new UI variants or features
- Consistent data preparation patterns

### 4. **User Experience**
- Users get the same experience across all calculators
- View mode preferences persist across navigation
- Accommodates different user preferences (table vs form)

## Tables Using This Pattern

### ✅ Completed
- **Assurance Table** (`/assurance`) - Working with global pattern

### 🚀 Ready for Implementation
- **Retirement Funds** (`/new-retirement-funds`)
- **Assets Table** (`/assets`) 
- **Liabilities Table** (`/liabilities`)
- **Income Needs** (`/income-needs`)
- **Income Provisions** (`/income-provisions`)
- **Defined Benefit Funds** (`/defined-benefit-funds`)
- **Additional Estate Duty Items** (`/additional-estate-duty-items`)

## Future Enhancements

1. **Dynamic Column Configuration**: Allow tables to specify which columns appear in hybrid forms
2. **Advanced Filtering**: Add filtering capabilities to the sidebar summary
3. **Export Functions**: Add export buttons to the summary cards
4. **Responsive Improvements**: Enhanced mobile experience for hybrid view
5. **Keyboard Navigation**: Full keyboard accessibility for hybrid view

## Usage Guidelines

1. **Always use the global pattern** for new calculation tables
2. **Migrate existing tables** to use this pattern for consistency
3. **Follow the 4-step implementation** process outlined above
4. **Test both view modes** thoroughly when implementing
5. **Update this documentation** when adding new features or patterns

This pattern ensures that users have a consistent, efficient way to interact with financial data regardless of their preferred input method.