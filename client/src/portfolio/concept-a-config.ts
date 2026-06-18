import type { ColumnDef } from "./listings";
import type { CoverRow, InvestmentRow } from "./data-holdings";
import { parseAmount, parseDmy, type Accessors, type SortOption } from "./view";

/**
 * Sort accessors, sort options and column definitions for Concept A's
 * investment and cover listings. Static config, lifted out of concept-a.tsx
 * to keep that file within the size budget.
 */

export const INVESTMENT_ACCESSORS: Accessors<InvestmentRow> = {
  name: (r) => r.name,
  value: (r) => parseAmount(r.value),
  premium: (r) => parseAmount(r.premium),
  date: (r) => parseDmy(r.date),
};

export const INVESTMENT_SORTS: SortOption[] = [
  { value: "name", label: "Name (A–Z)", dir: "asc" },
  { value: "value", label: "Value (high–low)", dir: "desc" },
  { value: "date", label: "Valuation (oldest first)", dir: "asc" },
];

export const COVER_ACCESSORS: Accessors<CoverRow> = {
  name: (r) => r.name,
  premium: (r) => parseAmount(r.premium),
};

export const COVER_SORTS: SortOption[] = [
  { value: "name", label: "Name (A–Z)", dir: "asc" },
  { value: "premium", label: "Premium (high–low)", dir: "desc" },
];

export const INVESTMENT_COLUMNS: ColumnDef[] = [
  { label: "Instrument", sortKey: "name" },
  { label: "Category" },
  { label: "Supplier" },
  { label: "Premium / income", right: true, sortKey: "premium" },
  { label: "Current value", right: true, sortKey: "value" },
  { label: "Last valuation", sortKey: "date" },
];

export const coverColumns = (meta1: string, meta2: string): ColumnDef[] => [
  { label: "Instrument", sortKey: "name" },
  { label: meta1 },
  { label: meta2 },
  { label: "Premium", right: true, sortKey: "premium" },
  { label: "Status" },
];
