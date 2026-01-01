import React, { useState } from "react";

export default function ClauseAnalysis({ onAnalyze = () => {} }) {
  const [text, setText] = useState("");

  // STEP 1 — mode state
  const [mode, setMode] = useState("llm"); // llm | gnn | hybrid

  function handleAnalyze() {
    // We pass both text + mode (Step 3 will use it)
    onAnalyze(text, mode);
  }

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginTop: 0, marginBottom: 8, color: "var(--heading)" }}>
          Analyze a Clause
        </h2>

        <div style={{ marginBottom: 12, color: "var(--muted-text)" }}>
          Paste the clause text below and click Analyze.
        </div>

        {/* STEP 2 — MODE SELECTOR UI */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <button
            onClick={() => setMode("llm")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: mode === "llm" ? "2px solid #4CAF50" : "1px solid #ccc",
              background: mode === "llm" ? "#E8F5E9" : "white",
              cursor: "pointer"
            }}
          >
            LLM Mode
          </button>

          <button
            onClick={() => setMode("gnn")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: mode === "gnn" ? "2px solid #2196F3" : "1px solid #ccc",
              background: mode === "gnn" ? "#E3F2FD" : "white",
              cursor: "pointer"
            }}
          >
            GNN Mode
          </button>

          <button
            onClick={() => setMode("hybrid")}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: mode === "hybrid" ? "2px solid #673AB7" : "1px solid #ccc",
              background: mode === "hybrid" ? "#EDE7F6" : "white",
              cursor: "pointer"
            }}
          >
            Hybrid Mode
          </button>
        </div>

        <textarea
          className="textarea"
          placeholder="Enter or paste contract clause..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <button className="btn btn-primary" onClick={handleAnalyze}>
            Analyze Clause
          </button>
          <button className="btn btn-ghost" onClick={() => setText("")}>
            Clear
          </button>
        </div>
      </div>

      <div className="footer-spacer" />
    </div>
  );
}
