import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react";
import { useRef, type PointerEvent } from "react";

type BendEdge = EdgeProps & { data?: { bendX?: number; bendY?: number; onBendChange?: (id: string, x: number, y: number) => void; onBendCommit?: (id: string, x: number, y: number) => void } };

export function RoutedEdge(props: BendEdge) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerStart, markerEnd, style, label, data, selected } = props;
  const dragging = useRef<{ pointerX: number; pointerY: number; bendX: number; bendY: number } | null>(null);
  const lastBend = useRef({ x: data?.bendX ?? 0, y: data?.bendY ?? 0 });
  const [defaultPath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  const midpointX = (sourceX + targetX) / 2 + (data?.bendX ?? 0);
  const midpointY = (sourceY + targetY) / 2 + (data?.bendY ?? 0);
  const path = data?.bendX || data?.bendY
    ? `M ${sourceX},${sourceY} Q ${midpointX},${midpointY} ${targetX},${targetY}`
    : defaultPath;

  function startBend(event: PointerEvent<HTMLButtonElement>): void {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = { pointerX: event.clientX, pointerY: event.clientY, bendX: data?.bendX ?? 0, bendY: data?.bendY ?? 0 };
  }

  function moveBend(event: PointerEvent<HTMLButtonElement>): void {
    if (!dragging.current) return;
    const start = dragging.current;
    lastBend.current = { x: start.bendX + (event.clientX - start.pointerX), y: start.bendY + (event.clientY - start.pointerY) };
    data?.onBendChange?.(id, lastBend.current.x, lastBend.current.y);
  }

  return <>
    <BaseEdge id={id} path={path} markerStart={markerStart} markerEnd={markerEnd} style={style} interactionWidth={18} />
    <EdgeLabelRenderer>
      <div className="react-flow__edge-label nodrag nopan" style={{ position: "absolute", transform: `translate(-50%, -50%) translate(${labelX + (data?.bendX ?? 0) * 0.5}px,${labelY + (data?.bendY ?? 0) * 0.5}px)`, pointerEvents: "all" }}>
        {label && <span className="diagram-flow-edge-label">{label}</span>}
        <button className={`diagram-edge-route-grip ${selected ? "selected" : ""}`} title="Drag to reroute connection" aria-label="Drag to reroute connection" onPointerDown={startBend} onPointerMove={moveBend} onPointerUp={() => { if (dragging.current) data?.onBendCommit?.(id, lastBend.current.x, lastBend.current.y); dragging.current = null; }} onPointerCancel={() => { dragging.current = null; }} />
      </div>
    </EdgeLabelRenderer>
  </>;
}
