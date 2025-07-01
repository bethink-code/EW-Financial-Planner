import { pgTable, text, serial, integer, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const retirementFunds = pgTable("retirement_funds", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  owner: text("owner").notNull(),
  coverAgainst: text("cover_against").notNull().default("0"),
  monthlyDeathBenefit: decimal("monthly_death_benefit", { precision: 12, scale: 2 }).notNull().default("0"),
  lumpSumDeath: decimal("lump_sum_death", { precision: 12, scale: 2 }).notNull().default("0"),
  previousLumpSums: decimal("previous_lump_sums", { precision: 12, scale: 2 }).notNull().default("0"),
  taxFreeAmount: decimal("tax_free_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  fundValue: decimal("fund_value", { precision: 12, scale: 2 }).notNull().default("0"),
  fundValueAtDeath: decimal("fund_value_at_death", { precision: 12, scale: 2 }).notNull().default("0"),
  name: text("name").notNull().default(""),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull().default("0"),
  lumpSumTaken: decimal("lump_sum_taken", { precision: 12, scale: 2 }).notNull().default("0"),
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
