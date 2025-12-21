import { pgTable, text, integer, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Damage and severity enums
export const damageTypes = ["scratch", "dent", "crack", "structural", "paint"] as const;
export type DamageType = typeof damageTypes[number];

export const severityLevels = ["minor", "moderate", "severe"] as const;
export type SeverityLevel = typeof severityLevels[number];

export const repairActions = ["repair", "replace", "paint", "buff"] as const;
export type RepairAction = typeof repairActions[number];

export const claimStatuses = ["pending", "in_review", "approved", "flagged"] as const;
export type ClaimStatus = typeof claimStatuses[number];

// Zod schemas for validation
export const damageItemSchema = z.object({
  id: z.string(),
  part: z.string(),
  damageType: z.enum(damageTypes),
  severity: z.enum(severityLevels),
  action: z.enum(repairActions),
  confidence: z.number().min(0).max(100),
  laborCost: z.number(),
  partsCost: z.number(),
  reasoning: z.string().optional(),
});

export type DamageItem = z.infer<typeof damageItemSchema>;

export const vehicleInfoSchema = z.object({
  make: z.string(),
  model: z.string(),
  year: z.number(),
  color: z.string(),
  vin: z.string(),
});

export type VehicleInfo = z.infer<typeof vehicleInfoSchema>;

// Drizzle PostgreSQL table definition
export const claims = pgTable("claims", {
  id: text("id").primaryKey(),
  policyNumber: text("policy_number").notNull(),
  vehicleInfo: jsonb("vehicle_info").$type<VehicleInfo>().notNull(),
  claimDate: text("claim_date").notNull(),
  status: text("status").$type<ClaimStatus>().notNull().default("pending"),
  imageUrl: text("image_url"),
  damages: jsonb("damages").$type<DamageItem[]>().notNull().default([]),
  overallConfidence: real("overall_confidence").notNull().default(0),
  totalEstimate: real("total_estimate").notNull().default(0),
  agentNotes: text("agent_notes"),
});

// Zod schema for full claim validation
export const claimSchema = z.object({
  id: z.string(),
  policyNumber: z.string(),
  vehicleInfo: vehicleInfoSchema,
  claimDate: z.string(),
  status: z.enum(claimStatuses),
  imageUrl: z.string().optional().nullable(),
  damages: z.array(damageItemSchema),
  overallConfidence: z.number().min(0).max(100),
  totalEstimate: z.number(),
  agentNotes: z.string().optional().nullable(),
});

export type Claim = z.infer<typeof claimSchema>;

// List view returns claims without the imageUrl for performance
export type ClaimSummary = Omit<Claim, 'imageUrl'>;

// Insert schema from Drizzle
export const insertClaimSchema = createInsertSchema(claims).omit({ id: true });
export type InsertClaim = z.infer<typeof insertClaimSchema>;

export const assessmentRequestSchema = z.object({
  imageData: z.string(),
});

export type AssessmentRequest = z.infer<typeof assessmentRequestSchema>;

export const updateDamageItemSchema = damageItemSchema.partial().required({ id: true });
export type UpdateDamageItem = z.infer<typeof updateDamageItemSchema>;

// Placeholder for users (not used in this app)
export const users = undefined;
export type User = { id: string; username: string; password: string };
export type InsertUser = { username: string; password: string };
