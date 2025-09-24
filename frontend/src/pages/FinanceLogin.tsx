import { useState } from "react";
import { API, jfetch } from "../lib/api";
import Header from "../components/Header";

export default function FinanceLogin() {
  const [login, setLogin] = useState({ hospitalId: "FIN-1001", password: "pass123" });

  async function submit() {
    const res = await jfetch(`${API}/auth/login`, { method:"POST", body: JSON.stringify(login) });
    if (res.role !== "finance") return alert("Not a finance account");
    localStorage.setItem("auth", JSON.stringify(res));
    location.href = "/finance/dashboard";
  }

  return (
    <div className="container">
      <div className="top-glow"/><div className="aurora"/>
      <Header title="Finance Login" />   {/* toggle here */}
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
