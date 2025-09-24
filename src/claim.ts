// src/claim.ts
import { Router } from "express";
import { v4 as uuid } from "uuid";
import { requireFinance } from "./auth";

const router = Router();

/**
 * Submit a claim for adjudication (mock)
 * Body: { encounterId: string, coverageId: string }
 */
router.post("/claim:submit", (req, res) => {
  const { encounterId, coverageId } = req.body || {};
  if (!encounterId || !coverageId) {
    return res.status(400).json({ error: "encounterId and coverageId are required" });
  }

  const claimId = uuid();
  const externalId = "CLAIM-REQ-" + Math.floor(Math.random() * 100000);

  // Mock: accepted for processing
  return res.status(202).json({
    claimId,
    externalId,
    status: "submitted"
  });
});

/**
 * Get claim status (mock adjudication)
 * Path: /claim/:id/status
 */
router.get("/claim/:id/status", (req, res) => {
  const { id } = req.params;
  // Randomly pick a status for demo
  const statuses = ["processing", "approved", "denied", "partial"] as const;
  const pick = statuses[Math.floor(Math.random() * statuses.length)];

  const total = 350.0;
  const allowed = pick === "denied" ? 0 : (pick === "partial" ? 200 : 320);
  const paid = pick === "approved" ? 320 : (pick === "partial" ? 160 : 0);

  return res.json({
    claimId: id,
    status: pick,
    adjudication: {
      total,
      allowed,
      paid,
      reasons: pick === "denied" ? ["POLICY_EXPIRED"] : []
    }
  });
});

router.post("/claim:submit", requireFinance, (req: any, res) => {
  const { encounterId, coverageId } = req.body || {};
  if (!encounterId || !coverageId) return res.status(400).json({ error: "encounterId and coverageId are required" });
  res.status(202).json({ claimId: uuid(), externalId: "CLAIM-REQ-" + Math.floor(Math.random() * 100000), status: "submitted" });
});

router.get("/claim/:id/status", (_req, res) => {
  const statuses = ["processing", "approved", "denied", "partial"] as const;
  const pick = statuses[Math.floor(Math.random() * statuses.length)];
  const total = 350, allowed = pick === "denied" ? 0 : (pick === "partial" ? 200 : 320);
  const paid = pick === "approved" ? 320 : (pick === "partial" ? 160 : 0);
  res.json({ status: pick, adjudication: { total, allowed, paid, reasons: pick === "denied" ? ["POLICY_EXPIRED"] : [] } });
});


export default router;
