import { useState } from "react";
import { API, jfetch } from "../lib/api";
import Header from "../components/Header";

export default function ITLogin() {
  const [login, setLogin] = useState({ hospitalId: "IT-1001", password: "pass123" });

  async function submit() {
    const res = await jfetch(`${API}/auth/login`, { method:"POST", body: JSON.stringify(login) });
    if (res.role !== "it") return alert("Not an IT account");
    localStorage.setItem("auth", JSON.stringify(res));
    location.href = "/it/dashboard";
  }

  return (
    <div className="container">
      <div className="top-glow"/><div className="aurora"/>
      <Header title="IT Login" />   {/* toggle here */}
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
