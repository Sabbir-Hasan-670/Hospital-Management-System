import { Router } from "express";
import { v4 as uuid } from "uuid";

const router = Router();

/**
 * Expected body:
 * {
 *   "encounterId": "string-or-uuid",
 *   "sbsCodes": ["SBS-99213"],         // procedure codes
 *   "diagnosisCodes": ["J10.1"],       // ICD-10-AM
 *   "attachments": [{ "filename": "note.pdf", "contentBase64": "..." }]
 * }
 */
router.post("/auth:submit", (req, res) => {
  const { encounterId, sbsCodes, diagnosisCodes } = req.body || {};
  if (!encounterId || !Array.isArray(sbsCodes) || !Array.isArray(diagnosisCodes)) {
    return res.status(400).json({ error: "Invalid or missing fields" });
  }

  const claimId = uuid();
  const externalId = "AUTH-REQ-" + Math.floor(Math.random() * 100000);

  // Mock response: pretend the payer accepted the request for processing
  return res.status(202).json({
    claimId,
    externalId,
    status: "submitted"
  });
});

router.post("/auth:submit", (req, res) => {
  const { encounterId, sbsCodes, diagnosisCodes } = req.body || {};
  if (!encounterId || !Array.isArray(sbsCodes) || !Array.isArray(diagnosisCodes)) {
    return res.status(400).json({ error: "Invalid or missing fields" });
  }
  res.status(202).json({ claimId: uuid(), externalId: "AUTH-REQ-" + Math.floor(Math.random() * 100000), status: "submitted" });
});

export default router;
