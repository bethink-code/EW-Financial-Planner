# Assurance Table - Proven Working Pattern

## Problem Solved
Fixed React Query cache synchronization issues that were causing:
- Owner/beneficiary additions going to wrong policies
- Unexpected value restoration after deletions
- Array synchronization problems between mutations

## Key Pattern Elements

### 1. Unified Update Function
```typescript
const handleUpdatePolicy = useCallback((id: number, field: keyof Assurance, value: string | boolean | string[]) => {
  setIsUpdating(true);
  const updates = { [field]: value };
  updateMutation.mutate({ id, updates });
}, [updateMutation]);
```

### 2. Array Management Functions
All array operations use `handleUpdatePolicy` instead of direct mutations:

```typescript
// Add Owner
const handleAddOwner = useCallback((id: number) => {
  const policy = policies.find((p: Assurance) => p.id === id);
  if (policy) {
    const newOwners = [...policy.owners, ""];
    handleUpdatePolicy(id, 'owners', newOwners);
  }
}, [policies, handleUpdatePolicy]);

// Remove Owner
const handleRemoveOwner = useCallback((id: number, ownerIndex: number) => {
  const policy = policies.find((p: Assurance) => p.id === id);
  if (policy && policy.owners.length > 1 && ownerIndex > 0) {
    const newOwners = [...policy.owners];
    newOwners.splice(ownerIndex, 1);
    handleUpdatePolicy(id, 'owners', newOwners);
  }
}, [policies, handleUpdatePolicy]);

// Update Owner
const handleOwnerChange = useCallback((id: number, ownerIndex: number, newOwner: string) => {
  const policy = policies.find((p: Assurance) => p.id === id);
  if (policy) {
    const updatedOwners = [...policy.owners];
    updatedOwners[ownerIndex] = newOwner;
    handleUpdatePolicy(id, 'owners', updatedOwners);
  }
}, [policies, handleUpdatePolicy]);
```

### 3. Mutation Setup
```typescript
const updateMutation = useMutation({
  mutationFn: async ({ id, updates }: { id: number; updates: Partial<Assurance> }) => {
    const response = await apiRequest("PATCH", `/api/assurance/${id}`, updates);
    return await response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/assurance"] });
    queryClient.refetchQueries({ queryKey: ["/api/assurance"] });
    setIsUpdating(false);
  },
  onError: (error) => {
    console.error('Update mutation error:', error);
    setIsUpdating(false);
  }
});
```

## Critical Success Factors

1. **Single Update Path**: All array modifications go through `handleUpdatePolicy`
2. **No Optimistic Updates**: Eliminated race conditions by using clean mutations
3. **Consistent Dependencies**: All array handlers depend on `handleUpdatePolicy`
4. **Proper Array Copying**: Always use spread operator `[...array]` before modification
5. **Index Protection**: Prevent deletion of first owner/beneficiary (index 0)

## DO NOT Change These Patterns
- Never call `updateMutation.mutate()` directly from array handlers
- Never use `setIsUpdating(true)` in individual array functions
- Never mix optimistic updates with this pattern
- Always use splice() for deletions, not filter()

## Tested and Confirmed Working
- ✅ Add owners to specific policies
- ✅ Remove owners from specific policies  
- ✅ Update owner names correctly
- ✅ Same pattern works for beneficiaries
- ✅ No unexpected value restoration
- ✅ No cache synchronization issues

## Apply This Pattern To
- Retirement Funds (needs same fix)
- Defined Benefit Funds
- Any table with multiple owners/beneficiaries arrays