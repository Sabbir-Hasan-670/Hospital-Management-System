// src/store.ts
export type Patient = {
  id: string;
  mrn: string;
  nationalId?: string;   // NEW
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  hasInsurance: boolean;
};

export type Doctor = {
  id: string;
  hospitalId: string;     // login
  fullName: string;
  specialty?: string;     // e.g., Cardiology, ENT, General
  roomId?: string | null;
  passwordHash: string;
};

export type FinanceStaff = {
  id: string;
  hospitalId: string;     // login
  fullName: string;
  passwordHash: string;
  role: "finance";
};

export type ITStaff = {
  id: string;
  hospitalId: string;   // login
  fullName: string;
  passwordHash: string;
  role: "it";
};

export type Room = {
  id: string;
  code: string;
  name?: string;
};

export type Encounter = {
  id: string;
  patientId: string;
  reason?: string;
  doctorId?: string | null;
  roomId?: string | null;
  startedAt?: number;
  finishedAt?: number | null;
  token?: string;         // D{HOSPITALID}-{YYYYMMDD}-{###}
};

export type Charge = {
  id: string;
  encounterId: string;
  code: string;           // service code
  description: string;
  qty: number;
  unitPrice: number;
};

export type Invoice = {
  id: string;
  encounterId: string;
  total: number;
  status: "unpaid" | "paid";
};

export type PrescriptionItem = {
  drug: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions?: string;
};

export type Prescription = {
  id: string;
  encounterId: string;
  doctorId: string;
  createdAt: number;
  items: PrescriptionItem[];
  notes?: string;
};

export type Service = {
  code: string;                 // unique
  name: string;
  price: number;
  specialties?: string[];       // if provided, restricted
  tags?: string[];              // e.g., ["LAB"] -> visible to all
};

export const db = {
  patients: [] as Patient[],
  doctors: [] as Doctor[],
  finance: [] as FinanceStaff[],
  it: [] as ITStaff[],
  rooms: [] as Room[],
  encounters: [] as Encounter[],
  charges: [] as Charge[],
  invoices: [] as Invoice[],
  prescriptions: [] as Prescription[],
  services: [
    { code: "CONSULT-GEN", name: "OPD Consultation", price: 150, specialties: ["General", "Family", "Internal Medicine"] },
    { code: "CONSULT-CARD", name: "Cardio Consultation", price: 220, specialties: ["Cardiology"] },
    { code: "CONSULT-ENT",  name: "ENT Consultation",   price: 200, specialties: ["ENT"] },
    { code: "XR-CHEST",     name: "X-Ray Chest",        price: 200, specialties: ["Radiology"] },
    // Labs (visible to all doctors)
    { code: "LAB-CBC", name: "CBC",                  price: 80,  tags: ["LAB"] },
    { code: "LAB-FBS", name: "Fasting Blood Sugar",  price: 60,  tags: ["LAB"] },
    { code: "LAB-LFT", name: "Liver Function Test",  price: 140, tags: ["LAB"] },
  ] as Service[],
};

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}
