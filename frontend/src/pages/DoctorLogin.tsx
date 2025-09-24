import { useState } from "react";
import { API, jfetch } from "../lib/api";
import Header from "../components/Header";

export default function DoctorLogin() {
  const [login, setLogin] = useState({ hospitalId: "DOC-1001", password: "pass123" });

  async function submit() {
    const res = await jfetch(`${API}/auth/login`, { method:"POST", body: JSON.stringify(login) });
    if (res.role !== "doctor") return alert("Not a doctor account");
    localStorage.setItem("auth", JSON.stringify(res));
    location.href = "/doctor/dashboard";
  }

  return (
    <div className="container">
      <div className="top-glow"/><div className="aurora"/>
      <Header title="Doctor Login" />   {/* toggle appears here */}
      <div className="card">
        <div className="inputs">
          <input placeholder="Hospital ID" value={login.hospitalId} onChange={e=>setLogin({...login, hospitalId:e.target.value})}/>
          <input placeholder="Password" type="password" value={login.password} onChange={e=>setLogin({...login, password:e.target.value})}/>
          <button className="btn accent" onClick={submit}>🔐 Login</button>
        </div>
      </div>
    </div>
  );
}
