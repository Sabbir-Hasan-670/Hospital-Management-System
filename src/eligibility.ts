// src/eligibility.ts
import { Router } from "express";

const router = Router();

router.post("/eligibility:check", (req, res) => {
  console.log("eligibility hit with body:", req.body);
  const { patientMrn, payerCode, policyNumber } = req.body || {};

  if (!patientMrn || !payerCode || !policyNumber) {
    return res.status(400).json({ error: "Missing fields" });
  }

  res.json({
    status: "active",
    plan: "Gold",
    benefits: [
      { type: "OPD", coverage: "80%" },
      { type: "Lab", coverage: "70%" }
    ]
  });
});

router.post("/eligibility:check", (req, res) => {
  const { patientMrn, nationalId, payerCode, policyNumber } = req.body || {};
  if (!patientMrn && !nationalId) return res.status(400).json({ error: "patientMrn or nationalId required" });
  // mock
  res.json({
    status: "active",
    plan: "Gold",
    payerCode,
    policyNumber,
    checkedBy: nationalId ? "GOVT-API" : "PAYER-API",
    benefits: [{ type: "OPD", coverage: "80%" }, { type: "Lab", coverage: "70%" }]
  });
});

export default router;
