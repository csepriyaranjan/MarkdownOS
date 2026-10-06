import {
  ArrowDownToLine, ArrowRight, ArrowUpRight, Check, Clock3, Code2, FileCode2, FileText, Folder, FolderOpen,
  Github, HardDrive, Heart, LockKeyhole, Mail, Pencil, Search, ShieldCheck, Sparkles, Star, WifiOff,
} from "lucide-react";

interface WelcomeScreenProps {
  supported: boolean;
  accessNeeded: boolean;
  workspaceReady: boolean;
  onOpenDashboard: () => void;
  onChoose: () => void;
  onReconnect: () => void;
  onDownload: () => void;
}

const githubUrl = "https://github.com/csepriyaranjan/MarkdownOS";

export function WelcomeScreen({ supported, accessNeeded, workspaceReady, onOpenDashboard, onChoose, onReconnect, onDownload }: WelcomeScreenProps) {
  return <main className="welcome-stage">
    <section className="welcome-hero" aria-labelledby="hero-heading">
      <div className="hero-copy">
        <div className="welcome-kicker"><span className="kicker-star"><Sparkles size={13} /></span> FREE <i /> LOCAL-FIRST <i /> OFFLINE</div>
        <h1 id="hero-heading">Your ideas deserve<br /><span>more room.</span></h1>
        <p className="welcome-lede">A quiet, private workspace for your Markdown files—built to work offline, stay out of your way, and keep your files yours.</p>
        <div className="hero-actions">
          <StartButton supported={supported} accessNeeded={accessNeeded} workspaceReady={workspaceReady} onChoose={onChoose} onReconnect={onReconnect} onOpenDashboard={onOpenDashboard} />
          <a className="welcome-secondary-button" href={githubUrl} target="_blank" rel="noreferrer"><Github size={15} /> View on GitHub</a>
        </div>
        {!supported && !workspaceReady && <button className="sample-link" onClick={onDownload}><ArrowDownToLine size={14} /> Download a sample note</button>}
        <div className="hero-proof" aria-label="Product benefits">
          <span><Check size={14} /> Free forever</span><span><Check size={14} /> No account</span>
          <span><Check size={14} /> Works offline</span><span><Check size={14} /> Your files stay local</span>
        </div>
      </div>

      <div className="hero-visual" aria-label="MarkdownOS application preview">
        <div className="workspace-preview">
          <div className="preview-topbar">
            <div className="preview-window-controls"><i /><i /><i /></div>
            <span>My Knowledge</span>
            <div className="preview-status"><span /> Local</div>
          </div>
          <div className="preview-workspace">
            <aside className="preview-sidebar">
              <div className="preview-brand"><span><FileCode2 size={13} /></span>MarkdownOS</div>
              <div className="preview-nav-item active"><HardDrive size={13} /> All notes <b>24</b></div>
              <div className="preview-nav-item"><Clock3 size={13} /> Recent</div>
              <div className="preview-nav-item"><Star size={13} /> Favorites</div>
              <div className="preview-section-label">FOLDERS</div>
              <div className="preview-folder-item active"><Folder size={13} /> Product Notes <em>8</em></div>
              <div className="preview-folder-item"><Folder size={13} /> System Design <em>12</em></div>
              <div className="preview-folder-item"><Folder size={13} /> Journal <em>4</em></div>
            </aside>
            <div className="preview-list">
              <div className="preview-list-heading"><span>PRODUCT NOTES</span><button aria-label="Add note">+</button></div>
              <strong>Good ideas, kept close.</strong>
              <label><Search size={12} /> Search your notes</label>
              <div className="preview-note selected"><span className="preview-note-icon"><FileText size={13} /></span><div><b>Building with intention</b><small>Small details make a meaningful difference…</small><em>Today · 4 min</em></div><Star size={11} /></div>
              <div className="preview-note"><span className="preview-note-icon"><FileText size={13} /></span><div><b>The shape of a good day</b><small>Make space for the work that matters.</small><em>Yesterday · 2 min</em></div></div>
            </div>
            <div className="preview-editor">
              <div className="preview-editor-header"><span>PRODUCT NOTES / BUILDING WITH INTENTION</span><div><Pencil size={11} /> Edit <span>Preview</span></div></div>
              <div className="preview-document">
                <small>MONDAY, MAY 20</small><h2>Building with intention.</h2><span className="preview-rule" />
                <p>The best tools don’t ask for your attention. They make room for the things that deserve it.</p>
                <h3>A little more focus</h3><p>Keep what matters nearby. Let everything else be quiet.</p>
                <div className="mini-diagram" aria-label="A diagram showing ideas becoming notes">
                  <span>Your ideas</span><i /><span>MarkdownOS</span><i /><span>Your files</span>
                </div>
              </div>
              <div className="preview-editor-footer"><span><ShieldCheck size={11} /> Saved locally</span><span>Markdown</span></div>
            </div>
          </div>
        </div>
        <div className="visual-float float-saved"><span><ShieldCheck size={14} /></span><div><b>Saved locally</b><small>Your files, right where you left them.</small></div></div>
      </div>
    </section>

    <section className="lp-section lp-intro" id="features" aria-labelledby="features-heading">
      <div className="lp-section-heading">
        <span className="eyebrow">A different kind of workspace</span>
        <h2 id="features-heading">All the polish of modern software.<br /><em>None of the cloud baggage.</em></h2>
        <p>A beautiful place to write, organize, and think—while the actual files stay on your device.</p>
      </div>
      <div className="lp-feature-grid">
        <article className="lp-feature-card"><span className="lp-feature-icon"><FolderOpen size={19} /></span><h3>Local by default</h3><p>Your Markdown files stay in the folders you already use.</p></article>
        <article className="lp-feature-card"><span className="lp-feature-icon"><WifiOff size={19} /></span><h3>Offline by nature</h3><p>No internet connection required. Write wherever you are.</p></article>
        <article className="lp-feature-card"><span className="lp-feature-icon"><LockKeyhole size={19} /></span><h3>No account required</h3><p>Open the app and start working. No signup flow.</p></article>
        <article className="lp-feature-card"><span className="lp-feature-icon"><Heart size={19} /></span><h3>Free forever</h3><p>No subscription tiers, artificial limits, or paid unlocks.</p></article>
      </div>
    </section>

    <section className="lp-ownership" id="privacy" aria-labelledby="ownership-heading">
      <div className="lp-ownership-copy">
        <span className="eyebrow">Your device is the workspace</span>
        <h2 id="ownership-heading">Your files<br />stay yours.</h2>
        <p>MarkdownOS doesn't need to own your data to give you a beautiful workspace.</p>
        <div className="lp-ownership-points">
          <article><span><CloudOffIcon /></span><div><h3>No cloud upload</h3><p>Your notes aren't sent to a remote server.</p></div></article>
          <article><span><DatabaseOffIcon /></span><div><h3>No proprietary database</h3><p>Your content remains ordinary Markdown files.</p></div></article>
          <article><span><FolderOpen size={18} /></span><div><h3>No lock-in</h3><p>Close MarkdownOS; your files are still right where you left them.</p></div></article>
        </div>
      </div>
      <div className="lp-flow-card" aria-label="Your folder stays on your device">
        <div className="lp-flow-device"><span className="lp-flow-device-label"><HardDrive size={14} /> YOUR DEVICE</span>
          <div className="lp-flow-folder"><FolderOpen size={25} /><strong>My Knowledge</strong><small>Your existing folder</small></div>
          <div className="lp-flow-arrow"><span /></div>
          <div className="lp-flow-app"><FileCode2 size={21} /><strong>MarkdownOS</strong><small>A workspace, not a destination</small></div>
          <div className="lp-flow-arrow"><span /></div>
          <div className="lp-flow-files"><span><FileText size={15} /> ideas.md</span><span><FileText size={15} /> roadmap.md</span><span><FileText size={15} /> notes.md</span></div>
        </div>
        <div className="lp-flow-caption"><span className="lp-live-dot" /> All changes save directly to your folder</div>
      </div>
    </section>

    <section className="lp-showcase" aria-labelledby="showcase-heading">
      <div className="lp-section-heading lp-section-heading-left">
        <span className="eyebrow">Made for the way you think</span><h2 id="showcase-heading">Everything you need.<br /><em>Nothing in your way.</em></h2>
      </div>
      <article className="lp-showcase-row">
        <div className="lp-showcase-copy"><span className="lp-step-label">01 / SEARCH</span><h3>Find the thought.</h3><p>Search titles, content, folders, and tags without breaking your flow.</p></div>
        <div className="lp-showcase-visual lp-search-preview"><div className="lp-search-bar"><Search size={16} /><span>distributed systems</span><kbd>⌘ K</kbd></div><div className="lp-search-result"><span><FileText size={16} /></span><div><strong>Notes on distributed systems</strong><p>System Design <i /> Updated today</p><small>…reliable systems emerge from small, independent pieces…</small></div></div><div className="lp-search-result"><span><FileText size={16} /></span><div><strong>Architecture principles</strong><p>Product Notes <i /> Yesterday</p><small>…keep the boundaries simple and the failure modes clear…</small></div></div></div>
      </article>
      <article className="lp-showcase-row lp-showcase-reverse">
        <div className="lp-showcase-copy"><span className="lp-step-label">02 / MARKDOWN</span><h3>Markdown, without the friction.</h3><p>Write in plain Markdown and switch instantly between editing and reading.</p></div>
        <div className="lp-showcase-visual lp-markdown-preview"><div className="lp-code-pane"><span className="lp-visual-label">SOURCE</span><pre>{`# Building with intention\n\nThe best tools don't ask\nfor your attention.\n\n- Focus\n- Simplicity\n- Ownership`}</pre></div><div className="lp-render-pane"><span className="lp-visual-label">PREVIEW</span><h4>Building with intention</h4><p>The best tools don't ask for your attention.</p><ul><li>Focus</li><li>Simplicity</li><li>Ownership</li></ul></div></div>
      </article>
      <article className="lp-showcase-row">
        <div className="lp-showcase-copy"><span className="lp-step-label">03 / MERMAID</span><h3>Think in diagrams.</h3><p>Write Mermaid diagrams in your Markdown and see them rendered right in the page.</p></div>
        <div className="lp-showcase-visual lp-mermaid-preview"><span className="lp-visual-label">A SIMPLE SYSTEM</span><div className="lp-mermaid-node">Your idea</div><div className="lp-mermaid-arrow" /><div className="lp-mermaid-node lp-mermaid-node-active">MarkdownOS</div><div className="lp-mermaid-arrow" /><div className="lp-mermaid-node">Markdown files</div></div>
      </article>
      <article className="lp-showcase-row lp-showcase-reverse">
        <div className="lp-showcase-copy"><span className="lp-step-label">04 / ORGANIZATION</span><h3>Everything has a place.</h3><p>Folders, favorites, recent notes, tags, and search—working together in one calm library.</p></div>
        <div className="lp-showcase-visual lp-organize-preview"><div className="lp-organize-heading"><strong>My Knowledge</strong><span>3 folders · 24 notes</span></div><div><FolderOpen size={17} /><strong>Product Notes</strong><span>8</span></div><div><Folder size={17} /><strong>System Design</strong><span>12</span></div><div><Folder size={17} /><strong>Journal</strong><span>4</span></div><div className="lp-organize-footer"><Star size={14} /> Favorites <i /> <Clock3 size={14} /> Recent notes</div></div>
      </article>
    </section>

    <section className="lp-focus-section" aria-labelledby="focus-heading">
      <span className="eyebrow">Made for focus</span>
      <h2 id="focus-heading">The best tools don't compete<br />for your attention.</h2>
      <p>MarkdownOS keeps the essentials close and everything else quiet.</p>
      <div className="lp-focus-words"><span>Write.</span><span>Think.</span><span>Organize.</span><span>Repeat.</span></div>
    </section>

    <section className="lp-section lp-how" id="how-it-works" aria-labelledby="how-heading">
      <div className="lp-section-heading"><span className="eyebrow">A simpler way to start</span><h2 id="how-heading">Three steps.<br /><em>No setup maze.</em></h2><p>Start with the folder you already use. Everything else is designed around it.</p></div>
      <div className="lp-how-steps">
        <article><span className="lp-how-number">01</span><FolderOpen size={21} /><h3>Choose your folder</h3><p>Pick the folder where you already keep your Markdown files.</p></article>
        <article><span className="lp-how-number">02</span><FileText size={21} /><h3>Open your notes</h3><p>Browse, search, edit, and organize your files.</p></article>
        <article><span className="lp-how-number">03</span><ShieldCheck size={21} /><h3>Keep working</h3><p>Everything saves directly to your local files.</p></article>
      </div>
    </section>

    <section className="lp-comparison" aria-labelledby="comparison-heading">
      <div className="lp-section-heading"><span className="eyebrow">Keep the setup simple</span><h2 id="comparison-heading">The simple alternative<br /><em>to cloud note-taking.</em></h2><p>Different tools make sense for different workflows. Here's what MarkdownOS is built for.</p></div>
      <div className="lp-comparison-wrap"><table><thead><tr><th>What matters</th><th>MarkdownOS</th><th>Typical cloud notes</th></tr></thead><tbody>
        <tr><td>Local files you can open anywhere</td><td><Check size={16} /> Yes</td><td>Usually stored in the service</td></tr>
        <tr><td>Works offline</td><td><Check size={16} /> Yes</td><td>Varies by app</td></tr>
        <tr><td>Account required</td><td><Check size={16} /> No</td><td>Usually</td></tr>
        <tr><td>Subscription required</td><td><Check size={16} /> No</td><td>Depends on the plan</td></tr>
        <tr><td>Plain Markdown files</td><td><Check size={16} /> Yes</td><td>Varies by app</td></tr>
        <tr><td>Works without lock-in</td><td><Check size={16} /> Yes</td><td>Export options vary</td></tr>
      </tbody></table></div>
    </section>

    <section className="lp-privacy" aria-labelledby="privacy-heading">
      <div className="lp-privacy-statement"><span className="eyebrow">Privacy, by design</span><h2 id="privacy-heading">Private by architecture.<br /><em>Not by promise.</em></h2><p>MarkdownOS doesn't need a cloud account because your workspace lives on your device.</p></div>
      <div className="lp-privacy-cards">
        <article><LockKeyhole size={18} /><h3>No account</h3><p>No identity required.</p></article>
        <article><HardDrive size={18} /><h3>No cloud</h3><p>Your notes don't leave your device.</p></article>
        <article><ShieldCheck size={18} /><h3>No tracking</h3><p>Your workspace isn't an analytics product.</p></article>
      </div>
    </section>

    <section className="lp-files" aria-labelledby="files-heading">
      <div className="lp-files-copy"><span className="eyebrow">Built for the files you already have</span><h2 id="files-heading">No proprietary workspace.<br /><em>Just files.</em></h2><p>MarkdownOS works directly with the folders you choose. No database you can't inspect. No special format to learn.</p><div className="lp-files-tags"><span><Check size={13} /> Plain text</span><span><Check size={13} /> Portable</span><span><Check size={13} /> Yours to keep</span></div></div>
      <div className="lp-tree-card"><div className="lp-tree-title"><FolderOpen size={15} /> My Knowledge</div><div className="lp-tree-line lp-tree-folder"><FolderOpen size={15} /> Product Notes</div><div className="lp-tree-line lp-tree-file"><FileText size={14} /> ideas.md</div><div className="lp-tree-line lp-tree-file"><FileText size={14} /> roadmap.md</div><div className="lp-tree-line lp-tree-file"><FileText size={14} /> building-with-intention.md</div><div className="lp-tree-line lp-tree-folder"><Folder size={15} /> System Design</div><div className="lp-tree-line lp-tree-file"><FileText size={14} /> architecture.md</div><div className="lp-tree-line lp-tree-file"><FileText size={14} /> distributed-systems.md</div><div className="lp-tree-line lp-tree-folder"><Folder size={15} /> Journal</div><div className="lp-tree-line lp-tree-file"><FileText size={14} /> today.md</div></div>
    </section>

    <section className="lp-about" id="about" aria-labelledby="about-heading">
      <div className="lp-about-mark"><FileCode2 size={25} /></div><div className="lp-about-copy"><span className="eyebrow">Built by a developer</span><h2 id="about-heading">Software should feel human.</h2><p>Hi, I'm Priyaranjan—a developer who enjoys building practical tools that respect people's time, attention, and privacy.</p><p>MarkdownOS started with a simple idea: Markdown is already a great format. People shouldn't need to give up ownership of their files to get a beautiful writing experience.</p><div className="lp-about-links"><a href={githubUrl} target="_blank" rel="noreferrer"><Github size={15} /> GitHub <ArrowUpRight size={13} /></a><a href="mailto:cse.priyaranjan@gmail.com"><Mail size={15} /> Email</a><a href="https://csepriyaranjan.ventranexa.in" target="_blank" rel="noreferrer">Portfolio <ArrowUpRight size={13} /></a></div></div>
    </section>

    <section className="lp-final-cta" id="get-started" aria-labelledby="cta-heading">
      <span className="eyebrow">Free forever · Offline · No account · Local-first</span><h2 id="cta-heading">Your next idea is waiting.</h2><p>Start with the folder you already have.</p>
      <div className="hero-actions"><StartButton supported={supported} accessNeeded={accessNeeded} workspaceReady={workspaceReady} onChoose={onChoose} onReconnect={onReconnect} onOpenDashboard={onOpenDashboard} /><a className="welcome-secondary-button" href={githubUrl} target="_blank" rel="noreferrer"><Github size={15} /> View GitHub</a></div>
    </section>

    <footer className="lp-footer"><div className="lp-footer-brand"><span><FileCode2 size={15} /></span><div><strong>MarkdownOS</strong><small>Local-first, by nature.</small></div></div><nav aria-label="Footer navigation"><a href="#features">Product</a><a href="#features">Features</a><a href="#privacy">Privacy</a><a href={githubUrl} target="_blank" rel="noreferrer">GitHub</a><a href="#get-started">Install</a></nav><div className="lp-footer-bottom"><span>© 2026 MarkdownOS</span><span>Made for the mind.</span></div></footer>
  </main>;
}

function StartButton({ supported, accessNeeded, workspaceReady, onChoose, onReconnect, onOpenDashboard }: Pick<WelcomeScreenProps, "supported" | "accessNeeded" | "workspaceReady" | "onChoose" | "onReconnect" | "onOpenDashboard">) {
  if (accessNeeded) return <button className="welcome-button" onClick={onReconnect}>Reconnect folder <ArrowRight size={16} /></button>;
  if (workspaceReady) return <button className="welcome-button" onClick={onOpenDashboard}>Open workspace <ArrowRight size={16} /></button>;
  return <button className="welcome-button" onClick={onChoose} disabled={!supported}>Choose your folder <ArrowRight size={16} /></button>;
}

function CloudOffIcon() {
  return <WifiOff size={18} />;
}

function DatabaseOffIcon() {
  return <Code2 size={18} />;
}
