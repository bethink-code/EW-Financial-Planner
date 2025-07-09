import { retirementFunds, type RetirementFund, type InsertRetirementFund, type UpdateRetirementFund } from "@shared/schema";

export interface IStorage {
  // Retirement Funds
  getRetirementFunds(): Promise<RetirementFund[]>;
  getRetirementFund(id: number): Promise<RetirementFund | undefined>;
  createRetirementFund(fund: InsertRetirementFund): Promise<RetirementFund>;
  updateRetirementFund(id: number, updates: UpdateRetirementFund): Promise<RetirementFund | undefined>;
  deleteRetirementFund(id: number): Promise<boolean>;
  searchRetirementFunds(query: string): Promise<RetirementFund[]>;
}

export class MemStorage implements IStorage {
  private retirementFunds: Map<number, RetirementFund>;
  private currentFundId: number;

  constructor() {
    this.retirementFunds = new Map();
    this.currentFundId = 1;
    
    // Initialize with sample data
    this.createRetirementFund({
      // Overview
      description: "Total Pension Fund",
      owner: "John Doe",
      coverAmount: "R 500,000",
      
      // Unapproved life cover - dynamic beneficiaries
      beneficiaries: JSON.stringify([
        { id: "1", name: "Spouse", percentage: 100, coverSplit: "R 500,000" }
      ]),
      
      // Monthly death benefit
      monthlyIncome: "R 5,000",
      termYears: "10",
      increasePercentage: "5%",
      approvedLifeCover: "R 250,000",
      fundValue: "R 180,000",
      fundValueAtDeath: "R 200,000",
      
      // Fund value beneficiaries
      beneficiaryName: "Sarah Doe",
      beneficiaryPercentageSplit: "60%",
      amount: "R 150,000",
      lumpSumTaken: "R 25,000",
      nondeductibleContribution: "R 10,000",
      livingAnnuity: "R 120,000",
      incomeTerm: "20",

      // Flows mode fields
      lumpSumLeftOverProvisions: "R 300,000",
      incomeProvisionOption: "Income guarantee",
      monthlyProvisionOffered: "R 4,500",
      currentAnnualIncome: "R 54,000",
      annualIncomeAtDeath: "R 60,000",
      estateDeploymentDeceased: "R 45,000",
      executorsFee: "3.5%",
      mastersFee: "1.75%",
      
      // Estate duty percentages
      estateDutyPoliciesOnLife: "20%",
      estateDutyToSpouse: "0%", 
      estateDutyToOthers: "20%"
    });
    
    this.createRetirementFund({
      // Overview
      description: "Provident Fund",
      owner: "Jane Smith",
      coverAmount: "R 350,000",
      
      // Unapproved life cover - dynamic beneficiaries
      beneficiaries: JSON.stringify([
        { id: "1", name: "Tom Smith", percentage: 50, coverSplit: "R 175,000" },
        { id: "2", name: "Anna Smith", percentage: 50, coverSplit: "R 175,000" }
      ]),
      
      // Monthly death benefit
      monthlyIncome: "R 3,500",
      termYears: "15",
      increasePercentage: "4%",
      approvedLifeCover: "R 175,000",
      fundValue: "R 120,000",
      fundValueAtDeath: "R 140,000",
      
      // Fund value beneficiaries
      beneficiaryName: "Tom Smith",
      beneficiaryPercentageSplit: "40%",
      amount: "R 100,000",
      lumpSumTaken: "R 15,000",
      nondeductibleContribution: "R 8,000",
      livingAnnuity: "R 85,000",
      incomeTerm: "25",

      // Flows mode fields
      lumpSumLeftOverProvisions: "R 250,000",
      incomeProvisionOption: "Fixed income",
      monthlyProvisionOffered: "R 3,200",
      currentAnnualIncome: "R 38,400",
      annualIncomeAtDeath: "R 42,000",
      estateDeploymentDeceased: "R 35,000",
      executorsFee: "3.5%",
      mastersFee: "1.75%",
      
      // Estate duty percentages
      estateDutyPoliciesOnLife: "10%",
      estateDutyToSpouse: "0%", 
      estateDutyToOthers: "15%",
      
      // Additional fields shown below table in inputs mode
      lumpSumDeath: "0",
      previousLumpSums: "0",
      additionalTaxFreeAmount: "0"
    });
  }

  async getRetirementFunds(): Promise<RetirementFund[]> {
    return Array.from(this.retirementFunds.values());
  }

  async getRetirementFund(id: number): Promise<RetirementFund | undefined> {
    return this.retirementFunds.get(id);
  }

  async createRetirementFund(insertFund: InsertRetirementFund): Promise<RetirementFund> {
    const id = this.currentFundId++;
    const fund: RetirementFund = { 
      id,
      description: insertFund.description || "",
      owner: insertFund.owner || "",
      coverAmount: insertFund.coverAmount || "",
      beneficiaries: insertFund.beneficiaries || "[]",
      monthlyIncome: insertFund.monthlyIncome || "",
      termYears: insertFund.termYears || "",
      increasePercentage: insertFund.increasePercentage || "",
      approvedLifeCover: insertFund.approvedLifeCover || "",
      fundValue: insertFund.fundValue || "",
      fundValueAtDeath: insertFund.fundValueAtDeath || "",
      beneficiaryName: insertFund.beneficiaryName || "",
      beneficiaryPercentageSplit: insertFund.beneficiaryPercentageSplit || "",
      amount: insertFund.amount || "",
      lumpSumTaken: insertFund.lumpSumTaken || "",
      nondeductibleContribution: insertFund.nondeductibleContribution || "",
      livingAnnuity: insertFund.livingAnnuity || "",
      incomeTerm: insertFund.incomeTerm || "",
      
      // Flows mode specific fields
      lumpSumLeftOverProvisions: insertFund.lumpSumLeftOverProvisions || "0",
      incomeProvisionOption: insertFund.incomeProvisionOption || "",
      monthlyProvisionOffered: insertFund.monthlyProvisionOffered || "0",
      currentAnnualIncome: insertFund.currentAnnualIncome || "0",
      annualIncomeAtDeath: insertFund.annualIncomeAtDeath || "0",
      estateDeploymentDeceased: insertFund.estateDeploymentDeceased || "0",
      executorsFee: insertFund.executorsFee || "0%",
      mastersFee: insertFund.mastersFee || "0%",
      
      // Estate duty percentages
      estateDutyPoliciesOnLife: insertFund.estateDutyPoliciesOnLife || "0%",
      estateDutyToSpouse: insertFund.estateDutyToSpouse || "0%",
      estateDutyToOthers: insertFund.estateDutyToOthers || "0%",
      
      // Additional fields shown below table in inputs mode
      lumpSumDeath: insertFund.lumpSumDeath || "0",
      previousLumpSums: insertFund.previousLumpSums || "0",
      additionalTaxFreeAmount: insertFund.additionalTaxFreeAmount || "0"
    };
    this.retirementFunds.set(id, fund);
    return fund;
  }

  async updateRetirementFund(id: number, updates: UpdateRetirementFund): Promise<RetirementFund | undefined> {
    const existing = this.retirementFunds.get(id);
    if (!existing) return undefined;
    
    const updated: RetirementFund = { ...existing, ...updates };
    this.retirementFunds.set(id, updated);
    return updated;
  }

  async deleteRetirementFund(id: number): Promise<boolean> {
    return this.retirementFunds.delete(id);
  }

  async searchRetirementFunds(query: string): Promise<RetirementFund[]> {
    const allFunds = Array.from(this.retirementFunds.values());
    if (!query.trim()) return allFunds;
    
    const lowerQuery = query.toLowerCase();
    return allFunds.filter(fund => {
      const beneficiariesMatch = (() => {
        try {
          const beneficiaries = JSON.parse(fund.beneficiaries || "[]");
          return beneficiaries.some((b: any) => b.name?.toLowerCase().includes(lowerQuery));
        } catch {
          return false;
        }
      })();
      
      return fund.description.toLowerCase().includes(lowerQuery) ||
        fund.owner.toLowerCase().includes(lowerQuery) ||
        fund.beneficiaryName.toLowerCase().includes(lowerQuery) ||
        beneficiariesMatch;
    });
  }
}

export const storage = new MemStorage();
