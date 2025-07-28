import { retirementFunds, lumpSumBequests, assurance, definedBenefitFunds, voluntaryInvestments, incomeNeeds, incomeProvisions, residue, additionalEstateDutyItems, liabilities, type RetirementFund, type InsertRetirementFund, type UpdateRetirementFund, type LumpSumBequest, type InsertLumpSumBequest, type Assurance, type InsertAssurance, type UpdateAssurance, type DefinedBenefitFund, type InsertDefinedBenefitFund, type UpdateDefinedBenefitFund, type VoluntaryInvestment, type InsertVoluntaryInvestment, type UpdateVoluntaryInvestment, type IncomeNeeds, type InsertIncomeNeeds, type UpdateIncomeNeeds, type IncomeProvisions, type InsertIncomeProvisions, type UpdateIncomeProvisions, type Residue, type InsertResidue, type UpdateResidue, type AdditionalEstateDutyItems, type InsertAdditionalEstateDutyItems, type UpdateAdditionalEstateDutyItems, type Liabilities, type InsertLiabilities, type UpdateLiabilities } from "@shared/schema";
import { assets, type Assets, type InsertAssets } from "@shared/assets-schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, ilike, or } from "drizzle-orm";

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
  
  // Assurance
  getAssurance(): Promise<Assurance[]>;
  getAssuranceById(id: number): Promise<Assurance | undefined>;
  createAssurance(assurance: InsertAssurance): Promise<Assurance>;
  updateAssurance(id: number, updates: UpdateAssurance): Promise<Assurance | undefined>;
  deleteAssurance(id: number): Promise<boolean>;
  searchAssurance(query: string): Promise<Assurance[]>;
  
  // Defined Benefit Funds
  getDefinedBenefitFunds(): Promise<DefinedBenefitFund[]>;
  getDefinedBenefitFund(id: number): Promise<DefinedBenefitFund | undefined>;
  createDefinedBenefitFund(fund: InsertDefinedBenefitFund): Promise<DefinedBenefitFund>;
  updateDefinedBenefitFund(id: number, updates: UpdateDefinedBenefitFund): Promise<DefinedBenefitFund | undefined>;
  deleteDefinedBenefitFund(id: number): Promise<boolean>;
  searchDefinedBenefitFunds(query: string): Promise<DefinedBenefitFund[]>;
  
  // Voluntary Investments
  getVoluntaryInvestments(): Promise<VoluntaryInvestment[]>;
  getVoluntaryInvestment(id: number): Promise<VoluntaryInvestment | undefined>;
  createVoluntaryInvestment(investment: InsertVoluntaryInvestment): Promise<VoluntaryInvestment>;
  updateVoluntaryInvestment(id: number, updates: UpdateVoluntaryInvestment): Promise<VoluntaryInvestment | undefined>;
  deleteVoluntaryInvestment(id: number): Promise<boolean>;
  searchVoluntaryInvestments(query: string): Promise<VoluntaryInvestment[]>;
  
  // Income Needs
  getIncomeNeeds(): Promise<IncomeNeeds[]>;
  getIncomeNeed(id: number): Promise<IncomeNeeds | undefined>;
  createIncomeNeed(need: InsertIncomeNeeds): Promise<IncomeNeeds>;
  updateIncomeNeed(id: number, updates: UpdateIncomeNeeds): Promise<IncomeNeeds | undefined>;
  deleteIncomeNeed(id: number): Promise<boolean>;
  searchIncomeNeeds(query: string): Promise<IncomeNeeds[]>;
  
  // Income Provisions
  getIncomeProvisions(): Promise<IncomeProvisions[]>;
  getIncomeProvision(id: number): Promise<IncomeProvisions | undefined>;
  createIncomeProvision(provision: InsertIncomeProvisions): Promise<IncomeProvisions>;
  updateIncomeProvision(id: number, updates: UpdateIncomeProvisions): Promise<IncomeProvisions | undefined>;
  deleteIncomeProvision(id: number): Promise<boolean>;
  searchIncomeProvisions(query: string): Promise<IncomeProvisions[]>;
  
  // Residue
  getResidue(): Promise<Residue[]>;
  getResidueItem(id: number): Promise<Residue | undefined>;
  createResidueItem(item: InsertResidue): Promise<Residue>;
  updateResidueItem(id: number, updates: UpdateResidue): Promise<Residue | undefined>;
  deleteResidueItem(id: number): Promise<boolean>;
  searchResidue(query: string): Promise<Residue[]>;
  
  // Additional Estate Duty Items
  getAdditionalEstateDutyItems(): Promise<AdditionalEstateDutyItems[]>;
  getAdditionalEstateDutyItem(id: number): Promise<AdditionalEstateDutyItems | undefined>;
  createAdditionalEstateDutyItem(item: InsertAdditionalEstateDutyItems): Promise<AdditionalEstateDutyItems>;
  updateAdditionalEstateDutyItem(id: number, updates: UpdateAdditionalEstateDutyItems): Promise<AdditionalEstateDutyItems | undefined>;
  deleteAdditionalEstateDutyItem(id: number): Promise<boolean>;
  searchAdditionalEstateDutyItems(query: string): Promise<AdditionalEstateDutyItems[]>;
  
  // Liabilities
  getLiabilities(): Promise<Liabilities[]>;
  getLiability(id: number): Promise<Liabilities | undefined>;
  createLiability(liability: InsertLiabilities): Promise<Liabilities>;
  updateLiability(id: number, updates: UpdateLiabilities): Promise<Liabilities | undefined>;
  deleteLiability(id: number): Promise<boolean>;
  searchLiabilities(query: string): Promise<Liabilities[]>;
  
  // Assets
  getAssets(): Promise<Assets[]>;
  getAsset(id: number): Promise<Assets | undefined>;
  createAsset(asset: InsertAssets): Promise<Assets>;
  updateAsset(id: number, updates: Partial<InsertAssets>): Promise<Assets | undefined>;
  deleteAsset(id: number): Promise<boolean>;
  searchAssets(query: string): Promise<Assets[]>;
}

export class MemStorage implements IStorage {
  private retirementFunds: Map<number, RetirementFund>;
  private lumpSumBequests: Map<number, LumpSumBequest>;
  private assurance: Map<number, Assurance>;
  private definedBenefitFunds: Map<number, DefinedBenefitFund>;
  private voluntaryInvestments: Map<number, VoluntaryInvestment>;
  private incomeNeeds: Map<number, IncomeNeeds>;
  private incomeProvisions: Map<number, IncomeProvisions>;
  private residue: Map<number, Residue>;
  private additionalEstateDutyItems: Map<number, AdditionalEstateDutyItems>;
  private liabilities: Map<number, Liabilities>;
  private assets: Map<number, Assets>;
  
  private currentFundId: number;
  private currentBequestId: number;
  private currentAssuranceId: number;
  private currentDefinedBenefitFundId: number;
  private currentVoluntaryInvestmentId: number;
  private currentIncomeNeedId: number;
  private currentIncomeProvisionId: number;
  private currentResidueId: number;
  private currentAdditionalEstateDutyItemId: number;
  private currentLiabilityId: number;
  private currentAssetId: number;

  constructor() {
    this.retirementFunds = new Map();
    this.lumpSumBequests = new Map();
    this.assurance = new Map();
    this.definedBenefitFunds = new Map();
    this.voluntaryInvestments = new Map();
    this.incomeNeeds = new Map();
    this.incomeProvisions = new Map();
    this.residue = new Map();
    this.additionalEstateDutyItems = new Map();
    this.liabilities = new Map();
    this.assets = new Map();

    this.currentFundId = 1;
    this.currentBequestId = 1;
    this.currentAssuranceId = 1;
    this.currentDefinedBenefitFundId = 1;
    this.currentVoluntaryInvestmentId = 1;
    this.currentIncomeNeedId = 1;
    this.currentIncomeProvisionId = 1;
    this.currentResidueId = 1;
    this.currentAdditionalEstateDutyItemId = 1;
    this.currentLiabilityId = 1;
    this.currentAssetId = 1;
  }

  // Retirement Funds methods
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
      description: insertFund.description || "Enter details ...",
      owners: insertFund.owners || ["Donald Edwards"],
      coverAmount: insertFund.coverAmount || "R 0",
      unapprovedBeneficiaries: insertFund.unapprovedBeneficiaries || ["Enter details ..."],
      unapprovedPercentageSplits: insertFund.unapprovedPercentageSplits || ["0%"],
      unapprovedCoverSplits: insertFund.unapprovedCoverSplits || ["R 0"],
      monthlyIncome: insertFund.monthlyIncome || "R 0",
      monthlyIncomeCheckbox: insertFund.monthlyIncomeCheckbox || false,
      termYears: insertFund.termYears || "0 years",
      increasePercentage: insertFund.increasePercentage || "0%",
      approvedLifeCover: insertFund.approvedLifeCover || "R 0",
      fundValue: insertFund.fundValue || "R 0",
      fundValueAtDeath: insertFund.fundValueAtDeath || "R 0",
      fundValueBeneficiaries: insertFund.fundValueBeneficiaries || ["Enter details ..."],
      fundValuePercentageSplits: insertFund.fundValuePercentageSplits || ["0%"],
      fundValueCoverSplits: insertFund.fundValueCoverSplits || ["R 0"],
      lumpSumTaken: insertFund.lumpSumTaken || "R 0",
      nonDeductibleContribution: insertFund.nonDeductibleContribution || "R 0",
      livingAnnuity: insertFund.livingAnnuity || "R 0",
      livingAnnuityCheckbox: insertFund.livingAnnuityCheckbox || false,
      incomeTerm: insertFund.incomeTerm || "0 years"
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
    return allFunds.filter(fund => 
      fund.description.toLowerCase().includes(lowerQuery)
    );
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
      description: insertBequest.description || "Enter details ...",
      entity: insertBequest.entity || "Enter details ...",
      start: insertBequest.start || "Enter details ...",
      amount: insertBequest.amount || "R 0",
      increasePercentage: insertBequest.increasePercentage || "0%",
      cpi: insertBequest.cpi || false,
      valueAtDeath: insertBequest.valueAtDeath || "R 0"
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
      bequest.entity.toLowerCase().includes(lowerQuery)
    );
  }

  // Assurance methods
  async getAssurance(): Promise<Assurance[]> {
    return Array.from(this.assurance.values());
  }

  async getAssuranceById(id: number): Promise<Assurance | undefined> {
    return this.assurance.get(id);
  }

  async createAssurance(insertAssurance: InsertAssurance): Promise<Assurance> {
    const id = this.currentAssuranceId++;
    const assurance: Assurance = {
      id,
      description: insertAssurance.description || "Enter details ...",
      owners: insertAssurance.owners || ["Donald Edwards"],
      beneficiaries: insertAssurance.beneficiaries || ["Enter details ..."],
      deathBenefit: insertAssurance.deathBenefit || "R 0",
      amount: insertAssurance.amount || "R 0",
      premiumsByOthers: insertAssurance.premiumsByOthers || "R 0",
      collateralSession: insertAssurance.collateralSession || "R 0",
      benefitSplit: insertAssurance.benefitSplit || "0%",
      additionalInfo: insertAssurance.additionalInfo || "Enter details ..."
    };
    this.assurance.set(id, assurance);
    return assurance;
  }

  async updateAssurance(id: number, updates: UpdateAssurance): Promise<Assurance | undefined> {
    const existing = this.assurance.get(id);
    if (!existing) return undefined;
    
    const updated: Assurance = { ...existing, ...updates };
    this.assurance.set(id, updated);
    return updated;
  }

  async deleteAssurance(id: number): Promise<boolean> {
    return this.assurance.delete(id);
  }

  async searchAssurance(query: string): Promise<Assurance[]> {
    const allAssurance = Array.from(this.assurance.values());
    if (!query.trim()) return allAssurance;
    
    const lowerQuery = query.toLowerCase();
    return allAssurance.filter(assurance => 
      assurance.description.toLowerCase().includes(lowerQuery)
    );
  }

  // Defined Benefit Funds methods
  async getDefinedBenefitFunds(): Promise<DefinedBenefitFund[]> {
    return Array.from(this.definedBenefitFunds.values());
  }

  async getDefinedBenefitFund(id: number): Promise<DefinedBenefitFund | undefined> {
    return this.definedBenefitFunds.get(id);
  }

  async createDefinedBenefitFund(fund: InsertDefinedBenefitFund): Promise<DefinedBenefitFund> {
    const newFund: DefinedBenefitFund = {
      id: this.currentDefinedBenefitFundId++,
      ...fund
    };
    
    this.definedBenefitFunds.set(newFund.id, newFund);
    return newFund;
  }

  async updateDefinedBenefitFund(id: number, updates: UpdateDefinedBenefitFund): Promise<DefinedBenefitFund | undefined> {
    const existing = this.definedBenefitFunds.get(id);
    if (!existing) return undefined;
    
    const updated: DefinedBenefitFund = { ...existing, ...updates };
    this.definedBenefitFunds.set(id, updated);
    return updated;
  }

  async deleteDefinedBenefitFund(id: number): Promise<boolean> {
    return this.definedBenefitFunds.delete(id);
  }

  async searchDefinedBenefitFunds(query: string): Promise<DefinedBenefitFund[]> {
    const allFunds = Array.from(this.definedBenefitFunds.values());
    if (!query.trim()) return allFunds;
    
    const lowerQuery = query.toLowerCase();
    return allFunds.filter(fund => 
      fund.description.toLowerCase().includes(lowerQuery)
    );
  }

  // Voluntary Investments methods
  async getVoluntaryInvestments(): Promise<VoluntaryInvestment[]> {
    return Array.from(this.voluntaryInvestments.values());
  }

  async getVoluntaryInvestment(id: number): Promise<VoluntaryInvestment | undefined> {
    return this.voluntaryInvestments.get(id);
  }

  async createVoluntaryInvestment(investment: InsertVoluntaryInvestment): Promise<VoluntaryInvestment> {
    const newInvestment: VoluntaryInvestment = {
      id: this.currentVoluntaryInvestmentId++,
      ...investment
    };
    
    this.voluntaryInvestments.set(newInvestment.id, newInvestment);
    return newInvestment;
  }

  async updateVoluntaryInvestment(id: number, updates: UpdateVoluntaryInvestment): Promise<VoluntaryInvestment | undefined> {
    const existing = this.voluntaryInvestments.get(id);
    if (!existing) return undefined;
    
    const updated: VoluntaryInvestment = { ...existing, ...updates };
    this.voluntaryInvestments.set(id, updated);
    return updated;
  }

  async deleteVoluntaryInvestment(id: number): Promise<boolean> {
    return this.voluntaryInvestments.delete(id);
  }

  async searchVoluntaryInvestments(query: string): Promise<VoluntaryInvestment[]> {
    const allInvestments = Array.from(this.voluntaryInvestments.values());
    if (!query.trim()) return allInvestments;
    
    const lowerQuery = query.toLowerCase();
    return allInvestments.filter(investment => 
      investment.description.toLowerCase().includes(lowerQuery)
    );
  }

  // Income Needs methods
  async getIncomeNeeds(): Promise<IncomeNeeds[]> {
    return Array.from(this.incomeNeeds.values());
  }

  async getIncomeNeed(id: number): Promise<IncomeNeeds | undefined> {
    return this.incomeNeeds.get(id);
  }

  async createIncomeNeed(need: InsertIncomeNeeds): Promise<IncomeNeeds> {
    const newNeed: IncomeNeeds = {
      id: this.currentIncomeNeedId++,
      ...need
    };
    
    this.incomeNeeds.set(newNeed.id, newNeed);
    return newNeed;
  }

  async updateIncomeNeed(id: number, updates: UpdateIncomeNeeds): Promise<IncomeNeeds | undefined> {
    const existing = this.incomeNeeds.get(id);
    if (!existing) return undefined;
    
    const updated: IncomeNeeds = { ...existing, ...updates };
    this.incomeNeeds.set(id, updated);
    return updated;
  }

  async deleteIncomeNeed(id: number): Promise<boolean> {
    return this.incomeNeeds.delete(id);
  }

  async searchIncomeNeeds(query: string): Promise<IncomeNeeds[]> {
    const allNeeds = Array.from(this.incomeNeeds.values());
    if (!query.trim()) return allNeeds;
    
    const lowerQuery = query.toLowerCase();
    return allNeeds.filter(need => 
      need.description.toLowerCase().includes(lowerQuery) ||
      need.personName.toLowerCase().includes(lowerQuery)
    );
  }

  // Income Provisions methods
  async getIncomeProvisions(): Promise<IncomeProvisions[]> {
    return Array.from(this.incomeProvisions.values());
  }

  async getIncomeProvision(id: number): Promise<IncomeProvisions | undefined> {
    return this.incomeProvisions.get(id);
  }

  async createIncomeProvision(provision: InsertIncomeProvisions): Promise<IncomeProvisions> {
    const newProvision: IncomeProvisions = {
      id: this.currentIncomeProvisionId++,
      ...provision
    };
    
    this.incomeProvisions.set(newProvision.id, newProvision);
    return newProvision;
  }

  async updateIncomeProvision(id: number, updates: UpdateIncomeProvisions): Promise<IncomeProvisions | undefined> {
    const existing = this.incomeProvisions.get(id);
    if (!existing) return undefined;
    
    const updated: IncomeProvisions = { ...existing, ...updates };
    this.incomeProvisions.set(id, updated);
    return updated;
  }

  async deleteIncomeProvision(id: number): Promise<boolean> {
    return this.incomeProvisions.delete(id);
  }

  async searchIncomeProvisions(query: string): Promise<IncomeProvisions[]> {
    const allProvisions = Array.from(this.incomeProvisions.values());
    if (!query.trim()) return allProvisions;
    
    const lowerQuery = query.toLowerCase();
    return allProvisions.filter(provision => 
      provision.description.toLowerCase().includes(lowerQuery) ||
      provision.personName.toLowerCase().includes(lowerQuery)
    );
  }

  // Residue methods
  async getResidue(): Promise<Residue[]> {
    return Array.from(this.residue.values());
  }

  async getResidueItem(id: number): Promise<Residue | undefined> {
    return this.residue.get(id);
  }

  async createResidueItem(item: InsertResidue): Promise<Residue> {
    const newItem: Residue = {
      id: this.currentResidueId++,
      ...item
    };
    
    this.residue.set(newItem.id, newItem);
    return newItem;
  }

  async updateResidueItem(id: number, updates: UpdateResidue): Promise<Residue | undefined> {
    const existing = this.residue.get(id);
    if (!existing) return undefined;
    
    const updated: Residue = { ...existing, ...updates };
    this.residue.set(id, updated);
    return updated;
  }

  async deleteResidueItem(id: number): Promise<boolean> {
    return this.residue.delete(id);
  }

  async searchResidue(query: string): Promise<Residue[]> {
    const allResidue = Array.from(this.residue.values());
    if (!query.trim()) return allResidue;
    
    const lowerQuery = query.toLowerCase();
    return allResidue.filter(item => 
      item.description.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery)
    );
  }

  // Additional Estate Duty Items methods
  async getAdditionalEstateDutyItems(): Promise<AdditionalEstateDutyItems[]> {
    return Array.from(this.additionalEstateDutyItems.values());
  }

  async getAdditionalEstateDutyItem(id: number): Promise<AdditionalEstateDutyItems | undefined> {
    return this.additionalEstateDutyItems.get(id);
  }

  async createAdditionalEstateDutyItem(item: InsertAdditionalEstateDutyItems): Promise<AdditionalEstateDutyItems> {
    const newItem: AdditionalEstateDutyItems = {
      id: this.currentAdditionalEstateDutyItemId++,
      ...item
    };
    
    this.additionalEstateDutyItems.set(newItem.id, newItem);
    return newItem;
  }

  async updateAdditionalEstateDutyItem(id: number, updates: UpdateAdditionalEstateDutyItems): Promise<AdditionalEstateDutyItems | undefined> {
    const existing = this.additionalEstateDutyItems.get(id);
    if (!existing) return undefined;
    
    const updated: AdditionalEstateDutyItems = { ...existing, ...updates };
    this.additionalEstateDutyItems.set(id, updated);
    return updated;
  }

  async deleteAdditionalEstateDutyItem(id: number): Promise<boolean> {
    return this.additionalEstateDutyItems.delete(id);
  }

  async searchAdditionalEstateDutyItems(query: string): Promise<AdditionalEstateDutyItems[]> {
    const allItems = Array.from(this.additionalEstateDutyItems.values());
    if (!query.trim()) return allItems;
    
    const lowerQuery = query.toLowerCase();
    return allItems.filter(item => 
      item.description.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery)
    );
  }

  // Liabilities methods
  async getLiabilities(): Promise<Liabilities[]> {
    return Array.from(this.liabilities.values());
  }

  async getLiability(id: number): Promise<Liabilities | undefined> {
    return this.liabilities.get(id);
  }

  async createLiability(liability: InsertLiabilities): Promise<Liabilities> {
    const newLiability: Liabilities = {
      id: this.currentLiabilityId++,
      ...liability
    };
    
    this.liabilities.set(newLiability.id, newLiability);
    return newLiability;
  }

  async updateLiability(id: number, updates: UpdateLiabilities): Promise<Liabilities | undefined> {
    const existing = this.liabilities.get(id);
    if (!existing) return undefined;
    
    const updated: Liabilities = { ...existing, ...updates };
    this.liabilities.set(id, updated);
    return updated;
  }

  async deleteLiability(id: number): Promise<boolean> {
    return this.liabilities.delete(id);
  }

  async searchLiabilities(query: string): Promise<Liabilities[]> {
    const allLiabilities = Array.from(this.liabilities.values());
    if (!query.trim()) return allLiabilities;
    
    const lowerQuery = query.toLowerCase();
    return allLiabilities.filter(liability => 
      liability.description.toLowerCase().includes(lowerQuery)
    );
  }

  // Assets methods
  async getAssets(): Promise<Assets[]> {
    return Array.from(this.assets.values());
  }

  async getAsset(id: number): Promise<Assets | undefined> {
    return this.assets.get(id);
  }

  async createAsset(asset: InsertAssets): Promise<Assets> {
    const newAsset: Assets = {
      id: this.currentAssetId++,
      ...asset
    };
    
    this.assets.set(newAsset.id, newAsset);
    return newAsset;
  }

  async updateAsset(id: number, updates: Partial<InsertAssets>): Promise<Assets | undefined> {
    const existing = this.assets.get(id);
    if (!existing) return undefined;
    
    const updated: Assets = { ...existing, ...updates };
    this.assets.set(id, updated);
    return updated;
  }

  async deleteAsset(id: number): Promise<boolean> {
    return this.assets.delete(id);
  }

  async searchAssets(query: string): Promise<Assets[]> {
    const allAssets = Array.from(this.assets.values());
    if (!query.trim()) return allAssets;
    
    const lowerQuery = query.toLowerCase();
    return allAssets.filter(asset => 
      asset.description.toLowerCase().includes(lowerQuery)
    );
  }
}

// Database storage class
export class DbStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });

    this.db = drizzle(pool);
  }

  // Retirement Funds methods
  async getRetirementFunds(): Promise<RetirementFund[]> {
    return await this.db.select().from(retirementFunds);
  }

  async getRetirementFund(id: number): Promise<RetirementFund | undefined> {
    const result = await this.db.select().from(retirementFunds).where(eq(retirementFunds.id, id));
    return result[0];
  }

  async createRetirementFund(fund: InsertRetirementFund): Promise<RetirementFund> {
    const result = await this.db.insert(retirementFunds).values(fund).returning();
    return result[0];
  }

  async updateRetirementFund(id: number, updates: UpdateRetirementFund): Promise<RetirementFund | undefined> {
    const result = await this.db.update(retirementFunds)
      .set(updates)
      .where(eq(retirementFunds.id, id))
      .returning();
    return result[0];
  }

  async deleteRetirementFund(id: number): Promise<boolean> {
    const result = await this.db.delete(retirementFunds).where(eq(retirementFunds.id, id));
    return (result.rowCount || 0) > 0;
  }

  async searchRetirementFunds(query: string): Promise<RetirementFund[]> {
    return await this.db.select().from(retirementFunds)
      .where(ilike(retirementFunds.description, `%${query}%`));
  }

  // TODO: Implement all other methods for DbStorage
  // For now, we'll use MemStorage as the default
  [key: string]: any;
}

// Export storage instance - use MemStorage by default
export const storage: IStorage = new MemStorage();