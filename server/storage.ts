import type { Claim, InsertClaim, DamageItem } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getCurrentClaim(): Promise<Claim | null>;
  createClaim(claim: InsertClaim): Promise<Claim>;
  updateClaim(id: string, updates: Partial<Claim>): Promise<Claim | null>;
  updateDamageItem(claimId: string, damageId: string, updates: Partial<DamageItem>): Promise<DamageItem | null>;
}

export class MemStorage implements IStorage {
  private currentClaim: Claim | null = null;

  async getCurrentClaim(): Promise<Claim | null> {
    return this.currentClaim;
  }

  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    const claim: Claim = {
      ...insertClaim,
      id: randomUUID(),
    };
    this.currentClaim = claim;
    return claim;
  }

  async updateClaim(id: string, updates: Partial<Claim>): Promise<Claim | null> {
    if (!this.currentClaim || this.currentClaim.id !== id) {
      return null;
    }
    this.currentClaim = { ...this.currentClaim, ...updates };
    return this.currentClaim;
  }

  async updateDamageItem(claimId: string, damageId: string, updates: Partial<DamageItem>): Promise<DamageItem | null> {
    if (!this.currentClaim || this.currentClaim.id !== claimId) {
      return null;
    }

    const damageIndex = this.currentClaim.damages.findIndex(d => d.id === damageId);
    if (damageIndex === -1) {
      return null;
    }

    const updatedDamage = { ...this.currentClaim.damages[damageIndex], ...updates };
    this.currentClaim.damages[damageIndex] = updatedDamage;
    
    this.currentClaim.totalEstimate = this.currentClaim.damages.reduce(
      (sum, d) => sum + d.laborCost + d.partsCost, 0
    );

    return updatedDamage;
  }
}

export const storage = new MemStorage();
