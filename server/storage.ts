import { retirementFunds, lumpSumBequests, assurance, definedBenefitFunds, voluntaryInvestments, assetsAndLiabilities, incomeNeeds, incomeProvisions, residue, additionalEstateDutyItems, type RetirementFund, type InsertRetirementFund, type UpdateRetirementFund, type LumpSumBequest, type InsertLumpSumBequest, type Assurance, type InsertAssurance, type UpdateAssurance, type DefinedBenefitFund, type InsertDefinedBenefitFund, type UpdateDefinedBenefitFund, type VoluntaryInvestment, type InsertVoluntaryInvestment, type UpdateVoluntaryInvestment, type AssetAndLiability, type InsertAssetAndLiability, type UpdateAssetAndLiability, type IncomeNeed, type InsertIncomeNeed, type UpdateIncomeNeed, type IncomeProvision, type InsertIncomeProvision, type UpdateIncomeProvision, type Residue, type InsertResidue, type UpdateResidue, type AdditionalEstateDutyItem, type InsertAdditionalEstateDutyItem, type UpdateAdditionalEstateDutyItem } from "@shared/schema";
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
  
  // Assets and Liabilities
  getAssetsAndLiabilities(): Promise<AssetAndLiability[]>;
  getAssetAndLiability(id: number): Promise<AssetAndLiability | undefined>;
  createAssetAndLiability(asset: InsertAssetAndLiability): Promise<AssetAndLiability>;
  updateAssetAndLiability(id: number, updates: UpdateAssetAndLiability): Promise<AssetAndLiability | undefined>;
  deleteAssetAndLiability(id: number): Promise<boolean>;
  searchAssetsAndLiabilities(query: string): Promise<AssetAndLiability[]>;
  
  // Income Needs
  getIncomeNeeds(): Promise<IncomeNeed[]>;
  getIncomeNeed(id: number): Promise<IncomeNeed | undefined>;
  createIncomeNeed(need: InsertIncomeNeed): Promise<IncomeNeed>;
  updateIncomeNeed(id: number, updates: UpdateIncomeNeed): Promise<IncomeNeed | undefined>;
  deleteIncomeNeed(id: number): Promise<boolean>;
  searchIncomeNeeds(query: string): Promise<IncomeNeed[]>;
  
  // Income Provisions
  getIncomeProvisions(): Promise<IncomeProvision[]>;
  getIncomeProvision(id: number): Promise<IncomeProvision | undefined>;
  createIncomeProvision(provision: InsertIncomeProvision): Promise<IncomeProvision>;
  updateIncomeProvision(id: number, updates: UpdateIncomeProvision): Promise<IncomeProvision | undefined>;
  deleteIncomeProvision(id: number): Promise<boolean>;
  searchIncomeProvisions(query: string): Promise<IncomeProvision[]>;
  
  // Residue
  getResidue(): Promise<Residue[]>;
  getResidueItem(id: number): Promise<Residue | undefined>;
  createResidueItem(item: InsertResidue): Promise<Residue>;
  updateResidueItem(id: number, updates: UpdateResidue): Promise<Residue | undefined>;
  deleteResidueItem(id: number): Promise<boolean>;
  searchResidue(query: string): Promise<Residue[]>;
  
  // Additional Estate Duty Items
  getAdditionalEstateDutyItems(): Promise<AdditionalEstateDutyItem[]>;
  getAdditionalEstateDutyItem(id: number): Promise<AdditionalEstateDutyItem | undefined>;
  createAdditionalEstateDutyItem(item: InsertAdditionalEstateDutyItem): Promise<AdditionalEstateDutyItem>;
  updateAdditionalEstateDutyItem(id: number, updates: UpdateAdditionalEstateDutyItem): Promise<AdditionalEstateDutyItem | undefined>;
  deleteAdditionalEstateDutyItem(id: number): Promise<boolean>;
  searchAdditionalEstateDutyItems(query: string): Promise<AdditionalEstateDutyItem[]>;
}

export class MemStorage implements IStorage {
  private retirementFunds: Map<number, RetirementFund>;
  private lumpSumBequests: Map<number, LumpSumBequest>;
  private assurance: Map<number, Assurance>;
  private definedBenefitFunds: Map<number, DefinedBenefitFund>;
  private voluntaryInvestments: Map<number, VoluntaryInvestment>;
  private assetsAndLiabilities: Map<number, AssetAndLiability>;
  private incomeNeeds: Map<number, IncomeNeed>;
  private incomeProvisions: Map<number, IncomeProvision>;
  private residue: Map<number, Residue>;
  private additionalEstateDutyItems: Map<number, AdditionalEstateDutyItem>;
  private currentFundId: number;
  private currentBequestId: number;
  private currentAssuranceId: number;
  private currentDefinedBenefitFundId: number;
  private currentVoluntaryInvestmentId: number;
  private currentAssetAndLiabilityId: number;
  private currentIncomeNeedId: number;
  private currentIncomeProvisionId: number;
  private currentResidueId: number;
  private currentAdditionalEstateDutyItemId: number;

  constructor() {
    this.retirementFunds = new Map();
    this.lumpSumBequests = new Map();
    this.assurance = new Map();
    this.definedBenefitFunds = new Map();
    this.voluntaryInvestments = new Map();
    this.assetsAndLiabilities = new Map();
    this.incomeNeeds = new Map();
    this.incomeProvisions = new Map();
    this.residue = new Map();
    this.additionalEstateDutyItems = new Map();
    this.currentFundId = 1;
    this.currentBequestId = 1;
    this.currentAssuranceId = 1;
    this.currentDefinedBenefitFundId = 1;
    this.currentVoluntaryInvestmentId = 1;
    this.currentAssetAndLiabilityId = 1;
    this.currentIncomeNeedId = 1;
    this.currentIncomeProvisionId = 1;
    this.currentResidueId = 1;
    this.currentAdditionalEstateDutyItemId = 1;
    
    // Initialize with sample data
    this.createRetirementFund({
      description: "Total Pension Fund",
      owner: "John Doe",
      additionalOwners: [],
      coverAmount: "R 500,000",
      termYears: "10",
      increasePercentage: "5%",
      approvedLifeCover: "R 500,000",
      fundValue: "R 180,000",
      fundValueAtDeath: "R 200,000",
      name: "Sarah Doe",
      amount: "R 150,000",
      lumpSumTaken: "R 25,000",
      fundValueBeneficiaries: "R 125,000",
      nonDeductibleContribution: "R 10,000",
      livingAnnuity: "R 120,000",
      monthlyIncome: "R 5,000",
      incomeTerm: "20",
      beneficiary: "Sarah Doe",
      benefitSplit: "60%",
      additionalBeneficiaries: [],
      additionalBenefitSplits: []
    });
    
    this.createRetirementFund({
      description: "Provident Fund",
      owner: "Jane Smith",
      additionalOwners: ["Tom Smith"],
      coverAmount: "R 700,000",
      termYears: "15",
      increasePercentage: "4%",
      approvedLifeCover: "R 175,000",
      fundValue: "R 120,000",
      fundValueAtDeath: "R 140,000",
      name: "Tom Smith",
      amount: "R 100,000",
      lumpSumTaken: "R 15,000",
      fundValueBeneficiaries: "R 85,000",
      nonDeductibleContribution: "R 8,000",
      livingAnnuity: "R 85,000",
      monthlyIncome: "R 3,500",
      incomeTerm: "25",
      beneficiary: "Tom Smith",
      benefitSplit: "50%",
      additionalBeneficiaries: ["Anna Smith"],
      additionalBenefitSplits: ["50%"]
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
    
    // Initialize sample assurance policies
    this.createAssurance({
      description: "GB Assurance Term Life",
      owner: "Donald Edwards",
      additionalOwners: [],
      lifeAssured: "Donald Edwards",
      deathBenefit: "1000000",
      beneficiary: "Betty Edwards",
      benefitSplit: "100",
      additionalBeneficiaries: [],
      additionalBenefitSplits: [],
      amount: "1000000",
      buySell: false,
      keyMan: false,
      premiumsByOthers: "0",
      collateralSession: "0",
      excludedFromEstateDuty: false,
      excludedFromProvisions: false
    });
    
    // Initialize sample defined benefit funds
    this.createDefinedBenefitFund({
      description: "Government Pension Fund",
      owner: "Donald Edwards",
      yearsOfService: "25",
      finalMonthlySalary: "R 15,000",
      deathLumpSum: "R 450,000",
      additionalTaxFreeAmount: "R 75,000",
      pensionIncomeAmount: "R 8,000",
      pensionIncomeIncrease: "5%",
    });
    
    // Initialize sample voluntary investments
    this.createVoluntaryInvestment({
      description: "Unit Trust Portfolio",
      owners: '["Donald Edwards"]',
      ownershipPercentages: '["100"]',
      baseCost: "R 500,000",
      marketValue: "R 750,000",
      liquidationPercentage: "85%",
      spouse: "R 637,500",
      others: "R 0",
      excludedFromJointEstate: false,
      excludedFromEstateDuty: false,
      excludedFromCGT: false,
      excludedFromExecutorsFees: false,
    });
    
    // Initialize sample assets and liabilities with category structure
    const categories = [
      "Immovable assets (primary residence)",
      "Immovable assets (other)", 
      "Business interests",
      "Movable property",
      "Personal effects (personal use assets)",
      "Other assets"
    ];
    
    // Create header rows for each category
    categories.forEach((category, index) => {
      this.createAssetAndLiability({
        include: true,
        categoryAndDescription: category,
        currency: "ZAR",
        baseCost: "0",
        marketValue: "0",
        donaldEdwardsPercentage: "0",
        bettyEdwardsPercentage: "0",
        liquidationPercentage: "0",
        spouse: "0",
        others: "0",
        excludedFromJointEstate: false,
        excludedFromEstateDuty: false,
        excludedFromCGT: false,
        category: category,
        isHeader: true,
        sortOrder: index * 100,
      });
    });
    
    // Add sample asset under primary residence
    this.createAssetAndLiability({
      include: true,
      categoryAndDescription: "Family Home - 123 Oak Street",
      currency: "ZAR",
      baseCost: "R 800,000",
      marketValue: "R 1,200,000",
      donaldEdwardsPercentage: "50%",
      bettyEdwardsPercentage: "50%",
      liquidationPercentage: "85%",
      spouse: "R 510,000",
      others: "R 510,000",
      excludedFromJointEstate: false,
      excludedFromEstateDuty: false,
      excludedFromCGT: true,
      category: "Immovable assets (primary residence)",
      isHeader: false,
      sortOrder: 1,
    });
    
    // Initialize sample income needs
    this.createIncomeNeed({
      description: "Living Expenses",
      entity: "Donald Edwards",
      start: "0",
      termYears: "20",
      termEditable: true,
      increasePercentage: "5%",
      cpi: false,
      frequency: "Monthly",
      amount: "R 25,000",
      capitalisedAmount: "R 3,750,000",
    });
    
    // Initialize sample income provisions
    this.createIncomeProvision({
      description: "Rental Income",
      entity: "Donald Edwards",
      start: "0",
      termYears: "25",
      termEditable: true,
      increasePercentage: "3%",
      cpi: true,
      frequency: "Monthly",
      amount: "R 15,000",
      taxablePercentage: "100%",
      taxPercentage: "35%",
      capitalisedAmount: "R 2,250,000",
    });
    
    // Initialize sample residue
    this.createResidueItem({
      entity: "Donald Edwards",
      percentage: "60%",
      isCharityRow: false,
    });
    
    this.createResidueItem({
      entity: "Betty Edwards",
      percentage: "40%",
      isCharityRow: false,
    });
    
    // Initialize charity row
    this.createResidueItem({
      entity: "Residue to registered charities",
      percentage: "0%",
      isCharityRow: true,
    });
    
    // Initialize sample estate duty items
    this.createAdditionalEstateDutyItem({
      description: "Administration Fees",
      amount: "R 50,000",
      isDeduction: true,
      excludeFromJointEstate: false,
    });
    
    this.createAdditionalEstateDutyItem({
      description: "Specific Bequest",
      amount: "R 100,000",
      isDeduction: false,
      excludeFromJointEstate: true,
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
      description: insertAssurance.description || "",
      owner: insertAssurance.owner || "Donald Edwards",
      additionalOwners: insertAssurance.additionalOwners || [],
      lifeAssured: insertAssurance.lifeAssured || "",
      deathBenefit: insertAssurance.deathBenefit || "0",
      beneficiary: insertAssurance.beneficiary || "",
      benefitSplit: insertAssurance.benefitSplit || "0",
      additionalBeneficiaries: insertAssurance.additionalBeneficiaries || [],
      additionalBenefitSplits: insertAssurance.additionalBenefitSplits || [],
      amount: insertAssurance.amount || "0",
      buySell: insertAssurance.buySell || false,
      keyMan: insertAssurance.keyMan || false,
      premiumsByOthers: insertAssurance.premiumsByOthers || "0",
      collateralSession: insertAssurance.collateralSession || "0",
      excludedFromEstateDuty: insertAssurance.excludedFromEstateDuty || false,
      excludedFromProvisions: insertAssurance.excludedFromProvisions || false,
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
      assurance.description.toLowerCase().includes(lowerQuery) ||
      assurance.owner.toLowerCase().includes(lowerQuery) ||
      assurance.lifeAssured.toLowerCase().includes(lowerQuery) ||
      assurance.beneficiary.toLowerCase().includes(lowerQuery)
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
      fund.description.toLowerCase().includes(lowerQuery) ||
      fund.owner.toLowerCase().includes(lowerQuery)
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
    return allInvestments.filter(investment => {
      const owners = JSON.parse(investment.owners);
      return investment.description.toLowerCase().includes(lowerQuery) ||
             owners.some((owner: string) => owner.toLowerCase().includes(lowerQuery));
    });
  }

  // Assets and Liabilities methods
  async getAssetsAndLiabilities(): Promise<AssetAndLiability[]> {
    const assets = Array.from(this.assetsAndLiabilities.values());
    return assets.sort((a, b) => {
      if (a.category !== b.category) {
        return a.sortOrder - b.sortOrder;
      }
      if (a.isHeader !== b.isHeader) {
        return a.isHeader ? -1 : 1;
      }
      return a.sortOrder - b.sortOrder;
    });
  }

  async getAssetAndLiability(id: number): Promise<AssetAndLiability | undefined> {
    return this.assetsAndLiabilities.get(id);
  }

  async createAssetAndLiability(asset: InsertAssetAndLiability): Promise<AssetAndLiability> {
    const newAsset: AssetAndLiability = {
      id: this.currentAssetAndLiabilityId++,
      ...asset
    };
    
    this.assetsAndLiabilities.set(newAsset.id, newAsset);
    return newAsset;
  }

  async updateAssetAndLiability(id: number, updates: UpdateAssetAndLiability): Promise<AssetAndLiability | undefined> {
    const existing = this.assetsAndLiabilities.get(id);
    if (!existing) return undefined;
    
    const updated: AssetAndLiability = { ...existing, ...updates };
    this.assetsAndLiabilities.set(id, updated);
    return updated;
  }

  async deleteAssetAndLiability(id: number): Promise<boolean> {
    return this.assetsAndLiabilities.delete(id);
  }

  async searchAssetsAndLiabilities(query: string): Promise<AssetAndLiability[]> {
    const allAssets = await this.getAssetsAndLiabilities();
    if (!query.trim()) return allAssets;
    
    const lowerQuery = query.toLowerCase();
    return allAssets.filter(asset => 
      asset.categoryAndDescription.toLowerCase().includes(lowerQuery) ||
      asset.category.toLowerCase().includes(lowerQuery)
    );
  }

  // Income Needs methods
  async getIncomeNeeds(): Promise<IncomeNeed[]> {
    return Array.from(this.incomeNeeds.values());
  }

  async getIncomeNeed(id: number): Promise<IncomeNeed | undefined> {
    return this.incomeNeeds.get(id);
  }

  async createIncomeNeed(need: InsertIncomeNeed): Promise<IncomeNeed> {
    const newNeed: IncomeNeed = {
      id: this.currentIncomeNeedId++,
      ...need
    };
    
    this.incomeNeeds.set(newNeed.id, newNeed);
    return newNeed;
  }

  async updateIncomeNeed(id: number, updates: UpdateIncomeNeed): Promise<IncomeNeed | undefined> {
    const existing = this.incomeNeeds.get(id);
    if (!existing) return undefined;
    
    const updated: IncomeNeed = { ...existing, ...updates };
    this.incomeNeeds.set(id, updated);
    return updated;
  }

  async deleteIncomeNeed(id: number): Promise<boolean> {
    return this.incomeNeeds.delete(id);
  }

  async searchIncomeNeeds(query: string): Promise<IncomeNeed[]> {
    const allNeeds = Array.from(this.incomeNeeds.values());
    if (!query.trim()) return allNeeds;
    
    const lowerQuery = query.toLowerCase();
    return allNeeds.filter(need => 
      need.description.toLowerCase().includes(lowerQuery) ||
      need.entity.toLowerCase().includes(lowerQuery)
    );
  }

  // Income Provisions methods
  async getIncomeProvisions(): Promise<IncomeProvision[]> {
    return Array.from(this.incomeProvisions.values());
  }

  async getIncomeProvision(id: number): Promise<IncomeProvision | undefined> {
    return this.incomeProvisions.get(id);
  }

  async createIncomeProvision(provision: InsertIncomeProvision): Promise<IncomeProvision> {
    const newProvision: IncomeProvision = {
      id: this.currentIncomeProvisionId++,
      ...provision
    };
    
    this.incomeProvisions.set(newProvision.id, newProvision);
    return newProvision;
  }

  async updateIncomeProvision(id: number, updates: UpdateIncomeProvision): Promise<IncomeProvision | undefined> {
    const existing = this.incomeProvisions.get(id);
    if (!existing) return undefined;
    
    const updated: IncomeProvision = { ...existing, ...updates };
    this.incomeProvisions.set(id, updated);
    return updated;
  }

  async deleteIncomeProvision(id: number): Promise<boolean> {
    return this.incomeProvisions.delete(id);
  }

  async searchIncomeProvisions(query: string): Promise<IncomeProvision[]> {
    const allProvisions = Array.from(this.incomeProvisions.values());
    if (!query.trim()) return allProvisions;
    
    const lowerQuery = query.toLowerCase();
    return allProvisions.filter(provision => 
      provision.description.toLowerCase().includes(lowerQuery) ||
      provision.entity.toLowerCase().includes(lowerQuery)
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
    const allItems = Array.from(this.residue.values());
    if (!query.trim()) return allItems;
    
    const lowerQuery = query.toLowerCase();
    return allItems.filter(item => 
      item.entity.toLowerCase().includes(lowerQuery)
    );
  }

  // Additional Estate Duty Items methods
  async getAdditionalEstateDutyItems(): Promise<AdditionalEstateDutyItem[]> {
    return Array.from(this.additionalEstateDutyItems.values());
  }

  async getAdditionalEstateDutyItem(id: number): Promise<AdditionalEstateDutyItem | undefined> {
    return this.additionalEstateDutyItems.get(id);
  }

  async createAdditionalEstateDutyItem(item: InsertAdditionalEstateDutyItem): Promise<AdditionalEstateDutyItem> {
    const newItem: AdditionalEstateDutyItem = {
      id: this.currentAdditionalEstateDutyItemId++,
      ...item
    };
    
    this.additionalEstateDutyItems.set(newItem.id, newItem);
    return newItem;
  }

  async updateAdditionalEstateDutyItem(id: number, updates: UpdateAdditionalEstateDutyItem): Promise<AdditionalEstateDutyItem | undefined> {
    const existing = this.additionalEstateDutyItems.get(id);
    if (!existing) return undefined;
    
    const updated: AdditionalEstateDutyItem = { ...existing, ...updates };
    this.additionalEstateDutyItems.set(id, updated);
    return updated;
  }

  async deleteAdditionalEstateDutyItem(id: number): Promise<boolean> {
    return this.additionalEstateDutyItems.delete(id);
  }

  async searchAdditionalEstateDutyItems(query: string): Promise<AdditionalEstateDutyItem[]> {
    const allItems = Array.from(this.additionalEstateDutyItems.values());
    if (!query.trim()) return allItems;
    
    const lowerQuery = query.toLowerCase();
    return allItems.filter(item => 
      item.description.toLowerCase().includes(lowerQuery)
    );
  }
}

// Database storage implementation
class DbStorage implements IStorage {
  private pool = new Pool({ connectionString: process.env.DATABASE_URL });
  private db = drizzle(this.pool);

  // Lump Sum Bequests implementation
  async getLumpSumBequests(): Promise<LumpSumBequest[]> {
    return await this.db.select().from(lumpSumBequests).orderBy(lumpSumBequests.id);
  }

  async getLumpSumBequest(id: number): Promise<LumpSumBequest | undefined> {
    const results = await this.db.select().from(lumpSumBequests).where(eq(lumpSumBequests.id, id)).limit(1);
    return results[0];
  }

  async createLumpSumBequest(bequest: InsertLumpSumBequest): Promise<LumpSumBequest> {
    const results = await this.db.insert(lumpSumBequests).values(bequest).returning();
    return results[0];
  }

  async updateLumpSumBequest(id: number, updates: Partial<InsertLumpSumBequest>): Promise<LumpSumBequest | undefined> {
    const results = await this.db.update(lumpSumBequests).set(updates).where(eq(lumpSumBequests.id, id)).returning();
    return results[0];
  }

  async deleteLumpSumBequest(id: number): Promise<boolean> {
    const results = await this.db.delete(lumpSumBequests).where(eq(lumpSumBequests.id, id)).returning();
    return results.length > 0;
  }

  async searchLumpSumBequests(query: string): Promise<LumpSumBequest[]> {
    if (!query.trim()) return await this.getLumpSumBequests();
    
    return await this.db.select().from(lumpSumBequests)
      .where(or(
        ilike(lumpSumBequests.description, `%${query}%`),
        ilike(lumpSumBequests.entity, `%${query}%`)
      ))
      .orderBy(lumpSumBequests.id);
  }

  // Retirement Funds methods - Database implementation
  async getRetirementFunds(): Promise<RetirementFund[]> {
    return await this.db.select().from(retirementFunds).orderBy(retirementFunds.id);
  }

  async getRetirementFund(id: number): Promise<RetirementFund | undefined> {
    const results = await this.db.select().from(retirementFunds).where(eq(retirementFunds.id, id));
    return results[0];
  }

  async createRetirementFund(fund: InsertRetirementFund): Promise<RetirementFund> {
    const results = await this.db.insert(retirementFunds).values(fund).returning();
    return results[0];
  }

  async updateRetirementFund(id: number, updates: UpdateRetirementFund): Promise<RetirementFund | undefined> {
    const results = await this.db.update(retirementFunds).set(updates).where(eq(retirementFunds.id, id)).returning();
    return results[0];
  }

  async deleteRetirementFund(id: number): Promise<boolean> {
    const results = await this.db.delete(retirementFunds).where(eq(retirementFunds.id, id)).returning();
    return results.length > 0;
  }

  async searchRetirementFunds(query: string): Promise<RetirementFund[]> {
    if (!query.trim()) return await this.getRetirementFunds();
    
    return await this.db.select().from(retirementFunds)
      .where(or(
        ilike(retirementFunds.description, `%${query}%`),
        ilike(retirementFunds.owner, `%${query}%`)
      ))
      .orderBy(retirementFunds.id);
  }

  // Assurance methods - Database implementation
  async getAssurance(): Promise<Assurance[]> {
    return await this.db.select().from(assurance).orderBy(assurance.id);
  }

  async getAssuranceById(id: number): Promise<Assurance | undefined> {
    const results = await this.db.select().from(assurance).where(eq(assurance.id, id));
    return results[0];
  }

  async createAssurance(assuranceData: InsertAssurance): Promise<Assurance> {
    const results = await this.db.insert(assurance).values(assuranceData).returning();
    return results[0];
  }

  async updateAssurance(id: number, updates: UpdateAssurance): Promise<Assurance | undefined> {
    const results = await this.db.update(assurance).set(updates).where(eq(assurance.id, id)).returning();
    return results[0];
  }

  async deleteAssurance(id: number): Promise<boolean> {
    const results = await this.db.delete(assurance).where(eq(assurance.id, id)).returning();
    return results.length > 0;
  }

  async searchAssurance(query: string): Promise<Assurance[]> {
    if (!query.trim()) return await this.getAssurance();
    
    return await this.db.select().from(assurance)
      .where(or(
        ilike(assurance.description, `%${query}%`),
        ilike(assurance.owner, `%${query}%`)
      ))
      .orderBy(assurance.id);
  }

  // Defined Benefit Funds methods - Database implementation
  async getDefinedBenefitFunds(): Promise<DefinedBenefitFund[]> {
    return await this.db.select().from(definedBenefitFunds).orderBy(definedBenefitFunds.id);
  }

  async getDefinedBenefitFund(id: number): Promise<DefinedBenefitFund | undefined> {
    const results = await this.db.select().from(definedBenefitFunds).where(eq(definedBenefitFunds.id, id));
    return results[0];
  }

  async createDefinedBenefitFund(fund: InsertDefinedBenefitFund): Promise<DefinedBenefitFund> {
    const results = await this.db.insert(definedBenefitFunds).values(fund).returning();
    return results[0];
  }

  async updateDefinedBenefitFund(id: number, updates: UpdateDefinedBenefitFund): Promise<DefinedBenefitFund | undefined> {
    const results = await this.db.update(definedBenefitFunds).set(updates).where(eq(definedBenefitFunds.id, id)).returning();
    return results[0];
  }

  async deleteDefinedBenefitFund(id: number): Promise<boolean> {
    const results = await this.db.delete(definedBenefitFunds).where(eq(definedBenefitFunds.id, id)).returning();
    return results.length > 0;
  }

  async searchDefinedBenefitFunds(query: string): Promise<DefinedBenefitFund[]> {
    if (!query.trim()) return await this.getDefinedBenefitFunds();
    
    return await this.db.select().from(definedBenefitFunds)
      .where(or(
        ilike(definedBenefitFunds.description, `%${query}%`),
        ilike(definedBenefitFunds.owner, `%${query}%`)
      ))
      .orderBy(definedBenefitFunds.id);
  }

  // Voluntary Investments methods - Database implementation  
  async getVoluntaryInvestments(): Promise<VoluntaryInvestment[]> {
    return await this.db.select().from(voluntaryInvestments).orderBy(voluntaryInvestments.id);
  }

  async getVoluntaryInvestment(id: number): Promise<VoluntaryInvestment | undefined> {
    const results = await this.db.select().from(voluntaryInvestments).where(eq(voluntaryInvestments.id, id));
    return results[0];
  }

  async createVoluntaryInvestment(investment: InsertVoluntaryInvestment): Promise<VoluntaryInvestment> {
    const results = await this.db.insert(voluntaryInvestments).values(investment).returning();
    return results[0];
  }

  async updateVoluntaryInvestment(id: number, updates: UpdateVoluntaryInvestment): Promise<VoluntaryInvestment | undefined> {
    const results = await this.db.update(voluntaryInvestments).set(updates).where(eq(voluntaryInvestments.id, id)).returning();
    return results[0];
  }

  async deleteVoluntaryInvestment(id: number): Promise<boolean> {
    const results = await this.db.delete(voluntaryInvestments).where(eq(voluntaryInvestments.id, id)).returning();
    return results.length > 0;
  }

  async searchVoluntaryInvestments(query: string): Promise<VoluntaryInvestment[]> {
    if (!query.trim()) return await this.getVoluntaryInvestments();
    
    return await this.db.select().from(voluntaryInvestments)
      .where(or(
        ilike(voluntaryInvestments.description, `%${query}%`),
        ilike(voluntaryInvestments.owners, `%${query}%`)
      ))
      .orderBy(voluntaryInvestments.id);
  }

  // Assets and Liabilities methods - Database implementation
  async getAssetsAndLiabilities(): Promise<AssetAndLiability[]> {
    return await this.db.select().from(assetsAndLiabilities).orderBy(assetsAndLiabilities.id);
  }

  async getAssetAndLiability(id: number): Promise<AssetAndLiability | undefined> {
    const results = await this.db.select().from(assetsAndLiabilities).where(eq(assetsAndLiabilities.id, id));
    return results[0];
  }

  async createAssetAndLiability(asset: InsertAssetAndLiability): Promise<AssetAndLiability> {
    const results = await this.db.insert(assetsAndLiabilities).values(asset).returning();
    return results[0];
  }

  async updateAssetAndLiability(id: number, updates: UpdateAssetAndLiability): Promise<AssetAndLiability | undefined> {
    const results = await this.db.update(assetsAndLiabilities).set(updates).where(eq(assetsAndLiabilities.id, id)).returning();
    return results[0];
  }

  async deleteAssetAndLiability(id: number): Promise<boolean> {
    const results = await this.db.delete(assetsAndLiabilities).where(eq(assetsAndLiabilities.id, id)).returning();
    return results.length > 0;
  }

  async searchAssetsAndLiabilities(query: string): Promise<AssetAndLiability[]> {
    if (!query.trim()) return await this.getAssetsAndLiabilities();
    
    return await this.db.select().from(assetsAndLiabilities)
      .where(or(
        ilike(assetsAndLiabilities.baseCost, `%${query}%`),
        ilike(assetsAndLiabilities.marketValue, `%${query}%`)
      ))
      .orderBy(assetsAndLiabilities.id);
  }

  // Income Needs methods - Database implementation
  async getIncomeNeeds(): Promise<IncomeNeed[]> {
    return await this.db.select().from(incomeNeeds).orderBy(incomeNeeds.id);
  }

  async getIncomeNeed(id: number): Promise<IncomeNeed | undefined> {
    const results = await this.db.select().from(incomeNeeds).where(eq(incomeNeeds.id, id));
    return results[0];
  }

  async createIncomeNeed(need: InsertIncomeNeed): Promise<IncomeNeed> {
    const results = await this.db.insert(incomeNeeds).values(need).returning();
    return results[0];
  }

  async updateIncomeNeed(id: number, updates: UpdateIncomeNeed): Promise<IncomeNeed | undefined> {
    const results = await this.db.update(incomeNeeds).set(updates).where(eq(incomeNeeds.id, id)).returning();
    return results[0];
  }

  async deleteIncomeNeed(id: number): Promise<boolean> {
    const results = await this.db.delete(incomeNeeds).where(eq(incomeNeeds.id, id)).returning();
    return results.length > 0;
  }

  async searchIncomeNeeds(query: string): Promise<IncomeNeed[]> {
    if (!query.trim()) return await this.getIncomeNeeds();
    
    return await this.db.select().from(incomeNeeds)
      .where(or(
        ilike(incomeNeeds.description, `%${query}%`),
        ilike(incomeNeeds.amount, `%${query}%`)
      ))
      .orderBy(incomeNeeds.id);
  }

  // Income Provisions methods - Database implementation
  async getIncomeProvisions(): Promise<IncomeProvision[]> {
    return await this.db.select().from(incomeProvisions).orderBy(incomeProvisions.id);
  }

  async getIncomeProvision(id: number): Promise<IncomeProvision | undefined> {
    const results = await this.db.select().from(incomeProvisions).where(eq(incomeProvisions.id, id));
    return results[0];
  }

  async createIncomeProvision(provision: InsertIncomeProvision): Promise<IncomeProvision> {
    const results = await this.db.insert(incomeProvisions).values(provision).returning();
    return results[0];
  }

  async updateIncomeProvision(id: number, updates: UpdateIncomeProvision): Promise<IncomeProvision | undefined> {
    const results = await this.db.update(incomeProvisions).set(updates).where(eq(incomeProvisions.id, id)).returning();
    return results[0];
  }

  async deleteIncomeProvision(id: number): Promise<boolean> {
    const results = await this.db.delete(incomeProvisions).where(eq(incomeProvisions.id, id)).returning();
    return results.length > 0;
  }

  async searchIncomeProvisions(query: string): Promise<IncomeProvision[]> {
    if (!query.trim()) return await this.getIncomeProvisions();
    
    return await this.db.select().from(incomeProvisions)
      .where(or(
        ilike(incomeProvisions.description, `%${query}%`),
        ilike(incomeProvisions.entity, `%${query}%`)
      ))
      .orderBy(incomeProvisions.id);
  }

  async getResidue(): Promise<Residue[]> {
    return await this.db.select().from(residue).orderBy(residue.id);
  }

  async getResidueItem(id: number): Promise<Residue | undefined> {
    const results = await this.db.select().from(residue).where(eq(residue.id, id));
    return results[0];
  }

  async createResidueItem(item: InsertResidue): Promise<Residue> {
    const results = await this.db.insert(residue).values(item).returning();
    return results[0];
  }

  async updateResidueItem(id: number, updates: UpdateResidue): Promise<Residue | undefined> {
    const results = await this.db.update(residue).set(updates).where(eq(residue.id, id)).returning();
    return results[0];
  }

  async deleteResidueItem(id: number): Promise<boolean> {
    const results = await this.db.delete(residue).where(eq(residue.id, id)).returning();
    return results.length > 0;
  }

  async searchResidue(query: string): Promise<Residue[]> {
    if (!query.trim()) return await this.getResidue();
    
    return await this.db.select().from(residue)
      .where(or(
        ilike(residue.entity, `%${query}%`)
      ))
      .orderBy(residue.id);
  }

  async getAdditionalEstateDutyItems(): Promise<AdditionalEstateDutyItem[]> {
    return await this.db.select().from(additionalEstateDutyItems).orderBy(additionalEstateDutyItems.id);
  }

  async getAdditionalEstateDutyItem(id: number): Promise<AdditionalEstateDutyItem | undefined> {
    const results = await this.db.select().from(additionalEstateDutyItems).where(eq(additionalEstateDutyItems.id, id));
    return results[0];
  }

  async createAdditionalEstateDutyItem(item: InsertAdditionalEstateDutyItem): Promise<AdditionalEstateDutyItem> {
    const results = await this.db.insert(additionalEstateDutyItems).values(item).returning();
    return results[0];
  }

  async updateAdditionalEstateDutyItem(id: number, updates: UpdateAdditionalEstateDutyItem): Promise<AdditionalEstateDutyItem | undefined> {
    const results = await this.db.update(additionalEstateDutyItems).set(updates).where(eq(additionalEstateDutyItems.id, id)).returning();
    return results[0];
  }

  async deleteAdditionalEstateDutyItem(id: number): Promise<boolean> {
    const results = await this.db.delete(additionalEstateDutyItems).where(eq(additionalEstateDutyItems.id, id)).returning();
    return results.length > 0;
  }

  async searchAdditionalEstateDutyItems(query: string): Promise<AdditionalEstateDutyItem[]> {
    if (!query.trim()) return await this.getAdditionalEstateDutyItems();
    
    return await this.db.select().from(additionalEstateDutyItems)
      .where(or(
        ilike(additionalEstateDutyItems.description, `%${query}%`)
      ))
      .orderBy(additionalEstateDutyItems.id);
  }
}

// Use database storage if DATABASE_URL is available, otherwise use memory storage
export const storage = process.env.DATABASE_URL ? new DbStorage() : new MemStorage();
