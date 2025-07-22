import { retirementFunds, lumpSumBequests, type RetirementFund, type InsertRetirementFund, type UpdateRetirementFund, type LumpSumBequest, type InsertLumpSumBequest } from "@shared/schema";

export interface IStorage {
  // Retirement Funds
  getRetirementFunds(): Promise<RetirementFund[]>;
  getRetirementFund(id: number): Promise<RetirementFund | undefined>;
  createRetirementFund(fund: InsertRetirementFund): Promise<RetirementFund>;
  updateRetirementFund(id: number, updates: UpdateRetirementFund): Promise<RetirementFund | undefined>;
  deleteRetirementFund(id: number): Promise<boolean>;
  searchRetirementFunds(query: string): Promise<RetirementFund[]>;
  
  // Lump Sum Bequests
  getLumpSumBequests(): Promise<LumpSumBequest[]>;
  getLumpSumBequest(id: number): Promise<LumpSumBequest | undefined>;
  createLumpSumBequest(bequest: InsertLumpSumBequest): Promise<LumpSumBequest>;
  updateLumpSumBequest(id: number, updates: Partial<InsertLumpSumBequest>): Promise<LumpSumBequest | undefined>;
  deleteLumpSumBequest(id: number): Promise<boolean>;
  searchLumpSumBequests(query: string): Promise<LumpSumBequest[]>;
}

export class MemStorage implements IStorage {
  private retirementFunds: Map<number, RetirementFund>;
  private lumpSumBequests: Map<number, LumpSumBequest>;
  private currentFundId: number;
  private currentBequestId: number;

  constructor() {
    this.retirementFunds = new Map();
    this.lumpSumBequests = new Map();
    this.currentFundId = 1;
    this.currentBequestId = 1;
    
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
      termYears: "10 years",
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
      incomeTerm: "20 years",

      // Flows mode fields
      lumpSumProvisionEstate: "R 300,000",
      lumpSumProvisionSpouse: "R 200,000", 
      lumpSumProvisionOther: "R 150,000",
      incomeProvisionOption: "Income guarantee",
      monthlyProvisionOffered: "R 4,500",
      currentAnnualIncome: "R 54,000",
      annualIncomeAtDeath: "R 60,000",
      estateDeploymentDeceased: "R 45,000",
      incomeEscalation: "3%",
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
      coverAmount: "R 20,000,000",
      
      // Unapproved life cover - dynamic beneficiaries
      beneficiaries: JSON.stringify([
        { id: "1", name: "Tom Smith", percentage: 50, coverSplit: "R 175,000" },
        { id: "2", name: "Anna Smith", percentage: 50, coverSplit: "R 175,000" }
      ]),
      
      // Monthly death benefit
      monthlyIncome: "R 3,500",
      termYears: "15 years",
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
      incomeTerm: "25 years",

      // Flows mode fields
      lumpSumProvisionEstate: "R 250,000",
      lumpSumProvisionSpouse: "R 180,000",
      lumpSumProvisionOther: "R 120,000", 
      incomeProvisionOption: "Fixed income",
      monthlyProvisionOffered: "R 3,200",
      currentAnnualIncome: "R 38,400",
      annualIncomeAtDeath: "R 42,000",
      estateDeploymentDeceased: "R 35,000",
      incomeEscalation: "0%",
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

    // Initialize sample lump sum bequests
    this.createLumpSumBequest({
      description: "Family Trust Distribution",
      entity: "Donald Edwards",
      start: "100000",
      increasePercentage: "CPI",
      amount: "100000",
      valueAtDeath: "150000",
      charityNote: ""
    });
    
    this.createLumpSumBequest({
      description: "Charity Donation",
      entity: "Betty Edwards",
      start: "50000",
      increasePercentage: "5%",
      amount: "50000",
      valueAtDeath: "75000",
      charityNote: "Annual donation to local charity"
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
      incomeEscalation: insertFund.incomeEscalation || "0%",
      
      // Flows mode specific fields
      lumpSumProvisionEstate: insertFund.lumpSumProvisionEstate || "0",
      lumpSumProvisionSpouse: insertFund.lumpSumProvisionSpouse || "0",
      lumpSumProvisionOther: insertFund.lumpSumProvisionOther || "0",
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

  // Lump Sum Bequests methods
  async getLumpSumBequests(): Promise<LumpSumBequest[]> {
    return Array.from(this.lumpSumBequests.values());
  }

  async getLumpSumBequest(id: number): Promise<LumpSumBequest | undefined> {
    return this.lumpSumBequests.get(id);
  }

  async createLumpSumBequest(insertBequest: InsertLumpSumBequest): Promise<LumpSumBequest> {
    const id = this.currentBequestId++;
    const bequest: LumpSumBequest = {
      id,
      description: insertBequest.description || "",
      entity: insertBequest.entity || "",
      start: insertBequest.start || "0",
      increasePercentage: insertBequest.increasePercentage || "CPI",
      amount: insertBequest.amount || "0",
      valueAtDeath: insertBequest.valueAtDeath || "0",
      charityNote: insertBequest.charityNote || "",
    };
    this.lumpSumBequests.set(id, bequest);
    return bequest;
  }

  async updateLumpSumBequest(id: number, updates: Partial<InsertLumpSumBequest>): Promise<LumpSumBequest | undefined> {
    const existing = this.lumpSumBequests.get(id);
    if (!existing) return undefined;
    
    const updated: LumpSumBequest = { ...existing, ...updates };
    this.lumpSumBequests.set(id, updated);
    return updated;
  }

  async deleteLumpSumBequest(id: number): Promise<boolean> {
    return this.lumpSumBequests.delete(id);
  }

  async searchLumpSumBequests(query: string): Promise<LumpSumBequest[]> {
    const allBequests = Array.from(this.lumpSumBequests.values());
    if (!query.trim()) return allBequests;
    
    const lowerQuery = query.toLowerCase();
    return allBequests.filter(bequest => 
      bequest.description.toLowerCase().includes(lowerQuery) ||
      bequest.entity.toLowerCase().includes(lowerQuery) ||
      bequest.charityNote.toLowerCase().includes(lowerQuery)
    );
  }
}

export const storage = new MemStorage();
