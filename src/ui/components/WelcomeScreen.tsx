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
    <div className="welcome-layout">
      <section className="welcome-copy">
        <div className="welcome-kicker"><span className="kicker-star"><Sparkles size={13} /></span> YOUR PERSONAL KNOWLEDGE SPACE</div>
        <h1>Your thoughts,<br /><span>in their place.</span></h1>
        <p className="welcome-lede">A quieter home for your notes. Everything lives in your own folders — beautifully organized, always yours, and never sent anywhere.</p>
        <div className="welcome-action-card">
          <div className="welcome-folder-icon"><FolderOpen size={30} strokeWidth={1.65} /><span><ShieldCheck size={14} /></span></div>
          <div className="welcome-card-copy"><strong>{accessNeeded ? "Reconnect your Files folder" : "Start with your Files folder"}</strong><span>Choose a local folder to make it your private workspace.</span></div>
          {accessNeeded
            ? <button className="welcome-button" onClick={onReconnect}>Reconnect folder <ArrowRight size={16} /></button>
            : workspaceReady
              ? <button className="welcome-button" onClick={onOpenDashboard}>Open dashboard <ArrowRight size={16} /></button>
              : <button className="welcome-button" onClick={onChoose} disabled={!supported}>Choose a folder <ArrowRight size={16} /></button>}
          {!supported && !workspaceReady && <button className="text-button download-fallback" onClick={onDownload}>Download a sample note <ArrowDownToLine size={14} /></button>}
        </div>
        <div className="welcome-assurance"><span><ShieldCheck size={15} /> 100% on your device</span><i /><span><Sparkles size={14} /> No account required</span><i /><span><Clock3 size={14} /> Works offline</span></div>
      </section>
      <section className="welcome-art" aria-label="MarkdownOS workspace preview">
        <div className="preview-window">
          <div className="preview-titlebar"><div className="window-dots"><i /><i /><i /></div><span>My Knowledge</span><span className="preview-sync"><span /> synced locally</span></div>
          <div className="preview-body"><div className="preview-sidebar"><div className="preview-brand"><span><Sparkles size={12} /></span>MarkdownOS</div><span className="preview-nav"><Home size={12} /> All notes</span><span className="preview-section">FOLDERS</span><span className="preview-folder active"><Folder size={13} /> Product Notes <small>8</small></span><span className="preview-folder"><Folder size={13} /> System Design <small>12</small></span><span className="preview-folder"><Folder size={13} /> Journal <small>4</small></span><div className="preview-sidebar-bottom"><span><Star size={11} /> Favorites</span><span><Clock3 size={11} /> Recently opened</span></div></div>
            <div className="preview-list"><span className="preview-overline">PRODUCT NOTES</span><strong>Good ideas, kept close.</strong><div className="preview-search"><Search size={12} /> Search your notes</div><div className="preview-note active"><FileText size={14} /><div><b>Building with intention</b><small>Small details make a meaningful difference…</small><em>Today · 4 min read</em></div><Star size={11} /></div><div className="preview-note"><FileText size={14} /><div><b>The shape of a good day</b><small>Make space for the work that matters.</small><em>Yesterday · 2 min read</em></div></div><div className="preview-note"><FileText size={14} /><div><b>Ideas for later</b><small>A collection of little sparks and what-ifs.</small><em>May 18 · 3 min read</em></div></div></div>
            <div className="preview-editor"><div className="preview-editor-top"><span>PRODUCT NOTES / BUILDING WITH INTENTION</span><span><Pencil size={10} /> Edit <Eye size={10} /> Preview</span></div><div className="preview-document"><small>MONDAY, MAY 20</small><h2>Building with<br />intention.</h2><span className="preview-rule" /><p>The best tools don't ask for your attention. They make room for the things that deserve it.</p><h3>A little more focus</h3><p>Keep what matters nearby. Let everything else be quiet.</p><div className="preview-diagram"><span><Folder size={13} /> your files</span><ArrowRight size={12} /><span><ShieldCheck size={13} /> your device</span></div></div></div>
          </div>
          <div className="preview-foot"><span><ShieldCheck size={12} /> Every note stays right here, on your device.</span><span>PRIVATE BY DESIGN</span></div>
        </div>
        <div className="floating-badge badge-privacy"><div><ShieldCheck size={15} /></div><span><b>Your files, untouched</b><small>Saved right where they are.</small></span></div>
        <div className="floating-badge badge-offline"><span className="offline-spark"><Sparkles size={14} /></span><span><b>Ready when you are</b><small>No internet needed.</small></span></div>
        <div className="art-caption"><span className="caption-line" /> A little more room to think.</div>
      </section>
    </div>
    <section className="welcome-features" aria-labelledby="features-heading">
      <div className="features-heading">
        <span className="eyebrow">A BETTER PLACE FOR YOUR NOTES</span>
        <h2 id="features-heading">Everything you need. Nothing in the way.</h2>
        <p>Your writing stays simple, private, and ready whenever inspiration shows up.</p>
      </div>
      <div className="feature-grid">
        <article className="feature-card"><span className="feature-icon"><HardDrive size={19} /></span><h3>Your files stay yours</h3><p>Work directly in the folders you already use. Notes are saved on your device, not uploaded to a service.</p></article>
        <article className="feature-card"><span className="feature-icon"><Waypoints size={19} /></span><h3>Ideas, connected</h3><p>Keep folders, Markdown, tags, and Mermaid diagrams together in one calm workspace.</p></article>
        <article className="feature-card"><span className="feature-icon"><LockKeyhole size={19} /></span><h3>Private, even offline</h3><p>No account, sync server, or internet connection needed to get back to your thoughts.</p></article>
      </div>
    </section>
    <section className="welcome-tools" aria-labelledby="tools-heading">
      <div className="tools-heading">
        <span className="eyebrow">THOUGHTFUL IN THE EVERYDAY</span>
        <h2 id="tools-heading">Little details that keep you in flow.</h2>
      </div>
      <div className="tools-grid">
        <article className="tool-item"><span className="tool-icon"><Search size={18} /></span><div><h3>Find the thought</h3><p>Search note text, titles, folders, and tags to pick up an idea right where you left it.</p></div></article>
        <article className="tool-item"><span className="tool-icon"><Star size={18} /></span><div><h3>Keep good ideas close</h3><p>Favorite notes for quick access, with your recently opened writing close at hand.</p></div></article>
        <article className="tool-item"><span className="tool-icon"><Eye size={18} /></span><div><h3>Write plainly, read clearly</h3><p>Edit Markdown, switch to a clean reading view, and see Mermaid diagrams rendered inline.</p></div></article>
      </div>
    </section>
    <section className="welcome-how" aria-labelledby="how-heading">
      <div className="how-intro">
        <span className="eyebrow">A SIMPLE WAY TO BEGIN</span>
        <h2 id="how-heading">Your notes. Your folders. Your rhythm.</h2>
        <p>MarkdownOS works with the files you already have, so getting started feels familiar from the first click.</p>
      </div>
      <div className="how-steps">
        <article className="how-step"><span className="step-number">01</span><span className="step-icon"><FolderOpen size={20} /></span><h3>Choose a folder</h3><p>Pick a folder on your device. MarkdownOS asks for access only to that folder.</p></article>
        <span className="step-connector" aria-hidden="true" />
        <article className="how-step"><span className="step-number">02</span><span className="step-icon"><FileText size={20} /></span><h3>Open your notes</h3><p>Your Markdown files appear in a tidy library, ready to search, browse, and edit.</p></article>
        <span className="step-connector" aria-hidden="true" />
        <article className="how-step"><span className="step-number">03</span><span className="step-icon"><ShieldCheck size={20} /></span><h3>Keep everything local</h3><p>Changes save back to your folder. Your notes stay on your device, even offline.</p></article>
      </div>
    </section>
    <section className="welcome-closer" aria-labelledby="closer-heading">
      <div className="closer-mark"><FolderOpen size={22} /></div>
      <div className="closer-copy"><span className="eyebrow">A LITTLE MORE ROOM TO THINK</span><h2 id="closer-heading">Make space for your next idea.</h2><p>Bring your notes together in a workspace that belongs to you.</p></div>
      {accessNeeded
        ? <button className="welcome-button" onClick={onReconnect}>Reconnect folder <ArrowRight size={16} /></button>
        : workspaceReady
          ? <button className="welcome-button" onClick={onOpenDashboard}>Open dashboard <ArrowRight size={16} /></button>
          : <button className="welcome-button" onClick={onChoose} disabled={!supported}>Choose a folder <ArrowRight size={16} /></button>}
    </section>
    <section className="developer-section" aria-labelledby="developer-heading">
      <div className="developer-avatar" aria-hidden="true">PR</div>
      <div className="developer-copy">
        <span className="eyebrow">BUILT BY A DEVELOPER, FOR DEVELOPERS</span>
        <h2 id="developer-heading">Thoughtful tools, made to stay yours.</h2>
        <p>I build practical, privacy-minded software that keeps people in control of their work. MarkdownOS brings that idea to your notes: simple files, a focused workspace, and no account or cloud required.</p>
        <a className="developer-site" href="https://csepriyaranjan.ventranexa.in" target="_blank" rel="noreferrer">csepriyaranjan.ventranexa.in <ArrowUpRight size={14} /></a>
      </div>
      <a className="developer-email" href="mailto:cse.priyaranjan@gmail.com"><Mail size={16} /> Email the developer</a>
    </section>
    <footer className="welcome-footer"><span>MarkdownOS</span><span>Local-first, by nature.</span><span>MADE FOR YOUR MIND <Sparkles size={11} /></span></footer>
  </main>;
}
