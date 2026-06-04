import { describe, expect, it } from "vitest";
import {
  additionalMonthlyContribution,
  computeRetirementProjection,
  dbPensionToCapitalEquivalent,
  isRetirementReadyToProject,
  presentValueGrowingAnnuity,
  projectFundForward,
  projectFutureInflow,
  projectTwoPotFund,
  requiredCapitalForIncome,
  parseAmount,
  parsePercent,
  parseYears,
} from "./retirement-calculations";

const close = (a: number, b: number, tol = 1e-2) =>
  expect(Math.abs(a - b)).toBeLessThan(tol);

describe("parsing helpers", () => {
  it("parses currency strings", () => {
    expect(parseAmount("R 1,234.56")).toBe(1234.56);
    expect(parseAmount("R 0")).toBe(0);
    expect(parseAmount("")).toBe(0);
    expect(parseAmount(null)).toBe(0);
    expect(parseAmount(undefined)).toBe(0);
  });
  it("parses percent strings", () => {
    expect(parsePercent("10%")).toBe(0.1);
    expect(parsePercent("0%")).toBe(0);
    expect(parsePercent("6.5%")).toBeCloseTo(0.065);
  });
  it("parses years strings", () => {
    expect(parseYears("25 years")).toBe(25);
    expect(parseYears("0 years")).toBe(0);
  });
});

describe("projectFundForward", () => {
  it("zero-year projection returns current value", () => {
    expect(
      projectFundForward({
        currentValue: 1000000,
        monthlyContribution: 5000,
        contributionEscalation: 0.06,
        growthRate: 0.1,
        yearsToRetirement: 0,
      })
    ).toBe(1000000);
  });

  it("compounds a single sum at the growth rate", () => {
    const fv = projectFundForward({
      currentValue: 100000,
      monthlyContribution: 0,
      contributionEscalation: 0,
      growthRate: 0.1,
      yearsToRetirement: 10,
    });
    close(fv, 100000 * Math.pow(1.1, 10), 0.5);
  });

  it("accumulates an escalating annuity", () => {
    const fv = projectFundForward({
      currentValue: 0,
      monthlyContribution: 1000,
      contributionEscalation: 0.06,
      growthRate: 0.1,
      yearsToRetirement: 30,
    });
    expect(fv).toBeGreaterThan(0);
    // Sanity: should exceed flat contribution result.
    const flat = projectFundForward({
      currentValue: 0,
      monthlyContribution: 1000,
      contributionEscalation: 0,
      growthRate: 0.1,
      yearsToRetirement: 30,
    });
    expect(fv).toBeGreaterThan(flat);
  });

  it("handles g == e (degenerate case)", () => {
    const fv = projectFundForward({
      currentValue: 0,
      monthlyContribution: 1000,
      contributionEscalation: 0.1,
      growthRate: 0.1,
      yearsToRetirement: 10,
    });
    // Closed-form: C × n × (1+g)^(n-1) where C = annual = 12000, n = 10
    close(fv, 12000 * 10 * Math.pow(1.1, 9), 0.5);
  });
});

describe("projectTwoPotFund", () => {
  const base = {
    contributionEscalation: 0,
    growthRate: 0.1,
    yearsToRetirement: 10,
    inflation: 0.06,
  };

  it("applies the commutation rule per component", () => {
    const r = projectTwoPotFund({
      ...base,
      vested: 900000,
      retirement: 600000,
      savings: 300000,
      optedOut: false,
      monthlyContribution: 0,
    });
    // No contributions: each slice is its balance grown 10 years at 10%.
    const grow = (v: number) => v * Math.pow(1.1, 10);
    close(r.vested.valueAtRetirement, grow(900000), 1);
    close(r.retirement.valueAtRetirement, grow(600000), 1);
    close(r.savings.valueAtRetirement, grow(300000), 1);
    // Vested commutes 1/3, Retirement 0, Savings 100%.
    close(r.vested.lumpSum, grow(900000) / 3, 1);
    expect(r.retirement.lumpSum).toBe(0);
    close(r.savings.lumpSum, grow(300000), 1);
    // toAnnuity = value − lumpSum.
    close(r.savings.toAnnuity, 0, 1);
    close(r.retirement.toAnnuity, grow(600000), 1);
  });

  it("splits new contributions 2/3 retirement, 1/3 savings, none to vested", () => {
    const noContrib = projectTwoPotFund({
      ...base,
      vested: 0,
      retirement: 0,
      savings: 0,
      optedOut: false,
      monthlyContribution: 0,
    });
    const withContrib = projectTwoPotFund({
      ...base,
      vested: 0,
      retirement: 0,
      savings: 0,
      optedOut: false,
      monthlyContribution: 3000,
    });
    // Vested gets no contribution share, so stays zero.
    expect(noContrib.vested.valueAtRetirement).toBe(0);
    expect(withContrib.vested.valueAtRetirement).toBe(0);
    // Retirement accumulates from 2/3 of contribution, Savings from 1/3 →
    // retirement pot ends at exactly double the savings pot.
    expect(withContrib.retirement.valueAtRetirement).toBeGreaterThan(0);
    close(
      withContrib.retirement.valueAtRetirement,
      withContrib.savings.valueAtRetirement * 2,
      1
    );
  });

  it("opted-out is a single vested-rules balance that keeps contributing", () => {
    const r = projectTwoPotFund({
      ...base,
      vested: 500000,
      retirement: 0,
      savings: 0,
      optedOut: true,
      monthlyContribution: 4000,
    });
    expect(r.optedOut).toBe(true);
    expect(r.retirement.valueAtRetirement).toBe(0);
    expect(r.savings.valueAtRetirement).toBe(0);
    // Full contribution flows in (more than balance-only growth), 1/3 commutes.
    expect(r.vested.valueAtRetirement).toBeGreaterThan(
      500000 * Math.pow(1.1, 10)
    );
    close(r.vested.lumpSum, r.vested.valueAtRetirement / 3, 1);
  });
});

describe("presentValueGrowingAnnuity", () => {
  it("zero payment returns zero", () => {
    expect(
      presentValueGrowingAnnuity({
        paymentPerPeriod: 0,
        escalation: 0.06,
        discount: 0.1,
        termYears: 25,
        periodsPerYear: 12,
      })
    ).toBe(0);
  });

  it("zero term returns zero", () => {
    expect(
      presentValueGrowingAnnuity({
        paymentPerPeriod: 1000,
        escalation: 0.06,
        discount: 0.1,
        termYears: 0,
        periodsPerYear: 12,
      })
    ).toBe(0);
  });

  it("matches a known textbook PV (flat 1000/month, 8% discount, 10 years)", () => {
    // Standard PV of ordinary annuity (monthly): C × (1 - (1+r)^-n)/r where r is monthly.
    const r = 0.08 / 12;
    const n = 120;
    const expected = (1000 * (1 - Math.pow(1 + r, -n))) / r;
    const got = presentValueGrowingAnnuity({
      paymentPerPeriod: 1000,
      escalation: 0,
      discount: 0.08,
      termYears: 10,
      periodsPerYear: 12,
    });
    close(got, expected, 1);
  });

  it("escalation = discount produces payment × periods", () => {
    const got = presentValueGrowingAnnuity({
      paymentPerPeriod: 1000,
      escalation: 0.08,
      discount: 0.08,
      termYears: 10,
      periodsPerYear: 12,
    });
    close(got, 1000 * 120, 0.5);
  });
});

describe("dbPensionToCapitalEquivalent", () => {
  it("zero income returns zero", () => {
    expect(
      dbPensionToCapitalEquivalent({
        monthlyIncome: 0,
        escalation: 0.06,
        realReturn: 0.04,
        yearsAfterRetirement: 25,
      })
    ).toBe(0);
  });

  it("non-zero income produces positive capital", () => {
    const c = dbPensionToCapitalEquivalent({
      monthlyIncome: 20000,
      escalation: 0.06,
      realReturn: 0.04,
      yearsAfterRetirement: 25,
    });
    expect(c).toBeGreaterThan(0);
  });
});

describe("requiredCapitalForIncome", () => {
  it("monthly frequency produces a finite capital", () => {
    const c = requiredCapitalForIncome({
      monthlyAmount: 50000,
      escalation: 0.06,
      termYears: 25,
      realReturn: 0.04,
      frequency: "monthly",
    });
    expect(c).toBeGreaterThan(0);
    expect(Number.isFinite(c)).toBe(true);
  });

  it("grosses up taxable income", () => {
    const net = requiredCapitalForIncome({
      monthlyAmount: 50000,
      escalation: 0.06,
      termYears: 25,
      realReturn: 0.04,
      frequency: "monthly",
    });
    const taxed = requiredCapitalForIncome({
      monthlyAmount: 50000,
      escalation: 0.06,
      termYears: 25,
      realReturn: 0.04,
      frequency: "monthly",
      taxableFraction: 1.0,
      taxRate: 0.3,
    });
    // Grossed-up requires more capital.
    expect(taxed).toBeGreaterThan(net);
  });
});

describe("projectFutureInflow", () => {
  it("compounds value to inflow date", () => {
    const v = projectFutureInflow({
      currentValue: 1000000,
      growthRate: 0.1,
      yearsAfterRetirement: 5,
      calculateCgt: false,
    });
    close(v, 1000000 * Math.pow(1.1, 5), 0.5);
  });

  it("applies CGT haircut on gain when enabled", () => {
    const noCgt = projectFutureInflow({
      currentValue: 1000000,
      growthRate: 0.1,
      yearsAfterRetirement: 5,
      calculateCgt: false,
    });
    const withCgt = projectFutureInflow({
      currentValue: 1000000,
      growthRate: 0.1,
      yearsAfterRetirement: 5,
      calculateCgt: true,
    });
    expect(withCgt).toBeLessThan(noCgt);
  });
});

describe("additionalMonthlyContribution", () => {
  it("zero shortfall returns zero", () => {
    expect(
      additionalMonthlyContribution({
        shortfallAtRetirement: 0,
        growthRate: 0.1,
        contributionEscalation: 0.06,
        yearsToRetirement: 20,
      })
    ).toBe(0);
  });

  it("positive shortfall returns positive contribution that closes the gap", () => {
    const shortfall = 5_000_000;
    const years = 20;
    const monthly = additionalMonthlyContribution({
      shortfallAtRetirement: shortfall,
      growthRate: 0.1,
      contributionEscalation: 0.06,
      yearsToRetirement: years,
    });
    expect(monthly).toBeGreaterThan(0);

    // Round-trip: that monthly contribution, projected forward, should equal the shortfall.
    const fv = projectFundForward({
      currentValue: 0,
      monthlyContribution: monthly,
      contributionEscalation: 0.06,
      growthRate: 0.1,
      yearsToRetirement: years,
    });
    close(fv, shortfall, 1);
  });
});

describe("computeRetirementProjection (aggregator)", () => {
  const baseInput = {
    parameters: {
      id: 1,
      planId: 1,
      retirementAge: 65,
      retirementPlanningAge: 90,
      autoCalculateTax: true,
      lastUpdated: "",
    } as any,
    clientAge: 40,
    retirementFunds: [],
    definedBenefitFunds: [],
    voluntaryInvestments: [],
    futureInflows: [],
    lumpSumNeeds: [],
    incomeNeeds: [],
    incomeProvisions: [],
  };

  it("empty inputs produce zero projection", () => {
    const result = computeRetirementProjection(baseInput);
    expect(result.capitalProvided).toBe(0);
    expect(result.capitalRequired).toBe(0);
    expect(result.surplus).toBe(0);
    expect(result.additionalMonthlyContribution).toBe(0);
    expect(result.yearsToRetirement).toBe(25);
    expect(result.yearsAfterRetirement).toBe(25);
  });

  it("capital sources sum into capitalProvided", () => {
    const result = computeRetirementProjection({
      ...baseInput,
      retirementFunds: [
        {
          id: 1,
          description: "RA",
          fundValue: "R 1,000,000",
          monthlyContribution: "R 5,000",
          contributionEscalation: "6%",
          growthRate: "10%",
        } as any,
      ],
    });
    expect(result.capitalProvided).toBeGreaterThan(0);
    expect(result.retirementFunds).toHaveLength(1);
    expect(result.retirementFunds[0].capitalAtRetirement).toBeGreaterThan(0);
  });

  it("income needs flow into capitalRequired and produce a shortfall + recommendation", () => {
    const result = computeRetirementProjection({
      ...baseInput,
      incomeNeeds: [
        {
          id: 1,
          description: "Living expenses",
          personName: "",
          startDate: "",
          termYears: "25",
          increasePercentage: "6%",
          cpi: false,
          frequency: "monthly",
          amount: "R 50,000",
          capitalisedAmount: "R 0",
        } as any,
      ],
    });
    expect(result.capitalRequired).toBeGreaterThan(0);
    expect(result.surplus).toBeLessThan(0);
    expect(result.additionalMonthlyContribution).toBeGreaterThan(0);
  });
});

describe("isRetirementReadyToProject", () => {
  const base = {
    parameters: {
      id: 1,
      planId: 1,
      retirementAge: 65,
      retirementPlanningAge: 90,
      autoCalculateTax: true,
      lastUpdated: "",
    } as any,
    clientAge: 40,
    retirementFunds: [],
    definedBenefitFunds: [],
    voluntaryInvestments: [],
    futureInflows: [],
    lumpSumNeeds: [],
    incomeNeeds: [],
    incomeProvisions: [],
  };

  it("not ready without parameters", () => {
    expect(isRetirementReadyToProject({ ...base, parameters: null })).toBe(
      false
    );
  });

  it("not ready without client age", () => {
    expect(isRetirementReadyToProject({ ...base, clientAge: 0 })).toBe(false);
  });

  it("not ready without capital source", () => {
    expect(
      isRetirementReadyToProject({
        ...base,
        incomeNeeds: [{ id: 1, amount: "R 10,000" } as any],
      })
    ).toBe(false);
  });

  it("not ready without income need", () => {
    expect(
      isRetirementReadyToProject({
        ...base,
        retirementFunds: [{ id: 1, fundValue: "R 1,000,000" } as any],
      })
    ).toBe(false);
  });

  it("ready with both", () => {
    expect(
      isRetirementReadyToProject({
        ...base,
        retirementFunds: [
          {
            id: 1,
            fundValue: "R 1,000,000",
            monthlyContribution: "R 0",
          } as any,
        ],
        incomeNeeds: [{ id: 1, amount: "R 10,000" } as any],
      })
    ).toBe(true);
  });
});
