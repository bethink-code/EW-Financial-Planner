/**
 * Retirement projection engine — pure functions, no framework or DB dependencies.
 *
 * All rates are decimals (0.10 = 10%). All amounts are numbers (Rand).
 * Time is in whole years unless noted otherwise.
 */

import type {
  RetirementParameters,
  RetirementFund,
  DefinedBenefitFund,
  VoluntaryInvestment,
  FutureInflow,
  RetirementLumpSumNeed,
  IncomeNeeds,
  IncomeProvisions,
} from "./schema";
import {
  allocateAdditionalContribution,
  type ContributionAllocation,
} from "./sa-tax";

// ============================================================
// Parsing helpers (currency / percentage strings → numbers)
// ============================================================

export function parseAmount(value: string | null | undefined): number {
  if (!value) return 0;
  const cleaned = String(value).replace(/[^\d.-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

export function parsePercent(value: string | null | undefined): number {
  return parseAmount(value) / 100;
}

export function parseYears(value: string | null | undefined): number {
  return parseAmount(value);
}

// ============================================================
// Leaf calculations
// ============================================================

/**
 * Project a fund forward to retirement.
 * Annual compounding model: balance grows by `growthRate`, contribution paid at year-end,
 * contribution escalates by `contributionEscalation` annually.
 */
export function projectFundForward(opts: {
  currentValue: number;
  monthlyContribution: number;
  contributionEscalation: number;
  growthRate: number;
  yearsToRetirement: number;
}): number {
  const {
    currentValue,
    monthlyContribution,
    contributionEscalation,
    growthRate,
    yearsToRetirement,
  } = opts;
  if (yearsToRetirement <= 0) return currentValue;

  // FV of the existing balance.
  const fvLumpSum = currentValue * Math.pow(1 + growthRate, yearsToRetirement);

  if (monthlyContribution <= 0) return fvLumpSum;

  // FV of an escalating annual annuity (year-end contributions).
  const annualContribution = monthlyContribution * 12;
  let fvAnnuity: number;
  if (Math.abs(growthRate - contributionEscalation) < 1e-9) {
    fvAnnuity =
      annualContribution *
      yearsToRetirement *
      Math.pow(1 + growthRate, yearsToRetirement - 1);
  } else {
    fvAnnuity =
      (annualContribution *
        (Math.pow(1 + growthRate, yearsToRetirement) -
          Math.pow(1 + contributionEscalation, yearsToRetirement))) /
      (growthRate - contributionEscalation);
  }

  return fvLumpSum + fvAnnuity;
}

/**
 * Discount a future value back to today's terms (real-terms equivalent).
 */
export function discountToCurrentTerms(opts: {
  futureValue: number;
  discountRate: number;
  years: number;
}): number {
  const { futureValue, discountRate, years } = opts;
  if (years <= 0) return futureValue;
  return futureValue / Math.pow(1 + discountRate, years);
}

/**
 * Present value of a growing annuity, paid at frequency `periodsPerYear`,
 * escalating annually at `escalation`, discounted at `discount`.
 */
export function presentValueGrowingAnnuity(opts: {
  paymentPerPeriod: number;
  escalation: number;
  discount: number;
  termYears: number;
  periodsPerYear: number;
}): number {
  const { paymentPerPeriod, escalation, discount, termYears, periodsPerYear } =
    opts;
  if (paymentPerPeriod <= 0 || termYears <= 0 || periodsPerYear <= 0) return 0;

  const totalPeriods = termYears * periodsPerYear;
  const periodicDiscount = discount / periodsPerYear;
  const periodicEscalation = escalation / periodsPerYear;

  if (Math.abs(periodicDiscount - periodicEscalation) < 1e-9) {
    return paymentPerPeriod * totalPeriods;
  }

  const ratio = (1 + periodicEscalation) / (1 + periodicDiscount);
  return (
    (paymentPerPeriod * (1 - Math.pow(ratio, totalPeriods))) /
    (periodicDiscount - periodicEscalation)
  );
}

/**
 * Capital equivalent at retirement of a defined-benefit pension stream.
 */
export function dbPensionToCapitalEquivalent(opts: {
  monthlyIncome: number;
  escalation: number;
  realReturn: number;
  yearsAfterRetirement: number;
}): number {
  return presentValueGrowingAnnuity({
    paymentPerPeriod: opts.monthlyIncome,
    escalation: opts.escalation,
    discount: opts.realReturn,
    termYears: opts.yearsAfterRetirement,
    periodsPerYear: 12,
  });
}

/**
 * Capital required at retirement to fund an income stream.
 * `taxableFraction` and `taxRate` allow the engine to gross up the required pre-tax income.
 */
export function requiredCapitalForIncome(opts: {
  monthlyAmount: number;
  escalation: number;
  termYears: number;
  realReturn: number;
  frequency: "monthly" | "quarterly" | "annual";
  taxableFraction?: number;
  taxRate?: number;
}): number {
  const periodsPerYear =
    opts.frequency === "monthly" ? 12 : opts.frequency === "quarterly" ? 4 : 1;
  const taxable = opts.taxableFraction ?? 0;
  const tax = opts.taxRate ?? 0;
  // Gross-up: if taxable fraction is t and tax rate is r, net = gross × (1 - t × r).
  // To deliver `monthlyAmount` net, gross = monthlyAmount / (1 - t × r).
  const grossingFactor = 1 - taxable * tax;
  const grossPayment =
    grossingFactor > 0
      ? opts.monthlyAmount / grossingFactor
      : opts.monthlyAmount;
  return presentValueGrowingAnnuity({
    paymentPerPeriod: grossPayment,
    escalation: opts.escalation,
    discount: opts.realReturn,
    termYears: opts.termYears,
    periodsPerYear,
  });
}

/**
 * Future inflow's value when it lands (after retirement).
 * If `calculateCgt` is true, applies a flat 18% effective CGT on the gain
 * (current SA effective rate for individuals at top bracket — refine in a follow-up).
 */
export function projectFutureInflow(opts: {
  currentValue: number;
  growthRate: number;
  yearsAfterRetirement: number;
  calculateCgt: boolean;
}): number {
  const future =
    opts.currentValue *
    Math.pow(1 + opts.growthRate, Math.max(0, opts.yearsAfterRetirement));
  if (!opts.calculateCgt) return future;
  const gain = Math.max(0, future - opts.currentValue);
  return future - gain * 0.18;
}

/**
 * Future value of an escalating monthly contribution stream by retirement.
 * Forward direction of `additionalMonthlyContribution` — given a monthly
 * amount, returns the capital it accumulates to at retirement.
 *
 * Same annuity model: year-end contribution, contribution escalates
 * annually, balance grows annually.
 */
export function futureValueOfMonthlyContribution(opts: {
  monthlyContribution: number;
  growthRate: number;
  contributionEscalation: number;
  yearsToRetirement: number;
}): number {
  const {
    monthlyContribution,
    growthRate,
    contributionEscalation,
    yearsToRetirement,
  } = opts;
  if (monthlyContribution <= 0 || yearsToRetirement <= 0) return 0;
  const annualContribution = monthlyContribution * 12;
  let annuityFactor: number;
  if (Math.abs(growthRate - contributionEscalation) < 1e-9) {
    annuityFactor =
      yearsToRetirement * Math.pow(1 + growthRate, yearsToRetirement - 1);
  } else {
    annuityFactor =
      (Math.pow(1 + growthRate, yearsToRetirement) -
        Math.pow(1 + contributionEscalation, yearsToRetirement)) /
      (growthRate - contributionEscalation);
  }
  return annualContribution * annuityFactor;
}

/**
 * Additional monthly contribution required to close a retirement shortfall
 * by the retirement date, given an escalating contribution and annual growth.
 *
 * Inverts `projectFundForward` for the annuity portion only.
 */
export function additionalMonthlyContribution(opts: {
  shortfallAtRetirement: number;
  growthRate: number;
  contributionEscalation: number;
  yearsToRetirement: number;
}): number {
  const {
    shortfallAtRetirement,
    growthRate,
    contributionEscalation,
    yearsToRetirement,
  } = opts;
  if (shortfallAtRetirement <= 0 || yearsToRetirement <= 0) return 0;

  let annuityFactor: number;
  if (Math.abs(growthRate - contributionEscalation) < 1e-9) {
    annuityFactor =
      yearsToRetirement * Math.pow(1 + growthRate, yearsToRetirement - 1);
  } else {
    annuityFactor =
      (Math.pow(1 + growthRate, yearsToRetirement) -
        Math.pow(1 + contributionEscalation, yearsToRetirement)) /
      (growthRate - contributionEscalation);
  }
  if (annuityFactor <= 0) return 0;

  const requiredAnnual = shortfallAtRetirement / annuityFactor;
  return requiredAnnual / 12;
}

// ============================================================
// Aggregator: takes raw schema records and produces a projection summary.
// ============================================================

export interface PerVehicleProjection {
  id: number;
  description: string;
  capitalAtRetirement: number;
  valueInCurrentTerms: number;
  // Future inflows only: nominal value at the moment the inflow arrives,
  // before discounting back to retirement-date capital.
  valueAtInflow?: number;
}

/**
 * Two-value row for need-summary KPIs (Capital at retirement + Value in
 * current terms). Used for Voluntary capital surplus, Income surplus and
 * Surplus capital — all aggregates of existing per-vehicle projections.
 */
export interface SurplusRow {
  capitalAtRetirement: number;
  valueInCurrentTerms: number;
}

export interface RetirementProjection {
  yearsToRetirement: number;
  yearsAfterRetirement: number;
  inflationProxy: number;
  capitalProvided: number;
  capitalRequired: number;
  surplus: number;
  coverage: number;
  // Need summary — three surplus rows surfaced on the projection ribbon and
  // the Project step. Definitions:
  //   voluntaryCapitalSurplus = voluntary investments + future inflows − lump sum needs
  //   incomeSurplus           = income provided − income required
  //   surplusCapital          = capital provided − capital required (top-level)
  voluntaryCapitalSurplus: SurplusRow;
  incomeSurplus: SurplusRow;
  surplusCapital: SurplusRow;
  retirementFunds: PerVehicleProjection[];
  definedBenefitFunds: PerVehicleProjection[];
  voluntaryInvestments: PerVehicleProjection[];
  futureInflows: PerVehicleProjection[];
  lumpSumNeeds: PerVehicleProjection[];
  incomeRequired: PerVehicleProjection[];
  incomeProvided: PerVehicleProjection[];
  additionalMonthlyContribution: number;
  contributionAllocation: ContributionAllocation | null;
  currentMonthlyRaContribution: number;
  annualTaxableIncome: number;
  ready: boolean;
}

const DEFAULT_INFLATION = 0.06;

export interface ProjectionInputs {
  parameters: RetirementParameters | null;
  clientAge: number;
  retirementFunds: RetirementFund[];
  definedBenefitFunds: DefinedBenefitFund[];
  voluntaryInvestments: VoluntaryInvestment[];
  futureInflows: FutureInflow[];
  lumpSumNeeds: RetirementLumpSumNeed[];
  incomeNeeds: IncomeNeeds[];
  incomeProvisions: IncomeProvisions[];
}

export function computeRetirementProjection(
  input: ProjectionInputs
): RetirementProjection {
  const ready = !!input.parameters && (input.clientAge ?? 0) > 0;
  const params =
    input.parameters ??
    ({ retirementAge: 65, retirementPlanningAge: 90 } as RetirementParameters);

  const yearsToRetirement = Math.max(
    0,
    params.retirementAge - (input.clientAge || 0)
  );
  const yearsAfterRetirement = Math.max(
    0,
    params.retirementPlanningAge - params.retirementAge
  );
  const inflation = DEFAULT_INFLATION;

  // Project capital sources forward to retirement.
  const retirementFundProjections: PerVehicleProjection[] =
    input.retirementFunds.map((f) => {
      const capital = projectFundForward({
        currentValue: parseAmount(f.fundValue),
        monthlyContribution: parseAmount(f.monthlyContribution),
        contributionEscalation: parsePercent(f.contributionEscalation),
        growthRate: parsePercent(f.growthRate),
        yearsToRetirement,
      });
      return {
        id: f.id,
        description: f.description ?? "",
        capitalAtRetirement: capital,
        valueInCurrentTerms: discountToCurrentTerms({
          futureValue: capital,
          discountRate: inflation,
          years: yearsToRetirement,
        }),
      };
    });

  const dbFundProjections: PerVehicleProjection[] =
    input.definedBenefitFunds.map((f) => {
      const monthlyIncome = parseAmount(f.pensionIncomeAmount);
      const escalation = parsePercent(f.pensionIncomeIncrease);
      const lumpSum = parseAmount(f.deathLumpSum);
      const growthRate = parsePercent(f.growthRate);
      const realReturn = Math.max(0.001, growthRate - inflation);

      const pensionCapital = dbPensionToCapitalEquivalent({
        monthlyIncome,
        escalation,
        realReturn,
        yearsAfterRetirement,
      });
      const projectedLumpSum =
        lumpSum * Math.pow(1 + growthRate, yearsToRetirement);
      const total = pensionCapital + projectedLumpSum;
      return {
        id: f.id,
        description: f.description,
        capitalAtRetirement: total,
        valueInCurrentTerms: discountToCurrentTerms({
          futureValue: total,
          discountRate: inflation,
          years: yearsToRetirement,
        }),
      };
    });

  const voluntaryProjections: PerVehicleProjection[] =
    input.voluntaryInvestments.map((v) => {
      const capital = projectFundForward({
        currentValue: parseAmount(v.marketValue),
        monthlyContribution: parseAmount(v.monthlyContribution),
        contributionEscalation: parsePercent(v.contributionEscalation),
        growthRate: parsePercent(v.growthRate),
        yearsToRetirement,
      });
      return {
        id: v.id,
        description: v.description,
        capitalAtRetirement: capital,
        valueInCurrentTerms: discountToCurrentTerms({
          futureValue: capital,
          discountRate: inflation,
          years: yearsToRetirement,
        }),
      };
    });

  const futureInflowProjections: PerVehicleProjection[] =
    input.futureInflows.map((f) => {
      const valueAtInflow = projectFutureInflow({
        currentValue: parseAmount(f.currentValue),
        growthRate: parsePercent(f.growthRate),
        yearsAfterRetirement: f.startYearsAfterRetirement,
        calculateCgt: f.calculateCgt,
      });
      // Discount the future inflow back to retirement-date capital terms.
      const realReturn = Math.max(
        0.001,
        parsePercent(f.growthRate) - inflation
      );
      const capitalAtRetirement =
        valueAtInflow / Math.pow(1 + realReturn, f.startYearsAfterRetirement);
      return {
        id: f.id,
        description: f.description,
        capitalAtRetirement,
        valueInCurrentTerms: discountToCurrentTerms({
          futureValue: capitalAtRetirement,
          discountRate: inflation,
          years: yearsToRetirement,
        }),
        valueAtInflow,
      };
    });

  // Project capital uses (required at retirement).
  const lumpSumProjections: PerVehicleProjection[] = input.lumpSumNeeds.map(
    (n) => {
      const amount = parseAmount(n.amount);
      const escalation = parsePercent(n.increasePercentage);
      const startYears = n.startYears;
      const periodsPerYear =
        n.frequency === "Monthly"
          ? 12
          : n.frequency === "Quarterly"
          ? 4
          : n.frequency === "Annual"
          ? 1
          : 0;
      const realReturn = Math.max(0.001, 0.1 - inflation); // assume 10% nominal post-retirement growth

      let capitalAtRetirement: number;
      if (n.frequency === "Single" || periodsPerYear === 0) {
        // Single payment startYears after retirement, escalated at `escalation`.
        const escalated = amount * Math.pow(1 + escalation, startYears);
        capitalAtRetirement = escalated / Math.pow(1 + realReturn, startYears);
      } else {
        // Recurring stream over `termYears`, starting `startYears` after retirement.
        const pvAtStart = presentValueGrowingAnnuity({
          paymentPerPeriod: amount,
          escalation,
          discount: realReturn,
          termYears: n.termYears,
          periodsPerYear,
        });
        capitalAtRetirement = pvAtStart / Math.pow(1 + realReturn, startYears);
      }

      return {
        id: n.id,
        description: n.description,
        capitalAtRetirement,
        valueInCurrentTerms: discountToCurrentTerms({
          futureValue: capitalAtRetirement,
          discountRate: inflation,
          years: yearsToRetirement,
        }),
      };
    }
  );

  const incomeRequiredProjections: PerVehicleProjection[] =
    input.incomeNeeds.map((n) => {
      const realReturn = Math.max(0.001, 0.1 - inflation);
      const capital = requiredCapitalForIncome({
        monthlyAmount: parseAmount(n.amount),
        escalation: parsePercent(n.increasePercentage),
        termYears: parseYears(n.termYears),
        realReturn,
        frequency:
          (n.frequency as "monthly" | "quarterly" | "annual") ?? "monthly",
      });
      return {
        id: n.id,
        description: n.description,
        capitalAtRetirement: capital,
        valueInCurrentTerms: discountToCurrentTerms({
          futureValue: capital,
          discountRate: inflation,
          years: yearsToRetirement,
        }),
      };
    });

  const incomeProvidedProjections: PerVehicleProjection[] =
    input.incomeProvisions.map((p) => {
      const realReturn = Math.max(0.001, 0.1 - inflation);
      const capital = requiredCapitalForIncome({
        monthlyAmount: parseAmount(p.amount),
        escalation: parsePercent(p.increasePercentage),
        termYears: parseYears(p.termYears),
        realReturn,
        frequency:
          (p.frequency as "monthly" | "quarterly" | "annual") ?? "monthly",
        taxableFraction: parsePercent(p.taxPercentage),
        taxRate: parsePercent(p.taxRate),
      });
      return {
        id: p.id,
        description: p.description,
        capitalAtRetirement: capital,
        valueInCurrentTerms: discountToCurrentTerms({
          futureValue: capital,
          discountRate: inflation,
          years: yearsToRetirement,
        }),
      };
    });

  const sum = (xs: PerVehicleProjection[]) =>
    xs.reduce((s, x) => s + x.capitalAtRetirement, 0);
  const sumCurrent = (xs: PerVehicleProjection[]) =>
    xs.reduce((s, x) => s + x.valueInCurrentTerms, 0);

  const capitalProvided =
    sum(retirementFundProjections) +
    sum(dbFundProjections) +
    sum(voluntaryProjections) +
    sum(futureInflowProjections) +
    sum(incomeProvidedProjections);

  const capitalProvidedCurrent =
    sumCurrent(retirementFundProjections) +
    sumCurrent(dbFundProjections) +
    sumCurrent(voluntaryProjections) +
    sumCurrent(futureInflowProjections) +
    sumCurrent(incomeProvidedProjections);

  const capitalRequired =
    sum(lumpSumProjections) + sum(incomeRequiredProjections);
  const capitalRequiredCurrent =
    sumCurrent(lumpSumProjections) + sumCurrent(incomeRequiredProjections);

  const surplus = capitalProvided - capitalRequired;

  // Need-summary surplus rows.
  const voluntaryCapitalSurplus: SurplusRow = {
    capitalAtRetirement:
      sum(voluntaryProjections) +
      sum(futureInflowProjections) -
      sum(lumpSumProjections),
    valueInCurrentTerms:
      sumCurrent(voluntaryProjections) +
      sumCurrent(futureInflowProjections) -
      sumCurrent(lumpSumProjections),
  };
  const incomeSurplus: SurplusRow = {
    capitalAtRetirement:
      sum(incomeProvidedProjections) - sum(incomeRequiredProjections),
    valueInCurrentTerms:
      sumCurrent(incomeProvidedProjections) -
      sumCurrent(incomeRequiredProjections),
  };
  const surplusCapital: SurplusRow = {
    capitalAtRetirement: surplus,
    valueInCurrentTerms: capitalProvidedCurrent - capitalRequiredCurrent,
  };
  const coverage =
    capitalRequired > 0
      ? capitalProvided / capitalRequired
      : capitalProvided > 0
      ? 1
      : 0;

  const additionalContribution =
    surplus < 0
      ? additionalMonthlyContribution({
          shortfallAtRetirement: Math.abs(surplus),
          growthRate: 0.1,
          contributionEscalation: 0.06,
          yearsToRetirement,
        })
      : 0;

  const currentMonthlyRaContribution = input.retirementFunds.reduce(
    (sum, f) => sum + parseAmount(f.monthlyContribution),
    0
  );
  const annualTaxableIncome = parseAmount(
    input.parameters?.currentAnnualIncome
  );

  const contributionAllocation =
    additionalContribution > 0
      ? allocateAdditionalContribution({
          additionalMonthlyContribution: additionalContribution,
          currentMonthlyRaContribution,
          annualTaxableIncome,
        })
      : null;

  return {
    yearsToRetirement,
    yearsAfterRetirement,
    inflationProxy: inflation,
    capitalProvided,
    capitalRequired,
    surplus,
    coverage,
    voluntaryCapitalSurplus,
    incomeSurplus,
    surplusCapital,
    retirementFunds: retirementFundProjections,
    definedBenefitFunds: dbFundProjections,
    voluntaryInvestments: voluntaryProjections,
    futureInflows: futureInflowProjections,
    lumpSumNeeds: lumpSumProjections,
    incomeRequired: incomeRequiredProjections,
    incomeProvided: incomeProvidedProjections,
    additionalMonthlyContribution: additionalContribution,
    contributionAllocation,
    currentMonthlyRaContribution,
    annualTaxableIncome,
    ready,
  };
}

/**
 * Smart-landing readiness rule for the retirement need.
 * Returns true when there's enough data to render a meaningful projection.
 */
export function isRetirementReadyToProject(input: ProjectionInputs): boolean {
  if (!input.parameters) return false;
  if (!input.clientAge || input.clientAge <= 0) return false;
  const hasCapitalSource =
    input.retirementFunds.some(
      (f) =>
        parseAmount(f.fundValue) > 0 || parseAmount(f.monthlyContribution) > 0
    ) ||
    input.definedBenefitFunds.some(
      (f) =>
        parseAmount(f.deathLumpSum) > 0 ||
        parseAmount(f.pensionIncomeAmount) > 0
    ) ||
    input.voluntaryInvestments.some(
      (v) =>
        parseAmount(v.marketValue) > 0 || parseAmount(v.monthlyContribution) > 0
    ) ||
    input.futureInflows.some((f) => parseAmount(f.currentValue) > 0);
  const hasIncomeNeed = input.incomeNeeds.some(
    (n) => parseAmount(n.amount) > 0
  );
  return hasCapitalSource && hasIncomeNeed;
}
