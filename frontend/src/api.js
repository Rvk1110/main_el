import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// ----------------------------------------------------
// LLM CLAUSE ANALYSIS
// ----------------------------------------------------
export const analyzeClauseLLM = async (text) => {
  const res = await API.post(
    "/analyze_clause",
    { text },
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
};

// ----------------------------------------------------
// GNN-ONLY CLAUSE ANALYSIS
// ----------------------------------------------------
export const analyzeClauseGNN = async (text) => {
  const res = await API.post(
    "/gnn_predict",
    { text },
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
};

// ----------------------------------------------------
// HYBRID CLAUSE ANALYSIS (GNN → fallback LLM)
// ----------------------------------------------------
export const analyzeClauseHybrid = async (text) => {
  const res = await API.post(
    "/hybrid_predict",
    { text },
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
};

// ----------------------------------------------------
// DOCUMENT-LEVEL RISK
// ----------------------------------------------------
export const analyzeDocument = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await API.post("/analyze_document", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

// ----------------------------------------------------
// PDF REPORT GENERATION (OPTIONAL)
// ----------------------------------------------------
export const generateReport = async (results) => {
  const res = await API.post(
    "/generate_report",
    { results },
    { responseType: "blob" }
  );
  return res.data;
};
