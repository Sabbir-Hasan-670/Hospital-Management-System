// src/admin.ts
import { Router } from "express";
import { v4 as uuid } from "uuid";
import bcrypt from "bcryptjs";
import { db, Doctor, Service } from "./store";
import { requireIT } from "./auth";

const router = Router();

// list doctors & services (IT only)
router.get("/admin/doctors", requireIT, (_req, res) => {
  res.json(db.doctors.map(d => ({ id:d.id, hospitalId:d.hospitalId, fullName:d.fullName, specialty:d.specialty })));
});
router.get("/admin/services", requireIT, (_req, res) => {
  res.json(db.services);
});

// create doctor
router.post("/admin/doctors", requireIT, async (req, res) => {
  const { hospitalId, fullName, specialty, password } = req.body || {};
  if (!hospitalId || !fullName || !password) return res.status(400).json({ error: "hospitalId, fullName, password required" });
  if (db.doctors.find(d => d.hospitalId === hospitalId)) return res.status(409).json({ error: "hospitalId exists" });
  const passwordHash = await bcrypt.hash(String(password), 10);
  const doc: Doctor = { id: uuid(), hospitalId, fullName, specialty, roomId: null, passwordHash };
  db.doctors.push(doc);
  res.status(201).json({ id: doc.id, hospitalId, fullName, specialty });
});

// add/update service
router.post("/admin/services", requireIT, (req, res) => {
  const { code, name, price, specialties, isLab } = req.body || {};
  if (!code || !name || (price === undefined)) return res.status(400).json({ error: "code, name, price required" });
  const existing = db.services.find(s => s.code === code);
  const payload: Service = { code, name, price: Number(price), specialties: specialties?.length ? specialties : undefined, tags: isLab ? ["LAB"] : undefined };
  if (existing) {
    Object.assign(existing, payload);
    return res.json(existing);
  }
  db.services.push(payload);
  res.status(201).json(payload);
});

// delete service
router.delete("/admin/services/:code", requireIT, (req, res) => {
  const { code } = req.params;
  const idx = db.services.findIndex(s => s.code === code);
  if (idx === -1) return res.status(404).json({ error: "Service not found" });
  const removed = db.services.splice(idx, 1)[0];
  res.json({ ok: true, removed });
});

export default router;
