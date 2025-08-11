# Global Entity Management Pattern - Implementation Guide

## Overview
This guide provides the complete pattern for implementing entity management with ownership percentages across all calculation tables in the financial planning application.

## Pattern Components

### 1. Global Reusable Components
- **Location**: `client/src/components/common/`
- **EntityOwnerSelector**: Universal owner selector with percentage validation
- **EntityBeneficiarySelector**: Universal beneficiary selector with percentage validation

### 2. Database Schema Requirements
For any table that needs entity management, add these fields:
```typescript
// Owner information
owners: text("owners").array().notNull().default(["Primary Entity"]),
ownershipPercentages: text("ownership_percentages").array().notNull().default(["100%"]),

// Beneficiary information (if needed)
beneficiaries: text("beneficiaries").array().notNull().default([""]),
beneficiaryPercentages: text("beneficiary_percentages").array().notNull().default(["100%"]),
```

### 3. Component Integration Pattern

#### Import the Global Components
```typescript
import EntityOwnerSelector from "@/components/common/entity-owner-selector";
import EntityBeneficiarySelector from "@/components/common/entity-beneficiary-selector";
```

#### Add Percentage Handlers
```typescript
// Update ownership percentage
const handleOwnershipPercentageChange = useCallback((id: number, ownerIndex: number, newPercentage: string) => {
  const policy = policies.find((p) => p.id === id);
  if (policy) {
    const updatedPercentages = [...(policy.ownershipPercentages || [])];
    updatedPercentages[ownerIndex] = newPercentage;
    handleUpdatePolicy(id, 'ownershipPercentages', updatedPercentages);
  }
}, [policies, handleUpdatePolicy]);

// Update beneficiary percentage
const handleBeneficiaryPercentageChange = useCallback((id: number, beneficiaryIndex: number, newPercentage: string) => {
  const policy = policies.find((p) => p.id === id);
  if (policy) {
    const updatedPercentages = [...(policy.beneficiaryPercentages || [])];
    updatedPercentages[beneficiaryIndex] = newPercentage;
    handleUpdatePolicy(id, 'beneficiaryPercentages', updatedPercentages);
  }
}, [policies, handleUpdatePolicy]);
```

#### Update Add/Remove Handlers
```typescript
// Add owner with percentage
const handleAddOwner = useCallback((id: number) => {
  const policy = policies.find((p) => p.id === id);
  if (policy) {
    const newOwners = [...policy.owners, ""];
    const newOwnershipPercentages = [...(policy.ownershipPercentages || []), "0%"];
    handleUpdatePolicy(id, 'owners', newOwners);
    handleUpdatePolicy(id, 'ownershipPercentages', newOwnershipPercentages);
  }
}, [policies, handleUpdatePolicy]);

// Remove owner with percentage
const handleRemoveOwner = useCallback((id: number, ownerIndex: number) => {
  const policy = policies.find((p) => p.id === id);
  if (policy && policy.owners.length > 1 && ownerIndex > 0) {
    const newOwners = [...policy.owners];
    const newOwnershipPercentages = [...(policy.ownershipPercentages || [])];
    newOwners.splice(ownerIndex, 1);
    newOwnershipPercentages.splice(ownerIndex, 1);
    handleUpdatePolicy(id, 'owners', newOwners);
    handleUpdatePolicy(id, 'ownershipPercentages', newOwnershipPercentages);
  }
}, [policies, handleUpdatePolicy]);
```

#### Replace Table Cells - CRITICAL PATTERN
**IMPORTANT**: EntityOwnerSelector and EntityBeneficiarySelector render their own `<td>` elements. DO NOT wrap them in additional `<td>` elements to avoid DOM nesting warnings.

**CORRECT Pattern** (No wrapper td elements):
```typescript
{/* Owner - EntityOwnerSelector renders its own td elements */}
<EntityOwnerSelector
  policyId={policy.id}
  owners={policy.owners}
  ownershipPercentages={policy.ownershipPercentages || ["100%"]}
  onOwnerChange={handleOwnerChange}
  onOwnershipPercentageChange={handleOwnershipPercentageChange}
  onAddOwner={handleAddOwner}
  onRemoveOwner={handleRemoveOwner}
  rowIndex={rowIndex}
  disabled={updateMutation.isPending}
/>

{/* Beneficiary - EntityBeneficiarySelector renders its own td elements */}
<EntityBeneficiarySelector
  policyId={policy.id}
  beneficiaries={policy.beneficiaries}
  beneficiaryPercentages={policy.beneficiaryPercentages || ["100%"]}
  onBeneficiaryChange={handleBeneficiaryChange}
  onBeneficiaryPercentageChange={handleBeneficiaryPercentageChange}
  onAddBeneficiary={handleAddBeneficiary}
  onRemoveBeneficiary={handleRemoveBeneficiary}
  rowIndex={rowIndex}
  disabled={updateMutation.isPending}
/>
```

**WRONG Pattern** (DO NOT USE - causes DOM nesting warnings):
```typescript
{/* WRONG - DO NOT WRAP IN td ELEMENTS */}
<td className="border border-neutral-300 p-1">
  <EntityOwnerSelector ... />
</td>
```

### 5. Table Header Structure
When using EntityOwnerSelector and EntityBeneficiarySelector, update table headers to match the column structure:

**EntityOwnerSelector requires 3 columns:**
```typescript
<th>Actions</th>
<th>Owner Name</th>  
<th>Ownership %</th>
```

**EntityBeneficiarySelector requires 3 columns:**
```typescript
<th>Actions</th>
<th>Beneficiary Name</th>
<th>Benefit Split</th>
```

**Example Complete Header:**
```typescript
<thead>
  <tr>
    <th>Description</th>
    {/* EntityOwnerSelector columns */}
    <th>Actions</th>
    <th>Owner Name</th>
    <th>Ownership %</th>
    {/* Other fields */}
    <th>Cover Amount</th>
    {/* EntityBeneficiarySelector columns */}
    <th>Actions</th>
    <th>Beneficiary Name</th>
    <th>Benefit Split</th>
    <th>Cover Split</th>
  </tr>
</thead>
```

### 4. Array Fields Update
Update the `handleUpdatePolicy` function to handle percentage arrays:
```typescript
const handleUpdatePolicy = useCallback((id: number, field: keyof PolicyType, value: string | boolean | string[]) => {
  const arrayFields = ['owners', 'beneficiaries', 'ownershipPercentages', 'beneficiaryPercentages'];
  
  if (arrayFields.includes(field)) {
    executeUpdate(id, field, value);
  } else {
    debouncedUpdate(id, field, value);
  }
}, [executeUpdate, debouncedUpdate]);
```

## Implementation Checklist

### For Each Table:
- [ ] Update database schema with ownership/beneficiary percentage arrays
- [ ] Add percentage change handlers
- [ ] Update add/remove handlers to maintain array synchronization
- [ ] Replace owner/beneficiary text inputs with EntitySelector components
- [ ] Update field handling to include percentage arrays
- [ ] Test percentage validation (must total 100%)
- [ ] Verify add/remove functionality works correctly

### Database Migration:
```sql
-- Add percentage arrays to existing table
ALTER TABLE your_table_name 
ADD COLUMN ownership_percentages text[] DEFAULT ARRAY['100%'],
ADD COLUMN beneficiary_percentages text[] DEFAULT ARRAY['100%'];

-- Update existing records to have matching array lengths
UPDATE your_table_name 
SET ownership_percentages = (array of appropriate length),
    beneficiary_percentages = (array of appropriate length);
```

## Benefits
1. **Consistent Entity Selection**: All tables use the same master entity registry
2. **Percentage Validation**: Ensures proper financial planning with 100% totals
3. **Data Integrity**: Synchronized arrays prevent data corruption
4. **User Experience**: Dropdown selection eliminates typos and inconsistencies
5. **Reusable Components**: Single implementation serves all calculation tables

## Tables Ready for Implementation
- `/new-retirement-funds`
- `/defined-benefit-funds` 
- `/assets`
- `/income-needs`
- `/income-provisions`
- `/additional-estate-duty-items`

## Implementation Status
✅ **Completed**: `/assurance` table
🔄 **Ready for Global Deployment**: Pattern established and tested