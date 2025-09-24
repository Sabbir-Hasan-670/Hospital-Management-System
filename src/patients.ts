// src/patients.ts
import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db, Patient } from "./store";

const router = Router();

// POST /patients
router.post("/patients", (req, res) => {
  const { mrn, nationalId, firstName, lastName, phone, email, hasInsurance } = req.body || {};
  if (!mrn || !firstName || !lastName || typeof hasInsurance !== "boolean") {
    return res.status(400).json({ error: "mrn, firstName, lastName, hasInsurance required" });
  }
  if (db.patients.find(p => p.mrn === mrn)) {
    return res.status(409).json({ error: "MRN already exists" });
  }
  const patient: Patient = { id: uuid(), mrn, nationalId, firstName, lastName, phone, email, hasInsurance };
  db.patients.push(patient);
  return res.status(201).json(patient);
});

// GET /patients or /patients?mrn=...
router.get("/patients", (req, res) => {
  const { mrn } = req.query as { mrn?: string };
  if (mrn) {
    const p = db.patients.find(x => x.mrn === mrn);
    return p ? res.json(p) : res.status(404).json({ error: "Not found" });
  }
  return res.json(db.patients);
});

export default router;
