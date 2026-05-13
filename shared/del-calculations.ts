/**
 * Death with Estate Liquidity — projection engine (lean, demo-grade).
 *
 * Pure functions. Reads from raw schema records (assurance, retirement funds,
 * voluntary investments, liabilities, lump-sum bequests, income needs, plus the
 * user-entered estate_position_parameters table for required-side items).
 *
 * This is NOT a faithful SA estate-duty implementation. It uses entered values
 * where the user supplies them, and sums underlying records for the
 * capital-provided / dependants / income breakdowns. See the SA tax module for
 * income tax brackets if a later session wants to add CGT-on-death.
 */
import { parseAmount, parsePercent } from "./retirement-calculations";
import type {
  Assurance,
  RetirementFund,
  DefinedBenefitFund,
  VoluntaryInvestment,
  Liabilities,
  LumpSumBequest,
  IncomeNeeds,
  IncomeProvisions,
  EstatePositionParameters,
} from "./schema";

export interface PositionResult {
  provided: number;
  required: number;
  surplus: number;
  percentage: number;
}

export interface EstateBreakdownItem {
  label: string;
  amount: number;
  side: "provided" | "required";
}

export interface DelProjection {
  estatePosition: PositionResult & { breakdown: EstateBreakdownItem[] };
  dependantsPosition: PositionResult & { breakdown: EstateBreakdownItem[] };
  totalCapitalPosition: PositionResult;
  incomePosition: PositionResult & { breakdown: EstateBreakdownItem[] };
  recommendedAdditionalCover: number;
  ready: boolean;
}

export interface DelProjectionInputs {
  estateParameters: EstatePositionParameters | null;
  assurance: Assurance[];
  retirementFunds: RetirementFund[];
  definedBenefitFunds: DefinedBenefitFund[];
  voluntaryInvestments: VoluntaryInvestment[];
  liabilities: Liabilities[];
  lumpSumBequests: LumpSumBequest[];
  incomeNeeds: IncomeNeeds[];
  incomeProvisions: IncomeProvisions[];
}

function position(provided: number, required: number): PositionResult {
  const surplus = provided - required;
  const percentage = required > 0 ? (provided / required) * 100 : (provided > 0 ? 100 : 0);
  return { provided, required, surplus, percentage };
}

function sum(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0);
}

export function computeDelProjection(input: DelProjectionInputs): DelProjection {
  const p = input.estateParameters;

  // ============================================================
  // Estate position — uses user-entered values from estate_position_parameters
  // where available, falling back to sums of underlying records.
  // ============================================================

  const lifeCoverToEstate = p
    ? parseAmount(p.lifeCoverToEstate)
    : sum(
        input.assurance
          .filter(a => !a.buySell && !a.keyMan && !a.excludedFromEstateDuty)
          .map(a => parseAmount(a.deathBenefit)),
      );

  const voluntaryInvestmentsToEstate = p
    ? parseAmount(p.voluntaryInvestments)
    : sum(input.voluntaryInvestments.map(v => parseAmount(v.marketValue)));

  const accrualClaimFromSpouse = parseAmount(p?.accrualClaimFromSpouse);
  const dependantsSurplusUtilised = parseAmount(p?.dependantsSurplusUtilised);

  const estateProvided =
    lifeCoverToEstate + voluntaryInvestmentsToEstate + accrualClaimFromSpouse + dependantsSurplusUtilised;

  const estateDuty = parseAmount(p?.estateDuty);
  const executorsFees = parseAmount(p?.executorsFees);
  const settleClientLiabilities = p
    ? parseAmount(p.settleClientLiabilities)
    : sum(input.liabilities.filter(l => l.included).map(l => parseAmount(l.debtAmount)));
  const capitalGainsTax = parseAmount(p?.capitalGainsTax);
  const mastersFee = parseAmount(p?.mastersFee);
  const deathBedFuneral = parseAmount(p?.deathBedFuneralExpenses);
  const conveyancingValuation = parseAmount(p?.conveyancingValuationFees);
  const accrualClaimToSpouse = parseAmount(p?.accrualClaimToSpouse);

  const estateRequired =
    estateDuty + executorsFees + settleClientLiabilities + capitalGainsTax +
    mastersFee + deathBedFuneral + conveyancingValuation + accrualClaimToSpouse;

  const estate = position(estateProvided, estateRequired);

  const estateBreakdown: EstateBreakdownItem[] = [
    { label: "Life cover to the estate", amount: lifeCoverToEstate, side: "provided" },
    { label: "Voluntary investments to estate", amount: voluntaryInvestmentsToEstate, side: "provided" },
    { label: "Accrual claim from spouse", amount: accrualClaimFromSpouse, side: "provided" },
    { label: "Dependants' surplus utilised", amount: dependantsSurplusUtilised, side: "provided" },
    { label: "Estate duty", amount: estateDuty, side: "required" },
    { label: "Executor's fees", amount: executorsFees, side: "required" },
    { label: "Settle client's liabilities", amount: settleClientLiabilities, side: "required" },
    { label: "Capital gains tax", amount: capitalGainsTax, side: "required" },
    { label: "Master's fee", amount: mastersFee, side: "required" },
    { label: "Death bed and funeral expenses", amount: deathBedFuneral, side: "required" },
    { label: "Conveyancing and valuation fees", amount: conveyancingValuation, side: "required" },
    { label: "Accrual claim to spouse", amount: accrualClaimToSpouse, side: "required" },
  ];

  // ============================================================
  // Dependants position — life cover going to spouse/dependants + retirement
  // fund death benefits to beneficiaries + DB pension lump sums to dependants
  // vs. lump-sum bequests + capitalised income needs (less estate surplus).
  // ============================================================

  const lifeCoverToDependants = sum(
    input.assurance
      .filter(a => !a.buySell && !a.keyMan)
      .map(a => parseAmount(a.deathBenefit) * (a.excludedFromEstateDuty ? 1 : 0)),
  );

  const retirementFundDeathBenefits = sum(
    input.retirementFunds.map(f =>
      parseAmount(f.fundValueAtDeath || f.fundValue) + parseAmount(f.approvedLifeCover) + parseAmount(f.coverAmount),
    ),
  );

  const dbFundLumpSums = sum(input.definedBenefitFunds.map(f => parseAmount(f.deathLumpSum)));

  const estateSurplusUtilisedForDependants = Math.max(0, estate.surplus);

  const dependantsProvided =
    lifeCoverToDependants + retirementFundDeathBenefits + dbFundLumpSums + estateSurplusUtilisedForDependants;

  const lumpSumBequests = sum(input.lumpSumBequests.map(b => parseAmount(b.valueAtDeath) || parseAmount(b.amount)));

  // Capitalise income needs at 6% real return for demo purposes.
  const REAL_RETURN_DEFAULT = 0.06;
  const capitalisedIncomeNeeds = sum(
    input.incomeNeeds.map(n => {
      const monthlyAmount = parseAmount(n.amount);
      const termYears = parseAmount(n.termYears);
      const escalation = parsePercent(n.increasePercentage);
      if (monthlyAmount <= 0 || termYears <= 0) return 0;
      const annualAmount = monthlyAmount * 12;
      if (Math.abs(REAL_RETURN_DEFAULT - escalation) < 1e-9) {
        return annualAmount * termYears;
      }
      const ratio = (1 + escalation) / (1 + REAL_RETURN_DEFAULT);
      return annualAmount * (1 - Math.pow(ratio, termYears)) / (REAL_RETURN_DEFAULT - escalation);
    }),
  );

  const liabilitiesSettledByDependants = sum(
    input.liabilities.filter(l => l.included).map(l => parseAmount(l.others)),
  );

  const dependantsRequired = lumpSumBequests + capitalisedIncomeNeeds + liabilitiesSettledByDependants;

  const dependants = position(dependantsProvided, dependantsRequired);

  const dependantsBreakdown: EstateBreakdownItem[] = [
    { label: "Life cover to dependants", amount: lifeCoverToDependants, side: "provided" },
    { label: "Retirement fund death benefits", amount: retirementFundDeathBenefits, side: "provided" },
    { label: "Defined benefit fund lump sums", amount: dbFundLumpSums, side: "provided" },
    { label: "Estate surplus utilised", amount: estateSurplusUtilisedForDependants, side: "provided" },
    { label: "Lump sum bequests", amount: lumpSumBequests, side: "required" },
    { label: "Capitalised income needs", amount: capitalisedIncomeNeeds, side: "required" },
    { label: "Liabilities settled by dependants", amount: liabilitiesSettledByDependants, side: "required" },
  ];

  // ============================================================
  // Total capital position — sum of estate + dependants (gross, not netted).
  // ============================================================

  const totalCapitalProvided = estateProvided + lifeCoverToDependants + retirementFundDeathBenefits + dbFundLumpSums;
  const totalCapitalRequired = estateRequired + dependantsRequired;
  const totalCapital = position(totalCapitalProvided, totalCapitalRequired);

  // ============================================================
  // Income position — monthly income provided vs. required.
  // ============================================================

  const monthlyIncomeFromRetirementFunds = sum(
    input.retirementFunds.map(f => (f.monthlyIncomeCheckbox ? parseAmount(f.monthlyIncome) : 0)),
  );
  const monthlyDbPension = sum(
    input.definedBenefitFunds.map(f =>
      f.pensionIncomeCheckbox ? parseAmount(f.pensionIncomeAmount) : 0,
    ),
  );
  const monthlyAssuranceIncome = sum(
    input.assurance.map(a => (a.amount && parseAmount(a.amount) > 0 ? parseAmount(a.amount) : 0)),
  );

  const incomeProvided = monthlyIncomeFromRetirementFunds + monthlyDbPension + monthlyAssuranceIncome;

  const incomeRequired = sum(
    input.incomeNeeds.map(n => parseAmount(n.amount)),
  );

  const income = position(incomeProvided, incomeRequired);

  const incomeBreakdown: EstateBreakdownItem[] = [
    { label: "Retirement funds and living annuities", amount: monthlyIncomeFromRetirementFunds, side: "provided" },
    { label: "Defined benefit pension", amount: monthlyDbPension, side: "provided" },
    { label: "Assurance monthly income", amount: monthlyAssuranceIncome, side: "provided" },
    { label: "Monthly income needs", amount: incomeRequired, side: "required" },
  ];

  // ============================================================
  // Implement recommendation — additional life cover to close the gap.
  // ============================================================

  const recommendedAdditionalCover = Math.max(0, -totalCapital.surplus);

  const ready =
    !!p ||
    input.assurance.length > 0 ||
    input.retirementFunds.length > 0 ||
    input.voluntaryInvestments.length > 0 ||
    input.liabilities.length > 0;

  return {
    estatePosition: { ...estate, breakdown: estateBreakdown },
    dependantsPosition: { ...dependants, breakdown: dependantsBreakdown },
    totalCapitalPosition: totalCapital,
    incomePosition: { ...income, breakdown: incomeBreakdown },
    recommendedAdditionalCover,
    ready,
  };
}
