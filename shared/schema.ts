import { pgTable, text, serial, integer, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const retirementFunds = pgTable("retirement_funds", {
  id: serial("id").primaryKey(),
  
  // Overview section
  description: text("description").notNull(),
  owner: text("owner").notNull(),
  coverAmount: text("cover_amount").notNull().default("0"),
  
  // Unapproved life cover section
  beneficiary: text("beneficiary").notNull().default(""),
  beneficiaryPercentage: text("beneficiary_percentage").notNull().default("0"),
  coverSplit: text("cover_split").notNull().default("0"),
  
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

  // Flows mode specific fields
  lumpSumLeftOverProvisions: text("lump_sum_left_over_provisions").notNull().default("0"),
  incomeProvisionOption: text("income_provision_option").notNull().default(""),
  monthlyProvisionOffered: text("monthly_provision_offered").notNull().default("0"),
  currentAnnualIncome: text("current_annual_income").notNull().default("0"),
  annualIncomeAtDeath: text("annual_income_at_death").notNull().default("0"),
  estateDeploymentDeceased: text("estate_deployment_deceased").notNull().default("0"),
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

export type InsertRetirementFund = z.infer<typeof insertRetirementFundSchema>;
export type UpdateRetirementFund = z.infer<typeof updateRetirementFundSchema>;
export type RetirementFund = typeof retirementFunds.$inferSelect;
