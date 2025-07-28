import { pgTable, serial, text, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const assets = pgTable('assets', {
  id: serial('id').primaryKey(),
  description: text('description').notNull().default('Enter details ...'),
  marketValue: text('market_value').notNull().default('R 0'),
  johnDoe: text('john_doe').notNull().default('0%'),
  janetteDoe: text('janette_doe').notNull().default('0%'),
  doeJunior: text('doe_junior').notNull().default('0%'),
  doeFamilyTrust: text('doe_family_trust').notNull().default('0%'),
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