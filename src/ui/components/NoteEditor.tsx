import { Bold, ChevronsLeft, Code2, Download, Eye, Heading1, List, Network, PanelRightOpen, Pencil, ShieldCheck, Sparkles, Star, type LucideIcon } from "lucide-react";
import { useRef, useState } from "react";
import type { NoteDocument } from "../../domain";
import { MarkdownPreview } from "./MarkdownPreview";
import { DiagramEditor, firstMermaidBlock, firstMermaidMetadata } from "./DiagramEditor";

function splitEditorContent(content: string): { visible: string; metadata: string[] } {
  const metadata: string[] = [];
  const visible = content.replace(/^(?:(<!--\s*markdownos:diagram-meta\s+[^\r\n]*?\s*-->\r?\n))?(```mermaid[^\S\n]*)(?=\r?$)/gim, (_match, comment: string | undefined, fence: string) => {
    metadata.push(comment ?? "");
    return fence;
  });
  return { visible, metadata };
}

function restoreEditorMetadata(visible: string, metadata: string[]): string {
  let diagramIndex = 0;
  return visible.replace(/^(```mermaid[^\S\n]*)(?=\r?$)/gim, (fence) => `${metadata[diagramIndex++] ?? ""}${fence}`);
}

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
  const editorContent = splitEditorContent(content);
  const [diagramSource, setDiagramSource] = useState<string | null | undefined>(undefined);
  const [diagramMetadata, setDiagramMetadata] = useState<string | null>(null);

  function openDiagram(source?: string | null, metadata?: string): void {
    setDiagramSource(source === undefined ? firstMermaidBlock(content) : source);
    setDiagramMetadata(source === undefined ? firstMermaidMetadata(content) : metadata ?? null);
  }

  function insertDiagram(code: string, originalCode: string | null, metadata: string): void {
    const fence = `\`\`\`mermaid\n${code}${code.endsWith("\n") ? "" : "\n"}\`\`\``;
    const metadataComment = metadata ? `<!-- markdownos:diagram-meta ${encodeURIComponent(metadata)} -->\n` : "";
    let nextContent = content;
    if (originalCode !== null) {
      let replaced = false;
      nextContent = nextContent.replace(/^(?:<!--\s*markdownos:diagram-meta\s+[^\r\n]*?\s*-->\r?\n)?(^```mermaid[^\S\n]*\r?\n([\s\S]*?)^```[ \t]*$)/gim, (block, _fence: string, body: string) => {
        if (replaced || body.replace(/\r?\n$/, "") !== originalCode) return block;
        replaced = true;
        return `${metadataComment}${fence}`;
      });
      if (!replaced) nextContent = `${nextContent}${nextContent.endsWith("\n") || !nextContent ? "" : "\n\n"}${metadataComment}${fence}\n`;
    } else {
      nextContent = `${nextContent}${nextContent.endsWith("\n") || !nextContent ? "" : "\n\n"}${metadataComment}${fence}\n`;
    }
    onContentChange(nextContent);
    setDiagramSource(undefined);
    setDiagramMetadata(null);
  }

  function insertText(before: string, after = ""): void {
    const textarea = editorRef.current;
    if (!textarea) {
      const visible = `${editorContent.visible}${editorContent.visible ? "\n" : ""}${before}${after}`;
      onContentChange(restoreEditorMetadata(visible, editorContent.metadata));
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = editorContent.visible.slice(start, end);
    const replacement = `${before}${selected || (after ? "text" : "")}${after}`;
    const visible = `${editorContent.visible.slice(0, start)}${replacement}${editorContent.visible.slice(end)}`;
    onContentChange(restoreEditorMetadata(visible, editorContent.metadata));
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
        <button className="diagram-open-button" onClick={() => openDiagram()} title="Create or edit a Mermaid diagram"><Network size={14} /> Draw</button>
        <div className="segmented-control"><button className={editorMode === "edit" ? "selected" : ""} onClick={() => onModeChange("edit")}><Pencil size={13} /> Edit</button><button className={editorMode === "view" ? "selected" : ""} onClick={() => onModeChange("view")}><Eye size={13} /> Preview</button></div>
        <button className="quiet-icon" title="Export Markdown" onClick={onExport}><Download size={16} /></button>
        <button className="quiet-icon focus-button" title="Focus mode (⌘0)" onClick={onFocusMode}><ChevronsLeft size={17} /></button>
      </div>
    </div>
    <div className="editor-scroll">
      <div className="document-container">
        <div className="document-overline"><span className="document-type">MARKDOWN NOTE</span><span className="document-dot">·</span><span>{note.modifiedAt ? new Date(note.modifiedAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "Created just now"}</span><button className={`favorite-toggle ${favorites.includes(note.path) ? "is-favorite" : ""}`} aria-label="Toggle favorite" onClick={onToggleFavorite}><Star size={15} fill={favorites.includes(note.path) ? "currentColor" : "none"} /></button></div>
        {editorMode === "edit" ? <>
          <textarea ref={editorRef} className="editor-textarea" value={editorContent.visible} onChange={(event) => onContentChange(restoreEditorMetadata(event.target.value, editorContent.metadata))} spellCheck placeholder="Start with a thought…" aria-label="Markdown editor" />
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
        </> : <MarkdownPreview content={content} onEditDiagram={(source, metadata) => openDiagram(source, metadata)} />}
        <div className="document-tags">{note.tags.map((tag) => <button key={tag} onClick={() => onTagSelect(tag)}>#{tag}</button>)}<button className="add-tag" onClick={() => { onModeChange("edit"); onContentChange(`${content}${content.endsWith("\n") || !content ? "" : "\n"}\n#`); }}>+ tag</button></div>
      </div>
    </div>
    <div className="editor-footer"><span className="privacy-mark"><ShieldCheck size={14} /> Stored safely on your device</span><span>{content.length} characters <span className="footer-dot">·</span> Markdown</span></div>
    {diagramSource !== undefined && <DiagramEditor initialCode={diagramSource} initialMetadata={diagramMetadata} onClose={() => setDiagramSource(undefined)} onInsert={insertDiagram} />}
  </>;
}

function FormatButton({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return <button onClick={onClick} title={label}><Icon size={16} /></button>;
}
