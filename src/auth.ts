// src/auth.ts
import { Router, Request, Response, NextFunction } from "express";
import { db, Doctor, FinanceStaff } from "./store";
import { v4 as uuid } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ITStaff } from "./store";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

/* ====== Middlewares ====== */
export function requireDoctor(req: Request & { doctor?: Doctor }, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Missing Authorization header" });
  const token = header.replace(/^Bearer\s+/i, "");
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.role !== "doctor") return res.status(403).json({ error: "Doctor role required" });
    const doc = db.doctors.find(d => d.id === payload.id);
    if (!doc) return res.status(401).json({ error: "Doctor not found" });
    (req as any).doctor = doc;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireFinance(req: Request & { finance?: FinanceStaff }, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Missing Authorization header" });
  const token = header.replace(/^Bearer\s+/i, "");
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.role !== "finance") return res.status(403).json({ error: "Finance role required" });
    const fin = db.finance.find(f => f.id === payload.id);
    if (!fin) return res.status(401).json({ error: "Finance user not found" });
    (req as any).finance = fin;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireIT(req: Request & { it?: ITStaff }, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Missing Authorization header" });
  const token = header.replace(/^Bearer\s+/i, "");
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.role !== "it") return res.status(403).json({ error: "IT role required" });
    const it = db.it.find(x => x.id === payload.id);
    if (!it) return res.status(401).json({ error: "IT user not found" });
    (req as any).it = it;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}


/* ====== Bootstrap (demo) ====== */
// POST /auth/doctor:bootstrap { hospitalId, fullName, specialty?, password }
router.post("/doctor:bootstrap", async (req, res) => {
  const { hospitalId, fullName, specialty, password } = req.body || {};
  if (!hospitalId || !fullName || !password) return res.status(400).json({ error: "hospitalId, fullName, password required" });
  if (db.doctors.find(d => d.hospitalId === hospitalId)) return res.status(409).json({ error: "hospitalId exists" });
  const passwordHash = await bcrypt.hash(String(password), 10);
  const doc: Doctor = { id: uuid(), hospitalId, fullName, specialty, roomId: null, passwordHash };
  db.doctors.push(doc);
  res.status(201).json({ id: doc.id, hospitalId: doc.hospitalId, fullName: doc.fullName, specialty: doc.specialty });
});

router.post("/it:bootstrap", async (req, res) => {
  const { hospitalId, fullName, password } = req.body || {};
  if (!hospitalId || !fullName || !password) return res.status(400).json({ error: "hospitalId, fullName, password required" });
  if (db.it.find(u => u.hospitalId === hospitalId)) return res.status(409).json({ error: "hospitalId exists" });
  const passwordHash = await bcrypt.hash(String(password), 10);
  const user: ITStaff = { id: uuid(), hospitalId, fullName, passwordHash, role: "it" };
  db.it.push(user);
  res.status(201).json({ id: user.id, hospitalId: user.hospitalId, fullName: user.fullName, role: user.role });
});

// POST /auth/finance:bootstrap { hospitalId, fullName, password }
router.post("/finance:bootstrap", async (req, res) => {
  const { hospitalId, fullName, password } = req.body || {};
  if (!hospitalId || !fullName || !password) return res.status(400).json({ error: "hospitalId, fullName, password required" });
  if (db.finance.find(f => f.hospitalId === hospitalId)) return res.status(409).json({ error: "hospitalId exists" });
  const passwordHash = await bcrypt.hash(String(password), 10);
  const fin: FinanceStaff = { id: uuid(), hospitalId, fullName, passwordHash, role: "finance" };
  db.finance.push(fin);
  res.status(201).json({ id: fin.id, hospitalId: fin.hospitalId, fullName: fin.fullName, role: fin.role });
});

/* ====== Login (doctor or finance) ====== */
// POST /auth/login { hospitalId, password } -> { token, role, profile }
router.post("/login", async (req, res) => {
  const { hospitalId, password } = req.body || {};
  const doc = db.doctors.find(d => d.hospitalId === hospitalId);
  if (doc) {
    const ok = await bcrypt.compare(String(password || ""), doc.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: doc.id, role: "doctor" }, JWT_SECRET, { expiresIn: "12h" });
    return res.json({ token, role: "doctor", profile: { id: doc.id, hospitalId: doc.hospitalId, fullName: doc.fullName, specialty: doc.specialty } });
  }
  const fin = db.finance.find(f => f.hospitalId === hospitalId);
  if (fin) {
    const ok = await bcrypt.compare(String(password || ""), fin.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: fin.id, role: "finance" }, JWT_SECRET, { expiresIn: "12h" });
    return res.json({ token, role: "finance", profile: { id: fin.id, hospitalId: fin.hospitalId, fullName: fin.fullName } });
  }
  const it = db.it.find(u => u.hospitalId === hospitalId);
if (it) {
  const ok = await bcrypt.compare(String(password || ""), it.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: it.id, role: "it" }, JWT_SECRET, { expiresIn: "12h" });
  return res.json({ token, role: "it", profile: { id: it.id, hospitalId: it.hospitalId, fullName: it.fullName } });
}
  return res.status(401).json({ error: "Invalid credentials" });
});

export default router;
