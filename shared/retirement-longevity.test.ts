import { describe, expect, it } from "vitest";
import {
  maxSustainableIncome,
  nominalYield,
  requiredSaving,
  simulateDrawdown,
  type DrawdownInputs,
} from "./retirement-longevity";

// The live client scenario: R3m today, saving R15k/mo, needs R50k/mo — a plan
// the summary band flags as a shortfall.
const scenario: DrawdownInputs = {
  currentAge: 55,
  retirementAge: 65,
  untilAge: 90,
  startingBalance: 3_000_000,
  monthlySaving: 15_000,
  monthlyIncomeRequired: 50_000,
  cpiPct: 6,
  yieldPremiumPct: 3,
};

describe("nominalYield", () => {
  it("adds CPI and the premium", () => {
    expect(nominalYield(6, 3)).toBeCloseTo(0.09, 10);
  });
});

describe("simulateDrawdown", () => {
  it("accumulates before retirement then draws down", () => {
    const { series } = simulateDrawdown(scenario);
    expect(series[0]).toEqual({ age: 55, balance: 3_000_000 });
    const atRetirement = series.find((p) => p.age === 65)!.balance;
    expect(atRetirement).toBeGreaterThan(3_000_000); // grew while saving
  });

  it("an under-funded plan runs out before the end age and goes negative", () => {
    const { depletionAge, series } = simulateDrawdown(scenario);
    expect(depletionAge).not.toBeNull();
    expect(depletionAge!).toBeLessThan(scenario.untilAge);
    expect(series[series.length - 1].balance).toBeLessThan(0);
  });

  it("a well-funded plan never depletes", () => {
    const { depletionAge, finalBalance } = simulateDrawdown({
      ...scenario,
      startingBalance: 30_000_000,
    });
    expect(depletionAge).toBeNull();
    expect(finalBalance).toBeGreaterThan(0);
  });
});

describe("lumpSumAtRetirement", () => {
  it("commutes the lump sum as a vertical step at retirement", () => {
    const withLump = simulateDrawdown({
      ...scenario,
      lumpSumAtRetirement: 1_000_000,
    });
    const without = simulateDrawdown(scenario);

    // Two points at the retirement age: the gross peak, then the annuity base.
    const at65 = withLump.series.filter((p) => p.age === 65);
    expect(at65).toHaveLength(2);

    // The peak matches the no-lump run — the run-up to retirement is untouched.
    const peakWithout = without.series.find((p) => p.age === 65)!.balance;
    expect(at65[0].balance).toBeCloseTo(peakWithout, 6);

    // The step down equals the commuted cash exactly.
    expect(at65[0].balance - at65[1].balance).toBeCloseTo(1_000_000, 6);

    // Less annuitising capital → runs out earlier.
    expect(withLump.depletionAge!).toBeLessThan(without.depletionAge!);
  });

  it("lowers the sustainable income once cash is commuted", () => {
    const { monthlyIncomeRequired, ...rest } = scenario;
    const full = maxSustainableIncome(rest);
    const afterLump = maxSustainableIncome({
      ...rest,
      lumpSumAtRetirement: 1_000_000,
    });
    expect(afterLump).toBeLessThan(full);
  });
});

describe("capitalAtRetirement (projection-seeded peak)", () => {
  it("lands the retirement peak on the supplied figure, not the engine's own", () => {
    const seed = 12_055_492;
    const { series } = simulateDrawdown({
      ...scenario,
      capitalAtRetirement: seed,
    });
    const at65 = series.filter((p) => p.age === 65);
    // First age-65 point is the gross peak (no lump sum in this scenario).
    expect(at65[0].balance).toBeCloseTo(seed, 2);
    // And it differs from the engine's self-derived peak.
    const selfDerived = simulateDrawdown(scenario).series.find(
      (p) => p.age === 65
    )!.balance;
    expect(at65[0].balance).not.toBeCloseTo(selfDerived, -4);
  });

  it("rises monotonically from the starting balance to the seeded peak", () => {
    const seed = 12_055_492;
    const { series } = simulateDrawdown({
      ...scenario,
      capitalAtRetirement: seed,
    });
    const accum = series.filter((p) => p.age <= 65);
    expect(accum[0].balance).toBeCloseTo(scenario.startingBalance, 2);
    for (let k = 1; k < accum.length; k++) {
      expect(accum[k].balance).toBeGreaterThan(accum[k - 1].balance);
    }
  });
});

describe("maxSustainableIncome", () => {
  it("is below the required income for an under-funded plan, and lands the balance near zero", () => {
    const { monthlyIncomeRequired, ...rest } = scenario;
    const provided = maxSustainableIncome(rest);
    expect(provided).toBeLessThan(monthlyIncomeRequired);
    const { finalBalance } = simulateDrawdown({
      ...scenario,
      monthlyIncomeRequired: provided,
    });
    expect(finalBalance).toBeGreaterThanOrEqual(0);
    expect(finalBalance).toBeLessThan(100_000); // ≈ depletes exactly at untilAge
  });
});

describe("requiredSaving", () => {
  it("solves the saving that funds the required income to the end age", () => {
    const { monthlySaving, ...rest } = scenario;
    const needed = requiredSaving(rest);
    expect(needed).toBeGreaterThan(monthlySaving); // must save more than today
    const { finalBalance } = simulateDrawdown({
      ...scenario,
      monthlySaving: needed,
    });
    expect(finalBalance).toBeGreaterThanOrEqual(0);
    expect(finalBalance).toBeLessThan(100_000);
  });
});
