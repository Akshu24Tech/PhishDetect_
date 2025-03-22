import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Website data schema - stores reference data for legitimate websites
export const websites = pgTable("websites", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  domain: text("domain").notNull().unique(),
  logoUrl: text("logo_url").notNull(),
  referenceImageUrl: text("reference_image_url").notNull(),
});

export const insertWebsiteSchema = createInsertSchema(websites).pick({
  name: true,
  domain: true,
  logoUrl: true,
  referenceImageUrl: true,
});

// Analysis results schema - stores the results of analyzed screenshots
export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  uploadedImageUrl: text("uploaded_image_url").notNull(),
  identifiedWebsiteId: integer("identified_website_id"),
  confidenceScore: integer("confidence_score").notNull(),
  isPhishing: boolean("is_phishing").notNull(),
  analysisFactors: jsonb("analysis_factors").notNull(),
  keyDifferences: jsonb("key_differences").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const insertAnalysisSchema = createInsertSchema(analyses).pick({
  uploadedImageUrl: true,
  identifiedWebsiteId: true,
  confidenceScore: true,
  isPhishing: true,
  analysisFactors: true,
  keyDifferences: true,
  timestamp: true,
});

// Define types for our schemas
export type Website = typeof websites.$inferSelect;
export type InsertWebsite = z.infer<typeof insertWebsiteSchema>;

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;

// Define types for analysis factors and differences
export type AnalysisFactor = {
  name: string;
  value: string | number;
  isPositive: boolean;
};

export type KeyDifference = {
  description: string;
};
