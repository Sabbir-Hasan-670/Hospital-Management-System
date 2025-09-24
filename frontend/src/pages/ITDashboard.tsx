import { useEffect, useState } from "react";
import { API, jfetch } from "../lib/api";

type ITAuth = { token:string; role:"it"; profile:{ id:string; hospitalId:string; fullName:string } };
type Doctor = { id:string; hospitalId:string; fullName:string; specialty?:string };
type Service = { code:string; name:string; price:number; specialties?:string[]; tags?:string[] };

export default function ITDashboard() {
  const [auth, setAuth] = useState<ITAuth|null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [docForm, setDocForm] = useState({ hospitalId:"DOC-2001", fullName:"Dr. New", specialty:"General", password:"pass123" });
  const [svcForm, setSvcForm] = useState({ code:"CONSULT-NEW", name:"New Consult", price:150, specialties:"General", isLab:false });

  useEffect(() => {
    const a = localStorage.getItem("auth"); if (!a) { location.href="/it/login"; return; }
    const parsed = JSON.parse(a); if (parsed.role !== "it") { location.href="/it/login"; return; }
    setAuth(parsed);
    refresh();
  }, []);

  async function refresh() {
    const [d, s] = await Promise.all([
      jfetch(`${API}/admin/doctors`, { headers:{ Authorization:`Bearer ${JSON.parse(localStorage.getItem("auth")!).token}` } }),
      jfetch(`${API}/admin/services`, { headers:{ Authorization:`Bearer ${JSON.parse(localStorage.getItem("auth")!).token}` } }),
    ]);
    setDoctors(d); setServices(s);
  }

  async function addDoctor() {
    await jfetch(`${API}/admin/doctors`, {
      method:"POST",
      headers:{ Authorization:`Bearer ${auth!.token}` },
      body: JSON.stringify(docForm)
    });
    alert("Doctor added ✅"); refresh();
  }

  async function saveService() {
    const payload = {
      code: svcForm.code, name: svcForm.name, price: Number(svcForm.price),
      specialties: svcForm.isLab ? [] : svcForm.specialties.split(",").map(s=>s.trim()).filter(Boolean),
      isLab: svcForm.isLab
    };
    await jfetch(`${API}/admin/services`, {
      method:"POST",
      headers:{ Authorization:`Bearer ${auth!.token}` },
      body: JSON.stringify(payload)
    });
    alert("Service saved ✅"); refresh();
  }

  async function deleteService(code:string) {
    if (!confirm(`Delete ${code}?`)) return;
    await jfetch(`${API}/admin/services/${code}`, {
      method:"DELETE",
      headers:{ Authorization:`Bearer ${auth!.token}` }
    });
    refresh();
  }

  if (!auth) return null;
  return (
    <div className="container">
      <div className="top-glow"/><div className="aurora"/>
      <h1>IT Dashboard — {auth.profile.fullName}</h1>

      <div className="card">
        <h2>Add Doctor</h2>
        <div className="inputs">
          <input placeholder="Hospital ID" value={docForm.hospitalId} onChange={e=>setDocForm({...docForm, hospitalId:e.target.value})}/>
          <input placeholder="Full name" value={docForm.fullName} onChange={e=>setDocForm({...docForm, fullName:e.target.value})}/>
          <input placeholder="Specialty" value={docForm.specialty} onChange={e=>setDocForm({...docForm, specialty:e.target.value})}/>
          <input placeholder="Password" type="password" value={docForm.password} onChange={e=>setDocForm({...docForm, password:e.target.value})}/>
          <button className="btn accent" onClick={addDoctor}>➕ Add Doctor</button>
        </div>
        <h4>Doctors</h4>
        <ul>{doctors.map(d=> <li key={d.id}>{d.fullName} — {d.hospitalId} ({d.specialty||"General"})</li>)}</ul>
      </div>

      <div className="card" style={{marginTop:16}}>
        <h2>Add / Update Service</h2>
        <div className="inputs">
          <input placeholder="Code" value={svcForm.code} onChange={e=>setSvcForm({...svcForm, code:e.target.value})}/>
          <input placeholder="Name" value={svcForm.name} onChange={e=>setSvcForm({...svcForm, name:e.target.value})}/>
          <input placeholder="Price" type="number" value={svcForm.price} onChange={e=>setSvcForm({...svcForm, price:Number(e.target.value)})}/>
          <input placeholder="Specialties (comma-separated)" disabled={svcForm.isLab} value={svcForm.specialties} onChange={e=>setSvcForm({...svcForm, specialties:e.target.value})}/>
          <label style={{display:"flex", alignItems:"center", gap:8}}>
            <input type="checkbox" checked={svcForm.isLab} onChange={e=>setSvcForm({...svcForm, isLab:e.target.checked})}/>
            LAB (visible to all doctors)
          </label>
          <button className="btn accent" onClick={saveService}>💾 Save Service</button>
        </div>

        <h4>Services</h4>
        <table className="table">
          <thead><tr><th>Code</th><th>Name</th><th>Price</th><th>Tags</th><th>Specialties</th><th></th></tr></thead>
          <tbody>
            {services.map(s =>
              <tr key={s.code}>
                <td>{s.code}</td><td>{s.name}</td><td>{s.price}</td>
                <td>{(s.tags||[]).join(",")}</td>
                <td>{(s.specialties||[]).join(", ")}</td>
                <td><button className="btn" onClick={()=>deleteService(s.code)}>🗑️ Delete</button></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{marginTop:24}}>
        <a className="btn" href="/">🏠 Home</a>
        <a className="btn" href="/frontdesk" style={{marginLeft:8}}>🧾 Front Desk</a>
      </div>
      <div className="container">
      <div className="top-glow" /><div className="aurora" />
       <a className="btn" href="/">🏠 Home</a>
    </div>
    </div>
  );
}
