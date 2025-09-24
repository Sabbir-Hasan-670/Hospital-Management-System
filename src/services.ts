// src/services.ts
import { Router } from "express";
import { db } from "./store";
const router = Router();

router.get("/services", (req, res) => {
  const { doctorId } = req.query as any;
  if (!doctorId) return res.status(400).json({ error: "doctorId required" });
  const doc = db.doctors.find(d => d.id === doctorId);
  if (!doc) return res.status(404).json({ error: "Doctor not found" });

  const allowed = db.services.filter(s => {
    const isLab = (s.tags || []).includes("LAB");
    const specOk = !s.specialties || (doc.specialty && s.specialties.includes(doc.specialty));
    return isLab || specOk;
  });

  res.json(allowed);
});

export default router;
