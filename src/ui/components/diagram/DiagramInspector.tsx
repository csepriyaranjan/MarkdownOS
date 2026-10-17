import { ArrowRight, MousePointer2, Trash2 } from "lucide-react";
import type { DiagramEdge, DiagramNode, DiagramModel } from "./model";
import { connectorOptions } from "./model";

export function DiagramInspector({ node, edge, model, onNodeChange, onEdgeChange, onDelete }: {
  node?: DiagramNode;
  edge?: DiagramEdge;
  model: DiagramModel | null;
  onNodeChange: (node: DiagramNode) => void;
  onEdgeChange: (edge: DiagramEdge) => void;
  onDelete: () => void;
}) {
  return <div className="diagram-inspector">
    {node ? <>
      <label>Node label<input value={node.label} onChange={(event) => onNodeChange({ ...node, label: event.target.value })} /></label>
      <label>Group<input value={node.group ?? ""} onChange={(event) => onNodeChange({ ...node, group: event.target.value.trim() || undefined })} placeholder="e.g. Backend" /></label>
      <label>Color<select value={node.tone ?? "auto"} onChange={(event) => onNodeChange({ ...node, tone: event.target.value === "auto" ? undefined : event.target.value })}><option value="auto">Component default</option><option value="teal">Teal</option><option value="blue">Blue</option><option value="amber">Amber</option><option value="violet">Violet</option><option value="green">Green</option><option value="red">Red</option><option value="slate">Slate</option></select></label>
      <label>Identifier<input value={node.id} onChange={(event) => {
        const id = event.target.value.replace(/[^A-Za-z0-9_]/g, "");
        if (id && model && !model.nodes.some((item) => item.id === id && item.id !== node.id)) {
          onNodeChange({ ...node, id });
        }
      }} /></label>
      <button className="diagram-delete" onClick={onDelete}><Trash2 size={14} /> Delete node</button>
    </> : edge ? <>
      <label>Connection label<input value={edge.label} onChange={(event) => onEdgeChange({ ...edge, label: event.target.value })} placeholder="Optional label" /></label>
      <label>Arrow and line<select value={edge.connector} onChange={(event) => onEdgeChange({ ...edge, connector: event.target.value })}>{connectorOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      <div className="diagram-edge-endpoints"><span>{edge.from}</span><ArrowRight size={14} /><span>{edge.to}</span></div>
      <button className="diagram-delete" onClick={onDelete}><Trash2 size={14} /> Delete connection</button>
    </> : <div className="diagram-inspector-empty"><span><MousePointer2 size={16} /></span><strong>Select a node or connection</strong><p>Properties and labels will appear here.</p></div>}
  </div>;
}
