import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { GripVertical } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { architectureFor } from "./architectureCatalog";

export type ArchitectureNodeData = { label: string; kind: string; shape: string; group?: string; tone?: string; direction?: "TD" | "LR"; visualOnly?: boolean; targetNodeId?: string; width?: number; onVisualTextChange?: (id: string, text: string, width?: number) => void };
export type ArchitectureFlowNode = Node<ArchitectureNodeData, "architecture">;

export function ArchitectureNode({ id, data, selected }: NodeProps<ArchitectureFlowNode>) {
  const [editing, setEditing] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const textArea = textAreaRef.current;
    if (!textArea) return;
    textArea.style.height = "auto";
    textArea.style.height = `${textArea.scrollHeight}px`;
    if (editing) textArea.focus();
  }, [data.label, editing]);

  if (data.kind === "__group") return <div className="architecture-group"><strong>{data.label}</strong><span>Group boundary</span></div>;
  if (data.visualOnly) return <div className={`diagram-text-annotation ${selected ? "selected" : ""}`} style={{ width: data.width ?? 270 }}>
    {editing ? <textarea ref={textAreaRef} className="nodrag" value={data.label} onChange={(event) => data.onVisualTextChange?.(id, event.target.value)} onBlur={(event) => { data.onVisualTextChange?.(id, event.currentTarget.value, event.currentTarget.getBoundingClientRect().width); setEditing(false); }} onPointerDown={(event) => event.stopPropagation()} onKeyDown={(event) => { if (event.key === "Escape" || (event.key === "Enter" && (event.ctrlKey || event.metaKey))) event.currentTarget.blur(); }} aria-label="Visual-only diagram description" placeholder="Write description…" />
      : <><span className="diagram-text-drag" title="Drag text" aria-label="Drag text"><GripVertical size={14} /></span><div className="diagram-text-display" onDoubleClick={(event) => { event.stopPropagation(); if (data.onVisualTextChange) setEditing(true); }}>{data.label || "Write description…"}</div></>}
  </div>;
  const component = architectureFor(data.kind);
  const Icon = component?.icon;
  const targetPosition = data.direction === "TD" ? Position.Top : Position.Left;
  const sourcePosition = data.direction === "TD" ? Position.Bottom : Position.Right;
  return <div className={`architecture-node tone-${data.tone ?? component?.color ?? "blue"} ${data.kind === "text" ? "is-text-node" : ""} ${data.kind === "custom" ? "is-custom-node" : ""} ${selected ? "selected" : ""}`}>
    <Handle type="target" position={targetPosition} />
    {data.kind !== "text" && <span className="architecture-node-icon">{Icon ? <Icon size={17} strokeWidth={1.8} /> : <span>{data.label.slice(0, 1)}</span>}</span>}
    <span className="architecture-node-copy"><strong>{data.label}</strong>{data.kind === "custom" ? <small>{id}</small> : <small>{data.group ?? component?.label ?? "Mermaid node"}</small>}</span>
    <Handle type="source" position={sourcePosition} />
  </div>;
}
