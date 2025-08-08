import { pgTable, serial, text, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Liabilities table schema - New comprehensive structure
export const liabilities = pgTable("liabilities", {
  id: serial("id").primaryKey(),
  
  // Overview Section
  category: text("category").notNull().default("Enter details ..."),
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