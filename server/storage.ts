import {
  retirementFunds,
  lumpSumBequests,
  assurance,
  definedBenefitFunds,
  voluntaryInvestments,
  incomeNeeds,
  incomeProvisions,
  residue,
  additionalEstateDutyItems,
  liabilities,
  clientDetails,
  estatePositionParameters,
  financialPlans,
  needs,
  planNeeds,
  type RetirementFund,
  type InsertRetirementFund,
  type UpdateRetirementFund,
  type LumpSumBequest,
  type InsertLumpSumBequest,
  type Assurance,
  type InsertAssurance,
  type UpdateAssurance,
  type DefinedBenefitFund,
  type InsertDefinedBenefitFund,
  type UpdateDefinedBenefitFund,
  type VoluntaryInvestment,
  type InsertVoluntaryInvestment,
  type UpdateVoluntaryInvestment,
  type IncomeNeeds,
  type InsertIncomeNeeds,
  type UpdateIncomeNeeds,
  type IncomeProvisions,
  type InsertIncomeProvisions,
  type UpdateIncomeProvisions,
  type Residue,
  type InsertResidue,
  type UpdateResidue,
  type AdditionalEstateDutyItems,
  type InsertAdditionalEstateDutyItems,
  type UpdateAdditionalEstateDutyItems,
  type Liabilities,
  type InsertLiabilities,
  type UpdateLiabilities,
  type ClientDetails,
  type InsertClientDetails,
  type UpdateClientDetails,
  type EstatePositionParameters,
  type InsertEstatePositionParameters,
  type UpdateEstatePositionParameters,
  type FinancialPlan,
  type InsertFinancialPlan,
  type UpdateFinancialPlan,
  type Need,
  type InsertNeed,
  type UpdateNeed,
  type PlanNeed,
  type InsertPlanNeed,
  type UpdatePlanNeed,
  retirementParameters,
  type RetirementParameters,
  type InsertRetirementParameters,
  type UpdateRetirementParameters,
  futureInflows,
  type FutureInflow,
  type InsertFutureInflow,
  type UpdateFutureInflow,
  retirementLumpSumNeeds,
  type RetirementLumpSumNeed,
  type InsertRetirementLumpSumNeed,
  type UpdateRetirementLumpSumNeed,
} from "@shared/schema";
import { assets, type Assets, type InsertAssets } from "@shared/assets-schema";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import { eq, ilike, or, asc, and } from "drizzle-orm";

export interface IStorage {
  // Retirement Funds
  getRetirementFunds(): Promise<RetirementFund[]>;
  getRetirementFund(id: number): Promise<RetirementFund | undefined>;
  createRetirementFund(fund: InsertRetirementFund): Promise<RetirementFund>;
  updateRetirementFund(
    id: number,
    updates: UpdateRetirementFund,
  ): Promise<RetirementFund | undefined>;
  deleteRetirementFund(id: number): Promise<boolean>;
  searchRetirementFunds(query: string): Promise<RetirementFund[]>;

  // Lump Sum Bequests
  getLumpSumBequests(): Promise<LumpSumBequest[]>;
  getLumpSumBequest(id: number): Promise<LumpSumBequest | undefined>;
  createLumpSumBequest(bequest: InsertLumpSumBequest): Promise<LumpSumBequest>;
  updateLumpSumBequest(
    id: number,
    updates: Partial<InsertLumpSumBequest>,
  ): Promise<LumpSumBequest | undefined>;
  deleteLumpSumBequest(id: number): Promise<boolean>;
  searchLumpSumBequests(query: string): Promise<LumpSumBequest[]>;

  // Assurance
  getAssurance(): Promise<Assurance[]>;
  getAssuranceById(id: number): Promise<Assurance | undefined>;
  createAssurance(assurance: InsertAssurance): Promise<Assurance>;
  updateAssurance(
    id: number,
    updates: UpdateAssurance,
  ): Promise<Assurance | undefined>;
  deleteAssurance(id: number): Promise<boolean>;
  searchAssurance(query: string): Promise<Assurance[]>;

  // Defined Benefit Funds
  getDefinedBenefitFunds(): Promise<DefinedBenefitFund[]>;
  getDefinedBenefitFund(id: number): Promise<DefinedBenefitFund | undefined>;
  createDefinedBenefitFund(
    fund: InsertDefinedBenefitFund,
  ): Promise<DefinedBenefitFund>;
  updateDefinedBenefitFund(
    id: number,
    updates: UpdateDefinedBenefitFund,
  ): Promise<DefinedBenefitFund | undefined>;
  deleteDefinedBenefitFund(id: number): Promise<boolean>;
  searchDefinedBenefitFunds(query: string): Promise<DefinedBenefitFund[]>;

  // Voluntary Investments
  getVoluntaryInvestments(): Promise<VoluntaryInvestment[]>;
  getVoluntaryInvestment(id: number): Promise<VoluntaryInvestment | undefined>;
  createVoluntaryInvestment(
    investment: InsertVoluntaryInvestment,
  ): Promise<VoluntaryInvestment>;
  updateVoluntaryInvestment(
    id: number,
    updates: UpdateVoluntaryInvestment,
  ): Promise<VoluntaryInvestment | undefined>;
  deleteVoluntaryInvestment(id: number): Promise<boolean>;
  searchVoluntaryInvestments(query: string): Promise<VoluntaryInvestment[]>;

  // Income Needs
  getIncomeNeeds(): Promise<IncomeNeeds[]>;
  getIncomeNeed(id: number): Promise<IncomeNeeds | undefined>;
  createIncomeNeed(need: InsertIncomeNeeds): Promise<IncomeNeeds>;
  updateIncomeNeed(
    id: number,
    updates: UpdateIncomeNeeds,
  ): Promise<IncomeNeeds | undefined>;
  deleteIncomeNeed(id: number): Promise<boolean>;
  searchIncomeNeeds(query: string): Promise<IncomeNeeds[]>;

  // Income Provisions
  getIncomeProvisions(): Promise<IncomeProvisions[]>;
  getIncomeProvision(id: number): Promise<IncomeProvisions | undefined>;
  createIncomeProvision(
    provision: InsertIncomeProvisions,
  ): Promise<IncomeProvisions>;
  updateIncomeProvision(
    id: number,
    updates: UpdateIncomeProvisions,
  ): Promise<IncomeProvisions | undefined>;
  deleteIncomeProvision(id: number): Promise<boolean>;
  searchIncomeProvisions(query: string): Promise<IncomeProvisions[]>;

  // Residue
  getResidue(): Promise<Residue[]>;
  getResidueItem(id: number): Promise<Residue | undefined>;
  createResidueItem(item: InsertResidue): Promise<Residue>;
  updateResidueItem(
    id: number,
    updates: UpdateResidue,
  ): Promise<Residue | undefined>;
  deleteResidueItem(id: number): Promise<boolean>;
  searchResidue(query: string): Promise<Residue[]>;

  // Additional Estate Duty Items
  getAdditionalEstateDutyItems(): Promise<AdditionalEstateDutyItems[]>;
  getAdditionalEstateDutyItem(
    id: number,
  ): Promise<AdditionalEstateDutyItems | undefined>;
  createAdditionalEstateDutyItem(
    item: InsertAdditionalEstateDutyItems,
  ): Promise<AdditionalEstateDutyItems>;
  updateAdditionalEstateDutyItem(
    id: number,
    updates: UpdateAdditionalEstateDutyItems,
  ): Promise<AdditionalEstateDutyItems | undefined>;
  deleteAdditionalEstateDutyItem(id: number): Promise<boolean>;
  searchAdditionalEstateDutyItems(
    query: string,
  ): Promise<AdditionalEstateDutyItems[]>;

  // Liabilities
  getLiabilities(): Promise<Liabilities[]>;
  getLiability(id: number): Promise<Liabilities | undefined>;
  createLiability(liability: InsertLiabilities): Promise<Liabilities>;
  updateLiability(
    id: number,
    updates: UpdateLiabilities,
  ): Promise<Liabilities | undefined>;
  deleteLiability(id: number): Promise<boolean>;
  searchLiabilities(query: string): Promise<Liabilities[]>;

  // Assets
  getAssets(): Promise<Assets[]>;
  getAsset(id: number): Promise<Assets | undefined>;
  createAsset(asset: InsertAssets): Promise<Assets>;
  updateAsset(
    id: number,
    updates: Partial<InsertAssets>,
  ): Promise<Assets | undefined>;
  deleteAsset(id: number): Promise<boolean>;
  searchAssets(query: string): Promise<Assets[]>;

  // Client Details
  getClientDetails(): Promise<ClientDetails[]>;
  getClientDetail(id: number): Promise<ClientDetails | undefined>;
  createClientDetail(clientDetail: InsertClientDetails): Promise<ClientDetails>;
  updateClientDetail(
    id: number,
    updates: UpdateClientDetails,
  ): Promise<ClientDetails | undefined>;
  deleteClientDetail(id: number): Promise<boolean>;
  searchClientDetails(query: string): Promise<ClientDetails[]>;

  // Estate Position Parameters
  getEstatePositionParameters(): Promise<EstatePositionParameters[]>;
  getEstatePositionParameter(id: number): Promise<EstatePositionParameters | undefined>;
  createEstatePositionParameter(parameter: InsertEstatePositionParameters): Promise<EstatePositionParameters>;
  updateEstatePositionParameter(
    id: number,
    updates: UpdateEstatePositionParameters,
  ): Promise<EstatePositionParameters | undefined>;
  deleteEstatePositionParameter(id: number): Promise<boolean>;
  getOrCreateEstatePositionParameter(): Promise<EstatePositionParameters>;

  // Financial Plans
  getFinancialPlans(): Promise<FinancialPlan[]>;
  getFinancialPlan(id: number): Promise<FinancialPlan | undefined>;
  createFinancialPlan(plan: InsertFinancialPlan): Promise<FinancialPlan>;
  updateFinancialPlan(
    id: number,
    updates: UpdateFinancialPlan,
  ): Promise<FinancialPlan | undefined>;
  deleteFinancialPlan(id: number): Promise<boolean>;
  searchFinancialPlans(query: string): Promise<FinancialPlan[]>;

  // Needs
  getNeeds(): Promise<Need[]>;
  getNeed(id: number): Promise<Need | undefined>;
  createNeed(need: InsertNeed): Promise<Need>;
  updateNeed(
    id: number,
    updates: UpdateNeed,
  ): Promise<Need | undefined>;
  deleteNeed(id: number): Promise<boolean>;
  initializeDefaultNeeds(): Promise<void>;

  // Plan Needs
  getPlanNeeds(planId: number): Promise<PlanNeed[]>;
  addNeedToPlan(planNeed: InsertPlanNeed): Promise<PlanNeed>;
  removeNeedFromPlan(planId: number, needId: number): Promise<boolean>;
  removeAllNeedsFromPlan(planId: number): Promise<boolean>;
  updatePlanNeed(
    id: number,
    updates: UpdatePlanNeed,
  ): Promise<PlanNeed | undefined>;

  // Plan with Needs
  getFinancialPlanWithNeeds(planId: number): Promise<{ plan: FinancialPlan; needs: Need[] } | undefined>;

  // Retirement Parameters (one row per plan)
  getRetirementParameters(planId: number): Promise<RetirementParameters | undefined>;
  upsertRetirementParameters(planId: number, updates: UpdateRetirementParameters): Promise<RetirementParameters>;

  // Future Inflows
  getFutureInflows(): Promise<FutureInflow[]>;
  getFutureInflow(id: number): Promise<FutureInflow | undefined>;
  createFutureInflow(inflow: InsertFutureInflow): Promise<FutureInflow>;
  updateFutureInflow(id: number, updates: UpdateFutureInflow): Promise<FutureInflow | undefined>;
  deleteFutureInflow(id: number): Promise<boolean>;

  // Retirement Lump Sum Needs
  getRetirementLumpSumNeeds(): Promise<RetirementLumpSumNeed[]>;
  getRetirementLumpSumNeed(id: number): Promise<RetirementLumpSumNeed | undefined>;
  createRetirementLumpSumNeed(need: InsertRetirementLumpSumNeed): Promise<RetirementLumpSumNeed>;
  updateRetirementLumpSumNeed(id: number, updates: UpdateRetirementLumpSumNeed): Promise<RetirementLumpSumNeed | undefined>;
  deleteRetirementLumpSumNeed(id: number): Promise<boolean>;
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
  private clientDetails: Map<number, ClientDetails>;
  private estatePositionParameters: Map<number, EstatePositionParameters>;
  private financialPlans: Map<number, FinancialPlan>;
  private needs: Map<number, Need>;
  private planNeeds: Map<number, PlanNeed>;
  private retirementParameters: Map<number, RetirementParameters>;
  private futureInflows: Map<number, FutureInflow>;
  private retirementLumpSumNeeds: Map<number, RetirementLumpSumNeed>;

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
  private currentClientDetailId: number;
  private currentEstatePositionParameterId: number;
  private currentFinancialPlanId: number;
  private currentNeedId: number;
  private currentPlanNeedId: number;
  private currentRetirementParameterId: number;
  private currentFutureInflowId: number;
  private currentRetirementLumpSumNeedId: number;

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
    this.clientDetails = new Map();
    this.estatePositionParameters = new Map();
    this.financialPlans = new Map();
    this.needs = new Map();
    this.planNeeds = new Map();
    this.retirementParameters = new Map();
    this.futureInflows = new Map();
    this.retirementLumpSumNeeds = new Map();

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
    this.currentClientDetailId = 1;
    this.currentEstatePositionParameterId = 1;
    this.currentFinancialPlanId = 1;
    this.currentNeedId = 1;
    this.currentPlanNeedId = 1;
    this.currentRetirementParameterId = 1;
    this.currentFutureInflowId = 1;
    this.currentRetirementLumpSumNeedId = 1;

    // Initialize default needs
    this.initializeDefaultNeeds();
  }

  // Retirement Funds methods
  async getRetirementFunds(): Promise<RetirementFund[]> {
    return Array.from(this.retirementFunds.values()).sort(
      (a, b) => a.id - b.id,
    );
  }

  async getRetirementFund(id: number): Promise<RetirementFund | undefined> {
    return this.retirementFunds.get(id);
  }

  async createRetirementFund(
    insertFund: InsertRetirementFund,
  ): Promise<RetirementFund> {
    const id = this.currentFundId++;
    const fund: RetirementFund = {
      id,
      description: insertFund.description || null, // Store null for empty values
      owners: insertFund.owners || ["Donald Edwards"],
      ownershipPercentages: insertFund.ownershipPercentages || ["100%"],
      coverAmount: insertFund.coverAmount || "R 0",
      unapprovedBeneficiaries: insertFund.unapprovedBeneficiaries || [""],
      unapprovedPercentageSplits: insertFund.unapprovedPercentageSplits || [
        "0%",
      ],
      unapprovedCoverSplits: insertFund.unapprovedCoverSplits || ["R 0"],
      monthlyIncome: insertFund.monthlyIncome || "R 0",
      monthlyIncomeCheckbox: insertFund.monthlyIncomeCheckbox || false,
      termYears: insertFund.termYears || "0 years",
      increasePercentage: insertFund.increasePercentage || "0%",
      approvedLifeCover: insertFund.approvedLifeCover || "R 0",
      fundValue: insertFund.fundValue || "R 0",
      fundValueAtDeath: insertFund.fundValueAtDeath || "R 0",
      fundValueBeneficiaries: insertFund.fundValueBeneficiaries || [""],
      fundValuePercentageSplits: insertFund.fundValuePercentageSplits || ["0%"],
      fundValueCoverSplits: insertFund.fundValueCoverSplits || ["R 0"],
      lumpSumTaken: insertFund.lumpSumTaken || "R 0",
      nonDeductibleContribution: insertFund.nonDeductibleContribution || "R 0",
      livingAnnuity: insertFund.livingAnnuity || "R 0",
      livingAnnuityCheckbox: insertFund.livingAnnuityCheckbox || false,
      incomeTerm: insertFund.incomeTerm || "0 years",
      additionalOwners: insertFund.additionalOwners || [],
      owner: insertFund.owner || "Donald Edwards",
      name: insertFund.name || "",
      amount: insertFund.amount || "R 0",
      beneficiaryName: insertFund.beneficiaryName || "",
      beneficiaryPercentageSplit: insertFund.beneficiaryPercentageSplit || "0%",
      additionalBeneficiaries: insertFund.additionalBeneficiaries || [],
      additionalBenefitSplits: insertFund.additionalBenefitSplits || [],
      beneficiaries: insertFund.beneficiaries || "[]",
      lumpSumDeath: insertFund.lumpSumDeath || "R 0",
      fundValueAfterLumpSum: insertFund.fundValueAfterLumpSum || "R 0",
      monthlyIncomeTerm: insertFund.monthlyIncomeTerm || "0 years",
      lumpSumProvisionEstate: insertFund.lumpSumProvisionEstate || "R 0",
      lumpSumProvisionSpouse: insertFund.lumpSumProvisionSpouse || "R 0",
      lumpSumProvisionOther: insertFund.lumpSumProvisionOther || "R 0",
      currentAnnualIncome: insertFund.currentAnnualIncome || "R 0",
      monthlyProvisionOffered: insertFund.monthlyProvisionOffered || "R 0",
      incomeEscalation: insertFund.incomeEscalation || "0%",
      estateDutyPoliciesOnLife: insertFund.estateDutyPoliciesOnLife || "0%",
      estateDutyToSpouse: insertFund.estateDutyToSpouse || "0%",
      estateDutyToOthers: insertFund.estateDutyToOthers || "0%",
      executorsFee: insertFund.executorsFee || "0%",
      mastersFee: insertFund.mastersFee || "0%",
      monthlyContribution: insertFund.monthlyContribution || "R 0",
      contributionEscalation: insertFund.contributionEscalation || "0%",
      growthRate: insertFund.growthRate || "10%",
    };
    this.retirementFunds.set(id, fund);
    return fund;
  }

  async updateRetirementFund(
    id: number,
    updates: UpdateRetirementFund,
  ): Promise<RetirementFund | undefined> {
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
    return allFunds.filter((fund) =>
      fund.description?.toLowerCase().includes(lowerQuery),
    );
  }

  // Lump Sum Bequests methods
  async getLumpSumBequests(): Promise<LumpSumBequest[]> {
    return Array.from(this.lumpSumBequests.values());
  }

  async getLumpSumBequest(id: number): Promise<LumpSumBequest | undefined> {
    return this.lumpSumBequests.get(id);
  }

  async createLumpSumBequest(
    insertBequest: InsertLumpSumBequest,
  ): Promise<LumpSumBequest> {
    const id = this.currentBequestId++;
    const bequest: LumpSumBequest = {
      id,
      name: insertBequest.name || "",
      description: insertBequest.description || "",
      entity: insertBequest.entity || "Enter details ...",
      start: insertBequest.start || "Enter details ...",
      amount: insertBequest.amount || "R 0",
      increasePercentage: insertBequest.increasePercentage || "0%",
      cpi: insertBequest.cpi || false,
      valueAtDeath: insertBequest.valueAtDeath || "R 0",
    };
    this.lumpSumBequests.set(id, bequest);
    return bequest;
  }

  async updateLumpSumBequest(
    id: number,
    updates: Partial<InsertLumpSumBequest>,
  ): Promise<LumpSumBequest | undefined> {
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
    return allBequests.filter(
      (bequest) =>
        bequest.description.toLowerCase().includes(lowerQuery) ||
        bequest.entity.toLowerCase().includes(lowerQuery),
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
      owners: insertAssurance.owners || ["Donald Edwards"],
      lifeAssured: insertAssurance.lifeAssured || [""],
      deathBenefits: insertAssurance.deathBenefits || ["R 0"],
      ownershipPercentages: insertAssurance.ownershipPercentages || ["100%"],
      beneficiaries: insertAssurance.beneficiaries || [""],
      beneficiaryPercentages: insertAssurance.beneficiaryPercentages || ["100%"],
      deathBenefit: insertAssurance.deathBenefit || "R 0",
      amount: insertAssurance.amount || "R 0",
      amountToggles: insertAssurance.amountToggles || [true],
      amountYearsValues: insertAssurance.amountYearsValues || ["0 years"],
      amountIncreaseValues: insertAssurance.amountIncreaseValues || ["0%"],
      premiumsByOthers: insertAssurance.premiumsByOthers || "R 0",
      collateralSession: insertAssurance.collateralSession || "R 0",
      benefitSplit: insertAssurance.benefitSplit || "0%",
      buySell: insertAssurance.buySell ?? false,
      keyMan: insertAssurance.keyMan ?? false,
      excludedFromEstateDuty: insertAssurance.excludedFromEstateDuty ?? false,
      excludedFromProvisions: insertAssurance.excludedFromProvisions ?? false,
      additionalOwners: insertAssurance.additionalOwners || [],
      additionalBeneficiaries: insertAssurance.additionalBeneficiaries || [],
      additionalBenefitSplits: insertAssurance.additionalBenefitSplits || [],
      additionalInfo: insertAssurance.additionalInfo || "",
    };
    this.assurance.set(id, assurance);
    return assurance;
  }

  async updateAssurance(
    id: number,
    updates: UpdateAssurance,
  ): Promise<Assurance | undefined> {
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
    return allAssurance.filter((assurance) =>
      assurance.description.toLowerCase().includes(lowerQuery),
    );
  }

  // Defined Benefit Funds methods
  async getDefinedBenefitFunds(): Promise<DefinedBenefitFund[]> {
    return Array.from(this.definedBenefitFunds.values());
  }

  async getDefinedBenefitFund(
    id: number,
  ): Promise<DefinedBenefitFund | undefined> {
    return this.definedBenefitFunds.get(id);
  }

  async createDefinedBenefitFund(
    fund: InsertDefinedBenefitFund,
  ): Promise<DefinedBenefitFund> {
    const newFund: DefinedBenefitFund = {
      id: this.currentDefinedBenefitFundId++,
      description: fund.description || "Enter details ...",
      owners: fund.owners || ["Enter details ..."],
      ownershipPercentages: fund.ownershipPercentages || ["100%"],
      yearsOfService: fund.yearsOfService || "0 years",
      finalMonthlySalary: fund.finalMonthlySalary || "R 0",
      deathLumpSum: fund.deathLumpSum || "R 0",
      additionalTaxFreeAmount: fund.additionalTaxFreeAmount || "R 0",
      pensionIncomeAmount: fund.pensionIncomeAmount || "R 0",
      pensionIncomeCheckbox: fund.pensionIncomeCheckbox ?? true,
      pensionIncomeYears: fund.pensionIncomeYears || "0 years",
      pensionIncomeIncrease: fund.pensionIncomeIncrease || "0%",
      growthRate: fund.growthRate || "10%",
    };

    this.definedBenefitFunds.set(newFund.id, newFund);
    return newFund;
  }

  async updateDefinedBenefitFund(
    id: number,
    updates: UpdateDefinedBenefitFund,
  ): Promise<DefinedBenefitFund | undefined> {
    const existing = this.definedBenefitFunds.get(id);
    if (!existing) return undefined;

    const updated: DefinedBenefitFund = { ...existing, ...updates };
    this.definedBenefitFunds.set(id, updated);
    return updated;
  }

  async deleteDefinedBenefitFund(id: number): Promise<boolean> {
    return this.definedBenefitFunds.delete(id);
  }

  async searchDefinedBenefitFunds(
    query: string,
  ): Promise<DefinedBenefitFund[]> {
    const allFunds = Array.from(this.definedBenefitFunds.values());
    if (!query.trim()) return allFunds;

    const lowerQuery = query.toLowerCase();
    return allFunds.filter((fund) =>
      fund.description.toLowerCase().includes(lowerQuery),
    );
  }

  // Voluntary Investments methods
  async getVoluntaryInvestments(): Promise<VoluntaryInvestment[]> {
    return Array.from(this.voluntaryInvestments.values());
  }

  async getVoluntaryInvestment(
    id: number,
  ): Promise<VoluntaryInvestment | undefined> {
    return this.voluntaryInvestments.get(id);
  }

  async createVoluntaryInvestment(
    investment: InsertVoluntaryInvestment,
  ): Promise<VoluntaryInvestment> {
    const newInvestment: VoluntaryInvestment = {
      id: this.currentVoluntaryInvestmentId++,
      description: investment.description || "",
      owners: investment.owners || ["Donald Edwards"],
      ownershipPercentages: investment.ownershipPercentages || ["100%"],
      baseCost: investment.baseCost || "R 0",
      marketValue: investment.marketValue || "R 0",
      liquidationPercentage: investment.liquidationPercentage || "0%",
      spouse: investment.spouse || "R 0",
      others: investment.others || "R 0",
      excludedFromJointEstate: investment.excludedFromJointEstate || false,
      excludedFromEstateDuty: investment.excludedFromEstateDuty || false,
      excludedFromCGT: investment.excludedFromCGT || false,
      excludedFromExecutorsFees: investment.excludedFromExecutorsFees || false,
      monthlyContribution: investment.monthlyContribution || "R 0",
      contributionEscalation: investment.contributionEscalation || "0%",
      growthRate: investment.growthRate || "10%",
      incomeIncrease: investment.incomeIncrease || "0%",
    };

    this.voluntaryInvestments.set(newInvestment.id, newInvestment);
    return newInvestment;
  }

  async updateVoluntaryInvestment(
    id: number,
    updates: UpdateVoluntaryInvestment,
  ): Promise<VoluntaryInvestment | undefined> {
    const existing = this.voluntaryInvestments.get(id);
    if (!existing) return undefined;

    const updated: VoluntaryInvestment = { ...existing, ...updates };
    this.voluntaryInvestments.set(id, updated);
    return updated;
  }

  async deleteVoluntaryInvestment(id: number): Promise<boolean> {
    return this.voluntaryInvestments.delete(id);
  }

  async searchVoluntaryInvestments(
    query: string,
  ): Promise<VoluntaryInvestment[]> {
    const allInvestments = Array.from(this.voluntaryInvestments.values());
    if (!query.trim()) return allInvestments;

    const lowerQuery = query.toLowerCase();
    return allInvestments.filter((investment) =>
      investment.description.toLowerCase().includes(lowerQuery),
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
      name: need.name || "",
      description: need.description || "",
      personName: need.personName || "",
      startDate: need.startDate || "",
      amount: need.amount || "R 0",
      termYears: need.termYears || "0 years",
      increasePercentage: need.increasePercentage || "0%",
      cpi: need.cpi || false,
      frequency: need.frequency || "Monthly",
      capitalisedAmount: need.capitalisedAmount || "R 0",
    };

    this.incomeNeeds.set(newNeed.id, newNeed);
    return newNeed;
  }

  async updateIncomeNeed(
    id: number,
    updates: UpdateIncomeNeeds,
  ): Promise<IncomeNeeds | undefined> {
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
    return allNeeds.filter(
      (need) =>
        need.description.toLowerCase().includes(lowerQuery) ||
        need.personName.toLowerCase().includes(lowerQuery),
    );
  }

  // Income Provisions methods
  async getIncomeProvisions(): Promise<IncomeProvisions[]> {
    return Array.from(this.incomeProvisions.values());
  }

  async getIncomeProvision(id: number): Promise<IncomeProvisions | undefined> {
    return this.incomeProvisions.get(id);
  }

  async createIncomeProvision(
    provision: InsertIncomeProvisions,
  ): Promise<IncomeProvisions> {
    const newProvision: IncomeProvisions = {
      id: this.currentIncomeProvisionId++,
      name: provision.name || "",
      description: provision.description || "",
      personName: provision.personName || "Enter details ...",
      startDate: provision.startDate || "Enter details ...",
      amount: provision.amount || "R 0",
      termYears: provision.termYears || "0 years",
      increasePercentage: provision.increasePercentage || "0%",
      cpi: provision.cpi || false,
      frequency: provision.frequency || "Monthly",
      capitalisedAmount: provision.capitalisedAmount || "R 0",
      taxPercentage: provision.taxPercentage || "0%",
      taxRate: provision.taxRate || "R 0",
    };

    this.incomeProvisions.set(newProvision.id, newProvision);
    return newProvision;
  }

  async updateIncomeProvision(
    id: number,
    updates: UpdateIncomeProvisions,
  ): Promise<IncomeProvisions | undefined> {
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
    return allProvisions.filter(
      (provision) =>
        provision.description.toLowerCase().includes(lowerQuery) ||
        provision.personName.toLowerCase().includes(lowerQuery),
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
      entity: item.entity || "Residue to registered charities",
      percentage: item.percentage || "0",
    };

    this.residue.set(newItem.id, newItem);
    return newItem;
  }

  async updateResidueItem(
    id: number,
    updates: UpdateResidue,
  ): Promise<Residue | undefined> {
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
    return allResidue.filter(
      (item) =>
        item.entity.toLowerCase().includes(lowerQuery),
    );
  }

  // Additional Estate Duty Items methods
  async getAdditionalEstateDutyItems(): Promise<AdditionalEstateDutyItems[]> {
    return Array.from(this.additionalEstateDutyItems.values());
  }

  async getAdditionalEstateDutyItem(
    id: number,
  ): Promise<AdditionalEstateDutyItems | undefined> {
    return this.additionalEstateDutyItems.get(id);
  }

  async createAdditionalEstateDutyItem(
    item: InsertAdditionalEstateDutyItems,
  ): Promise<AdditionalEstateDutyItems> {
    const newItem: AdditionalEstateDutyItems = {
      id: this.currentAdditionalEstateDutyItemId++,
      name: item.name || "",
      description: item.description || "",
      amount: item.amount || "R 0",
      deduction: item.deduction ?? false,
      excludeFromJointEstate: item.excludeFromJointEstate ?? false,
    };

    this.additionalEstateDutyItems.set(newItem.id, newItem);
    return newItem;
  }

  async updateAdditionalEstateDutyItem(
    id: number,
    updates: UpdateAdditionalEstateDutyItems,
  ): Promise<AdditionalEstateDutyItems | undefined> {
    const existing = this.additionalEstateDutyItems.get(id);
    if (!existing) return undefined;

    const updated: AdditionalEstateDutyItems = { ...existing, ...updates };
    this.additionalEstateDutyItems.set(id, updated);
    return updated;
  }

  async deleteAdditionalEstateDutyItem(id: number): Promise<boolean> {
    return this.additionalEstateDutyItems.delete(id);
  }

  async searchAdditionalEstateDutyItems(
    query: string,
  ): Promise<AdditionalEstateDutyItems[]> {
    const allItems = Array.from(this.additionalEstateDutyItems.values());
    if (!query.trim()) return allItems;

    const lowerQuery = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.description.toLowerCase().includes(lowerQuery),
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
      description: liability.description || "Enter details...",
      currency: liability.currency || "ZAR",
      debtAmount: liability.debtAmount || "R 0",
      entityOwnership: liability.entityOwnership || "{}",
      estate: liability.estate || "R 0",
      others: liability.others || "R 0",
      client: liability.client || "R 0",
      section: liability.section || "BONDS",
      included: liability.included ?? true,
    };

    this.liabilities.set(newLiability.id, newLiability);
    return newLiability;
  }

  async updateLiability(
    id: number,
    updates: UpdateLiabilities,
  ): Promise<Liabilities | undefined> {
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
    return allLiabilities.filter((liability) =>
      liability.description.toLowerCase().includes(lowerQuery),
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
      description: asset.description || "Enter details...",
      marketValue: asset.marketValue || "R 0",
      entityOwnership: asset.entityOwnership || "{}",
      estate: asset.estate || "R 0",
      others: asset.others || "R 0",
      client: asset.client || "R 0",
      section: asset.section || "PROPERTY",
      included: asset.included ?? true,
    };

    this.assets.set(newAsset.id, newAsset);
    return newAsset;
  }

  async updateAsset(
    id: number,
    updates: Partial<InsertAssets>,
  ): Promise<Assets | undefined> {
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
    return allAssets.filter((asset) =>
      asset.description.toLowerCase().includes(lowerQuery),
    );
  }

  // Client Details methods
  async getClientDetails(): Promise<ClientDetails[]> {
    return Array.from(this.clientDetails.values()).sort((a, b) => a.id - b.id);
  }

  async getClientDetail(id: number): Promise<ClientDetails | undefined> {
    return this.clientDetails.get(id);
  }

  async createClientDetail(
    clientDetail: InsertClientDetails,
  ): Promise<ClientDetails> {
    const newClientDetail: ClientDetails = {
      id: this.currentClientDetailId++,
      entityName: clientDetail.entityName || "",
      entityType: clientDetail.entityType || "Primary entity",
      dateOfBirth: clientDetail.dateOfBirth || "",
      age: clientDetail.age || "0",
      taxRate: clientDetail.taxRate || "South Africa",
      marginalTaxRate: clientDetail.marginalTaxRate || "0%",
      maritalStatus: clientDetail.maritalStatus || "",
      maritalRegime: clientDetail.maritalRegime || "",
      maritalDate: clientDetail.maritalDate || "",
      accrualInception: clientDetail.accrualInception || "0",
    };

    this.clientDetails.set(newClientDetail.id, newClientDetail);
    return newClientDetail;
  }

  async updateClientDetail(
    id: number,
    updates: UpdateClientDetails,
  ): Promise<ClientDetails | undefined> {
    const existing = this.clientDetails.get(id);
    if (!existing) return undefined;

    const updated: ClientDetails = { ...existing, ...updates };
    this.clientDetails.set(id, updated);
    return updated;
  }

  async deleteClientDetail(id: number): Promise<boolean> {
    return this.clientDetails.delete(id);
  }

  async searchClientDetails(query: string): Promise<ClientDetails[]> {
    const allClientDetails = Array.from(this.clientDetails.values());
    if (!query.trim()) return allClientDetails;

    const lowerQuery = query.toLowerCase();
    return allClientDetails.filter(
      (client) =>
        client.entityName.toLowerCase().includes(lowerQuery) ||
        client.entityType.toLowerCase().includes(lowerQuery)
    );
  }

  // Estate Position Parameters methods for MemStorage
  async getEstatePositionParameters(): Promise<EstatePositionParameters[]> {
    return Array.from(this.estatePositionParameters.values()).sort((a, b) => a.id - b.id);
  }

  async getEstatePositionParameter(id: number): Promise<EstatePositionParameters | undefined> {
    return this.estatePositionParameters.get(id);
  }

  async createEstatePositionParameter(parameter: InsertEstatePositionParameters): Promise<EstatePositionParameters> {
    const newParameter: EstatePositionParameters = {
      id: this.currentEstatePositionParameterId++,
      lifeCoverToEstate: parameter.lifeCoverToEstate || "R 0",
      voluntaryInvestments: parameter.voluntaryInvestments || "R 0",
      accrualClaimFromSpouse: parameter.accrualClaimFromSpouse || "R 0",
      dependantsSurplusUtilised: parameter.dependantsSurplusUtilised || "R 0",
      ownEstateCapitalProvided: parameter.ownEstateCapitalProvided || "R 0",
      estateDuty: parameter.estateDuty || "R 0",
      executorsFees: parameter.executorsFees || "R 0",
      settleClientLiabilities: parameter.settleClientLiabilities || "R 0",
      capitalGainsTax: parameter.capitalGainsTax || "R 0",
      mastersFee: parameter.mastersFee || "R 0",
      deathBedFuneralExpenses: parameter.deathBedFuneralExpenses || "R 0",
      conveyancingValuationFees: parameter.conveyancingValuationFees || "R 0",
      accrualClaimToSpouse: parameter.accrualClaimToSpouse || "R 0",
      ownEstateCapitalRequired: parameter.ownEstateCapitalRequired || "R 0",
      surplus: parameter.surplus || "R 0",
      estateSurplusUtilisedForDependants: parameter.estateSurplusUtilisedForDependants || "R 0",
      estatePositionAfterAllocation: parameter.estatePositionAfterAllocation || "R 0",
      lastUpdated: parameter.lastUpdated || new Date().toISOString(),
    };
    this.estatePositionParameters.set(newParameter.id, newParameter);
    return newParameter;
  }

  async updateEstatePositionParameter(
    id: number,
    updates: UpdateEstatePositionParameters,
  ): Promise<EstatePositionParameters | undefined> {
    const parameter = this.estatePositionParameters.get(id);
    if (!parameter) {
      return undefined;
    }

    const updatedParameter = { ...parameter, ...updates };
    this.estatePositionParameters.set(id, updatedParameter);
    return updatedParameter;
  }

  async deleteEstatePositionParameter(id: number): Promise<boolean> {
    return this.estatePositionParameters.delete(id);
  }

  async getOrCreateEstatePositionParameter(): Promise<EstatePositionParameters> {
    // Try to get existing parameter (should be only one record)
    const existing = Array.from(this.estatePositionParameters.values());
    if (existing.length > 0) {
      return existing[0];
    }

    // If none exists, create with default values from the screenshot
    const defaultParameter: InsertEstatePositionParameters = {
      lifeCoverToEstate: "R 4,000,000",
      voluntaryInvestments: "R 7,812,990", 
      accrualClaimFromSpouse: "R 0",
      dependantsSurplusUtilised: "R 0",
      ownEstateCapitalProvided: "R 0",
      estateDuty: "R 177,457",
      executorsFees: "R 813,573",
      settleClientLiabilities: "R 1,380,000",
      capitalGainsTax: "R 886,653",
      mastersFee: "R 7,000",
      deathBedFuneralExpenses: "R 60,000",
      conveyancingValuationFees: "R 132,130",
      accrualClaimToSpouse: "R 6,081,350",
      ownEstateCapitalRequired: "R 0",
      surplus: "R 2,274,827",
      estateSurplusUtilisedForDependants: "R 2,274,827",
      estatePositionAfterAllocation: "R 0",
      lastUpdated: new Date().toISOString(),
    };

    return this.createEstatePositionParameter(defaultParameter);
  }

  // Financial Plans methods
  async getFinancialPlans(): Promise<FinancialPlan[]> {
    return Array.from(this.financialPlans.values()).sort((a, b) => a.id - b.id);
  }

  async getFinancialPlan(id: number): Promise<FinancialPlan | undefined> {
    return this.financialPlans.get(id);
  }

  async createFinancialPlan(plan: InsertFinancialPlan): Promise<FinancialPlan> {
    const newPlan: FinancialPlan = {
      id: this.currentFinancialPlanId++,
      name: plan.name,
      description: plan.description || null,
      dateApplicable: plan.dateApplicable || new Date().toISOString().split('T')[0],
      createdAt: plan.createdAt || new Date().toISOString(),
      updatedAt: plan.updatedAt || new Date().toISOString(),
    };
    this.financialPlans.set(newPlan.id, newPlan);
    return newPlan;
  }

  async updateFinancialPlan(
    id: number,
    updates: UpdateFinancialPlan,
  ): Promise<FinancialPlan | undefined> {
    const existing = this.financialPlans.get(id);
    if (!existing) return undefined;

    const updated: FinancialPlan = { 
      ...existing, 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.financialPlans.set(id, updated);
    return updated;
  }

  async deleteFinancialPlan(id: number): Promise<boolean> {
    // Also delete related plan needs
    const planNeedsToDelete = Array.from(this.planNeeds.values())
      .filter(pn => pn.planId === id);
    planNeedsToDelete.forEach(pn => this.planNeeds.delete(pn.id));
    
    return this.financialPlans.delete(id);
  }

  async searchFinancialPlans(query: string): Promise<FinancialPlan[]> {
    const allPlans = Array.from(this.financialPlans.values());
    if (!query.trim()) return allPlans;

    const lowerQuery = query.toLowerCase();
    return allPlans.filter(plan =>
      plan.name.toLowerCase().includes(lowerQuery) ||
      (plan.description && plan.description.toLowerCase().includes(lowerQuery))
    );
  }

  // Needs methods
  async getNeeds(): Promise<Need[]> {
    return Array.from(this.needs.values()).sort((a, b) => a.id - b.id);
  }

  async getNeed(id: number): Promise<Need | undefined> {
    return this.needs.get(id);
  }

  async createNeed(need: InsertNeed): Promise<Need> {
    const newNeed: Need = {
      id: this.currentNeedId++,
      key: need.key,
      displayName: need.displayName,
      category: need.category,
      hasDetailedSteps: need.hasDetailedSteps || false,
      summaryData: need.summaryData || null,
      createdAt: need.createdAt || new Date().toISOString(),
    };
    this.needs.set(newNeed.id, newNeed);
    return newNeed;
  }

  async updateNeed(
    id: number,
    updates: UpdateNeed,
  ): Promise<Need | undefined> {
    const existing = this.needs.get(id);
    if (!existing) return undefined;

    const updated: Need = { ...existing, ...updates };
    this.needs.set(id, updated);
    return updated;
  }

  async deleteNeed(id: number): Promise<boolean> {
    return this.needs.delete(id);
  }

  async initializeDefaultNeeds(): Promise<void> {
    const defaultNeeds = [
      {
        key: "death",
        displayName: "Death",
        category: "protection",
        hasDetailedSteps: false,
        summaryData: null,
      },
      {
        key: "death-estate-liquidity",
        displayName: "Death with estate liquidity",
        category: "protection",
        hasDetailedSteps: true,
        summaryData: JSON.stringify({
          estatePosition: { provided: "R5,740,881", required: "R2,918,036", surplus: "R2,822,845" },
          dependantsPosition: { provided: "R7,822,845", required: "R9,675,356" }
        }),
      },
      {
        key: "permanent-disability",
        displayName: "Permanent disability",
        category: "protection",
        hasDetailedSteps: false,
        summaryData: JSON.stringify({
          lumpSumCover: { surplus: "R831,661" },
          incomeCover: { shortfall: "R5,135,026" }
        }),
      },
      {
        key: "temporary-disability",
        displayName: "Temporary disability",
        category: "protection",
        hasDetailedSteps: false,
        summaryData: null,
      },
      {
        key: "dread-disease",
        displayName: "Dread disease",
        category: "protection",
        hasDetailedSteps: false,
        summaryData: null,
      },
      {
        key: "retirement",
        displayName: "Retirement",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: JSON.stringify({
          retirementFunds: { shortfall: "R8,994,312", required: "R27,965,380" }
        }),
      },
      {
        key: "investment-planning",
        displayName: "Investment planning",
        category: "investment",
        hasDetailedSteps: false,
        summaryData: JSON.stringify({
          totalNominal: "R6,450,000",
          compulsoryNominal: "R4,450,000",
          voluntaryNominal: "R2,000,000"
        }),
      },
      {
        key: "lump-sum-recurring",
        displayName: "Lump sum and recurring investment",
        category: "investment",
        hasDetailedSteps: false,
        summaryData: null,
      },
      {
        key: "portfolio-comparison",
        displayName: "Portfolio comparison tool",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: null,
      },
      {
        key: "contribution-income-analysis",
        displayName: "Contribution and income analysis",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: null,
      },
      {
        key: "saving-future-need",
        displayName: "Saving for a future need",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: null,
      },
      {
        key: "income-from-capital",
        displayName: "Income from capital",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: null,
      },
      {
        key: "debt-repayment",
        displayName: "Debt repayment",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: null,
      },
    ];

    for (const needData of defaultNeeds) {
      await this.createNeed(needData);
    }
  }

  // Plan Needs methods
  async getPlanNeeds(planId: number): Promise<PlanNeed[]> {
    return Array.from(this.planNeeds.values()).filter(pn => pn.planId === planId);
  }

  async addNeedToPlan(planNeed: InsertPlanNeed): Promise<PlanNeed> {
    const newPlanNeed: PlanNeed = {
      id: this.currentPlanNeedId++,
      planId: planNeed.planId,
      needId: planNeed.needId,
      isActive: planNeed.isActive !== undefined ? planNeed.isActive : true,
      sortOrder: planNeed.sortOrder || 0,
      createdAt: planNeed.createdAt || new Date().toISOString(),
    };
    this.planNeeds.set(newPlanNeed.id, newPlanNeed);
    return newPlanNeed;
  }

  async removeNeedFromPlan(planId: number, needId: number): Promise<boolean> {
    const planNeed = Array.from(this.planNeeds.values())
      .find(pn => pn.planId === planId && pn.needId === needId);
    
    if (planNeed) {
      return this.planNeeds.delete(planNeed.id);
    }
    return false;
  }

  async removeAllNeedsFromPlan(planId: number): Promise<boolean> {
    const planNeedsToRemove = Array.from(this.planNeeds.values())
      .filter(pn => pn.planId === planId);
    
    if (planNeedsToRemove.length > 0) {
      planNeedsToRemove.forEach(pn => this.planNeeds.delete(pn.id));
      return true;
    }
    return false;
  }

  async updatePlanNeed(
    id: number,
    updates: UpdatePlanNeed,
  ): Promise<PlanNeed | undefined> {
    const existing = this.planNeeds.get(id);
    if (!existing) return undefined;

    const updated: PlanNeed = { ...existing, ...updates };
    this.planNeeds.set(id, updated);
    return updated;
  }

  async getFinancialPlanWithNeeds(planId: number): Promise<{ plan: FinancialPlan; needs: Need[] } | undefined> {
    const plan = await this.getFinancialPlan(planId);
    if (!plan) return undefined;

    const planNeeds = await this.getPlanNeeds(planId);
    const needs = [];
    
    for (const planNeed of planNeeds) {
      const need = await this.getNeed(planNeed.needId);
      if (need) {
        needs.push(need);
      }
    }

    return { plan, needs };
  }

  // Retirement Parameters (one row per plan)
  async getRetirementParameters(planId: number): Promise<RetirementParameters | undefined> {
    return Array.from(this.retirementParameters.values()).find(p => p.planId === planId);
  }

  async upsertRetirementParameters(planId: number, updates: UpdateRetirementParameters): Promise<RetirementParameters> {
    const existing = await this.getRetirementParameters(planId);
    if (existing) {
      const merged: RetirementParameters = { ...existing, ...updates, planId, lastUpdated: new Date().toISOString() };
      this.retirementParameters.set(existing.id, merged);
      return merged;
    }
    const created: RetirementParameters = {
      id: this.currentRetirementParameterId++,
      planId,
      retirementAge: updates.retirementAge ?? 65,
      retirementPlanningAge: updates.retirementPlanningAge ?? 90,
      autoCalculateTax: updates.autoCalculateTax ?? true,
      currentAnnualIncome: updates.currentAnnualIncome ?? "R 0",
      lastUpdated: new Date().toISOString(),
    };
    this.retirementParameters.set(created.id, created);
    return created;
  }

  // Future Inflows
  async getFutureInflows(): Promise<FutureInflow[]> {
    return Array.from(this.futureInflows.values()).sort((a, b) => a.id - b.id);
  }

  async getFutureInflow(id: number): Promise<FutureInflow | undefined> {
    return this.futureInflows.get(id);
  }

  async createFutureInflow(inflow: InsertFutureInflow): Promise<FutureInflow> {
    const created: FutureInflow = {
      id: this.currentFutureInflowId++,
      description: inflow.description ?? "",
      entity: inflow.entity ?? "Donald Edwards",
      startYearsAfterRetirement: inflow.startYearsAfterRetirement ?? 0,
      currentValue: inflow.currentValue ?? "R 0",
      calculateCgt: inflow.calculateCgt ?? false,
      growthRate: inflow.growthRate ?? "10%",
    };
    this.futureInflows.set(created.id, created);
    return created;
  }

  async updateFutureInflow(id: number, updates: UpdateFutureInflow): Promise<FutureInflow | undefined> {
    const existing = this.futureInflows.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.futureInflows.set(id, updated);
    return updated;
  }

  async deleteFutureInflow(id: number): Promise<boolean> {
    return this.futureInflows.delete(id);
  }

  // Retirement Lump Sum Needs
  async getRetirementLumpSumNeeds(): Promise<RetirementLumpSumNeed[]> {
    return Array.from(this.retirementLumpSumNeeds.values()).sort((a, b) => a.id - b.id);
  }

  async getRetirementLumpSumNeed(id: number): Promise<RetirementLumpSumNeed | undefined> {
    return this.retirementLumpSumNeeds.get(id);
  }

  async createRetirementLumpSumNeed(need: InsertRetirementLumpSumNeed): Promise<RetirementLumpSumNeed> {
    const created: RetirementLumpSumNeed = {
      id: this.currentRetirementLumpSumNeedId++,
      description: need.description ?? "",
      startYears: need.startYears ?? 0,
      termYears: need.termYears ?? 0,
      increasePercentage: need.increasePercentage ?? "0%",
      frequency: need.frequency ?? "Single",
      frequencyValue: need.frequencyValue ?? 1,
      amount: need.amount ?? "R 0",
    };
    this.retirementLumpSumNeeds.set(created.id, created);
    return created;
  }

  async updateRetirementLumpSumNeed(id: number, updates: UpdateRetirementLumpSumNeed): Promise<RetirementLumpSumNeed | undefined> {
    const existing = this.retirementLumpSumNeeds.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.retirementLumpSumNeeds.set(id, updated);
    return updated;
  }

  async deleteRetirementLumpSumNeed(id: number): Promise<boolean> {
    return this.retirementLumpSumNeeds.delete(id);
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

    try {
      neonConfig.webSocketConstructor = ws;
      const pool = new Pool({ connectionString });
      this.db = drizzle({ client: pool });
      console.log("Database connection established successfully");
    } catch (error) {
      console.error("Failed to establish database connection:", error);
      throw error;
    }
  }

  // Helper function to apply defaults for retirement funds
  private applyRetirementFundDefaults(
    fund: Partial<InsertRetirementFund>,
  ): InsertRetirementFund {
    return {
      description: fund.description !== undefined ? fund.description : null,
      owners: fund.owners || ["Donald Edwards"],
      coverAmount: fund.coverAmount || "R 0",
      unapprovedBeneficiaries: fund.unapprovedBeneficiaries || [""],
      unapprovedPercentageSplits: fund.unapprovedPercentageSplits || ["0%"],
      unapprovedCoverSplits: fund.unapprovedCoverSplits || ["R 0"],
      monthlyIncome: fund.monthlyIncome || "R 0",
      monthlyIncomeCheckbox: fund.monthlyIncomeCheckbox || false,
      termYears: fund.termYears || "0 years",
      increasePercentage: fund.increasePercentage || "0%",
      approvedLifeCover: fund.approvedLifeCover || "R 0",
      fundValue: fund.fundValue || "R 0",
      fundValueAtDeath: fund.fundValueAtDeath || "R 0",
      fundValueBeneficiaries: fund.fundValueBeneficiaries || [""],
      fundValuePercentageSplits: fund.fundValuePercentageSplits || ["0%"],
      fundValueCoverSplits: fund.fundValueCoverSplits || ["R 0"],
      lumpSumTaken: fund.lumpSumTaken || "R 0",
      nonDeductibleContribution: fund.nonDeductibleContribution || "R 0",
      livingAnnuity: fund.livingAnnuity || "R 0",
      livingAnnuityCheckbox: fund.livingAnnuityCheckbox || false,
      incomeTerm: fund.incomeTerm || "0 years",
      additionalOwners: fund.additionalOwners || [],
      owner: fund.owner || "Donald Edwards",
      name: fund.name || "",
      amount: fund.amount || "R 0",
      beneficiaryName: fund.beneficiaryName || "",
      beneficiaryPercentageSplit: fund.beneficiaryPercentageSplit || "0%",
      additionalBeneficiaries: fund.additionalBeneficiaries || [],
      additionalBenefitSplits: fund.additionalBenefitSplits || [],
      beneficiaries: fund.beneficiaries || "[]",
      lumpSumDeath: fund.lumpSumDeath || "R 0",
      fundValueAfterLumpSum: fund.fundValueAfterLumpSum || "R 0",
      monthlyIncomeTerm: fund.monthlyIncomeTerm || "0 years",
      lumpSumProvisionEstate: fund.lumpSumProvisionEstate || "R 0",
      lumpSumProvisionSpouse: fund.lumpSumProvisionSpouse || "R 0",
      lumpSumProvisionOther: fund.lumpSumProvisionOther || "R 0",
      currentAnnualIncome: fund.currentAnnualIncome || "R 0",
      monthlyProvisionOffered: fund.monthlyProvisionOffered || "R 0",
      incomeEscalation: fund.incomeEscalation || "0%",
      estateDutyPoliciesOnLife: fund.estateDutyPoliciesOnLife || "0%",
      estateDutyToSpouse: fund.estateDutyToSpouse || "0%",
      estateDutyToOthers: fund.estateDutyToOthers || "0%",
      executorsFee: fund.executorsFee || "0%",
      mastersFee: fund.mastersFee || "0%",
    };
  }

  // Helper function to apply defaults for assurance
  private applyAssuranceDefaults(
    assuranceData: Partial<InsertAssurance>,
  ): InsertAssurance {
    return {
      description:
        assuranceData.description !== undefined
          ? assuranceData.description
          : "",
      owners: assuranceData.owners || ["Donald Edwards"],
      beneficiaries: assuranceData.beneficiaries || [""],
      deathBenefit:
        assuranceData.deathBenefit !== undefined
          ? assuranceData.deathBenefit
          : "R 0",
      amount: assuranceData.amount !== undefined ? assuranceData.amount : "R 0",
      amountToggles: assuranceData.amountToggles || [true],
      amountYearsValues: assuranceData.amountYearsValues || ["0 years"],
      amountIncreaseValues: assuranceData.amountIncreaseValues || ["0%"],
      premiumsByOthers:
        assuranceData.premiumsByOthers !== undefined
          ? assuranceData.premiumsByOthers
          : "R 0",
      collateralSession:
        assuranceData.collateralSession !== undefined
          ? assuranceData.collateralSession
          : "R 0",
      benefitSplit:
        assuranceData.benefitSplit !== undefined
          ? assuranceData.benefitSplit
          : "0%",
      buySell: assuranceData.buySell ?? false,
      keyMan: assuranceData.keyMan ?? false,
      excludedFromEstateDuty: assuranceData.excludedFromEstateDuty ?? false,
      excludedFromProvisions: assuranceData.excludedFromProvisions ?? false,
      additionalOwners: assuranceData.additionalOwners || [],
      additionalBeneficiaries: assuranceData.additionalBeneficiaries || [],
      additionalBenefitSplits: assuranceData.additionalBenefitSplits || [],
      additionalInfo:
        assuranceData.additionalInfo !== undefined
          ? assuranceData.additionalInfo
          : "",
    };
  }

  // Helper function to apply defaults for additional estate duty items
  private applyAdditionalEstateDutyItemDefaults(
    item: Partial<InsertAdditionalEstateDutyItems>,
  ): InsertAdditionalEstateDutyItems {
    return {
      description: item.description || "",
      amount: item.amount || "R 0",
      deduction: item.deduction ?? false,
      excludeFromJointEstate: item.excludeFromJointEstate ?? false,
    };
  }

  // Retirement Funds methods
  async getRetirementFunds(): Promise<RetirementFund[]> {
    return await this.db
      .select()
      .from(retirementFunds)
      .orderBy(asc(retirementFunds.id));
  }

  async getRetirementFund(id: number): Promise<RetirementFund | undefined> {
    const result = await this.db
      .select()
      .from(retirementFunds)
      .where(eq(retirementFunds.id, id));
    return result[0];
  }

  async createRetirementFund(
    fund: InsertRetirementFund,
  ): Promise<RetirementFund> {
    const fundWithDefaults = this.applyRetirementFundDefaults(fund);
    const result = await this.db
      .insert(retirementFunds)
      .values(fundWithDefaults)
      .returning();
    return result[0];
  }

  async updateRetirementFund(
    id: number,
    updates: UpdateRetirementFund,
  ): Promise<RetirementFund | undefined> {
    const result = await this.db
      .update(retirementFunds)
      .set(updates)
      .where(eq(retirementFunds.id, id))
      .returning();
    return result[0];
  }

  async deleteRetirementFund(id: number): Promise<boolean> {
    const result = await this.db
      .delete(retirementFunds)
      .where(eq(retirementFunds.id, id));
    return (result.rowCount || 0) > 0;
  }

  async searchRetirementFunds(query: string): Promise<RetirementFund[]> {
    return await this.db
      .select()
      .from(retirementFunds)
      .where(ilike(retirementFunds.description, `%${query}%`))
      .orderBy(asc(retirementFunds.id));
  }

  // Assurance methods
  async getAssurance(): Promise<Assurance[]> {
    return await this.db.select().from(assurance).orderBy(asc(assurance.id));
  }

  async getAssuranceById(id: number): Promise<Assurance | undefined> {
    const result = await this.db
      .select()
      .from(assurance)
      .where(eq(assurance.id, id));
    return result[0];
  }

  async createAssurance(assuranceData: InsertAssurance): Promise<Assurance> {
    const assuranceWithDefaults = this.applyAssuranceDefaults(assuranceData);
    const result = await this.db
      .insert(assurance)
      .values(assuranceWithDefaults)
      .returning();
    return result[0];
  }

  async updateAssurance(
    id: number,
    updates: UpdateAssurance,
  ): Promise<Assurance | undefined> {
    const result = await this.db
      .update(assurance)
      .set(updates)
      .where(eq(assurance.id, id))
      .returning();
    return result[0];
  }

  async deleteAssurance(id: number): Promise<boolean> {
    const result = await this.db.delete(assurance).where(eq(assurance.id, id));
    return (result.rowCount || 0) > 0;
  }

  async searchAssurance(query: string): Promise<Assurance[]> {
    return await this.db
      .select()
      .from(assurance)
      .where(ilike(assurance.description, `%${query}%`))
      .orderBy(asc(assurance.id));
  }

  // TODO: For now, implementing stubs for all other methods to make interface compatible
  // Each method follows the same pattern as above but for different tables
  async getLumpSumBequests(): Promise<LumpSumBequest[]> {
    return await this.db.select().from(lumpSumBequests).orderBy(asc(lumpSumBequests.id));
  }
  async getLumpSumBequest(id: number): Promise<LumpSumBequest | undefined> {
    const result = await this.db
      .select()
      .from(lumpSumBequests)
      .where(eq(lumpSumBequests.id, id));
    return result[0];
  }
  async createLumpSumBequest(
    bequest: InsertLumpSumBequest,
  ): Promise<LumpSumBequest> {
    const result = await this.db
      .insert(lumpSumBequests)
      .values(bequest)
      .returning();
    return result[0];
  }
  async updateLumpSumBequest(
    id: number,
    updates: Partial<InsertLumpSumBequest>,
  ): Promise<LumpSumBequest | undefined> {
    const result = await this.db
      .update(lumpSumBequests)
      .set(updates)
      .where(eq(lumpSumBequests.id, id))
      .returning();
    return result[0];
  }
  async deleteLumpSumBequest(id: number): Promise<boolean> {
    const result = await this.db
      .delete(lumpSumBequests)
      .where(eq(lumpSumBequests.id, id));
    return (result.rowCount || 0) > 0;
  }
  async searchLumpSumBequests(query: string): Promise<LumpSumBequest[]> {
    return await this.db
      .select()
      .from(lumpSumBequests)
      .where(ilike(lumpSumBequests.description, `%${query}%`))
      .orderBy(asc(lumpSumBequests.id));
  }

  async getDefinedBenefitFunds(): Promise<DefinedBenefitFund[]> {
    return await this.db.select().from(definedBenefitFunds).orderBy(asc(definedBenefitFunds.id));
  }
  async getDefinedBenefitFund(
    id: number,
  ): Promise<DefinedBenefitFund | undefined> {
    const result = await this.db
      .select()
      .from(definedBenefitFunds)
      .where(eq(definedBenefitFunds.id, id));
    return result[0];
  }
  async createDefinedBenefitFund(
    fund: InsertDefinedBenefitFund,
  ): Promise<DefinedBenefitFund> {
    const result = await this.db
      .insert(definedBenefitFunds)
      .values(fund)
      .returning();
    return result[0];
  }
  async updateDefinedBenefitFund(
    id: number,
    updates: UpdateDefinedBenefitFund,
  ): Promise<DefinedBenefitFund | undefined> {
    const result = await this.db
      .update(definedBenefitFunds)
      .set(updates)
      .where(eq(definedBenefitFunds.id, id))
      .returning();
    return result[0];
  }
  async deleteDefinedBenefitFund(id: number): Promise<boolean> {
    const result = await this.db
      .delete(definedBenefitFunds)
      .where(eq(definedBenefitFunds.id, id));
    return (result.rowCount || 0) > 0;
  }
  async searchDefinedBenefitFunds(
    query: string,
  ): Promise<DefinedBenefitFund[]> {
    return await this.db
      .select()
      .from(definedBenefitFunds)
      .where(ilike(definedBenefitFunds.description, `%${query}%`))
      .orderBy(asc(definedBenefitFunds.id));
  }

  async getVoluntaryInvestments(): Promise<VoluntaryInvestment[]> {
    return await this.db.select().from(voluntaryInvestments).orderBy(asc(voluntaryInvestments.id));
  }
  async getVoluntaryInvestment(
    id: number,
  ): Promise<VoluntaryInvestment | undefined> {
    const result = await this.db
      .select()
      .from(voluntaryInvestments)
      .where(eq(voluntaryInvestments.id, id));
    return result[0];
  }
  async createVoluntaryInvestment(
    investment: InsertVoluntaryInvestment,
  ): Promise<VoluntaryInvestment> {
    const result = await this.db
      .insert(voluntaryInvestments)
      .values(investment)
      .returning();
    return result[0];
  }
  async updateVoluntaryInvestment(
    id: number,
    updates: UpdateVoluntaryInvestment,
  ): Promise<VoluntaryInvestment | undefined> {
    const result = await this.db
      .update(voluntaryInvestments)
      .set(updates)
      .where(eq(voluntaryInvestments.id, id))
      .returning();
    return result[0];
  }
  async deleteVoluntaryInvestment(id: number): Promise<boolean> {
    const result = await this.db
      .delete(voluntaryInvestments)
      .where(eq(voluntaryInvestments.id, id));
    return (result.rowCount || 0) > 0;
  }
  async searchVoluntaryInvestments(
    query: string,
  ): Promise<VoluntaryInvestment[]> {
    return await this.db
      .select()
      .from(voluntaryInvestments)
      .where(ilike(voluntaryInvestments.description, `%${query}%`))
      .orderBy(asc(voluntaryInvestments.id));
  }

  async getIncomeNeeds(): Promise<IncomeNeeds[]> {
    return await this.db.select().from(incomeNeeds).orderBy(asc(incomeNeeds.id));
  }
  async getIncomeNeed(id: number): Promise<IncomeNeeds | undefined> {
    const result = await this.db
      .select()
      .from(incomeNeeds)
      .where(eq(incomeNeeds.id, id));
    return result[0];
  }
  async createIncomeNeed(need: InsertIncomeNeeds): Promise<IncomeNeeds> {
    const result = await this.db.insert(incomeNeeds).values(need).returning();
    return result[0];
  }
  async updateIncomeNeed(
    id: number,
    updates: UpdateIncomeNeeds,
  ): Promise<IncomeNeeds | undefined> {
    const result = await this.db
      .update(incomeNeeds)
      .set(updates)
      .where(eq(incomeNeeds.id, id))
      .returning();
    return result[0];
  }
  async deleteIncomeNeed(id: number): Promise<boolean> {
    const result = await this.db
      .delete(incomeNeeds)
      .where(eq(incomeNeeds.id, id));
    return (result.rowCount || 0) > 0;
  }
  async searchIncomeNeeds(query: string): Promise<IncomeNeeds[]> {
    return await this.db
      .select()
      .from(incomeNeeds)
      .where(ilike(incomeNeeds.description, `%${query}%`))
      .orderBy(asc(incomeNeeds.id));
  }

  async getIncomeProvisions(): Promise<IncomeProvisions[]> {
    return await this.db.select().from(incomeProvisions).orderBy(asc(incomeProvisions.id));
  }
  async getIncomeProvision(id: number): Promise<IncomeProvisions | undefined> {
    const result = await this.db
      .select()
      .from(incomeProvisions)
      .where(eq(incomeProvisions.id, id));
    return result[0];
  }
  async createIncomeProvision(
    provision: InsertIncomeProvisions,
  ): Promise<IncomeProvisions> {
    const result = await this.db
      .insert(incomeProvisions)
      .values(provision)
      .returning();
    return result[0];
  }
  async updateIncomeProvision(
    id: number,
    updates: UpdateIncomeProvisions,
  ): Promise<IncomeProvisions | undefined> {
    const result = await this.db
      .update(incomeProvisions)
      .set(updates)
      .where(eq(incomeProvisions.id, id))
      .returning();
    return result[0];
  }
  async deleteIncomeProvision(id: number): Promise<boolean> {
    const result = await this.db
      .delete(incomeProvisions)
      .where(eq(incomeProvisions.id, id));
    return (result.rowCount || 0) > 0;
  }
  async searchIncomeProvisions(query: string): Promise<IncomeProvisions[]> {
    return await this.db
      .select()
      .from(incomeProvisions)
      .where(ilike(incomeProvisions.description, `%${query}%`))
      .orderBy(asc(incomeProvisions.id));
  }

  async getResidue(): Promise<Residue[]> {
    return await this.db.select().from(residue).orderBy(asc(residue.id));
  }
  async getResidueItem(id: number): Promise<Residue | undefined> {
    const result = await this.db
      .select()
      .from(residue)
      .where(eq(residue.id, id));
    return result[0];
  }
  async createResidueItem(item: InsertResidue): Promise<Residue> {
    const result = await this.db.insert(residue).values(item).returning();
    return result[0];
  }
  async updateResidueItem(
    id: number,
    updates: UpdateResidue,
  ): Promise<Residue | undefined> {
    const result = await this.db
      .update(residue)
      .set(updates)
      .where(eq(residue.id, id))
      .returning();
    return result[0];
  }
  async deleteResidueItem(id: number): Promise<boolean> {
    const result = await this.db.delete(residue).where(eq(residue.id, id));
    return (result.rowCount || 0) > 0;
  }
  async searchResidue(query: string): Promise<Residue[]> {
    return await this.db
      .select()
      .from(residue)
      .where(ilike(residue.entity, `%${query}%`))
      .orderBy(asc(residue.id));
  }

  async getAdditionalEstateDutyItems(): Promise<AdditionalEstateDutyItems[]> {
    return await this.db.select().from(additionalEstateDutyItems).orderBy(asc(additionalEstateDutyItems.id));
  }
  async getAdditionalEstateDutyItem(
    id: number,
  ): Promise<AdditionalEstateDutyItems | undefined> {
    const result = await this.db
      .select()
      .from(additionalEstateDutyItems)
      .where(eq(additionalEstateDutyItems.id, id));
    return result[0];
  }
  async createAdditionalEstateDutyItem(
    item: InsertAdditionalEstateDutyItems,
  ): Promise<AdditionalEstateDutyItems> {
    const itemWithDefaults = this.applyAdditionalEstateDutyItemDefaults(item);
    const result = await this.db
      .insert(additionalEstateDutyItems)
      .values(itemWithDefaults)
      .returning();
    return result[0];
  }
  async updateAdditionalEstateDutyItem(
    id: number,
    updates: UpdateAdditionalEstateDutyItems,
  ): Promise<AdditionalEstateDutyItems | undefined> {
    const result = await this.db
      .update(additionalEstateDutyItems)
      .set(updates)
      .where(eq(additionalEstateDutyItems.id, id))
      .returning();
    return result[0];
  }
  async deleteAdditionalEstateDutyItem(id: number): Promise<boolean> {
    const result = await this.db
      .delete(additionalEstateDutyItems)
      .where(eq(additionalEstateDutyItems.id, id));
    return (result.rowCount || 0) > 0;
  }
  async searchAdditionalEstateDutyItems(
    query: string,
  ): Promise<AdditionalEstateDutyItems[]> {
    return await this.db
      .select()
      .from(additionalEstateDutyItems)
      .where(ilike(additionalEstateDutyItems.description, `%${query}%`))
      .orderBy(asc(additionalEstateDutyItems.id));
  }

  async getLiabilities(): Promise<Liabilities[]> {
    return await this.db.select().from(liabilities).orderBy(asc(liabilities.id));
  }
  async getLiability(id: number): Promise<Liabilities | undefined> {
    const result = await this.db
      .select()
      .from(liabilities)
      .where(eq(liabilities.id, id));
    return result[0];
  }
  async createLiability(liability: InsertLiabilities): Promise<Liabilities> {
    const result = await this.db
      .insert(liabilities)
      .values(liability)
      .returning();
    return result[0];
  }
  async updateLiability(
    id: number,
    updates: UpdateLiabilities,
  ): Promise<Liabilities | undefined> {
    const result = await this.db
      .update(liabilities)
      .set(updates)
      .where(eq(liabilities.id, id))
      .returning();
    return result[0];
  }
  async deleteLiability(id: number): Promise<boolean> {
    const result = await this.db
      .delete(liabilities)
      .where(eq(liabilities.id, id));
    return (result.rowCount || 0) > 0;
  }
  async searchLiabilities(query: string): Promise<Liabilities[]> {
    return await this.db
      .select()
      .from(liabilities)
      .where(ilike(liabilities.description, `%${query}%`))
      .orderBy(asc(liabilities.id));
  }

  async getAssets(): Promise<Assets[]> {
    return await this.db.select().from(assets).orderBy(asc(assets.id));
  }
  async getAsset(id: number): Promise<Assets | undefined> {
    const result = await this.db.select().from(assets).where(eq(assets.id, id));
    return result[0];
  }
  async createAsset(asset: InsertAssets): Promise<Assets> {
    const result = await this.db.insert(assets).values(asset).returning();
    return result[0];
  }
  async updateAsset(
    id: number,
    updates: Partial<InsertAssets>,
  ): Promise<Assets | undefined> {
    const result = await this.db
      .update(assets)
      .set(updates)
      .where(eq(assets.id, id))
      .returning();
    return result[0];
  }
  async deleteAsset(id: number): Promise<boolean> {
    const result = await this.db.delete(assets).where(eq(assets.id, id));
    return (result.rowCount || 0) > 0;
  }
  async searchAssets(query: string): Promise<Assets[]> {
    return await this.db
      .select()
      .from(assets)
      .where(ilike(assets.description, `%${query}%`))
      .orderBy(asc(assets.id));
  }

  // Client Details methods
  async getClientDetails(): Promise<ClientDetails[]> {
    return await this.db
      .select()
      .from(clientDetails)
      .orderBy(asc(clientDetails.id));
  }

  async getClientDetail(id: number): Promise<ClientDetails | undefined> {
    const result = await this.db
      .select()
      .from(clientDetails)
      .where(eq(clientDetails.id, id));
    return result[0];
  }

  async createClientDetail(
    clientDetail: InsertClientDetails,
  ): Promise<ClientDetails> {
    const result = await this.db
      .insert(clientDetails)
      .values(clientDetail)
      .returning();
    return result[0];
  }

  async updateClientDetail(
    id: number,
    updates: UpdateClientDetails,
  ): Promise<ClientDetails | undefined> {
    const result = await this.db
      .update(clientDetails)
      .set(updates)
      .where(eq(clientDetails.id, id))
      .returning();
    return result[0];
  }

  async deleteClientDetail(id: number): Promise<boolean> {
    const result = await this.db
      .delete(clientDetails)
      .where(eq(clientDetails.id, id));
    return (result.rowCount || 0) > 0;
  }

  async searchClientDetails(query: string): Promise<ClientDetails[]> {
    return await this.db
      .select()
      .from(clientDetails)
      .where(
        or(
          ilike(clientDetails.entityName, `%${query}%`),
          ilike(clientDetails.entityType, `%${query}%`)
        )
      )
      .orderBy(asc(clientDetails.id));
  }

  // Estate Position Parameters methods
  async getEstatePositionParameters(): Promise<EstatePositionParameters[]> {
    return await this.db.select().from(estatePositionParameters).orderBy(asc(estatePositionParameters.id));
  }

  async getEstatePositionParameter(id: number): Promise<EstatePositionParameters | undefined> {
    const result = await this.db
      .select()
      .from(estatePositionParameters)
      .where(eq(estatePositionParameters.id, id));
    return result[0];
  }

  async createEstatePositionParameter(parameter: InsertEstatePositionParameters): Promise<EstatePositionParameters> {
    const result = await this.db
      .insert(estatePositionParameters)
      .values(parameter)
      .returning();
    return result[0];
  }

  async updateEstatePositionParameter(
    id: number,
    updates: UpdateEstatePositionParameters,
  ): Promise<EstatePositionParameters | undefined> {
    const result = await this.db
      .update(estatePositionParameters)
      .set(updates)
      .where(eq(estatePositionParameters.id, id))
      .returning();
    return result[0];
  }

  async deleteEstatePositionParameter(id: number): Promise<boolean> {
    const result = await this.db
      .delete(estatePositionParameters)
      .where(eq(estatePositionParameters.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getOrCreateEstatePositionParameter(): Promise<EstatePositionParameters> {
    // Try to get existing parameter (should be only one record)
    const existing = await this.getEstatePositionParameters();
    if (existing.length > 0) {
      return existing[0];
    }

    // If none exists, create with calculated default values
    const defaultParameter: InsertEstatePositionParameters = await this.calculateDefaultEstateParameters();
    return await this.createEstatePositionParameter(defaultParameter);
  }

  private async calculateDefaultEstateParameters(): Promise<InsertEstatePositionParameters> {
    // Get data from various sources to calculate defaults
    const [assets, liabilities, retirementFunds, lumpSumBequests] = await Promise.all([
      this.getAssets(),
      this.getLiabilities(), 
      this.getRetirementFunds(),
      this.getLumpSumBequests()
    ]);

    // Helper function to parse currency values
    const parseCurrency = (value: string): number => {
      return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
    };

    // Calculate total assets
    const totalAssets = assets.reduce((sum, asset) => {
      return sum + parseCurrency(asset.marketValue);
    }, 0);

    // Calculate total liabilities  
    const totalLiabilities = liabilities.reduce((sum, liability) => {
      return sum + parseCurrency(liability.debtAmount);
    }, 0);

    // Calculate total life cover from retirement funds
    const totalLifeCover = retirementFunds.reduce((sum, fund) => {
      return sum + parseCurrency(fund.approvedLifeCover) + parseCurrency(fund.coverAmount);
    }, 0);

    // Calculate total lump sum bequests
    const totalBequests = lumpSumBequests.reduce((sum, bequest) => {
      return sum + parseCurrency(bequest.valueAtDeath);
    }, 0);

    // Return calculated defaults
    return {
      lifeCoverToEstate: `R ${Math.round(totalLifeCover * 0.4).toLocaleString()}`, // 40% of life cover
      voluntaryInvestments: `R ${Math.round(totalAssets * 0.6).toLocaleString()}`, // 60% of assets
      accrualClaimFromSpouse: "R 0",
      dependantsSurplusUtilised: "R 0", 
      ownEstateCapitalProvided: "R 0", // Will be calculated
      estateDuty: `R ${Math.round(totalAssets * 0.02).toLocaleString()}`, // 2% of assets
      executorsFees: `R ${Math.round(totalAssets * 0.035).toLocaleString()}`, // 3.5% of assets
      settleClientLiabilities: `R ${totalLiabilities.toLocaleString()}`,
      capitalGainsTax: `R ${Math.round(totalAssets * 0.018).toLocaleString()}`, // 1.8% of assets
      mastersFee: "R 7000",
      deathBedFuneralExpenses: "R 60000",
      conveyancingValuationFees: `R ${Math.round(totalAssets * 0.01).toLocaleString()}`, // 1% of assets
      accrualClaimToSpouse: `R ${Math.round(totalAssets * 0.25).toLocaleString()}`, // 25% of assets
      ownEstateCapitalRequired: "R 0", // Will be calculated
      surplus: "R 0", // Will be calculated
      estateSurplusUtilisedForDependants: "R 0", // Will be calculated
      estatePositionAfterAllocation: "R 0", // Will be calculated
      lastUpdated: new Date().toISOString(),
    };
  }

  // Financial Plans methods
  async getFinancialPlans(): Promise<FinancialPlan[]> {
    return await this.db.select().from(financialPlans).orderBy(asc(financialPlans.id));
  }

  async getFinancialPlan(id: number): Promise<FinancialPlan | undefined> {
    const result = await this.db
      .select()
      .from(financialPlans)
      .where(eq(financialPlans.id, id));
    return result[0];
  }

  async createFinancialPlan(plan: InsertFinancialPlan): Promise<FinancialPlan> {
    const result = await this.db
      .insert(financialPlans)
      .values(plan)
      .returning();
    return result[0];
  }

  async updateFinancialPlan(
    id: number,
    updates: UpdateFinancialPlan,
  ): Promise<FinancialPlan | undefined> {
    const result = await this.db
      .update(financialPlans)
      .set({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .where(eq(financialPlans.id, id))
      .returning();
    return result[0];
  }

  async deleteFinancialPlan(id: number): Promise<boolean> {
    // Delete related plan needs first
    await this.db.delete(planNeeds).where(eq(planNeeds.planId, id));
    
    const result = await this.db
      .delete(financialPlans)
      .where(eq(financialPlans.id, id));
    return (result.rowCount || 0) > 0;
  }

  async searchFinancialPlans(query: string): Promise<FinancialPlan[]> {
    return await this.db
      .select()
      .from(financialPlans)
      .where(
        or(
          ilike(financialPlans.name, `%${query}%`),
          ilike(financialPlans.description, `%${query}%`)
        )
      )
      .orderBy(asc(financialPlans.id));
  }

  // Needs methods
  async getNeeds(): Promise<Need[]> {
    return await this.db.select().from(needs).orderBy(asc(needs.id));
  }

  async getNeed(id: number): Promise<Need | undefined> {
    const result = await this.db
      .select()
      .from(needs)
      .where(eq(needs.id, id));
    return result[0];
  }

  async createNeed(need: InsertNeed): Promise<Need> {
    const result = await this.db
      .insert(needs)
      .values(need)
      .returning();
    return result[0];
  }

  async updateNeed(
    id: number,
    updates: UpdateNeed,
  ): Promise<Need | undefined> {
    const result = await this.db
      .update(needs)
      .set(updates)
      .where(eq(needs.id, id))
      .returning();
    return result[0];
  }

  async deleteNeed(id: number): Promise<boolean> {
    const result = await this.db.delete(needs).where(eq(needs.id, id));
    return (result.rowCount || 0) > 0;
  }

  async initializeDefaultNeeds(): Promise<void> {
    // Check if needs already exist
    const existingNeeds = await this.getNeeds();
    if (existingNeeds.length > 0) {
      return; // Already initialized
    }

    const defaultNeeds = [
      {
        key: "death",
        displayName: "Death",
        category: "protection",
        hasDetailedSteps: false,
        summaryData: null,
      },
      {
        key: "death-estate-liquidity",
        displayName: "Death with estate liquidity",
        category: "protection",
        hasDetailedSteps: true,
        summaryData: JSON.stringify({
          estatePosition: { provided: "R5,740,881", required: "R2,918,036", surplus: "R2,822,845" },
          dependantsPosition: { provided: "R7,822,845", required: "R9,675,356" }
        }),
      },
      {
        key: "permanent-disability",
        displayName: "Permanent disability",
        category: "protection",
        hasDetailedSteps: false,
        summaryData: JSON.stringify({
          lumpSumCover: { surplus: "R831,661" },
          incomeCover: { shortfall: "R5,135,026" }
        }),
      },
      {
        key: "temporary-disability",
        displayName: "Temporary disability",
        category: "protection",
        hasDetailedSteps: false,
        summaryData: null,
      },
      {
        key: "dread-disease",
        displayName: "Dread disease",
        category: "protection",
        hasDetailedSteps: false,
        summaryData: null,
      },
      {
        key: "retirement",
        displayName: "Retirement",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: JSON.stringify({
          retirementFunds: { shortfall: "R8,994,312", required: "R27,965,380" }
        }),
      },
      {
        key: "investment-planning",
        displayName: "Investment planning",
        category: "investment",
        hasDetailedSteps: false,
        summaryData: JSON.stringify({
          totalNominal: "R6,450,000",
          compulsoryNominal: "R4,450,000",
          voluntaryNominal: "R2,000,000"
        }),
      },
      {
        key: "lump-sum-recurring",
        displayName: "Lump sum and recurring investment",
        category: "investment",
        hasDetailedSteps: false,
        summaryData: null,
      },
      {
        key: "portfolio-comparison",
        displayName: "Portfolio comparison tool",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: null,
      },
      {
        key: "contribution-income-analysis",
        displayName: "Contribution and income analysis",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: null,
      },
      {
        key: "saving-future-need",
        displayName: "Saving for a future need",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: null,
      },
      {
        key: "income-from-capital",
        displayName: "Income from capital",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: null,
      },
      {
        key: "debt-repayment",
        displayName: "Debt repayment",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: null,
      },
    ];

    for (const needData of defaultNeeds) {
      await this.createNeed(needData);
    }
  }

  // Plan Needs methods
  async getPlanNeeds(planId: number): Promise<PlanNeed[]> {
    return await this.db
      .select()
      .from(planNeeds)
      .where(eq(planNeeds.planId, planId))
      .orderBy(asc(planNeeds.sortOrder));
  }

  async addNeedToPlan(planNeed: InsertPlanNeed): Promise<PlanNeed> {
    const result = await this.db
      .insert(planNeeds)
      .values(planNeed)
      .returning();
    return result[0];
  }

  async removeNeedFromPlan(planId: number, needId: number): Promise<boolean> {
    const result = await this.db
      .delete(planNeeds)
      .where(
        and(eq(planNeeds.planId, planId), eq(planNeeds.needId, needId))
      );
    return (result.rowCount || 0) > 0;
  }

  async removeAllNeedsFromPlan(planId: number): Promise<boolean> {
    const result = await this.db
      .delete(planNeeds)
      .where(eq(planNeeds.planId, planId));
    return (result.rowCount || 0) > 0;
  }

  async updatePlanNeed(
    id: number,
    updates: UpdatePlanNeed,
  ): Promise<PlanNeed | undefined> {
    const result = await this.db
      .update(planNeeds)
      .set(updates)
      .where(eq(planNeeds.id, id))
      .returning();
    return result[0];
  }

  async getFinancialPlanWithNeeds(planId: number): Promise<{ plan: FinancialPlan; needs: Need[] } | undefined> {
    const plan = await this.getFinancialPlan(planId);
    if (!plan) return undefined;

    const planNeedsResults = await this.getPlanNeeds(planId);
    const needs = [];
    
    for (const planNeed of planNeedsResults) {
      const need = await this.getNeed(planNeed.needId);
      if (need) {
        needs.push(need);
      }
    }

    return { plan, needs };
  }

  // Retirement Parameters (one row per plan)
  async getRetirementParameters(planId: number): Promise<RetirementParameters | undefined> {
    const result = await this.db
      .select()
      .from(retirementParameters)
      .where(eq(retirementParameters.planId, planId));
    return result[0];
  }

  async upsertRetirementParameters(planId: number, updates: UpdateRetirementParameters): Promise<RetirementParameters> {
    const existing = await this.getRetirementParameters(planId);
    if (existing) {
      const result = await this.db
        .update(retirementParameters)
        .set({ ...updates, planId, lastUpdated: new Date().toISOString() })
        .where(eq(retirementParameters.id, existing.id))
        .returning();
      return result[0];
    }
    const result = await this.db
      .insert(retirementParameters)
      .values({
        planId,
        retirementAge: updates.retirementAge ?? 65,
        retirementPlanningAge: updates.retirementPlanningAge ?? 90,
        autoCalculateTax: updates.autoCalculateTax ?? true,
        lastUpdated: new Date().toISOString(),
      })
      .returning();
    return result[0];
  }

  // Future Inflows
  async getFutureInflows(): Promise<FutureInflow[]> {
    return await this.db.select().from(futureInflows).orderBy(asc(futureInflows.id));
  }

  async getFutureInflow(id: number): Promise<FutureInflow | undefined> {
    const result = await this.db.select().from(futureInflows).where(eq(futureInflows.id, id));
    return result[0];
  }

  async createFutureInflow(inflow: InsertFutureInflow): Promise<FutureInflow> {
    const result = await this.db.insert(futureInflows).values(inflow).returning();
    return result[0];
  }

  async updateFutureInflow(id: number, updates: UpdateFutureInflow): Promise<FutureInflow | undefined> {
    const result = await this.db
      .update(futureInflows)
      .set(updates)
      .where(eq(futureInflows.id, id))
      .returning();
    return result[0];
  }

  async deleteFutureInflow(id: number): Promise<boolean> {
    const result = await this.db.delete(futureInflows).where(eq(futureInflows.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Retirement Lump Sum Needs
  async getRetirementLumpSumNeeds(): Promise<RetirementLumpSumNeed[]> {
    return await this.db.select().from(retirementLumpSumNeeds).orderBy(asc(retirementLumpSumNeeds.id));
  }

  async getRetirementLumpSumNeed(id: number): Promise<RetirementLumpSumNeed | undefined> {
    const result = await this.db.select().from(retirementLumpSumNeeds).where(eq(retirementLumpSumNeeds.id, id));
    return result[0];
  }

  async createRetirementLumpSumNeed(need: InsertRetirementLumpSumNeed): Promise<RetirementLumpSumNeed> {
    const result = await this.db.insert(retirementLumpSumNeeds).values(need).returning();
    return result[0];
  }

  async updateRetirementLumpSumNeed(id: number, updates: UpdateRetirementLumpSumNeed): Promise<RetirementLumpSumNeed | undefined> {
    const result = await this.db
      .update(retirementLumpSumNeeds)
      .set(updates)
      .where(eq(retirementLumpSumNeeds.id, id))
      .returning();
    return result[0];
  }

  async deleteRetirementLumpSumNeed(id: number): Promise<boolean> {
    const result = await this.db.delete(retirementLumpSumNeeds).where(eq(retirementLumpSumNeeds.id, id));
    return (result.rowCount || 0) > 0;
  }
}

// Use database storage for production readiness
const useDatabase = process.env.DATABASE_URL !== undefined;

let storageInstance: IStorage;

if (useDatabase) {
  console.log("Using database storage with PostgreSQL");
  storageInstance = new DbStorage();
} else {
  console.log("Using memory storage for development");
  storageInstance = new MemStorage();
}

export const storage: IStorage = storageInstance;
