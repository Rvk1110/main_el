import { useState } from "react";
import ClauseRow from "./ClauseRow";

export default function ClauseTable({ clauses }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("risk");

  const filtered = clauses.filter((c) =>
    c.text.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "risk") {
      const order = { HIGH: 3, MEDIUM: 2, LOW: 1, UNKNOWN: 0 };
      return order[b.risk?.risk_level] - order[a.risk?.risk_level];
    }
    return a.clause_index - b.clause_index;
  });

  return (
    <div
      style={{
        background: "var(--card)",
        padding: "20px",
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow)",
        border: "1px solid var(--border)",
        marginTop: "20px",
      }}
    >
      <h3 style={{ marginBottom: "15px" }}>Contract Clauses</h3>

      {/* Search */}
      <input
        type="text"
        placeholder="Search clauses..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          marginBottom: "15px",
        }}
      />

      {/* Sort */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ marginRight: "8px" }}>Sort By:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
          }}
        >
          <option value="risk">Risk Level</option>
          <option value="index">Clause Index</option>
        </select>
      </div>

      {/* Clause Rows */}
      <div>
        {sorted.map((clause, idx) => (
          <ClauseRow key={idx} clause={clause} />
        ))}
      </div>
    </div>
  );
}
