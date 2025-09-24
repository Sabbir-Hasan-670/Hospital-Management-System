// src/rooms.ts
import { Router } from "express";
import { db, Room } from "./store";
import { v4 as uuid } from "uuid";
const router = Router();
router.post("/rooms", (req, res) => {
  const { code, name } = req.body || {};
  if (!code) return res.status(400).json({ error: "code required" });
  if (db.rooms.find(r => r.code === code)) return res.status(409).json({ error: "code exists" });
  const room: Room = { id: uuid(), code, name };
  db.rooms.push(room);
  res.status(201).json(room);
});
router.get("/rooms", (_req, res) => res.json(db.rooms));
export default router;
