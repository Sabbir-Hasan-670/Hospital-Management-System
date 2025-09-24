// src/prescriptions.ts
import { Router } from "express";
import { db, Prescription, PrescriptionItem } from "./store";
import { v4 as uuid } from "uuid";
import { requireDoctor } from "./auth";

const router = Router();

router.post("/prescriptions", requireDoctor, (req: any, res) => {
  const { encounterId, items, notes } = req.body || {};
  if (!encounterId || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: "encounterId and items[] required" });

  const enc = db.encounters.find(e => e.id === encounterId);
  if (!enc) return res.status(404).json({ error: "Encounter not found" });

  const clean: PrescriptionItem[] = items.map((i: any) => ({
    drug: String(i.drug || ""), dose: String(i.dose || ""), frequency: String(i.frequency || ""), duration: String(i.duration || ""), instructions: i.instructions
  })).filter(i => i.drug && i.dose && i.frequency && i.duration);

  if (!clean.length) return res.status(400).json({ error: "Invalid items" });

  const rx: Prescription = { id: uuid(), encounterId, doctorId: req.doctor.id, createdAt: Date.now(), items: clean, notes };
  db.prescriptions.push(rx);
  res.status(201).json(rx);
});

router.get("/prescriptions", (req, res) => {
  const { encounterId } = req.query as any;
  if (encounterId) return res.json(db.prescriptions.filter(p => p.encounterId === encounterId));
  res.json(db.prescriptions);
});

export default router;
