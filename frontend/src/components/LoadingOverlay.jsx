import React from "react";
import "./LoadingOverlay.css";

export default function LoadingOverlay({ visible, message = "Analyzing…" }) {
  if (!visible) return null;

  return (
    <div className="overlay-container">
      <div className="overlay-content">
        <div className="spinner"></div>
        <p>{message}</p>
      </div>
    </div>
  );
}
