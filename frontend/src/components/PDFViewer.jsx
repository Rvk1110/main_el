// frontend/src/components/PDFViewer.jsx
import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";

import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker.entry";

// Vite-compatible worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const COLORS = {
  high: "rgba(255, 80, 80, 0.30)",
  medium: "rgba(255, 200, 80, 0.30)",
  low: "rgba(69, 201, 122, 0.25)",
  default: "rgba(80, 150, 255, 0.25)",
};

const PDFViewer = forwardRef(({ file, scale = 1.5 }, ref) => {
  const containerRef = useRef(null);
  const pagesRef = useRef([]);
  const overlaysRef = useRef([]);

  const clearOverlays = () => {
    overlaysRef.current.forEach((o) => o.remove());
    overlaysRef.current = [];
  };

  const createOverlay = (pageIndex, x, y, w, h, color) => {
    const page = pagesRef.current[pageIndex];
    if (!page) return;

    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    el.style.background = color;
    el.style.borderRadius = "4px";
    el.style.pointerEvents = "none";
    el.style.opacity = "0.9";
    el.style.transition = "opacity 0.5s ease";

    page.wrapper.appendChild(el);
    overlaysRef.current.push(el);

    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 600);
    }, 3500);
  };

  // ---------------------------
  // LOAD PDF
  // ---------------------------
  useEffect(() => {
    const loadPDF = async () => {
      clearOverlays();
      pagesRef.current = [];

      const container = containerRef.current;
      container.innerHTML = "";
      if (!file) return;

      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const viewport = page.getViewport({ scale });

        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";
        wrapper.style.marginBottom = "20px";
        wrapper.style.background = "white";
        wrapper.style.padding = "8px";
        wrapper.style.borderRadius = "6px";

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = "100%";

        wrapper.appendChild(canvas);
        container.appendChild(wrapper);

        await page.render({
          canvasContext: canvas.getContext("2d"),
          viewport,
        }).promise;

        pagesRef.current.push({ wrapper, canvas, viewport });
      }
    };

    loadPDF();
  }, [file]);

  // ---------------------------
  // EXPOSE METHODS
  // ---------------------------
  useImperativeHandle(ref, () => ({
    highlightClauses(entries = []) {
      if (!pagesRef.current.length) return;
      clearOverlays();

      entries.forEach((entry) => {
        const color =
          COLORS[(entry.risk?.risk_level || "").toLowerCase()] ||
          COLORS.default;

        (entry.blocks || []).forEach((blk) => {
          const pageIndex = blk.page;
          const [x0, y0, x1, y1] = blk.bbox;

          const page = pagesRef.current[pageIndex];
          if (!page) return;

          const { canvas, viewport } = page;

          // Correct scaling for PyMuPDF → canvas pixels
          const scaleFactor = canvas.clientWidth / viewport.width;

          const left = x0 * scaleFactor;
          const top = y0 * scaleFactor; // PyMuPDF uses top-left origin, so no inversion
          const width = (x1 - x0) * scaleFactor;
          const height = (y1 - y0) * scaleFactor;

          createOverlay(pageIndex, left, top, width, height, color);
        });
      });
    },

    scrollToClause(entry) {
      if (!entry?.blocks?.length) return false;

      const first = entry.blocks[0];
      const page = pagesRef.current[first.page];
      if (!page) return false;

      page.wrapper.scrollIntoView({ behavior: "smooth", block: "center" });
      return true;
    },
  }));

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "650px",
        overflowY: "auto",
        background: "#fff",
        borderRadius: 8,
        border: "1px solid rgba(0,0,0,0.06)",
        padding: 12,
      }}
    />
  );
});

export default PDFViewer;
