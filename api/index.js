import { createRequire } from "module"; const require = createRequire(import.meta.url);

// server/api-handler.ts
import express from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
import { pgTable as pgTable2, text as text2, serial as serial2, integer, boolean as boolean2 } from "drizzle-orm/pg-core";
import { createInsertSchema as createInsertSchema2 } from "drizzle-zod";

// shared/assets-schema.ts
import { pgTable, serial, text, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  description: text("description").notNull().default("Enter details ..."),
  marketValue: text("market_value").notNull().default("R 0"),
  // Dynamic ownership percentages - stored as JSON object matching client entities
  entityOwnership: text("entity_ownership").notNull().default("{}"),
  // JSON object: {"Garth Shoebridge": "0%", "Beryl Shuttleworth": "0%", ...}
  estate: text("estate").notNull().default("R 0"),
  others: text("others").notNull().default("R 0"),
  client: text("client").notNull().default("R 0"),
  section: text("section").notNull().default("PROPERTY"),
  included: boolean("included").notNull().default(true)
});
var insertAssetsSchema = createInsertSchema(assets).omit({
  id: true
});

// shared/schema.ts
var retirementFunds = pgTable2("retirement_funds", {
  id: serial2("id").primaryKey(),
  // Overview Section - Funds now support multiple owners with percentages
  description: text2("description"),
  // Allow null, no default
  owners: text2("owners").array().notNull().default(["Donald Edwards"]),
  ownershipPercentages: text2("ownership_percentages").array().notNull().default(["100%"]),
  // Unapproved Life Cover Section  
  coverAmount: text2("cover_amount").notNull().default("R 0"),
  unapprovedBeneficiaries: text2("unapproved_beneficiaries").array().notNull().default([""]),
  unapprovedPercentageSplits: text2("unapproved_percentage_splits").array().notNull().default(["0%"]),
  unapprovedCoverSplits: text2("unapproved_cover_splits").array().notNull().default(["R 0"]),
  // Calculated
  // Monthly Death Benefit Section
  monthlyIncome: text2("monthly_income").notNull().default("R 0"),
  monthlyIncomeCheckbox: boolean2("monthly_income_checkbox").notNull().default(false),
  termYears: text2("term_years").notNull().default("0 years"),
  increasePercentage: text2("increase_percentage").notNull().default("0%"),
  // Approved Life Cover Section  
  approvedLifeCover: text2("approved_life_cover").notNull().default("R 0"),
  fundValue: text2("fund_value").notNull().default("R 0"),
  fundValueAtDeath: text2("fund_value_at_death").notNull().default("R 0"),
  // Calculated
  // Fund Value Beneficiaries Section
  fundValueBeneficiaries: text2("fund_value_beneficiaries").array().notNull().default([""]),
  fundValuePercentageSplits: text2("fund_value_percentage_splits").array().notNull().default(["0%"]),
  fundValueCoverSplits: text2("fund_value_cover_splits").array().notNull().default(["R 0"]),
  // Calculated
  lumpSumTaken: text2("lump_sum_taken").notNull().default("R 0"),
  nonDeductibleContribution: text2("non_deductible_contribution").notNull().default("R 0"),
  livingAnnuity: text2("living_annuity").notNull().default("R 0"),
  // Calculated
  livingAnnuityCheckbox: boolean2("living_annuity_checkbox").notNull().default(false),
  incomeTerm: text2("income_term").notNull().default("0 years"),
  // Additional fields for table views
  additionalOwners: text2("additional_owners").array().notNull().default([]),
  owner: text2("owner").notNull().default("Donald Edwards"),
  name: text2("name").notNull().default(""),
  amount: text2("amount").notNull().default("R 0"),
  beneficiaryName: text2("beneficiary_name").notNull().default(""),
  beneficiaryPercentageSplit: text2("beneficiary_percentage_split").notNull().default("0%"),
  additionalBeneficiaries: text2("additional_beneficiaries").array().notNull().default([]),
  additionalBenefitSplits: text2("additional_benefit_splits").array().notNull().default([]),
  beneficiaries: text2("beneficiaries").notNull().default("[]"),
  // Flows table fields
  lumpSumDeath: text2("lump_sum_death").notNull().default("R 0"),
  fundValueAfterLumpSum: text2("fund_value_after_lump_sum").notNull().default("R 0"),
  monthlyIncomeTerm: text2("monthly_income_term").notNull().default("0 years"),
  lumpSumProvisionEstate: text2("lump_sum_provision_estate").notNull().default("R 0"),
  lumpSumProvisionSpouse: text2("lump_sum_provision_spouse").notNull().default("R 0"),
  lumpSumProvisionOther: text2("lump_sum_provision_other").notNull().default("R 0"),
  currentAnnualIncome: text2("current_annual_income").notNull().default("R 0"),
  monthlyProvisionOffered: text2("monthly_provision_offered").notNull().default("R 0"),
  incomeEscalation: text2("income_escalation").notNull().default("0%"),
  estateDutyPoliciesOnLife: text2("estate_duty_policies_on_life").notNull().default("0%"),
  estateDutyToSpouse: text2("estate_duty_to_spouse").notNull().default("0%"),
  estateDutyToOthers: text2("estate_duty_to_others").notNull().default("0%"),
  executorsFee: text2("executors_fee").notNull().default("0%"),
  mastersFee: text2("masters_fee").notNull().default("0%"),
  // Retirement projection inputs (used by the retirement need)
  monthlyContribution: text2("monthly_contribution").notNull().default("R 0"),
  contributionEscalation: text2("contribution_escalation").notNull().default("0%"),
  growthRate: text2("growth_rate").notNull().default("10%")
});
var insertRetirementFundSchema = createInsertSchema2(retirementFunds).omit({
  id: true
});
var updateRetirementFundSchema = createInsertSchema2(retirementFunds).omit({
  id: true
}).partial();
var lumpSumBequests = pgTable2("lump_sum_bequests", {
  id: serial2("id").primaryKey(),
  // Overview Section
  description: text2("description").notNull().default(""),
  entity: text2("entity").notNull().default(""),
  // Need Details Section
  start: text2("start").notNull().default(""),
  // Date field
  amount: text2("amount").notNull().default("R 0"),
  increasePercentage: text2("increase_percentage").notNull().default("0%"),
  cpi: boolean2("cpi").notNull().default(false),
  valueAtDeath: text2("value_at_death").notNull().default("R 0")
  // Calculated field
});
var insertLumpSumBequestSchema = createInsertSchema2(lumpSumBequests).omit({
  id: true
});
var updateLumpSumBequestSchema = createInsertSchema2(lumpSumBequests).omit({
  id: true
}).partial();
var clientDetails = pgTable2("client_details", {
  id: serial2("id").primaryKey(),
  // Entity Information
  entityName: text2("entity_name").notNull().default(""),
  entityType: text2("entity_type").notNull().default("Primary entity"),
  // Primary entity, Spouse, Dependant, Other
  // Personal Information
  dateOfBirth: text2("date_of_birth").notNull().default(""),
  // Date field
  age: text2("age").notNull().default("0"),
  // Calculated field
  // Tax Information
  taxRate: text2("tax_rate").notNull().default("South Africa"),
  // Dropdown
  marginalTaxRate: text2("marginal_tax_rate").notNull().default("0%"),
  // Percentage
  // Marital Information
  maritalStatus: text2("marital_status").notNull().default(""),
  // Dropdown
  maritalRegime: text2("marital_regime").notNull().default(""),
  // Dropdown
  maritalDate: text2("marital_date").notNull().default(""),
  // Date field
  accrualInception: text2("accrual_inception").notNull().default("0")
  // Number field
});
var insertClientDetailsSchema = createInsertSchema2(clientDetails).omit({
  id: true
});
var updateClientDetailsSchema = createInsertSchema2(clientDetails).omit({
  id: true
}).partial();
var assurance = pgTable2("assurance", {
  id: serial2("id").primaryKey(),
  // Basic policy information
  description: text2("description").notNull().default(""),
  // Owner information - linked triplets: Owner + Life Assured + Death Benefit
  owners: text2("owners").array().notNull().default(["Donald Edwards"]),
  lifeAssured: text2("life_assured").array().notNull().default([""]),
  // Linked to owners
  deathBenefits: text2("death_benefits").array().notNull().default(["R 0"]),
  // Individual death benefits per owner/life assured
  ownershipPercentages: text2("ownership_percentages").array().notNull().default(["100%"]),
  // Beneficiary information 
  beneficiaries: text2("beneficiaries").array().notNull().default([""]),
  beneficiaryPercentages: text2("beneficiary_percentages").array().notNull().default(["100%"]),
  // Financial details
  deathBenefit: text2("death_benefit").notNull().default("R 0"),
  amount: text2("amount").notNull().default("R 0"),
  amountToggles: boolean2("amount_toggles").array().notNull().default([true]),
  // Per-beneficiary toggles: true = Years mode, false = % mode
  amountYearsValues: text2("amount_years_values").array().notNull().default(["0 years"]),
  // Per-beneficiary years values
  amountIncreaseValues: text2("amount_increase_values").array().notNull().default(["0%"]),
  // Per-beneficiary percentage values
  premiumsByOthers: text2("premiums_by_others").notNull().default("R 0"),
  collateralSession: text2("collateral_session").notNull().default("R 0"),
  benefitSplit: text2("benefit_split").notNull().default("0%"),
  // Flags
  buySell: boolean2("buy_sell").notNull().default(false),
  keyMan: boolean2("key_man").notNull().default(false),
  excludedFromEstateDuty: boolean2("excluded_from_estate_duty").notNull().default(false),
  excludedFromProvisions: boolean2("excluded_from_provisions").notNull().default(false),
  // Additional owners/beneficiaries
  additionalOwners: text2("additional_owners").array().notNull().default([]),
  additionalBeneficiaries: text2("additional_beneficiaries").array().notNull().default([]),
  additionalBenefitSplits: text2("additional_benefit_splits").array().notNull().default([]),
  // Additional info
  additionalInfo: text2("additional_info").notNull().default("")
});
var insertAssuranceSchema = createInsertSchema2(assurance).omit({
  id: true
});
var updateAssuranceSchema = createInsertSchema2(assurance).omit({
  id: true
}).partial();
var definedBenefitFunds = pgTable2("defined_benefit_funds", {
  id: serial2("id").primaryKey(),
  // Overview Section
  description: text2("description").notNull().default(""),
  owners: text2("owners").array().notNull().default(["Donald Edwards"]),
  ownershipPercentages: text2("ownership_percentages").array().notNull().default(["100%"]),
  // Fund Details Section
  yearsOfService: text2("years_of_service").notNull().default("0 years"),
  finalMonthlySalary: text2("final_monthly_salary").notNull().default("R 0"),
  deathLumpSum: text2("death_lump_sum").notNull().default("R 0"),
  additionalTaxFreeAmount: text2("additional_tax_free_amount").notNull().default("R 0"),
  // Pension Income at Death Section
  pensionIncomeAmount: text2("pension_income_amount").notNull().default("R 0"),
  pensionIncomeCheckbox: boolean2("pension_income_checkbox").notNull().default(true),
  // Toggle: true = Years mode, false = % mode
  pensionIncomeYears: text2("pension_income_years").notNull().default("0 years"),
  pensionIncomeIncrease: text2("pension_income_increase").notNull().default("0%"),
  // Retirement projection inputs (used by the retirement need)
  growthRate: text2("growth_rate").notNull().default("10%")
});
var insertDefinedBenefitFundSchema = createInsertSchema2(definedBenefitFunds).omit({
  id: true
});
var updateDefinedBenefitFundSchema = createInsertSchema2(definedBenefitFunds).omit({
  id: true
}).partial();
var voluntaryInvestments = pgTable2("voluntary_investments", {
  id: serial2("id").primaryKey(),
  // Overview Section
  description: text2("description").notNull().default(""),
  owners: text2("owners").array().notNull().default(["Donald Edwards"]),
  ownershipPercentages: text2("ownership_percentages").array().notNull().default(["100%"]),
  // Investment Details Section
  baseCost: text2("base_cost").notNull().default("R 0"),
  marketValue: text2("market_value").notNull().default("R 0"),
  liquidationPercentage: text2("liquidation_percentage").notNull().default("0%"),
  // Bequeath To Section
  spouse: text2("spouse").notNull().default("R 0"),
  others: text2("others").notNull().default("R 0"),
  // Exclusions Section
  excludedFromJointEstate: boolean2("excluded_from_joint_estate").notNull().default(false),
  excludedFromEstateDuty: boolean2("excluded_from_estate_duty").notNull().default(false),
  excludedFromCGT: boolean2("excluded_from_cgt").notNull().default(false),
  excludedFromExecutorsFees: boolean2("excluded_from_executors_fees").notNull().default(false),
  // Retirement projection inputs (used by the retirement need)
  monthlyContribution: text2("monthly_contribution").notNull().default("R 0"),
  contributionEscalation: text2("contribution_escalation").notNull().default("0%"),
  growthRate: text2("growth_rate").notNull().default("10%"),
  incomeIncrease: text2("income_increase").notNull().default("0%")
});
var insertVoluntaryInvestmentSchema = createInsertSchema2(voluntaryInvestments).omit({
  id: true
});
var updateVoluntaryInvestmentSchema = createInsertSchema2(voluntaryInvestments).omit({
  id: true
}).partial();
var incomeNeeds = pgTable2("income_needs", {
  id: serial2("id").primaryKey(),
  // Overview Section
  description: text2("description").notNull().default(""),
  personName: text2("person_name").notNull().default(""),
  // Income Need Details Section
  startDate: text2("start_date").notNull().default(""),
  termYears: text2("term_years").notNull().default("0"),
  increasePercentage: text2("increase_percentage").notNull().default("0%"),
  cpi: boolean2("cpi").notNull().default(false),
  frequency: text2("frequency").notNull().default("monthly"),
  amount: text2("amount").notNull().default("R 0"),
  capitalisedAmount: text2("capitalised_amount").notNull().default("R 0")
});
var insertIncomeNeedsSchema = createInsertSchema2(incomeNeeds).omit({
  id: true
});
var updateIncomeNeedsSchema = createInsertSchema2(incomeNeeds).omit({
  id: true
}).partial();
var incomeProvisions = pgTable2("income_provisions", {
  id: serial2("id").primaryKey(),
  // Overview Section (same as Income Needs)
  description: text2("description").notNull().default(""),
  personName: text2("person_name").notNull().default(""),
  // Income Provision Details Section (extended from Income Needs)
  startDate: text2("start_date").notNull().default(""),
  termYears: text2("term_years").notNull().default("0 years"),
  increasePercentage: text2("increase_percentage").notNull().default("0%"),
  cpi: boolean2("cpi").notNull().default(false),
  frequency: text2("frequency").notNull().default("monthly"),
  amount: text2("amount").notNull().default("R 0"),
  capitalisedAmount: text2("capitalised_amount").notNull().default("R 0"),
  // Additional Income Provisions specific fields
  taxPercentage: text2("tax_percentage").notNull().default("0%"),
  taxRate: text2("tax_rate").notNull().default("0%")
});
var insertIncomeProvisionsSchema = createInsertSchema2(incomeProvisions).omit({
  id: true
});
var updateIncomeProvisionsSchema = createInsertSchema2(incomeProvisions).omit({
  id: true
}).partial();
var residue = pgTable2("residue", {
  id: serial2("id").primaryKey(),
  // Entity name (fixed as "Residue to registered charities")
  entity: text2("entity").notNull().default("Residue to registered charities"),
  // Percentage allocation
  percentage: text2("percentage").notNull().default("0")
});
var insertResidueSchema = createInsertSchema2(residue).omit({
  id: true
});
var updateResidueSchema = createInsertSchema2(residue).omit({
  id: true
}).partial();
var additionalEstateDutyItems = pgTable2("additional_estate_duty_items", {
  id: serial2("id").primaryKey(),
  // Description field
  description: text2("description").notNull().default(""),
  // Amount field
  amount: text2("amount").notNull().default("R 0"),
  // Deduction checkbox
  deduction: boolean2("deduction").notNull().default(false),
  // Exclude from joint estate checkbox
  excludeFromJointEstate: boolean2("exclude_from_joint_estate").notNull().default(false)
});
var insertAdditionalEstateDutyItemsSchema = createInsertSchema2(additionalEstateDutyItems).omit({
  id: true
});
var updateAdditionalEstateDutyItemsSchema = createInsertSchema2(additionalEstateDutyItems).omit({
  id: true
}).partial();
var liabilities = pgTable2("liabilities", {
  id: serial2("id").primaryKey(),
  // Overview Section
  description: text2("description").notNull().default("Enter details ..."),
  currency: text2("currency").notNull().default("ZAR"),
  // Debt Details
  debtAmount: text2("debt_amount").notNull().default("R 0"),
  // Dynamic ownership percentages - stored as JSON object matching client entities  
  entityOwnership: text2("entity_ownership").notNull().default("{}"),
  // JSON object: {"Garth Shoebridge": "0%", "Beryl Shuttleworth": "0%", ...}
  // Client's liabilities settled by
  estate: text2("estate").notNull().default("R 0"),
  others: text2("others").notNull().default("R 0"),
  // Others' liabilities settled by
  client: text2("client").notNull().default("R 0"),
  // Section categorization
  section: text2("section").notNull().default("BONDS"),
  // BONDS, HIRE_PURCHASES, OVERDRAFTS, SHORT_TERM, OTHER_DEBT
  // Row inclusion checkbox
  included: boolean2("included").notNull().default(true)
});
var insertLiabilitiesSchema = createInsertSchema2(liabilities).omit({
  id: true
});
var updateLiabilitiesSchema = createInsertSchema2(liabilities).omit({
  id: true
}).partial();
var estatePositionParameters = pgTable2("estate_position_parameters", {
  id: serial2("id").primaryKey(),
  // Capital Provided Section
  lifeCoverToEstate: text2("life_cover_to_estate").notNull().default("R 0"),
  voluntaryInvestments: text2("voluntary_investments").notNull().default("R 0"),
  accrualClaimFromSpouse: text2("accrual_claim_from_spouse").notNull().default("R 0"),
  dependantsSurplusUtilised: text2("dependants_surplus_utilised").notNull().default("R 0"),
  ownEstateCapitalProvided: text2("own_estate_capital_provided").notNull().default("R 0"),
  // Calculated
  // Capital Required Section
  estateDuty: text2("estate_duty").notNull().default("R 0"),
  executorsFees: text2("executors_fees").notNull().default("R 0"),
  settleClientLiabilities: text2("settle_client_liabilities").notNull().default("R 0"),
  capitalGainsTax: text2("capital_gains_tax").notNull().default("R 0"),
  mastersFee: text2("masters_fee").notNull().default("R 0"),
  deathBedFuneralExpenses: text2("death_bed_funeral_expenses").notNull().default("R 0"),
  conveyancingValuationFees: text2("conveyancing_valuation_fees").notNull().default("R 0"),
  accrualClaimToSpouse: text2("accrual_claim_to_spouse").notNull().default("R 0"),
  ownEstateCapitalRequired: text2("own_estate_capital_required").notNull().default("R 0"),
  // Calculated
  // Results Section (all calculated)
  surplus: text2("surplus").notNull().default("R 0"),
  // Calculated
  estateSurplusUtilisedForDependants: text2("estate_surplus_utilised_for_dependants").notNull().default("R 0"),
  // Calculated
  estatePositionAfterAllocation: text2("estate_position_after_allocation").notNull().default("R 0"),
  // Calculated
  // Metadata
  lastUpdated: text2("last_updated").notNull().default("")
});
var insertEstatePositionParametersSchema = createInsertSchema2(estatePositionParameters).omit({
  id: true
});
var updateEstatePositionParametersSchema = createInsertSchema2(estatePositionParameters).omit({
  id: true
}).partial();
var financialPlans = pgTable2("financial_plans", {
  id: serial2("id").primaryKey(),
  // Basic plan information
  name: text2("name").notNull(),
  description: text2("description"),
  dateApplicable: text2("date_applicable").notNull().default((/* @__PURE__ */ new Date()).toISOString().split("T")[0]),
  // Metadata
  createdAt: text2("created_at").notNull().default((/* @__PURE__ */ new Date()).toISOString()),
  updatedAt: text2("updated_at").notNull().default((/* @__PURE__ */ new Date()).toISOString())
});
var insertFinancialPlanSchema = createInsertSchema2(financialPlans).omit({
  id: true
});
var updateFinancialPlanSchema = createInsertSchema2(financialPlans).omit({
  id: true
}).partial();
var needs = pgTable2("needs", {
  id: serial2("id").primaryKey(),
  // Need identification
  key: text2("key").notNull().unique(),
  // e.g., "death", "retirement", "permanent-disability"
  displayName: text2("display_name").notNull(),
  // e.g., "Death with estate liquidity"
  category: text2("category").notNull(),
  // e.g., "protection", "investment", "planning"
  // Need configuration
  hasDetailedSteps: boolean2("has_detailed_steps").notNull().default(false),
  // true only for "death-estate-liquidity"
  summaryData: text2("summary_data"),
  // JSON string containing summary card data
  // Metadata
  createdAt: text2("created_at").notNull().default((/* @__PURE__ */ new Date()).toISOString())
});
var insertNeedSchema = createInsertSchema2(needs).omit({
  id: true
});
var updateNeedSchema = createInsertSchema2(needs).omit({
  id: true
}).partial();
var planNeeds = pgTable2("plan_needs", {
  id: serial2("id").primaryKey(),
  // Foreign keys
  planId: integer("plan_id").notNull(),
  needId: integer("need_id").notNull(),
  // Configuration specific to this plan-need relationship
  isActive: boolean2("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  // Metadata
  createdAt: text2("created_at").notNull().default((/* @__PURE__ */ new Date()).toISOString())
});
var insertPlanNeedSchema = createInsertSchema2(planNeeds).omit({
  id: true
});
var updatePlanNeedSchema = createInsertSchema2(planNeeds).omit({
  id: true
}).partial();
var comments = pgTable2("comments", {
  id: serial2("id").primaryKey(),
  page: text2("page").notNull(),
  author: text2("author").notNull(),
  content: text2("content").notNull().default(""),
  image: text2("image"),
  status: text2("status").notNull().default("open"),
  createdAt: text2("created_at").notNull().default((/* @__PURE__ */ new Date()).toISOString())
});
var insertCommentSchema = createInsertSchema2(comments).omit({
  id: true
});
var updateCommentSchema = createInsertSchema2(comments).omit({
  id: true
}).partial();
var retirementParameters = pgTable2("retirement_parameters", {
  id: serial2("id").primaryKey(),
  planId: integer("plan_id").notNull().unique(),
  retirementAge: integer("retirement_age").notNull().default(65),
  retirementPlanningAge: integer("retirement_planning_age").notNull().default(90),
  autoCalculateTax: boolean2("auto_calculate_tax").notNull().default(true),
  currentAnnualIncome: text2("current_annual_income").notNull().default("R 0"),
  lastUpdated: text2("last_updated").notNull().default((/* @__PURE__ */ new Date()).toISOString())
});
var insertRetirementParametersSchema = createInsertSchema2(retirementParameters).omit({
  id: true
});
var updateRetirementParametersSchema = createInsertSchema2(retirementParameters).omit({
  id: true
}).partial();
var futureInflows = pgTable2("future_inflows", {
  id: serial2("id").primaryKey(),
  description: text2("description").notNull().default(""),
  entity: text2("entity").notNull().default("Donald Edwards"),
  startYearsAfterRetirement: integer("start_years_after_retirement").notNull().default(0),
  currentValue: text2("current_value").notNull().default("R 0"),
  calculateCgt: boolean2("calculate_cgt").notNull().default(false),
  growthRate: text2("growth_rate").notNull().default("10%")
});
var insertFutureInflowSchema = createInsertSchema2(futureInflows).omit({
  id: true
});
var updateFutureInflowSchema = createInsertSchema2(futureInflows).omit({
  id: true
}).partial();
var retirementLumpSumNeeds = pgTable2("retirement_lump_sum_needs", {
  id: serial2("id").primaryKey(),
  description: text2("description").notNull().default(""),
  startYears: integer("start_years").notNull().default(0),
  termYears: integer("term_years").notNull().default(0),
  increasePercentage: text2("increase_percentage").notNull().default("0%"),
  frequency: text2("frequency").notNull().default("Single"),
  // Single | Monthly | Quarterly | Annual
  frequencyValue: integer("frequency_value").notNull().default(1),
  amount: text2("amount").notNull().default("R 0")
});
var insertRetirementLumpSumNeedSchema = createInsertSchema2(retirementLumpSumNeeds).omit({
  id: true
});
var updateRetirementLumpSumNeedSchema = createInsertSchema2(retirementLumpSumNeeds).omit({
  id: true
}).partial();

// server/storage.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import { eq, ilike, or, asc, and } from "drizzle-orm";
var MemStorage = class {
  retirementFunds;
  lumpSumBequests;
  assurance;
  definedBenefitFunds;
  voluntaryInvestments;
  incomeNeeds;
  incomeProvisions;
  residue;
  additionalEstateDutyItems;
  liabilities;
  assets;
  clientDetails;
  estatePositionParameters;
  financialPlans;
  needs;
  planNeeds;
  retirementParameters;
  futureInflows;
  retirementLumpSumNeeds;
  currentFundId;
  currentBequestId;
  currentAssuranceId;
  currentDefinedBenefitFundId;
  currentVoluntaryInvestmentId;
  currentIncomeNeedId;
  currentIncomeProvisionId;
  currentResidueId;
  currentAdditionalEstateDutyItemId;
  currentLiabilityId;
  currentAssetId;
  currentClientDetailId;
  currentEstatePositionParameterId;
  currentFinancialPlanId;
  currentNeedId;
  currentPlanNeedId;
  currentRetirementParameterId;
  currentFutureInflowId;
  currentRetirementLumpSumNeedId;
  constructor() {
    this.retirementFunds = /* @__PURE__ */ new Map();
    this.lumpSumBequests = /* @__PURE__ */ new Map();
    this.assurance = /* @__PURE__ */ new Map();
    this.definedBenefitFunds = /* @__PURE__ */ new Map();
    this.voluntaryInvestments = /* @__PURE__ */ new Map();
    this.incomeNeeds = /* @__PURE__ */ new Map();
    this.incomeProvisions = /* @__PURE__ */ new Map();
    this.residue = /* @__PURE__ */ new Map();
    this.additionalEstateDutyItems = /* @__PURE__ */ new Map();
    this.liabilities = /* @__PURE__ */ new Map();
    this.assets = /* @__PURE__ */ new Map();
    this.clientDetails = /* @__PURE__ */ new Map();
    this.estatePositionParameters = /* @__PURE__ */ new Map();
    this.financialPlans = /* @__PURE__ */ new Map();
    this.needs = /* @__PURE__ */ new Map();
    this.planNeeds = /* @__PURE__ */ new Map();
    this.retirementParameters = /* @__PURE__ */ new Map();
    this.futureInflows = /* @__PURE__ */ new Map();
    this.retirementLumpSumNeeds = /* @__PURE__ */ new Map();
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
    this.initializeDefaultNeeds();
  }
  // Retirement Funds methods
  async getRetirementFunds() {
    return Array.from(this.retirementFunds.values()).sort(
      (a, b) => a.id - b.id
    );
  }
  async getRetirementFund(id) {
    return this.retirementFunds.get(id);
  }
  async createRetirementFund(insertFund) {
    const id = this.currentFundId++;
    const fund = {
      id,
      description: insertFund.description || null,
      // Store null for empty values
      owners: insertFund.owners || ["Donald Edwards"],
      ownershipPercentages: insertFund.ownershipPercentages || ["100%"],
      coverAmount: insertFund.coverAmount || "R 0",
      unapprovedBeneficiaries: insertFund.unapprovedBeneficiaries || [""],
      unapprovedPercentageSplits: insertFund.unapprovedPercentageSplits || [
        "0%"
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
      growthRate: insertFund.growthRate || "10%"
    };
    this.retirementFunds.set(id, fund);
    return fund;
  }
  async updateRetirementFund(id, updates) {
    const existing = this.retirementFunds.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...updates };
    this.retirementFunds.set(id, updated);
    return updated;
  }
  async deleteRetirementFund(id) {
    return this.retirementFunds.delete(id);
  }
  async searchRetirementFunds(query) {
    const allFunds = Array.from(this.retirementFunds.values());
    if (!query.trim()) return allFunds;
    const lowerQuery = query.toLowerCase();
    return allFunds.filter(
      (fund) => fund.description?.toLowerCase().includes(lowerQuery)
    );
  }
  // Lump Sum Bequests methods
  async getLumpSumBequests() {
    return Array.from(this.lumpSumBequests.values());
  }
  async getLumpSumBequest(id) {
    return this.lumpSumBequests.get(id);
  }
  async createLumpSumBequest(insertBequest) {
    const id = this.currentBequestId++;
    const bequest = {
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
  async updateLumpSumBequest(id, updates) {
    const existing = this.lumpSumBequests.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...updates };
    this.lumpSumBequests.set(id, updated);
    return updated;
  }
  async deleteLumpSumBequest(id) {
    return this.lumpSumBequests.delete(id);
  }
  async searchLumpSumBequests(query) {
    const allBequests = Array.from(this.lumpSumBequests.values());
    if (!query.trim()) return allBequests;
    const lowerQuery = query.toLowerCase();
    return allBequests.filter(
      (bequest) => bequest.description.toLowerCase().includes(lowerQuery) || bequest.entity.toLowerCase().includes(lowerQuery)
    );
  }
  // Assurance methods
  async getAssurance() {
    return Array.from(this.assurance.values());
  }
  async getAssuranceById(id) {
    return this.assurance.get(id);
  }
  async createAssurance(insertAssurance) {
    const id = this.currentAssuranceId++;
    const assurance2 = {
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
      additionalInfo: insertAssurance.additionalInfo || ""
    };
    this.assurance.set(id, assurance2);
    return assurance2;
  }
  async updateAssurance(id, updates) {
    const existing = this.assurance.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...updates };
    this.assurance.set(id, updated);
    return updated;
  }
  async deleteAssurance(id) {
    return this.assurance.delete(id);
  }
  async searchAssurance(query) {
    const allAssurance = Array.from(this.assurance.values());
    if (!query.trim()) return allAssurance;
    const lowerQuery = query.toLowerCase();
    return allAssurance.filter(
      (assurance2) => assurance2.description.toLowerCase().includes(lowerQuery)
    );
  }
  // Defined Benefit Funds methods
  async getDefinedBenefitFunds() {
    return Array.from(this.definedBenefitFunds.values());
  }
  async getDefinedBenefitFund(id) {
    return this.definedBenefitFunds.get(id);
  }
  async createDefinedBenefitFund(fund) {
    const newFund = {
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
      growthRate: fund.growthRate || "10%"
    };
    this.definedBenefitFunds.set(newFund.id, newFund);
    return newFund;
  }
  async updateDefinedBenefitFund(id, updates) {
    const existing = this.definedBenefitFunds.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...updates };
    this.definedBenefitFunds.set(id, updated);
    return updated;
  }
  async deleteDefinedBenefitFund(id) {
    return this.definedBenefitFunds.delete(id);
  }
  async searchDefinedBenefitFunds(query) {
    const allFunds = Array.from(this.definedBenefitFunds.values());
    if (!query.trim()) return allFunds;
    const lowerQuery = query.toLowerCase();
    return allFunds.filter(
      (fund) => fund.description.toLowerCase().includes(lowerQuery)
    );
  }
  // Voluntary Investments methods
  async getVoluntaryInvestments() {
    return Array.from(this.voluntaryInvestments.values());
  }
  async getVoluntaryInvestment(id) {
    return this.voluntaryInvestments.get(id);
  }
  async createVoluntaryInvestment(investment) {
    const newInvestment = {
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
      incomeIncrease: investment.incomeIncrease || "0%"
    };
    this.voluntaryInvestments.set(newInvestment.id, newInvestment);
    return newInvestment;
  }
  async updateVoluntaryInvestment(id, updates) {
    const existing = this.voluntaryInvestments.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...updates };
    this.voluntaryInvestments.set(id, updated);
    return updated;
  }
  async deleteVoluntaryInvestment(id) {
    return this.voluntaryInvestments.delete(id);
  }
  async searchVoluntaryInvestments(query) {
    const allInvestments = Array.from(this.voluntaryInvestments.values());
    if (!query.trim()) return allInvestments;
    const lowerQuery = query.toLowerCase();
    return allInvestments.filter(
      (investment) => investment.description.toLowerCase().includes(lowerQuery)
    );
  }
  // Income Needs methods
  async getIncomeNeeds() {
    return Array.from(this.incomeNeeds.values());
  }
  async getIncomeNeed(id) {
    return this.incomeNeeds.get(id);
  }
  async createIncomeNeed(need) {
    const newNeed = {
      id: this.currentIncomeNeedId++,
      description: need.description || "",
      personName: need.personName || "",
      startDate: need.startDate || "",
      amount: need.amount || "R 0",
      termYears: need.termYears || "0 years",
      increasePercentage: need.increasePercentage || "0%",
      cpi: need.cpi || false,
      frequency: need.frequency || "Monthly",
      capitalisedAmount: need.capitalisedAmount || "R 0"
    };
    this.incomeNeeds.set(newNeed.id, newNeed);
    return newNeed;
  }
  async updateIncomeNeed(id, updates) {
    const existing = this.incomeNeeds.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...updates };
    this.incomeNeeds.set(id, updated);
    return updated;
  }
  async deleteIncomeNeed(id) {
    return this.incomeNeeds.delete(id);
  }
  async searchIncomeNeeds(query) {
    const allNeeds = Array.from(this.incomeNeeds.values());
    if (!query.trim()) return allNeeds;
    const lowerQuery = query.toLowerCase();
    return allNeeds.filter(
      (need) => need.description.toLowerCase().includes(lowerQuery) || need.personName.toLowerCase().includes(lowerQuery)
    );
  }
  // Income Provisions methods
  async getIncomeProvisions() {
    return Array.from(this.incomeProvisions.values());
  }
  async getIncomeProvision(id) {
    return this.incomeProvisions.get(id);
  }
  async createIncomeProvision(provision) {
    const newProvision = {
      id: this.currentIncomeProvisionId++,
      description: provision.description || "Enter details ...",
      personName: provision.personName || "Enter details ...",
      startDate: provision.startDate || "Enter details ...",
      amount: provision.amount || "R 0",
      termYears: provision.termYears || "0 years",
      increasePercentage: provision.increasePercentage || "0%",
      cpi: provision.cpi || false,
      frequency: provision.frequency || "Monthly",
      capitalisedAmount: provision.capitalisedAmount || "R 0",
      taxPercentage: provision.taxPercentage || "0%",
      taxRate: provision.taxRate || "R 0"
    };
    this.incomeProvisions.set(newProvision.id, newProvision);
    return newProvision;
  }
  async updateIncomeProvision(id, updates) {
    const existing = this.incomeProvisions.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...updates };
    this.incomeProvisions.set(id, updated);
    return updated;
  }
  async deleteIncomeProvision(id) {
    return this.incomeProvisions.delete(id);
  }
  async searchIncomeProvisions(query) {
    const allProvisions = Array.from(this.incomeProvisions.values());
    if (!query.trim()) return allProvisions;
    const lowerQuery = query.toLowerCase();
    return allProvisions.filter(
      (provision) => provision.description.toLowerCase().includes(lowerQuery) || provision.personName.toLowerCase().includes(lowerQuery)
    );
  }
  // Residue methods
  async getResidue() {
    return Array.from(this.residue.values());
  }
  async getResidueItem(id) {
    return this.residue.get(id);
  }
  async createResidueItem(item) {
    const newItem = {
      id: this.currentResidueId++,
      entity: item.entity || "Residue to registered charities",
      percentage: item.percentage || "0"
    };
    this.residue.set(newItem.id, newItem);
    return newItem;
  }
  async updateResidueItem(id, updates) {
    const existing = this.residue.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...updates };
    this.residue.set(id, updated);
    return updated;
  }
  async deleteResidueItem(id) {
    return this.residue.delete(id);
  }
  async searchResidue(query) {
    const allResidue = Array.from(this.residue.values());
    if (!query.trim()) return allResidue;
    const lowerQuery = query.toLowerCase();
    return allResidue.filter(
      (item) => item.entity.toLowerCase().includes(lowerQuery)
    );
  }
  // Additional Estate Duty Items methods
  async getAdditionalEstateDutyItems() {
    return Array.from(this.additionalEstateDutyItems.values());
  }
  async getAdditionalEstateDutyItem(id) {
    return this.additionalEstateDutyItems.get(id);
  }
  async createAdditionalEstateDutyItem(item) {
    const newItem = {
      id: this.currentAdditionalEstateDutyItemId++,
      description: item.description || "",
      amount: item.amount || "R 0",
      deduction: item.deduction ?? false,
      excludeFromJointEstate: item.excludeFromJointEstate ?? false
    };
    this.additionalEstateDutyItems.set(newItem.id, newItem);
    return newItem;
  }
  async updateAdditionalEstateDutyItem(id, updates) {
    const existing = this.additionalEstateDutyItems.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...updates };
    this.additionalEstateDutyItems.set(id, updated);
    return updated;
  }
  async deleteAdditionalEstateDutyItem(id) {
    return this.additionalEstateDutyItems.delete(id);
  }
  async searchAdditionalEstateDutyItems(query) {
    const allItems = Array.from(this.additionalEstateDutyItems.values());
    if (!query.trim()) return allItems;
    const lowerQuery = query.toLowerCase();
    return allItems.filter(
      (item) => item.description.toLowerCase().includes(lowerQuery)
    );
  }
  // Liabilities methods
  async getLiabilities() {
    return Array.from(this.liabilities.values());
  }
  async getLiability(id) {
    return this.liabilities.get(id);
  }
  async createLiability(liability) {
    const newLiability = {
      id: this.currentLiabilityId++,
      description: liability.description || "Enter details...",
      currency: liability.currency || "ZAR",
      debtAmount: liability.debtAmount || "R 0",
      entityOwnership: liability.entityOwnership || "{}",
      estate: liability.estate || "R 0",
      others: liability.others || "R 0",
      client: liability.client || "R 0",
      section: liability.section || "BONDS",
      included: liability.included ?? true
    };
    this.liabilities.set(newLiability.id, newLiability);
    return newLiability;
  }
  async updateLiability(id, updates) {
    const existing = this.liabilities.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...updates };
    this.liabilities.set(id, updated);
    return updated;
  }
  async deleteLiability(id) {
    return this.liabilities.delete(id);
  }
  async searchLiabilities(query) {
    const allLiabilities = Array.from(this.liabilities.values());
    if (!query.trim()) return allLiabilities;
    const lowerQuery = query.toLowerCase();
    return allLiabilities.filter(
      (liability) => liability.description.toLowerCase().includes(lowerQuery)
    );
  }
  // Assets methods
  async getAssets() {
    return Array.from(this.assets.values());
  }
  async getAsset(id) {
    return this.assets.get(id);
  }
  async createAsset(asset) {
    const newAsset = {
      id: this.currentAssetId++,
      description: asset.description || "Enter details...",
      marketValue: asset.marketValue || "R 0",
      entityOwnership: asset.entityOwnership || "{}",
      estate: asset.estate || "R 0",
      others: asset.others || "R 0",
      client: asset.client || "R 0",
      section: asset.section || "PROPERTY",
      included: asset.included ?? true
    };
    this.assets.set(newAsset.id, newAsset);
    return newAsset;
  }
  async updateAsset(id, updates) {
    const existing = this.assets.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...updates };
    this.assets.set(id, updated);
    return updated;
  }
  async deleteAsset(id) {
    return this.assets.delete(id);
  }
  async searchAssets(query) {
    const allAssets = Array.from(this.assets.values());
    if (!query.trim()) return allAssets;
    const lowerQuery = query.toLowerCase();
    return allAssets.filter(
      (asset) => asset.description.toLowerCase().includes(lowerQuery)
    );
  }
  // Client Details methods
  async getClientDetails() {
    return Array.from(this.clientDetails.values()).sort((a, b) => a.id - b.id);
  }
  async getClientDetail(id) {
    return this.clientDetails.get(id);
  }
  async createClientDetail(clientDetail) {
    const newClientDetail = {
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
      accrualInception: clientDetail.accrualInception || "0"
    };
    this.clientDetails.set(newClientDetail.id, newClientDetail);
    return newClientDetail;
  }
  async updateClientDetail(id, updates) {
    const existing = this.clientDetails.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...updates };
    this.clientDetails.set(id, updated);
    return updated;
  }
  async deleteClientDetail(id) {
    return this.clientDetails.delete(id);
  }
  async searchClientDetails(query) {
    const allClientDetails = Array.from(this.clientDetails.values());
    if (!query.trim()) return allClientDetails;
    const lowerQuery = query.toLowerCase();
    return allClientDetails.filter(
      (client) => client.entityName.toLowerCase().includes(lowerQuery) || client.entityType.toLowerCase().includes(lowerQuery)
    );
  }
  // Estate Position Parameters methods for MemStorage
  async getEstatePositionParameters() {
    return Array.from(this.estatePositionParameters.values()).sort((a, b) => a.id - b.id);
  }
  async getEstatePositionParameter(id) {
    return this.estatePositionParameters.get(id);
  }
  async createEstatePositionParameter(parameter) {
    const newParameter = {
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
      lastUpdated: parameter.lastUpdated || (/* @__PURE__ */ new Date()).toISOString()
    };
    this.estatePositionParameters.set(newParameter.id, newParameter);
    return newParameter;
  }
  async updateEstatePositionParameter(id, updates) {
    const parameter = this.estatePositionParameters.get(id);
    if (!parameter) {
      return void 0;
    }
    const updatedParameter = { ...parameter, ...updates };
    this.estatePositionParameters.set(id, updatedParameter);
    return updatedParameter;
  }
  async deleteEstatePositionParameter(id) {
    return this.estatePositionParameters.delete(id);
  }
  async getOrCreateEstatePositionParameter() {
    const existing = Array.from(this.estatePositionParameters.values());
    if (existing.length > 0) {
      return existing[0];
    }
    const defaultParameter = {
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
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
    };
    return this.createEstatePositionParameter(defaultParameter);
  }
  // Financial Plans methods
  async getFinancialPlans() {
    return Array.from(this.financialPlans.values()).sort((a, b) => a.id - b.id);
  }
  async getFinancialPlan(id) {
    return this.financialPlans.get(id);
  }
  async createFinancialPlan(plan) {
    const newPlan = {
      id: this.currentFinancialPlanId++,
      name: plan.name,
      description: plan.description || null,
      dateApplicable: plan.dateApplicable || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      createdAt: plan.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: plan.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
    };
    this.financialPlans.set(newPlan.id, newPlan);
    return newPlan;
  }
  async updateFinancialPlan(id, updates) {
    const existing = this.financialPlans.get(id);
    if (!existing) return void 0;
    const updated = {
      ...existing,
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.financialPlans.set(id, updated);
    return updated;
  }
  async deleteFinancialPlan(id) {
    const planNeedsToDelete = Array.from(this.planNeeds.values()).filter((pn) => pn.planId === id);
    planNeedsToDelete.forEach((pn) => this.planNeeds.delete(pn.id));
    return this.financialPlans.delete(id);
  }
  async searchFinancialPlans(query) {
    const allPlans = Array.from(this.financialPlans.values());
    if (!query.trim()) return allPlans;
    const lowerQuery = query.toLowerCase();
    return allPlans.filter(
      (plan) => plan.name.toLowerCase().includes(lowerQuery) || plan.description && plan.description.toLowerCase().includes(lowerQuery)
    );
  }
  // Needs methods
  async getNeeds() {
    return Array.from(this.needs.values()).sort((a, b) => a.id - b.id);
  }
  async getNeed(id) {
    return this.needs.get(id);
  }
  async createNeed(need) {
    const newNeed = {
      id: this.currentNeedId++,
      key: need.key,
      displayName: need.displayName,
      category: need.category,
      hasDetailedSteps: need.hasDetailedSteps || false,
      summaryData: need.summaryData || null,
      createdAt: need.createdAt || (/* @__PURE__ */ new Date()).toISOString()
    };
    this.needs.set(newNeed.id, newNeed);
    return newNeed;
  }
  async updateNeed(id, updates) {
    const existing = this.needs.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...updates };
    this.needs.set(id, updated);
    return updated;
  }
  async deleteNeed(id) {
    return this.needs.delete(id);
  }
  async initializeDefaultNeeds() {
    const defaultNeeds = [
      {
        key: "death",
        displayName: "Death",
        category: "protection",
        hasDetailedSteps: false,
        summaryData: null
      },
      {
        key: "death-estate-liquidity",
        displayName: "Death with estate liquidity",
        category: "protection",
        hasDetailedSteps: true,
        summaryData: JSON.stringify({
          estatePosition: { provided: "R5,740,881", required: "R2,918,036", surplus: "R2,822,845" },
          dependantsPosition: { provided: "R7,822,845", required: "R9,675,356" }
        })
      },
      {
        key: "permanent-disability",
        displayName: "Permanent disability",
        category: "protection",
        hasDetailedSteps: false,
        summaryData: JSON.stringify({
          lumpSumCover: { surplus: "R831,661" },
          incomeCover: { shortfall: "R5,135,026" }
        })
      },
      {
        key: "temporary-disability",
        displayName: "Temporary disability",
        category: "protection",
        hasDetailedSteps: false,
        summaryData: null
      },
      {
        key: "dread-disease",
        displayName: "Dread disease",
        category: "protection",
        hasDetailedSteps: false,
        summaryData: null
      },
      {
        key: "retirement",
        displayName: "Retirement",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: JSON.stringify({
          retirementFunds: { shortfall: "R8,994,312", required: "R27,965,380" }
        })
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
        })
      },
      {
        key: "lump-sum-recurring",
        displayName: "Lump sum and recurring investment",
        category: "investment",
        hasDetailedSteps: false,
        summaryData: null
      },
      {
        key: "portfolio-comparison",
        displayName: "Portfolio comparison tool",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: null
      },
      {
        key: "contribution-income-analysis",
        displayName: "Contribution and income analysis",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: null
      },
      {
        key: "saving-future-need",
        displayName: "Saving for a future need",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: null
      },
      {
        key: "income-from-capital",
        displayName: "Income from capital",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: null
      },
      {
        key: "debt-repayment",
        displayName: "Debt repayment",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: null
      }
    ];
    for (const needData of defaultNeeds) {
      await this.createNeed(needData);
    }
  }
  // Plan Needs methods
  async getPlanNeeds(planId) {
    return Array.from(this.planNeeds.values()).filter((pn) => pn.planId === planId);
  }
  async addNeedToPlan(planNeed) {
    const newPlanNeed = {
      id: this.currentPlanNeedId++,
      planId: planNeed.planId,
      needId: planNeed.needId,
      isActive: planNeed.isActive !== void 0 ? planNeed.isActive : true,
      sortOrder: planNeed.sortOrder || 0,
      createdAt: planNeed.createdAt || (/* @__PURE__ */ new Date()).toISOString()
    };
    this.planNeeds.set(newPlanNeed.id, newPlanNeed);
    return newPlanNeed;
  }
  async removeNeedFromPlan(planId, needId) {
    const planNeed = Array.from(this.planNeeds.values()).find((pn) => pn.planId === planId && pn.needId === needId);
    if (planNeed) {
      return this.planNeeds.delete(planNeed.id);
    }
    return false;
  }
  async removeAllNeedsFromPlan(planId) {
    const planNeedsToRemove = Array.from(this.planNeeds.values()).filter((pn) => pn.planId === planId);
    if (planNeedsToRemove.length > 0) {
      planNeedsToRemove.forEach((pn) => this.planNeeds.delete(pn.id));
      return true;
    }
    return false;
  }
  async updatePlanNeed(id, updates) {
    const existing = this.planNeeds.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...updates };
    this.planNeeds.set(id, updated);
    return updated;
  }
  async getFinancialPlanWithNeeds(planId) {
    const plan = await this.getFinancialPlan(planId);
    if (!plan) return void 0;
    const planNeeds2 = await this.getPlanNeeds(planId);
    const needs2 = [];
    for (const planNeed of planNeeds2) {
      const need = await this.getNeed(planNeed.needId);
      if (need) {
        needs2.push(need);
      }
    }
    return { plan, needs: needs2 };
  }
  // Retirement Parameters (one row per plan)
  async getRetirementParameters(planId) {
    return Array.from(this.retirementParameters.values()).find((p) => p.planId === planId);
  }
  async upsertRetirementParameters(planId, updates) {
    const existing = await this.getRetirementParameters(planId);
    if (existing) {
      const merged = { ...existing, ...updates, planId, lastUpdated: (/* @__PURE__ */ new Date()).toISOString() };
      this.retirementParameters.set(existing.id, merged);
      return merged;
    }
    const created = {
      id: this.currentRetirementParameterId++,
      planId,
      retirementAge: updates.retirementAge ?? 65,
      retirementPlanningAge: updates.retirementPlanningAge ?? 90,
      autoCalculateTax: updates.autoCalculateTax ?? true,
      currentAnnualIncome: updates.currentAnnualIncome ?? "R 0",
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.retirementParameters.set(created.id, created);
    return created;
  }
  // Future Inflows
  async getFutureInflows() {
    return Array.from(this.futureInflows.values()).sort((a, b) => a.id - b.id);
  }
  async getFutureInflow(id) {
    return this.futureInflows.get(id);
  }
  async createFutureInflow(inflow) {
    const created = {
      id: this.currentFutureInflowId++,
      description: inflow.description ?? "",
      entity: inflow.entity ?? "Donald Edwards",
      startYearsAfterRetirement: inflow.startYearsAfterRetirement ?? 0,
      currentValue: inflow.currentValue ?? "R 0",
      calculateCgt: inflow.calculateCgt ?? false,
      growthRate: inflow.growthRate ?? "10%"
    };
    this.futureInflows.set(created.id, created);
    return created;
  }
  async updateFutureInflow(id, updates) {
    const existing = this.futureInflows.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...updates };
    this.futureInflows.set(id, updated);
    return updated;
  }
  async deleteFutureInflow(id) {
    return this.futureInflows.delete(id);
  }
  // Retirement Lump Sum Needs
  async getRetirementLumpSumNeeds() {
    return Array.from(this.retirementLumpSumNeeds.values()).sort((a, b) => a.id - b.id);
  }
  async getRetirementLumpSumNeed(id) {
    return this.retirementLumpSumNeeds.get(id);
  }
  async createRetirementLumpSumNeed(need) {
    const created = {
      id: this.currentRetirementLumpSumNeedId++,
      description: need.description ?? "",
      startYears: need.startYears ?? 0,
      termYears: need.termYears ?? 0,
      increasePercentage: need.increasePercentage ?? "0%",
      frequency: need.frequency ?? "Single",
      frequencyValue: need.frequencyValue ?? 1,
      amount: need.amount ?? "R 0"
    };
    this.retirementLumpSumNeeds.set(created.id, created);
    return created;
  }
  async updateRetirementLumpSumNeed(id, updates) {
    const existing = this.retirementLumpSumNeeds.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...updates };
    this.retirementLumpSumNeeds.set(id, updated);
    return updated;
  }
  async deleteRetirementLumpSumNeed(id) {
    return this.retirementLumpSumNeeds.delete(id);
  }
};
var DbStorage = class {
  db;
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
  applyRetirementFundDefaults(fund) {
    return {
      description: fund.description !== void 0 ? fund.description : null,
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
      mastersFee: fund.mastersFee || "0%"
    };
  }
  // Helper function to apply defaults for assurance
  applyAssuranceDefaults(assuranceData) {
    return {
      description: assuranceData.description !== void 0 ? assuranceData.description : "",
      owners: assuranceData.owners || ["Donald Edwards"],
      beneficiaries: assuranceData.beneficiaries || [""],
      deathBenefit: assuranceData.deathBenefit !== void 0 ? assuranceData.deathBenefit : "R 0",
      amount: assuranceData.amount !== void 0 ? assuranceData.amount : "R 0",
      amountToggles: assuranceData.amountToggles || [true],
      amountYearsValues: assuranceData.amountYearsValues || ["0 years"],
      amountIncreaseValues: assuranceData.amountIncreaseValues || ["0%"],
      premiumsByOthers: assuranceData.premiumsByOthers !== void 0 ? assuranceData.premiumsByOthers : "R 0",
      collateralSession: assuranceData.collateralSession !== void 0 ? assuranceData.collateralSession : "R 0",
      benefitSplit: assuranceData.benefitSplit !== void 0 ? assuranceData.benefitSplit : "0%",
      buySell: assuranceData.buySell ?? false,
      keyMan: assuranceData.keyMan ?? false,
      excludedFromEstateDuty: assuranceData.excludedFromEstateDuty ?? false,
      excludedFromProvisions: assuranceData.excludedFromProvisions ?? false,
      additionalOwners: assuranceData.additionalOwners || [],
      additionalBeneficiaries: assuranceData.additionalBeneficiaries || [],
      additionalBenefitSplits: assuranceData.additionalBenefitSplits || [],
      additionalInfo: assuranceData.additionalInfo !== void 0 ? assuranceData.additionalInfo : ""
    };
  }
  // Helper function to apply defaults for additional estate duty items
  applyAdditionalEstateDutyItemDefaults(item) {
    return {
      description: item.description || "",
      amount: item.amount || "R 0",
      deduction: item.deduction ?? false,
      excludeFromJointEstate: item.excludeFromJointEstate ?? false
    };
  }
  // Retirement Funds methods
  async getRetirementFunds() {
    return await this.db.select().from(retirementFunds).orderBy(asc(retirementFunds.id));
  }
  async getRetirementFund(id) {
    const result = await this.db.select().from(retirementFunds).where(eq(retirementFunds.id, id));
    return result[0];
  }
  async createRetirementFund(fund) {
    const fundWithDefaults = this.applyRetirementFundDefaults(fund);
    const result = await this.db.insert(retirementFunds).values(fundWithDefaults).returning();
    return result[0];
  }
  async updateRetirementFund(id, updates) {
    const result = await this.db.update(retirementFunds).set(updates).where(eq(retirementFunds.id, id)).returning();
    return result[0];
  }
  async deleteRetirementFund(id) {
    const result = await this.db.delete(retirementFunds).where(eq(retirementFunds.id, id));
    return (result.rowCount || 0) > 0;
  }
  async searchRetirementFunds(query) {
    return await this.db.select().from(retirementFunds).where(ilike(retirementFunds.description, `%${query}%`)).orderBy(asc(retirementFunds.id));
  }
  // Assurance methods
  async getAssurance() {
    return await this.db.select().from(assurance).orderBy(asc(assurance.id));
  }
  async getAssuranceById(id) {
    const result = await this.db.select().from(assurance).where(eq(assurance.id, id));
    return result[0];
  }
  async createAssurance(assuranceData) {
    const assuranceWithDefaults = this.applyAssuranceDefaults(assuranceData);
    const result = await this.db.insert(assurance).values(assuranceWithDefaults).returning();
    return result[0];
  }
  async updateAssurance(id, updates) {
    const result = await this.db.update(assurance).set(updates).where(eq(assurance.id, id)).returning();
    return result[0];
  }
  async deleteAssurance(id) {
    const result = await this.db.delete(assurance).where(eq(assurance.id, id));
    return (result.rowCount || 0) > 0;
  }
  async searchAssurance(query) {
    return await this.db.select().from(assurance).where(ilike(assurance.description, `%${query}%`)).orderBy(asc(assurance.id));
  }
  // TODO: For now, implementing stubs for all other methods to make interface compatible
  // Each method follows the same pattern as above but for different tables
  async getLumpSumBequests() {
    return await this.db.select().from(lumpSumBequests).orderBy(asc(lumpSumBequests.id));
  }
  async getLumpSumBequest(id) {
    const result = await this.db.select().from(lumpSumBequests).where(eq(lumpSumBequests.id, id));
    return result[0];
  }
  async createLumpSumBequest(bequest) {
    const result = await this.db.insert(lumpSumBequests).values(bequest).returning();
    return result[0];
  }
  async updateLumpSumBequest(id, updates) {
    const result = await this.db.update(lumpSumBequests).set(updates).where(eq(lumpSumBequests.id, id)).returning();
    return result[0];
  }
  async deleteLumpSumBequest(id) {
    const result = await this.db.delete(lumpSumBequests).where(eq(lumpSumBequests.id, id));
    return (result.rowCount || 0) > 0;
  }
  async searchLumpSumBequests(query) {
    return await this.db.select().from(lumpSumBequests).where(ilike(lumpSumBequests.description, `%${query}%`)).orderBy(asc(lumpSumBequests.id));
  }
  async getDefinedBenefitFunds() {
    return await this.db.select().from(definedBenefitFunds).orderBy(asc(definedBenefitFunds.id));
  }
  async getDefinedBenefitFund(id) {
    const result = await this.db.select().from(definedBenefitFunds).where(eq(definedBenefitFunds.id, id));
    return result[0];
  }
  async createDefinedBenefitFund(fund) {
    const result = await this.db.insert(definedBenefitFunds).values(fund).returning();
    return result[0];
  }
  async updateDefinedBenefitFund(id, updates) {
    const result = await this.db.update(definedBenefitFunds).set(updates).where(eq(definedBenefitFunds.id, id)).returning();
    return result[0];
  }
  async deleteDefinedBenefitFund(id) {
    const result = await this.db.delete(definedBenefitFunds).where(eq(definedBenefitFunds.id, id));
    return (result.rowCount || 0) > 0;
  }
  async searchDefinedBenefitFunds(query) {
    return await this.db.select().from(definedBenefitFunds).where(ilike(definedBenefitFunds.description, `%${query}%`)).orderBy(asc(definedBenefitFunds.id));
  }
  async getVoluntaryInvestments() {
    return await this.db.select().from(voluntaryInvestments).orderBy(asc(voluntaryInvestments.id));
  }
  async getVoluntaryInvestment(id) {
    const result = await this.db.select().from(voluntaryInvestments).where(eq(voluntaryInvestments.id, id));
    return result[0];
  }
  async createVoluntaryInvestment(investment) {
    const result = await this.db.insert(voluntaryInvestments).values(investment).returning();
    return result[0];
  }
  async updateVoluntaryInvestment(id, updates) {
    const result = await this.db.update(voluntaryInvestments).set(updates).where(eq(voluntaryInvestments.id, id)).returning();
    return result[0];
  }
  async deleteVoluntaryInvestment(id) {
    const result = await this.db.delete(voluntaryInvestments).where(eq(voluntaryInvestments.id, id));
    return (result.rowCount || 0) > 0;
  }
  async searchVoluntaryInvestments(query) {
    return await this.db.select().from(voluntaryInvestments).where(ilike(voluntaryInvestments.description, `%${query}%`)).orderBy(asc(voluntaryInvestments.id));
  }
  async getIncomeNeeds() {
    return await this.db.select().from(incomeNeeds).orderBy(asc(incomeNeeds.id));
  }
  async getIncomeNeed(id) {
    const result = await this.db.select().from(incomeNeeds).where(eq(incomeNeeds.id, id));
    return result[0];
  }
  async createIncomeNeed(need) {
    const result = await this.db.insert(incomeNeeds).values(need).returning();
    return result[0];
  }
  async updateIncomeNeed(id, updates) {
    const result = await this.db.update(incomeNeeds).set(updates).where(eq(incomeNeeds.id, id)).returning();
    return result[0];
  }
  async deleteIncomeNeed(id) {
    const result = await this.db.delete(incomeNeeds).where(eq(incomeNeeds.id, id));
    return (result.rowCount || 0) > 0;
  }
  async searchIncomeNeeds(query) {
    return await this.db.select().from(incomeNeeds).where(ilike(incomeNeeds.description, `%${query}%`)).orderBy(asc(incomeNeeds.id));
  }
  async getIncomeProvisions() {
    return await this.db.select().from(incomeProvisions).orderBy(asc(incomeProvisions.id));
  }
  async getIncomeProvision(id) {
    const result = await this.db.select().from(incomeProvisions).where(eq(incomeProvisions.id, id));
    return result[0];
  }
  async createIncomeProvision(provision) {
    const result = await this.db.insert(incomeProvisions).values(provision).returning();
    return result[0];
  }
  async updateIncomeProvision(id, updates) {
    const result = await this.db.update(incomeProvisions).set(updates).where(eq(incomeProvisions.id, id)).returning();
    return result[0];
  }
  async deleteIncomeProvision(id) {
    const result = await this.db.delete(incomeProvisions).where(eq(incomeProvisions.id, id));
    return (result.rowCount || 0) > 0;
  }
  async searchIncomeProvisions(query) {
    return await this.db.select().from(incomeProvisions).where(ilike(incomeProvisions.description, `%${query}%`)).orderBy(asc(incomeProvisions.id));
  }
  async getResidue() {
    return await this.db.select().from(residue).orderBy(asc(residue.id));
  }
  async getResidueItem(id) {
    const result = await this.db.select().from(residue).where(eq(residue.id, id));
    return result[0];
  }
  async createResidueItem(item) {
    const result = await this.db.insert(residue).values(item).returning();
    return result[0];
  }
  async updateResidueItem(id, updates) {
    const result = await this.db.update(residue).set(updates).where(eq(residue.id, id)).returning();
    return result[0];
  }
  async deleteResidueItem(id) {
    const result = await this.db.delete(residue).where(eq(residue.id, id));
    return (result.rowCount || 0) > 0;
  }
  async searchResidue(query) {
    return await this.db.select().from(residue).where(ilike(residue.entity, `%${query}%`)).orderBy(asc(residue.id));
  }
  async getAdditionalEstateDutyItems() {
    return await this.db.select().from(additionalEstateDutyItems).orderBy(asc(additionalEstateDutyItems.id));
  }
  async getAdditionalEstateDutyItem(id) {
    const result = await this.db.select().from(additionalEstateDutyItems).where(eq(additionalEstateDutyItems.id, id));
    return result[0];
  }
  async createAdditionalEstateDutyItem(item) {
    const itemWithDefaults = this.applyAdditionalEstateDutyItemDefaults(item);
    const result = await this.db.insert(additionalEstateDutyItems).values(itemWithDefaults).returning();
    return result[0];
  }
  async updateAdditionalEstateDutyItem(id, updates) {
    const result = await this.db.update(additionalEstateDutyItems).set(updates).where(eq(additionalEstateDutyItems.id, id)).returning();
    return result[0];
  }
  async deleteAdditionalEstateDutyItem(id) {
    const result = await this.db.delete(additionalEstateDutyItems).where(eq(additionalEstateDutyItems.id, id));
    return (result.rowCount || 0) > 0;
  }
  async searchAdditionalEstateDutyItems(query) {
    return await this.db.select().from(additionalEstateDutyItems).where(ilike(additionalEstateDutyItems.description, `%${query}%`)).orderBy(asc(additionalEstateDutyItems.id));
  }
  async getLiabilities() {
    return await this.db.select().from(liabilities).orderBy(asc(liabilities.id));
  }
  async getLiability(id) {
    const result = await this.db.select().from(liabilities).where(eq(liabilities.id, id));
    return result[0];
  }
  async createLiability(liability) {
    const result = await this.db.insert(liabilities).values(liability).returning();
    return result[0];
  }
  async updateLiability(id, updates) {
    const result = await this.db.update(liabilities).set(updates).where(eq(liabilities.id, id)).returning();
    return result[0];
  }
  async deleteLiability(id) {
    const result = await this.db.delete(liabilities).where(eq(liabilities.id, id));
    return (result.rowCount || 0) > 0;
  }
  async searchLiabilities(query) {
    return await this.db.select().from(liabilities).where(ilike(liabilities.description, `%${query}%`)).orderBy(asc(liabilities.id));
  }
  async getAssets() {
    return await this.db.select().from(assets).orderBy(asc(assets.id));
  }
  async getAsset(id) {
    const result = await this.db.select().from(assets).where(eq(assets.id, id));
    return result[0];
  }
  async createAsset(asset) {
    const result = await this.db.insert(assets).values(asset).returning();
    return result[0];
  }
  async updateAsset(id, updates) {
    const result = await this.db.update(assets).set(updates).where(eq(assets.id, id)).returning();
    return result[0];
  }
  async deleteAsset(id) {
    const result = await this.db.delete(assets).where(eq(assets.id, id));
    return (result.rowCount || 0) > 0;
  }
  async searchAssets(query) {
    return await this.db.select().from(assets).where(ilike(assets.description, `%${query}%`)).orderBy(asc(assets.id));
  }
  // Client Details methods
  async getClientDetails() {
    return await this.db.select().from(clientDetails).orderBy(asc(clientDetails.id));
  }
  async getClientDetail(id) {
    const result = await this.db.select().from(clientDetails).where(eq(clientDetails.id, id));
    return result[0];
  }
  async createClientDetail(clientDetail) {
    const result = await this.db.insert(clientDetails).values(clientDetail).returning();
    return result[0];
  }
  async updateClientDetail(id, updates) {
    const result = await this.db.update(clientDetails).set(updates).where(eq(clientDetails.id, id)).returning();
    return result[0];
  }
  async deleteClientDetail(id) {
    const result = await this.db.delete(clientDetails).where(eq(clientDetails.id, id));
    return (result.rowCount || 0) > 0;
  }
  async searchClientDetails(query) {
    return await this.db.select().from(clientDetails).where(
      or(
        ilike(clientDetails.entityName, `%${query}%`),
        ilike(clientDetails.entityType, `%${query}%`)
      )
    ).orderBy(asc(clientDetails.id));
  }
  // Estate Position Parameters methods
  async getEstatePositionParameters() {
    return await this.db.select().from(estatePositionParameters).orderBy(asc(estatePositionParameters.id));
  }
  async getEstatePositionParameter(id) {
    const result = await this.db.select().from(estatePositionParameters).where(eq(estatePositionParameters.id, id));
    return result[0];
  }
  async createEstatePositionParameter(parameter) {
    const result = await this.db.insert(estatePositionParameters).values(parameter).returning();
    return result[0];
  }
  async updateEstatePositionParameter(id, updates) {
    const result = await this.db.update(estatePositionParameters).set(updates).where(eq(estatePositionParameters.id, id)).returning();
    return result[0];
  }
  async deleteEstatePositionParameter(id) {
    const result = await this.db.delete(estatePositionParameters).where(eq(estatePositionParameters.id, id));
    return (result.rowCount || 0) > 0;
  }
  async getOrCreateEstatePositionParameter() {
    const existing = await this.getEstatePositionParameters();
    if (existing.length > 0) {
      return existing[0];
    }
    const defaultParameter = await this.calculateDefaultEstateParameters();
    return await this.createEstatePositionParameter(defaultParameter);
  }
  async calculateDefaultEstateParameters() {
    const [assets2, liabilities2, retirementFunds2, lumpSumBequests2] = await Promise.all([
      this.getAssets(),
      this.getLiabilities(),
      this.getRetirementFunds(),
      this.getLumpSumBequests()
    ]);
    const parseCurrency = (value) => {
      return parseFloat(value.replace(/[^\d.-]/g, "")) || 0;
    };
    const totalAssets = assets2.reduce((sum2, asset) => {
      return sum2 + parseCurrency(asset.marketValue);
    }, 0);
    const totalLiabilities = liabilities2.reduce((sum2, liability) => {
      return sum2 + parseCurrency(liability.debtAmount);
    }, 0);
    const totalLifeCover = retirementFunds2.reduce((sum2, fund) => {
      return sum2 + parseCurrency(fund.approvedLifeCover) + parseCurrency(fund.coverAmount);
    }, 0);
    const totalBequests = lumpSumBequests2.reduce((sum2, bequest) => {
      return sum2 + parseCurrency(bequest.valueAtDeath);
    }, 0);
    return {
      lifeCoverToEstate: `R ${Math.round(totalLifeCover * 0.4).toLocaleString()}`,
      // 40% of life cover
      voluntaryInvestments: `R ${Math.round(totalAssets * 0.6).toLocaleString()}`,
      // 60% of assets
      accrualClaimFromSpouse: "R 0",
      dependantsSurplusUtilised: "R 0",
      ownEstateCapitalProvided: "R 0",
      // Will be calculated
      estateDuty: `R ${Math.round(totalAssets * 0.02).toLocaleString()}`,
      // 2% of assets
      executorsFees: `R ${Math.round(totalAssets * 0.035).toLocaleString()}`,
      // 3.5% of assets
      settleClientLiabilities: `R ${totalLiabilities.toLocaleString()}`,
      capitalGainsTax: `R ${Math.round(totalAssets * 0.018).toLocaleString()}`,
      // 1.8% of assets
      mastersFee: "R 7000",
      deathBedFuneralExpenses: "R 60000",
      conveyancingValuationFees: `R ${Math.round(totalAssets * 0.01).toLocaleString()}`,
      // 1% of assets
      accrualClaimToSpouse: `R ${Math.round(totalAssets * 0.25).toLocaleString()}`,
      // 25% of assets
      ownEstateCapitalRequired: "R 0",
      // Will be calculated
      surplus: "R 0",
      // Will be calculated
      estateSurplusUtilisedForDependants: "R 0",
      // Will be calculated
      estatePositionAfterAllocation: "R 0",
      // Will be calculated
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  // Financial Plans methods
  async getFinancialPlans() {
    return await this.db.select().from(financialPlans).orderBy(asc(financialPlans.id));
  }
  async getFinancialPlan(id) {
    const result = await this.db.select().from(financialPlans).where(eq(financialPlans.id, id));
    return result[0];
  }
  async createFinancialPlan(plan) {
    const result = await this.db.insert(financialPlans).values(plan).returning();
    return result[0];
  }
  async updateFinancialPlan(id, updates) {
    const result = await this.db.update(financialPlans).set({
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).where(eq(financialPlans.id, id)).returning();
    return result[0];
  }
  async deleteFinancialPlan(id) {
    await this.db.delete(planNeeds).where(eq(planNeeds.planId, id));
    const result = await this.db.delete(financialPlans).where(eq(financialPlans.id, id));
    return (result.rowCount || 0) > 0;
  }
  async searchFinancialPlans(query) {
    return await this.db.select().from(financialPlans).where(
      or(
        ilike(financialPlans.name, `%${query}%`),
        ilike(financialPlans.description, `%${query}%`)
      )
    ).orderBy(asc(financialPlans.id));
  }
  // Needs methods
  async getNeeds() {
    return await this.db.select().from(needs).orderBy(asc(needs.id));
  }
  async getNeed(id) {
    const result = await this.db.select().from(needs).where(eq(needs.id, id));
    return result[0];
  }
  async createNeed(need) {
    const result = await this.db.insert(needs).values(need).returning();
    return result[0];
  }
  async updateNeed(id, updates) {
    const result = await this.db.update(needs).set(updates).where(eq(needs.id, id)).returning();
    return result[0];
  }
  async deleteNeed(id) {
    const result = await this.db.delete(needs).where(eq(needs.id, id));
    return (result.rowCount || 0) > 0;
  }
  async initializeDefaultNeeds() {
    const existingNeeds = await this.getNeeds();
    if (existingNeeds.length > 0) {
      return;
    }
    const defaultNeeds = [
      {
        key: "death",
        displayName: "Death",
        category: "protection",
        hasDetailedSteps: false,
        summaryData: null
      },
      {
        key: "death-estate-liquidity",
        displayName: "Death with estate liquidity",
        category: "protection",
        hasDetailedSteps: true,
        summaryData: JSON.stringify({
          estatePosition: { provided: "R5,740,881", required: "R2,918,036", surplus: "R2,822,845" },
          dependantsPosition: { provided: "R7,822,845", required: "R9,675,356" }
        })
      },
      {
        key: "permanent-disability",
        displayName: "Permanent disability",
        category: "protection",
        hasDetailedSteps: false,
        summaryData: JSON.stringify({
          lumpSumCover: { surplus: "R831,661" },
          incomeCover: { shortfall: "R5,135,026" }
        })
      },
      {
        key: "temporary-disability",
        displayName: "Temporary disability",
        category: "protection",
        hasDetailedSteps: false,
        summaryData: null
      },
      {
        key: "dread-disease",
        displayName: "Dread disease",
        category: "protection",
        hasDetailedSteps: false,
        summaryData: null
      },
      {
        key: "retirement",
        displayName: "Retirement",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: JSON.stringify({
          retirementFunds: { shortfall: "R8,994,312", required: "R27,965,380" }
        })
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
        })
      },
      {
        key: "lump-sum-recurring",
        displayName: "Lump sum and recurring investment",
        category: "investment",
        hasDetailedSteps: false,
        summaryData: null
      },
      {
        key: "portfolio-comparison",
        displayName: "Portfolio comparison tool",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: null
      },
      {
        key: "contribution-income-analysis",
        displayName: "Contribution and income analysis",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: null
      },
      {
        key: "saving-future-need",
        displayName: "Saving for a future need",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: null
      },
      {
        key: "income-from-capital",
        displayName: "Income from capital",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: null
      },
      {
        key: "debt-repayment",
        displayName: "Debt repayment",
        category: "planning",
        hasDetailedSteps: false,
        summaryData: null
      }
    ];
    for (const needData of defaultNeeds) {
      await this.createNeed(needData);
    }
  }
  // Plan Needs methods
  async getPlanNeeds(planId) {
    return await this.db.select().from(planNeeds).where(eq(planNeeds.planId, planId)).orderBy(asc(planNeeds.sortOrder));
  }
  async addNeedToPlan(planNeed) {
    const result = await this.db.insert(planNeeds).values(planNeed).returning();
    return result[0];
  }
  async removeNeedFromPlan(planId, needId) {
    const result = await this.db.delete(planNeeds).where(
      and(eq(planNeeds.planId, planId), eq(planNeeds.needId, needId))
    );
    return (result.rowCount || 0) > 0;
  }
  async removeAllNeedsFromPlan(planId) {
    const result = await this.db.delete(planNeeds).where(eq(planNeeds.planId, planId));
    return (result.rowCount || 0) > 0;
  }
  async updatePlanNeed(id, updates) {
    const result = await this.db.update(planNeeds).set(updates).where(eq(planNeeds.id, id)).returning();
    return result[0];
  }
  async getFinancialPlanWithNeeds(planId) {
    const plan = await this.getFinancialPlan(planId);
    if (!plan) return void 0;
    const planNeedsResults = await this.getPlanNeeds(planId);
    const needs2 = [];
    for (const planNeed of planNeedsResults) {
      const need = await this.getNeed(planNeed.needId);
      if (need) {
        needs2.push(need);
      }
    }
    return { plan, needs: needs2 };
  }
  // Retirement Parameters (one row per plan)
  async getRetirementParameters(planId) {
    const result = await this.db.select().from(retirementParameters).where(eq(retirementParameters.planId, planId));
    return result[0];
  }
  async upsertRetirementParameters(planId, updates) {
    const existing = await this.getRetirementParameters(planId);
    if (existing) {
      const result2 = await this.db.update(retirementParameters).set({ ...updates, planId, lastUpdated: (/* @__PURE__ */ new Date()).toISOString() }).where(eq(retirementParameters.id, existing.id)).returning();
      return result2[0];
    }
    const result = await this.db.insert(retirementParameters).values({
      planId,
      retirementAge: updates.retirementAge ?? 65,
      retirementPlanningAge: updates.retirementPlanningAge ?? 90,
      autoCalculateTax: updates.autoCalculateTax ?? true,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
    }).returning();
    return result[0];
  }
  // Future Inflows
  async getFutureInflows() {
    return await this.db.select().from(futureInflows).orderBy(asc(futureInflows.id));
  }
  async getFutureInflow(id) {
    const result = await this.db.select().from(futureInflows).where(eq(futureInflows.id, id));
    return result[0];
  }
  async createFutureInflow(inflow) {
    const result = await this.db.insert(futureInflows).values(inflow).returning();
    return result[0];
  }
  async updateFutureInflow(id, updates) {
    const result = await this.db.update(futureInflows).set(updates).where(eq(futureInflows.id, id)).returning();
    return result[0];
  }
  async deleteFutureInflow(id) {
    const result = await this.db.delete(futureInflows).where(eq(futureInflows.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Retirement Lump Sum Needs
  async getRetirementLumpSumNeeds() {
    return await this.db.select().from(retirementLumpSumNeeds).orderBy(asc(retirementLumpSumNeeds.id));
  }
  async getRetirementLumpSumNeed(id) {
    const result = await this.db.select().from(retirementLumpSumNeeds).where(eq(retirementLumpSumNeeds.id, id));
    return result[0];
  }
  async createRetirementLumpSumNeed(need) {
    const result = await this.db.insert(retirementLumpSumNeeds).values(need).returning();
    return result[0];
  }
  async updateRetirementLumpSumNeed(id, updates) {
    const result = await this.db.update(retirementLumpSumNeeds).set(updates).where(eq(retirementLumpSumNeeds.id, id)).returning();
    return result[0];
  }
  async deleteRetirementLumpSumNeed(id) {
    const result = await this.db.delete(retirementLumpSumNeeds).where(eq(retirementLumpSumNeeds.id, id));
    return (result.rowCount || 0) > 0;
  }
};
var useDatabase = process.env.DATABASE_URL !== void 0;
var storageInstance;
if (useDatabase) {
  console.log("Using database storage with PostgreSQL");
  storageInstance = new DbStorage();
} else {
  console.log("Using memory storage for development");
  storageInstance = new MemStorage();
}
var storage = storageInstance;

// server/entity-resolver.ts
function entityIdsToNames(entityIds, clientDetails2) {
  return entityIds.map((id) => {
    if (id === 0 || id === -1) return "";
    const entity = clientDetails2.find((c) => c.id === id);
    return entity ? entity.entityName : `Entity #${id}`;
  });
}
function entityNamesToIds(names, clientDetails2) {
  return names.map((name) => {
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName === "" || trimmedName === "enter details ...") {
      return 0;
    }
    const entity = clientDetails2.find(
      (c) => c.entityName.toLowerCase() === trimmedName.toLowerCase()
    );
    return entity ? entity.id : -1;
  });
}

// server/routes/entities.ts
function registerEntityRoutes(app2) {
  app2.post("/api/entities/resolve", async (req, res) => {
    try {
      const { names } = req.body;
      const clientDetails2 = await storage.getClientDetails();
      const entityIds = entityNamesToIds(names, clientDetails2);
      res.json({ entityIds });
    } catch (error) {
      console.error("Error resolving entities:", error);
      res.status(500).json({ message: "Failed to resolve entities" });
    }
  });
  app2.post("/api/entities/names", async (req, res) => {
    try {
      const { entityIds } = req.body;
      const clientDetails2 = await storage.getClientDetails();
      const names = entityIdsToNames(entityIds, clientDetails2);
      res.json({ names });
    } catch (error) {
      console.error("Error converting entity IDs to names:", error);
      res.status(500).json({ message: "Failed to convert entity IDs" });
    }
  });
}

// server/routes/retirement-funds.ts
function registerRetirementFundRoutes(app2) {
  app2.get("/api/retirement-funds", async (req, res) => {
    try {
      const { search } = req.query;
      const funds = search && typeof search === "string" ? await storage.searchRetirementFunds(search) : await storage.getRetirementFunds();
      res.json(funds);
    } catch (error) {
      console.error("Error fetching retirement funds:", error);
      res.status(500).json({ message: "Failed to fetch retirement funds" });
    }
  });
  app2.get("/api/retirement-funds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid fund ID" });
      }
      const fund = await storage.getRetirementFund(id);
      if (!fund) {
        return res.status(404).json({ message: "Retirement fund not found" });
      }
      res.json(fund);
    } catch (error) {
      console.error("Error fetching retirement fund:", error);
      res.status(500).json({ message: "Failed to fetch retirement fund" });
    }
  });
  app2.post("/api/retirement-funds", async (req, res) => {
    try {
      const validatedData = insertRetirementFundSchema.parse(req.body);
      const fund = await storage.createRetirementFund(validatedData);
      res.status(201).json(fund);
    } catch (error) {
      console.error("Error creating retirement fund:", error);
      res.status(400).json({ message: "Invalid fund data" });
    }
  });
  app2.patch("/api/retirement-funds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid fund ID" });
      }
      const validatedData = updateRetirementFundSchema.parse(req.body);
      const fund = await storage.updateRetirementFund(id, validatedData);
      if (!fund) {
        return res.status(404).json({ message: "Retirement fund not found" });
      }
      res.json(fund);
    } catch (error) {
      console.error("Error updating retirement fund:", error);
      res.status(400).json({ message: "Invalid fund data" });
    }
  });
  app2.delete("/api/retirement-funds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid fund ID" });
      }
      const deleted = await storage.deleteRetirementFund(id);
      if (!deleted) {
        return res.status(404).json({ message: "Retirement fund not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting retirement fund:", error);
      res.status(500).json({ message: "Failed to delete retirement fund" });
    }
  });
}

// server/routes/lump-sum-bequests.ts
function registerLumpSumBequestRoutes(app2) {
  app2.get("/api/lump-sum-bequests", async (req, res) => {
    try {
      const { search } = req.query;
      const bequests = search && typeof search === "string" ? await storage.searchLumpSumBequests(search) : await storage.getLumpSumBequests();
      res.json(bequests);
    } catch (error) {
      console.error("Error fetching lump sum bequests:", error);
      res.status(500).json({ message: "Failed to fetch lump sum bequests" });
    }
  });
  app2.get("/api/lump-sum-bequests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bequest ID" });
      }
      const bequest = await storage.getLumpSumBequest(id);
      if (!bequest) {
        return res.status(404).json({ message: "Lump sum bequest not found" });
      }
      res.json(bequest);
    } catch (error) {
      console.error("Error fetching lump sum bequest:", error);
      res.status(500).json({ message: "Failed to fetch lump sum bequest" });
    }
  });
  app2.post("/api/lump-sum-bequests", async (req, res) => {
    try {
      const validatedData = insertLumpSumBequestSchema.parse(req.body);
      const bequest = await storage.createLumpSumBequest(validatedData);
      res.status(201).json(bequest);
    } catch (error) {
      console.error("Error creating lump sum bequest:", error);
      res.status(400).json({ message: "Invalid bequest data" });
    }
  });
  app2.patch("/api/lump-sum-bequests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bequest ID" });
      }
      const validatedData = updateLumpSumBequestSchema.parse(req.body);
      const bequest = await storage.updateLumpSumBequest(id, validatedData);
      if (!bequest) {
        return res.status(404).json({ message: "Lump sum bequest not found" });
      }
      res.json(bequest);
    } catch (error) {
      console.error("Error updating lump sum bequest:", error);
      res.status(400).json({ message: "Invalid bequest data" });
    }
  });
  app2.delete("/api/lump-sum-bequests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bequest ID" });
      }
      const deleted = await storage.deleteLumpSumBequest(id);
      if (!deleted) {
        return res.status(404).json({ message: "Lump sum bequest not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting lump sum bequest:", error);
      res.status(500).json({ message: "Failed to delete lump sum bequest" });
    }
  });
}

// server/routes/assurance.ts
function registerAssuranceRoutes(app2) {
  app2.get("/api/assurance", async (req, res) => {
    try {
      const { search } = req.query;
      const policies = search && typeof search === "string" ? await storage.searchAssurance(search) : await storage.getAssurance();
      res.json(policies);
    } catch (error) {
      console.error("Error fetching assurance policies:", error);
      res.status(500).json({ message: "Failed to fetch assurance policies" });
    }
  });
  app2.get("/api/assurance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid assurance policy ID" });
      }
      const policy = await storage.getAssuranceById(id);
      if (!policy) {
        return res.status(404).json({ message: "Assurance policy not found" });
      }
      res.json(policy);
    } catch (error) {
      console.error("Error fetching assurance policy:", error);
      res.status(500).json({ message: "Failed to fetch assurance policy" });
    }
  });
  app2.post("/api/assurance", async (req, res) => {
    try {
      const validatedData = insertAssuranceSchema.parse(req.body);
      const policy = await storage.createAssurance(validatedData);
      res.status(201).json(policy);
    } catch (error) {
      console.error("Error creating assurance policy:", error);
      res.status(400).json({ message: "Invalid assurance policy data" });
    }
  });
  app2.patch("/api/assurance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid assurance policy ID" });
      }
      const validatedData = updateAssuranceSchema.parse(req.body);
      const policy = await storage.updateAssurance(id, validatedData);
      if (!policy) {
        return res.status(404).json({ message: "Assurance policy not found" });
      }
      res.json(policy);
    } catch (error) {
      console.error("Error updating assurance policy:", error);
      res.status(400).json({ message: "Invalid assurance policy data" });
    }
  });
  app2.delete("/api/assurance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid assurance policy ID" });
      }
      const success = await storage.deleteAssurance(id);
      if (!success) {
        return res.status(404).json({ message: "Assurance policy not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting assurance policy:", error);
      res.status(500).json({ message: "Failed to delete assurance policy" });
    }
  });
}

// server/routes/defined-benefit-funds.ts
function registerDefinedBenefitFundRoutes(app2) {
  app2.get("/api/defined-benefit-funds", async (req, res) => {
    try {
      const { search } = req.query;
      const funds = search && typeof search === "string" ? await storage.searchDefinedBenefitFunds(search) : await storage.getDefinedBenefitFunds();
      res.json(funds);
    } catch (error) {
      console.error("Error fetching defined benefit funds:", error);
      res.status(500).json({ message: "Failed to fetch defined benefit funds" });
    }
  });
  app2.get("/api/defined-benefit-funds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid fund ID" });
      }
      const fund = await storage.getDefinedBenefitFund(id);
      if (!fund) {
        return res.status(404).json({ message: "Defined benefit fund not found" });
      }
      res.json(fund);
    } catch (error) {
      console.error("Error fetching defined benefit fund:", error);
      res.status(500).json({ message: "Failed to fetch defined benefit fund" });
    }
  });
  app2.post("/api/defined-benefit-funds", async (req, res) => {
    try {
      const validatedData = insertDefinedBenefitFundSchema.parse(req.body);
      const fund = await storage.createDefinedBenefitFund(validatedData);
      res.status(201).json(fund);
    } catch (error) {
      console.error("Error creating defined benefit fund:", error);
      res.status(400).json({ message: "Invalid defined benefit fund data" });
    }
  });
  app2.patch("/api/defined-benefit-funds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid fund ID" });
      }
      const validatedData = updateDefinedBenefitFundSchema.parse(req.body);
      const fund = await storage.updateDefinedBenefitFund(id, validatedData);
      if (!fund) {
        return res.status(404).json({ message: "Defined benefit fund not found" });
      }
      res.json(fund);
    } catch (error) {
      console.error("Error updating defined benefit fund:", error);
      res.status(400).json({ message: "Invalid defined benefit fund data" });
    }
  });
  app2.delete("/api/defined-benefit-funds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid fund ID" });
      }
      const success = await storage.deleteDefinedBenefitFund(id);
      if (!success) {
        return res.status(404).json({ message: "Defined benefit fund not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting defined benefit fund:", error);
      res.status(500).json({ message: "Failed to delete defined benefit fund" });
    }
  });
}

// server/routes/voluntary-investments.ts
function registerVoluntaryInvestmentRoutes(app2) {
  app2.get("/api/voluntary-investments", async (req, res) => {
    try {
      const { search } = req.query;
      const investments = search && typeof search === "string" ? await storage.searchVoluntaryInvestments(search) : await storage.getVoluntaryInvestments();
      res.json(investments);
    } catch (error) {
      console.error("Error fetching voluntary investments:", error);
      res.status(500).json({ message: "Failed to fetch voluntary investments" });
    }
  });
  app2.get("/api/voluntary-investments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid investment ID" });
      }
      const investment = await storage.getVoluntaryInvestment(id);
      if (!investment) {
        return res.status(404).json({ message: "Voluntary investment not found" });
      }
      res.json(investment);
    } catch (error) {
      console.error("Error fetching voluntary investment:", error);
      res.status(500).json({ message: "Failed to fetch voluntary investment" });
    }
  });
  app2.post("/api/voluntary-investments", async (req, res) => {
    try {
      const validatedData = insertVoluntaryInvestmentSchema.parse(req.body);
      const investment = await storage.createVoluntaryInvestment(validatedData);
      res.status(201).json(investment);
    } catch (error) {
      console.error("Error creating voluntary investment:", error);
      const message = error instanceof Error ? error.message : "Invalid voluntary investment data";
      res.status(400).json({ message });
    }
  });
  app2.patch("/api/voluntary-investments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid investment ID" });
      }
      const validatedData = updateVoluntaryInvestmentSchema.parse(req.body);
      const investment = await storage.updateVoluntaryInvestment(id, validatedData);
      if (!investment) {
        return res.status(404).json({ message: "Voluntary investment not found" });
      }
      res.json(investment);
    } catch (error) {
      console.error("Error updating voluntary investment:", error);
      res.status(400).json({ message: "Invalid voluntary investment data" });
    }
  });
  app2.delete("/api/voluntary-investments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid investment ID" });
      }
      const success = await storage.deleteVoluntaryInvestment(id);
      if (!success) {
        return res.status(404).json({ message: "Voluntary investment not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting voluntary investment:", error);
      res.status(500).json({ message: "Failed to delete voluntary investment" });
    }
  });
}

// server/routes/income-needs.ts
function registerIncomeNeedsRoutes(app2) {
  app2.get("/api/income-needs", async (req, res) => {
    try {
      const { search } = req.query;
      const needs2 = search && typeof search === "string" ? await storage.searchIncomeNeeds(search) : await storage.getIncomeNeeds();
      res.json(needs2);
    } catch (error) {
      console.error("Error fetching income needs:", error);
      res.status(500).json({ message: "Failed to fetch income needs" });
    }
  });
  app2.get("/api/income-needs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid need ID" });
      }
      const need = await storage.getIncomeNeed(id);
      if (!need) {
        return res.status(404).json({ message: "Income need not found" });
      }
      res.json(need);
    } catch (error) {
      console.error("Error fetching income need:", error);
      res.status(500).json({ message: "Failed to fetch income need" });
    }
  });
  app2.post("/api/income-needs", async (req, res) => {
    try {
      const validatedData = insertIncomeNeedsSchema.parse(req.body);
      const need = await storage.createIncomeNeed(validatedData);
      res.status(201).json(need);
    } catch (error) {
      console.error("Error creating income need:", error);
      res.status(400).json({ message: "Invalid income need data" });
    }
  });
  app2.patch("/api/income-needs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid need ID" });
      }
      const validatedData = updateIncomeNeedsSchema.parse(req.body);
      const need = await storage.updateIncomeNeed(id, validatedData);
      if (!need) {
        return res.status(404).json({ message: "Income need not found" });
      }
      res.json(need);
    } catch (error) {
      console.error("Error updating income need:", error);
      res.status(400).json({ message: "Invalid income need data" });
    }
  });
  app2.delete("/api/income-needs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid need ID" });
      }
      const success = await storage.deleteIncomeNeed(id);
      if (!success) {
        return res.status(404).json({ message: "Income need not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting income need:", error);
      res.status(500).json({ message: "Failed to delete income need" });
    }
  });
}

// server/routes/income-provisions.ts
function registerIncomeProvisionsRoutes(app2) {
  app2.get("/api/income-provisions", async (req, res) => {
    try {
      const { search } = req.query;
      const provisions = search && typeof search === "string" ? await storage.searchIncomeProvisions(search) : await storage.getIncomeProvisions();
      res.json(provisions);
    } catch (error) {
      console.error("Error fetching income provisions:", error);
      res.status(500).json({ message: "Failed to fetch income provisions" });
    }
  });
  app2.get("/api/income-provisions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid provision ID" });
      }
      const provision = await storage.getIncomeProvision(id);
      if (!provision) {
        return res.status(404).json({ message: "Income provision not found" });
      }
      res.json(provision);
    } catch (error) {
      console.error("Error fetching income provision:", error);
      res.status(500).json({ message: "Failed to fetch income provision" });
    }
  });
  app2.post("/api/income-provisions", async (req, res) => {
    try {
      const validatedData = insertIncomeProvisionsSchema.parse(req.body);
      const provision = await storage.createIncomeProvision(validatedData);
      res.status(201).json(provision);
    } catch (error) {
      console.error("Error creating income provision:", error);
      res.status(400).json({ message: "Invalid income provision data" });
    }
  });
  app2.patch("/api/income-provisions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid provision ID" });
      }
      const validatedData = updateIncomeProvisionsSchema.parse(req.body);
      const provision = await storage.updateIncomeProvision(id, validatedData);
      if (!provision) {
        return res.status(404).json({ message: "Income provision not found" });
      }
      res.json(provision);
    } catch (error) {
      console.error("Error updating income provision:", error);
      res.status(400).json({ message: "Invalid income provision data" });
    }
  });
  app2.delete("/api/income-provisions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid provision ID" });
      }
      const success = await storage.deleteIncomeProvision(id);
      if (!success) {
        return res.status(404).json({ message: "Income provision not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting income provision:", error);
      res.status(500).json({ message: "Failed to delete income provision" });
    }
  });
}

// server/routes/residue.ts
function registerResidueRoutes(app2) {
  app2.get("/api/residue", async (req, res) => {
    try {
      const { search } = req.query;
      const items = search && typeof search === "string" ? await storage.searchResidue(search) : await storage.getResidue();
      res.json(items);
    } catch (error) {
      console.error("Error fetching residue:", error);
      res.status(500).json({ message: "Failed to fetch residue" });
    }
  });
  app2.get("/api/residue/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid residue ID" });
      }
      const item = await storage.getResidueItem(id);
      if (!item) {
        return res.status(404).json({ message: "Residue item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching residue item:", error);
      res.status(500).json({ message: "Failed to fetch residue item" });
    }
  });
  app2.post("/api/residue", async (req, res) => {
    try {
      const validatedData = insertResidueSchema.parse(req.body);
      const item = await storage.createResidueItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating residue item:", error);
      res.status(400).json({ message: "Invalid residue data" });
    }
  });
  app2.patch("/api/residue/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid residue ID" });
      }
      const validatedData = updateResidueSchema.parse(req.body);
      const item = await storage.updateResidueItem(id, validatedData);
      if (!item) {
        return res.status(404).json({ message: "Residue item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating residue item:", error);
      res.status(400).json({ message: "Invalid residue data" });
    }
  });
  app2.delete("/api/residue/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid residue ID" });
      }
      const success = await storage.deleteResidueItem(id);
      if (!success) {
        return res.status(404).json({ message: "Residue item not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting residue item:", error);
      res.status(500).json({ message: "Failed to delete residue item" });
    }
  });
}

// server/routes/additional-estate-duty-items.ts
function registerAdditionalEstateDutyItemRoutes(app2) {
  app2.get("/api/additional-estate-duty-items", async (req, res) => {
    try {
      const { search } = req.query;
      const items = search && typeof search === "string" ? await storage.searchAdditionalEstateDutyItems(search) : await storage.getAdditionalEstateDutyItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching additional estate duty items:", error);
      res.status(500).json({ message: "Failed to fetch additional estate duty items" });
    }
  });
  app2.get("/api/additional-estate-duty-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid estate duty item ID" });
      }
      const item = await storage.getAdditionalEstateDutyItem(id);
      if (!item) {
        return res.status(404).json({ message: "Additional estate duty item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching additional estate duty item:", error);
      res.status(500).json({ message: "Failed to fetch additional estate duty item" });
    }
  });
  app2.post("/api/additional-estate-duty-items", async (req, res) => {
    try {
      const validatedData = insertAdditionalEstateDutyItemsSchema.parse(req.body);
      const item = await storage.createAdditionalEstateDutyItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating additional estate duty item:", error);
      res.status(400).json({ message: "Invalid additional estate duty item data" });
    }
  });
  app2.patch("/api/additional-estate-duty-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid estate duty item ID" });
      }
      const validatedData = updateAdditionalEstateDutyItemsSchema.parse(req.body);
      const item = await storage.updateAdditionalEstateDutyItem(id, validatedData);
      if (!item) {
        return res.status(404).json({ message: "Additional estate duty item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating additional estate duty item:", error);
      res.status(400).json({ message: "Invalid additional estate duty item data" });
    }
  });
  app2.delete("/api/additional-estate-duty-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid estate duty item ID" });
      }
      const success = await storage.deleteAdditionalEstateDutyItem(id);
      if (!success) {
        return res.status(404).json({ message: "Additional estate duty item not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting additional estate duty item:", error);
      res.status(500).json({ message: "Failed to delete additional estate duty item" });
    }
  });
}

// server/routes/liabilities.ts
function registerLiabilitiesRoutes(app2) {
  app2.get("/api/liabilities", async (req, res) => {
    try {
      const { search } = req.query;
      const liabilities2 = search && typeof search === "string" ? await storage.searchLiabilities(search) : await storage.getLiabilities();
      res.json(liabilities2);
    } catch (error) {
      console.error("Error fetching liabilities:", error);
      res.status(500).json({ message: "Failed to fetch liabilities" });
    }
  });
  app2.get("/api/liabilities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid liability ID" });
      }
      const liability = await storage.getLiability(id);
      if (!liability) {
        return res.status(404).json({ message: "Liability not found" });
      }
      res.json(liability);
    } catch (error) {
      console.error("Error fetching liability:", error);
      res.status(500).json({ message: "Failed to fetch liability" });
    }
  });
  app2.post("/api/liabilities", async (req, res) => {
    try {
      const validatedData = insertLiabilitiesSchema.parse(req.body);
      const liability = await storage.createLiability(validatedData);
      res.status(201).json(liability);
    } catch (error) {
      console.error("Error creating liability:", error);
      res.status(400).json({ message: "Invalid liability data" });
    }
  });
  app2.patch("/api/liabilities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid liability ID" });
      }
      const validatedData = updateLiabilitiesSchema.parse(req.body);
      const liability = await storage.updateLiability(id, validatedData);
      if (!liability) {
        return res.status(404).json({ message: "Liability not found" });
      }
      res.json(liability);
    } catch (error) {
      console.error("Error updating liability:", error);
      res.status(400).json({ message: "Invalid liability data" });
    }
  });
  app2.delete("/api/liabilities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid liability ID" });
      }
      const success = await storage.deleteLiability(id);
      if (!success) {
        return res.status(404).json({ message: "Liability not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting liability:", error);
      res.status(500).json({ message: "Failed to delete liability" });
    }
  });
}

// server/routes/assets.ts
function registerAssetsRoutes(app2) {
  app2.get("/api/assets", async (req, res) => {
    try {
      const { search } = req.query;
      const assets2 = search && typeof search === "string" ? await storage.searchAssets(search) : await storage.getAssets();
      res.json(assets2);
    } catch (error) {
      console.error("Error fetching assets:", error);
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });
  app2.get("/api/assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid asset ID" });
      }
      const asset = await storage.getAsset(id);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      console.error("Error fetching asset:", error);
      res.status(500).json({ message: "Failed to fetch asset" });
    }
  });
  app2.post("/api/assets", async (req, res) => {
    try {
      const validatedData = insertAssetsSchema.parse(req.body);
      const asset = await storage.createAsset(validatedData);
      res.status(201).json(asset);
    } catch (error) {
      console.error("Error creating asset:", error);
      res.status(400).json({ message: "Invalid asset data" });
    }
  });
  app2.patch("/api/assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid asset ID" });
      }
      const validatedData = insertAssetsSchema.partial().parse(req.body);
      const asset = await storage.updateAsset(id, validatedData);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      console.error("Error updating asset:", error);
      res.status(400).json({ message: "Invalid asset data" });
    }
  });
  app2.delete("/api/assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid asset ID" });
      }
      const success = await storage.deleteAsset(id);
      if (!success) {
        return res.status(404).json({ message: "Asset not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting asset:", error);
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });
}

// server/routes/client-details.ts
function registerClientDetailsRoutes(app2) {
  app2.get("/api/client-details", async (req, res) => {
    try {
      const clientDetails2 = await storage.getClientDetails();
      res.json(clientDetails2);
    } catch (error) {
      console.error("Error fetching client details:", error);
      res.status(500).json({ message: "Failed to fetch client details" });
    }
  });
  app2.post("/api/client-details", async (req, res) => {
    try {
      const validatedData = insertClientDetailsSchema.parse(req.body);
      const clientDetail = await storage.createClientDetail(validatedData);
      res.status(201).json(clientDetail);
    } catch (error) {
      console.error("Error creating client detail:", error);
      res.status(400).json({ message: "Invalid client detail data" });
    }
  });
  app2.patch("/api/client-details/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client detail ID" });
      }
      const updates = req.body;
      const clientDetail = await storage.updateClientDetail(id, updates);
      res.json(clientDetail);
    } catch (error) {
      console.error("Error updating client detail:", error);
      res.status(400).json({ message: "Invalid client detail data" });
    }
  });
  app2.delete("/api/client-details/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client detail ID" });
      }
      await storage.deleteClientDetail(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting client detail:", error);
      res.status(500).json({ message: "Failed to delete client detail" });
    }
  });
}

// server/routes/estate-position-parameters.ts
function registerEstatePositionParameterRoutes(app2) {
  app2.get("/api/estate-position-parameters", async (req, res) => {
    try {
      const parameters = await storage.getOrCreateEstatePositionParameter();
      res.json(parameters);
    } catch (error) {
      console.error("Error fetching estate position parameters:", error);
      res.status(500).json({ message: "Failed to fetch estate position parameters" });
    }
  });
  app2.patch("/api/estate-position-parameters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid parameter ID" });
      }
      const validatedData = updateEstatePositionParametersSchema.parse(req.body);
      const updatesWithTimestamp = {
        ...validatedData,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      };
      const parameter = await storage.updateEstatePositionParameter(id, updatesWithTimestamp);
      res.json(parameter);
    } catch (error) {
      console.error("Error updating estate position parameters:", error);
      res.status(400).json({ message: "Invalid parameter data" });
    }
  });
}

// server/routes/financial-plans.ts
function registerFinancialPlanRoutes(app2) {
  app2.get("/api/financial-plans", async (req, res) => {
    try {
      const { search } = req.query;
      const plans = search && typeof search === "string" ? await storage.searchFinancialPlans(search) : await storage.getFinancialPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching financial plans:", error);
      res.status(500).json({ message: "Failed to fetch financial plans" });
    }
  });
  app2.get("/api/financial-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }
      const plan = await storage.getFinancialPlan(id);
      if (!plan) {
        return res.status(404).json({ message: "Financial plan not found" });
      }
      res.json(plan);
    } catch (error) {
      console.error("Error fetching financial plan:", error);
      res.status(500).json({ message: "Failed to fetch financial plan" });
    }
  });
  app2.get("/api/financial-plans/:id/with-needs", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }
      const planWithNeeds = await storage.getFinancialPlanWithNeeds(id);
      if (!planWithNeeds) {
        return res.status(404).json({ message: "Financial plan not found" });
      }
      res.json(planWithNeeds);
    } catch (error) {
      console.error("Error fetching financial plan with needs:", error);
      res.status(500).json({ message: "Failed to fetch financial plan with needs" });
    }
  });
  app2.post("/api/financial-plans", async (req, res) => {
    try {
      const validatedData = insertFinancialPlanSchema.parse(req.body);
      const plan = await storage.createFinancialPlan(validatedData);
      res.status(201).json(plan);
    } catch (error) {
      console.error("Error creating financial plan:", error);
      res.status(400).json({ message: "Invalid financial plan data" });
    }
  });
  app2.patch("/api/financial-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }
      const validatedData = updateFinancialPlanSchema.parse(req.body);
      const plan = await storage.updateFinancialPlan(id, validatedData);
      if (!plan) {
        return res.status(404).json({ message: "Financial plan not found" });
      }
      res.json(plan);
    } catch (error) {
      console.error("Error updating financial plan:", error);
      res.status(400).json({ message: "Invalid financial plan data" });
    }
  });
  app2.delete("/api/financial-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }
      const deleted = await storage.deleteFinancialPlan(id);
      if (!deleted) {
        return res.status(404).json({ message: "Financial plan not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting financial plan:", error);
      res.status(500).json({ message: "Failed to delete financial plan" });
    }
  });
}

// server/routes/needs.ts
function registerNeedsRoutes(app2) {
  app2.get("/api/needs", async (req, res) => {
    try {
      const needs2 = await storage.getNeeds();
      res.json(needs2);
    } catch (error) {
      console.error("Error fetching needs:", error);
      res.status(500).json({ message: "Failed to fetch needs" });
    }
  });
  app2.get("/api/needs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid need ID" });
      }
      const need = await storage.getNeed(id);
      if (!need) {
        return res.status(404).json({ message: "Need not found" });
      }
      res.json(need);
    } catch (error) {
      console.error("Error fetching need:", error);
      res.status(500).json({ message: "Failed to fetch need" });
    }
  });
  app2.post("/api/financial-plans/:planId/needs", async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      if (isNaN(planId)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }
      const { needId, sortOrder } = req.body;
      const planNeedData = insertPlanNeedSchema.parse({
        planId,
        needId,
        sortOrder: sortOrder || 0
      });
      const planNeed = await storage.addNeedToPlan(planNeedData);
      res.status(201).json(planNeed);
    } catch (error) {
      console.error("Error adding need to plan:", error);
      res.status(400).json({ message: "Invalid plan need data" });
    }
  });
  app2.delete("/api/financial-plans/:planId/needs/:needId", async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      const needId = parseInt(req.params.needId);
      if (isNaN(planId) || isNaN(needId)) {
        return res.status(400).json({ message: "Invalid plan ID or need ID" });
      }
      const deleted = await storage.removeNeedFromPlan(planId, needId);
      if (!deleted) {
        return res.status(404).json({ message: "Plan need relationship not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error removing need from plan:", error);
      res.status(500).json({ message: "Failed to remove need from plan" });
    }
  });
  app2.put("/api/financial-plans/:planId/needs", async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      if (isNaN(planId)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }
      const { needKeys } = req.body;
      if (!Array.isArray(needKeys)) {
        return res.status(400).json({ message: "needKeys must be an array" });
      }
      const allNeeds = await storage.getNeeds();
      const validNeedKeys = allNeeds.map((need) => need.key);
      const invalidKeys = needKeys.filter((key) => !validNeedKeys.includes(key));
      if (invalidKeys.length > 0) {
        return res.status(400).json({ message: `Invalid need keys: ${invalidKeys.join(", ")}` });
      }
      const needsToAdd = allNeeds.filter((need) => needKeys.includes(need.key));
      await storage.removeAllNeedsFromPlan(planId);
      for (let i = 0; i < needsToAdd.length; i++) {
        const need = needsToAdd[i];
        const planNeedData = insertPlanNeedSchema.parse({
          planId,
          needId: need.id,
          sortOrder: i
        });
        await storage.addNeedToPlan(planNeedData);
      }
      res.json({ message: "Plan needs updated successfully" });
    } catch (error) {
      console.error("Error updating plan needs:", error);
      res.status(500).json({ message: "Failed to update plan needs" });
    }
  });
}

// server/routes/retirement-parameters.ts
function registerRetirementParametersRoutes(app2) {
  app2.get("/api/retirement-parameters/:planId", async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      if (isNaN(planId)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }
      const params = await storage.getRetirementParameters(planId);
      res.json(params ?? { planId, retirementAge: 65, retirementPlanningAge: 90, autoCalculateTax: true, currentAnnualIncome: "R 0" });
    } catch (error) {
      console.error("Error fetching retirement parameters:", error);
      res.status(500).json({ message: "Failed to fetch retirement parameters" });
    }
  });
  app2.put("/api/retirement-parameters/:planId", async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      if (isNaN(planId)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }
      const validated = updateRetirementParametersSchema.parse(req.body);
      const params = await storage.upsertRetirementParameters(planId, validated);
      res.json(params);
    } catch (error) {
      console.error("Error saving retirement parameters:", error);
      res.status(400).json({ message: "Invalid retirement parameters data" });
    }
  });
}

// server/routes/future-inflows.ts
function registerFutureInflowRoutes(app2) {
  app2.get("/api/future-inflows", async (_req, res) => {
    try {
      const inflows = await storage.getFutureInflows();
      res.json(inflows);
    } catch (error) {
      console.error("Error fetching future inflows:", error);
      res.status(500).json({ message: "Failed to fetch future inflows" });
    }
  });
  app2.get("/api/future-inflows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inflow ID" });
      }
      const inflow = await storage.getFutureInflow(id);
      if (!inflow) {
        return res.status(404).json({ message: "Future inflow not found" });
      }
      res.json(inflow);
    } catch (error) {
      console.error("Error fetching future inflow:", error);
      res.status(500).json({ message: "Failed to fetch future inflow" });
    }
  });
  app2.post("/api/future-inflows", async (req, res) => {
    try {
      const validated = insertFutureInflowSchema.parse(req.body);
      const inflow = await storage.createFutureInflow(validated);
      res.status(201).json(inflow);
    } catch (error) {
      console.error("Error creating future inflow:", error);
      res.status(400).json({ message: "Invalid future inflow data" });
    }
  });
  app2.patch("/api/future-inflows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inflow ID" });
      }
      const validated = updateFutureInflowSchema.parse(req.body);
      const inflow = await storage.updateFutureInflow(id, validated);
      if (!inflow) {
        return res.status(404).json({ message: "Future inflow not found" });
      }
      res.json(inflow);
    } catch (error) {
      console.error("Error updating future inflow:", error);
      res.status(400).json({ message: "Invalid future inflow data" });
    }
  });
  app2.delete("/api/future-inflows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inflow ID" });
      }
      const success = await storage.deleteFutureInflow(id);
      if (!success) {
        return res.status(404).json({ message: "Future inflow not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting future inflow:", error);
      res.status(500).json({ message: "Failed to delete future inflow" });
    }
  });
}

// server/routes/retirement-lump-sum-needs.ts
function registerRetirementLumpSumNeedRoutes(app2) {
  app2.get("/api/retirement-lump-sum-needs", async (_req, res) => {
    try {
      const items = await storage.getRetirementLumpSumNeeds();
      res.json(items);
    } catch (error) {
      console.error("Error fetching retirement lump sum needs:", error);
      res.status(500).json({ message: "Failed to fetch retirement lump sum needs" });
    }
  });
  app2.get("/api/retirement-lump-sum-needs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid need ID" });
      }
      const item = await storage.getRetirementLumpSumNeed(id);
      if (!item) {
        return res.status(404).json({ message: "Retirement lump sum need not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching retirement lump sum need:", error);
      res.status(500).json({ message: "Failed to fetch retirement lump sum need" });
    }
  });
  app2.post("/api/retirement-lump-sum-needs", async (req, res) => {
    try {
      const validated = insertRetirementLumpSumNeedSchema.parse(req.body);
      const item = await storage.createRetirementLumpSumNeed(validated);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating retirement lump sum need:", error);
      res.status(400).json({ message: "Invalid retirement lump sum need data" });
    }
  });
  app2.patch("/api/retirement-lump-sum-needs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid need ID" });
      }
      const validated = updateRetirementLumpSumNeedSchema.parse(req.body);
      const item = await storage.updateRetirementLumpSumNeed(id, validated);
      if (!item) {
        return res.status(404).json({ message: "Retirement lump sum need not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating retirement lump sum need:", error);
      res.status(400).json({ message: "Invalid retirement lump sum need data" });
    }
  });
  app2.delete("/api/retirement-lump-sum-needs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid need ID" });
      }
      const success = await storage.deleteRetirementLumpSumNeed(id);
      if (!success) {
        return res.status(404).json({ message: "Retirement lump sum need not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting retirement lump sum need:", error);
      res.status(500).json({ message: "Failed to delete retirement lump sum need" });
    }
  });
}

// shared/sa-tax.ts
var BRACKETS_2025_2026 = [
  { upTo: 237100, base: 0, rate: 0.18, threshold: 0 },
  { upTo: 370500, base: 42678, rate: 0.26, threshold: 237100 },
  { upTo: 512800, base: 77362, rate: 0.31, threshold: 370500 },
  { upTo: 673e3, base: 121475, rate: 0.36, threshold: 512800 },
  { upTo: 857900, base: 179147, rate: 0.39, threshold: 673e3 },
  { upTo: 1817e3, base: 251258, rate: 0.41, threshold: 857900 },
  { upTo: Infinity, base: 644489, rate: 0.45, threshold: 1817e3 }
];
var RA_DEDUCTION_RATE = 0.275;
var RA_DEDUCTION_ANNUAL_CAP = 35e4;
function marginalTaxRate(opts) {
  const income = Math.max(0, opts.annualTaxableIncome);
  return BRACKETS_2025_2026.find((b) => income <= b.upTo).rate;
}
function raDeductionCap(opts) {
  const income = Math.max(0, opts.annualTaxableIncome);
  return Math.min(income * RA_DEDUCTION_RATE, RA_DEDUCTION_ANNUAL_CAP);
}
function allocateAdditionalContribution(opts) {
  const additional = Math.max(0, opts.additionalMonthlyContribution);
  const currentAnnualRa = Math.max(0, opts.currentMonthlyRaContribution) * 12;
  const cap = raDeductionCap({ annualTaxableIncome: opts.annualTaxableIncome });
  const roomBefore = Math.max(0, cap - currentAnnualRa);
  const additionalAnnual = additional * 12;
  const allocatedToRaAnnual = Math.min(additionalAnnual, roomBefore);
  const allocatedToVoluntaryAnnual = additionalAnnual - allocatedToRaAnnual;
  const rate = marginalTaxRate({ annualTaxableIncome: opts.annualTaxableIncome });
  return {
    raMonthly: allocatedToRaAnnual / 12,
    voluntaryMonthly: allocatedToVoluntaryAnnual / 12,
    raAnnualDeduction: allocatedToRaAnnual,
    raDeductionCap: cap,
    raRoomRemainingBefore: roomBefore,
    marginalRate: rate,
    annualTaxSavingFromTopUp: allocatedToRaAnnual * rate
  };
}

// shared/retirement-calculations.ts
function parseAmount(value) {
  if (!value) return 0;
  const cleaned = String(value).replace(/[^\d.-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}
function parsePercent(value) {
  return parseAmount(value) / 100;
}
function parseYears(value) {
  return parseAmount(value);
}
function projectFundForward(opts) {
  const { currentValue, monthlyContribution, contributionEscalation, growthRate, yearsToRetirement } = opts;
  if (yearsToRetirement <= 0) return currentValue;
  const fvLumpSum = currentValue * Math.pow(1 + growthRate, yearsToRetirement);
  if (monthlyContribution <= 0) return fvLumpSum;
  const annualContribution = monthlyContribution * 12;
  let fvAnnuity;
  if (Math.abs(growthRate - contributionEscalation) < 1e-9) {
    fvAnnuity = annualContribution * yearsToRetirement * Math.pow(1 + growthRate, yearsToRetirement - 1);
  } else {
    fvAnnuity = annualContribution * (Math.pow(1 + growthRate, yearsToRetirement) - Math.pow(1 + contributionEscalation, yearsToRetirement)) / (growthRate - contributionEscalation);
  }
  return fvLumpSum + fvAnnuity;
}
function discountToCurrentTerms(opts) {
  const { futureValue, discountRate, years } = opts;
  if (years <= 0) return futureValue;
  return futureValue / Math.pow(1 + discountRate, years);
}
function presentValueGrowingAnnuity(opts) {
  const { paymentPerPeriod, escalation, discount, termYears, periodsPerYear } = opts;
  if (paymentPerPeriod <= 0 || termYears <= 0 || periodsPerYear <= 0) return 0;
  const totalPeriods = termYears * periodsPerYear;
  const periodicDiscount = discount / periodsPerYear;
  const periodicEscalation = escalation / periodsPerYear;
  if (Math.abs(periodicDiscount - periodicEscalation) < 1e-9) {
    return paymentPerPeriod * totalPeriods;
  }
  const ratio = (1 + periodicEscalation) / (1 + periodicDiscount);
  return paymentPerPeriod * (1 - Math.pow(ratio, totalPeriods)) / (periodicDiscount - periodicEscalation);
}
function dbPensionToCapitalEquivalent(opts) {
  return presentValueGrowingAnnuity({
    paymentPerPeriod: opts.monthlyIncome,
    escalation: opts.escalation,
    discount: opts.realReturn,
    termYears: opts.yearsAfterRetirement,
    periodsPerYear: 12
  });
}
function requiredCapitalForIncome(opts) {
  const periodsPerYear = opts.frequency === "monthly" ? 12 : opts.frequency === "quarterly" ? 4 : 1;
  const taxable = opts.taxableFraction ?? 0;
  const tax = opts.taxRate ?? 0;
  const grossingFactor = 1 - taxable * tax;
  const grossPayment = grossingFactor > 0 ? opts.monthlyAmount / grossingFactor : opts.monthlyAmount;
  return presentValueGrowingAnnuity({
    paymentPerPeriod: grossPayment,
    escalation: opts.escalation,
    discount: opts.realReturn,
    termYears: opts.termYears,
    periodsPerYear
  });
}
function projectFutureInflow(opts) {
  const future = opts.currentValue * Math.pow(1 + opts.growthRate, Math.max(0, opts.yearsAfterRetirement));
  if (!opts.calculateCgt) return future;
  const gain = Math.max(0, future - opts.currentValue);
  return future - gain * 0.18;
}
function additionalMonthlyContribution(opts) {
  const { shortfallAtRetirement, growthRate, contributionEscalation, yearsToRetirement } = opts;
  if (shortfallAtRetirement <= 0 || yearsToRetirement <= 0) return 0;
  let annuityFactor;
  if (Math.abs(growthRate - contributionEscalation) < 1e-9) {
    annuityFactor = yearsToRetirement * Math.pow(1 + growthRate, yearsToRetirement - 1);
  } else {
    annuityFactor = (Math.pow(1 + growthRate, yearsToRetirement) - Math.pow(1 + contributionEscalation, yearsToRetirement)) / (growthRate - contributionEscalation);
  }
  if (annuityFactor <= 0) return 0;
  const requiredAnnual = shortfallAtRetirement / annuityFactor;
  return requiredAnnual / 12;
}
var DEFAULT_INFLATION = 0.06;
function computeRetirementProjection(input) {
  const ready = !!input.parameters && (input.clientAge ?? 0) > 0;
  const params = input.parameters ?? { retirementAge: 65, retirementPlanningAge: 90 };
  const yearsToRetirement = Math.max(0, params.retirementAge - (input.clientAge || 0));
  const yearsAfterRetirement = Math.max(0, params.retirementPlanningAge - params.retirementAge);
  const inflation = DEFAULT_INFLATION;
  const retirementFundProjections = input.retirementFunds.map((f) => {
    const capital = projectFundForward({
      currentValue: parseAmount(f.fundValue),
      monthlyContribution: parseAmount(f.monthlyContribution),
      contributionEscalation: parsePercent(f.contributionEscalation),
      growthRate: parsePercent(f.growthRate),
      yearsToRetirement
    });
    return {
      id: f.id,
      description: f.description ?? "",
      capitalAtRetirement: capital,
      valueInCurrentTerms: discountToCurrentTerms({ futureValue: capital, discountRate: inflation, years: yearsToRetirement })
    };
  });
  const dbFundProjections = input.definedBenefitFunds.map((f) => {
    const monthlyIncome = parseAmount(f.pensionIncomeAmount);
    const escalation = parsePercent(f.pensionIncomeIncrease);
    const lumpSum = parseAmount(f.deathLumpSum);
    const growthRate = parsePercent(f.growthRate);
    const realReturn = Math.max(1e-3, growthRate - inflation);
    const pensionCapital = dbPensionToCapitalEquivalent({
      monthlyIncome,
      escalation,
      realReturn,
      yearsAfterRetirement
    });
    const projectedLumpSum = lumpSum * Math.pow(1 + growthRate, yearsToRetirement);
    const total = pensionCapital + projectedLumpSum;
    return {
      id: f.id,
      description: f.description,
      capitalAtRetirement: total,
      valueInCurrentTerms: discountToCurrentTerms({ futureValue: total, discountRate: inflation, years: yearsToRetirement })
    };
  });
  const voluntaryProjections = input.voluntaryInvestments.map((v) => {
    const capital = projectFundForward({
      currentValue: parseAmount(v.marketValue),
      monthlyContribution: parseAmount(v.monthlyContribution),
      contributionEscalation: parsePercent(v.contributionEscalation),
      growthRate: parsePercent(v.growthRate),
      yearsToRetirement
    });
    return {
      id: v.id,
      description: v.description,
      capitalAtRetirement: capital,
      valueInCurrentTerms: discountToCurrentTerms({ futureValue: capital, discountRate: inflation, years: yearsToRetirement })
    };
  });
  const futureInflowProjections = input.futureInflows.map((f) => {
    const valueAtInflow = projectFutureInflow({
      currentValue: parseAmount(f.currentValue),
      growthRate: parsePercent(f.growthRate),
      yearsAfterRetirement: f.startYearsAfterRetirement,
      calculateCgt: f.calculateCgt
    });
    const realReturn = Math.max(1e-3, parsePercent(f.growthRate) - inflation);
    const capitalAtRetirement = valueAtInflow / Math.pow(1 + realReturn, f.startYearsAfterRetirement);
    return {
      id: f.id,
      description: f.description,
      capitalAtRetirement,
      valueInCurrentTerms: discountToCurrentTerms({ futureValue: capitalAtRetirement, discountRate: inflation, years: yearsToRetirement })
    };
  });
  const lumpSumProjections = input.lumpSumNeeds.map((n) => {
    const amount = parseAmount(n.amount);
    const escalation = parsePercent(n.increasePercentage);
    const startYears = n.startYears;
    const periodsPerYear = n.frequency === "Monthly" ? 12 : n.frequency === "Quarterly" ? 4 : n.frequency === "Annual" ? 1 : 0;
    const realReturn = Math.max(1e-3, 0.1 - inflation);
    let capitalAtRetirement;
    if (n.frequency === "Single" || periodsPerYear === 0) {
      const escalated = amount * Math.pow(1 + escalation, startYears);
      capitalAtRetirement = escalated / Math.pow(1 + realReturn, startYears);
    } else {
      const pvAtStart = presentValueGrowingAnnuity({
        paymentPerPeriod: amount,
        escalation,
        discount: realReturn,
        termYears: n.termYears,
        periodsPerYear
      });
      capitalAtRetirement = pvAtStart / Math.pow(1 + realReturn, startYears);
    }
    return {
      id: n.id,
      description: n.description,
      capitalAtRetirement,
      valueInCurrentTerms: discountToCurrentTerms({ futureValue: capitalAtRetirement, discountRate: inflation, years: yearsToRetirement })
    };
  });
  const incomeRequiredProjections = input.incomeNeeds.map((n) => {
    const realReturn = Math.max(1e-3, 0.1 - inflation);
    const capital = requiredCapitalForIncome({
      monthlyAmount: parseAmount(n.amount),
      escalation: parsePercent(n.increasePercentage),
      termYears: parseYears(n.termYears),
      realReturn,
      frequency: n.frequency ?? "monthly"
    });
    return {
      id: n.id,
      description: n.description,
      capitalAtRetirement: capital,
      valueInCurrentTerms: discountToCurrentTerms({ futureValue: capital, discountRate: inflation, years: yearsToRetirement })
    };
  });
  const incomeProvidedProjections = input.incomeProvisions.map((p) => {
    const realReturn = Math.max(1e-3, 0.1 - inflation);
    const capital = requiredCapitalForIncome({
      monthlyAmount: parseAmount(p.amount),
      escalation: parsePercent(p.increasePercentage),
      termYears: parseYears(p.termYears),
      realReturn,
      frequency: p.frequency ?? "monthly",
      taxableFraction: parsePercent(p.taxPercentage),
      taxRate: parsePercent(p.taxRate)
    });
    return {
      id: p.id,
      description: p.description,
      capitalAtRetirement: capital,
      valueInCurrentTerms: discountToCurrentTerms({ futureValue: capital, discountRate: inflation, years: yearsToRetirement })
    };
  });
  const sum2 = (xs) => xs.reduce((s, x) => s + x.capitalAtRetirement, 0);
  const capitalProvided = sum2(retirementFundProjections) + sum2(dbFundProjections) + sum2(voluntaryProjections) + sum2(futureInflowProjections) + sum2(incomeProvidedProjections);
  const capitalRequired = sum2(lumpSumProjections) + sum2(incomeRequiredProjections);
  const surplus = capitalProvided - capitalRequired;
  const coverage = capitalRequired > 0 ? capitalProvided / capitalRequired : capitalProvided > 0 ? 1 : 0;
  const additionalContribution = surplus < 0 ? additionalMonthlyContribution({
    shortfallAtRetirement: Math.abs(surplus),
    growthRate: 0.1,
    contributionEscalation: 0.06,
    yearsToRetirement
  }) : 0;
  const currentMonthlyRaContribution = input.retirementFunds.reduce(
    (sum3, f) => sum3 + parseAmount(f.monthlyContribution),
    0
  );
  const annualTaxableIncome = parseAmount(input.parameters?.currentAnnualIncome);
  const contributionAllocation = additionalContribution > 0 ? allocateAdditionalContribution({
    additionalMonthlyContribution: additionalContribution,
    currentMonthlyRaContribution,
    annualTaxableIncome
  }) : null;
  return {
    yearsToRetirement,
    yearsAfterRetirement,
    inflationProxy: inflation,
    capitalProvided,
    capitalRequired,
    surplus,
    coverage,
    retirementFunds: retirementFundProjections,
    definedBenefitFunds: dbFundProjections,
    voluntaryInvestments: voluntaryProjections,
    futureInflows: futureInflowProjections,
    lumpSumNeeds: lumpSumProjections,
    incomeRequired: incomeRequiredProjections,
    incomeProvided: incomeProvidedProjections,
    additionalMonthlyContribution: additionalContribution,
    contributionAllocation,
    currentMonthlyRaContribution,
    annualTaxableIncome,
    ready
  };
}
function isRetirementReadyToProject(input) {
  if (!input.parameters) return false;
  if (!input.clientAge || input.clientAge <= 0) return false;
  const hasCapitalSource = input.retirementFunds.some((f) => parseAmount(f.fundValue) > 0 || parseAmount(f.monthlyContribution) > 0) || input.definedBenefitFunds.some((f) => parseAmount(f.deathLumpSum) > 0 || parseAmount(f.pensionIncomeAmount) > 0) || input.voluntaryInvestments.some((v) => parseAmount(v.marketValue) > 0 || parseAmount(v.monthlyContribution) > 0) || input.futureInflows.some((f) => parseAmount(f.currentValue) > 0);
  const hasIncomeNeed = input.incomeNeeds.some((n) => parseAmount(n.amount) > 0);
  return hasCapitalSource && hasIncomeNeed;
}

// server/routes/retirement-projection.ts
function registerRetirementProjectionRoutes(app2) {
  app2.get("/api/retirement-projection/:planId", async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      if (isNaN(planId)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }
      const [
        parameters,
        clientDetails2,
        retirementFunds2,
        definedBenefitFunds2,
        voluntaryInvestments2,
        futureInflows2,
        lumpSumNeeds,
        incomeNeeds2,
        incomeProvisions2
      ] = await Promise.all([
        storage.getRetirementParameters(planId),
        storage.getClientDetails(),
        storage.getRetirementFunds(),
        storage.getDefinedBenefitFunds(),
        storage.getVoluntaryInvestments(),
        storage.getFutureInflows(),
        storage.getRetirementLumpSumNeeds(),
        storage.getIncomeNeeds(),
        storage.getIncomeProvisions()
      ]);
      const primary = clientDetails2.find((c) => c.entityType === "Primary entity") ?? clientDetails2[0];
      const clientAge = primary ? parseInt(primary.age) || 0 : 0;
      const input = {
        parameters: parameters ?? null,
        clientAge,
        retirementFunds: retirementFunds2,
        definedBenefitFunds: definedBenefitFunds2,
        voluntaryInvestments: voluntaryInvestments2,
        futureInflows: futureInflows2,
        lumpSumNeeds,
        incomeNeeds: incomeNeeds2,
        incomeProvisions: incomeProvisions2
      };
      const projection = computeRetirementProjection(input);
      const ready = isRetirementReadyToProject(input);
      res.json({ ...projection, ready });
    } catch (error) {
      console.error("Error computing retirement projection:", error);
      res.status(500).json({ message: "Failed to compute retirement projection" });
    }
  });
}

// shared/del-calculations.ts
function position(provided, required) {
  const surplus = provided - required;
  const percentage = required > 0 ? provided / required * 100 : provided > 0 ? 100 : 0;
  return { provided, required, surplus, percentage };
}
function sum(xs) {
  return xs.reduce((a, b) => a + b, 0);
}
function computeDelProjection(input) {
  const p = input.estateParameters;
  const lifeCoverToEstate = p ? parseAmount(p.lifeCoverToEstate) : sum(
    input.assurance.filter((a) => !a.buySell && !a.keyMan && !a.excludedFromEstateDuty).map((a) => parseAmount(a.deathBenefit))
  );
  const voluntaryInvestmentsToEstate = p ? parseAmount(p.voluntaryInvestments) : sum(input.voluntaryInvestments.map((v) => parseAmount(v.marketValue)));
  const accrualClaimFromSpouse = parseAmount(p?.accrualClaimFromSpouse);
  const dependantsSurplusUtilised = parseAmount(p?.dependantsSurplusUtilised);
  const estateProvided = lifeCoverToEstate + voluntaryInvestmentsToEstate + accrualClaimFromSpouse + dependantsSurplusUtilised;
  const estateDuty = parseAmount(p?.estateDuty);
  const executorsFees = parseAmount(p?.executorsFees);
  const settleClientLiabilities = p ? parseAmount(p.settleClientLiabilities) : sum(input.liabilities.filter((l) => l.included).map((l) => parseAmount(l.debtAmount)));
  const capitalGainsTax = parseAmount(p?.capitalGainsTax);
  const mastersFee = parseAmount(p?.mastersFee);
  const deathBedFuneral = parseAmount(p?.deathBedFuneralExpenses);
  const conveyancingValuation = parseAmount(p?.conveyancingValuationFees);
  const accrualClaimToSpouse = parseAmount(p?.accrualClaimToSpouse);
  const estateRequired = estateDuty + executorsFees + settleClientLiabilities + capitalGainsTax + mastersFee + deathBedFuneral + conveyancingValuation + accrualClaimToSpouse;
  const estate = position(estateProvided, estateRequired);
  const estateBreakdown = [
    { label: "Life cover to the estate", amount: lifeCoverToEstate, side: "provided" },
    { label: "Voluntary investments to estate", amount: voluntaryInvestmentsToEstate, side: "provided" },
    { label: "Accrual claim from spouse", amount: accrualClaimFromSpouse, side: "provided" },
    { label: "Dependants' surplus utilised", amount: dependantsSurplusUtilised, side: "provided" },
    { label: "Estate duty", amount: estateDuty, side: "required" },
    { label: "Executor's fees", amount: executorsFees, side: "required" },
    { label: "Settle client's liabilities", amount: settleClientLiabilities, side: "required" },
    { label: "Capital gains tax", amount: capitalGainsTax, side: "required" },
    { label: "Master's fee", amount: mastersFee, side: "required" },
    { label: "Death bed and funeral expenses", amount: deathBedFuneral, side: "required" },
    { label: "Conveyancing and valuation fees", amount: conveyancingValuation, side: "required" },
    { label: "Accrual claim to spouse", amount: accrualClaimToSpouse, side: "required" }
  ];
  const lifeCoverToDependants = sum(
    input.assurance.filter((a) => !a.buySell && !a.keyMan).map((a) => parseAmount(a.deathBenefit) * (a.excludedFromEstateDuty ? 1 : 0))
  );
  const retirementFundDeathBenefits = sum(
    input.retirementFunds.map(
      (f) => parseAmount(f.fundValueAtDeath || f.fundValue) + parseAmount(f.approvedLifeCover) + parseAmount(f.coverAmount)
    )
  );
  const dbFundLumpSums = sum(input.definedBenefitFunds.map((f) => parseAmount(f.deathLumpSum)));
  const estateSurplusUtilisedForDependants = Math.max(0, estate.surplus);
  const dependantsProvided = lifeCoverToDependants + retirementFundDeathBenefits + dbFundLumpSums + estateSurplusUtilisedForDependants;
  const lumpSumBequests2 = sum(input.lumpSumBequests.map((b) => parseAmount(b.valueAtDeath) || parseAmount(b.amount)));
  const REAL_RETURN_DEFAULT = 0.06;
  const capitalisedIncomeNeeds = sum(
    input.incomeNeeds.map((n) => {
      const monthlyAmount = parseAmount(n.amount);
      const termYears = parseAmount(n.termYears);
      const escalation = parsePercent(n.increasePercentage);
      if (monthlyAmount <= 0 || termYears <= 0) return 0;
      const annualAmount = monthlyAmount * 12;
      if (Math.abs(REAL_RETURN_DEFAULT - escalation) < 1e-9) {
        return annualAmount * termYears;
      }
      const ratio = (1 + escalation) / (1 + REAL_RETURN_DEFAULT);
      return annualAmount * (1 - Math.pow(ratio, termYears)) / (REAL_RETURN_DEFAULT - escalation);
    })
  );
  const liabilitiesSettledByDependants = sum(
    input.liabilities.filter((l) => l.included).map((l) => parseAmount(l.others))
  );
  const dependantsRequired = lumpSumBequests2 + capitalisedIncomeNeeds + liabilitiesSettledByDependants;
  const dependants = position(dependantsProvided, dependantsRequired);
  const dependantsBreakdown = [
    { label: "Life cover to dependants", amount: lifeCoverToDependants, side: "provided" },
    { label: "Retirement fund death benefits", amount: retirementFundDeathBenefits, side: "provided" },
    { label: "Defined benefit fund lump sums", amount: dbFundLumpSums, side: "provided" },
    { label: "Estate surplus utilised", amount: estateSurplusUtilisedForDependants, side: "provided" },
    { label: "Lump sum bequests", amount: lumpSumBequests2, side: "required" },
    { label: "Capitalised income needs", amount: capitalisedIncomeNeeds, side: "required" },
    { label: "Liabilities settled by dependants", amount: liabilitiesSettledByDependants, side: "required" }
  ];
  const totalCapitalProvided = estateProvided + lifeCoverToDependants + retirementFundDeathBenefits + dbFundLumpSums;
  const totalCapitalRequired = estateRequired + dependantsRequired;
  const totalCapital = position(totalCapitalProvided, totalCapitalRequired);
  const monthlyIncomeFromRetirementFunds = sum(
    input.retirementFunds.map((f) => f.monthlyIncomeCheckbox ? parseAmount(f.monthlyIncome) : 0)
  );
  const monthlyDbPension = sum(
    input.definedBenefitFunds.map(
      (f) => f.pensionIncomeCheckbox ? parseAmount(f.pensionIncomeAmount) : 0
    )
  );
  const monthlyAssuranceIncome = sum(
    input.assurance.map((a) => a.amount && parseAmount(a.amount) > 0 ? parseAmount(a.amount) : 0)
  );
  const incomeProvided = monthlyIncomeFromRetirementFunds + monthlyDbPension + monthlyAssuranceIncome;
  const incomeRequired = sum(
    input.incomeNeeds.map((n) => parseAmount(n.amount))
  );
  const income = position(incomeProvided, incomeRequired);
  const incomeBreakdown = [
    { label: "Retirement funds and living annuities", amount: monthlyIncomeFromRetirementFunds, side: "provided" },
    { label: "Defined benefit pension", amount: monthlyDbPension, side: "provided" },
    { label: "Assurance monthly income", amount: monthlyAssuranceIncome, side: "provided" },
    { label: "Monthly income needs", amount: incomeRequired, side: "required" }
  ];
  const recommendedAdditionalCover = Math.max(0, -totalCapital.surplus);
  const ready = !!p || input.assurance.length > 0 || input.retirementFunds.length > 0 || input.voluntaryInvestments.length > 0 || input.liabilities.length > 0;
  return {
    estatePosition: { ...estate, breakdown: estateBreakdown },
    dependantsPosition: { ...dependants, breakdown: dependantsBreakdown },
    totalCapitalPosition: totalCapital,
    incomePosition: { ...income, breakdown: incomeBreakdown },
    recommendedAdditionalCover,
    ready
  };
}

// server/routes/del-projection.ts
function registerDelProjectionRoutes(app2) {
  app2.get("/api/del-projection/:planId", async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      if (isNaN(planId)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }
      const [
        estateParameters,
        assurance2,
        retirementFunds2,
        definedBenefitFunds2,
        voluntaryInvestments2,
        liabilities2,
        lumpSumBequests2,
        incomeNeeds2,
        incomeProvisions2
      ] = await Promise.all([
        storage.getEstatePositionParameters(),
        storage.getAssurance(),
        storage.getRetirementFunds(),
        storage.getDefinedBenefitFunds(),
        storage.getVoluntaryInvestments(),
        storage.getLiabilities(),
        storage.getLumpSumBequests(),
        storage.getIncomeNeeds(),
        storage.getIncomeProvisions()
      ]);
      const params = Array.isArray(estateParameters) ? estateParameters[0] ?? null : estateParameters ?? null;
      const projection = computeDelProjection({
        estateParameters: params,
        assurance: assurance2,
        retirementFunds: retirementFunds2,
        definedBenefitFunds: definedBenefitFunds2,
        voluntaryInvestments: voluntaryInvestments2,
        liabilities: liabilities2,
        lumpSumBequests: lumpSumBequests2,
        incomeNeeds: incomeNeeds2,
        incomeProvisions: incomeProvisions2
      });
      res.json(projection);
    } catch (error) {
      console.error("Error computing DEL projection:", error);
      res.status(500).json({ message: "Failed to compute DEL projection" });
    }
  });
}

// server/routes.ts
async function registerRoutes(app2) {
  registerEntityRoutes(app2);
  registerRetirementFundRoutes(app2);
  registerLumpSumBequestRoutes(app2);
  registerAssuranceRoutes(app2);
  registerDefinedBenefitFundRoutes(app2);
  registerVoluntaryInvestmentRoutes(app2);
  registerIncomeNeedsRoutes(app2);
  registerIncomeProvisionsRoutes(app2);
  registerResidueRoutes(app2);
  registerAdditionalEstateDutyItemRoutes(app2);
  registerLiabilitiesRoutes(app2);
  registerAssetsRoutes(app2);
  registerClientDetailsRoutes(app2);
  registerEstatePositionParameterRoutes(app2);
  registerFinancialPlanRoutes(app2);
  registerNeedsRoutes(app2);
  registerRetirementParametersRoutes(app2);
  registerFutureInflowRoutes(app2);
  registerRetirementLumpSumNeedRoutes(app2);
  registerRetirementProjectionRoutes(app2);
  registerDelProjectionRoutes(app2);
  await storage.initializeDefaultNeeds();
  return createServer(app2);
}

// server/api-handler.ts
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("trust proxy", 1);
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});
await registerRoutes(app);
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});
var api_handler_default = app;
export {
  api_handler_default as default
};
