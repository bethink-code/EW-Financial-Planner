# Assurance Table Pattern Reference

This document captures the working implementation pattern from the assurance table that successfully resolved all interface stability issues.

## Key Implementation Patterns

### 1. Debounced Updates Hook
- Use `useDebouncedUpdate` hook for text/currency fields
- 300ms delay prevents race conditions during rapid typing
- Array fields (owners, beneficiaries) update immediately

### 2. React Key Strategy
- Use stable IDs without array lengths: `key={policy.id}`
- For dynamic fields include value: `key={`field-${id}-${value}`}`
- Never use array lengths in keys as they cause re-renders

### 3. Table Structure with RowSpan
- Calculate maxRows: `Math.max(owners.length, beneficiaries.length)`
- Use React.Fragment to wrap each entity's rows
- Apply rowSpan to single-instance cells
- Include `align-top` class on rowSpan cells

### 4. Array Alignment Handling
- Check array bounds before rendering: `rowIndex < array.length`
- Render empty `<div></div>` for missing array elements
- This prevents misalignment when arrays have different lengths

### 5. Event Handling
- Always use preventDefault() and stopPropagation() on buttons
- Use type="button" to prevent form submissions
- Separate immediate vs debounced updates based on field type

### 6. CSS Classes
- `.table-actions-cell` with `vertical-align: top`
- Input fields use `table-input` plus field type classes
- Apply `getFieldClass()` and `getValueClass()` for consistency

## Code Pattern Examples

### Debounced Update Implementation
```typescript
const { executeUpdate, debouncedUpdate } = useDebouncedUpdate<Assurance>({
  updateMutation,
  itemName: 'assurance'
});

const handleUpdatePolicy = useCallback((id: number, field: keyof Assurance, value: any) => {
  const arrayFields = ['owners', 'beneficiaries'];
  
  if (arrayFields.includes(field)) {
    executeUpdate(id, field, value);
  } else {
    debouncedUpdate(id, field, value);
  }
}, [executeUpdate, debouncedUpdate]);
```

### Table Row Structure
```tsx
{Array.from({ length: maxRows }, (_, rowIndex) => (
  <tr key={`${policy.id}-${rowIndex}`}>
    {/* Single instance cells with rowSpan */}
    {rowIndex === 0 && (
      <td className="align-top" rowSpan={maxRows}>
        {/* Cell content */}
      </td>
    )}
    
    {/* Array-based cells with alignment check */}
    <td>
      {rowIndex < policy.owners.length ? (
        <div>{/* Owner content */}</div>
      ) : (
        <div></div>
      )}
    </td>
  </tr>
))}
```

### Array Management Pattern
```typescript
const handleAddOwner = useCallback((id: number) => {
  const policy = policies.find(p => p.id === id);
  if (!policy) return;
  
  const newOwners = [...policy.owners, ''];
  handleUpdatePolicy(id, 'owners', newOwners);
}, [policies, handleUpdatePolicy]);

const handleRemoveOwner = useCallback((id: number, index: number) => {
  const policy = policies.find(p => p.id === id);
  if (!policy) return;
  
  const newOwners = [...policy.owners];
  newOwners.splice(index, 1);
  handleUpdatePolicy(id, 'owners', newOwners);
}, [policies, handleUpdatePolicy]);
```

## Critical Success Factors

1. **No Optimistic Updates**: Let React Query handle cache invalidation
2. **Stable Keys**: Never include array lengths in React keys
3. **Proper Array Bounds**: Always check array length before accessing
4. **Event Protection**: Prevent all default behaviors and propagation
5. **Selective Debouncing**: Only debounce text fields, not arrays

This pattern eliminates:
- Interface jumping/flickering
- Array misalignment issues
- Race conditions during typing
- Incorrect item deletion
- React re-rendering issues