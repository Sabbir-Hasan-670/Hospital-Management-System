// frontend/src/pages/FrontDesk.tsx
import { useEffect, useState } from "react";
import { API, jfetch } from "../lib/api";
import Header from "../components/Header";

type Doctor = { id:string; hospitalId:string; fullName:string; specialty?:string };
type Room   = { id:string; code:string; name?:string };
type Patient = { id:string; mrn:string; nationalId?:string; firstName:string; lastName:string; phone?:string; hasInsurance:boolean };
type PaymentMode = "auto" | "insurance" | "cash";

export default function FrontDeskPage() {
  /* ---------- patient form ---------- */
  const [patientForm, setPatientForm] = useState({
    mrn: "",
    nationalId: "",
    firstName: "",
    lastName: "",
    phone: "",
    hasInsurance: false, // final value sent on create (depends on mode)
  });
  const [patient, setPatient] = useState<Patient|null>(null);

  /* ---------- payment mode ---------- */
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("auto");

  /* ---------- doctor/room ---------- */
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");

  /* ---------- insurance ---------- */
  const [payerCode, setPayerCode] = useState("NPHIES-MOCK");
  const [policyNumber, setPolicyNumber] = useState("POLICY-123");
  const [elig, setElig] = useState<any>(null);
  const [preauth, setPreauth] = useState<any>(null);

  /* ---------- appointment ---------- */
  const [apt, setApt] = useState<any>(null);

  /* ---------- load lists ---------- */
  useEffect(() => {
    (async () => {
      try {
        const [d, r] = await Promise.all([
          jfetch(`${API}/doctors`),
          jfetch(`${API}/rooms`)
        ]);
        setDoctors(d); setRooms(r);
        if (d[0]) setSelectedDoctorId(d[0].id);
      } catch {}
    })();
  }, []);

  /* ---------- helpers ---------- */
  function applyEligibilityToPayment(result: any) {
    // simple rule: active/approved -> insurance, else cash
    const ok = result?.status === "active" || result?.status === "approved";
    setPatientForm(f => ({ ...f, hasInsurance: ok }));
    setPaymentMode(ok ? "insurance" : "cash");
  }

  /* ---------- actions ---------- */
  async function createPatient() {
    if (!patientForm.mrn || !patientForm.firstName || !patientForm.lastName) {
      alert("Fill MRN, First name, Last name");
      return;
    }
    const hasInsurance =
      paymentMode === "insurance" ? true :
      paymentMode === "cash" ? false :
      patientForm.hasInsurance; // auto → whatever the last eligibility decided

    const created = await jfetch(`${API}/patients`, {
      method: "POST",
      body: JSON.stringify({ ...patientForm, hasInsurance }),
    });
    setPatient(created);
    setElig(null); setPreauth(null); setApt(null);
    alert(`Patient created ✅ (${hasInsurance ? "Insurance" : "Cash"})`);
  }

  async function checkEligibility() {
    if (paymentMode === "cash") {
      alert("Payment mode is Cash — eligibility not required.");
      return;
    }
    if (!patient?.mrn && !patientForm.nationalId) {
      alert("Enter MRN or National ID for eligibility.");
      return;
    }
    const data = await jfetch(`${API}/nphies/eligibility:check`, {
      method: "POST",
      body: JSON.stringify({
        patientMrn: patient?.mrn || undefined,
        nationalId: patientForm.nationalId || undefined,
        payerCode, policyNumber,
      }),
    });
    setElig(data);
    if (paymentMode === "auto") applyEligibilityToPayment(data);
  }

  async function submitPreauth() {
    if (paymentMode !== "insurance") {
      alert("PreAuth is only for Insurance mode.");
      return;
    }
    if (!patient) {
      alert("Create/select patient first");
      return;
    }
    const data = await jfetch(`${API}/nphies/auth:submit`, {
      method: "POST",
      body: JSON.stringify({
        encounterId: "ENC-FD-001",     // demo stub
        sbsCodes: ["SBS-99213"],       // demo codes
        diagnosisCodes: ["J10.1"],     // demo codes
      }),
    });
    setPreauth(data);
  }

  async function createAppointment() {
    if (!patient?.id) return alert("Create patient first");
    if (!selectedDoctorId) return alert("Select doctor");
    const data = await jfetch(`${API}/appointments`, {
      method: "POST",
      body: JSON.stringify({
        patientId: patient.id,
        doctorId: selectedDoctorId,
        roomId: selectedRoomId || undefined,
        reason: paymentMode === "insurance" ? "OPD - Insurance" : "OPD - Cash",
      }),
    });
    setApt(data);
    alert(`Appointment token: ${data.token}`);
  }

  /* ---------- UI ---------- */
  return (
    <div className="container">
      <div className="top-glow" /><div className="aurora" />

      <Header title="Front Desk" />

      {/* Register Patient */}
      <div className="card">
        <h2>Register Patient</h2>

        {/* payment selector */}
        <div className="inputs" style={{ marginBottom: 8 }}>
          <label style={{ fontWeight: 600 }}>Payment mode:</label>
          <div className="segmented">
            <button
              className={`btn ${paymentMode === "auto" ? "accent" : ""}`}
              onClick={() => setPaymentMode("auto")}
              title="Let eligibility decide"
            >Auto</button>
            <button
              className={`btn ${paymentMode === "insurance" ? "accent" : ""}`}
              onClick={() => { setPaymentMode("insurance"); setPatientForm(f=>({...f, hasInsurance:true})); }}
            >Insurance</button>
            <button
              className={`btn ${paymentMode === "cash" ? "accent" : ""}`}
              onClick={() => { setPaymentMode("cash"); setPatientForm(f=>({...f, hasInsurance:false})); }}
            >Cash</button>
          </div>
        </div>

        <div className="inputs">
          <input
            placeholder="MRN"
            value={patientForm.mrn}
            onChange={e=>setPatientForm({...patientForm, mrn:e.target.value})}
          />
          <button className="btn" onClick={()=>setPatientForm(f=>({...f, mrn:`MRN-${Date.now()}`}))}>
            🔁 Random MRN
          </button>

          <input
            placeholder="National ID"
            value={patientForm.nationalId}
            onChange={e=>setPatientForm({...patientForm, nationalId:e.target.value})}
          />
          <input
            placeholder="First name"
            value={patientForm.firstName}
            onChange={e=>setPatientForm({...patientForm, firstName:e.target.value})}
          />
          <input
            placeholder="Last name"
            value={patientForm.lastName}
            onChange={e=>setPatientForm({...patientForm, lastName:e.target.value})}
          />
          <input
            placeholder="Phone"
            value={patientForm.phone}
            onChange={e=>setPatientForm({...patientForm, phone:e.target.value})}
          />

          <span className="pill">
            Final: {paymentMode === "cash"
              ? "Cash"
              : paymentMode === "insurance"
              ? "Insurance"
              : (patientForm.hasInsurance ? "Insurance (auto)" : "Cash (auto)")}
          </span>

          <button className="btn accent" onClick={createPatient}>➕ Create Patient</button>
        </div>

        {patient && <pre>{JSON.stringify(patient, null, 2)}</pre>}
      </div>

      {/* Insurance */}
      <div className="card" style={{ marginTop: 16, opacity: paymentMode === "cash" ? 0.6 : 1 }}>
        <h2>Insurance — Eligibility & PreAuth</h2>
        <div className="inputs">
          <input
            placeholder="Payer code"
            value={payerCode}
            onChange={e=>setPayerCode(e.target.value)}
            disabled={paymentMode === "cash"}
          />
          <input
            placeholder="Policy number"
            value={policyNumber}
            onChange={e=>setPolicyNumber(e.target.value)}
            disabled={paymentMode === "cash"}
          />
          <button className="btn accent" onClick={checkEligibility} disabled={paymentMode === "cash"}>
            🩺 Check Eligibility
          </button>
          <button className="btn" onClick={submitPreauth} disabled={paymentMode !== "insurance"}>
            📝 Submit PreAuth
          </button>
        </div>
        {elig && (<><h4>Eligibility</h4><pre>{JSON.stringify(elig, null, 2)}</pre></>)}
        {preauth && (<><h4>PreAuth</h4><pre>{JSON.stringify(preauth, null, 2)}</pre></>)}
      </div>

      {/* Book Appointment */}
      <div className="card" style={{ marginTop: 16 }}>
        <h2>Book Appointment</h2>
        <div className="inputs">
          <select value={selectedDoctorId} onChange={e=>setSelectedDoctorId(e.target.value)}>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>
                {d.fullName} ({d.specialty || "General"}) — {d.hospitalId}
              </option>
            ))}
          </select>
          <select value={selectedRoomId} onChange={e=>setSelectedRoomId(e.target.value)}>
            <option value="">(No room)</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.code} {r.name ? `— ${r.name}` : ""}</option>)}
          </select>
          <button className="btn accent" onClick={createAppointment}>🎟️ Create Appointment</button>
        </div>
        {apt && <pre>{JSON.stringify(apt, null, 2)}</pre>}
      </div>
    </div>
  );
}
