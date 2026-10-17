import { Check, GitBranch, Plus, X } from "lucide-react";
import DOMPurify from "dompurify";
import { useEffect, useMemo, useRef, useState } from "react";
import { DiagramCanvas } from "./diagram/DiagramCanvas";
import { DiagramInspector } from "./diagram/DiagramInspector";
import { DiagramSourceWorkspace } from "./diagram/DiagramSourceWorkspace";
import { autoLayout, cleanMermaidSource, diagramTemplates, parseMermaid, serializeDiagramMetadata, serializeModel, starterCode, type DiagramEdge, type DiagramModel, type DiagramNode, type Snapshot } from "./diagram/model";

export function firstMermaidBlock(content: string): string | null {
  const match = /^```mermaid[^\S\n]*\r?\n([\s\S]*?)^```[ \t]*$/im.exec(content);
  return match?.[1]?.replace(/\r?\n$/, "") ?? null;
}

export function firstMermaidMetadata(content: string): string | null {
  const match = /^<!--\s*markdownos:diagram-meta\s+([^\r\n]*?)\s*-->\s*\r?\n```mermaid[^\S\n]*\r?\n[\s\S]*?^```[ \t]*$/im.exec(content);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export function DiagramEditor({ initialCode, initialMetadata, onClose, onInsert }: {
  initialCode: string | null;
  initialMetadata?: string | null;
  onClose: () => void;
  onInsert: (code: string, originalCode: string | null, metadata: string) => void;
}) {
  const [originalCode, setOriginalCode] = useState(initialCode);
  const [source, setSource] = useState(cleanMermaidSource(initialCode ?? starterCode));
  const [model, setModel] = useState(() => parseMermaid(initialCode ?? starterCode, initialMetadata ?? undefined));
  const [layoutMetadata, setLayoutMetadata] = useState(() => {
    const initialModel = parseMermaid(initialCode ?? starterCode, initialMetadata ?? undefined);
    return initialModel ? serializeDiagramMetadata(initialModel) : initialMetadata ?? "";
  });
  const [selected, setSelected] = useState("");
  const [inspectorPosition, setInspectorPosition] = useState<{ left: number; top: number } | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
  const [past, setPast] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);
  const [renderedPreview, setRenderedPreview] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [template, setTemplate] = useState("");
  const [focusRequest, setFocusRequest] = useState<"editor" | "preview" | null>(null);
  const sourceTimer = useRef<number | null>(null);
  const sourceBefore = useRef<Snapshot | null>(null);

  const parsedSource = useMemo(() => parseMermaid(source), [source]);
  const canEditCanvas = Boolean(model && parsedSource && !previewError);
  const selectedNode = model?.nodes.find((node) => `node:${node.id}` === selected);
  const selectedEdgeIndex = selected.startsWith("edge:") ? Number(selected.slice(5)) : -1;
  const selectedEdge = selectedEdgeIndex >= 0 ? model?.edges[selectedEdgeIndex] : undefined;

  useEffect(() => {
    let cancelled = false;
    setRenderedPreview("");
    setPreviewError("");
    if (!source.trim()) return;
    void (async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({ startOnLoad: false, securityLevel: "strict", suppressErrorRendering: true, htmlLabels: false, theme: "default" });
        await mermaid.parse(source);
        const result = await mermaid.render(`diagram-preview-${crypto.randomUUID()}`, source);
        if (!cancelled) setRenderedPreview(DOMPurify.sanitize(result.svg, { USE_PROFILES: { svg: true, svgFilters: true } }));
      } catch (error) {
        if (!cancelled) setPreviewError(error instanceof Error ? error.message.split("\n")[0] : "Mermaid could not render this source.");
      }
    })();
    return () => { cancelled = true; };
  }, [source]);

  useEffect(() => () => {
    if (sourceTimer.current !== null) window.clearTimeout(sourceTimer.current);
  }, []);

  function remember(snapshot: Snapshot): void {
    setPast((items) => [...items.slice(-49), snapshot]);
    setFuture([]);
  }

  function commitModel(next: DiagramModel, before = model): void {
    if (!before) return;
    remember({ source, model: before });
    setModel(next);
    setLayoutMetadata(serializeDiagramMetadata(next));
    setSource(serializeModel(next));
  }

  function undo(): void {
    const previous = past[past.length - 1];
    if (!previous) return;
    setFuture((items) => [...items, { source, model }]);
    setPast((items) => items.slice(0, -1));
    setSource(previous.source);
    setModel(previous.model);
    if (previous.model) setLayoutMetadata(serializeDiagramMetadata(previous.model));
  }

  function redo(): void {
    const next = future[future.length - 1];
    if (!next) return;
    setPast((items) => [...items, { source, model }]);
    setFuture((items) => items.slice(0, -1));
    setSource(next.source);
    setModel(next.model);
    if (next.model) setLayoutMetadata(serializeDiagramMetadata(next.model));
  }

  function updateSource(value: string): void {
    setSource(value);
    setModel(parseMermaid(value, layoutMetadata));
    if (sourceTimer.current === null) sourceBefore.current = { source, model };
    if (sourceTimer.current !== null) window.clearTimeout(sourceTimer.current);
    sourceTimer.current = window.setTimeout(() => {
      if (sourceBefore.current) remember(sourceBefore.current);
      sourceBefore.current = null;
      sourceTimer.current = null;
    }, 500);
  }

  function updateNode(node: DiagramNode): void {
    if (!model || !selectedNode) return;
    const next: DiagramModel = {
      ...model,
      nodes: model.nodes.map((item) => item.id === selectedNode.id ? node : item),
      edges: model.edges.map((edge) => ({ ...edge, from: edge.from === selectedNode.id ? node.id : edge.from, to: edge.to === selectedNode.id ? node.id : edge.to })),
    };
    commitModel(next);
    if (node.id !== selectedNode.id) setSelected(`node:${node.id}`);
  }

  function updateEdge(edge: DiagramEdge): void {
    if (!model || !selectedEdge) return;
    commitModel({ ...model, edges: model.edges.map((item, index) => index === selectedEdgeIndex ? edge : item) });
  }

  function deleteSelected(): void {
    if (!model) return;
    if (selectedNode) commitModel({ ...model, nodes: model.nodes.filter((node) => node.id !== selectedNode.id), edges: model.edges.filter((edge) => edge.from !== selectedNode.id && edge.to !== selectedNode.id) });
    else if (selectedEdge) commitModel({ ...model, edges: model.edges.filter((_, index) => index !== selectedEdgeIndex) });
    setSelected("");
    setInspectorPosition(null);
  }

  function selectCanvasItem(selection: string, clientX?: number, clientY?: number): void {
    setSelected(selection);
    if (!selection) {
      setInspectorPosition(null);
      return;
    }
    const popupWidth = Math.min(300, window.innerWidth - 24);
    const popupHeight = Math.min(390, window.innerHeight - 100);
    const left = Math.max(12, Math.min((clientX ?? window.innerWidth / 2) + 14, window.innerWidth - popupWidth - 12));
    const top = Math.max(76, Math.min((clientY ?? window.innerHeight / 2) + 12, window.innerHeight - popupHeight - 70));
    setInspectorPosition({ left, top });
  }

  function arrange(direction: DiagramModel["direction"]): void {
    if (!model) return;
    commitModel(autoLayout(model, direction === "BT" || direction === "RL" ? direction === "BT" ? "TD" : "LR" : direction));
  }

  function applyTemplate(templateId: string): void {
    const choice = diagramTemplates.find((item) => item.id === templateId);
    if (!choice) return;
    remember({ source, model });
    setSource(choice.code);
    setModel(parseMermaid(choice.code));
    const nextModel = parseMermaid(choice.code);
    setLayoutMetadata(nextModel ? serializeDiagramMetadata(nextModel) : "");
    setOriginalCode(null);
    setSelected("");
    setTemplate("");
  }

  function startNewDiagram(): void {
    applyTemplate("blank");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") { event.preventDefault(); event.shiftKey ? redo() : undo(); }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") { event.preventDefault(); redo(); }
    if (event.key === "Escape") onClose();
    if ((event.key === "Delete" || event.key === "Backspace") && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) deleteSelected();
  }

  return <div className="diagram-modal" role="dialog" aria-modal="true" aria-label="Diagram editor" onKeyDown={handleKeyDown}>
    <header className="diagram-header">
      <div className="diagram-title"><span className="diagram-mark"><GitBranch size={17} /></span><div><strong>Diagram editor</strong><small>{originalCode === null ? "New diagram" : "Editing Mermaid from note"}</small></div></div>
      <div className="diagram-header-actions">
        <label className="diagram-template-select" title="Start from a diagram template"><span>Template</span><select value={template} onChange={(event) => applyTemplate(event.target.value)}><option value="">Choose</option>{diagramTemplates.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <button className="diagram-new-button" onClick={startNewDiagram} title="Start a new diagram"><Plus size={14} /> New</button>
        <button className="diagram-close" aria-label="Close diagram editor" title="Close" onClick={onClose}><X size={17} /></button>
      </div>
    </header>

    <div className="diagram-workspace">
      <DiagramCanvas model={model} selected={selected} onSelect={selectCanvasItem} view={view} onViewChange={setView} onChange={(next) => { if (model) remember({ source, model }); setModel(next); setLayoutMetadata(serializeDiagramMetadata(next)); setSource(serializeModel(next)); }} onUndo={undo} onRedo={redo} canEdit={canEditCanvas} onArrange={arrange} onOpenView={setFocusRequest} />
    </div>
    {inspectorPosition && (selectedNode || selectedEdge) && <div className="diagram-inspector-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) selectCanvasItem(""); }}>
      <aside className="diagram-inspector-popover" style={{ left: inspectorPosition.left, top: inspectorPosition.top }} onMouseDown={(event) => event.stopPropagation()} onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); selectCanvasItem(""); } }}>
        <header><strong>{selectedNode ? selectedNode.label || "Node" : "Connection"}</strong><button className="diagram-inspector-close" onClick={() => selectCanvasItem("")} aria-label="Close properties"><X size={15} /></button></header>
        <DiagramInspector node={selectedNode} edge={selectedEdge} model={model} onNodeChange={updateNode} onEdgeChange={updateEdge} onDelete={deleteSelected} />
      </aside>
    </div>}
    <DiagramSourceWorkspace source={source} onSourceChange={updateSource} renderedPreview={renderedPreview} previewError={previewError} supported={canEditCanvas} focusRequest={focusRequest} onFocusRequestHandled={() => setFocusRequest(null)} />

    <footer className="diagram-footer"><span>{canEditCanvas ? "Flowchart canvas and Mermaid source are synchronized" : "Unsupported diagrams remain source-editable and are never converted"}</span><div><button className="diagram-cancel" onClick={onClose}>Cancel</button><button className="diagram-insert" onClick={() => onInsert(source, originalCode, model ? serializeDiagramMetadata(model) : layoutMetadata)} disabled={!source.trim()}><Check size={15} /> Insert into Note</button></div></footer>
  </div>;
}

export { parseMermaid, serializeModel, starterCode };
