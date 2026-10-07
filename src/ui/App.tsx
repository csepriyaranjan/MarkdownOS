import {
  ArrowDownToLine, Check, CircleHelp, Download, FileText, Folder, FolderOpen, House, LayoutDashboard, Menu,
  Pencil, Settings2, ShieldCheck, Sparkles, Trash2, X,
} from "lucide-react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent } from "react";
import type { FolderEntry, FolderNode, LocalStorageAdapter, NoteDocument } from "../domain";
import { noteSnippet, noteTitle, parentPath, pathName, tagsFor } from "../domain";
import { BrowserFileSystemAdapter, validateEntryName } from "../storage/browserFileSystem";
import { ContextMenu } from "./components/ContextMenu";
import { EmptyEditor } from "./components/EmptyEditor";
import { LibrarySidebar } from "./components/LibrarySidebar";
import { escapeHtml } from "./components/MarkdownPreview";
import { NoteEditor } from "./components/NoteEditor";
import { NotesListPane } from "./components/NotesListPane";
import { WelcomeScreen } from "./components/WelcomeScreen";
import type { ContextTarget, CreateTarget, MobilePane, RenameTarget, ToastState } from "./types";

const FAVORITES_KEY = "markdownos:favorites";
const RECENTS_KEY = "markdownos:recents";

function readStringList(key: string): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : [];
  } catch {
    return [];
  }
}

async function scanFolder(adapter: LocalStorageAdapter): Promise<FolderNode> {
  async function readDirectory(path: string, name: string): Promise<FolderNode> {
    const entries = await adapter.list(path);
    const childFolders = entries.filter((entry) => entry.kind === "directory");
    const markdownFiles = entries.filter((entry) => entry.kind === "file" && /\.md$/i.test(entry.name));
    const files = await Promise.all(markdownFiles.map(async (entry): Promise<NoteDocument> => {
      const content = await adapter.readFile(entry.path);
      return {
        ...entry,
        kind: "file",
        content,
        title: noteTitle(content, entry.name),
        snippet: noteSnippet(content),
        tags: tagsFor(content),
      };
    }));
    const children = await Promise.all(childFolders.map((folder) => readDirectory(folder.path, folder.name)));
    return { name, path, kind: "directory", children, files };
  }
  return readDirectory("", adapter.rootName);
}

function flattenNotes(node: FolderNode): NoteDocument[] {
  return [...node.files, ...node.children.flatMap(flattenNotes)];
}

function findFolder(node: FolderNode, path: string): FolderNode | null {
  if (node.path === path) return node;
  for (const child of node.children) {
    const result = findFolder(child, path);
    if (result) return result;
  }
  return null;
}

function isInstalledMobilePwa(): boolean {
  const standalone = window.matchMedia("(display-mode: standalone)").matches
    || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return standalone && window.matchMedia("(pointer: coarse)").matches;
}

function isInstalledApp(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches
    || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

function App() {
  const adapter = useMemo(() => new BrowserFileSystemAdapter(), []);
  const [tree, setTree] = useState<FolderNode | null>(null);
  const [notes, setNotes] = useState<NoteDocument[]>([]);
  const [selectedPath, setSelectedPath] = useState("");
  const [activeFolder, setActiveFolder] = useState("");
  const [content, setContent] = useState("");
  const [editorMode, setEditorMode] = useState<"edit" | "view">("edit");
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [favorites, setFavorites] = useState(() => readStringList(FAVORITES_KEY));
  const [recents, setRecents] = useState(() => readStringList(RECENTS_KEY));
  const [collapsedFolders, setCollapsedFolders] = useState<string[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [listCollapsed, setListCollapsed] = useState(false);
  const [mobilePane, setMobilePane] = useState<MobilePane>("files");
  const [createTarget, setCreateTarget] = useState<CreateTarget | null>(null);
  const [createName, setCreateName] = useState("");
  const [renameTarget, setRenameTarget] = useState<RenameTarget | null>(null);
  const [contextTarget, setContextTarget] = useState<ContextTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FolderEntry | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [loading, setLoading] = useState(false);
  const [rootAccessNeeded, setRootAccessNeeded] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(() => window.location.pathname.replace(/\/+$/, "") === "/workspace");
  const [startupError, setStartupError] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [installed, setInstalled] = useState(isInstalledApp);
  const [installPrompt, setInstallPrompt] = useState<Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> } | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(268);
  const [fileListWidth, setFileListWidth] = useState(330);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const isSupported = "showDirectoryPicker" in window;

  const showToast = useCallback((message: string, error = false) => {
    setToast({ message, error });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  function navigateToPage(openDashboard: boolean, replace = false): void {
    const path = openDashboard ? "/workspace" : "/";
    if (window.location.pathname !== path) {
      if (replace) window.history.replaceState({}, "", path);
      else window.history.pushState({}, "", path);
    }
    setDashboardOpen(openDashboard);
  }

  const reload = useCallback(async (keepPath?: string) => {
    if (!adapter.hasRoot) return;
    setLoading(true);
    try {
      const nextTree = await scanFolder(adapter);
      const nextNotes = flattenNotes(nextTree);
      setTree(nextTree);
      setNotes(nextNotes);
      const path = keepPath ?? selectedPath;
      const selected = nextNotes.find((note) => note.path === path);
      setSelectedPath(selected?.path ?? "");
      setContent(selected?.content ?? "");
      setActiveFolder(selected ? parentPath(selected.path) : activeFolder);
      setRootAccessNeeded(false);
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setRootAccessNeeded(true);
        setStartupError("Your folder permission has expired. Reconnect to continue working with your files.");
      } else {
        showToast(error instanceof Error ? error.message : "Could not read this folder.", true);
      }
    } finally {
      setLoading(false);
    }
  }, [adapter, activeFolder, selectedPath, showToast]);

  useEffect(() => {
    const handlePopState = () => {
      setDashboardOpen(window.location.pathname.replace(/\/+$/, "") === "/workspace");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const displayMode = window.matchMedia("(display-mode: standalone)");
    const handleInstalled = () => setInstalled(true);
    const handleDisplayModeChange = () => setInstalled(isInstalledApp());
    window.addEventListener("appinstalled", handleInstalled);
    displayMode.addEventListener("change", handleDisplayModeChange);
    return () => {
      window.removeEventListener("appinstalled", handleInstalled);
      displayMode.removeEventListener("change", handleDisplayModeChange);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void adapter.restoreRoot().then(async (permissionGranted) => {
      if (cancelled) return;
      if (adapter.hasRoot && !permissionGranted) {
        setRootAccessNeeded(true);
        return;
      }
      if (permissionGranted) {
        const nextTree = await scanFolder(adapter);
        if (cancelled) return;
        setTree(nextTree);
        setNotes(flattenNotes(nextTree));
        if (isInstalledMobilePwa() && window.location.pathname !== "/workspace") {
          navigateToPage(true, true);
        }
      }
    }).catch((error: unknown) => {
      if (!cancelled) setStartupError(error instanceof Error ? error.message : "Could not restore the saved folder.");
    });
    return () => { cancelled = true; };
  }, [adapter]);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(recents.slice(0, 8)));
  }, [recents]);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> });
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const modifier = event.metaKey || event.ctrlKey;
      if (!modifier) return;
      if (event.key.toLowerCase() === "b") {
        event.preventDefault();
        setSidebarCollapsed((value) => !value);
      }
      if (event.shiftKey && event.key.toLowerCase() === "f") {
        event.preventDefault();
        setListCollapsed((value) => !value);
      }
      if (event.key === "0") {
        event.preventDefault();
        setSidebarCollapsed(true);
        setListCollapsed(true);
      }
      if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (selectedPath) void adapter.writeFile(selectedPath, content).then(
          () => showToast("Saved to your folder."),
          (error: unknown) => showToast(error instanceof Error ? error.message : "Could not save this note.", true),
        );
      }
      if (event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        startCreate("file");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [adapter, content, selectedPath, showToast]);

  useEffect(() => {
    if (!selectedPath) return;
    setSaveState("saving");
    const timer = window.setTimeout(() => {
      void adapter.writeFile(selectedPath, content).then(() => {
        setSaveState("saved");
        setNotes((current) => current.map((note) => note.path === selectedPath
          ? { ...note, content, title: noteTitle(content, note.name), snippet: noteSnippet(content), tags: tagsFor(content) }
          : note));
      }).catch((error: unknown) => {
        setSaveState("error");
        showToast(error instanceof Error ? error.message : "Could not save this note.", true);
      });
    }, 800);
    return () => window.clearTimeout(timer);
  }, [adapter, content, selectedPath, showToast]);

  const activeNode = tree ? findFolder(tree, activeFolder) : null;
  const visibleNotes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return notes.filter((note) => {
      const matchesSearch = !normalizedSearch
        || note.name.toLowerCase().includes(normalizedSearch)
        || note.path.toLowerCase().includes(normalizedSearch)
        || note.content.toLowerCase().includes(normalizedSearch)
        || note.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch.replace(/^#/, "")));
      return matchesSearch && (!activeTag || note.tags.includes(activeTag))
        && (!activeFolder || parentPath(note.path) === activeFolder);
    });
  }, [activeFolder, activeTag, notes, search]);
  const selectedNote = notes.find((note) => note.path === selectedPath) ?? null;
  const allTags = [...new Set(notes.flatMap((note) => note.tags))].sort();
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  async function chooseFolder(): Promise<void> {
    setStartupError("");
    try {
      await adapter.pickRoot();
      setActiveFolder("");
      setSelectedPath("");
      await reload("");
      if (isInstalledMobilePwa()) navigateToPage(true);
      showToast("Your local folder is ready.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStartupError(error instanceof Error ? error.message : "Could not open that folder.");
    }
  }

  async function reconnectFolder(): Promise<void> {
    try {
      const granted = await adapter.requestRootAccess();
      if (!granted) {
        showToast("Folder permission was not granted.", true);
        return;
      }
      await reload("");
      setStartupError("");
      if (isInstalledMobilePwa()) navigateToPage(true);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not reconnect to the folder.", true);
    }
  }

  function openNote(note: NoteDocument): void {
    setSelectedPath(note.path);
    setActiveFolder(parentPath(note.path));
    setContent(note.content);
    setMobilePane("editor");
    setRecents((current) => [note.path, ...current.filter((path) => path !== note.path)].slice(0, 8));
  }

  function beginRename(path: string, kind: "file" | "directory"): void {
    const basename = pathName(path);
    setContextTarget(null);
    setRenameTarget({ path, kind, value: kind === "file" ? basename.replace(/\.md$/i, "") : basename });
  }

  function startCreate(kind: "file" | "directory", directory = activeFolder): void {
    if (kind === "directory") setSidebarCollapsed(false);
    setCreateTarget({ kind, directory });
    setCreateName(kind === "file" ? "Untitled" : "Untitled Folder");
    setContextTarget(null);
    setActiveFolder(directory);
    if (kind === "file") setMobilePane("files");
  }

  async function submitCreate(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!createTarget) return;
    const rawName = createName.trim();
    const name = createTarget.kind === "file" && !/\.md$/i.test(rawName) ? `${rawName}.md` : rawName;
    try {
      validateEntryName(name);
      if (createTarget.kind === "file") {
        let candidate = name;
        let index = 2;
        while (notes.some((note) => note.path === (createTarget.directory ? `${createTarget.directory}/${candidate}` : candidate))) {
          const stem = name.replace(/\.md$/i, "");
          candidate = `${stem} ${index}.md`;
          index += 1;
        }
        const path = await adapter.createFile(createTarget.directory, candidate, `# ${candidate.replace(/\.md$/i, "")}\n\nCreated ${new Date().toLocaleDateString()}\n\n`);
        await reload(path);
        setEditorMode("edit");
      } else {
        const path = await adapter.createDirectory(createTarget.directory, name);
        await reload();
        setActiveFolder(path);
        showToast("Folder created.");
      }
      setCreateTarget(null);
      setCreateName("");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not create that item.", true);
    }
  }

  async function submitRename(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!renameTarget) return;
    const raw = renameTarget.value.trim();
    const newName = renameTarget.kind === "file" && !/\.md$/i.test(raw) ? `${raw}.md` : raw;
    try {
      validateEntryName(newName);
      const newPath = await adapter.rename(renameTarget.path, newName);
      const renameStoredPath = (path: string) => path === renameTarget.path
        ? newPath
        : renameTarget.kind === "directory" && path.startsWith(`${renameTarget.path}/`)
          ? `${newPath}${path.slice(renameTarget.path.length)}`
          : path;
      setFavorites((current) => current.map(renameStoredPath));
      setRecents((current) => current.map(renameStoredPath));
      const nextFolder = activeFolder === renameTarget.path
        ? newPath
        : renameTarget.kind === "directory" && activeFolder.startsWith(`${renameTarget.path}/`)
          ? `${newPath}${activeFolder.slice(renameTarget.path.length)}`
          : activeFolder;
      const noteToKeep = renameTarget.kind === "file"
        ? newPath
        : selectedPath.startsWith(`${renameTarget.path}/`)
          ? `${newPath}${selectedPath.slice(renameTarget.path.length)}`
          : "";
      setRenameTarget(null);
      await reload(noteToKeep);
      setActiveFolder(nextFolder);
      showToast("Renamed successfully.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not rename that item.", true);
    }
  }

  async function duplicate(path: string): Promise<void> {
    try {
      await adapter.duplicate(path);
      setContextTarget(null);
      await reload();
      showToast("A copy is ready.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not duplicate that item.", true);
    }
  }

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget) return;
    try {
      await adapter.delete(deleteTarget.path);
      setFavorites((current) => current.filter((path) => path !== deleteTarget.path && !path.startsWith(`${deleteTarget.path}/`)));
      setRecents((current) => current.filter((path) => path !== deleteTarget.path && !path.startsWith(`${deleteTarget.path}/`)));
      const removedSelected = selectedPath === deleteTarget.path || selectedPath.startsWith(`${deleteTarget.path}/`);
      setDeleteTarget(null);
      await reload(removedSelected ? "" : undefined);
      if (removedSelected) setContent("");
      showToast("Deleted permanently from your local folder.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not delete that item.", true);
    }
  }

  function toggleFavorite(path: string): void {
    setFavorites((current) => current.includes(path) ? current.filter((item) => item !== path) : [path, ...current]);
  }

  function exportNote(format: "md" | "html"): void {
    if (!selectedNote) return;
    const body = format === "md"
      ? content
      : `<!doctype html><meta charset="utf-8"><title>${escapeHtml(selectedNote.title)}</title><article>${DOMPurify.sanitize(marked.parse(content) as string)}</article>`;
    const blob = new Blob([body], { type: format === "md" ? "text/markdown" : "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${selectedNote.name.replace(/\.md$/i, "")}.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function copyPath(path: string): void {
    void navigator.clipboard.writeText(`${adapter.rootName}/${path}`).then(() => showToast("Local path copied."));
    setContextTarget(null);
  }

  function resizeStart(event: PointerEvent<HTMLDivElement>, pane: "sidebar" | "list"): void {
    event.preventDefault();
    const startX = event.clientX;
    const initial = pane === "sidebar" ? sidebarWidth : fileListWidth;
    const onMove = (moveEvent: globalThis.PointerEvent) => {
      const width = Math.min(480, Math.max(210, initial + moveEvent.clientX - startX));
      pane === "sidebar" ? setSidebarWidth(width) : setFileListWidth(width);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function collapseFileList(): void {
    setListCollapsed(true);
    if (window.matchMedia("(max-width: 850px)").matches) setMobilePane("editor");
  }

  function restoreFileList(): void {
    setListCollapsed(false);
    if (window.matchMedia("(max-width: 850px)").matches) setMobilePane("files");
  }

  async function installApp(): Promise<void> {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setInstallPrompt(null);
  }

  const welcome = !tree || !dashboardOpen;

  return (
    <div className={`app-shell ${welcome ? "welcome-shell" : ""}`}>
      <header className="topbar">
        <div className="brand-lockup">
          <button
            className="mobile-menu icon-button"
            aria-label={mobilePane === "folders" ? "Close folders" : "Open folders"}
            title={mobilePane === "folders" ? "Close folders" : "Open folders"}
            onClick={() => {
              setSidebarCollapsed(false);
              setMobilePane((pane) => pane === "folders" ? "files" : "folders");
            }}
          >{mobilePane === "folders" ? <X size={19} /> : <Menu size={19} />}</button>
          <div className="brand-icon"><Sparkles size={17} strokeWidth={2.3} /></div>
          <div className="brand-copy"><strong>MarkdownOS</strong><span>{tree ? adapter.rootName : "Your private writing space"}</span></div>
        </div>
        <div className="topbar-center">
          {welcome
            ? <nav className="landing-nav" aria-label="Main navigation">
                <a href="#features">Features</a><a href="#privacy">Privacy</a><a href="#how-it-works">How it works</a><a href="#about">About</a>
              </nav>
            : tree && <><span className="privacy-pill"><span className="live-dot" /> ALL FILES STAY ON THIS DEVICE</span><span className="sync-pill"><ShieldCheck size={13} /> Offline ready</span></>}
        </div>
        <div className="topbar-actions">
          {!welcome && <button
            className="dashboard-nav-button"
            onClick={() => {
              if (dashboardOpen && tree) navigateToPage(false);
              else if (rootAccessNeeded) void reconnectFolder();
              else if (tree) navigateToPage(true);
              else if (isSupported) void chooseFolder();
            }}
            disabled={!tree && !rootAccessNeeded && !isSupported}
          >{dashboardOpen && tree ? <><House size={15} /> Home</> : <><LayoutDashboard size={15} /> Dashboard</>}</button>}
          {welcome && <a className="landing-github" href="https://github.com/csepriyaranjan/MarkdownOS" target="_blank" rel="noreferrer">GitHub</a>}
          {welcome && <details className="landing-mobile-nav"><summary aria-label="Open navigation"><Menu size={19} /></summary><nav aria-label="Mobile navigation"><a href="#features">Features</a><a href="#privacy">Privacy</a><a href="#how-it-works">How it works</a><a href="#about">About</a></nav></details>}
          {tree && <button className="header-action" onClick={() => setSettingsOpen((open) => !open)} aria-label="Settings"><Settings2 size={17} /></button>}
          {welcome && (installPrompt
            ? <button className="landing-install" onClick={() => void installApp()}><ArrowDownToLine size={15} /> Install</button>
            : <a className="landing-install" href="#get-started">Install</a>)}
          {!welcome && installPrompt && <button className="install-button" onClick={() => void installApp()}><ArrowDownToLine size={15} /> Install app</button>}
          {!welcome && <button className="avatar-button" aria-label="Local workspace"><span>Y</span></button>}
        </div>
      </header>

      {!isSupported && <div className="browser-warning"><CircleHelp size={16} /> Writable folder access requires a recent Chromium-based browser. MarkdownOS never uploads your files; unsupported browsers can still download exported notes.</div>}
      {startupError && !tree && <div className="browser-warning warning-error"><CircleHelp size={16} />{startupError}</div>}

      {welcome ? (
        <WelcomeScreen
          supported={isSupported}
          accessNeeded={rootAccessNeeded}
          workspaceReady={Boolean(tree) && !rootAccessNeeded}
          installed={installed}
          canInstall={Boolean(installPrompt)}
          onOpenDashboard={() => navigateToPage(true)}
          onChoose={() => void chooseFolder()}
          onReconnect={() => void reconnectFolder()}
          onInstall={() => void installApp()}
          onDownload={() => {
            const blob = new Blob(["# My first note\n\nYour thoughts stay yours.\n"], { type: "text/markdown" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = "My first note.md";
            anchor.click();
            URL.revokeObjectURL(url);
          }}
        />
      ) : (
        <main className={`workspace ${sidebarCollapsed ? "sidebar-is-collapsed" : ""} ${listCollapsed ? "list-is-collapsed" : ""}`}>
          {tree && <LibrarySidebar
            rootName={adapter.rootName}
            notes={notes}
            favorites={favorites}
            tree={tree}
            activeFolder={activeFolder}
            activeTag={activeTag}
            collapsedFolders={collapsedFolders}
            sidebarCollapsed={sidebarCollapsed}
            sidebarWidth={sidebarWidth}
            mobileActive={mobilePane === "folders"}
            allTags={allTags}
            recents={recents}
            renameTarget={renameTarget}
            createTarget={createTarget}
            createName={createName}
            onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
            onSelectAll={() => { setActiveFolder(""); setActiveTag(""); setMobilePane("files"); }}
            onSelectFavorites={() => { setActiveFolder(""); setActiveTag("__favorites"); setMobilePane("files"); }}
            onNewFolder={() => startCreate("directory")}
            onSelectFolder={(path) => { setActiveFolder(path); setActiveTag(""); setMobilePane("files"); }}
            onToggleFolder={(path) => setCollapsedFolders((current) => current.includes(path) ? current.filter((item) => item !== path) : [...current, path])}
            onFolderContext={(event, path) => { event.preventDefault(); setContextTarget({ path, kind: "directory", x: event.clientX, y: event.clientY }); }}
            onRename={beginRename}
            onSubmitRename={submitRename}
            onChangeRename={(value) => setRenameTarget((target) => target ? { ...target, value } : null)}
            onCancelRename={() => setRenameTarget(null)}
            onCreateNameChange={setCreateName}
            onSubmitCreate={submitCreate}
            onCancelCreate={() => setCreateTarget(null)}
            onSelectTag={(tag) => { setActiveTag(activeTag === tag ? "" : tag); setActiveFolder(""); setMobilePane("files"); }}
            onOpenNote={openNote}
          />}
          {!sidebarCollapsed && <div className="resize-handle" onPointerDown={(event) => resizeStart(event, "sidebar")} />}

          <NotesListPane
            title={activeTag === "__favorites" ? "Favorites" : activeTag ? `#${activeTag}` : activeNode?.name ?? "All Notes"}
            rootName={adapter.rootName}
            notes={activeTag === "__favorites" ? notes.filter((note) => favorites.includes(note.path)) : visibleNotes}
            favorites={favorites}
            selectedPath={selectedPath}
            mobileActive={mobilePane === "files"}
            listCollapsed={listCollapsed}
            width={fileListWidth}
            search={search}
            searchInputRef={searchInputRef}
            activeTag={activeTag}
            createTarget={createTarget}
            createName={createName}
            renameTarget={renameTarget}
            activeFolder={activeFolder}
            loading={loading}
            onCollapse={collapseFileList}
            onSearch={setSearch}
            onCreateNote={() => startCreate("file")}
            onCreateNameChange={setCreateName}
            onSubmitCreate={submitCreate}
            onCancelCreate={() => setCreateTarget(null)}
            onSubmitRename={submitRename}
            onChangeRename={(value) => setRenameTarget((target) => target ? { ...target, value } : null)}
            onCancelRename={() => setRenameTarget(null)}
            onOpenNote={openNote}
            onContextNote={(path, x, y) => setContextTarget({ path, kind: "file", x, y })}
            onRefresh={() => void reload()}
          />
          {!listCollapsed && <div className="resize-handle" onPointerDown={(event) => resizeStart(event, "list")} />}

          <section className={`editor-pane ${mobilePane === "editor" ? "mobile-active" : ""}`}>
            {selectedNote
              ? <NoteEditor
                  note={selectedNote}
                  content={content}
                  editorMode={editorMode}
                  saveState={saveState}
                  favorites={favorites}
                  wordCount={wordCount}
                  onContentChange={setContent}
                  onModeChange={setEditorMode}
                  onExport={() => exportNote("md")}
                  onToggleFavorite={() => toggleFavorite(selectedNote.path)}
                  onTagSelect={(tag) => { setActiveTag(tag); setActiveFolder(""); setMobilePane("files"); }}
                  onFocusMode={() => { setSidebarCollapsed(true); setListCollapsed(true); }}
                  onShowNotes={listCollapsed ? restoreFileList : undefined}
                />
              : <EmptyEditor onCreate={() => startCreate("file")} onShowNotes={listCollapsed ? restoreFileList : undefined} />}
          </section>
        </main>
      )}

      {settingsOpen && <div className="settings-popover"><div className="settings-title">Workspace settings</div><button onClick={() => { setSettingsOpen(false); void chooseFolder(); }}><FolderOpen size={15} /> Change local folder</button><button onClick={() => exportNote("html")} disabled={!selectedNote}><Download size={15} /> Export as HTML</button><div className="settings-foot"><ShieldCheck size={13} /> No account. No cloud. No tracking.</div></div>}
      {contextTarget && <ContextMenu
        target={contextTarget}
        favorite={favorites.includes(contextTarget.path)}
        onRename={() => beginRename(contextTarget.path, contextTarget.kind)}
        onDuplicate={() => void duplicate(contextTarget.path)}
        onDelete={() => { setDeleteTarget({ path: contextTarget.path, name: pathName(contextTarget.path), kind: contextTarget.kind }); setContextTarget(null); }}
        onFavorite={() => { toggleFavorite(contextTarget.path); setContextTarget(null); }}
        onCopyPath={() => copyPath(contextTarget.path)}
        onNewInside={(kind) => startCreate(kind, contextTarget.path)}
        onClose={() => setContextTarget(null)}
      />}
      {deleteTarget && <div className="modal-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleteTarget(null); }}><div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
        <div className="modal-icon danger"><Trash2 size={19} /></div><h2 id="delete-title">Delete “{deleteTarget.name}”?</h2><p>{deleteTarget.kind === "directory" ? "This will permanently delete the folder and everything inside it." : "This note will be permanently deleted from your local folder."} This can’t be undone.</p>
        <div className="modal-actions"><button className="secondary-button" onClick={() => setDeleteTarget(null)}>Cancel</button><button className="danger-button" onClick={() => void confirmDelete()}>Delete permanently</button></div>
      </div></div>}
      {toast && <div className={`toast ${toast.error ? "toast-error" : ""}`} role="status"><span className="toast-indicator">{toast.error ? <X size={13} /> : <Check size={13} />}</span>{toast.message}</div>}
      {!welcome && <nav className="mobile-tabbar" aria-label="Main navigation">
        <button className={mobilePane === "folders" ? "selected" : ""} onClick={() => setMobilePane("folders")}><Folder size={18} /><span>Folders</span></button>
        <button className={mobilePane === "files" ? "selected" : ""} onClick={() => setMobilePane("files")}><FileText size={18} /><span>Notes</span></button>
        <button className={mobilePane === "editor" ? "selected" : ""} onClick={() => setMobilePane("editor")}><Pencil size={18} /><span>Editor</span></button>
      </nav>}
    </div>
  );
}

export default App;
