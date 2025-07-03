import type { UnapprovedBeneficiary, FundValueBeneficiary } from "@shared/schema";

// Utility functions for managing beneficiary arrays

export function parseUnapprovedBeneficiaries(jsonString: string): UnapprovedBeneficiary[] {
  try {
    return JSON.parse(jsonString || "[]");
  } catch {
    return [];
  }
}

export function parseFundValueBeneficiaries(jsonString: string): FundValueBeneficiary[] {
  try {
    return JSON.parse(jsonString || "[]");
  } catch {
    return [];
  }
}

export function stringifyUnapprovedBeneficiaries(beneficiaries: UnapprovedBeneficiary[]): string {
  return JSON.stringify(beneficiaries);
}

export function stringifyFundValueBeneficiaries(beneficiaries: FundValueBeneficiary[]): string {
  return JSON.stringify(beneficiaries);
}

export function addUnapprovedBeneficiary(jsonString: string): string {
  const beneficiaries = parseUnapprovedBeneficiaries(jsonString);
  const newId = (Math.max(0, ...beneficiaries.map(b => parseInt(b.id))) + 1).toString();
  
  beneficiaries.push({
    id: newId,
    name: "New Beneficiary",
    percentage: "0%",
    coverSplit: "R 0"
  });
  
  return stringifyUnapprovedBeneficiaries(beneficiaries);
}

export function addFundValueBeneficiary(jsonString: string): string {
  const beneficiaries = parseFundValueBeneficiaries(jsonString);
  const newId = (Math.max(0, ...beneficiaries.map(b => parseInt(b.id))) + 1).toString();
  
  beneficiaries.push({
    id: newId,
    name: "New Beneficiary",
    percentage: "0%",
    amount: "R 0",
    lumpSumTaken: "R 0",
    nondeductibleContribution: "R 0",
    livingAnnuity: "R 0",
    incomeTerm: "0"
  });
  
  return stringifyFundValueBeneficiaries(beneficiaries);
}

export function removeUnapprovedBeneficiary(jsonString: string, beneficiaryId: string): string {
  const beneficiaries = parseUnapprovedBeneficiaries(jsonString);
  const filtered = beneficiaries.filter(b => b.id !== beneficiaryId);
  return stringifyUnapprovedBeneficiaries(filtered);
}

export function removeFundValueBeneficiary(jsonString: string, beneficiaryId: string): string {
  const beneficiaries = parseFundValueBeneficiaries(jsonString);
  const filtered = beneficiaries.filter(b => b.id !== beneficiaryId);
  return stringifyFundValueBeneficiaries(filtered);
}

export function updateUnapprovedBeneficiary(
  jsonString: string, 
  beneficiaryId: string, 
  field: keyof UnapprovedBeneficiary, 
  value: string
): string {
  const beneficiaries = parseUnapprovedBeneficiaries(jsonString);
  const updated = beneficiaries.map(b => 
    b.id === beneficiaryId ? { ...b, [field]: value } : b
  );
  return stringifyUnapprovedBeneficiaries(updated);
}

export function updateFundValueBeneficiary(
  jsonString: string, 
  beneficiaryId: string, 
  field: keyof FundValueBeneficiary, 
  value: string
): string {
  const beneficiaries = parseFundValueBeneficiaries(jsonString);
  const updated = beneficiaries.map(b => 
    b.id === beneficiaryId ? { ...b, [field]: value } : b
  );
  return stringifyFundValueBeneficiaries(updated);
}