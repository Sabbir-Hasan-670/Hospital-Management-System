// src/patients_update.ts
import { Router } from "express";
import { db } from "./store";

const router = Router();

// PATCH /patients/:id
router.patch("/patients/:id", (req, res) => {
  const { id } = req.params;
  const p = db.patients.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: "Patient not found" });
  const { mrn, nationalId, firstName, lastName, phone, email, hasInsurance } = req.body || {};
  if (mrn !== undefined) p.mrn = String(mrn);
  if (nationalId !== undefined) p.nationalId = String(nationalId);
  if (firstName !== undefined) p.firstName = String(firstName);
  if (lastName !== undefined) p.lastName = String(lastName);
  if (phone !== undefined) p.phone = String(phone);
  if (email !== undefined) p.email = String(email);
  if (hasInsurance !== undefined) p.hasInsurance = Boolean(hasInsurance);
  res.json(p);
});

export default router;
