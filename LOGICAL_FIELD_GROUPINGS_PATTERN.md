# Logical Field Groupings Pattern for Table Architecture

## Overview
Through 2 hours of intensive work on the Assurance table, we've identified 4 distinct logical field groupings that have specific dependencies and interaction patterns.

## The 4 Logical Groupings

### **1. Entity Relationship Triad**
- **Fields**: Owner → Life Assured → Death Benefit
- **Pattern**: 1:1:1 relationship where each owner corresponds to a specific life assured person and their death benefit
- **Behavior**: These three fields form the core policy identity and are tightly coupled

### **2. Beneficiary Distribution Group** 
- **Fields**: Beneficiary → Benefit Split
- **Pattern**: Per-beneficiary calculated fields
- **Behavior**: Each beneficiary has a corresponding benefit split based on percentage calculations
- **Dependency**: Related to Group 3 through shared beneficiary rows

### **3. Amount Toggle Pattern Group**
- **Fields**: Amount → Toggle → Years/Percentage Value  
- **Pattern**: Per-beneficiary independent toggle controls
- **Behavior**: Each beneficiary row has independent toggle state for switching input modes
- **Dependency**: Related to Group 2 through shared beneficiary context
- **Implementation**: Uses array-based state (amountToggles, amountYearsValues, amountIncreaseValues)

### **4. Policy-Level Financial Fields**
- **Fields**: Premiums by Others, Collateral Session
- **Pattern**: Policy-wide values using rowSpan
- **Behavior**: Single values that apply to entire policy, displayed only on first row

## Key Architectural Insights

### Related Groups
- **Groups 2 & 3**: Share beneficiary row context and must synchronize when beneficiaries are added/removed
- **Groups 1 & 4**: Independent groups with distinct data flows

### Array Synchronization Requirements
- When beneficiaries change, Groups 2 & 3 arrays must expand/contract together
- Group 4 remains unchanged during beneficiary operations

### Table Structure Dependencies
- Totals row must account for all 4 groups to maintain column alignment
- rowSpan usage applies only to Group 4
- Per-row rendering applies to Groups 1, 2, & 3

## Implementation Patterns

### Per-Beneficiary Groups (2 & 3)
```typescript
// Array synchronization when adding beneficiary
const newToggles = [...policy.amountToggles, true];
const newYearsValues = [...policy.amountYearsValues, "0 years"];
const newBeneficiaries = [...policy.beneficiaries, newBeneficiary];
```

### Policy-Level Group (4)
```typescript
// rowSpan implementation
{beneficiaryIndex === 0 && (
  <td rowSpan={maxRows} className="policy-level-field">
    {policyLevelValue}
  </td>
)}
```

## Future Applications
This 4-group pattern can be applied to other calculator tables to:
1. Identify logical field relationships
2. Determine appropriate data synchronization strategies  
3. Design consistent user interaction patterns
4. Ensure proper table alignment and rendering

## Date
January 2025 - Documented after successful Assurance table Years/% Toggle Pattern implementation