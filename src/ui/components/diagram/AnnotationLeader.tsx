import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";

export function AnnotationLeader(props: EdgeProps) {
  const [path] = getBezierPath(props);
  return <BaseEdge id={props.id} path={path} style={{ stroke: "#c6d2c9", strokeWidth: 1.35, strokeDasharray: "3 6", strokeLinecap: "round" }} interactionWidth={0} />;
}
