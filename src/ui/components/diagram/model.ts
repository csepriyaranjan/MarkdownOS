import { Clipboard, Circle, Database, Diamond, Shapes, Square, type LucideIcon } from "lucide-react";

export type NodeShape = "rect" | "round" | "circle" | "diamond" | "database" | "cloud" | "queue";
export type DiagramNode = { id: string; label: string; x: number; y: number; shape: NodeShape; kind?: string; group?: string; tone?: string };
export type DiagramEdge = { from: string; to: string; label: string; connector: string; bendX?: number; bendY?: number };
export type DiagramVisual = { id: string; text: string; x: number; y: number; width?: number; tone?: string; targetNodeId?: string };
export type DiagramModel = { family: "flowchart" | "sequence"; direction: "TD" | "LR" | "BT" | "RL"; curve: "linear" | "basis"; nodes: DiagramNode[]; edges: DiagramEdge[]; visuals?: DiagramVisual[] };
export type Snapshot = { source: string; model: DiagramModel | null };

export const starterCode = `flowchart TD\n  Client["Web client"] --> API["API"]\n  API --> Data[("Database")]`;

export const shapes: { shape: NodeShape; label: string; icon: LucideIcon }[] = [
  { shape: "rect", label: "Add process", icon: Square },
  { shape: "round", label: "Add start or end", icon: Circle },
  { shape: "diamond", label: "Add decision", icon: Diamond },
  { shape: "database", label: "Add database", icon: Database },
  { shape: "cloud", label: "Add cloud", icon: Shapes },
  { shape: "queue", label: "Add queue", icon: Clipboard },
];

export const diagramTemplates = [
  { id: "blank", label: "Blank flowchart", code: starterCode },
  { id: "architecture", label: "System architecture", code: `flowchart LR\n  User((User)) -->|HTTPS| Edge["Edge / CDN"]\n  Edge --> API["API service"]\n  API --> Queue@{ shape: queue, label: "Message queue" }\n  API --> DB[("Primary database")]\n  Queue --> Worker["Background worker"]\n  Worker --> DB` },
  { id: "api", label: "API request flow", code: `flowchart TD\n  Client["Client"] -->|Request| Gateway["API gateway"]\n  Gateway --> Auth{"Authorized?"}\n  Auth -->|Yes| Service["Application service"]\n  Auth -->|No| Denied["401 response"]\n  Service --> Data[("Database")]\n  Data -->|Result| Response["Response"]` },
  { id: "microservices", label: "Microservices", code: `flowchart LR\n  Client["Web client"] --> Gateway["API gateway"]\n  subgraph Services["Services"]\n    Users["User service"]\n    Orders["Order service"]\n    Billing["Billing service"]\n  end\n  Gateway --> Users\n  Gateway --> Orders\n  Orders --> Billing\n  Orders --> Events@{ shape: queue, label: "Event stream" }` },
  { id: "deployment", label: "Cloud deployment", code: `flowchart TD\n  Internet((Internet)) --> CDN["CDN"]\n  CDN --> LB["Load balancer"]\n  subgraph Cloud["Cloud region"]\n    API["API pods"]\n    Worker["Workers"]\n    Data[("Managed database")]\n    Queue@{ shape: queue, label: "Message queue" }\n  end\n  LB --> API\n  API --> Data\n  API --> Queue\n  Queue --> Worker` },
  { id: "sequence", label: "API sequence", code: `sequenceDiagram\n  participant Client\n  participant Gateway as API Gateway\n  participant Service as API Service\n  participant DB as Database\n  Client->>Gateway: HTTPS request\n  Gateway->>Service: REST API\n  Service->>DB: SQL Query\n  DB-->>Service: Result\n  Service-->>Client: Response` },
];

export const connectorOptions = [
  { value: "-->" , label: "Arrow" }, { value: "---", label: "Line" }, { value: "-.->", label: "Dotted arrow" },
  { value: "-.-", label: "Dotted line" }, { value: "==>", label: "Thick arrow" }, { value: "===", label: "Thick line" },
  { value: "<-->", label: "Two-way arrow" }, { value: "<--", label: "Reverse arrow" }, { value: "o--o", label: "Circle ends" },
  { value: "o-->", label: "Circle start" }, { value: "--o", label: "Circle end" }, { value: "x--x", label: "Cross ends" },
  { value: "x-->", label: "Cross start" }, { value: "--x", label: "Cross end" },
];

const connectorPattern = "<==>|<-->|<-.->|<---|<==|<--|o--o|x--x|o-->|x-->|<--o|<--x|o--|x--|--o|--x|==>|===|-\\.->|-\\.-|-->|---|--";

function decodeLabel(value: string): string {
  const trimmed = value.trim();
  const unquoted = (trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ? trimmed.slice(1, -1)
    : trimmed;
  return unquoted.replace(/\\n/g, " ").replace(/\\"/g, '"');
}

function parseEndpoint(line: string, offset: number): { node: DiagramNode; end: number } | null {
  const match = /^\s*([A-Za-z_][\w]*(?:-[\w]+)*)(?:\s*(@\{[^}]*\}|\[\([^\]]*\)\]|\(\([^)]*\)\)|\([^)]*\)|\[[^\]]*\]|\{[^}]*\}))?/.exec(line.slice(offset));
  if (!match) return null;
  const [, id, token = ""] = match;
  let shape: NodeShape = "rect";
  let label = id;
  if (token.startsWith("@{")) {
    const name = /\bshape\s*:\s*([\w-]+)/i.exec(token)?.[1];
    if (name !== "cloud" && name !== "queue") return null;
    shape = name;
    label = decodeLabel(/\blabel\s*:\s*("(?:[^"\\]|\\.)*"|'[^']*'|[^,}]+)/i.exec(token)?.[1] ?? id);
  } else if (token.startsWith("[(")) { shape = "database"; label = decodeLabel(token.slice(2, -2)); }
  else if (token.startsWith("((")) { shape = "circle"; label = decodeLabel(token.slice(2, -2)); }
  else if (token.startsWith("(")) { shape = "round"; label = decodeLabel(token.slice(1, -1)); }
  else if (token.startsWith("{")) { shape = "diamond"; label = decodeLabel(token.slice(1, -1)); }
  else if (token.startsWith("[")) { label = decodeLabel(token.slice(1, -1)); }
  return { node: { id, label, x: 0, y: 0, shape }, end: offset + match[0].length };
}

export function parseFlowchart(source: string): DiagramModel | null {
  const lines = source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const header = lines.shift()?.match(/^(?:flowchart|graph)\s+(TB|TD|LR|BT|RL)\s*$/i);
  if (!header) return null;
  const model: DiagramModel = {
    family: "flowchart",
    direction: header[1].toUpperCase() === "TB" ? "TD" : header[1].toUpperCase() as DiagramModel["direction"],
    curve: "linear",
    nodes: [],
    edges: [],
  };
  const nodes = new Map<string, DiagramNode>();
  const savedNodes: Record<string, { x?: number; y?: number; kind?: string; tone?: string }> = {};
  const savedEdges: Record<string, { bendX?: number; bendY?: number }> = {};
  let visuals: DiagramVisual[] = [];
  let activeGroup = "";
  const ensureNode = (node: DiagramNode) => {
    const previous = nodes.get(node.id);
    nodes.set(node.id, previous && node.label === node.id
      ? { ...previous, ...(node.group ? { group: node.group } : {}) }
      : { ...previous, ...node });
  };

  for (const line of lines) {
    const groupStart = /^subgraph\s+([A-Za-z_][\w-]*)(?:\s*\[\s*"?(.+?)"?\s*\])?\s*$/i.exec(line);
    if (groupStart) {
      if (activeGroup) return null;
      activeGroup = (groupStart[2] ?? groupStart[1]).replace(/"/g, "").trim();
      continue;
    }
    if (/^end\s*$/i.test(line)) {
      if (!activeGroup) return null;
      activeGroup = "";
      continue;
    }
    const metadata = /^%%\s*markdownos:meta\s+(\{.*\})$/i.exec(line);
    if (metadata) {
      try {
        const parsed: unknown = JSON.parse(metadata[1]);
        if (parsed && typeof parsed === "object") {
          if ("nodes" in parsed && parsed.nodes && typeof parsed.nodes === "object") Object.assign(savedNodes, parsed.nodes);
          if ("edges" in parsed && parsed.edges && typeof parsed.edges === "object") Object.assign(savedEdges, parsed.edges);
          if ("visuals" in parsed && Array.isArray(parsed.visuals)) visuals = parsed.visuals.filter(isDiagramVisual);
        }
      } catch {
        return null;
      }
      continue;
    }
    if (/^linkStyle\s+default\s+interpolate\s+(linear|basis)\s*$/i.test(line)) {
      model.curve = /basis/i.test(line) ? "basis" : "linear";
      continue;
    }
    if (/^(?:%%|subgraph\b|end\b|direction\b|classDef\b|class\b|style\b|linkStyle\b|click\b|accTitle\b|accDescr\b)/i.test(line)) return null;
    const first = parseEndpoint(line, 0);
    if (!first) return null;
    if (activeGroup) first.node.group = activeGroup;
    ensureNode(first.node);
    let offset = first.end;
    const lineEdges: DiagramEdge[] = [];
    while (offset < line.length) {
      const rest = line.slice(offset);
      if (!rest.trim()) break;
      const edgeMatch = new RegExp(`^(\\s*)(${connectorPattern})(?:\\|([^|]*)\\|)?\\s*`).exec(rest);
      if (!edgeMatch) return null;
      const next = parseEndpoint(line, offset + edgeMatch[0].length);
      if (!next) return null;
      if (activeGroup) next.node.group = activeGroup;
      ensureNode(next.node);
      lineEdges.push({ from: lineEdges.at(-1)?.to ?? first.node.id, to: next.node.id, label: (edgeMatch[3] ?? "").trim(), connector: edgeMatch[2] });
      offset += edgeMatch[0].length + next.end - (offset + edgeMatch[0].length);
    }
    model.edges.push(...lineEdges);
  }

  model.edges = model.edges.map((edge, index) => ({ ...edge, ...savedEdges[String(index)] }));

  model.nodes = [...nodes.values()].map((node, index) => ({
    ...node,
    x: savedNodes[node.id]?.x ?? 130 + (index % 3) * 260,
    y: savedNodes[node.id]?.y ?? 100 + Math.floor(index / 3) * 170,
    kind: savedNodes[node.id]?.kind ?? node.kind,
    tone: savedNodes[node.id]?.tone ?? node.tone,
  }));
  model.visuals = visuals;
  return model;
}

export function parseSequenceDiagram(source: string): DiagramModel | null {
  const lines = source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!/^sequenceDiagram\s*$/i.test(lines.shift() ?? "")) return null;
  const model: DiagramModel = { family: "sequence", direction: "LR", curve: "linear", nodes: [], edges: [] };
  const participants = new Map<string, DiagramNode>();
  const ensureParticipant = (id: string, label = id, actor = false) => {
    if (!participants.has(id)) participants.set(id, { id, label, x: 0, y: 180, shape: actor ? "circle" : "round", kind: actor ? "sequence_actor" : "sequence_participant" });
    else if (label !== id) participants.set(id, { ...participants.get(id)!, label, shape: actor ? "circle" : participants.get(id)!.shape });
  };
  const savedNodes: Record<string, { x?: number; y?: number; kind?: string; tone?: string }> = {};
  const savedEdges: Record<string, { bendX?: number; bendY?: number }> = {};
  let visuals: DiagramVisual[] = [];

  for (const line of lines) {
    const metadata = /^%%\s*markdownos:meta\s+(\{.*\})$/i.exec(line);
    if (metadata) {
      try {
        const parsed: unknown = JSON.parse(metadata[1]);
        if (parsed && typeof parsed === "object") {
          if ("nodes" in parsed && parsed.nodes && typeof parsed.nodes === "object") Object.assign(savedNodes, parsed.nodes);
          if ("edges" in parsed && parsed.edges && typeof parsed.edges === "object") Object.assign(savedEdges, parsed.edges);
          if ("visuals" in parsed && Array.isArray(parsed.visuals)) visuals = parsed.visuals.filter(isDiagramVisual);
        }
      } catch { return null; }
      continue;
    }
    const participant = /^(participant|actor)\s+([A-Za-z_][\w-]*)(?:\s+as\s+(.+))?$/i.exec(line);
    if (participant) {
      ensureParticipant(participant[2], participant[3]?.replace(/^"|"$/g, "") ?? participant[2], participant[1].toLowerCase() === "actor");
      continue;
    }
    const message = /^([A-Za-z_][\w]*(?:-[\w]+)*)\s*(<<->>|<-->>|-->>|->>|-->|->|-x|--x|--\)|-\))\s*([A-Za-z_][\w]*(?:-[\w]+)*)\s*:\s*(.*)$/.exec(line);
    if (!message) return null;
    ensureParticipant(message[1]);
    ensureParticipant(message[3]);
    model.edges.push({ from: message[1], to: message[3], connector: message[2], label: message[4] });
  }

  model.edges = model.edges.map((edge, index) => ({ ...edge, ...savedEdges[String(index)] }));

  model.nodes = [...participants.values()].map((node, index) => ({
    ...node,
    x: savedNodes[node.id]?.x ?? 100 + index * 230,
    y: savedNodes[node.id]?.y ?? 180,
    kind: savedNodes[node.id]?.kind ?? node.kind,
    tone: savedNodes[node.id]?.tone,
  }));
  model.visuals = visuals;
  return model;
}

function isDiagramVisual(value: unknown): value is DiagramVisual {
  if (!value || typeof value !== "object") return false;
  const visual = value as Partial<DiagramVisual>;
  return typeof visual.id === "string" && typeof visual.text === "string"
    && typeof visual.x === "number" && typeof visual.y === "number"
    && (visual.width === undefined || typeof visual.width === "number");
}

export function parseMermaid(source: string, metadata?: string): DiagramModel | null {
  const model = parseFlowchart(source) ?? parseSequenceDiagram(source);
  if (!model || !metadata) return model;
  try {
    const parsed: unknown = JSON.parse(metadata);
    if (!parsed || typeof parsed !== "object") return model;
    const saved = parsed as { nodes?: unknown; edges?: unknown; visuals?: unknown; curve?: unknown };
    const savedNodes = saved.nodes && typeof saved.nodes === "object" ? saved.nodes as Record<string, Record<string, unknown>> : {};
    const savedEdges = saved.edges && typeof saved.edges === "object" ? saved.edges as Record<string, Record<string, unknown>> : {};
    model.nodes = model.nodes.map((node) => {
      const value = savedNodes[node.id];
      return value ? {
        ...node,
        x: typeof value.x === "number" ? value.x : node.x,
        y: typeof value.y === "number" ? value.y : node.y,
        kind: typeof value.kind === "string" ? value.kind : node.kind,
        tone: typeof value.tone === "string" ? value.tone : node.tone,
      } : node;
    });
    model.edges = model.edges.map((edge, index) => {
      const value = savedEdges[String(index)];
      return value ? {
        ...edge,
        bendX: typeof value.bendX === "number" ? value.bendX : undefined,
        bendY: typeof value.bendY === "number" ? value.bendY : undefined,
      } : edge;
    });
    if (Array.isArray(saved.visuals)) model.visuals = saved.visuals.filter(isDiagramVisual);
    if (saved.curve === "linear" || saved.curve === "basis") model.curve = saved.curve;
  } catch {
    return model;
  }
  return model;
}

export function cleanMermaidSource(source: string): string {
  return source.split(/\r?\n/)
    .filter((line) => !/^\s*%%\s*markdownos:meta\s+\{.*\}\s*$/i.test(line))
    .filter((line) => !/^\s*linkStyle\s+default\s+interpolate\s+(?:linear|basis)\s*$/i.test(line))
    .join("\n");
}

function quoteLabel(label: string): string {
  return `"${label.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, " ")}"`;
}

export function serializeModel(model: DiagramModel): string {
  const nodeCode = (node: DiagramNode) => {
    const label = quoteLabel(node.kind === "custom" ? node.label : node.label || node.id);
    if (node.shape === "cloud" || node.shape === "queue") return `  ${node.id}@{ shape: ${node.shape}, label: ${label} }`;
    if (node.shape === "database") return `  ${node.id}[(${label})]`;
    if (node.shape === "circle") return `  ${node.id}((${label}))`;
    if (node.shape === "round") return `  ${node.id}(${label})`;
    if (node.shape === "diamond") return `  ${node.id}{${label}}`;
    return `  ${node.id}[${label}]`;
  };
  const ungroupedCode = model.nodes.filter((node) => !node.group).map(nodeCode);
  const groups = [...new Set(model.nodes.flatMap((node) => node.group ? [node.group] : []))];
  const groupCode = groups.flatMap((group) => {
    const groupId = `group_${group.toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^\d/, "g_")}`;
    return [`  subgraph ${groupId}[${quoteLabel(group)}]`, ...model.nodes.filter((node) => node.group === group).map(nodeCode), "  end"];
  });
  const edgeCode = model.edges.map((edge) => `  ${edge.from} ${edge.connector}${edge.label ? `|${edge.label.replace(/\|/g, "/")}|` : ""} ${edge.to}`);
  if (model.family === "sequence") {
    const participants = model.nodes.map((node) => `${node.kind === "sequence_actor" ? "  actor" : "  participant"} ${node.id}${node.label !== node.id ? ` as ${quoteLabel(node.label)}` : ""}`);
    const messages = model.edges.map((edge) => `  ${edge.from}${edge.connector}${edge.to}: ${edge.label}`);
    return ["sequenceDiagram", ...participants, ...messages].join("\n");
  }
  return [`flowchart ${model.direction}`, ...ungroupedCode, ...groupCode, ...edgeCode].join("\n");
}

export function serializeDiagramMetadata(model: DiagramModel): string {
  const nodeMetadata = model.nodes.map((node) => [node.id, { x: node.x, y: node.y, ...(node.kind ? { kind: node.kind } : {}), ...(node.tone ? { tone: node.tone } : {}) }]);
  const edgeMetadata = model.edges.map((edge, index) => [String(index), { ...(edge.bendX !== undefined ? { bendX: edge.bendX } : {}), ...(edge.bendY !== undefined ? { bendY: edge.bendY } : {}) }]);
  return JSON.stringify({ nodes: Object.fromEntries(nodeMetadata), edges: Object.fromEntries(edgeMetadata), visuals: model.visuals ?? [], curve: model.curve });
}

export function autoLayout(model: DiagramModel, direction: "TD" | "LR"): DiagramModel {
  const nodeIds = model.nodes.map((node) => node.id);
  const rank = new Map(nodeIds.map((id) => [id, 0]));
  const outgoing = new Map(nodeIds.map((id) => [id, [] as string[]]));
  const incoming = new Map(nodeIds.map((id) => [id, 0]));
  for (const edge of model.edges) {
    if (!outgoing.has(edge.from) || !incoming.has(edge.to)) continue;
    outgoing.get(edge.from)?.push(edge.to);
    incoming.set(edge.to, (incoming.get(edge.to) ?? 0) + 1);
  }

  const queue = nodeIds.filter((id) => incoming.get(id) === 0);
  const visited = new Set<string>();
  while (queue.length) {
    const id = queue.shift()!;
    visited.add(id);
    for (const next of outgoing.get(id) ?? []) {
      rank.set(next, Math.max(rank.get(next) ?? 0, (rank.get(id) ?? 0) + 1));
      incoming.set(next, (incoming.get(next) ?? 1) - 1);
      if (incoming.get(next) === 0) queue.push(next);
    }
  }

  const cycles = nodeIds.filter((id) => !visited.has(id));
  cycles.forEach((id, index) => rank.set(id, index));
  const lanes = new Map<number, DiagramNode[]>();
  model.nodes.forEach((node) => {
    const nodeRank = rank.get(node.id) ?? 0;
    lanes.set(nodeRank, [...(lanes.get(nodeRank) ?? []), node]);
  });
  const nodes = [...lanes.entries()].flatMap(([nodeRank, lane]) => lane.map((node, index) => ({
    ...node,
    x: direction === "LR" ? 110 + nodeRank * 280 : 110 + index * 245,
    y: direction === "LR" ? 90 + index * 145 : 90 + nodeRank * 155,
  })));
  return { ...model, direction, nodes };
}
