import { AlignLeft, ChevronDown, ChevronRight, FileText, LoaderCircle, MoreHorizontal, PanelRightClose, Plus, Search, Star } from "lucide-react";
import type { FormEvent, RefObject } from "react";
import type { NoteDocument } from "../../domain";
import type { CreateTarget } from "../types";
import { InlineNameForm } from "./InlineNameForm";

interface NotesListPaneProps {
  title: string;
  rootName: string;
  notes: NoteDocument[];
  favorites: string[];
  selectedPath: string;
  mobileActive: boolean;
  listCollapsed: boolean;
  width: number;
  search: string;
  searchInputRef: RefObject<HTMLInputElement>;
  activeTag: string;
  createTarget: CreateTarget | null;
  createName: string;
  activeFolder: string;
  loading: boolean;
  onCollapse: () => void;
  onSearch: (value: string) => void;
  onCreateNote: () => void;
  onCreateNameChange: (value: string) => void;
  onSubmitCreate: (event: FormEvent<HTMLFormElement>) => void;
  onCancelCreate: () => void;
  onOpenNote: (note: NoteDocument) => void;
  onContextNote: (path: string, x: number, y: number) => void;
  onRefresh: () => void;
}

export function NotesListPane(props: NotesListPaneProps) {
  const {
    title, rootName, notes, favorites, selectedPath, mobileActive, listCollapsed, width, search,
    searchInputRef, activeTag, createTarget, createName, activeFolder, loading, onCollapse, onSearch,
    onCreateNote, onCreateNameChange, onSubmitCreate, onCancelCreate, onOpenNote, onContextNote, onRefresh,
  } = props;
  const shownNotes = activeTag === "__favorites" ? notes.filter((note) => favorites.includes(note.path)) : notes;

  return <section className={`file-pane pane ${mobileActive ? "mobile-active" : ""}`} style={{ width: listCollapsed ? 0 : width }}>
    <div className="file-pane-header">
      <div className="file-heading-line">
        <div className="breadcrumbs"><span className="crumb-muted">Library</span><ChevronRight size={13} /><strong>{title}</strong></div>
        <button className="quiet-icon" title="Collapse file list" onClick={onCollapse}><PanelRightClose size={16} /></button>
      </div>
      <div className="file-title-line"><div><h1>{title}</h1><span>{shownNotes.length} notes</span></div>
        <button className="primary-button compact" onClick={onCreateNote}><Plus size={16} /> New note</button>
      </div>
      <div className="search-box"><Search size={16} /><input ref={searchInputRef} value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search notes, content, tags..." aria-label="Search notes and content" /><kbd>⌘ K</kbd></div>
      <div className="filter-row"><span>{search || activeTag ? "SEARCH RESULTS" : "YOUR NOTES"}</span><button className="sort-button"><AlignLeft size={14} /> Recently edited <ChevronDown size={13} /></button></div>
    </div>
    <div className="note-list">
      {createTarget?.kind === "file" && createTarget.directory === activeFolder &&
        <InlineNameForm value={createName} placeholder="Note name" onChange={onCreateNameChange} onSubmit={onSubmitCreate} onCancel={onCancelCreate} />}
      {loading ? <div className="empty-list"><LoaderCircle className="spin" size={20} /> Gathering your notes…</div> :
        shownNotes.map((note) => (
          <article className={`note-card ${selectedPath === note.path ? "is-selected" : ""}`} key={note.path}
            onContextMenu={(event) => { event.preventDefault(); onContextNote(note.path, event.clientX, event.clientY); }}>
            <button className="note-card-main" onClick={() => onOpenNote(note)}>
              <div className="note-icon"><FileText size={16} /></div>
              <div className="note-card-copy"><div className="note-card-title"><strong>{note.name}</strong>{favorites.includes(note.path) && <Star size={12} fill="currentColor" />}</div><p>{note.snippet || "A new page, ready for your ideas."}</p><div className="note-meta">{note.path.split("/").slice(0, -1).join(" / ") || rootName}<span>·</span>{note.modifiedAt ? new Date(note.modifiedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Just now"}</div></div>
            </button>
            <button className="note-more" aria-label={`Actions for ${note.name}`} onClick={(event) => {
              const box = event.currentTarget.getBoundingClientRect();
              onContextNote(note.path, box.right - 180, box.bottom + 4);
            }}><MoreHorizontal size={17} /></button>
          </article>
        ))}
      {!loading && shownNotes.length === 0 && (
        <div className="empty-list"><div className="empty-list-icon"><FileText size={20} /></div><strong>{search ? "No notes found" : "A little room to think"}</strong><span>{search ? "Try another search or tag." : "Create your first note in this folder."}</span><button className="text-button" onClick={onCreateNote}>Create a note <ChevronRight size={14} /></button></div>
      )}
    </div>
    <div className="file-pane-footer"><span>{shownNotes.length} {shownNotes.length === 1 ? "note" : "notes"}</span><span className="footer-dot">·</span><span>On this device</span><button onClick={onRefresh} aria-label="Refresh folder" className="quiet-icon"><LoaderCircle size={14} className={loading ? "spin" : ""} /></button></div>
  </section>;
}
