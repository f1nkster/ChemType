import { useMemo, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import { parseEquation } from "./chem/parseEquation";
import { renderEquation } from "./chem/renderEquation";


export default function App() {
  const [value, setValue] = useState("Cu(NO3)2 + 2 H2 -> 2 H2O");
  const previewRef = useRef<HTMLDivElement>(null);

const preview = useMemo(() => {
  return renderEquation(parseEquation(value));
}, [value]);

const [copyStatus, setCopyStatus] = useState<null | "copied" | "error">(null);


  async function exportPng() {
    if (!previewRef.current) return;
    const dataUrl = await htmlToImage.toPng(previewRef.current, {
      pixelRatio: 3,
    });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "chem.png";
    a.click();
  }

  async function exportSvg() {
    if (!previewRef.current) return;
    const dataUrl = await htmlToImage.toSvg(previewRef.current);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "chem.svg";
    a.click();
  }

async function copyText() {
  await navigator.clipboard.writeText(value);
  setCopyStatus("text");
  setTimeout(() => setCopyStatus(null), 1500);
}

async function copyFormatted() {
  try {
    if (!previewRef.current) return;

    const html = previewRef.current.innerHTML;
    const plain = previewRef.current.innerText;

    // @ts-ignore
    if (typeof ClipboardItem !== "undefined") {
      // @ts-ignore
      const item = new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([plain], { type: "text/plain" }),
      });
      // @ts-ignore
      await navigator.clipboard.write([item]);
    } else {
      await navigator.clipboard.writeText(plain);
    }

    setCopyStatus("copied");
    window.setTimeout(() => setCopyStatus(null), 1200);
  } catch {
    setCopyStatus("error");
    window.setTimeout(() => setCopyStatus(null), 1600);
  }
}




  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <h2>Chem Editor (MVP)</h2>

<div style={{ position: "relative", marginTop: 8 }}>
  <textarea
    value={value}
    onChange={(e) => setValue(e.target.value)}
    rows={3}
    style={{
      width: "100%",
      fontSize: 16,
      paddingRight: 44, // Platz für Icon-Button
      boxSizing: "border-box",
    }}
  />

<div
  onClick={copyFormatted}
  title="Formatiert kopieren"
  aria-label="Formatiert kopieren"
  style={{
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    cursor: "pointer",
    color: "#555",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
  onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
  onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
>
  {/* Copy Icon (SVG) */}
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M16 1H6a2 2 0 0 0-2 2v12h2V3h10V1zm3 4H10a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16h-9V7h9v14z" />
  </svg>
</div>


{copyStatus && (
  <div
    style={{
      position: "absolute",
      top: 8,
      right: 40,
      padding: "4px 8px",
      borderRadius: 8,
      fontSize: 12,
      background: "white",
      border: "1px solid #ccc",
      color: "#2e7d32",
      whiteSpace: "nowrap",
    }}
  >
    ✓ kopiert
  </div>
)}

</div>


<div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
  <button onClick={exportPng}>Export PNG</button>
  <button onClick={exportSvg}>Export SVG</button>
</div>

{copyStatus && (
  <div
    style={{
      marginTop: 8,
      color: "#2e7d32",
      fontSize: 14,
      transition: "opacity 0.2s",
    }}
  >
    ✓ {copyStatus === "text" ? "Text kopiert" : "Formatiert kopiert"}
  </div>
)}


    <div
      ref={previewRef}
      style={{
        marginTop: 16,
        padding: 12,
        border: "1px solid #ccc",
        fontSize: 28,
        lineHeight: 1.2,
        background: "white",
        color: "black",        // ← DAS ist die Lösung
        display: "inline-block",
      }}
    >

        {preview}
      </div>

      <p style={{ marginTop: 16, color: "#555" }}>
        Beispiele: MgSO4, SO4^2-, Fe&#123;3+&#125;, Cu(NO3)2
      </p>
    </div>
  );
}
