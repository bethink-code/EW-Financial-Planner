import { Beneficiary } from "@shared/schema";

export function parseBeneficiaries(beneficiariesJson: string): Beneficiary[] {
  try {
    const parsed = JSON.parse(beneficiariesJson || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function stringifyBeneficiaries(beneficiaries: Beneficiary[]): string {
  return JSON.stringify(beneficiaries);
}

export function calculateCoverSplits(beneficiaries: Beneficiary[], totalCoverAmount: number): Beneficiary[] {
  return beneficiaries.map(beneficiary => ({
    ...beneficiary,
    coverSplit: `R ${Math.round((totalCoverAmount * beneficiary.percentage / 100)).toLocaleString()}`
  }));
}

export function getTotalPercentage(beneficiaries: Beneficiary[]): number {
  return beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
}

export function isPercentageValid(beneficiaries: Beneficiary[]): boolean {
  const total = getTotalPercentage(beneficiaries);
  return Math.abs(total - 100) < 0.01;
}