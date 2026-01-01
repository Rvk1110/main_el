export default function RiskCard({ risk, clauseIndex, text }) {
  if (!risk) return null;

  const level = risk.risk_level || "UNKNOWN";

  const colors = {
    HIGH: "var(--red)",
    MEDIUM: "var(--orange)",
    LOW: "var(--green)",
    UNKNOWN: "gray",
  };

  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "var(--radius)",
        background: "var(--card)",
        boxShadow: "var(--shadow)",
        marginBottom: "16px",
        border: "1px solid var(--border)",
        transition: "transform 0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.01)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {clauseIndex !== undefined && (
        <p style={{ opacity: 0.7, marginBottom: "6px" }}>
          Clause #{clauseIndex}
        </p>
      )}

      {text && (
        <p style={{ marginBottom: "10px", opacity: 0.9 }}>
          <strong>Clause:</strong> {text}
        </p>
      )}

      <h3 style={{ color: colors[level], marginBottom: "10px" }}>
        Risk Level: {level}
      </h3>

      <p style={{ marginBottom: "8px" }}>
        <strong>Issue:</strong> {risk.issue}
      </p>

      <p style={{ marginBottom: "8px" }}>
        <strong>Explanation:</strong> {risk.explanation}
      </p>

      <p style={{ marginBottom: "8px" }}>
        <strong>Suggested Rewrite:</strong> {risk.suggested_rewrite}
      </p>

      {risk.source_clauses && (
        <div style={{ marginTop: "10px" }}>
          <strong>Source Clauses:</strong>
          <ul>
            {risk.source_clauses.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
