import { pgTable, text, serial, integer, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Beneficiary interfaces
export interface UnapprovedBeneficiary {
  id: string;
  name: string;
  percentage: string;
  coverSplit: string;
}

export interface FundValueBeneficiary {
  id: string;
  name: string;
  percentage: string;
  amount: string;
  lumpSumTaken: string;
  nondeductibleContribution: string;
  livingAnnuity: string;
  incomeTerm: string;
}

export const retirementFunds = pgTable("retirement_funds", {
  id: serial("id").primaryKey(),
  
  // Overview section
  description: text("description").notNull(),
  owner: text("owner").notNull(),
  coverAmount: text("cover_amount").notNull().default("0"),
  
  // Unapproved life cover section - multiple beneficiaries (JSON string)
  unapprovedBeneficiaries: text("unapproved_beneficiaries").notNull().default("[]"),
  
  // Monthly death benefit section
  monthlyIncome: text("monthly_income").notNull().default("0"),
  termYears: text("term_years").notNull().default("0"),
  increasePercentage: text("increase_percentage").notNull().default("0"),
  approvedLifeCover: text("approved_life_cover").notNull().default("0"),
  fundValue: text("fund_value").notNull().default("0"),
  fundValueAtDeath: text("fund_value_at_death").notNull().default("0"),
  
  // Fund value beneficiaries section - multiple beneficiaries (JSON string)
  fundValueBeneficiaries: text("fund_value_beneficiaries").notNull().default("[]"),

  // Flows mode specific fields
  lumpSumLeftOverProvisions: text("lump_sum_left_over_provisions").notNull().default("0"),
  incomeProvisionOption: text("income_provision_option").notNull().default(""),
  monthlyProvisionOffered: text("monthly_provision_offered").notNull().default("0"),
  currentAnnualIncome: text("current_annual_income").notNull().default("0"),
  annualIncomeAtDeath: text("annual_income_at_death").notNull().default("0"),
  estateDeploymentDeceased: text("estate_deployment_deceased").notNull().default("0"),
  executorsFee: text("executors_fee").notNull().default("0"),
  mastersFee: text("masters_fee").notNull().default("0"),

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
