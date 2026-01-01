import { useState } from "react";
import RiskBadge from "./RiskBadge";
import RiskCard from "./RiskCard";

export default function ClauseRow({ clause }) {
  const [open, setOpen] = useState(false);
  const risk = clause.risk || {};
  const level = risk.risk_level || "UNKNOWN";

  return (
    <div
      style={{
        borderBottom: "1px solid var(--border)",
        padding: "12px",
        cursor: "pointer",
        transition: "0.2s",
      }}
      onClick={() => setOpen(!open)}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>Clause {clause.clause_index}</strong>
        <RiskBadge level={level} />
      </div>

      <p style={{ opacity: 0.8, marginTop: "6px", fontSize: "14px" }}>
        {clause.text.slice(0, 100)}...
      </p>

      {open && (
        <div style={{ marginTop: "10px" }}>
          <RiskCard
            risk={risk}
            clauseIndex={clause.clause_index}
            text={clause.text}
          />
        </div>
      )}
    </div>
  );
}
