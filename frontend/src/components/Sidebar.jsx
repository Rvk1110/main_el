import React from "react";

export default function Sidebar({ active = "clause", onNavigate = ()=>{} }) {
  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      <div className="brand">Dashboard</div>

      <button
        className={`nav-btn ${active === "clause" ? "active":""}`}
        onClick={() => onNavigate("clause")}
      >
        Clause Analysis
      </button>

      <button
        className={`nav-btn ${active === "document" ? "active":""}`}
        onClick={() => onNavigate("document")}
      >
        Document Analysis
      </button>

      <div style={{flex:1}} />

      <div style={{fontSize:12, color:"rgba(255,255,255,0.6)"}}>
        v0.9 — workspace
      </div>
    </aside>
  );
}
