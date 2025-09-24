// src/billing.ts
import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db, Invoice } from "./store";

const router = Router();

/**
 * POST /billing/invoices:selfpay
 * Body: { encounterId }
 * Logic: encounter-এর সব charges যোগ করে invoice.total বানাবে; status='unpaid'
 */
router.post("/billing/invoices:selfpay", (req, res) => {
  const { encounterId } = req.body || {};
  if (!encounterId) return res.status(400).json({ error: "encounterId required" });
  const enc = db.encounters.find(e => e.id === encounterId);
  if (!enc) return res.status(404).json({ error: "Encounter not found" });

  const patient = db.patients.find(p => p.id === enc.patientId);
  if (!patient) return res.status(404).json({ error: "Patient not found" });

  // Self-pay rule: patient.hasInsurance === false হলে সরাসরি invoice
  if (patient.hasInsurance) {
    return res.status(409).json({ error: "Patient has insurance; use claim flow instead" });
  }

  const lines = db.charges.filter(c => c.encounterId === encounterId);
  const total = lines.reduce((sum, c) => sum + c.qty * c.unitPrice, 0);

  const inv: Invoice = {
    id: uuid(),
    encounterId,
    total: Math.round(total * 100) / 100,
    status: "unpaid",
  };
  db.invoices.push(inv);
  return res.status(201).json(inv);
});

/** POST /billing/pay  Body: { invoiceId }  -> marks invoice paid */
router.post("/billing/pay", (req, res) => {
  const { invoiceId } = req.body || {};
  const inv = db.invoices.find(i => i.id === invoiceId);
  if (!inv) return res.status(404).json({ error: "Invoice not found" });
  inv.status = "paid";
  return res.json(inv);
});

/** GET /billing/invoices?encounterId=... */
router.get("/billing/invoices", (req, res) => {
  const { encounterId } = req.query as { encounterId?: string };
  if (encounterId) {
    return res.json(db.invoices.filter(i => i.encounterId === encounterId));
  }
  return res.json(db.invoices);
});

export default router;
