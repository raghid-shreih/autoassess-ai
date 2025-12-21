import { claims, type Claim, type InsertClaim, type DamageItem } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getAllClaims(): Promise<Claim[]>;
  getClaimById(id: string): Promise<Claim | null>;
  createClaim(claim: InsertClaim): Promise<Claim>;
  updateClaim(id: string, updates: Partial<Claim>): Promise<Claim | null>;
  updateDamageItem(claimId: string, damageId: string, updates: Partial<DamageItem>): Promise<DamageItem | null>;
}

export class DatabaseStorage implements IStorage {
  async getAllClaims(): Promise<Claim[]> {
    const rows = await db.select().from(claims).orderBy(desc(claims.claimDate));
    return rows.map(row => ({
      ...row,
      imageUrl: row.imageUrl ?? undefined,
      agentNotes: row.agentNotes ?? undefined,
    })) as Claim[];
  }

  async getClaimById(id: string): Promise<Claim | null> {
    const [row] = await db.select().from(claims).where(eq(claims.id, id));
    if (!row) return null;
    return {
      ...row,
      imageUrl: row.imageUrl ?? undefined,
      agentNotes: row.agentNotes ?? undefined,
    } as Claim;
  }

  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    const id = randomUUID();
    const values = {
      id,
      policyNumber: insertClaim.policyNumber,
      vehicleInfo: insertClaim.vehicleInfo,
      claimDate: insertClaim.claimDate,
      status: insertClaim.status ?? "pending",
      imageUrl: insertClaim.imageUrl,
      damages: insertClaim.damages ?? [],
      overallConfidence: insertClaim.overallConfidence ?? 0,
      totalEstimate: insertClaim.totalEstimate ?? 0,
      agentNotes: insertClaim.agentNotes,
    };
    const [row] = await db
      .insert(claims)
      .values(values as typeof claims.$inferInsert)
      .returning();
    return {
      ...row,
      imageUrl: row.imageUrl ?? undefined,
      agentNotes: row.agentNotes ?? undefined,
    } as Claim;
  }

  async updateClaim(id: string, updates: Partial<Claim>): Promise<Claim | null> {
    // Map Claim fields to database column names, filtering out undefined values
    const dbUpdates: Partial<typeof claims.$inferInsert> = {};
    if (updates.policyNumber !== undefined) dbUpdates.policyNumber = updates.policyNumber;
    if (updates.vehicleInfo !== undefined) dbUpdates.vehicleInfo = updates.vehicleInfo;
    if (updates.claimDate !== undefined) dbUpdates.claimDate = updates.claimDate;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.imageUrl !== undefined) dbUpdates.imageUrl = updates.imageUrl;
    if (updates.damages !== undefined) dbUpdates.damages = updates.damages;
    if (updates.overallConfidence !== undefined) dbUpdates.overallConfidence = updates.overallConfidence;
    if (updates.totalEstimate !== undefined) dbUpdates.totalEstimate = updates.totalEstimate;
    if (updates.agentNotes !== undefined) dbUpdates.agentNotes = updates.agentNotes;

    const [row] = await db
      .update(claims)
      .set(dbUpdates)
      .where(eq(claims.id, id))
      .returning();
    if (!row) return null;
    return {
      ...row,
      imageUrl: row.imageUrl ?? undefined,
      agentNotes: row.agentNotes ?? undefined,
    } as Claim;
  }

  async updateDamageItem(claimId: string, damageId: string, updates: Partial<DamageItem>): Promise<DamageItem | null> {
    const claim = await this.getClaimById(claimId);
    if (!claim) return null;

    const damageIndex = claim.damages.findIndex(d => d.id === damageId);
    if (damageIndex === -1) return null;

    const updatedDamage = { ...claim.damages[damageIndex], ...updates };
    claim.damages[damageIndex] = updatedDamage;
    
    const totalEstimate = claim.damages.reduce(
      (sum, d) => sum + d.laborCost + d.partsCost, 0
    );

    await db
      .update(claims)
      .set({ damages: claim.damages, totalEstimate })
      .where(eq(claims.id, claimId));

    return updatedDamage;
  }
}

export const storage = new DatabaseStorage();
