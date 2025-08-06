import { pgTable, serial, text, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const assets = pgTable('assets', {
  id: serial('id').primaryKey(),
  description: text('description').notNull().default('Enter details ...'),
  marketValue: text('market_value').notNull().default('R 0'),
  // Dynamic ownership percentages - stored as JSON object matching client entities
  entityOwnership: text('entity_ownership').notNull().default('{}'), // JSON object: {"Garth Shoebridge": "0%", "Beryl Shuttleworth": "0%", ...}
  estate: text('estate').notNull().default('R 0'),
  others: text('others').notNull().default('R 0'),
  client: text('client').notNull().default('R 0'),
  section: text('section').notNull().default('PROPERTY'),
  included: boolean('included').notNull().default(true),
});

export const insertAssetsSchema = createInsertSchema(assets).omit({
  id: true,
});

export type InsertAssets = z.infer<typeof insertAssetsSchema>;
export type Assets = typeof assets.$inferSelect;