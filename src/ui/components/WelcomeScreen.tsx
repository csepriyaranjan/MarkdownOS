import { ArrowDownToLine, ArrowRight, ArrowUpRight, Clock3, Eye, FileText, Folder, FolderOpen, HardDrive, Home, LockKeyhole, Mail, Pencil, Search, ShieldCheck, Sparkles, Star, Waypoints } from "lucide-react";

interface WelcomeScreenProps {
  supported: boolean;
  accessNeeded: boolean;
  workspaceReady: boolean;
  onOpenDashboard: () => void;
  onChoose: () => void;
  onReconnect: () => void;
  onDownload: () => void;
}

export function WelcomeScreen({ supported, accessNeeded, workspaceReady, onOpenDashboard, onChoose, onReconnect, onDownload }: WelcomeScreenProps) {
  return <main className="welcome-stage">
    <div className="welcome-decoration glow-one" /><div className="welcome-decoration glow-two" />

    <section className="welcome-hero">
      <div className="hero-copy">
        <div className="welcome-kicker"><span className="kicker-star"><Sparkles size={13} /></span> A quieter way to work with notes</div>
        <h1>Your ideas deserve<br /><span>more room.</span></h1>
        <p className="welcome-lede">MarkdownOS brings your Markdown files, folders, and thoughts into one calm, private workspace—built to stay out of your way.</p>
        <div className="hero-actions">
          {accessNeeded
            ? <button className="welcome-button" onClick={onReconnect}>Reconnect folder <ArrowRight size={16} /></button>
            : workspaceReady
              ? <button className="welcome-button" onClick={onOpenDashboard}>Open dashboard <ArrowRight size={16} /></button>
              : <button className="welcome-button" onClick={onChoose} disabled={!supported}>Choose your folder <ArrowRight size={16} /></button>}
          {!supported && !workspaceReady && <button className="welcome-secondary-button" onClick={onDownload}><ArrowDownToLine size={15} /> Download sample</button>}
        </div>
        <div className="hero-proof">
          <span><ShieldCheck size={14} /> Local-first</span>
          <span><Clock3 size={14} /> Works offline</span>
          <span><Sparkles size={14} /> No account</span>
        </div>
      </div>

      <div className="hero-visual" aria-label="MarkdownOS workspace preview">
        <div className="visual-orbit orbit-one" />
        <div className="visual-orbit orbit-two" />
        <div className="workspace-preview">
          <div className="preview-topbar">
            <div className="preview-window-controls"><i /><i /><i /></div>
            <span>My Knowledge</span>
            <div className="preview-status"><span /> Local</div>
          </div>
          <div className="preview-workspace">
            <aside className="preview-sidebar">
              <div className="preview-brand"><span><Sparkles size={13} /></span>MarkdownOS</div>
              <div className="preview-nav-item active"><Home size={13} /> All notes <b>24</b></div>
              <div className="preview-nav-item"><FileText size={13} /> Recent</div>
              <div className="preview-section-label">FOLDERS</div>
              <div className="preview-folder-item active"><Folder size={13} /> Product Notes <em>8</em></div>
              <div className="preview-folder-item"><Folder size={13} /> System Design <em>12</em></div>
              <div className="preview-folder-item"><Folder size={13} /> Journal <em>4</em></div>
              <div className="preview-sidebar-footer"><span><Star size={12} /> Favorites</span><span><Clock3 size={12} /> Recents</span></div>
            </aside>
            <div className="preview-list">
              <div className="preview-list-heading"><span>PRODUCT NOTES</span><button aria-label="Add note">+</button></div>
              <strong>Good ideas, kept close.</strong>
              <label><Search size={12} /> Search your notes</label>
              <div className="preview-note selected"><span className="preview-note-icon"><FileText size={13} /></span><div><b>Building with intention</b><small>Small details make a meaningful difference…</small><em>Today · 4 min</em></div><Star size={11} /></div>
              <div className="preview-note"><span className="preview-note-icon"><FileText size={13} /></span><div><b>The shape of a good day</b><small>Make space for the work that matters.</small><em>Yesterday · 2 min</em></div></div>
            </div>
            <div className="preview-editor">
              <div className="preview-editor-header"><span>PRODUCT NOTES / BUILDING WITH INTENTION</span><div><Pencil size={11} /> Edit <Eye size={11} /> Preview</div></div>
              <div className="preview-document"><small>MONDAY, MAY 20</small><h2>Building with intention.</h2><span className="preview-rule" /><p>The best tools don’t ask for your attention. They make room for the things that deserve it.</p><h3>A little more focus</h3><p>Keep what matters nearby. Let everything else be quiet.</p></div>
              <div className="preview-editor-footer"><span><ShieldCheck size={11} /> Saved locally</span><span>Markdown</span></div>
            </div>
          </div>
        </div>
        <div className="visual-float float-privacy"><span><ShieldCheck size={14} /></span><div><b>Private by design</b><small>Nothing leaves your device.</small></div></div>
        <div className="visual-float float-offline"><span><Sparkles size={14} /></span><div><b>Ready offline</b><small>Use it anywhere.</small></div></div>
      </div>
    </section>

    <section className="welcome-features" aria-labelledby="features-heading">
      <div className="features-intro">
        <span className="eyebrow">Designed around focus</span>
        <h2 id="features-heading">Less interface.<br />More thinking.</h2>
        <p>MarkdownOS keeps the essentials close and the noise out of the way, so your work can feel exactly as it should.</p>
      </div>
      <div className="feature-grid">
        <article className="feature-card"><span className="feature-index">01</span><span className="feature-icon"><HardDrive size={20} /></span><h3>Your files stay yours</h3><p>Work directly in the folders you already use. Every change is saved locally, never uploaded.</p></article>
        <article className="feature-card"><span className="feature-index">02</span><span className="feature-icon"><Waypoints size={20} /></span><h3>Connected by nature</h3><p>Folders, tags, favorites, and Markdown stay together in one clear, uninterrupted workspace.</p></article>
        <article className="feature-card"><span className="feature-index">03</span><span className="feature-icon"><LockKeyhole size={20} /></span><h3>Private, always</h3><p>No account, cloud service, or sync server. Your notes remain on your device, even offline.</p></article>
      </div>
    </section>

    <section className="welcome-tools" aria-labelledby="tools-heading">
      <div className="tools-heading"><span className="eyebrow">Thoughtful in the everyday</span><h2 id="tools-heading">Small details, made useful.</h2></div>
      <div className="tools-grid">
        <article className="tool-item"><span className="tool-icon"><Search size={18} /></span><div><h3>Find the thought</h3><p>Search titles, note content, folders, and tags without breaking your flow.</p></div></article>
        <article className="tool-item"><span className="tool-icon"><Star size={18} /></span><div><h3>Keep good ideas close</h3><p>Save favorites and return to recently opened notes in a single click.</p></div></article>
        <article className="tool-item"><span className="tool-icon"><Eye size={18} /></span><div><h3>Write and read clearly</h3><p>Edit Markdown, switch to a clean reading view, and render Mermaid diagrams inline.</p></div></article>
      </div>
    </section>

    <section className="welcome-how" aria-labelledby="how-heading">
      <div className="how-intro"><span className="eyebrow">From idea to workspace</span><h2 id="how-heading">Three steps. No setup maze.</h2><p>Start with the folder you already use. Everything else is designed around it.</p></div>
      <div className="how-steps">
        <article className="how-step"><span className="step-number">01</span><span className="step-icon"><FolderOpen size={20} /></span><h3>Choose your folder</h3><p>Pick a local folder and MarkdownOS will do the rest.</p></article>
        <span className="step-connector" aria-hidden="true" />
        <article className="how-step"><span className="step-number">02</span><span className="step-icon"><FileText size={20} /></span><h3>Open your notes</h3><p>Browse, search, edit, and organize your Markdown files.</p></article>
        <span className="step-connector" aria-hidden="true" />
        <article className="how-step"><span className="step-number">03</span><span className="step-icon"><ShieldCheck size={20} /></span><h3>Stay in control</h3><p>Your work stays on your device and saves back to your folder.</p></article>
      </div>
    </section>

    <section className="welcome-closer" aria-labelledby="closer-heading">
      <div className="closer-copy"><span className="eyebrow">Your next idea is waiting</span><h2 id="closer-heading">Start with a folder.<br />Keep the space for your thoughts.</h2></div>
      <div className="closer-action">
        {accessNeeded ? <button className="welcome-button" onClick={onReconnect}>Reconnect folder <ArrowRight size={16} /></button> : workspaceReady ? <button className="welcome-button" onClick={onOpenDashboard}>Open dashboard <ArrowRight size={16} /></button> : <button className="welcome-button" onClick={onChoose} disabled={!supported}>Choose your folder <ArrowRight size={16} /></button>}
        {!supported && !workspaceReady && <button className="welcome-secondary-button" onClick={onDownload}><ArrowDownToLine size={15} /> Sample note</button>}
      </div>
    </section>

    <section className="developer-section" aria-labelledby="developer-heading">
      <div className="developer-portrait" aria-hidden="true"><span>PR</span><i /></div>
      <div className="developer-copy">
        <span className="eyebrow">Built by a developer, for developers</span>
        <h2 id="developer-heading">I care about software that feels human.</h2>
        <p>Hi, I’m Priyaranjan—a developer creating practical tools for people who value their work and their privacy. MarkdownOS is my attempt to make local-first note-taking feel beautifully simple.</p>
        <div className="developer-links">
          <a href="https://csepriyaranjan.ventranexa.in" target="_blank" rel="noreferrer">csepriyaranjan.ventranexa.in <ArrowUpRight size={14} /></a>
          <a href="mailto:cse.priyaranjan@gmail.com"><Mail size={14} /> Email me</a>
        </div>
      </div>
      <div className="developer-note"><span>01</span><p>Built from first principles.<br />Designed for daily use.</p></div>
    </section>

    <footer className="welcome-footer"><span>MarkdownOS</span><span>Local-first, by nature.</span><span>Made for the mind <Sparkles size={11} /></span></footer>
  </main>;
}
