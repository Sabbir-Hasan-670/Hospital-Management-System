// src/appointments.ts
import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db, Encounter, todayKey } from "./store";

const router = Router();

function nextTokenForDoctor(doctorHospitalId: string) {
  const day = todayKey();
  const prefix = `D${doctorHospitalId}-${day}-`;
  const existing = db.encounters
    .filter(e => e.token?.startsWith(prefix))
    .map(e => Number(e.token!.slice(prefix.length)))
    .filter(n => !Number.isNaN(n));
  const next = (existing.length ? Math.max(...existing) : 0) + 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

// Front desk: create encounter & assign doctor/room
router.post("/appointments", (req, res) => {
  const { patientId, doctorId, roomId, reason } = req.body || {};
  if (!patientId || !doctorId) return res.status(400).json({ error: "patientId and doctorId required" });
  const patient = db.patients.find(p => p.id === patientId);
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  const doctor = db.doctors.find(d => d.id === doctorId);
  if (!doctor) return res.status(404).json({ error: "Doctor not found" });
  if (roomId && !db.rooms.find(r => r.id === roomId)) return res.status(404).json({ error: "Room not found" });

  const token = nextTokenForDoctor(doctor.hospitalId);
  const enc: Encounter = {
    id: uuid(),
    patientId: patient.id,
    reason,
    doctorId: doctor.id,
    roomId: roomId || doctor.roomId || null,
    startedAt: Date.now(),
    finishedAt: null,
    token,
  };
  db.encounters.push(enc);
  return res.status(201).json(enc);
});

router.get("/queue", (req, res) => {
  const { doctorId } = req.query as any;
  if (!doctorId) return res.status(400).json({ error: "doctorId required" });
  const doc = db.doctors.find(d => d.id === doctorId);
  if (!doc) return res.status(404).json({ error: "Doctor not found" });
  const day = todayKey();
  const list = db.encounters
    .filter(e => e.doctorId === doctorId && e.token?.includes(`D${doc.hospitalId}-${day}-`))
    .sort((a, b) => (a.token! < b.token! ? -1 : 1));
  res.json(list);
});

export default router;
