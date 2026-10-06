import { Command, FileText, PanelRightOpen, Plus, Sparkles } from "lucide-react";

export function EmptyEditor({ onCreate, onShowNotes }: { onCreate: () => void; onShowNotes?: () => void }) {
  return <div className="editor-empty">{onShowNotes && <button className="restore-list-empty quiet-icon" onClick={onShowNotes} title="Show notes" aria-label="Show notes"><PanelRightOpen size={17} /></button>}<div className="empty-orbit"><div className="orbit-back" /><div className="orbit-icon"><FileText size={24} /></div><span className="orbit-star"><Sparkles size={13} /></span></div><span className="eyebrow">A SPACE OF YOUR OWN</span><h2>What’s on your mind?</h2><p>Choose a note from your library, or make a little space for a new thought.</p><button className="primary-button" onClick={onCreate}><Plus size={16} /> Write a new note</button><div className="empty-shortcuts"><span><Command size={12} /> B to focus your folders</span><i /> <span>Everything saves locally</span></div></div>;
}
