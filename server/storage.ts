import type { Claim, InsertClaim, DamageItem } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAllClaims(): Promise<Claim[]>;
  getClaimById(id: string): Promise<Claim | null>;
  createClaim(claim: InsertClaim): Promise<Claim>;
  updateClaim(id: string, updates: Partial<Claim>): Promise<Claim | null>;
  updateDamageItem(claimId: string, damageId: string, updates: Partial<DamageItem>): Promise<DamageItem | null>;
}

export class MemStorage implements IStorage {
  private claims: Map<string, Claim> = new Map();

  async getAllClaims(): Promise<Claim[]> {
    return Array.from(this.claims.values()).sort((a, b) => 
      new Date(b.claimDate).getTime() - new Date(a.claimDate).getTime()
    );
  }

  async getClaimById(id: string): Promise<Claim | null> {
    return this.claims.get(id) || null;
  }

  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    const claim: Claim = {
      ...insertClaim,
      id: randomUUID(),
    };
    this.claims.set(claim.id, claim);
    return claim;
  }

  async updateClaim(id: string, updates: Partial<Claim>): Promise<Claim | null> {
    const claim = this.claims.get(id);
    if (!claim) {
      return null;
    }
    const updatedClaim = { ...claim, ...updates };
    this.claims.set(id, updatedClaim);
    return updatedClaim;
  }

  async updateDamageItem(claimId: string, damageId: string, updates: Partial<DamageItem>): Promise<DamageItem | null> {
    const claim = this.claims.get(claimId);
    if (!claim) {
      return null;
    }

    const damageIndex = claim.damages.findIndex(d => d.id === damageId);
    if (damageIndex === -1) {
      return null;
    }

    const updatedDamage = { ...claim.damages[damageIndex], ...updates };
    claim.damages[damageIndex] = updatedDamage;
    
    claim.totalEstimate = claim.damages.reduce(
      (sum, d) => sum + d.laborCost + d.partsCost, 0
    );

    this.claims.set(claimId, claim);
    return updatedDamage;
  }
}

export const storage = new MemStorage();
