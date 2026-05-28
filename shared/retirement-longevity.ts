/**
 * Retirement drawdown simulation — "how long will the capital last?".
 *
 * A self-contained, nominal year-by-year model (per the Drawdown Calculator
 * brief). Capital accumulates with growth + escalating saving until retirement,
 * then is drawn down by the escalating income required. Balances are NOT
 * clamped — the curve is allowed to cross below zero so the year the portfolio
 * runs out is visible.
 *
 * Pure and framework-free. The Project page runs it twice — the frozen
 * "Current" baseline and the live "Projected" levers — for the comparison
 * chart, and uses the binary-search helpers for the sustainable-income figure
 * and the "set to required" saving preset.
 */

export interface DrawdownInputs {
  /** Client's age today (start of the chart). */
  currentAge: number;
  /** Age saving stops — capital peaks here; drawdown begins the year after. */
  retirementAge: number;
  /** End of the projection (right edge of the chart). */
  untilAge: number;
  /** Starting balance at the current age. */
  startingBalance: number;
  /** Monthly contribution during accumulation (escalates with CPI). */
  monthlySaving: number;
  /** Monthly income required in today's money (escalates with CPI). */
  monthlyIncomeRequired: number;
  /** Inflation / CPI as a percent (e.g. 6). */
  cpiPct: number;
  /** Real return above CPI as a percent (e.g. 3). Nominal yield = CPI + this. */
  yieldPremiumPct: number;
}

export interface DrawdownPoint {
  age: number;
  /** Nominal portfolio balance (may be negative once depleted). */
  balance: number;
}

export interface DrawdownResult {
  series: DrawdownPoint[];
  /** Age the balance first goes negative, interpolated within the year.
   *  `null` when the portfolio lasts to `untilAge`. */
  depletionAge: number | null;
  /** Balance at `untilAge` — drives the sustainability binary search. */
  finalBalance: number;
}

/** Nominal annual yield from the CPI + premium convention (additive, to match
 *  the "CPI + X%" UI label). */
export function nominalYield(cpiPct: number, yieldPremiumPct: number): number {
  return (cpiPct + yieldPremiumPct) / 100;
}

export function simulateDrawdown(inputs: DrawdownInputs): DrawdownResult {
  const {
    currentAge,
    retirementAge,
    untilAge,
    startingBalance,
    monthlySaving,
    monthlyIncomeRequired,
    cpiPct,
  } = inputs;

  const i = cpiPct / 100;
  const r = nominalYield(cpiPct, inputs.yieldPremiumPct);
  const annualSaving = monthlySaving * 12;
  const annualIncome = monthlyIncomeRequired * 12;

  const startAge = Math.round(currentAge);
  const retAge = Math.round(retirementAge);
  const endAge = Math.max(startAge, Math.round(untilAge));

  const series: DrawdownPoint[] = [{ age: startAge, balance: startingBalance }];
  let balance = startingBalance;
  let depletionAge: number | null = null;

  for (let n = startAge + 1; n <= endAge; n++) {
    // Escalation uses years-from-today, so the income the user enters stays in
    // today's money regardless of when drawdown starts.
    const escalation = Math.pow(1 + i, n - startAge);
    // Contribute while working; the retirement year is pure growth (no
    // contribution, no withdrawal) so capital peaks exactly at retirement;
    // drawdown begins the year after.
    const flow =
      n < retAge
        ? annualSaving * escalation
        : n > retAge
        ? -annualIncome * escalation
        : 0;
    const prev = balance;
    balance = prev * (1 + r) + flow;

    if (balance < 0 && prev >= 0 && depletionAge === null) {
      // Interpolate the crossing within the year for a smoother readout.
      depletionAge = n - 1 + prev / (prev - balance);
    }
    series.push({ age: n, balance });
  }

  return { series, depletionAge, finalBalance: balance };
}

/**
 * Highest sustainable monthly income (today's money) that leaves the portfolio
 * at or above zero by `untilAge`. Binary search per the brief.
 */
export function maxSustainableIncome(
  inputs: Omit<DrawdownInputs, "monthlyIncomeRequired">
): number {
  let lo = 0;
  let hi = 500_000;
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2;
    const { finalBalance } = simulateDrawdown({
      ...inputs,
      monthlyIncomeRequired: mid,
    });
    if (finalBalance >= 0) lo = mid;
    else hi = mid;
  }
  return lo;
}

/**
 * Monthly saving that exactly funds the current required income — i.e. lands
 * the final balance at zero. Binary search per the brief.
 */
export function requiredSaving(
  inputs: Omit<DrawdownInputs, "monthlySaving">
): number {
  let lo = 0;
  let hi = 100_000;
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2;
    const { finalBalance } = simulateDrawdown({
      ...inputs,
      monthlySaving: mid,
    });
    if (finalBalance >= 0) hi = mid;
    else lo = mid;
  }
  return hi;
}
