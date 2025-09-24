import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_API_URL as string;

/* ---- helper ---- */
async function jfetch(url: string, init: RequestInit = {}) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json", ...(init.headers || {}) }, ...init });
  let data: any = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error((data && (data.error || data.message)) || res.statusText);
  return data;
}
const fadeUp = { hidden: {opacity:0,y:12}, show:{opacity:1,y:0,transition:{duration:.35}} };

type Doctor = { id:string; hospitalId:string; fullName:string; specialty?:string; roomId?:string|null };
type Room   = { id:string; code:string; name?:string };
type Encounter = { id:string; patientId:string; reason?:string; doctorId?:string|null; roomId?:string|null; token?:string };
type Service = { code:string; name:string; price:number; specialties?:string[]; tags?:string[] };

export default function App() {
  /* THEME */
  const [theme, setTheme] = useState<"dark"|"light">(() => (localStorage.getItem("theme") as any) || "dark");
  useEffect(()=>{ document.documentElement.classList.toggle("light", theme==="light"); localStorage.setItem("theme", theme); },[theme]);

  /* -------- Front Desk: register patient (from previous flow) -------- */
  const [patientForm, setPatientForm] = useState({ mrn:"", firstName:"", lastName:"", phone:"", hasInsurance:false });
  const [patient, setPatient] = useState<any>(null);

  async function createPatient() {
    if (!patientForm.mrn || !patientForm.firstName || !patientForm.lastName) return alert("Fill MRN/First/Last");
    try {
      const data = await jfetch(`${API}/patients`, { method:"POST", body: JSON.stringify(patientForm) });
      setPatient(data);
      alert("Patient created ✅");
    } catch(e:any){ alert(e.message); }
  }

  /* -------- Front Desk: Create appointment (select doctor/room) -------- */
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [aptEncounter, setAptEncounter] = useState<Encounter|null>(null);

  async function loadDoctorsRooms() {
    const [d, r] = await Promise.all([
      jfetch(`${API}/doctors`),
      jfetch(`${API}/rooms`),
    ]);
    setDoctors(d); setRooms(r);
    if (d[0]) setSelectedDoctorId(d[0].id);
    if (r[0]) setSelectedRoomId(r[0].id);
  }
  useEffect(()=>{ loadDoctorsRooms().catch(()=>{}); },[]);

  async function createAppointment() {
    if (!patient?.id) return alert("Create/select patient first");
    if (!selectedDoctorId) return alert("Select a doctor");
    const data = await jfetch(`${API}/appointments`, {
      method:"POST",
      body: JSON.stringify({ patientId: patient.id, doctorId: selectedDoctorId, roomId: selectedRoomId || undefined, reason:"OPD" })
    });
    setAptEncounter(data);
    alert(`Appointment created, token: ${data.token}`);
  }

  /* -------- Doctor: login + my queue + services + add service -------- */
  const [login, setLogin] = useState({ hospitalId:"DOC-1001", password:"pass123" });
  const [token, setToken] = useState<string>("");
  const [me, setMe] = useState<Doctor|null>(null);
  const [queue, setQueue] = useState<Encounter[]>([]);
  const [activeEncounter, setActiveEncounter] = useState<Encounter|null>(null);
  const [myServices, setMyServices] = useState<Service[]>([]);
  const [addedCharges, setAddedCharges] = useState<any[]>([]);

  async function doctorLogin() {
    try {
      const res = await jfetch(`${API}/auth/login`, { method:"POST", body: JSON.stringify(login) });
      setToken(res.token);
      setMe(res.doctor);
      alert(`Welcome, ${res.doctor.fullName}`);
    } catch(e:any){ alert(e.message); }
  }

  async function loadMyQueue() {
    if (!me) return;
    const list = await jfetch(`${API}/queue?doctorId=${me.id}`);
    setQueue(list);
  }

  async function openEncounter(eid: string) {
    const enc = (await jfetch(`${API}/queue?doctorId=${me!.id}`) as Encounter[]).find(e => e.id === eid) || null;
    setActiveEncounter(enc);
    const services = await jfetch(`${API}/services?doctorId=${me!.id}`);
    setMyServices(services);
    setAddedCharges([]);
  }

  async function addServiceToEncounter(code: string) {
    if (!activeEncounter) return;
    try {
      const charge = await jfetch(`${API}/charges`, {
        method:"POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ encounterId: activeEncounter.id, code, qty: 1 })
      });
      setAddedCharges(c => [charge, ...c]);
    } catch(e:any){ alert(e.message); }
  }

  /* ---- UI helpers ---- */
  const card: React.CSSProperties = { border:"1px solid var(--card-stroke)", borderRadius:16, padding:16, background:"linear-gradient(180deg, var(--card), color-mix(in oklab, var(--card) 70%, transparent))", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)" };
  const labs = useMemo(()=>myServices.filter(s=> (s.tags||[]).includes("LAB")), [myServices]);
  const nonLabs = useMemo(()=>myServices.filter(s=> !(s.tags||[]).includes("LAB")), [myServices]);

  return (
    <>
      <div className="top-glow" /><div className="aurora" />
      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="brand">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l2.2 6.7h7L15.5 12l2.2 6.7L12 15.4 6.3 18.7 8.5 12 2.8 8.7h7L12 2z" fill="var(--accent)" opacity=".9"/>
            </svg>
            <div>HIS Demo <span className="badge">Front Desk & Doctor</span></div>
          </div>
          <button className="btn" onClick={()=>setTheme(t=>t==="dark"?"light":"dark")}>{theme==="dark"?"🌤️ Light":"🌙 Dark"}</button>
        </div>

        {/* FRONT DESK: Patient registration */}
        <motion.div style={card} variants={fadeUp} initial="hidden" animate="show">
          <h2>Front Desk — Register Patient</h2>
          <div className="inputs">
            <input placeholder="MRN (unique)" value={patientForm.mrn} onChange={e=>setPatientForm({...patientForm, mrn:e.target.value})}/>
            <button className="btn" onClick={()=>setPatientForm(f=>({...f, mrn:`MRN-${Date.now()}`}))}>🔁 Random MRN</button>
            <input placeholder="First name" value={patientForm.firstName} onChange={e=>setPatientForm({...patientForm, firstName:e.target.value})}/>
            <input placeholder="Last name" value={patientForm.lastName} onChange={e=>setPatientForm({...patientForm, lastName:e.target.value})}/>
            <input placeholder="Phone" value={patientForm.phone} onChange={e=>setPatientForm({...patientForm, phone:e.target.value})}/>
            <select value={String(patientForm.hasInsurance)} onChange={e=>setPatientForm({...patientForm, hasInsurance: e.target.value==="true"})}>
              <option value="false">No insurance (Self-Pay)</option>
              <option value="true">Has insurance</option>
            </select>
            <button className="btn accent" onClick={createPatient}>➕ Create Patient</button>
          </div>
          {patient && <pre>{JSON.stringify(patient, null, 2)}</pre>}
        </motion.div>

        {/* FRONT DESK: Appointment (select doctor from DB, room optional) */}
        <motion.div style={{...card, marginTop:16}} variants={fadeUp} initial="hidden" animate="show">
          <h2>Front Desk — Appointment (Assign Doctor & Room)</h2>
          <div className="inputs">
            <select value={selectedDoctorId} onChange={e=>setSelectedDoctorId(e.target.value)}>
              {doctors.map(d=> <option key={d.id} value={d.id}>{d.fullName} ({d.specialty || "General"}) — {d.hospitalId}</option>)}
            </select>
            <select value={selectedRoomId} onChange={e=>setSelectedRoomId(e.target.value)}>
              <option value="">(No room)</option>
              {rooms.map(r=> <option key={r.id} value={r.id}>{r.code} {r.name ? `— ${r.name}`: ""}</option>)}
            </select>
            <button className="btn accent" onClick={createAppointment}>🎟️ Create Appointment</button>
          </div>
          {aptEncounter && <pre>{JSON.stringify(aptEncounter, null, 2)}</pre>}
        </motion.div>

        {/* DOCTOR: Login */}
        <motion.div style={{...card, marginTop:16}} variants={fadeUp} initial="hidden" animate="show">
          <h2>Doctor — Login</h2>
          <div className="inputs">
            <input placeholder="Hospital ID (e.g., DOC-1001)" value={login.hospitalId} onChange={e=>setLogin({...login, hospitalId:e.target.value})}/>
            <input placeholder="Password" type="password" value={login.password} onChange={e=>setLogin({...login, password:e.target.value})}/>
            <button className="btn accent" onClick={doctorLogin}>🔐 Login</button>
            <button className="btn" onClick={loadMyQueue} disabled={!me}>📋 My Queue (Today)</button>
          </div>
          {me && <pre>{JSON.stringify(me, null, 2)}</pre>}
        </motion.div>

        {/* DOCTOR: Queue & Services */}
        <motion.div style={{...card, marginTop:16}} variants={fadeUp} initial="hidden" animate="show">
          <h2>Doctor — Queue & Services</h2>
          {me ? (
            <>
              <div className="inputs">
                <select onChange={e=>openEncounter(e.target.value)} value={activeEncounter?.id || ""}>
                  <option value="">Select encounter from queue</option>
                  {queue.map(e => <option key={e.id} value={e.id}>{e.token || e.id}</option>)}
                </select>
                <button className="btn" onClick={loadMyQueue}>🔄 Refresh Queue</button>
              </div>

              {activeEncounter && (
                <>
                  <h4>Allowed Services</h4>
                  <div className="inputs">
                    {nonLabs.map(s =>
                      <button key={s.code} className="btn" onClick={()=>addServiceToEncounter(s.code)}>
                        + {s.name} ({s.code}) — {s.price}
                      </button>
                    )}
                  </div>
                  <h4>Labs (visible to all doctors)</h4>
                  <div className="inputs">
                    {labs.map(s =>
                      <button key={s.code} className="btn" onClick={()=>addServiceToEncounter(s.code)}>
                        + {s.name} — {s.price}
                      </button>
                    )}
                  </div>

                  {addedCharges.length>0 && (
                    <>
                      <h4>Recently added charges</h4>
                      <table className="table">
                        <thead><tr><th>Code</th><th>Description</th><th>Qty</th><th>Unit</th></tr></thead>
                        <tbody>{addedCharges.map((c:any)=>(
                          <tr key={c.id}><td>{c.code}</td><td>{c.description}</td><td>{c.qty}</td><td>{c.unitPrice}</td></tr>
                        ))}</tbody>
                      </table>
                    </>
                  )}
                </>
              )}
            </>
          ) : (<p>Login as a doctor to view queue and services.</p>)}
        </motion.div>
      </div>
    </>
  );
}
