import {
  ArrowDownToLine, ArrowRight, ArrowUpRight, Check, ChevronRight, Clock3, Code2, FileCode2,
  FileText, Folder, FolderOpen, HardDrive, Heart, LockKeyhole, Menu, Network, Search,
  ShieldCheck, Sparkles, Star, X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface WelcomeScreenProps {
  supported: boolean;
  accessNeeded: boolean;
  workspaceReady: boolean;
  onOpenDashboard: () => void;
  onChoose: () => void;
  onReconnect: () => void;
  onDownload: () => void;
}

const features = [
  { title: "Write in Markdown", body: "A focused editor for writing, editing, and organizing the files you already know.", icon: FileCode2 },
  { title: "Your folders. Your files.", body: "Open a folder and work directly with your Markdown files. Nothing to import or migrate.", icon: FolderOpen },
  { title: "Find anything instantly", body: "Search across filenames, folders, tags, and note content without breaking your flow.", icon: Search },
  { title: "Turn ideas into diagrams", body: "Write Mermaid right inside your Markdown and see your diagrams rendered inline.", icon: Network },
];

const useCases = [
  { title: "Developers", body: "System design, architecture, README files, and technical notes.", icon: Code2, sample: "architecture.md" },
  { title: "Students", body: "Study notes, diagrams, assignments, and research.", icon: FileText, sample: "biology-notes.md" },
  { title: "Writers", body: "Ideas, drafts, journals, and long-form writing.", icon: PencilIcon, sample: "a-good-first-line.md" },
  { title: "Knowledge workers", body: "Projects, meeting notes, documentation, and personal knowledge.", icon: Folder, sample: "weekly-planning.md" },
];

function PencilIcon({ size = 18 }: { size?: number }) {
  return <FileCode2 size={size} />;
}

export function WelcomeScreen({ supported, accessNeeded, workspaceReady, onOpenDashboard, onChoose, onReconnect, onDownload }: WelcomeScreenProps) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [activeFeature, setActiveFeature] = useState(0);
  const primaryAction = accessNeeded ? onReconnect : workspaceReady ? onOpenDashboard : onChoose;
  const primaryLabel = accessNeeded ? "Reconnect your folder" : workspaceReady ? "Open your workspace" : "Start with your folder";

  useEffect(() => {
    const page = pageRef.current;
    if (!page || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    page.querySelectorAll(".landing-reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return <main className="welcome-stage landing-stage" ref={pageRef}>
    <div className="landing-page">
      <header className="landing-nav">
        <a className="landing-brand" href="#top" aria-label="MarkdownOS home">
          <img src="/markdownos-icon.svg" alt="" />
          <span>MarkdownOS</span>
        </a>
        <nav className="landing-nav-links" aria-label="Main navigation">
          <a href="#features">Features</a><a href="#how-it-works">How it works</a>
          <a href="#privacy">Privacy</a><a href="#developers">For developers</a>
        </nav>
        <div className="landing-nav-actions">
          <a className="nav-github" href="https://github.com/csepriyaranjan" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14} /></a>
          <a className="nav-download" href="https://github.com/csepriyaranjan" target="_blank" rel="noreferrer"><ArrowDownToLine size={15} /> Download</a>
        </div>
        <a className="landing-mobile-menu" href="#features" aria-label="Jump to features"><Menu size={20} /></a>
      </header>

      <section className="landing-hero" id="top">
        <div className="hero-copy landing-reveal">
          <div className="landing-badge"><span /> FREE <i /> OFFLINE <i /> LOCAL-FIRST</div>
          <h1>Your Markdown.<br />Your files.<br /><span>Your workspace.</span></h1>
          <p className="landing-lede">A powerful desktop-style Markdown workspace that works directly with your local files — no account, no cloud, and no subscription.</p>
          <div className="hero-actions">
            <button className="landing-primary-button" onClick={primaryAction} disabled={!supported && !workspaceReady && !accessNeeded}>{primaryLabel} <ArrowRight size={16} /></button>
            <a className="landing-secondary-button" href="https://github.com/csepriyaranjan" target="_blank" rel="noreferrer">View on GitHub <ArrowUpRight size={15} /></a>
          </div>
          {!supported && <button className="sample-download" onClick={onDownload}><ArrowDownToLine size={13} /> Download a sample Markdown file</button>}
          <div className="hero-proof"><span><Check /> Free forever</span><span><Check /> Works offline</span><span><Check /> No account required</span></div>
        </div>

        <div className="hero-visual landing-reveal" aria-label="Preview of the MarkdownOS workspace">
          <div className="mockup-glow" />
          <div className="workspace-preview">
            <div className="preview-topbar"><div className="preview-window-controls"><i /><i /><i /></div><span>My Knowledge</span><div className="preview-status"><span /> Local</div></div>
            <div className="preview-workspace">
              <aside className="preview-sidebar">
                <div className="preview-brand"><span><FileText size={13} /></span>MarkdownOS</div>
                <div className="preview-section-label">WORKSPACE</div>
                <div className="preview-nav-item active"><FileText size={13} /> All Notes <b>24</b></div>
                <div className="preview-nav-item"><Clock3 size={13} /> Recent</div>
                <div className="preview-nav-item"><Star size={13} /> Favorites</div>
                <div className="preview-section-label">FOLDERS</div>
                <div className="preview-folder-item active"><Folder size={13} /> Product Notes <em>8</em></div>
                <div className="preview-folder-item"><Folder size={13} /> System Design <em>12</em></div>
                <div className="preview-folder-item"><Folder size={13} /> Journal <em>4</em></div>
              </aside>
              <div className="preview-list">
                <div className="preview-list-heading"><span>MY KNOWLEDGE</span><button aria-label="Add note">+</button></div>
                <strong>Good ideas, kept close.</strong>
                <label><Search size={12} /> Search your notes <span>⌘ K</span></label>
                <div className="preview-note selected"><span className="preview-note-icon"><FileText size={13} /></span><div><b>Building with intention</b><small>The best tools don't ask for your attention…</small><em>Just now · 4 min</em></div><Star size={11} /></div>
                <div className="preview-note"><span className="preview-note-icon"><FileText size={13} /></span><div><b>The shape of a good day</b><small>Make space for work that matters.</small><em>Yesterday · 2 min</em></div></div>
                <div className="preview-note"><span className="preview-note-icon"><FileText size={13} /></span><div><b>System architecture</b><small>Client → API → Database</small><em>Monday · 6 min</em></div></div>
                <div className="preview-note"><span className="preview-note-icon"><FileText size={13} /></span><div><b>Project roadmap</b><small>Where we're going next.</small><em>Friday · 3 min</em></div></div>
              </div>
              <div className="preview-editor">
                <div className="preview-editor-header"><span>PRODUCT NOTES / BUILDING WITH INTENTION</span><div><span>Edit</span><span className="editor-active">Preview</span></div></div>
                <div className="preview-document"><small>MONDAY, MAY 20</small><h2># Building with<br />intention</h2><p>The best tools don't ask for your attention. They make room for the things that deserve it.</p><h3>## A little more focus</h3><p>Keep what matters nearby. Let everything else be quiet.</p><h3>### A workspace that fits</h3><div className="mini-markdown"><span>-</span> Your files stay yours<br /><span>-</span> Ready when you're offline</div><div className="mini-diagram"><span>flowchart TD</span><b>Ideas <i>↓</i> Notes <i>↓</i> Clarity</b></div></div>
                <div className="preview-editor-footer"><span><ShieldCheck size={11} /> Saved locally</span><span>Markdown</span></div>
              </div>
            </div>
          </div>
          <div className="visual-float float-privacy"><span><Check size={14} /></span><div><b>Saved locally</b><small>Changes go straight to disk.</small></div></div>
          <div className="visual-float float-offline"><span><FolderOpen size={14} /></span><div><b>24 Notes</b><small><span className="float-dot" /> Available offline</small></div></div>
        </div>
      </section>

      <section className="value-strip landing-reveal" aria-label="MarkdownOS product facts">
        <div><span className="value-icon"><Sparkles size={18} /></span><p><b>100% Free</b><small>No subscription.</small></p></div>
        <div><span className="value-icon"><HardDrive size={18} /></span><p><b>Local-first</b><small>Your files stay on your device.</small></p></div>
        <div><span className="value-icon"><Network size={18} /></span><p><b>Offline</b><small>No internet required.</small></p></div>
        <div><span className="value-icon"><FileText size={18} /></span><p><b>Open files</b><small>Normal Markdown files.</small></p></div>
      </section>

      <section className="landing-section feature-showcase" id="features">
        <div className="section-heading landing-reveal"><span className="section-eyebrow">A better way to work</span><h2>Everything you need to<br />work with Markdown.</h2><p>Simple enough to disappear. Powerful enough for serious work.</p></div>
        <div className="feature-showcase-grid">
          {features.map(({ title, body, icon: Icon }, index) => <button key={title} className={`showcase-card landing-reveal ${activeFeature === index ? "active" : ""}`} onClick={() => setActiveFeature(index)} aria-pressed={activeFeature === index}>
            <div className="showcase-card-copy"><span className="showcase-icon"><Icon size={19} /></span><span className="showcase-index">0{index + 1}</span><h3>{title}</h3><p>{body}</p></div>
            <div className={`showcase-demo demo-${index}`}>
              {index === 0 && <div className="demo-editor"><div><span /><span /><span /> <small>note.md</small></div><pre><i>#</i> Building with intention{"\n\n"}The best tools don't ask{"\n"}for your attention.{"\n\n"}<i>##</i> Keep what matters close</pre></div>}
              {index === 1 && <div className="demo-files"><b><Folder size={14} /> My Knowledge</b><span>├─ <Folder size={12} /> Notes</span><span>├─ <Folder size={12} /> Projects</span><span>├─ <Folder size={12} /> System Design</span><span>└─ <Folder size={12} /> Journal</span></div>}
              {index === 2 && <div className="demo-search"><label><Search size={13} /> system design <kbd>ESC</kbd></label><span><FileText size={13} /><b>System architecture</b><small>System Design / architecture.md</small><ChevronRight size={13} /></span><span><FileText size={13} /><b>Design principles</b><small>Product Notes / principles.md</small><ChevronRight size={13} /></span></div>}
              {index === 3 && <div className="demo-mermaid"><code>flowchart TD<br />&nbsp; A[Client] --&gt; B[API]<br />&nbsp; B --&gt; C[(Database)]</code><div><span>Client</span><i>↓</i><span>API</span><i>↓</i><span>Database</span></div></div>}
            </div>
          </button>)}
        </div>
      </section>

      <section className="file-workspace-section">
        <div className="file-workspace-inner">
          <div className="file-workspace-copy landing-reveal"><span className="section-eyebrow">Your workflow, uninterrupted</span><h2>A workspace built around your files.</h2><p>You shouldn't need to migrate your knowledge into another ecosystem just to get a better interface.</p>
            <div className="workflow-timeline">
              <div><span>01</span><p><b>Open your folder</b><small>Choose a folder on your computer.</small></p></div>
              <div><span>02</span><p><b>Browse your Markdown</b><small>Everything you have is right there.</small></p></div>
              <div><span>03</span><p><b>Edit and preview</b><small>Write naturally, see it take shape.</small></p></div>
              <div><span>04</span><p><b>Save directly to disk</b><small>No export step. No second copy.</small></p></div>
            </div>
          </div>
          <div className="dark-product-shot landing-reveal">
            <div className="dark-shot-bar"><div className="preview-window-controls"><i /><i /><i /></div><span>MarkdownOS <small>— System Design</small></span><span className="shot-saved"><Check size={12} /> Saved</span></div>
            <div className="dark-shot-content"><aside><div><Folder size={13} /> System Design</div><span>⌁ architecture.md</span><span>⌁ api-design.md</span><span>⌁ database.md</span><span>⌁ decisions.md</span><div><Folder size={13} /> Product Notes</div><div><Folder size={13} /> Journal</div></aside>
              <article><div className="dark-shot-breadcrumb">SYSTEM DESIGN / ARCHITECTURE.MD</div><h3>System architecture</h3><p>A clear picture of how the pieces fit together.</p><div className="dark-code"><span># The request lifecycle</span><br /><br />```mermaid<br />flowchart LR<br />&nbsp; Client --&gt; API<br />&nbsp; API --&gt; Database<br />```</div><div className="dark-flow"><span>Client</span><i>→</i><span>API</span><i>→</i><span>Database</span></div></article>
            </div>
          </div>
        </div>
      </section>

      <section className="ownership-section landing-section landing-reveal">
        <div className="section-heading"><span className="section-eyebrow">A different kind of workspace</span><h2>SaaS experience.<br />Local ownership.</h2><p>Everything familiar about a great workspace, without giving up control of your notes.</p></div>
        <div className="comparison-grid">
          <article className="comparison-card"><span className="comparison-label">THE CLOUD MODEL</span><h3>Traditional cloud notes</h3><ul><li><span><Network /></span> Cloud account</li><li><span><Network /></span> Cloud database</li><li><span><Network /></span> Internet dependency</li><li><span><Network /></span> Subscription</li><li><span><Network /></span> Data stored remotely</li></ul></article>
          <article className="comparison-card comparison-local"><span className="comparison-label"><span /> THE MARKDOWNOS WAY</span><h3>MarkdownOS</h3><ul><li><span><Check /></span> Local folder</li><li><span><Check /></span> Local Markdown files</li><li><span><Check /></span> Works offline</li><li><span><Check /></span> Free</li><li><span><Check /></span> You own the files</li></ul></article>
        </div>
      </section>

      <section className="file-ownership-visual landing-reveal">
        <div className="ownership-heading"><span className="section-eyebrow">No lock-in. No mystery.</span><h2>Your folder is the source of truth.</h2><p>MarkdownOS is the workspace. Your folder remains yours.</p></div>
        <div className="computer-diagram"><div className="computer-label"><HardDrive size={14} /> YOUR COMPUTER</div><div className="computer-folder"><div className="folder-title"><FolderOpen size={17} /> My Knowledge</div><span><Folder size={13} /> Product Notes/</span><span><Folder size={13} /> System Design/</span><span><Folder size={13} /> Journal/</span><b>*.md</b></div><div className="diagram-connector"><span /></div><div className="os-node"><img src="/markdownos-icon.svg" alt="" /> MarkdownOS</div></div>
        <p className="ownership-caption"><b>MarkdownOS is the workspace.</b><br />Your folder remains the source of truth.</p>
      </section>

      <section className="developer-section landing-section" id="developers">
        <div className="developer-copy landing-reveal"><span className="section-eyebrow">Built for developers</span><h2>Made for people who already live in Markdown.</h2><p>Your READMEs, architecture docs, project notes, and ideas — right where they belong. No proprietary database in between.</p>
          <div className="developer-points"><span><Check /> Markdown-native</span><span><Check /> Git-friendly</span><span><Check /> Mermaid support</span><span><Check /> Local folders</span><span><Check /> No proprietary storage</span><span><Check /> Works offline</span></div>
        </div>
        <div className="developer-visual landing-reveal"><div className="dev-files"><div><FolderOpen size={14} /> markdown-os</div>{["README.md", "architecture.md", "api-design.md", "database.md", "roadmap.md", "meeting-notes.md", "ideas.md"].map((file, index) => <span key={file} className={index === 1 ? "selected" : ""}><FileText size={13} /> {file}</span>)}</div><div className="dev-terminal"><div><i /><i /><i /><small>~/markdown-os</small></div><pre><span>$</span> ls ~/My-Knowledge{"\n"}<b>README.md</b>  architecture.md{"\n"}api-design.md  database.md{"\n"}roadmap.md  meeting-notes.md{"\n"}ideas.md{"\n\n"}<span>$</span> <em>_</em></pre><footer><LockKeyhole size={12} /> Plain files. Your machine. Your call.</footer></div></div>
      </section>

      <section className="steps-section landing-section" id="how-it-works">
        <div className="section-heading landing-reveal"><span className="section-eyebrow">Up and running in a moment</span><h2>How it works.</h2><p>No account creation. No import wizard. Start right where you are.</p></div>
        <div className="steps-grid">
          {[["01", "Choose a folder", "Select the folder where your Markdown files already live.", FolderOpen], ["02", "Open MarkdownOS", "Your files immediately appear inside your workspace.", FileText], ["03", "Write and organize", "Edit, search, preview, favorite, and organize your notes.", Sparkles]].map(([number, title, body, Icon]) => {
            const StepIcon = Icon as typeof FolderOpen;
            return <article className="step-card landing-reveal" key={number as string}><span className="step-number">{number as string}</span><span className="step-icon"><StepIcon size={20} /></span><h3>{title as string}</h3><p>{body as string}</p></article>;
          })}
        </div>
      </section>

      <section className="privacy-section" id="privacy">
        <div className="privacy-inner">
          <div className="privacy-copy landing-reveal"><span className="section-eyebrow">Private by architecture</span><h2>Your notes aren't<br />our business.</h2><p>MarkdownOS doesn't require an account or cloud storage. Your notes remain on your machine.</p><div className="privacy-device"><div className="privacy-device-lock"><LockKeyhole size={22} /></div><div><b>YOUR DEVICE</b><span>Local files · Always yours</span></div><Check size={17} /></div></div>
          <div className="privacy-cards">{[["No account", "Start immediately.", UserIcon], ["No cloud", "Your files don't need to leave your device.", HardDrive], ["No subscription", "MarkdownOS is free.", Heart]].map(([title, body, Icon]) => {
            const CardIcon = Icon as typeof HardDrive;
            return <article className="privacy-card landing-reveal" key={title as string}><span><CardIcon size={18} /></span><div><h3>{title as string}</h3><p>{body as string}</p></div><Check size={15} /></article>;
          })}</div>
        </div>
      </section>

      <section className="use-cases-section landing-section">
        <div className="section-heading landing-reveal"><span className="section-eyebrow">Room for every kind of thinking</span><h2>One workspace.<br />Many kinds of thinking.</h2></div>
        <div className="use-cases-grid">{useCases.map(({ title, body, icon: Icon, sample }) => <article className="use-case-card landing-reveal" key={title}><div className="use-case-file"><Icon size={15} /><span>{sample}</span><Star size={12} /></div><h3>{title}</h3><p>{body}</p></article>)}</div>
      </section>

      <section className="product-facts landing-reveal" aria-label="MarkdownOS product characteristics"><span>Product, not popularity.</span><div><b>100%</b><small>Local-first</small></div><div><b>0</b><small>Accounts required</small></div><div><b>0</b><small>Cloud dependency</small></div><div><b>∞</b><small>Markdown files</small></div></section>

      <section className="final-cta landing-reveal">
        <div><span className="section-eyebrow">A better place for your ideas</span><h2>Start with the files<br />you already have.</h2><p>A better Markdown workspace doesn't need another cloud account.</p><small>Free <i /> Offline <i /> Local-first</small></div>
        <div className="final-cta-actions"><button className="landing-primary-button" onClick={primaryAction} disabled={!supported && !workspaceReady && !accessNeeded}>{primaryLabel} <ArrowRight size={16} /></button><a className="landing-secondary-button" href="https://github.com/csepriyaranjan" target="_blank" rel="noreferrer">View on GitHub <ArrowUpRight size={15} /></a></div>
      </section>

      <footer className="landing-footer"><a className="landing-brand" href="#top"><img src="/markdownos-icon.svg" alt="" /><span>MarkdownOS</span></a><p>Your private Markdown workspace.</p><div className="footer-links"><b>Product</b><a href="#features">Features</a><a href="#privacy">Privacy</a><a href="https://github.com/csepriyaranjan" target="_blank" rel="noreferrer">GitHub</a><a href="https://github.com/csepriyaranjan" target="_blank" rel="noreferrer">Download</a></div><div className="footer-bottom"><span>© 2026 MarkdownOS</span><span>Made for people who think in Markdown. <Heart size={12} /></span></div></footer>
    </div>
  </main>;
}

function UserIcon({ size = 18 }: { size?: number }) {
  return <ShieldCheck size={size} />;
}
