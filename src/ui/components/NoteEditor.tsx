import { Bold, ChevronsLeft, Code2, Download, Eye, Heading1, List, PanelRightOpen, Pencil, ShieldCheck, Sparkles, Star, type LucideIcon } from "lucide-react";
import { useRef } from "react";
import type { NoteDocument } from "../../domain";
import { MarkdownPreview } from "./MarkdownPreview";

interface NoteEditorProps {
  note: NoteDocument;
  content: string;
  editorMode: "edit" | "view";
  saveState: "saved" | "saving" | "error";
  favorites: string[];
  wordCount: number;
  onContentChange: (content: string) => void;
  onModeChange: (mode: "edit" | "view") => void;
  onExport: () => void;
  onToggleFavorite: () => void;
  onTagSelect: (tag: string) => void;
  onFocusMode: () => void;
  onShowNotes?: () => void;
}

export function NoteEditor({
  note, content, editorMode, saveState, favorites, wordCount, onContentChange, onModeChange, onExport,
  onToggleFavorite, onTagSelect, onFocusMode, onShowNotes,
}: NoteEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);

  function insertText(before: string, after = ""): void {
    const textarea = editorRef.current;
    if (!textarea) {
      onContentChange(`${content}${content ? "\n" : ""}${before}${after}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const replacement = `${before}${selected || (after ? "text" : "")}${after}`;
    onContentChange(`${content.slice(0, start)}${replacement}${content.slice(end)}`);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selected || (after ? "text" : "")).length);
    });
  }

  return <>
    <div className="editor-topbar">
      <div className="editor-context">{onShowNotes && <button className="restore-list-inline quiet-icon" onClick={onShowNotes} title="Show notes" aria-label="Show notes"><PanelRightOpen size={16} /></button>}<span className="breadcrumb-dot" /><span>{note.path.split("/").slice(0, -1).join(" / ") || "My Files"}</span><span aria-hidden="true">›</span><strong>{note.name}</strong></div>
      <div className="editor-actions">
        <span className={`save-indicator ${saveState}`}><span className="save-dot" />{saveState === "saving" ? "Saving" : saveState === "error" ? "Save failed" : "Saved locally"}</span>
        <div className="segmented-control"><button className={editorMode === "edit" ? "selected" : ""} onClick={() => onModeChange("edit")}><Pencil size={13} /> Edit</button><button className={editorMode === "view" ? "selected" : ""} onClick={() => onModeChange("view")}><Eye size={13} /> Preview</button></div>
        <button className="quiet-icon" title="Export Markdown" onClick={onExport}><Download size={16} /></button>
        <button className="quiet-icon focus-button" title="Focus mode (⌘0)" onClick={onFocusMode}><ChevronsLeft size={17} /></button>
      </div>
    </div>
    <div className="editor-scroll">
      <div className="document-container">
        <div className="document-overline"><span className="document-type">MARKDOWN NOTE</span><span className="document-dot">·</span><span>{note.modifiedAt ? new Date(note.modifiedAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "Created just now"}</span><button className={`favorite-toggle ${favorites.includes(note.path) ? "is-favorite" : ""}`} aria-label="Toggle favorite" onClick={onToggleFavorite}><Star size={15} fill={favorites.includes(note.path) ? "currentColor" : "none"} /></button></div>
        {editorMode === "edit" ? <>
          <textarea ref={editorRef} className="editor-textarea" value={content} onChange={(event) => onContentChange(event.target.value)} spellCheck placeholder="Start with a thought…" aria-label="Markdown editor" />
          <div className="editor-tools">
            <div className="format-tools">
              <FormatButton icon={Heading1} label="Heading" onClick={() => insertText("# ")} />
              <FormatButton icon={Bold} label="Bold" onClick={() => insertText("**", "**")} />
              <FormatButton icon={List} label="List" onClick={() => insertText("- ")} />
              <FormatButton icon={Code2} label="Code block" onClick={() => insertText("```\n", "\n```")} />
              <FormatButton icon={Sparkles} label="Insert Mermaid diagram" onClick={() => insertText("```mermaid\ngraph TD\n  A[Idea] --> B[Outcome]\n```")} />
            </div>
            <div className="document-stats"><span>{wordCount} words</span><span>·</span><span>{Math.max(1, Math.ceil(wordCount / 220))} min read</span></div>
          </div>
        </> : <MarkdownPreview content={content} />}
        <div className="document-tags">{note.tags.map((tag) => <button key={tag} onClick={() => onTagSelect(tag)}>#{tag}</button>)}<button className="add-tag" onClick={() => { onModeChange("edit"); onContentChange(`${content}${content.endsWith("\n") || !content ? "" : "\n"}\n#`); }}>+ tag</button></div>
      </div>
    </div>
    <div className="editor-footer"><span className="privacy-mark"><ShieldCheck size={14} /> Stored safely on your device</span><span>{content.length} characters <span className="footer-dot">·</span> Markdown</span></div>
  </>;
}

function FormatButton({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return <button onClick={onClick} title={label}><Icon size={16} /></button>;
}
