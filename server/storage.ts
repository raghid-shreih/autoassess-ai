import { type Claim, type InsertClaim, type DamageItem, type ClaimStatus, type ClaimSummary } from "@shared/schema";
import { randomUUID } from "crypto";
import { MAX_CLAIMS } from "./uploads";

export class WorkflowError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export interface IStorage {
  getAllClaims(): Promise<ClaimSummary[]>;
  getClaimById(id: string): Promise<Claim | null>;
  createClaim(claim: InsertClaim): Promise<Claim>;
  updateClaim(id: string, updates: Partial<Claim>): Promise<Claim | null>;
  updateDamageItem(claimId: string, damageId: string, updates: Partial<DamageItem>): Promise<DamageItem | null>;
}

function generateMockClaims(): Claim[] {
  const claims: Claim[] = [
    {
      id: randomUUID(),
      policyNumber: "POL-2024-001",
      vehicleInfo: { make: "Toyota", model: "Camry", year: 2022, color: "Silver", vin: "1HGBH41JXMN109186" },
      claimDate: "2024-12-20",
      status: "pending",
      imageUrl: "/images/damaged_silver_toyota_camry.jpg",
      damages: [
        { id: randomUUID(), part: "Front Bumper", damageType: "dent", severity: "moderate", action: "repair", confidence: 92, laborCost: 180, partsCost: 120, reasoning: "Impact damage from minor collision" },
        { id: randomUUID(), part: "Headlight Assembly", damageType: "crack", severity: "severe", action: "replace", confidence: 98, laborCost: 75, partsCost: 340, reasoning: "Cracked lens requiring full replacement" }
      ],
      overallConfidence: 95,
      totalEstimate: 715,
      agentNotes: undefined
    },
    {
      id: randomUUID(),
      policyNumber: "POL-2024-002",
      vehicleInfo: { make: "Honda", model: "Accord", year: 2021, color: "Blue", vin: "2HGFC2F59MH512345" },
      claimDate: "2024-12-19",
      status: "in_review",
      imageUrl: "/images/damaged_blue_honda_accord.jpg",
      damages: [
        { id: randomUUID(), part: "Rear Quarter Panel", damageType: "scratch", severity: "minor", action: "paint", confidence: 88, laborCost: 220, partsCost: 85, reasoning: "Surface scratches from parking incident" },
        { id: randomUUID(), part: "Tail Light", damageType: "crack", severity: "moderate", action: "replace", confidence: 94, laborCost: 60, partsCost: 195, reasoning: "Cracked housing from impact" }
      ],
      overallConfidence: 91,
      totalEstimate: 560,
      agentNotes: "Customer reported parking lot incident"
    },
    {
      id: randomUUID(),
      policyNumber: "POL-2024-003",
      vehicleInfo: { make: "Ford", model: "F-150", year: 2023, color: "Black", vin: "1FTFW1E50MFA12345" },
      claimDate: "2024-12-18",
      status: "approved",
      imageUrl: "/images/hail_damaged_black_ford_f-150.jpg",
      damages: [
        { id: randomUUID(), part: "Hood", damageType: "dent", severity: "moderate", action: "repair", confidence: 90, laborCost: 350, partsCost: 0, reasoning: "Hail damage with multiple small dents" },
        { id: randomUUID(), part: "Roof Panel", damageType: "dent", severity: "minor", action: "buff", confidence: 85, laborCost: 180, partsCost: 0, reasoning: "Minor surface dents from hail" },
        { id: randomUUID(), part: "Windshield", damageType: "crack", severity: "severe", action: "replace", confidence: 99, laborCost: 120, partsCost: 450, reasoning: "Crack propagated across windshield" }
      ],
      overallConfidence: 91,
      totalEstimate: 1100,
      agentNotes: "Approved - hail storm damage verified"
    },
    {
      id: randomUUID(),
      policyNumber: "POL-2024-004",
      vehicleInfo: { make: "BMW", model: "X5", year: 2022, color: "White", vin: "5UXCR6C55M9C12345" },
      claimDate: "2024-12-17",
      status: "flagged",
      imageUrl: "/images/damaged_white_bmw_x5_suv.jpg",
      damages: [
        { id: randomUUID(), part: "Front Door (Driver)", damageType: "structural", severity: "severe", action: "replace", confidence: 72, laborCost: 520, partsCost: 1200, reasoning: "Structural damage detected - manual verification recommended" },
        { id: randomUUID(), part: "Side Mirror", damageType: "crack", severity: "moderate", action: "replace", confidence: 96, laborCost: 45, partsCost: 380, reasoning: "Housing shattered from impact" }
      ],
      overallConfidence: 68,
      totalEstimate: 2145,
      agentNotes: "Flagged for manual review - structural damage assessment uncertain"
    },
    {
      id: randomUUID(),
      policyNumber: "POL-2024-005",
      vehicleInfo: { make: "Chevrolet", model: "Malibu", year: 2020, color: "Red", vin: "1G1ZD5ST8LF123456" },
      claimDate: "2024-12-16",
      status: "pending",
      imageUrl: "/images/scratched_red_chevrolet_malibu.jpg",
      damages: [
        { id: randomUUID(), part: "Rear Bumper", damageType: "scratch", severity: "minor", action: "paint", confidence: 94, laborCost: 150, partsCost: 75, reasoning: "Light scratches from backing incident" }
      ],
      overallConfidence: 94,
      totalEstimate: 225,
      agentNotes: undefined
    },
    {
      id: randomUUID(),
      policyNumber: "POL-2024-006",
      vehicleInfo: { make: "Tesla", model: "Model 3", year: 2023, color: "Grey", vin: "5YJ3E1EA8MF123456" },
      claimDate: "2024-12-15",
      status: "in_review",
      imageUrl: "/images/damaged_grey_tesla_model_3.jpg",
      damages: [
        { id: randomUUID(), part: "Front Fender (Right)", damageType: "dent", severity: "moderate", action: "repair", confidence: 89, laborCost: 280, partsCost: 0, reasoning: "Dent from side impact, paintless repair possible" },
        { id: randomUUID(), part: "Door Handle", damageType: "crack", severity: "minor", action: "replace", confidence: 97, laborCost: 35, partsCost: 210, reasoning: "Cracked handle mechanism" },
        { id: randomUUID(), part: "Wheel Rim", damageType: "scratch", severity: "moderate", action: "repair", confidence: 86, laborCost: 120, partsCost: 0, reasoning: "Curb rash damage to alloy rim" }
      ],
      overallConfidence: 90,
      totalEstimate: 645,
      agentNotes: "Electric vehicle - specialized repair facility may be required"
    },
    {
      id: randomUUID(),
      policyNumber: "POL-2024-007",
      vehicleInfo: { make: "Nissan", model: "Altima", year: 2021, color: "Green", vin: "1N4BL4BV5MC123456" },
      claimDate: "2024-12-14",
      status: "approved",
      imageUrl: "/images/damaged_green_nissan_altima.jpg",
      damages: [
        { id: randomUUID(), part: "Trunk Lid", damageType: "dent", severity: "minor", action: "repair", confidence: 93, laborCost: 200, partsCost: 0, reasoning: "Small dent from falling object" },
        { id: randomUUID(), part: "Rear Glass", damageType: "crack", severity: "severe", action: "replace", confidence: 99, laborCost: 90, partsCost: 320, reasoning: "Complete replacement needed due to crack pattern" }
      ],
      overallConfidence: 96,
      totalEstimate: 610,
      agentNotes: "Approved - clear liability, straightforward repair"
    }
  ];

  return claims;
}

export class MemStorage implements IStorage {
  private claims: Map<string, Claim>;

  constructor() {
    this.claims = new Map();
    const mockClaims = generateMockClaims();
    mockClaims.forEach(claim => this.claims.set(claim.id, claim));
  }

  async getAllClaims(): Promise<ClaimSummary[]> {
    return Array.from(this.claims.values()).sort(
      (a, b) => new Date(b.claimDate).getTime() - new Date(a.claimDate).getTime()
    ).map(({ id, policyNumber, vehicleInfo, claimDate, status, overallConfidence, totalEstimate, imageUrl, damages }) => ({
      id, policyNumber, vehicleInfo, claimDate, status, overallConfidence, totalEstimate,
      damageCount: damages.length,
      imageUrl: imageUrl?.startsWith("/images/") ? imageUrl : undefined,
    }));
  }

  async getClaimById(id: string): Promise<Claim | null> {
    return this.claims.get(id) || null;
  }

  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    if (this.claims.size >= MAX_CLAIMS) throw new WorkflowError(429, "Demo claim limit reached. Restart the server to reset demo data.");
    const id = randomUUID();
    const claim: Claim = {
      id,
      policyNumber: insertClaim.policyNumber,
      vehicleInfo: insertClaim.vehicleInfo,
      claimDate: insertClaim.claimDate,
      status: (insertClaim.status ?? "pending") as ClaimStatus,
      imageUrl: insertClaim.imageUrl ?? undefined,
      damages: (insertClaim.damages ?? []) as DamageItem[],
      overallConfidence: insertClaim.overallConfidence ?? 0,
      totalEstimate: insertClaim.totalEstimate ?? 0,
      agentNotes: insertClaim.agentNotes ?? undefined,
    };
    this.claims.set(id, claim);
    return claim;
  }

  async updateClaim(id: string, updates: Partial<Claim>): Promise<Claim | null> {
    const claim = this.claims.get(id);
    if (!claim) return null;
    if (claim.status === "approved" || claim.status === "flagged") {
      throw new WorkflowError(409, "Completed claims cannot be changed.");
    }

    const updatedClaim = { ...claim, ...updates };
    this.claims.set(id, updatedClaim);
    return updatedClaim;
  }

  async updateDamageItem(claimId: string, damageId: string, updates: Partial<DamageItem>): Promise<DamageItem | null> {
    const claim = this.claims.get(claimId);
    if (!claim) return null;
    if (claim.status === "approved" || claim.status === "flagged") {
      throw new WorkflowError(409, "Completed claims cannot be changed.");
    }

    const damageIndex = claim.damages.findIndex(d => d.id === damageId);
    if (damageIndex === -1) return null;

    const updatedDamage = { ...claim.damages[damageIndex], ...updates };
    claim.damages[damageIndex] = updatedDamage;

    const totalEstimate = claim.damages.reduce(
      (sum, d) => sum + d.laborCost + d.partsCost, 0
    );
    claim.totalEstimate = totalEstimate;

    this.claims.set(claimId, claim);
    return updatedDamage;
  }
}
