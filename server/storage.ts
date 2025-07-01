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
      description: "Total",
      owner: "John Doe",
      coverAgainst: "0",
      monthlyDeathBenefit: "0",
      lumpSumDeath: "0",
      previousLumpSums: "0",
      taxFreeAmount: "0",
      fundValue: "0",
      fundValueAtDeath: "0",
      name: "",
      amount: "0",
      lumpSumTaken: "0",
    });
    
    this.createRetirementFund({
      description: "Lump sum death",
      owner: "Jane Smith",
      coverAgainst: "0",
      monthlyDeathBenefit: "0",
      lumpSumDeath: "0",
      previousLumpSums: "0",
      taxFreeAmount: "0",
      fundValue: "0",
      fundValueAtDeath: "0",
      name: "",
      amount: "0",
      lumpSumTaken: "0",
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
