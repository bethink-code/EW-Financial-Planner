/**
 * Guaranteed-income (term-annuity) projection — the second Project view.
 *
 * The alternative narrative to the "Capital over time" drawdown: take the
 * Two-Pot cash lump sums across all funds, pay the once-off SARS retirement
 * lump-sum tax on the aggregate, then use the residual capital to buy a
 * guaranteed annuity paying a level/escalating income for a fixed term.
 *
 * Pure and framework-free. The Project page computes this client-side from the
 * captured projection (the same inputs the drawdown view uses), so no API.
 */

import { presentValueGrowingAnnuity } from "./retirement-calculations";
import { retirementLumpSumTax } from "./sa-tax";

export interface GuaranteedIncomeInputs {
  /** Total pot at retirement (the rail's capital-at-retirement). */
  capitalAtRetirement: number;
  /** Aggregate Two-Pot cash commuted across all funds (gross, at retirement). */
  lumpSumCommuted: number;
  /** Income escalation as a percent (e.g. 4.5). */
  cpiPct: number;
  /** Annuity return premium over CPI as a percent. Nominal = CPI + this. */
  yieldPremiumPct: number;
  /** Guaranteed term in years. */
  termYears: number;
}

export interface GuaranteedIncomeResult {
  /** Cash lump sum taken (gross), capped at the available capital. */
  lumpSumGross: number;
  /** SARS retirement lump-sum tax on the aggregate. */
  lumpSumTax: number;
  /** Cash in hand after tax. */
  lumpSumNet: number;
  /** Residual capital that buys the annuity. */
  annuityCapital: number;
  /** Guaranteed monthly income for the term (gross, escalating at CPI). */
  monthlyIncome: number;
  /** Effective tax rate on the lump sum (0 when no lump sum taken). */
  lumpSumTaxRate: number;
  termYears: number;
}

export function computeGuaranteedIncome(
  input: GuaranteedIncomeInputs
): GuaranteedIncomeResult {
  const capital = Math.max(0, input.capitalAtRetirement);
  const lumpSumGross = Math.max(0, Math.min(input.lumpSumCommuted, capital));
  const lumpSumTax = retirementLumpSumTax({ lumpSum: lumpSumGross });
  const lumpSumNet = lumpSumGross - lumpSumTax;
  const annuityCapital = Math.max(0, capital - lumpSumGross);

  const escalation = input.cpiPct / 100;
  const discount = Math.max(
    0.001,
    (input.cpiPct + input.yieldPremiumPct) / 100
  );
  // PV of a R1/month escalating stream over the term, then invert for the
  // payment the residual capital actually buys.
  const pvPerRand = presentValueGrowingAnnuity({
    paymentPerPeriod: 1,
    escalation,
    discount,
    termYears: input.termYears,
    periodsPerYear: 12,
  });
  const monthlyIncome = pvPerRand > 0 ? annuityCapital / pvPerRand : 0;

  return {
    lumpSumGross,
    lumpSumTax,
    lumpSumNet,
    annuityCapital,
    monthlyIncome,
    lumpSumTaxRate: lumpSumGross > 0 ? lumpSumTax / lumpSumGross : 0,
    termYears: input.termYears,
  };
}
