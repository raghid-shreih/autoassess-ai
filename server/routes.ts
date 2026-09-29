import type { Express } from "express";
import type { Server } from "http";
import { type IStorage, MemStorage, WorkflowError } from "./storage";
import { assessmentRequestSchema, updateDamageItemSchema, claimNotesSchema } from "@shared/schema";
import { normalizeImage } from "./uploads";
import { rateLimit } from "express-rate-limit";
import type { DamageItem, SeverityLevel, DamageType, RepairAction } from "@shared/schema";
import { randomUUID } from "crypto";

function generateSimulatedDamageAssessment(): { damages: DamageItem[]; confidence: number } {
  const vehicleParts = [
    "Front Bumper",
    "Rear Bumper",
    "Driver Door",
    "Passenger Door",
    "Hood",
    "Trunk Lid",
    "Front Fender (Left)",
    "Front Fender (Right)",
    "Rear Quarter Panel (Left)",
    "Rear Quarter Panel (Right)",
    "Headlight Assembly",
    "Taillight Assembly",
    "Side Mirror (Left)",
    "Windshield",
    "Roof Panel"
  ];

  const damageTypes: DamageType[] = ["scratch", "dent", "crack", "structural", "paint"];
  const severityLevels: SeverityLevel[] = ["minor", "moderate", "severe"];
  const repairActions: RepairAction[] = ["repair", "replace", "paint", "buff"];

  const reasoningTemplates: Record<DamageType, string[]> = {
    scratch: [
      "Surface-level scratch detected, depth analysis suggests paint only",
      "Multiple scratches identified in a 15cm area, recommend buffing and touch-up",
      "Deep scratch penetrating clear coat, requires panel repaint"
    ],
    dent: [
      "Shallow dent with no paint damage, PDR (Paintless Dent Repair) viable",
      "Medium dent with slight paint stress, traditional repair recommended",
      "Significant deformation detected, structural integrity assessment advised"
    ],
    crack: [
      "Hairline crack in plastic component, replacement recommended for safety",
      "Impact crack with spider pattern, immediate replacement required",
      "Stress crack along mounting point, part integrity compromised"
    ],
    structural: [
      "Structural crease detected, frame alignment check recommended",
      "Panel displacement suggests impact damage, underlying structure review needed",
      "Mounting point damage detected, requires reinforcement or replacement"
    ],
    paint: [
      "Paint flaking due to impact, affected area requires complete respray",
      "Clear coat failure in damaged zone, blending required for seamless finish",
      "Color mismatch risk - recommend full panel repaint for OEM quality"
    ]
  };

  const numDamages = 2 + Math.floor(Math.random() * 4);
  const selectedParts = shuffleArray([...vehicleParts]).slice(0, numDamages);

  const damages: DamageItem[] = selectedParts.map((part) => {
    const damageType = damageTypes[Math.floor(Math.random() * damageTypes.length)];
    const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];

    let action: RepairAction;
    if (severity === "severe") {
      action = "replace";
    } else if (damageType === "scratch" && severity === "minor") {
      action = "buff";
    } else if (damageType === "paint") {
      action = "paint";
    } else {
      action = repairActions[Math.floor(Math.random() * repairActions.length)];
    }

    const baseLaborCost = severity === "minor" ? 80 : severity === "moderate" ? 150 : 280;
    const basePartsCost = action === "replace"
      ? (severity === "severe" ? 350 : 200)
      : (action === "paint" ? 100 : 50);

    const laborVariance = 0.8 + Math.random() * 0.4;
    const partsVariance = 0.8 + Math.random() * 0.4;

    const reasonings = reasoningTemplates[damageType];
    const reasoning = reasonings[Math.floor(Math.random() * reasonings.length)];

    const confidence = 65 + Math.floor(Math.random() * 35);

    return {
      id: randomUUID(),
      part,
      damageType,
      severity,
      action,
      confidence,
      laborCost: Math.round(baseLaborCost * laborVariance),
      partsCost: Math.round(basePartsCost * partsVariance),
      reasoning,
    };
  });

  const averageConfidence = Math.round(
    damages.reduce((sum, d) => sum + d.confidence, 0) / damages.length
  );

  return { damages, confidence: averageConfidence };
}

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function generateMockVehicleInfo() {
  const makes = ["Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes-Benz", "Audi", "Tesla"];
  const models: Record<string, string[]> = {
    Toyota: ["Camry", "Corolla", "RAV4", "Highlander"],
    Honda: ["Civic", "Accord", "CR-V", "Pilot"],
    Ford: ["F-150", "Mustang", "Explorer", "Escape"],
    Chevrolet: ["Silverado", "Malibu", "Equinox", "Tahoe"],
    BMW: ["3 Series", "5 Series", "X3", "X5"],
    "Mercedes-Benz": ["C-Class", "E-Class", "GLC", "GLE"],
    Audi: ["A4", "A6", "Q5", "Q7"],
    Tesla: ["Model 3", "Model Y", "Model S", "Model X"],
  };
  const colors = ["White", "Black", "Silver", "Blue", "Red", "Gray"];

  const make = makes[Math.floor(Math.random() * makes.length)];
  const model = models[make][Math.floor(Math.random() * models[make].length)];
  const year = 2018 + Math.floor(Math.random() * 7);
  const color = colors[Math.floor(Math.random() * colors.length)];
  const vin = `1HD${make.charAt(0).toUpperCase()}${Array(14).fill(0).map(() => "0123456789ABCDEFGHJKLMNPRSTUVWXYZ"[Math.floor(Math.random() * 33)]).join("")}`;

  return { make, model, year, color, vin };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
  storage: IStorage = new MemStorage(),
): Promise<Server> {

  const assessLimit = rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Too many assessments. Try again in a minute." } });

  app.get("/api/claims", async (req, res) => {
    try {
      const claims = await storage.getAllClaims();
      // Full uploaded image payloads are returned only by the detail route.
      res.json(claims);
    } catch (error) {
      if (error instanceof WorkflowError) return res.status(error.status).json({ error: error.message });
      res.status(500).json({ error: "Failed to fetch claims" });
    }
  });

  app.get("/api/claims/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const claim = await storage.getClaimById(id);
      if (!claim) {
        return res.status(404).json({ error: "Claim not found" });
      }
      res.json(claim);
    } catch (error) {
      if (error instanceof WorkflowError) return res.status(error.status).json({ error: error.message });
      res.status(500).json({ error: "Failed to fetch claim" });
    }
  });

  app.post("/api/claims/assess", assessLimit, async (req, res) => {
    try {
      const parsed = assessmentRequestSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Provide a valid imageData field." });
      let imageData: string;
      try { imageData = await normalizeImage(parsed.data.imageData); }
      catch (error) { return res.status(400).json({ error: (error as Error).message }); }

      const { damages, confidence } = generateSimulatedDamageAssessment();
      const vehicleInfo = generateMockVehicleInfo();
      const totalEstimate = damages.reduce((sum, d) => sum + d.laborCost + d.partsCost, 0);

      const claim = await storage.createClaim({
        policyNumber: `POL-${Math.floor(100000 + Math.random() * 900000)}`,
        vehicleInfo,
        claimDate: new Date().toISOString(),
        status: "in_review",
        imageUrl: imageData,
        damages,
        overallConfidence: confidence,
        totalEstimate,
      });

      res.json(claim);
    } catch (error) {
      if (error instanceof WorkflowError) return res.status(error.status).json({ error: error.message });
      res.status(500).json({ error: "Failed to process damage assessment" });
    }
  });

  app.patch("/api/claims/:claimId/damage/:damageId", async (req, res) => {
    try {
      const { claimId, damageId } = req.params;
      const parsed = updateDamageItemSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Provide valid severity, action and non-negative costs; no other fields can be edited." });
      const updates = parsed.data;

      const updatedDamage = await storage.updateDamageItem(claimId, damageId, updates);

      if (!updatedDamage) {
        return res.status(404).json({ error: "Damage item not found" });
      }

      res.json(updatedDamage);
    } catch (error) {
      if (error instanceof WorkflowError) return res.status(error.status).json({ error: error.message });
      res.status(500).json({ error: "Failed to update damage item" });
    }
  });

  app.patch("/api/claims/:id/notes", async (req, res) => {
    const parsed = claimNotesSchema.required().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Notes must be text of at most 5000 characters." });
    try {
      const claim = await storage.updateClaim(req.params.id, { agentNotes: parsed.data.notes });
      if (!claim) return res.status(404).json({ error: "Claim not found" });
      res.json(claim);
    } catch (error) {
      if (error instanceof WorkflowError) return res.status(error.status).json({ error: error.message });
      res.status(500).json({ error: "Failed to save notes" });
    }
  });

  app.post("/api/claims/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      const parsed = claimNotesSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Notes must be text of at most 5000 characters." });
      const { notes } = parsed.data;

      const updatedClaim = await storage.updateClaim(id, {
        status: "approved",
        ...(notes !== undefined ? { agentNotes: notes } : {}),
      });

      if (!updatedClaim) {
        return res.status(404).json({ error: "Claim not found" });
      }

      res.json(updatedClaim);
    } catch (error) {
      if (error instanceof WorkflowError) return res.status(error.status).json({ error: error.message });
      res.status(500).json({ error: "Failed to approve claim" });
    }
  });

  app.post("/api/claims/:id/flag", async (req, res) => {
    try {
      const { id } = req.params;
      const parsed = claimNotesSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Notes must be text of at most 5000 characters." });
      const { notes } = parsed.data;

      const updatedClaim = await storage.updateClaim(id, {
        status: "flagged",
        ...(notes !== undefined ? { agentNotes: notes } : {}),
      });

      if (!updatedClaim) {
        return res.status(404).json({ error: "Claim not found" });
      }

      res.json(updatedClaim);
    } catch (error) {
      if (error instanceof WorkflowError) return res.status(error.status).json({ error: error.message });
      res.status(500).json({ error: "Failed to flag claim" });
    }
  });

  return httpServer;
}
