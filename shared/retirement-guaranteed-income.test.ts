import { describe, expect, it } from "vitest";
import { retirementLumpSumTax } from "./sa-tax";
import { computeGuaranteedIncome } from "./retirement-guaranteed-income";

const close = (a: number, b: number, tol = 1) =>
  expect(Math.abs(a - b)).toBeLessThan(tol);

describe("retirementLumpSumTax (2025/2026)", () => {
  it("is zero up to the R550k threshold", () => {
    expect(retirementLumpSumTax({ lumpSum: 0 })).toBe(0);
    expect(retirementLumpSumTax({ lumpSum: 500_000 })).toBe(0);
    expect(retirementLumpSumTax({ lumpSum: 550_000 })).toBe(0);
  });

  it("taxes the 18% band above R550k", () => {
    close(retirementLumpSumTax({ lumpSum: 700_000 }), 150_000 * 0.18); // 27,000
    close(retirementLumpSumTax({ lumpSum: 770_000 }), 220_000 * 0.18); // 39,600
  });

  it("taxes the 27% band above R770k", () => {
    close(
      retirementLumpSumTax({ lumpSum: 1_000_000 }),
      39_600 + 230_000 * 0.27
    );
    close(retirementLumpSumTax({ lumpSum: 1_155_000 }), 143_550);
  });

  it("taxes the 36% band above R1.155m", () => {
    close(
      retirementLumpSumTax({ lumpSum: 2_000_000 }),
      143_550 + 845_000 * 0.36
    ); // 447,750
  });
});

describe("computeGuaranteedIncome", () => {
  const base = {
    capitalAtRetirement: 5_000_000,
    cpiPct: 4.5,
    yieldPremiumPct: 3,
    termYears: 25,
  };

  it("splits capital into lump sum (taxed) and annuity capital", () => {
    const r = computeGuaranteedIncome({ ...base, lumpSumCommuted: 1_000_000 });
    close(r.lumpSumGross, 1_000_000);
    close(r.lumpSumTax, 39_600 + 230_000 * 0.27); // 101,700
    close(r.lumpSumNet, 1_000_000 - (39_600 + 230_000 * 0.27));
    close(r.annuityCapital, 4_000_000);
    expect(r.monthlyIncome).toBeGreaterThan(0);
  });

  it("a small lump sum below R550k is untaxed", () => {
    const r = computeGuaranteedIncome({ ...base, lumpSumCommuted: 400_000 });
    expect(r.lumpSumTax).toBe(0);
    expect(r.lumpSumTaxRate).toBe(0);
    close(r.lumpSumNet, 400_000);
  });

  it("level annuity (zero premium) pays capital evenly over the term", () => {
    const r = computeGuaranteedIncome({
      ...base,
      yieldPremiumPct: 0, // discount == escalation → level real payment
      lumpSumCommuted: 0,
    });
    // PV of R1/mo over the term collapses to term × 12, so income = capital / months.
    close(r.monthlyIncome, 5_000_000 / (25 * 12), 0.01);
  });

  it("caps the lump sum at the available capital", () => {
    const r = computeGuaranteedIncome({
      ...base,
      capitalAtRetirement: 800_000,
      lumpSumCommuted: 1_000_000,
    });
    close(r.lumpSumGross, 800_000);
    expect(r.annuityCapital).toBe(0);
    expect(r.monthlyIncome).toBe(0);
  });

  it("zero term yields no income", () => {
    const r = computeGuaranteedIncome({
      ...base,
      termYears: 0,
      lumpSumCommuted: 0,
    });
    expect(r.monthlyIncome).toBe(0);
  });
});
