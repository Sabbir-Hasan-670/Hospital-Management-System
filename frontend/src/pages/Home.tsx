import Header from "../components/Header";

export default function Home() {
  const Tile = ({ title, desc, href, emoji }:{
    title:string; desc:string; href:string; emoji:string;
  }) => (
    <a className="card" style={{
      display:"block", textDecoration:"none", color:"inherit",
      padding:"18px", borderRadius:16, minHeight:120
    }} href={href}>
      <div style={{fontSize:22, fontWeight:800}}>{emoji} {title}</div>
      <div style={{opacity:.85, marginTop:8, lineHeight:1.4}}>{desc}</div>
      <div style={{marginTop:12, fontWeight:700, opacity:.9}}>Open →</div>
    </a>
  );

  return (
    <div className="container">
      <div className="top-glow"/><div className="aurora"/>
      <Header title="Aravals Hospital Limited" />   {/* <-- adds Dark/Light toggle here */}

      <header className="hero" style={{marginBottom:18}}>
        <h2 style={{margin:0}}>Welcome</h2>
        <p style={{opacity:.9, maxWidth:680}}>
          Choose your workspace. Front Desk handles registration & eligibility, Doctors manage encounters,
          Finance submits claims, IT manages doctors & services.
        </p>
      </header>

      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16}}>
        <Tile emoji="🧾" title="Front Desk" desc="Register patient • Eligibility • PreAuth • Book appointment" href="/frontdesk"/>
        <Tile emoji="👨‍⚕️" title="Doctor" desc="Login • My Queue • Services • Prescription" href="/doctor/login"/>
        <Tile emoji="💳" title="Finance" desc="Login • Submit claim • Check status" href="/finance/login"/>
        <Tile emoji="🛠️" title="IT Department" desc="Login • Add doctors • Manage services & lab tests" href="/it/login"/>
      </div>
    </div>
  );
}
