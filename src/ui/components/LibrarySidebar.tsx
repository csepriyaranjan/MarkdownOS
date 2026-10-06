import { ChevronDown, Clock3, FileText, Folder, FolderOpen, FolderPlus, Hash, Home, PanelLeftClose, PanelLeftOpen, ShieldCheck, Star } from "lucide-react";
import type { FormEvent, MouseEvent } from "react";
import type { FolderNode, NoteDocument } from "../../domain";
import type { CreateTarget, RenameTarget } from "../types";
import { FolderTree } from "./FolderTree";
import { InlineNameForm } from "./InlineNameForm";

interface LibrarySidebarProps {
  rootName: string;
  notes: NoteDocument[];
  favorites: string[];
  tree: FolderNode;
  activeFolder: string;
  activeTag: string;
  collapsedFolders: string[];
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  mobileActive: boolean;
  allTags: string[];
  recents: string[];
  renameTarget: RenameTarget | null;
  createTarget: CreateTarget | null;
  createName: string;
  onToggleSidebar: () => void;
  onSelectAll: () => void;
  onSelectFavorites: () => void;
  onNewFolder: () => void;
  onSelectFolder: (path: string) => void;
  onToggleFolder: (path: string) => void;
  onFolderContext: (event: MouseEvent, path: string) => void;
  onRename: (path: string, kind: "file" | "directory") => void;
  onSubmitRename: (event: FormEvent<HTMLFormElement>) => void;
  onChangeRename: (value: string) => void;
  onCancelRename: () => void;
  onCreateNameChange: (value: string) => void;
  onSubmitCreate: (event: FormEvent<HTMLFormElement>) => void;
  onCancelCreate: () => void;
  onSelectTag: (tag: string) => void;
  onOpenNote: (note: NoteDocument) => void;
}

export function LibrarySidebar(props: LibrarySidebarProps) {
  const {
    rootName, notes, favorites, tree, activeFolder, activeTag, collapsedFolders, sidebarCollapsed,
    sidebarWidth, mobileActive, allTags, recents, renameTarget, createTarget, createName,
    onToggleSidebar, onSelectAll, onSelectFavorites, onNewFolder, onSelectFolder, onToggleFolder,
    onFolderContext, onRename, onSubmitRename, onChangeRename, onCancelRename, onCreateNameChange,
    onSubmitCreate, onCancelCreate, onSelectTag, onOpenNote,
  } = props;

  return <aside className={`sidebar pane ${sidebarCollapsed ? "is-collapsed" : ""} ${mobileActive ? "mobile-active" : ""}`}
    style={{ width: sidebarCollapsed ? 72 : sidebarWidth }}>
    <div className="pane-top">
      <div className={`pane-heading ${sidebarCollapsed ? "is-compact" : ""}`}>{!sidebarCollapsed && <div className="sidebar-title"><span className="eyebrow">WORKSPACE</span><h2>Library</h2></div>}
        <button className="quiet-icon sidebar-collapse-button" onClick={onToggleSidebar} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>{sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}</button>
      </div>
      {!sidebarCollapsed && <div className="workspace-card">
        <div className="workspace-avatar"><Folder size={17} fill="currentColor" /></div>
        <div className="workspace-copy"><strong>{rootName}</strong><span>{notes.length} {notes.length === 1 ? "note" : "notes"}</span></div>
        <ChevronDown size={14} className="muted-icon" />
      </div>}
    </div>
    <div className="sidebar-scroll">
      <nav className="library-nav" aria-label="Library shortcuts">
        <button className={`nav-row ${!activeFolder && !activeTag ? "active" : ""}`} title="All Notes" aria-label={`All Notes, ${notes.length}`} onClick={onSelectAll}><Home size={16} />{!sidebarCollapsed && <><span>All Notes</span><span className="nav-count">{notes.length}</span></>}</button>
        <button className={`nav-row ${activeTag === "__favorites" ? "active" : ""}`} title="Favorites" aria-label={`Favorites, ${favorites.length}`} onClick={onSelectFavorites}><Star size={16} />{!sidebarCollapsed && <><span>Favorites</span><span className="nav-count">{favorites.length}</span></>}</button>
        <div className={`section-label ${sidebarCollapsed ? "is-compact" : ""}`}>{!sidebarCollapsed && <span>YOUR FOLDERS</span>}<button className="mini-add" onClick={onNewFolder} title="New folder" aria-label="New folder"><FolderPlus size={15} /></button></div>
        {sidebarCollapsed
          ? <div className="collapsed-folder-list" aria-label="Folders">
              {tree.children.map((folder) => <button
                className={`collapsed-folder-button ${activeFolder === folder.path || activeFolder.startsWith(`${folder.path}/`) ? "active" : ""}`}
                key={folder.path}
                title={folder.name}
                aria-label={`Open folder ${folder.name}`}
                onClick={() => onSelectFolder(folder.path)}
              >{activeFolder === folder.path || activeFolder.startsWith(`${folder.path}/`) ? <FolderOpen size={17} /> : <Folder size={17} />}</button>)}
            </div>
          : <FolderTree
              node={tree}
              depth={0}
              activeFolder={activeFolder}
              collapsedFolders={collapsedFolders}
              sidebarCollapsed={false}
              renameTarget={renameTarget}
              onSelect={onSelectFolder}
              onToggle={onToggleFolder}
              onContext={onFolderContext}
              onRename={onRename}
              onSubmitRename={onSubmitRename}
              onChangeRename={onChangeRename}
              onCancelRename={onCancelRename}
            />}
        {createTarget?.kind === "directory" && createTarget.directory === activeFolder && !sidebarCollapsed &&
          <InlineNameForm value={createName} placeholder="Folder name" onChange={onCreateNameChange} onSubmit={onSubmitCreate} onCancel={onCancelCreate} />}
      </nav>
      {!sidebarCollapsed && <div className="sidebar-bottom">
        {allTags.length > 0 && <div className="sidebar-section"><div className="section-label"><span>QUICK TAGS</span><Hash size={13} /></div>
          <div className="tag-cloud">{allTags.slice(0, 7).map((tag) => <button key={tag} className={`tag-chip ${activeTag === tag ? "selected" : ""}`} onClick={() => onSelectTag(tag)}>#{tag}</button>)}</div>
        </div>}
        <div className="sidebar-section"><div className="section-label"><span>RECENTLY OPENED</span><Clock3 size={13} /></div>
          {recents.slice(0, 3).map((path) => {
            const note = notes.find((item) => item.path === path);
            return note ? <button key={path} className="recent-row" onClick={() => onOpenNote(note)}><FileText size={14} /><span>{note.name}</span></button> : null;
          })}
        </div>
        <button className="sidebar-create" onClick={onNewFolder}><FolderPlus size={16} /><span>New folder</span><span className="shortcut">⌘ N</span></button>
        <div className="local-note"><ShieldCheck size={14} /><span>Private by design.<br /><b>Never leaves this device.</b></span></div>
      </div>}
    </div>
  </aside>;
}
