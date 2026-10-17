import { Check, Copy, Download, X } from "lucide-react";
import { useEffect, useState, type KeyboardEvent } from "react";

export function DiagramSourceWorkspace({ source, onSourceChange, renderedPreview, previewError, supported, focusRequest, onFocusRequestHandled }: {
  source: string;
  onSourceChange: (value: string) => void;
  renderedPreview: string;
  previewError: string;
  supported: boolean;
  focusRequest: "editor" | "preview" | null;
  onFocusRequestHandled: () => void;
}) {
  const [focusView, setFocusView] = useState<"editor" | "preview" | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!focusRequest) return;
    setFocusView(focusRequest);
    onFocusRequestHandled();
  }, [focusRequest, onFocusRequestHandled]);

  async function copySource(): Promise<void> {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1300);
    } catch {
      setCopied(false);
    }
  }

  function download(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function downloadSvg(): void {
    if (renderedPreview) download(new Blob([renderedPreview], { type: "image/svg+xml;charset=utf-8" }), "diagram.svg");
  }

  function downloadPng(): void {
    if (!renderedPreview) return;
    const url = URL.createObjectURL(new Blob([renderedPreview], { type: "image/svg+xml;charset=utf-8" }));
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, image.naturalWidth * 2);
      canvas.height = Math.max(1, image.naturalHeight * 2);
      const context = canvas.getContext("2d");
      if (context) {
        context.fillStyle = "#fff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => { if (blob) download(blob, "diagram.png"); URL.revokeObjectURL(url); }, "image/png");
      } else URL.revokeObjectURL(url);
    };
    image.onerror = () => URL.revokeObjectURL(url);
    image.src = url;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>): void {
    if (event.key === "Escape") {
      event.stopPropagation();
      setFocusView(null);
    }
  }

  if (!focusView) return null;

  return <div className="diagram-focus-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) setFocusView(null); }}>
    <section className="diagram-focus-view" role="dialog" aria-modal="true" aria-label={focusView === "editor" ? "Mermaid source editor" : "Live diagram preview"} onKeyDown={handleKeyDown} onMouseDown={(event) => event.stopPropagation()}>
      <header>
        <div><strong>{focusView === "editor" ? "Mermaid" : "Live preview"}</strong><span>{focusView === "editor" ? supported ? "Canvas and source stay synchronized" : "Source is preserved for this diagram type" : "Current rendered diagram"}</span></div>
        {focusView === "editor" && <div className="diagram-focus-actions"><button className="diagram-export-button" onClick={() => void copySource()}><Copy size={14} />{copied ? "Copied" : "Copy code"}</button><button className="diagram-export-button" onClick={downloadSvg} disabled={!renderedPreview}><Download size={14} /> SVG</button><button className="diagram-export-button" onClick={downloadPng} disabled={!renderedPreview}><Download size={14} /> PNG</button></div>}
        <button className="diagram-close" onClick={() => setFocusView(null)} aria-label="Close popup" title="Close popup"><X size={17} /></button>
      </header>
      {focusView === "editor" ? <><div className="diagram-focus-status">{supported ? <><Check size={13} /> Flowchart supported on canvas</> : "This Mermaid family remains source-editable without canvas conversion."}</div><textarea autoFocus value={source} onChange={(event) => onSourceChange(event.target.value)} spellCheck={false} aria-label="Mermaid source editor" /></> : <div className="diagram-focus-preview">{renderedPreview ? <div className="diagram-rendered" dangerouslySetInnerHTML={{ __html: renderedPreview }} /> : <p>{previewError || "Preview appears when the Mermaid source is valid."}</p>}</div>}
      <footer><button className="diagram-cancel" onClick={() => setFocusView(null)}>Return to canvas</button></footer>
    </section>
  </div>;
}
