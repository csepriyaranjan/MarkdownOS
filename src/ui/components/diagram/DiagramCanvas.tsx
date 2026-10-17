import "@xyflow/react/dist/style.css";
import "./diagram.css";
import {
  addEdge, Background, BackgroundVariant, Controls, MarkerType, MiniMap, Panel, ReactFlow,
  ReactFlowProvider, reconnectEdge, useEdgesState, useNodesState, type Connection, type Edge,
} from "@xyflow/react";
import { ArrowDown, ArrowRight, ArrowUp, Code2, Eye, GitBranch, MousePointer2, PanelLeftClose, PanelLeftOpen, Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DiagramModel, DiagramVisual, NodeShape } from "./model";
import { ArchitectureNode, type ArchitectureFlowNode } from "./ArchitectureNode";
import { architectureCatalog, architectureFor, inferArchitectureKind, type ArchitectureKind } from "./architectureCatalog";
import { RoutedEdge } from "./RoutedEdge";
import { AnnotationLeader } from "./AnnotationLeader";

type Viewport = { x: number; y: number; zoom: number };
type FlowEdgeData = { connector: string; bendX?: number; bendY?: number; onBendChange?: (id: string, x: number, y: number) => void; onBendCommit?: (id: string, x: number, y: number) => void };
type FlowEdge = Edge<FlowEdgeData>;
type FlowNode = ArchitectureFlowNode;
const NODE_WIDTH = 190;
const NODE_HEIGHT = 65;
const nodeTypes = { architecture: ArchitectureNode };
const edgeTypes = { routed: RoutedEdge, annotationLeader: AnnotationLeader };
const defaultEdgeOptions = { type: "straight", markerEnd: { type: MarkerType.ArrowClosed } };
function toFlowNodes(model: DiagramModel): FlowNode[] {
  const groupNames = [...new Set(model.nodes.flatMap((node) => node.group ? [node.group] : []))];
  const groups = groupNames.map((group) => {
    const children = model.nodes.filter((node) => node.group === group);
    const left = Math.min(...children.map((node) => node.x)) - 26;
    const top = Math.min(...children.map((node) => node.y)) - 48;
    const right = Math.max(...children.map((node) => node.x + 205)) + 26;
    const bottom = Math.max(...children.map((node) => node.y + 82)) + 22;
    return {
      id: `__group_${group}`,
      type: "architecture",
      position: { x: left, y: top },
      data: { label: group, kind: "__group", shape: "group" },
      style: { width: right - left, height: bottom - top },
      selectable: false,
      deletable: false,
      draggable: true,
      zIndex: -1,
    } as FlowNode;
  });
  const groupPositions = new Map(groups.map((node) => [node.data.label, node.position]));
  const children = model.nodes.map((node) => {
    const parent = node.group ? groupPositions.get(node.group) : undefined;
    return {
      id: node.id,
      type: "architecture",
      position: parent ? { x: node.x - parent.x, y: node.y - parent.y } : { x: node.x, y: node.y },
      ...(node.group ? { parentId: `__group_${node.group}`, extent: "parent" as const } : {}),
      data: { label: node.label, kind: node.kind ?? inferArchitectureKind(node.id, node.label) ?? "custom", shape: "rect", group: node.group, tone: node.tone, direction: model.direction === "TD" || model.direction === "BT" ? "TD" : "LR" },
    } as FlowNode;
  });
  const visualNodes = (model.visuals ?? []).map((visual) => ({
    id: visual.id,
    type: "architecture",
    position: { x: visual.x, y: visual.y },
    data: { label: visual.text, kind: "__text", shape: "text", tone: visual.tone, targetNodeId: visual.targetNodeId, visualOnly: true },
    draggable: true,
    selectable: true,
    width: visual.width ?? 270,
    style: { width: visual.width ?? 270 },
  } as FlowNode));
  return [...groups, ...children, ...visualNodes];
}

function toFlowEdges(model: DiagramModel): FlowEdge[] {
  return model.edges.map((edge, index) => ({
    id: `edge-${index}-${edge.from}-${edge.to}`,
    source: edge.from,
    target: edge.to,
    label: edge.label,
    type: "routed",
    markerStart: edge.connector.startsWith("<") ? { type: MarkerType.Arrow } : undefined,
    markerEnd: edge.connector.endsWith(">") ? { type: MarkerType.ArrowClosed } : undefined,
    data: { connector: edge.connector, bendX: edge.bendX, bendY: edge.bendY },
    style: { strokeWidth: edge.connector.includes("=") ? 2.8 : 1.8, strokeDasharray: edge.connector.includes(".") || (model.family === "sequence" && edge.connector.startsWith("--")) ? "5 4" : undefined },
    labelStyle: { fill: "#46544b", fontSize: 11 },
    labelBgStyle: { fill: "#ffffff", fillOpacity: 0.95 },
  }));
}

function toModel(nodes: FlowNode[], edges: FlowEdge[], family: DiagramModel["family"], direction: DiagramModel["direction"], curve: DiagramModel["curve"]): DiagramModel {
  const groups = new Map(nodes.filter((node) => node.data.kind === "__group").map((node) => [node.id, node]));
  const visuals: DiagramVisual[] = nodes.filter((node) => node.data.visualOnly).map((node) => ({ id: node.id, text: node.data.label, x: node.position.x, y: node.position.y, width: node.data.width, tone: node.data.tone, targetNodeId: node.data.targetNodeId }));
  return {
    family,
    direction,
    curve,
    nodes: nodes.filter((node) => node.data.kind !== "__group" && !node.data.visualOnly).map((node) => {
      const group = node.parentId ? groups.get(node.parentId) : undefined;
      return {
        id: node.id,
        label: node.data.label,
        kind: node.data.kind,
        shape: node.data.shape as NodeShape,
        group: node.data.group,
        tone: node.data.tone,
        x: node.position.x + (group?.position.x ?? 0),
        y: node.position.y + (group?.position.y ?? 0),
      };
    }),
    visuals,
    edges: edges.filter((edge) => !edge.id.startsWith("annotation-leader:") && !edge.source.startsWith("__group_") && !edge.target.startsWith("__group_")).map((edge) => ({
      from: edge.source,
      to: edge.target,
      label: typeof edge.label === "string" ? edge.label : "",
      connector: edge.data?.connector ?? (family === "sequence" ? "->>" : "-->"),
    })),
  };
}

export function DiagramCanvas({ model, selected, onSelect, view, onViewChange, onChange, onUndo, onRedo, canEdit, onArrange, onOpenView }: {
  model: DiagramModel | null;
  selected: string;
  onSelect: (selection: string, clientX?: number, clientY?: number) => void;
  view: Viewport;
  onViewChange: (viewport: Viewport) => void;
  onChange: (model: DiagramModel) => void;
  onUndo: () => void;
  onRedo: () => void;
  canEdit: boolean;
  onArrange: (direction: DiagramModel["direction"]) => void;
  onOpenView: (view: "editor" | "preview") => void;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([]);
  const [libraryCollapsed, setLibraryCollapsed] = useState(false);
  const modelKey = useMemo(() => JSON.stringify(model), [model]);
  const groupedCatalog = useMemo(() => [...new Set(architectureCatalog.map((item) => item.group))].map((group) => ({ group, items: architectureCatalog.filter((item) => item.group === group) })), []);

  useEffect(() => {
    setNodes(model ? toFlowNodes(model) : []);
    setEdges(model ? toFlowEdges(model) : []);
  }, [modelKey, setNodes, setEdges]);

  const onConnect = useCallback((connection: Connection) => {
    if (!model || !connection.source || !connection.target) return;
    const connector = model.family === "sequence" ? "->>" : "-->";
    const nextEdges = addEdge({ ...connection, id: `edge-${Date.now()}`, type: "routed", markerEnd: { type: MarkerType.ArrowClosed }, data: { connector } }, edges) as FlowEdge[];
    setEdges(nextEdges);
    onChange(toModel(nodes, nextEdges, model.family, model.direction, model.curve));
  }, [edges, model, nodes, onChange, setEdges]);

  const updateVisualText = useCallback((id: string, text: string, width?: number) => {
    if (!model) return;
    const nextNodes = nodes.map((node) => node.id === id ? { ...node, ...(width ? { width, style: { ...node.style, width } } : {}), data: { ...node.data, label: text, ...(width ? { width } : {}) } } : node);
    setNodes(nextNodes);
    onChange(toModel(nextNodes, edges, model.family, model.direction, model.curve));
  }, [edges, model, nodes, onChange, setNodes]);

  const updateBend = useCallback((edgeId: string, bendX: number, bendY: number) => {
    const nextEdges = edges.map((edge) => edge.id === edgeId ? { ...edge, data: { connector: edge.data?.connector ?? "-->", bendX, bendY } } : edge);
    setEdges(nextEdges);
  }, [edges, setEdges]);

  const commitBend = useCallback((edgeId: string, bendX: number, bendY: number) => {
    if (!model) return;
    const nextEdges = edges.map((edge) => edge.id === edgeId ? { ...edge, data: { connector: edge.data?.connector ?? "-->", bendX, bendY } } : edge);
    setEdges(nextEdges);
    onChange(toModel(nodes, nextEdges, model.family, model.direction, model.curve));
  }, [edges, model, nodes, onChange, setEdges]);

  const flowEdges = useMemo(() => edges.map((edge, index) => ({
    ...edge,
    selected: selected === `edge:${index}`,
    data: { connector: edge.data?.connector ?? (model?.family === "sequence" ? "->>" : "-->"), bendX: edge.data?.bendX, bendY: edge.data?.bendY, onBendChange: updateBend, onBendCommit: commitBend },
  })), [edges, model?.family, selected, updateBend, commitBend]);

  const renderedEdges = useMemo(() => {
    const leaders: FlowEdge[] = model ? (model.visuals ?? []).filter((visual) => visual.targetNodeId && model.nodes.some((node) => node.id === visual.targetNodeId)).map((visual) => ({
      id: `annotation-leader:${visual.id}`,
      source: visual.id,
      target: visual.targetNodeId!,
      type: "annotationLeader",
      data: { connector: "annotation" },
      selectable: false,
      deletable: false,
      reconnectable: false,
      focusable: false,
    })) : [];
    return [...flowEdges, ...leaders];
  }, [flowEdges, model]);

  function onDragStart(event: React.DragEvent<HTMLButtonElement>, kind: ArchitectureKind): void {
    event.dataTransfer.setData("application/markdownos-component", kind);
    event.dataTransfer.effectAllowed = "move";
  }

  function addComponent(kind: ArchitectureKind, position?: { x: number; y: number }): void {
    if (!model) return;
    const component = architectureFor(kind);
    if (!component) return;
    const index = nodes.filter((node) => node.data.kind !== "__group").length;
    if (component.visualOnly) {
      const selectedNodeId = selected.startsWith("node:") ? selected.slice(5) : undefined;
      const target = model.nodes.find((item) => item.id === selectedNodeId);
      const textNode: FlowNode = {
        id: `description_${Date.now().toString(36)}`,
        type: "architecture",
        position: position ?? { x: target ? target.x + NODE_WIDTH + 70 : 170 + (index % 3) * 235, y: target?.y ?? 140 + Math.floor(index / 3) * 155 },
        data: { label: "Write description…", kind: "__text", shape: "text", visualOnly: true, targetNodeId: target?.id, width: 270 },
        width: 270,
        style: { width: 270 },
      };
      const nextNodes = [...nodes, textNode];
      setNodes(nextNodes);
      onSelect(`node:${textNode.id}`);
      onChange(toModel(nextNodes, edges, model.family, model.direction, model.curve));
      return;
    }
    const isCustom = kind === "custom";
    const node: FlowNode = {
      id: `${kind.replace(/-/g, "_")}_${Date.now().toString(36)}`,
      type: "architecture",
      position: position ?? { x: 170 + (index % 3) * 235, y: model.family === "sequence" ? 180 : 140 + Math.floor(index / 3) * 155 },
      data: { label: isCustom ? "" : component.label, kind, shape: "rect", direction: model.direction === "TD" || model.direction === "BT" ? "TD" : "LR" },
    };
    const nextNodes = [...nodes, node];
    setNodes(nextNodes);
    onSelect(`node:${node.id}`);
    onChange(toModel(nextNodes, edges, model.family, model.direction, model.curve));
  }

  function onDrop(event: React.DragEvent): void {
    event.preventDefault();
    if (!model) return;
    const kind = event.dataTransfer.getData("application/markdownos-component") as ArchitectureKind;
    if (!architectureFor(kind)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const width = NODE_WIDTH;
    addComponent(kind, {
      x: (event.clientX - rect.left - view.x) / view.zoom - width / 2,
      y: (event.clientY - rect.top - view.y) / view.zoom - NODE_HEIGHT / 2,
    });
  }

  return <>
    <aside className={`diagram-component-library ${libraryCollapsed ? "is-collapsed" : ""}`}>
      <div className="diagram-library-heading"><button className="diagram-library-collapse" onClick={() => setLibraryCollapsed((collapsed) => !collapsed)} title={libraryCollapsed ? "Expand components" : "Collapse components"} aria-label={libraryCollapsed ? "Expand components" : "Collapse components"} aria-expanded={!libraryCollapsed}>{libraryCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}</button></div>
      <div className="diagram-library-scroll">{groupedCatalog.map(({ group, items }) => <section key={group}>
        <h3>{group}</h3>
        <div>{items.map((item) => { const Icon = item.icon; return <button key={item.kind} draggable={canEdit} disabled={!canEdit} onClick={() => addComponent(item.kind)} onDragStart={(event) => onDragStart(event, item.kind)} title={`Add ${item.label}; drag to position it`}>
          <span className={`diagram-library-icon tone-${item.color}`}><Icon size={15} /></span><span>{item.label}</span>
        </button>; })}</div>
      </section>)}</div>
    </aside>
    <section className="diagram-canvas-column">
      <div className="diagram-canvas-toolbar">
        <div className="diagram-canvas-status"><span>{model ? `${nodes.filter((node) => node.data.kind !== "__group" && !node.data.visualOnly).length} nodes · ${edges.length} connections` : "Source preview"}</span></div>
        <div className="diagram-canvas-actions">
          <button className="diagram-view-action" title="Open Mermaid source" aria-label="Open Mermaid source" onClick={() => onOpenView("editor")}><Code2 size={14} /><span>Mermaid</span></button>
          <button className="diagram-view-action" title="Open live preview" aria-label="Open live preview" onClick={() => onOpenView("preview")}><Eye size={14} /><span>Preview</span></button><span />
          <button title="Undo" aria-label="Undo" onClick={onUndo}><Undo2 size={15} /></button><button title="Redo" aria-label="Redo" onClick={onRedo}><Redo2 size={15} /></button><span />
          <button title="Zoom out" aria-label="Zoom out" onClick={() => onViewChange({ ...view, zoom: Math.max(0.45, view.zoom * 0.85) })}><ZoomOut size={15} /></button><output>{Math.round(view.zoom * 100)}%</output><button title="Zoom in" aria-label="Zoom in" onClick={() => onViewChange({ ...view, zoom: Math.min(2.4, view.zoom * 1.18) })}><ZoomIn size={15} /></button>
          <button title="Fit canvas" aria-label="Fit canvas" onClick={() => onViewChange({ x: 0, y: 0, zoom: 1 })}><GitBranch size={15} /></button>
          <span /><button title="Top to bottom" aria-label="Top to bottom" onClick={() => onArrange("TD")}><ArrowDown size={15} /></button><button title="Left to right" aria-label="Left to right" onClick={() => onArrange("LR")}><ArrowRight size={15} /></button><button title="Automatic spacing" aria-label="Automatic spacing" onClick={() => onArrange(model?.direction ?? "TD")}><ArrowUp size={15} /></button>
        </div>
      </div>
      <div className="diagram-reactflow" onDrop={onDrop} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }}>
        <ReactFlowProvider>
          <ReactFlow nodes={nodes.map((node) => ({ ...node, selected: node.data.kind !== "__group" && selected === `node:${node.id}`, data: node.data.visualOnly ? { ...node.data, onVisualTextChange: canEdit ? updateVisualText : undefined } : node.data }))} edges={renderedEdges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} edgesReconnectable={canEdit} onReconnect={(oldEdge, connection) => {
            if (!model) return;
            const nextEdges = reconnectEdge(oldEdge, connection, edges) as FlowEdge[];
            setEdges(nextEdges);
            onChange(toModel(nodes, nextEdges, model.family, model.direction, model.curve));
          }} onNodeDragStop={(_, movedNode) => {
            if (!model) return;
            const nextNodes = nodes.map((node) => node.id === movedNode.id ? { ...node, position: movedNode.position } : node);
            setNodes(nextNodes);
            onChange(toModel(nextNodes, edges, model.family, model.direction, model.curve));
          }} onNodeClick={(event, node) => { if (node.data.kind !== "__group") onSelect(`node:${node.id}`, event.clientX, event.clientY); }} onEdgeClick={(event, edge) => onSelect(`edge:${edges.findIndex((item) => item.id === edge.id)}`, event.clientX, event.clientY)} onPaneClick={() => onSelect("")} onMove={(_, viewport) => onViewChange(viewport)} nodesDraggable={canEdit} nodesConnectable={canEdit} elementsSelectable panOnDrag zoomOnScroll deleteKeyCode={null} fitView={false} defaultViewport={view} minZoom={0.35} maxZoom={2.5} connectionLineStyle={{ stroke: "#4f8064", strokeWidth: 2 }} defaultEdgeOptions={defaultEdgeOptions}>
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#dce4dd" />
            <Controls showInteractive={false} />
            <MiniMap pannable zoomable nodeColor={(node) => architectureFor((node.data as ArchitectureFlowNode["data"]).kind)?.color === "red" ? "#ce8178" : "#78a58a"} />
            {!nodes.length && <Panel position="top-center"><div className="diagram-drop-hint"><MousePointer2 size={15} /> Drag components here to begin</div></Panel>}
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </section>
  </>;
}
