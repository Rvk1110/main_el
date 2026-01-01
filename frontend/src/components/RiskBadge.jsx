export default function RiskBadge({ level }) {
  const colors = {
    HIGH: "#ff4d4f",
    MEDIUM: "#faad14",
    LOW: "#52c41a",
    UNKNOWN: "#8c8c8c",
  };

  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600",
        background: colors[level] + "22",
        color: colors[level],
      }}
    >
      {level}
    </span>
  );
}
