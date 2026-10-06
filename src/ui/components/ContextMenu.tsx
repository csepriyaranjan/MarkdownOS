import { Copy, FilePlus2, FolderPlus, Pencil, Star, Trash2 } from "lucide-react";
import { useEffect } from "react";
import type { ContextTarget } from "../types";

interface ContextMenuProps {
  target: ContextTarget;
  favorite: boolean;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onFavorite: () => void;
  onCopyPath: () => void;
  onNewInside: (kind: "file" | "directory") => void;
  onClose: () => void;
}

export function ContextMenu({ target, favorite, onRename, onDuplicate, onDelete, onFavorite, onCopyPath, onNewInside, onClose }: ContextMenuProps) {
  useEffect(() => {
    const dismiss = () => onClose();
    document.addEventListener("click", dismiss);
    document.addEventListener("keydown", dismiss);
    return () => { document.removeEventListener("click", dismiss); document.removeEventListener("keydown", dismiss); };
  }, [onClose]);
  return <div className="context-menu" style={{ left: Math.min(target.x, window.innerWidth - 210), top: Math.min(target.y, window.innerHeight - 260) }} onClick={(event) => event.stopPropagation()}>
    {target.kind === "directory" && <><button onClick={() => onNewInside("file")}><FilePlus2 size={15} /> New note inside</button><button onClick={() => onNewInside("directory")}><FolderPlus size={15} /> New folder inside</button><div className="context-separator" /></>}
    <button onClick={onRename}><Pencil size={15} /> Rename <kbd>↵</kbd></button>
    {target.kind === "file" && <><button onClick={onDuplicate}><Copy size={15} /> Duplicate</button><button onClick={onFavorite}><Star size={15} fill={favorite ? "currentColor" : "none"} /> {favorite ? "Remove favorite" : "Add to favorites"}</button><button onClick={onCopyPath}><Copy size={15} /> Copy local path</button><div className="context-separator" /></>}
    {target.kind === "directory" && <><button onClick={onDuplicate}><Copy size={15} /> Duplicate folder</button><div className="context-separator" /></>}
    <button className="context-danger" onClick={onDelete}><Trash2 size={15} /> Delete</button>
  </div>;
}
