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

export default function App() {
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
    // LLM might return risk_level as string, GNN uses numeric classes
    if (res.risk_label) return res.risk_label;
    if (typeof res.risk_level === "string") return res.risk_level;
    if (typeof res.risk_level === "number") {
      // map numeric classes to labels if needed; keep numeric if unknown
      const map = { 0: "LOW", 1: "MEDIUM", 2: "HIGH" };
      return map[res.risk_level] ?? String(res.risk_level);
    }
    // fallback
    return "UNKNOWN";
  };

  const getProbs = (res) => {
    if (!res) return null;
    if (res.probabilities) return res.probabilities;
    if (res.gnn_prediction && res.gnn_prediction.probabilities)
      return res.gnn_prediction.probabilities;
    return null;
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
        // ensure source marker for UI consistency
        result = { ...result, source: result.source ?? "LLM" };
      } else if (modelMode === "gnn") {
        result = await analyzeClauseGNN(clause);
        result = { ...result, source: result.source ?? "GNN" };
      } else {
        // hybrid
        result = await analyzeClauseHybrid(clause);
        // hybrid endpoint may return { source: "GNN", ... } or { source: "HYBRID_LLM", gnn_prediction, llm_prediction }
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

    try {
      const result = await analyzeDocument(uploadedFile);
      console.log("DOC ANALYSIS RESULT:", result);
      setDocResult(result);
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

  // ------------------------- AUTO-HIGHLIGHT AFTER ANALYSIS -------------------------
  useEffect(() => {
    if (!docResult || !viewerRef.current) return;

    const entries =
      (docResult.results ?? docResult.clauses ?? []).map((r) => {
        // backend uses "blocks" array with { page, bbox, spans } — adapt to viewer
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
      <Sidebar tab={tab} setTab={setTab} />

      <div className="main">
        {/* NAVBAR */}
        <div className="navbar">
          <h1 className="app-title">Contract Risk Analyzer</h1>

          <input
            className="search-bar"
            type="text"
            placeholder="Search clauses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="tab-container">
            <button
              className={tab === "clause" ? "tab active" : "tab"}
              onClick={() => setTab("clause")}
            >
              Clause Analysis
            </button>

            <button
              className={tab === "document" ? "tab active" : "tab"}
              onClick={() => setTab("document")}
            >
              Document Analysis
            </button>
          </div>
        </div>

        {/* ERROR BANNER */}
        {error && <div className="error-banner">{error}</div>}

        {/* =======================================================================
            CLAUSE ANALYSIS
           ======================================================================= */}
        {tab === "clause" && (
          <div className="card">
            <div className="card-header">
              <h2>Analyze a Clause</h2>

              <div className="card-actions" style={{ gap: 8 }}>
                <button className="btn" onClick={clearClause}>
                  Clear
                </button>
                <button
                  className="btn primary"
                  onClick={handleClauseAnalyze}
                  disabled={loadingClause}
                >
                  {loadingClause ? "Analyzing..." : "Analyze Clause"}
                </button>
              </div>
            </div>

            {/* ---------------- MODEL SELECTOR (place above textarea) --------------- */}
            <div className="model-selector" style={{ margin: "12px 0" }}>
              <button
                className={modelMode === "gnn" ? "selector active" : "selector"}
                onClick={() => setModelMode("gnn")}
              >
                GNN
              </button>

              <button
                className={modelMode === "llm" ? "selector active" : "selector"}
                onClick={() => setModelMode("llm")}
              >
                LLM
              </button>

              <button
                className={
                  modelMode === "hybrid" ? "selector active" : "selector"
                }
                onClick={() => setModelMode("hybrid")}
              >
                Hybrid
              </button>
            </div>

            <textarea
              className="clause-textarea"
              placeholder="Enter or paste contract clause..."
              value={clause}
              onChange={(e) => setClause(e.target.value)}
              rows={10}
            />

            {loadingClause && <div className="loader" />}

            {/* ---------------- RESULT BOX ---------------- */}
            {clauseResult && (
              <div className="result-box">
                {/* Show raw error */}
                {clauseResult.error ? (
                  <p className="error">{clauseResult.error}</p>
                ) : (
                  <>
                    {/* ---------- GNN RESULT (if present) ---------- */}
                    {/* ---------- GNN RESULT (cleaned) ---------- */}
                    {(clauseResult.source === "GNN" ||
                      clauseResult.source === "HYBRID_GNN" ||
                      clauseResult.probabilities ||
                      clauseResult.gnn_prediction) && (
                      <div className="gnn-result" style={{ marginBottom: 12 }}>
                        <h3>GNN Prediction</h3>

                        {/* Hybrid fallback notice (if GNN preview available but LLM used) */}
                        {(clauseResult.source === "HYBRID_LLM" || clauseResult.source === "HYBRID") && (
                          <div className="hybrid-info" style={{ marginTop: 8, padding: 10, borderRadius: 6, background: "#fff8e6", border: "1px solid #ffe9b8" }}>
                            <strong>Hybrid mode:</strong> GNN was not confident enough; LLM provided the final assessment.
                            <div style={{ marginTop: 6, fontSize: 13 }}>
                              <span><b>GNN confidence:</b> {(getConfidence(clauseResult) * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        )}

                        {/* Meta + explain button */}
                        <div className="gnn-meta" style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 10 }}>
                          <span className="badge badge-gnn">GNN Model</span>

                          <span className="confidence">
                            Confidence: {(getConfidence(clauseResult) * 100).toFixed(1)}%
                          </span>

                          <button
                            className="btn small"
                            onClick={async () => {
                              try {
                                setLoadingClause(true);
                                const llm = await analyzeClauseLLM(clause);
                                setClauseResult((prev) => ({ ...prev, llm_explain: llm }));
                              } catch (e) {
                                console.error(e);
                                setError("Failed to fetch LLM explanation");
                              } finally {
                                setLoadingClause(false);
                              }
                            }}
                          >
                            Explain with LLM
                          </button>
                        </div>

                        {/* Probabilities — defensive access */}
                        {getProbs(clauseResult) ? (
                          <div style={{ marginTop: 12 }}>
                            <div className="gnn-probabilities">
                              <h4 style={{ margin: "6px 0" }}>Class Probabilities</h4>

                              <table className="prob-table" style={{ width: "100%", marginBottom: 8 }}>
                                <tbody>
                                  <tr>
                                    <td style={{ width: 120 }}>Low Risk</td>
                                    <td style={{ textAlign: "right" }}>{(getProbs(clauseResult)[0] * 100).toFixed(1)}%</td>
                                  </tr>
                                  <tr>
                                    <td>Medium Risk</td>
                                    <td style={{ textAlign: "right" }}>{(getProbs(clauseResult)[1] * 100).toFixed(1)}%</td>
                                  </tr>
                                  <tr>
                                    <td>High Risk</td>
                                    <td style={{ textAlign: "right" }}>{(getProbs(clauseResult)[2] * 100).toFixed(1)}%</td>
                                  </tr>
                                </tbody>
                              </table>

                              {/* Visual bar */}
                              <div className="prob-bar" style={{ display: "flex", height: 26, borderRadius: 6, overflow: "hidden" }}>
                                <div style={{ width: `${(getProbs(clauseResult)[0] * 100).toFixed(1)}%`, background: "#5cb85c", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12 }}>
                                  Low {(getProbs(clauseResult)[0] * 100).toFixed(1)}%
                                </div>
                                <div style={{ width: `${(getProbs(clauseResult)[1] * 100).toFixed(1)}%`, background: "#f0ad4e", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12 }}>
                                  Medium {(getProbs(clauseResult)[1] * 100).toFixed(1)}%
                                </div>
                                <div style={{ width: `${(getProbs(clauseResult)[2] * 100).toFixed(1)}%`, background: "#d9534f", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12 }}>
                                  High {(getProbs(clauseResult)[2] * 100).toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ marginTop: 12, color: "var(--muted-text)" }}>No probability data available.</div>
                        )}
                      </div>
                    )}
                    {/* ---------- End GNN RESULT ---------- */}


                    {/* ---------- LLM RESULT (if present) ---------- */}
                    { (clauseResult.source === "LLM" ||
                        clauseResult.issue ||
                        clauseResult.explanation) && (
                      <div className="llm-result" style={{ marginBottom: 12 }}>
                        <h3>LLM Risk Analysis</h3>
                        <p><b>Risk:</b> {getRiskLabel(clauseResult)}</p>
                        <p><b>Issue:</b> {clauseResult.issue ?? "—"}</p>
                        <p><b>Explanation:</b> {clauseResult.explanation ?? "—"}</p>
                        <p><b>Suggested Rewrite:</b> <span className="monospace">{clauseResult.suggested_rewrite ?? "—"}</span></p>
                      </div>
                    )}

                    {/* ---------- LLM Explanation (if user clicked Explain with LLM) ---------- */}
                    {clauseResult.llm_explain && (
                      <div className="llm-explain" style={{ marginBottom: 12 }}>
                        <h4>LLM Explanation</h4>
                        <p><b>Risk:</b> {clauseResult.llm_explain.risk_level}</p>
                        <p><b>Issue:</b> {clauseResult.llm_explain.issue}</p>
                        <p><b>Explanation:</b> {clauseResult.llm_explain.explanation}</p>
                        <p><b>Suggested Rewrite:</b> {clauseResult.llm_explain.suggested_rewrite}</p>
                      </div>
                    )}

                    {/* ---------- HYBRID: show combined info when backend returned both ---------- */}
                    {clauseResult.source === "HYBRID_LLM" || clauseResult.source === "HYBRID" ? (
                      <div className="hybrid-final" style={{ marginTop: 12 }}>
                        <h3>Hybrid Final Decision</h3>
                        <p><b>GNN prediction:</b> {clauseResult.gnn_prediction ? getRiskLabel(clauseResult.gnn_prediction) : "—"}</p>
                        <p><b>LLM prediction:</b> {clauseResult.llm_prediction ? (clauseResult.llm_prediction.risk_level ?? getRiskLabel(clauseResult.llm_prediction)) : "—"}</p>
                      </div>
                    ) : null}

                    {/* ---------- UNIFIED FINAL OUTPUT (always shown when available) ---------- */}
                    <div className="final-output" style={{ marginTop: 12 }}>
                      <h3>Final Risk Assessment</h3>

                      <div className="final-meta" style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <span className={
                          "badge " + (
                            getRiskLabel(clauseResult).toLowerCase() === "high"
                              ? "badge-high"
                              : getRiskLabel(clauseResult).toLowerCase() === "medium"
                              ? "badge-medium"
                              : "badge-low"
                          )
                        }>
                          {getRiskLabel(clauseResult)}
                        </span>

                        <span className="source-tag">Source: {clauseResult.source ?? "LLM"}</span>

                        <button className="btn small" onClick={() => downloadJSON(clauseResult, "clause-result.json")}>Download JSON</button>
                      </div>

                      <p><b>Issue:</b> {clauseResult.issue ?? "—"}</p>
                      <p><b>Explanation:</b> {clauseResult.explanation ?? "—"}</p>
                      <p><b>Suggested Rewrite:</b> <span className="monospace">{clauseResult.suggested_rewrite ?? "—"}</span></p>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        )}

        {/* =======================================================================
            DOCUMENT ANALYSIS
           ======================================================================= */}
        {tab === "document" && (
          <div className="card">
            <div className="card-header">
              <h2>Analyze Full Document (PDF)</h2>

              <div className="risk-filters">
                {["high", "medium", "low", "all"].map((lvl) => (
                  <button
                    key={lvl}
                    className={riskFilter === lvl ? "filter-btn active" : "filter-btn"}
                    onClick={() => setRiskFilter(lvl)}
                  >
                    {lvl === "all" ? "All" : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                  </button>
                ))}
              </div>

              <div className="card-actions">
                <label className="file-upload btn">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  {file ? file.name : "Choose a PDF"}
                </label>
                <button 
                  onClick={async () => {
                    if (!docResult || !docResult.results) {
                      alert("Analyze a document first");
                      return;
                    }

                    try {
                      const blob = await generateReport(docResult.results);
                      console.log("PDF blob:", blob, blob?.size, blob?.type);

                      if (!blob || blob.size === 0) {
                        alert("Empty PDF received from backend");
                        return;
                      }

                      const file = new Blob([blob], { type: "application/pdf" });
                      const url = window.URL.createObjectURL(file);

                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "contract_risk_report.pdf";

                      document.body.appendChild(a);
                      a.click();

                      setTimeout(() => {
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                      }, 100);
                    } catch (err) {
                      console.error("Download report error:", err);
                    }
                  }}
                >
                  Download PDF Report
                </button>



                <button className="btn" onClick={clearDocument}>
                  Clear
                </button>

                

                {/* PDF VIEWER */}
                {file && (
                  <div style={{ marginTop: 20 }}>
                    <PDFViewer ref={viewerRef} file={file} />
                  </div>
                )}


              </div>
            </div>


            {/* PDF VIEWER */}
            {file && (
              <div style={{ marginTop: 20 }}>
                <PDFViewer ref={viewerRef} file={file} />
              </div>
            )}

            {/* DOCUMENT RESULTS */}
            {docResult && (
              <div className="result-box" style={{ marginTop: 20 }}>
                <h3>Document Analysis</h3>

                <div className="result-meta">
                  <span className="meta">
                    Total Clauses: {(docResult.results ?? docResult.clauses ?? []).length}
                  </span>

                  <button
                    className="btn small"
                    onClick={() => downloadJSON(docResult, "document-result.json")}
                  >
                    Download JSON
                  </button>
                </div>

                <div className="document-results" style={{ marginTop: 12 }}>
                  {(docResult.results ?? docResult.clauses ?? [])
                    .filter((item) =>
                      item.text.toLowerCase().includes(search.toLowerCase())
                    )
                    .filter((item) => {
                      if (riskFilter === "all") return true;
                      const level = (item.risk && item.risk.risk_level) || item.risk_level;
                      return (level && level.toString().toLowerCase() === riskFilter);
                    })
                    .map((item, idx) => (
                      <div
                        key={idx}
                        className="clause-box"
                        onClick={() => {
                          try {
                            const block = (item.blocks && item.blocks[0]) || {};
                            const entry = {
                              page: block.page ?? item.page ?? 0,
                              bbox: block.bbox ?? item.bbox,
                              risk: item.risk ?? {},
                              text: item.text ?? item.clause_text
                            };
                            viewerRef.current?.highlightClauses?.([entry]);
                            if (typeof viewerRef.current?.scrollToClause === "function") {
                              viewerRef.current.scrollToClause(entry);
                            } else if (typeof viewerRef.current?.scrollToBBox === "function") {
                              viewerRef.current.scrollToBBox(entry.page, entry.bbox);
                            }
                          } catch (e) {
                            console.error("Viewer action failed:", e);
                          }
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="clause-top" style={{ display: "flex", justifyContent: "space-between" }}>
                          <b>Clause {item.clause_index ?? idx}</b>

                          <span className={"badge " + (
                            ((item.risk && item.risk.risk_level) || item.risk_level || "low").toString().toLowerCase() === "high"
                              ? "badge-high"
                              : ((item.risk && item.risk.risk_level) || item.risk_level || "low").toString().toLowerCase() === "medium"
                              ? "badge-medium"
                              : "badge-low"
                          )}>
                            {((item.risk && item.risk.risk_level) || item.risk_level) ?? "UNKNOWN"}
                          </span>
                        </div>

                        <p style={{ marginTop: 6 }}>{item.text ?? item.clause_text}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
