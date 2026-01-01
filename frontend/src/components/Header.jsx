import React from "react";

console.log("HEADER COMPONENT LOADED");

export default function Header({ title = "Contract Risk Analyzer" }) {
  return (
    <header className="header">
      <div className="title-card" style={{ width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h1 style={{ margin: 0, fontSize: 22, color: "var(--heading)" }}>
            {title}
          </h1>

          <div style={{ fontSize: 13, color: "var(--muted-text)", marginTop: 6 }}>
            Upload a contract or paste a clause to start.
          </div>
        </div>
      </div>
    </header>
  );
}
