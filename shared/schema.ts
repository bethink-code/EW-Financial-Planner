import { pgTable, text, serial, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const retirementFunds = pgTable("retirement_funds", {
  id: serial("id").primaryKey(),
  
  // Overview Section - Funds now support multiple owners with percentages
  description: text("description"),  // Allow null, no default
  owners: text("owners").array().notNull().default(["Donald Edwards"]),
  ownershipPercentages: text("ownership_percentages").array().notNull().default(["100%"]),
  
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
  
  // Overview Section
  description: text("description").notNull().default(""),
  entity: text("entity").notNull().default(""),
  
  // Need Details Section
  start: text("start").notNull().default(""), // Date field
  amount: text("amount").notNull().default("R 0"),
  increasePercentage: text("increase_percentage").notNull().default("0%"),
  cpi: boolean("cpi").notNull().default(false),
  valueAtDeath: text("value_at_death").notNull().default("R 0"), // Calculated field
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

// Client Details table
export const clientDetails = pgTable("client_details", {
  id: serial("id").primaryKey(),
  
  // Entity Information
  entityName: text("entity_name").notNull().default(""),
  entityType: text("entity_type").notNull().default("Primary entity"), // Primary entity, Spouse, Dependant, Other
  
  // Personal Information
  dateOfBirth: text("date_of_birth").notNull().default(""), // Date field
  age: text("age").notNull().default("0"), // Calculated field
  
  // Tax Information
  taxRate: text("tax_rate").notNull().default("South Africa"), // Dropdown
  marginalTaxRate: text("marginal_tax_rate").notNull().default("0%"), // Percentage
  
  // Marital Information
  maritalStatus: text("marital_status").notNull().default(""), // Dropdown
  maritalRegime: text("marital_regime").notNull().default(""), // Dropdown
  maritalDate: text("marital_date").notNull().default(""), // Date field
  accrualInception: text("accrual_inception").notNull().default("0"), // Number field
});

export const insertClientDetailsSchema = createInsertSchema(clientDetails).omit({
  id: true,
});

export const updateClientDetailsSchema = createInsertSchema(clientDetails).omit({
  id: true,
}).partial();

export type ClientDetails = typeof clientDetails.$inferSelect;
export type InsertClientDetails = z.infer<typeof insertClientDetailsSchema>;
export type UpdateClientDetails = z.infer<typeof updateClientDetailsSchema>;

// Assurance table
export const assurance = pgTable("assurance", {
  id: serial("id").primaryKey(),
  
  // Basic policy information
  description: text("description").notNull().default(""),
  
  // Owner information - linked triplets: Owner + Life Assured + Death Benefit
  owners: text("owners").array().notNull().default(["Donald Edwards"]),
  lifeAssured: text("life_assured").array().notNull().default([""]), // Linked to owners
  deathBenefits: text("death_benefits").array().notNull().default(["R 0"]), // Individual death benefits per owner/life assured
  ownershipPercentages: text("ownership_percentages").array().notNull().default(["100%"]),
  
  // Beneficiary information 
  beneficiaries: text("beneficiaries").array().notNull().default([""]),
  beneficiaryPercentages: text("beneficiary_percentages").array().notNull().default(["100%"]),
  
  // Financial details
  deathBenefit: text("death_benefit").notNull().default("R 0"),
  amount: text("amount").notNull().default("R 0"),
  amountCheckbox: boolean("amount_checkbox").notNull().default(true), // Toggle: true = Years mode, false = % mode
  amountYears: text("amount_years").notNull().default("0 years"),
  amountIncrease: text("amount_increase").notNull().default("0%"),
  premiumsByOthers: text("premiums_by_others").notNull().default("R 0"),
  collateralSession: text("collateral_session").notNull().default("R 0"),
  benefitSplit: text("benefit_split").notNull().default("0%"),
  
  // Additional info
  additionalInfo: text("additional_info").notNull().default(""),
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
  
  // Overview Section
  description: text("description").notNull().default(""),
  owners: text("owners").array().notNull().default(["Donald Edwards"]),
  ownershipPercentages: text("ownership_percentages").array().notNull().default(["100%"]),
  
  // Fund Details Section
  yearsOfService: text("years_of_service").notNull().default("0 years"),
  finalMonthlySalary: text("final_monthly_salary").notNull().default("R 0"),
  deathLumpSum: text("death_lump_sum").notNull().default("R 0"),
  additionalTaxFreeAmount: text("additional_tax_free_amount").notNull().default("R 0"),
  
  // Pension Income at Death Section
  pensionIncomeAmount: text("pension_income_amount").notNull().default("R 0"),
  pensionIncomeCheckbox: boolean("pension_income_checkbox").notNull().default(true), // Toggle: true = Years mode, false = % mode
  pensionIncomeYears: text("pension_income_years").notNull().default("0 years"),
  pensionIncomeIncrease: text("pension_income_increase").notNull().default("0%"),
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

// Voluntary Investments table schema - New 5-section structure with multiple owners
export const voluntaryInvestments = pgTable("voluntary_investments", {
  id: serial("id").primaryKey(),
  
  // Overview Section
  description: text("description").notNull().default(""),
  owners: text("owners").array().notNull().default(["Donald Edwards"]),
  ownershipPercentages: text("ownership_percentages").array().notNull().default(["100%"]),
  
  // Investment Details Section
  baseCost: text("base_cost").notNull().default("R 0"),
  marketValue: text("market_value").notNull().default("R 0"),
  liquidationPercentage: text("liquidation_percentage").notNull().default("0%"),
  
  // Bequeath To Section
  spouse: text("spouse").notNull().default("R 0"),
  others: text("others").notNull().default("R 0"),
  
  // Exclusions Section
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

export type VoluntaryInvestment = typeof voluntaryInvestments.$inferSelect;
export type InsertVoluntaryInvestment = z.infer<typeof insertVoluntaryInvestmentSchema>;
export type UpdateVoluntaryInvestment = z.infer<typeof updateVoluntaryInvestmentSchema>;



// Income Needs table schema - New 3-section structure
export const incomeNeeds = pgTable("income_needs", {
  id: serial("id").primaryKey(),
  
  // Overview Section
  description: text("description").notNull().default(""),
  personName: text("person_name").notNull().default(""),
  
  // Income Need Details Section
  startDate: text("start_date").notNull().default(""),
  termYears: text("term_years").notNull().default("0"),
  increasePercentage: text("increase_percentage").notNull().default("0%"),
  cpi: boolean("cpi").notNull().default(false),
  frequency: text("frequency").notNull().default("monthly"),
  amount: text("amount").notNull().default("R 0"),
  capitalisedAmount: text("capitalised_amount").notNull().default("R 0"),
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

// Income Provisions table schema - Extended from Income Needs with additional columns
export const incomeProvisions = pgTable("income_provisions", {
  id: serial("id").primaryKey(),
  
  // Overview Section (same as Income Needs)
  description: text("description").notNull().default(""),
  personName: text("person_name").notNull().default(""),
  
  // Income Provision Details Section (extended from Income Needs)
  startDate: text("start_date").notNull().default(""),
  termYears: text("term_years").notNull().default("0 years"),
  increasePercentage: text("increase_percentage").notNull().default("0%"),
  cpi: boolean("cpi").notNull().default(false),
  frequency: text("frequency").notNull().default("monthly"),
  amount: text("amount").notNull().default("R 0"),
  capitalisedAmount: text("capitalised_amount").notNull().default("R 0"),
  
  // Additional Income Provisions specific fields
  taxPercentage: text("tax_percentage").notNull().default("0%"),
  taxRate: text("tax_rate").notNull().default("0%"),
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

// Residue table schema - simplified for entity and percentage only
export const residue = pgTable("residue", {
  id: serial("id").primaryKey(),
  
  // Entity name (fixed as "Residue to registered charities")
  entity: text("entity").notNull().default("Residue to registered charities"),
  
  // Percentage allocation
  percentage: text("percentage").notNull().default("0"),
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

// Additional Estate Duty Items table schema - Simple 4-field structure
export const additionalEstateDutyItems = pgTable("additional_estate_duty_items", {
  id: serial("id").primaryKey(),
  
  // Description field
  description: text("description").notNull().default(""),
  
  // Amount field
  amount: text("amount").notNull().default("R 0"),
  
  // Deduction checkbox
  deduction: boolean("deduction").notNull().default(false),
  
  // Exclude from joint estate checkbox
  excludeFromJointEstate: boolean("exclude_from_joint_estate").notNull().default(false),
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

// Liabilities table schema - New comprehensive structure
export const liabilities = pgTable("liabilities", {
  id: serial("id").primaryKey(),
  
  // Overview Section
  description: text("description").notNull().default("Enter details ..."),
  currency: text("currency").notNull().default("ZAR"),
  
  // Debt Details
  debtAmount: text("debt_amount").notNull().default("R 0"),
  
  // Dynamic ownership percentages - stored as JSON object matching client entities  
  entityOwnership: text("entity_ownership").notNull().default('{}'), // JSON object: {"Garth Shoebridge": "0%", "Beryl Shuttleworth": "0%", ...}
  
  // Client's liabilities settled by
  estate: text("estate").notNull().default("R 0"),
  others: text("others").notNull().default("R 0"),
  
  // Others' liabilities settled by
  client: text("client").notNull().default("R 0"),
  
  // Section categorization
  section: text("section").notNull().default("BONDS"), // BONDS, HIRE_PURCHASES, OVERDRAFTS, SHORT_TERM, OTHER_DEBT
  
  // Row inclusion checkbox
  included: boolean("included").notNull().default(true),
});

export const insertLiabilitiesSchema = createInsertSchema(liabilities).omit({
  id: true,
});

export const updateLiabilitiesSchema = createInsertSchema(liabilities).omit({
  id: true,
}).partial();

export type Liabilities = typeof liabilities.$inferSelect;
export type InsertLiabilities = z.infer<typeof insertLiabilitiesSchema>;
export type UpdateLiabilities = z.infer<typeof updateLiabilitiesSchema>;

// Estate Position Parameters table
export const estatePositionParameters = pgTable("estate_position_parameters", {
  id: serial("id").primaryKey(),
  
  // Capital Provided Section
  lifeCoverToEstate: text("life_cover_to_estate").notNull().default("R 0"),
  voluntaryInvestments: text("voluntary_investments").notNull().default("R 0"),
  accrualClaimFromSpouse: text("accrual_claim_from_spouse").notNull().default("R 0"),
  dependantsSurplusUtilised: text("dependants_surplus_utilised").notNull().default("R 0"),
  ownEstateCapitalProvided: text("own_estate_capital_provided").notNull().default("R 0"), // Calculated
  
  // Capital Required Section
  estateDuty: text("estate_duty").notNull().default("R 0"),
  executorsFees: text("executors_fees").notNull().default("R 0"),
  settleClientLiabilities: text("settle_client_liabilities").notNull().default("R 0"),
  capitalGainsTax: text("capital_gains_tax").notNull().default("R 0"),
  mastersFee: text("masters_fee").notNull().default("R 0"),
  deathBedFuneralExpenses: text("death_bed_funeral_expenses").notNull().default("R 0"),
  conveyancingValuationFees: text("conveyancing_valuation_fees").notNull().default("R 0"),
  accrualClaimToSpouse: text("accrual_claim_to_spouse").notNull().default("R 0"),
  ownEstateCapitalRequired: text("own_estate_capital_required").notNull().default("R 0"), // Calculated
  
  // Results Section (all calculated)
  surplus: text("surplus").notNull().default("R 0"), // Calculated
  estateSurplusUtilisedForDependants: text("estate_surplus_utilised_for_dependants").notNull().default("R 0"), // Calculated
  estatePositionAfterAllocation: text("estate_position_after_allocation").notNull().default("R 0"), // Calculated
  
  // Metadata
  lastUpdated: text("last_updated").notNull().default(""),
});

export const insertEstatePositionParametersSchema = createInsertSchema(estatePositionParameters).omit({
  id: true,
});

export const updateEstatePositionParametersSchema = createInsertSchema(estatePositionParameters).omit({
  id: true,
}).partial();

export type EstatePositionParameters = typeof estatePositionParameters.$inferSelect;
export type InsertEstatePositionParameters = z.infer<typeof insertEstatePositionParametersSchema>;
export type UpdateEstatePositionParameters = z.infer<typeof updateEstatePositionParametersSchema>;

export * from './assets-schema';