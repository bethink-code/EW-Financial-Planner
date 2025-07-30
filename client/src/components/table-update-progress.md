# Table Update Progress

## Completed Tables
1. ✅ **Assurance Table** (`working-assurance-table.tsx`)
   - Implemented React.Fragment wrapping
   - Added rowSpan to single-instance cells
   - Using useDebouncedUpdate hook
   - Stable React keys without array lengths
   - Empty cell handling for array alignment

2. ✅ **Retirement Funds Table** (`new-retirement-table.tsx`)
   - Implemented React.Fragment wrapping
   - Added rowSpan to all single-instance cells (Actions, Overview fields, Monthly Death Benefit, Fund Value, etc.)
   - Already had useDebouncedUpdate in parent component
   - Updated React keys to remove array lengths
   - Maintained array alignment logic

## Tables to Update
3. ⏳ **Assets Table** (`assets-table.tsx`) - IN PROGRESS
   - Added import for useDebouncedUpdate hook
   - Created debouncedUpdate instance
   - Updated description field to use debounced updates
   - Need to check if rowSpan is applicable (single rows per asset)
   
4. ⏳ **Liabilities Table** (`liabilities-table.tsx`)
5. ⏳ **Income Needs Table** (`income-needs-table.tsx`)
6. ⏳ **Income Provisions Table** (`income-provisions-table-new.tsx`)
7. ⏳ **Defined Benefit Funds Table** (`defined-benefit-funds-table-correct.tsx`)
8. ⏳ **Voluntary Investments Table** (`voluntary-investments-table.tsx`)
9. ⏳ **Lump Sum Bequests Table** (`lump-sum-table.tsx`)
10. ⏳ **Residue Table** (`residue-table.tsx`)
11. ⏳ **Additional Estate Duty Items Table** (`additional-estate-duty-items-table.tsx`)

## Pattern to Apply
- Use React.Fragment with stable key (for tables with multiple rows per entity)
- Apply rowSpan to single-instance cells with align-top (for tables with arrays)
- Add useDebouncedUpdate hook for text fields
- Remove array lengths from React keys
- Add empty cell handling for array alignment