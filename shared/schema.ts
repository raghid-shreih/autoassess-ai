import { z } from "zod";

export const damageTypes = ["scratch", "dent", "crack", "structural", "paint"] as const;
export type DamageType = typeof damageTypes[number];

export const severityLevels = ["minor", "moderate", "severe"] as const;
export type SeverityLevel = typeof severityLevels[number];

export const repairActions = ["repair", "replace", "paint", "buff"] as const;
export type RepairAction = typeof repairActions[number];

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

export const claimSchema = z.object({
  id: z.string(),
  policyNumber: z.string(),
  vehicleInfo: z.object({
    make: z.string(),
    model: z.string(),
    year: z.number(),
    color: z.string(),
    vin: z.string(),
  }),
  claimDate: z.string(),
  status: z.enum(["pending", "in_review", "approved", "flagged"]),
  imageUrl: z.string().optional(),
  damages: z.array(damageItemSchema),
  overallConfidence: z.number().min(0).max(100),
  totalEstimate: z.number(),
  agentNotes: z.string().optional(),
});

export type Claim = z.infer<typeof claimSchema>;

export const insertClaimSchema = claimSchema.omit({ id: true });
export type InsertClaim = z.infer<typeof insertClaimSchema>;

export const assessmentRequestSchema = z.object({
  imageData: z.string(),
});

export type AssessmentRequest = z.infer<typeof assessmentRequestSchema>;

export const updateDamageItemSchema = damageItemSchema.partial().required({ id: true });
export type UpdateDamageItem = z.infer<typeof updateDamageItemSchema>;

export const users = undefined;
export type User = { id: string; username: string; password: string };
export type InsertUser = { username: string; password: string };
