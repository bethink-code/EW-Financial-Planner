export interface Beneficiary {
  id: string;
  name: string;
  percentage: number;
  coverSplit: string;
}

export function parseBeneficiaries(raw: string | null | undefined): Beneficiary[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Beneficiary[];
  } catch {
    return [];
  }
}
