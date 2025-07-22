import { pgTable, text, serial, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const retirementFunds = pgTable("retirement_funds", {
  id: serial("id").primaryKey(),
  
  // Overview section
  description: text("description").notNull(),
  owner: text("owner").notNull(),
  coverAmount: text("cover_amount").notNull().default("0"),
  
  // Unapproved life cover section - dynamic beneficiaries
  beneficiaries: text("beneficiaries").notNull().default('[]'), // JSON array of beneficiaries
  
  // Monthly death benefit section
  monthlyIncome: text("monthly_income").notNull().default("0"),
  termYears: text("term_years").notNull().default("0"),
  increasePercentage: text("increase_percentage").notNull().default("0"),
  approvedLifeCover: text("approved_life_cover").notNull().default("0"),
  fundValue: text("fund_value").notNull().default("0"),
  fundValueAtDeath: text("fund_value_at_death").notNull().default("0"),
  
  // Fund value beneficiaries section
  beneficiaryName: text("beneficiary_name").notNull().default(""),
  beneficiaryPercentageSplit: text("beneficiary_percentage_split").notNull().default("0"),
  amount: text("amount").notNull().default("0"),
  lumpSumTaken: text("lump_sum_taken").notNull().default("0"),
  nondeductibleContribution: text("nondeductible_contribution").notNull().default("0"),
  livingAnnuity: text("living_annuity").notNull().default("0"),
  incomeTerm: text("income_term").notNull().default("0"),

  // Flows mode specific fields - Lump sum life cover provision
  lumpSumProvisionEstate: text("lump_sum_provision_estate").notNull().default("0"),
  lumpSumProvisionSpouse: text("lump_sum_provision_spouse").notNull().default("0"),
  lumpSumProvisionOther: text("lump_sum_provision_other").notNull().default("0"),
  incomeProvisionOption: text("income_provision_option").notNull().default(""),
  monthlyProvisionOffered: text("monthly_provision_offered").notNull().default("0"),
  currentAnnualIncome: text("current_annual_income").notNull().default("0"),
  annualIncomeAtDeath: text("annual_income_at_death").notNull().default("0"),
  estateDeploymentDeceased: text("estate_deployment_deceased").notNull().default("0"),
  incomeEscalation: text("income_escalation").notNull().default("0%"),
  executorsFee: text("executors_fee").notNull().default("0%"),
  mastersFee: text("masters_fee").notNull().default("0%"),
  
  // Estate Duty percentage fields for flows table
  estateDutyPoliciesOnLife: text("estate_duty_policies_on_life").notNull().default("0%"),
  estateDutyToSpouse: text("estate_duty_to_spouse").notNull().default("0%"),
  estateDutyToOthers: text("estate_duty_to_others").notNull().default("0%"),

  // Additional fields shown below table in inputs mode
  lumpSumDeath: text("lump_sum_death").notNull().default("0"),
  previousLumpSums: text("previous_lump_sums").notNull().default("0"),
  additionalTaxFreeAmount: text("additional_tax_free_amount").notNull().default("0"),
});

export const insertRetirementFundSchema = createInsertSchema(retirementFunds).omit({
  id: true,
});

export const updateRetirementFundSchema = createInsertSchema(retirementFunds).omit({
  id: true,
}).partial();

// Beneficiary type for the JSON array
export const beneficiarySchema = z.object({
  id: z.string(), // unique identifier for each beneficiary
  name: z.string(),
  percentage: z.number().min(0).max(100),
  coverSplit: z.string().default("0") // calculated field
});

export type Beneficiary = z.infer<typeof beneficiarySchema>;

export type InsertRetirementFund = z.infer<typeof insertRetirementFundSchema>;

// Lump Sum Bequests table
export const lumpSumBequests = pgTable("lump_sum_bequests", {
  id: serial("id").primaryKey(),
  
  // Main fields
  description: text("description").notNull().default(""),
  entity: text("entity").notNull().default(""), // Donald Edwards, Betty Edwards
  start: text("start").notNull().default("0"),
  increasePercentage: text("increase_percentage").notNull().default("CPI"),
  amount: text("amount").notNull().default("0"),
  valueAtDeath: text("value_at_death").notNull().default("0"),
  
  // Charity bequest note
  charityNote: text("charity_note").notNull().default(""),
});

export const insertLumpSumBequestSchema = createInsertSchema(lumpSumBequests).omit({
  id: true,
});

export const updateLumpSumBequestSchema = createInsertSchema(lumpSumBequests).omit({
  id: true,
}).partial();

export type InsertLumpSumBequest = z.infer<typeof insertLumpSumBequestSchema>;
export type LumpSumBequest = typeof lumpSumBequests.$inferSelect;

// Assurance schema
export const assurance = pgTable("assurance", {
  id: serial("id").primaryKey(),
  
  // Main fields
  description: text("description").notNull().default(""),
  owner: text("owner").notNull().default("Donald Edwards"),
  additionalOwners: text("additional_owners").array().notNull().default([]),
  lifeAssured: text("life_assured").notNull().default(""),
  deathBenefit: text("death_benefit").notNull().default("0"),
  beneficiary: text("beneficiary").notNull().default(""),
  benefitSplit: text("benefit_split").notNull().default("0"),
  additionalBeneficiaries: text("additional_beneficiaries").array().notNull().default([]),
  additionalBenefitSplits: text("additional_benefit_splits").array().notNull().default([]),
  amount: text("amount").notNull().default("0"),
  buySell: boolean("buy_sell").notNull().default(false),
  keyMan: boolean("key_man").notNull().default(false),
  premiumsByOthers: text("premiums_by_others").notNull().default("0"),
  collateralSession: text("collateral_session").notNull().default("0"),
  excludedFromEstateDuty: boolean("excluded_from_estate_duty").notNull().default(false),
  excludedFromProvisions: boolean("excluded_from_provisions").notNull().default(false),
});

export const insertAssuranceSchema = createInsertSchema(assurance).omit({
  id: true,
});

export const updateAssuranceSchema = createInsertSchema(assurance).omit({
  id: true,
}).partial();

export type InsertAssurance = z.infer<typeof insertAssuranceSchema>;
export type Assurance = typeof assurance.$inferSelect;
export type UpdateAssurance = z.infer<typeof updateAssuranceSchema>;

export type UpdateRetirementFund = z.infer<typeof updateRetirementFundSchema>;
export type RetirementFund = typeof retirementFunds.$inferSelect;

// Defined Benefit Funds schema
export const definedBenefitFunds = pgTable("defined_benefit_funds", {
  id: serial("id").primaryKey(),
  
  // Main fields
  description: text("description").notNull().default(""),
  owner: text("owner").notNull().default("Donald Edwards"),
  yearsOfService: text("years_of_service").notNull().default("0"),
  finalMonthlySalary: text("final_monthly_salary").notNull().default("0"),
  deathLumpSum: text("death_lump_sum").notNull().default("0"),
  additionalTaxFreeAmount: text("additional_tax_free_amount").notNull().default("0"),
  pensionIncomeAmount: text("pension_income_amount").notNull().default("0"),
  pensionIncomeIncrease: text("pension_income_increase").notNull().default("0"),
});

export const insertDefinedBenefitFundSchema = createInsertSchema(definedBenefitFunds).omit({
  id: true,
});

export const updateDefinedBenefitFundSchema = createInsertSchema(definedBenefitFunds).omit({
  id: true,
}).partial();

export type InsertDefinedBenefitFund = z.infer<typeof insertDefinedBenefitFundSchema>;
export type DefinedBenefitFund = typeof definedBenefitFunds.$inferSelect;
export type UpdateDefinedBenefitFund = z.infer<typeof updateDefinedBenefitFundSchema>;

// Voluntary Investments schema
export const voluntaryInvestments = pgTable("voluntary_investments", {
  id: serial("id").primaryKey(),
  
  // Overview fields
  description: text("description").notNull().default(""),
  owners: text("owners").notNull().default("[]"), // JSON array of owners
  ownershipPercentages: text("ownership_percentages").notNull().default("[]"), // JSON array of percentages
  
  // Bequeath to fields
  baseCost: text("base_cost").notNull().default("0"),
  marketValue: text("market_value").notNull().default("0"),
  liquidationPercentage: text("liquidation_percentage").notNull().default("0"),
  spouse: text("spouse").notNull().default("0"),
  others: text("others").notNull().default("0"),
  
  // Exclusion checkboxes
  excludedFromJointEstate: boolean("excluded_from_joint_estate").notNull().default(false),
  excludedFromEstateDuty: boolean("excluded_from_estate_duty").notNull().default(false),
  excludedFromCGT: boolean("excluded_from_cgt").notNull().default(false),
  excludedFromExecutorsFees: boolean("excluded_from_executors_fees").notNull().default(false),
});

export const insertVoluntaryInvestmentSchema = createInsertSchema(voluntaryInvestments).omit({
  id: true,
});

export const updateVoluntaryInvestmentSchema = createInsertSchema(voluntaryInvestments).omit({
  id: true,
}).partial();

export type InsertVoluntaryInvestment = z.infer<typeof insertVoluntaryInvestmentSchema>;
export type VoluntaryInvestment = typeof voluntaryInvestments.$inferSelect;
export type UpdateVoluntaryInvestment = z.infer<typeof updateVoluntaryInvestmentSchema>;

// Assets and Liabilities schema
export const assetsAndLiabilities = pgTable("assets_and_liabilities", {
  id: serial("id").primaryKey(),
  
  // Overview fields
  include: boolean("include").notNull().default(true),
  categoryAndDescription: text("category_and_description").notNull().default(""),
  currency: text("currency").notNull().default("ZAR"),
  baseCost: text("base_cost").notNull().default("0"),
  marketValue: text("market_value").notNull().default("0"),
  
  // Owner fields
  donaldEdwardsPercentage: text("donald_edwards_percentage").notNull().default("0"),
  bettyEdwardsPercentage: text("betty_edwards_percentage").notNull().default("0"),
  
  // Bequeath to fields
  liquidationPercentage: text("liquidation_percentage").notNull().default("0"),
  spouse: text("spouse").notNull().default("0"),
  others: text("others").notNull().default("0"),
  
  // Exclusion checkboxes
  excludedFromJointEstate: boolean("excluded_from_joint_estate").notNull().default(false),
  excludedFromEstateDuty: boolean("excluded_from_estate_duty").notNull().default(false),
  excludedFromCGT: boolean("excluded_from_cgt").notNull().default(false),
  
  // Category for grouping
  category: text("category").notNull().default(""),
  isHeader: boolean("is_header").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertAssetAndLiabilitySchema = createInsertSchema(assetsAndLiabilities).omit({
  id: true,
});

export const updateAssetAndLiabilitySchema = createInsertSchema(assetsAndLiabilities).omit({
  id: true,
}).partial();

export type InsertAssetAndLiability = z.infer<typeof insertAssetAndLiabilitySchema>;
export type AssetAndLiability = typeof assetsAndLiabilities.$inferSelect;
export type UpdateAssetAndLiability = z.infer<typeof updateAssetAndLiabilitySchema>;

// Income Needs schema
export const incomeNeeds = pgTable("income_needs", {
  id: serial("id").primaryKey(),
  
  // Main fields
  description: text("description").notNull().default(""),
  entity: text("entity").notNull().default("Donald Edwards"),
  start: text("start").notNull().default("0"),
  termYears: text("term_years").notNull().default("0"),
  termEditable: boolean("term_editable").notNull().default(false),
  increasePercentage: text("increase_percentage").notNull().default("0"),
  cpi: boolean("cpi").notNull().default(false),
  frequency: text("frequency").notNull().default("Monthly"),
  amount: text("amount").notNull().default("0"),
  capitalisedAmount: text("capitalised_amount").notNull().default("0"),
});

export const insertIncomeNeedSchema = createInsertSchema(incomeNeeds).omit({
  id: true,
});

export const updateIncomeNeedSchema = createInsertSchema(incomeNeeds).omit({
  id: true,
}).partial();

export type InsertIncomeNeed = z.infer<typeof insertIncomeNeedSchema>;
export type IncomeNeed = typeof incomeNeeds.$inferSelect;
export type UpdateIncomeNeed = z.infer<typeof updateIncomeNeedSchema>;

// Income Provisions schema
export const incomeProvisions = pgTable("income_provisions", {
  id: serial("id").primaryKey(),
  
  // Main fields
  description: text("description").notNull().default(""),
  entity: text("entity").notNull().default("Donald Edwards"),
  start: text("start").notNull().default("0"),
  termYears: text("term_years").notNull().default("0"),
  termEditable: boolean("term_editable").notNull().default(false),
  increasePercentage: text("increase_percentage").notNull().default("0"),
  cpi: boolean("cpi").notNull().default(false),
  frequency: text("frequency").notNull().default("Monthly"),
  amount: text("amount").notNull().default("0"),
  taxablePercentage: text("taxable_percentage").notNull().default("0"),
  taxPercentage: text("tax_percentage").notNull().default("0"),
  capitalisedAmount: text("capitalised_amount").notNull().default("0"),
});

export const insertIncomeProvisionSchema = createInsertSchema(incomeProvisions).omit({
  id: true,
});

export const updateIncomeProvisionSchema = createInsertSchema(incomeProvisions).omit({
  id: true,
}).partial();

export type InsertIncomeProvision = z.infer<typeof insertIncomeProvisionSchema>;
export type IncomeProvision = typeof incomeProvisions.$inferSelect;
export type UpdateIncomeProvision = z.infer<typeof updateIncomeProvisionSchema>;

// Residue schema
export const residue = pgTable("residue", {
  id: serial("id").primaryKey(),
  
  // Main fields
  entity: text("entity").notNull().default("Donald Edwards"),
  percentage: text("percentage").notNull().default("0"),
  isCharityRow: boolean("is_charity_row").notNull().default(false),
});

export const insertResidueSchema = createInsertSchema(residue).omit({
  id: true,
});

export const updateResidueSchema = createInsertSchema(residue).omit({
  id: true,
}).partial();

export type InsertResidue = z.infer<typeof insertResidueSchema>;
export type Residue = typeof residue.$inferSelect;
export type UpdateResidue = z.infer<typeof updateResidueSchema>;
