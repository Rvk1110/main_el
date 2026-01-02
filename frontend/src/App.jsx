// frontend/src/App.jsx
import React, { useState, useRef, useEffect } from "react";

import {
  analyzeClauseLLM,
  analyzeClauseGNN,
  analyzeClauseHybrid,
  analyzeDocument,
  generateReport
} from "./api.js";

import "./styles.css";
import Sidebar from "./components/Sidebar";
import PDFViewer from "./components/PDFViewer";
import ClauseAnalysisTab from "./components/ClauseAnalysisTab";
import DocumentAnalysisTabEnhanced from "./components/DocumentAnalysisTabEnhanced";
import GraphVisualization from "./components/GraphVisualization";
import DashboardMetricsEnhanced from "./components/DashboardMetricsEnhanced";
import AuditLogViewer from "./components/AuditLogViewer";
import RiskSensitivitySlider from "./components/RiskSensitivitySlider";

export default function App() {
  // Top-level app state
  const [tab, setTab] = useState("clause");

  // Clause state
  const [clause, setClause] = useState("");
  const [clauseResult, setClauseResult] = useState(null);
  const [loadingClause, setLoadingClause] = useState(false);

  // Model mode: "gnn" | "llm" | "hybrid"
  const [modelMode, setModelMode] = useState("hybrid");

  // Document state
  const [file, setFile] = useState(null);
  const [docResult, setDocResult] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(false);

  // Search + filtering
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");

  // Graph data
  const [graphData, setGraphData] = useState(null);

  // Dashboard metrics
  const [metrics, setMetrics] = useState(null);

  // Risk sensitivity
  const [sensitivity, setSensitivity] = useState("balanced");

  // Generic error
  const [error, setError] = useState(null);

  // PDF viewer reference
  const viewerRef = useRef(null);

  // ------------------------- Helpers -------------------------
  const downloadJSON = (data, filename = "result.json") => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  };

  // Safe getters for different backend shapes
  const getRiskLabel = (res) => {
    if (!res) return "UNKNOWN";
    if (res.risk_label) return res.risk_label;
    if (typeof res.risk_level === "string") return res.risk_level;
    if (typeof res.risk_level === "number") {
      const map = { 0: "LOW", 1: "MEDIUM", 2: "HIGH" };
      return map[res.risk_level] ?? String(res.risk_level);
    }
    return "UNKNOWN";
  };

  const getConfidence = (res) => {
    if (!res) return 0;
    if (typeof res.confidence === "number") return res.confidence;
    if (res.gnn_prediction && typeof res.gnn_prediction.confidence === "number")
      return res.gnn_prediction.confidence;
    return 0;
  };

  // ------------------------- CLAUSE ANALYSIS HANDLER -------------------------
  const handleClauseAnalyze = async () => {
    setError(null);

    if (!clause.trim()) {
      setError("Clause is empty — paste something useful.");
      return;
    }

    setLoadingClause(true);
    setClauseResult(null);

    try {
      let result;

      if (modelMode === "llm") {
        result = await analyzeClauseLLM(clause);
        result = { ...result, source: result.source ?? "LLM" };
      } else if (modelMode === "gnn") {
        result = await analyzeClauseGNN(clause);
        result = { ...result, source: result.source ?? "GNN" };
      } else {
        result = await analyzeClauseHybrid(clause);
        if (!result.source) result.source = "HYBRID";
      }

      setClauseResult(result);
    } catch (err) {
      console.error("Clause analysis error:", err);
      setClauseResult({ error: "Failed to analyze clause" });
    } finally {
      setLoadingClause(false);
    }
  };

  const clearClause = () => {
    setClause("");
    setClauseResult(null);
    setError(null);
  };

  // ------------------------- DOCUMENT ANALYSIS -------------------------
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    await handleFileUpload(selectedFile);
  };

  const handleFileUpload = async (uploadedFile) => {
    if (!uploadedFile) {
      alert("No PDF selected.");
      return;
    }

    setLoadingDoc(true);
    setDocResult(null);
    setMetrics(null);
    setGraphData(null);

    try {
      const result = await analyzeDocument(uploadedFile);
      console.log("DOC ANALYSIS RESULT:", result);
      setDocResult(result);

      // Calculate metrics
      const clauses = result.results ?? result.clauses ?? [];
      const high = clauses.filter(c => {
        const level = (c.risk && c.risk.risk_level) || c.risk_level;
        return level && level.toString().toLowerCase() === 'high';
      }).length;
      const medium = clauses.filter(c => {
        const level = (c.risk && c.risk.risk_level) || c.risk_level;
        return level && level.toString().toLowerCase() === 'medium';
      }).length;
      const low = clauses.filter(c => {
        const level = (c.risk && c.risk.risk_level) || c.risk_level;
        return level && level.toString().toLowerCase() === 'low';
      }).length;

      // Calculate overall risk score (weighted average)
      const totalClauses = clauses.length;
      const overallScore = totalClauses > 0
        ? ((high * 100 + medium * 50 + low * 10) / totalClauses)
        : 0;

      setMetrics({
        totalClauses,
        highRisk: high,
        mediumRisk: medium,
        lowRisk: low,
        overallScore
      });

      // Extract graph data if available
      if (result.graph) {
        setGraphData(result.graph);
      }
    } catch (err) {
      console.error("Document analysis error:", err);
      setDocResult({ error: "Failed to analyze document" });
    } finally {
      setLoadingDoc(false);
    }
  };

  const clearDocument = () => {
    setFile(null);
    setDocResult(null);
    setError(null);
  };

  const handleDownloadReport = async () => {
    if (!docResult || !docResult.results) {
      alert("Analyze document first");
      return;
    }

    try {
      const blob = await generateReport({
        results: docResult.results,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "contract_risk_report.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download report error:", err);
      alert("Failed to download report");
    }
  };

  // ------------------------- AUTO-HIGHLIGHT AFTER ANALYSIS -------------------------
  useEffect(() => {
    if (!docResult || !viewerRef.current) return;

    const entries =
      (docResult.results ?? docResult.clauses ?? []).map((r) => {
        const block = (r.blocks && r.blocks[0]) || {};
        const page = block.page ?? r.page ?? 0;
        const bbox = block.bbox ?? r.bbox ?? null;

        return {
          page,
          bbox,
          clause_text: r.text ?? r.clause_text,
          risk_level: (r.risk && r.risk.risk_level) || r.risk_level || "low",
        };
      });

    try {
      viewerRef.current.highlightClauses(entries);
    } catch (e) {
      // viewer may not implement highlightClauses — ignore
    }
  }, [docResult]);

  // ------------------------- RENDER -------------------------
  return (
    <div className="app-layout">
      <Sidebar
        tab={tab}
        setTab={setTab}
        clauseResult={clauseResult}
        docResult={docResult}
      />

      <div className="main">
        {/* NAVBAR */}
        <div className="navbar">
          <h1 className="app-title">AI ClauseGuard</h1>

          <input
            className="search-bar"
            type="text"
            placeholder="Search clauses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ERROR BANNER */}
        {error && <div className="error-banner">{error}</div>}

        {/* CLAUSE ANALYSIS TAB */}
        {tab === "clause" && (
          <ClauseAnalysisTab
            clause={clause}
            setClause={setClause}
            modelMode={modelMode}
            setModelMode={setModelMode}
            loadingClause={loadingClause}
            clauseResult={clauseResult}
            handleClauseAnalyze={handleClauseAnalyze}
            clearClause={clearClause}
            getRiskLabel={getRiskLabel}
            getConfidence={getConfidence}
          />
        )}

        {/* DOCUMENT ANALYSIS TAB */}
        {tab === "document" && (
          <DocumentAnalysisTabEnhanced
            file={file}
            handleFileChange={handleFileChange}
            loadingDoc={loadingDoc}
            docResult={docResult}
            clearDocument={clearDocument}
            handleDownloadReport={handleDownloadReport}
            search={search}
            riskFilter={riskFilter}
            setRiskFilter={setRiskFilter}
            viewerRef={viewerRef}
            sensitivity={sensitivity}
          />
        )}

        {/* GRAPH VIEW TAB */}
        {tab === "graph" && (
          <div className="card">
            <div className="card-header">
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Clause Dependency Graph</h2>
            </div>
            <GraphVisualization
              graphData={graphData}
              onNodeClick={(nodeData) => {
                console.log('Node clicked:', nodeData);
                // Could highlight clause in PDF viewer here
              }}
            />
          </div>
        )}

        {/* DASHBOARD TAB */}
        {tab === "dashboard" && (
          <div className="card">
            <div className="card-header">
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Contract Risk Dashboard</h2>
            </div>
            <DashboardMetricsEnhanced docResult={docResult} sensitivity={sensitivity} />
          </div>
        )}

        {/* AUDIT LOG TAB */}
        {tab === "audit" && (
          <AuditLogViewer />
        )}

        {/* SETTINGS TAB */}
        {tab === "settings" && (
          <RiskSensitivitySlider
            sensitivity={sensitivity}
            onChange={(newSensitivity) => {
              setSensitivity(newSensitivity);
              console.log('Sensitivity changed to:', newSensitivity);
            }}
            onReanalyze={async (newSensitivity) => {
              if (!file) {
                alert('Please upload a document first');
                return;
              }
              console.log('Re-analyzing with sensitivity:', newSensitivity);
              // Re-analyze the document with new sensitivity
              await handleFileUpload(file);
            }}
          />
        )}
      </div>
    </div>
  );
}
