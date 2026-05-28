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
