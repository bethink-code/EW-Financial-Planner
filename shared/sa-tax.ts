/**
 * South African income tax — 2025/2026 tax year (1 Mar 2025 – 28 Feb 2026).
 * Pure functions, no framework or DB deps.
 *
 * All amounts in Rand. Income arguments are annual unless noted.
 */

export type SaTaxYear = "2025/2026";

interface Bracket {
  upTo: number;
  base: number;
  rate: number;
  threshold: number;
}

const BRACKETS_2025_2026: Bracket[] = [
  { upTo: 237_100, base: 0, rate: 0.18, threshold: 0 },
  { upTo: 370_500, base: 42_678, rate: 0.26, threshold: 237_100 },
  { upTo: 512_800, base: 77_362, rate: 0.31, threshold: 370_500 },
  { upTo: 673_000, base: 121_475, rate: 0.36, threshold: 512_800 },
  { upTo: 857_900, base: 179_147, rate: 0.39, threshold: 673_000 },
  { upTo: 1_817_000, base: 251_258, rate: 0.41, threshold: 857_900 },
  { upTo: Infinity, base: 644_489, rate: 0.45, threshold: 1_817_000 },
];

const PRIMARY_REBATE_2025_2026 = 17_235;
const SECONDARY_REBATE_2025_2026 = 9_444;
const TERTIARY_REBATE_2025_2026 = 3_145;

const RA_DEDUCTION_RATE = 0.275;
const RA_DEDUCTION_ANNUAL_CAP = 350_000;

export function annualIncomeTax(opts: {
  annualTaxableIncome: number;
  age: number;
  taxYear?: SaTaxYear;
}): number {
  const income = Math.max(0, opts.annualTaxableIncome);
  const bracket = BRACKETS_2025_2026.find(b => income <= b.upTo)!;
  const gross = bracket.base + (income - bracket.threshold) * bracket.rate;

  let rebate = PRIMARY_REBATE_2025_2026;
  if (opts.age >= 65) rebate += SECONDARY_REBATE_2025_2026;
  if (opts.age >= 75) rebate += TERTIARY_REBATE_2025_2026;

  return Math.max(0, gross - rebate);
}

export function marginalTaxRate(opts: {
  annualTaxableIncome: number;
  taxYear?: SaTaxYear;
}): number {
  const income = Math.max(0, opts.annualTaxableIncome);
  return BRACKETS_2025_2026.find(b => income <= b.upTo)!.rate;
}

/**
 * Maximum tax-deductible retirement contribution for the year.
 * SA rule: lesser of 27.5% of taxable income (or remuneration, whichever is higher)
 * and R350,000 annual cap.
 */
export function raDeductionCap(opts: {
  annualTaxableIncome: number;
  taxYear?: SaTaxYear;
}): number {
  const income = Math.max(0, opts.annualTaxableIncome);
  return Math.min(income * RA_DEDUCTION_RATE, RA_DEDUCTION_ANNUAL_CAP);
}

/**
 * Tax saving from an additional annual RA contribution, at the taxpayer's marginal rate.
 * Does NOT model the bracket walk — uses the marginal rate at the current income level.
 * Reasonable approximation for typical advice-context conversations.
 */
export function raContributionTaxSaving(opts: {
  annualContribution: number;
  annualTaxableIncome: number;
  taxYear?: SaTaxYear;
}): number {
  if (opts.annualContribution <= 0) return 0;
  const cap = raDeductionCap({ annualTaxableIncome: opts.annualTaxableIncome });
  const deductible = Math.min(opts.annualContribution, cap);
  const rate = marginalTaxRate({ annualTaxableIncome: opts.annualTaxableIncome });
  return deductible * rate;
}

/**
 * Split an additional monthly top-up across RA (tax-deductible) and voluntary buckets.
 * Rule: fill remaining RA deduction room first, then route the remainder to voluntary.
 *
 * All inputs/outputs in Rand. `currentMonthlyRaContribution` is the user's existing
 * RA contributions, summed across all retirement funds.
 */
export interface ContributionAllocation {
  raMonthly: number;
  voluntaryMonthly: number;
  raAnnualDeduction: number;
  raDeductionCap: number;
  raRoomRemainingBefore: number;
  marginalRate: number;
  annualTaxSavingFromTopUp: number;
}

export function allocateAdditionalContribution(opts: {
  additionalMonthlyContribution: number;
  currentMonthlyRaContribution: number;
  annualTaxableIncome: number;
  taxYear?: SaTaxYear;
}): ContributionAllocation {
  const additional = Math.max(0, opts.additionalMonthlyContribution);
  const currentAnnualRa = Math.max(0, opts.currentMonthlyRaContribution) * 12;
  const cap = raDeductionCap({ annualTaxableIncome: opts.annualTaxableIncome });
  const roomBefore = Math.max(0, cap - currentAnnualRa);

  const additionalAnnual = additional * 12;
  const allocatedToRaAnnual = Math.min(additionalAnnual, roomBefore);
  const allocatedToVoluntaryAnnual = additionalAnnual - allocatedToRaAnnual;

  const rate = marginalTaxRate({ annualTaxableIncome: opts.annualTaxableIncome });

  return {
    raMonthly: allocatedToRaAnnual / 12,
    voluntaryMonthly: allocatedToVoluntaryAnnual / 12,
    raAnnualDeduction: allocatedToRaAnnual,
    raDeductionCap: cap,
    raRoomRemainingBefore: roomBefore,
    marginalRate: rate,
    annualTaxSavingFromTopUp: allocatedToRaAnnual * rate,
  };
}
