import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from "chart.js";
ChartJS.register(BarElement, CategoryScale, LinearScale);

export default function RiskDashboard({ results }) {
  if (!results || results.length === 0) return null;

  const high = results.filter(r => r.risk?.risk_level === "HIGH").length;
  const medium = results.filter(r => r.risk?.risk_level === "MEDIUM").length;
  const low = results.filter(r => r.risk?.risk_level === "LOW").length;

  const total = results.length;
  const overallScore = ((high * 3 + medium * 2 + low * 1) / (total * 3)) * 100;

  const data = {
    labels: ["High", "Medium", "Low"],
    datasets: [
      {
        label: "Clause Risk Distribution",
        data: [high, medium, low],
        backgroundColor: ["#ff4d4f", "#fa8c16", "#52c41a"],
      },
    ],
  };

  return (
    <div style={{ marginBottom: "40px" }}>
      <h2>Document Risk Dashboard</h2>

      {/* Summary Cards */}
      <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
        
        <div style={boxStyle("#ff4d4f")}>
          <h3>High Risk</h3>
          <p>{high}</p>
        </div>

        <div style={boxStyle("#fa8c16")}>
          <h3>Medium Risk</h3>
          <p>{medium}</p>
        </div>

        <div style={boxStyle("#52c41a")}>
          <h3>Low Risk</h3>
          <p>{low}</p>
        </div>

        <div style={boxStyle("#1677ff")}>
          <h3>Overall Score</h3>
          <p>{overallScore.toFixed(1)}%</p>
        </div>

      </div>

      {/* Bar Chart */}
      <div style={{ width: "500px", marginTop: "30px" }}>
        <Bar data={data} />
      </div>
    </div>
  );
}

function boxStyle(color) {
  return {
    flex: 1,
    padding: "14px",
    borderRadius: "12px",
    background: "#ffffff",
    borderLeft: `6px solid ${color}`,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    textAlign: "center",
  };
}
