// src/doctors.ts
import { Router } from "express";
import { db } from "./store";
const router = Router();
router.get("/doctors", (_req, res) => {
  const list = db.doctors.map(d => ({ id: d.id, hospitalId: d.hospitalId, fullName: d.fullName, specialty: d.specialty, roomId: d.roomId }));
  res.json(list);
});
router.patch("/doctors/:id/assign-room", (req, res) => {
  const { id } = req.params; const { roomId } = req.body || {};
  const doc = db.doctors.find(d => d.id === id);
  if (!doc) return res.status(404).json({ error: "Doctor not found" });
  if (roomId && !db.rooms.find(r => r.id === roomId)) return res.status(404).json({ error: "Room not found" });
  doc.roomId = roomId || null; res.json({ ok: true, doctor: { id: doc.id, roomId: doc.roomId } });
});
export default router;
