import { useEffect, useMemo, useState } from "react";
import { API, jfetch } from "../lib/api";
import Header from "../components/Header";

type Auth = { token:string; role:"doctor"; profile:{ id:string; hospitalId:string; fullName:string; specialty?:string } };
type Encounter = { id:string; patientId:string; token?:string };
type Service = { code:string; name:string; price:number; tags?:string[] };

export default function DoctorDashboard() {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [queue, setQueue] = useState<Encounter[]>([]);
  const [active, setActive] = useState<Encounter | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [charges, setCharges] = useState<any[]>([]);
  const [rx, setRx] = useState({ drug:"", dose:"", frequency:"", duration:"", instructions:"" });
  const [rxList, setRxList] = useState<any[]>([]);

  useEffect(() => {
    const a = localStorage.getItem("auth"); if (!a) { location.href="/doctor/login"; return; }
    const parsed = JSON.parse(a); if (parsed.role !== "doctor") { location.href="/doctor/login"; return; }
    setAuth(parsed);
  }, []);

  async function loadQueue() {
    const list = await jfetch(`${API}/queue?doctorId=${auth!.profile.id}`);
    setQueue(list);
  }
  async function openEncounter(id: string) {
    setActive(queue.find(q=>q.id===id) || null);
    const svc = await jfetch(`${API}/services?doctorId=${auth!.profile.id}`);
    setServices(svc);
    setCharges([]);
    const pres = await jfetch(`${API}/prescriptions?encounterId=${id}`);
    setRxList(pres);
  }
  async function addService(code: string) {
    if (!active) return;
    const c = await jfetch(`${API}/charges`, {
      method:"POST",
      headers:{ Authorization:`Bearer ${auth!.token}` },
      body: JSON.stringify({ encounterId: active.id, code, qty: 1 })
    });
    setCharges(prev => [c, ...prev]);
  }
  async function writeRx() {
    if (!active) return;
    const created = await jfetch(`${API}/prescriptions`, {
      method:"POST",
      headers:{ Authorization:`Bearer ${auth!.token}` },
      body: JSON.stringify({ encounterId: active.id, items:[rx] })
    });
    setRxList(prev => [created, ...prev]);
    setRx({ drug:"", dose:"", frequency:"", duration:"", instructions:"" });
  }

  const labs = useMemo(()=>services.filter(s => (s.tags||[]).includes("LAB")), [services]);
  const others = useMemo(()=>services.filter(s => !(s.tags||[]).includes("LAB")), [services]);

  if (!auth) return null;
  return (
    <div className="container">
      <div className="top-glow" /><div className="aurora" />
      <h1>Doctor Dashboard — {auth.profile.fullName}</h1>

      <div className="card">
        <div className="inputs">
          <button className="btn" onClick={loadQueue}>📋 Load My Queue</button>
          <select value={active?.id || ""} onChange={e=>openEncounter(e.target.value)}>
            <option value="">Select encounter</option>
            {queue.map(e => <option key={e.id} value={e.id}>{e.token || e.id}</option>)}
          </select>
          <a className="btn" href="/">🏢 Front Desk</a>
        </div>
      </div>

      {active && (
        <>
          <div className="card" style={{marginTop:16}}>
            <h2>Allowed Services</h2>
            <div className="inputs">
              {others.map(s => <button key={s.code} className="btn" onClick={()=>addService(s.code)}>+ {s.name} — {s.price}</button>)}
            </div>
            <h3>Labs</h3>
            <div className="inputs">
              {labs.map(s => <button key={s.code} className="btn" onClick={()=>addService(s.code)}>+ {s.name} — {s.price}</button>)}
            </div>
            {charges.length>0 && <pre>{JSON.stringify(charges, null, 2)}</pre>}
          </div>

          <div className="card" style={{marginTop:16}}>
            <h2>Prescription</h2>
            <div className="inputs">
              <input placeholder="Drug" value={rx.drug} onChange={e=>setRx({...rx, drug:e.target.value})}/>
              <input placeholder="Dose" value={rx.dose} onChange={e=>setRx({...rx, dose:e.target.value})}/>
              <input placeholder="Frequency" value={rx.frequency} onChange={e=>setRx({...rx, frequency:e.target.value})}/>
              <input placeholder="Duration" value={rx.duration} onChange={e=>setRx({...rx, duration:e.target.value})}/>
              <input placeholder="Instructions" value={rx.instructions} onChange={e=>setRx({...rx, instructions:e.target.value})}/>
              <button className="btn accent" onClick={writeRx}>📝 Save Rx</button>
            </div>
            {rxList.length>0 && <pre>{JSON.stringify(rxList, null, 2)}</pre>}
          </div>
        </>
      )}
     <div className="container">
      <div className="top-glow" /><div className="aurora" />
       <a className="btn" href="/">🏠 Home</a>
    </div>
    </div>
  );
}
