import { Check, ChevronDown, ChevronRight, Folder, FolderOpen, X } from "lucide-react";
import type { FormEvent, MouseEvent } from "react";
import type { FolderNode } from "../../domain";
import type { RenameTarget } from "../types";

interface FolderTreeProps {
  node: FolderNode;
  depth: number;
  activeFolder: string;
  collapsedFolders: string[];
  sidebarCollapsed: boolean;
  renameTarget: RenameTarget | null;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
  onContext: (event: MouseEvent, path: string) => void;
  onRename: (path: string, kind: "file" | "directory") => void;
  onSubmitRename: (event: FormEvent<HTMLFormElement>) => void;
  onChangeRename: (value: string) => void;
  onCancelRename: () => void;
}

function folderCount(node: FolderNode): number {
  return node.files.length + node.children.reduce((count, child) => count + folderCount(child), 0);
}

export function FolderTree(props: FolderTreeProps) {
  const { node, depth, activeFolder, collapsedFolders, sidebarCollapsed, renameTarget, onSelect, onToggle, onContext, onRename, onSubmitRename, onChangeRename, onCancelRename } = props;
  const isActive = activeFolder === node.path;
  const collapsed = collapsedFolders.includes(node.path);
  const count = folderCount(node);
  return <div className={`folder-tree-item ${isActive ? "is-active" : ""}`} onContextMenu={(event) => { if (depth) onContext(event, node.path); }}>
    <div className="folder-row" style={{ paddingLeft: sidebarCollapsed ? 0 : 8 + depth * 15 }} onDoubleClick={() => onRename(node.path, "directory")}>
      {!sidebarCollapsed && <button className="folder-disclosure" onClick={() => onToggle(node.path)} aria-label={`${collapsed ? "Expand" : "Collapse"} ${node.name}`}>{node.children.length ? collapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} /> : <span className="disclosure-spacer" />}</button>}
      {renameTarget?.path === node.path && !sidebarCollapsed
        ? <form className="rename-inline" onSubmit={onSubmitRename}><input autoFocus value={renameTarget.value} onChange={(event) => onChangeRename(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") onCancelRename(); }} /><button aria-label="Save rename"><Check size={13} /></button><button type="button" aria-label="Cancel rename" onClick={onCancelRename}><X size={13} /></button></form>
        : <button className="folder-select" title={sidebarCollapsed ? node.name : undefined} onClick={() => { onSelect(node.path); if (collapsed) onToggle(node.path); }}><span className="folder-row-icon">{isActive ? <FolderOpen size={15} fill="currentColor" /> : <Folder size={15} />}</span>{!sidebarCollapsed && <><span className="folder-name">{node.name}</span><span className="folder-count">{count}</span></>}</button>}
    </div>
    {!collapsed && node.children.length > 0 && <div className="folder-children">{node.children.map((child) => <FolderTree key={child.path} {...props} node={child} depth={depth + 1} />)}</div>}
  </div>;
}
