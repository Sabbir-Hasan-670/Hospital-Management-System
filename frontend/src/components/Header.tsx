import { useEffect, useState } from "react";

export default function Header({ title }: { title: string }) {
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (localStorage.getItem("theme") as any) || "dark"
  );
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div style={{
      display:"grid", gridTemplateColumns:"auto 1fr auto",
      alignItems:"center", gap:12, marginBottom:20,
    }}>
      <a className="btn" href="/">🏠 Home</a>
      <h1 style={{margin:0, textAlign:"center"}}>{title}</h1>
      <button className="btn" onClick={() => setTheme(t => t==="dark"?"light":"dark")}>
        {theme === "dark" ? "🌤️ Light" : "🌙 Dark"}
      </button>
    </div>
  );
}
