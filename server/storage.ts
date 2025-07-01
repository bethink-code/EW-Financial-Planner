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
      coverAmount: "500000",
      
      // Unapproved life cover
      beneficiary: "Spouse",
      beneficiaryPercentage: "100",
      coverSplit: "500000",
      
      // Monthly death benefit
      monthlyIncome: "5000",
      termYears: "10",
      increasePercentage: "5",
      approvedLifeCover: "250000",
      fundValue: "180000",
      fundValueAtDeath: "200000",
      
      // Fund value beneficiaries
      beneficiaryName: "Sarah Doe",
      beneficiaryPercentageSplit: "60",
      amount: "150000",
      lumpSumTaken: "25000",
      nondeductibleContribution: "10000",
      livingAnnuity: "120000",
      incomeTerm: "20"
    });
    
    this.createRetirementFund({
      // Overview
      description: "Provident Fund",
      owner: "Jane Smith",
      coverAmount: "350000",
      
      // Unapproved life cover
      beneficiary: "Children",
      beneficiaryPercentage: "50",
      coverSplit: "175000",
      
      // Monthly death benefit
      monthlyIncome: "3500",
      termYears: "15",
      increasePercentage: "4",
      approvedLifeCover: "175000",
      fundValue: "120000",
      fundValueAtDeath: "140000",
      
      // Fund value beneficiaries
      beneficiaryName: "Tom Smith",
      beneficiaryPercentageSplit: "40",
      amount: "100000",
      lumpSumTaken: "15000",
      nondeductibleContribution: "8000",
      livingAnnuity: "85000",
      incomeTerm: "25"
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
    const fund: RetirementFund = { ...insertFund, id };
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
    return allFunds.filter(fund => 
      fund.description.toLowerCase().includes(lowerQuery) ||
      fund.owner.toLowerCase().includes(lowerQuery) ||
      fund.name.toLowerCase().includes(lowerQuery)
    );
  }
}

export const storage = new MemStorage();
