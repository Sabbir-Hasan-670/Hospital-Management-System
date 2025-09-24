// src/encounters.ts
import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db, Encounter } from "./store";
import { requireDoctor } from "./auth";

const router = Router();

// Front desk: plain encounter (optional) — kept for compatibility
router.post("/encounters", (req, res) => {
  const { patientId, reason } = req.body || {};
  if (!patientId) return res.status(400).json({ error: "patientId required" });
  if (!db.patients.find(p => p.id === patientId)) return res.status(404).json({ error: "Patient not found" });

  const enc: Encounter = { id: uuid(), patientId, reason, doctorId: null, roomId: null, startedAt: Date.now(), finishedAt: null };
  db.encounters.push(enc);
  return res.status(201).json(enc);
});

// Doctor-only charge add, with service permission checks
router.post("/charges", requireDoctor, (req: any, res) => {
  const { encounterId, code, qty } = req.body || {};
  if (!encounterId || !code || !qty) return res.status(400).json({ error: "encounterId, code, qty required" });

  const enc = db.encounters.find(e => e.id === encounterId);
  if (!enc) return res.status(404).json({ error: "Encounter not found" });
  if (enc.doctorId && enc.doctorId !== req.doctor.id) return res.status(403).json({ error: "Not your encounter" });
  if (!enc.doctorId) enc.doctorId = req.doctor.id;

  const svc = db.services.find(s => s.code === code);
  if (!svc) return res.status(404).json({ error: "Service not found" });
  const isLab = (svc.tags || []).includes("LAB");
  const specOk = !svc.specialties || (req.doctor.specialty && svc.specialties.includes(req.doctor.specialty));
  if (!isLab && !specOk) return res.status(403).json({ error: "Service not allowed" });

  const charge = { id: uuid(), encounterId, code, description: svc.name, qty: Number(qty), unitPrice: svc.price };
  db.charges.push(charge);
  res.status(201).json(charge);
});

export default router;
