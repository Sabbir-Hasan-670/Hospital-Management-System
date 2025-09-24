import { useEffect, useState } from "react";
import { API, jfetch } from "../lib/api";

type Auth = { token:string; role:"finance"; profile:{ id:string; hospitalId:string; fullName:string } };

export default function FinanceDashboard() {
  const [auth, setAuth] = useState<Auth|null>(null);
  const [encounterId, setEncounterId] = useState("");
  const [coverageId, setCoverageId] = useState("COV-DEMO-001");
  const [claim, setClaim] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const a = localStorage.getItem("auth"); if (!a) { location.href="/finance/login"; return; }
    const parsed = JSON.parse(a); if (parsed.role !== "finance") { location.href="/finance/login"; return; }
    setAuth(parsed);
  }, []);

  async function submitClaim() {
    if (!encounterId) return alert("Enter encounterId");
    const resp = await jfetch(`${API}/nphies/claim:submit`, {
      method:"POST",
      headers:{ Authorization:`Bearer ${auth!.token}` },
      body: JSON.stringify({ encounterId, coverageId })
    });
    setClaim(resp); setStatus(null);
  }
  async function refreshStatus() {
    if (!claim?.claimId) return alert("Submit claim first");
    const s = await jfetch(`${API}/nphies/claim/${claim.claimId}/status`);
    setStatus(s);
  }

  if (!auth) return null;
  return (
    <div className="container">
      <div className="top-glow" /><div className="aurora" />
      <h1>Finance Dashboard — {auth.profile.fullName}</h1>

      <div className="card">
        <h2>Insurance Claims</h2>
        <div className="inputs">
          <input placeholder="Encounter ID" value={encounterId} onChange={e=>setEncounterId(e.target.value)}/>
          <input placeholder="Coverage ID" value={coverageId} onChange={e=>setCoverageId(e.target.value)}/>
          <button className="btn accent" onClick={submitClaim}>📨 Submit Claim</button>
          <button className="btn" onClick={refreshStatus} disabled={!claim?.claimId}>🔄 Refresh Status</button>
          <a className="btn" href="/">🏢 Front Desk</a>
        </div>
        {claim && (<><h4>Claim Submitted</h4><pre>{JSON.stringify(claim, null, 2)}</pre></>)}
        {status && (<><h4>Status</h4><pre>{JSON.stringify(status, null, 2)}</pre></>)}
      </div>
      <div className="container">
      <div className="top-glow" /><div className="aurora" />
       <a className="btn" href="/">🏠 Home</a>
    </div>
    </div>
  );
}
