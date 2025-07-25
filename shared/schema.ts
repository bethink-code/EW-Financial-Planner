import { pgTable, text, serial, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const retirementFunds = pgTable("retirement_funds", {
  id: serial("id").primaryKey(),
  
  // Overview Section
  description: text("description").notNull().default("Enter details ..."),
  owners: text("owners").array().notNull().default(["Donald Edwards"]),
  
  // Unapproved Life Cover Section
  coverAmount: text("cover_amount").notNull().default("R 0"),
  unapprovedBeneficiaries: text("unapproved_beneficiaries").array().notNull().default([""]),
  unapprovedPercentageSplits: text("unapproved_percentage_splits").array().notNull().default(["0%"]),
  unapprovedCoverSplits: text("unapproved_cover_splits").array().notNull().default(["R 0"]), // Calculated
  
  // Monthly Death Benefit Section
  monthlyIncome: text("monthly_income").notNull().default("R 0"),
  monthlyIncomeCheckbox: boolean("monthly_income_checkbox").notNull().default(false),
  termYears: text("term_years").notNull().default("0 years"),
  increasePercentage: text("increase_percentage").notNull().default("0%"),
  
  // Approved Life Cover Section  
  approvedLifeCover: text("approved_life_cover").notNull().default("R 0"),
  fundValue: text("fund_value").notNull().default("R 0"),
  fundValueAtDeath: text("fund_value_at_death").notNull().default("R 0"), // Calculated
  
  // Fund Value Beneficiaries Section
  fundValueBeneficiaries: text("fund_value_beneficiaries").array().notNull().default([""]),
  fundValuePercentageSplits: text("fund_value_percentage_splits").array().notNull().default(["0%"]),
  fundValueCoverSplits: text("fund_value_cover_splits").array().notNull().default(["R 0"]), // Calculated
  lumpSumTaken: text("lump_sum_taken").notNull().default("R 0"),
  nonDeductibleContribution: text("non_deductible_contribution").notNull().default("R 0"),
  livingAnnuity: text("living_annuity").notNull().default("R 0"), // Calculated
  livingAnnuityCheckbox: boolean("living_annuity_checkbox").notNull().default(false),
  incomeTerm: text("income_term").notNull().default("0 years")
});

export const insertRetirementFundSchema = createInsertSchema(retirementFunds).omit({
  id: true,
});

export const updateRetirementFundSchema = createInsertSchema(retirementFunds).omit({
  id: true,
}).partial();

export type RetirementFund = typeof retirementFunds.$inferSelect;
export type InsertRetirementFund = z.infer<typeof insertRetirementFundSchema>;
export type UpdateRetirementFund = z.infer<typeof updateRetirementFundSchema>;

// Lump Sum Bequests table
export const lumpSumBequests = pgTable("lump_sum_bequests", {
  id: serial("id").primaryKey(),
  
  // Main fields
  description: text("description").notNull().default(""),
  entity: text("entity").notNull().default(""), // Donald Edwards, Betty Edwards
  amount: text("amount").notNull().default("R 0"),
  increasePercentage: text("increase_percentage").notNull().default("0%"),
  cpi: boolean("cpi").notNull().default(false),
});

export const insertLumpSumBequestSchema = createInsertSchema(lumpSumBequests).omit({
  id: true,
});

export const updateLumpSumBequestSchema = createInsertSchema(lumpSumBequests).omit({
  id: true,
}).partial();

export type LumpSumBequest = typeof lumpSumBequests.$inferSelect;
export type InsertLumpSumBequest = z.infer<typeof insertLumpSumBequestSchema>;
export type UpdateLumpSumBequest = z.infer<typeof updateLumpSumBequestSchema>;

// Assurance table
export const assurance = pgTable("assurance", {
  id: serial("id").primaryKey(),
  
  // Basic policy information
  description: text("description").notNull().default("Enter details ..."),
  
  // Owner information
  owners: text("owners").array().notNull().default(["Donald Edwards"]),
  
  // Beneficiary information 
  beneficiaries: text("beneficiaries").array().notNull().default(["Enter details ..."]),
  
  // Financial details
  deathBenefit: text("death_benefit").notNull().default("R 0"),
  amount: text("amount").notNull().default("R 0"),
  premiumsByOthers: text("premiums_by_others").notNull().default("R 0"),
  collateralSession: text("collateral_session").notNull().default("R 0"),
  benefitSplit: text("benefit_split").notNull().default("0%"),
  
  // Additional info
  additionalInfo: text("additional_info").notNull().default("Enter details ..."),
});

export const insertAssuranceSchema = createInsertSchema(assurance).omit({
  id: true,
});

export const updateAssuranceSchema = createInsertSchema(assurance).omit({
  id: true,
}).partial();

export type Assurance = typeof assurance.$inferSelect;
export type InsertAssurance = z.infer<typeof insertAssuranceSchema>;
export type UpdateAssurance = z.infer<typeof updateAssuranceSchema>;

// Define Benefit Funds table schema
export const definedBenefitFunds = pgTable("defined_benefit_funds", {
  id: serial("id").primaryKey(),
  
  // Basic information
  description: text("description").notNull().default("Enter details ..."),
  owner: text("owner").notNull().default("Donald Edwards"),
  
  // Financial details
  pensionIncome: text("pension_income").notNull().default("R 0"),
  pensionIncomeIncrease: text("pension_income_increase").notNull().default("0%"),
  spouseIncome: text("spouse_income").notNull().default("R 0"),
  spouseIncomeIncrease: text("spouse_income_increase").notNull().default("0%"),
  
  // Multiple owners support
  additionalOwners: text("additional_owners").array().notNull().default([]),
});

export const insertDefinedBenefitFundSchema = createInsertSchema(definedBenefitFunds).omit({
  id: true,
});

export const updateDefinedBenefitFundSchema = createInsertSchema(definedBenefitFunds).omit({
  id: true,
}).partial();

export type DefinedBenefitFund = typeof definedBenefitFunds.$inferSelect;
export type InsertDefinedBenefitFund = z.infer<typeof insertDefinedBenefitFundSchema>;
export type UpdateDefinedBenefitFund = z.infer<typeof updateDefinedBenefitFundSchema>;

// Voluntary Investments table schema
export const voluntaryInvestments = pgTable("voluntary_investments", {
  id: serial("id").primaryKey(),
  
  // Basic information
  description: text("description").notNull().default("Enter details ..."),
  
  // Owner information - multiple owners with percentages
  owners: text("owners").array().notNull().default(["Donald Edwards"]),
  ownershipPercentages: text("ownership_percentages").array().notNull().default(["100%"]),
  
  // Financial details
  amount: text("amount").notNull().default("R 0"),
  increasePercentage: text("increase_percentage").notNull().default("0%"),
  
  // Beneficiary information - multiple beneficiaries with splits
  beneficiaries: text("beneficiaries").array().notNull().default(["Enter details ..."]),
  benefitSplits: text("benefit_splits").array().notNull().default(["0%"]),
});

export const insertVoluntaryInvestmentSchema = createInsertSchema(voluntaryInvestments).omit({
  id: true,
});

export const updateVoluntaryInvestmentSchema = createInsertSchema(voluntaryInvestments).omit({
  id: true,
}).partial();

export type VoluntaryInvestment = typeof voluntaryInvestments.$inferSelect;
export type InsertVoluntaryInvestment = z.infer<typeof insertVoluntaryInvestmentSchema>;
export type UpdateVoluntaryInvestment = z.infer<typeof updateVoluntaryInvestmentSchema>;

// Assets and Liabilities table schema
export const assetsAndLiabilities = pgTable("assets_and_liabilities", {
  id: serial("id").primaryKey(),
  
  // Basic information
  description: text("description").notNull().default("Enter details ..."),
  owner: text("owner").notNull().default("Donald Edwards"),
  
  // Financial details
  amount: text("amount").notNull().default("R 0"),
  increasePercentage: text("increase_percentage").notNull().default("0%"),
  
  // Multiple owners support
  additionalOwners: text("additional_owners").array().notNull().default([]),
});

export const insertAssetsAndLiabilitiesSchema = createInsertSchema(assetsAndLiabilities).omit({
  id: true,
});

export const updateAssetsAndLiabilitiesSchema = createInsertSchema(assetsAndLiabilities).omit({
  id: true,
}).partial();

export type AssetsAndLiabilities = typeof assetsAndLiabilities.$inferSelect;
export type InsertAssetsAndLiabilities = z.infer<typeof insertAssetsAndLiabilitiesSchema>;
export type UpdateAssetsAndLiabilities = z.infer<typeof updateAssetsAndLiabilitiesSchema>;

// Income Needs table schema
export const incomeNeeds = pgTable("income_needs", {
  id: serial("id").primaryKey(),
  
  // Basic information
  description: text("description").notNull().default("Enter details ..."),
  
  // Financial details
  amount: text("amount").notNull().default("R 0"),
  increasePercentage: text("increase_percentage").notNull().default("0%"),
});

export const insertIncomeNeedsSchema = createInsertSchema(incomeNeeds).omit({
  id: true,
});

export const updateIncomeNeedsSchema = createInsertSchema(incomeNeeds).omit({
  id: true,
}).partial();

export type IncomeNeeds = typeof incomeNeeds.$inferSelect;
export type InsertIncomeNeeds = z.infer<typeof insertIncomeNeedsSchema>;
export type UpdateIncomeNeeds = z.infer<typeof updateIncomeNeedsSchema>;

// Income Provisions table schema
export const incomeProvisions = pgTable("income_provisions", {
  id: serial("id").primaryKey(),
  
  // Basic information
  description: text("description").notNull().default("Enter details ..."),
  
  // Financial details
  amount: text("amount").notNull().default("R 0"),
  increasePercentage: text("increase_percentage").notNull().default("0%"),
});

export const insertIncomeProvisionsSchema = createInsertSchema(incomeProvisions).omit({
  id: true,
});

export const updateIncomeProvisionsSchema = createInsertSchema(incomeProvisions).omit({
  id: true,
}).partial();

export type IncomeProvisions = typeof incomeProvisions.$inferSelect;
export type InsertIncomeProvisions = z.infer<typeof insertIncomeProvisionsSchema>;
export type UpdateIncomeProvisions = z.infer<typeof updateIncomeProvisionsSchema>;

// Residue table schema
export const residue = pgTable("residue", {
  id: serial("id").primaryKey(),
  
  // Basic information
  description: text("description").notNull().default("Enter details ..."),
  
  // Financial details
  amount: text("amount").notNull().default("R 0"),
  increasePercentage: text("increase_percentage").notNull().default("0%"),
});

export const insertResidueSchema = createInsertSchema(residue).omit({
  id: true,
});

export const updateResidueSchema = createInsertSchema(residue).omit({
  id: true,
}).partial();

export type Residue = typeof residue.$inferSelect;
export type InsertResidue = z.infer<typeof insertResidueSchema>;
export type UpdateResidue = z.infer<typeof updateResidueSchema>;

// Additional Estate Duty Items table schema
export const additionalEstateDutyItems = pgTable("additional_estate_duty_items", {
  id: serial("id").primaryKey(),
  
  // Basic information
  description: text("description").notNull().default("Enter details ..."),
  
  // Financial details
  amount: text("amount").notNull().default("R 0"),
  increasePercentage: text("increase_percentage").notNull().default("0%"),
});

export const insertAdditionalEstateDutyItemsSchema = createInsertSchema(additionalEstateDutyItems).omit({
  id: true,
});

export const updateAdditionalEstateDutyItemsSchema = createInsertSchema(additionalEstateDutyItems).omit({
  id: true,
}).partial();

export type AdditionalEstateDutyItems = typeof additionalEstateDutyItems.$inferSelect;
export type InsertAdditionalEstateDutyItems = z.infer<typeof insertAdditionalEstateDutyItemsSchema>;
export type UpdateAdditionalEstateDutyItems = z.infer<typeof updateAdditionalEstateDutyItemsSchema>;