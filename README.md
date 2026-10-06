# MarkdownOS

MarkdownOS is a local-first workspace for Markdown notes and Mermaid diagrams. It combines a folder tree, searchable note list, and editor/preview in one responsive interface. Your notes stay in the folder you choose; the app does not upload them to a server.

## Run the app

Requirements: Node.js and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To make a production build:

```sh
npm run build
npm run preview
```

The build command runs the TypeScript project build before creating the Vite production bundle.

## Technology and why it is used

| Technology | Use in MarkdownOS |
| --- | --- |
| React 18 | Builds the interactive workspace from reusable UI components. |
| TypeScript | Gives the UI, note tree, and storage adapter explicit types. |
| Vite | Provides the development server and production bundling. |
| Browser File System Access API | Reads and writes the user's chosen directory directly, rather than importing a copy of the notes. |
| IndexedDB via `idb` | Persists the selected directory handle between visits. The browser can still require permission to be granted again. |
| `marked` | Converts Markdown to HTML, including GitHub-flavored Markdown. |
| DOMPurify | Sanitizes generated Markdown HTML and rendered Mermaid SVG before they are inserted into the page. |
| Mermaid | Parses and renders fenced `mermaid` diagrams. It is loaded on demand when a preview contains a diagram. |
| `lucide-react` | Supplies consistent, lightweight interface icons. |
| Service worker and Web App Manifest | Enable the installable PWA shell and cache same-origin app resources for offline use after they have been cached. |
| CSS | Provides the responsive layout, pane collapse behavior, visual design, and transitions without an extra animation dependency. |

## How the app works

### 1. Choose a local workspace

The browser folder picker is opened from the welcome screen. The app requests read/write access, keeps the directory handle in memory, and stores it in IndexedDB so it can try to restore the workspace next time. If permission has expired, the user can reconnect the folder. Folder access requires a supported browser and a secure context (normally `localhost` or HTTPS).

This is real folder access, not an upload. Browser support for writable directory handles is not universal; MarkdownOS explains when the API is unavailable. A `webkitdirectory` import is not used as a writable substitute.

### 2. Scan and build the library

`BrowserFileSystemAdapter` lists entries in the selected folder. `App.tsx` recursively reads folders and Markdown files, then builds a tree used by the sidebar and note list. Note titles come from the first Markdown heading when present, otherwise from the filename; snippets and `#tags` are derived from the file content.

The UI is divided into components under `src/ui/components/`: the workspace sidebar and folder tree, notes list, editor, Markdown preview, context menu, onboarding, and inline naming controls. `src/ui/App.tsx` coordinates application state and connects those components to storage operations.

### 3. Edit files on disk

The storage contract in `src/domain.ts` describes operations such as listing, reading, writing, creating, renaming, duplicating, and deleting. The browser implementation lives in `src/storage/browserFileSystem.ts`.

Creating a note or folder, renaming, duplicating, and deleting call the File System Access API through this adapter. Editor changes are debounced before they are written to the selected file. Favorites and recent-note paths are small UI preferences stored separately in browser `localStorage`; the Markdown contents remain in the chosen folder.

Web folder rename is implemented by copying the folder contents to a new directory and then removing the old directory, because the browser API does not provide a general directory rename operation. Keep a backup before renaming important folders, especially if the browser or device may be interrupted during the copy.

### 4. Render Markdown and Mermaid

`MarkdownPreview.tsx` parses Markdown using `marked` and sanitizes the result with DOMPurify. Mermaid code blocks are escaped and kept as source until the preview effect dynamically imports Mermaid. Each diagram is parsed before rendering. A syntax error is shown in a compact error card with expandable source instead of Mermaid's large error graphic; successful SVG output is sanitized and constrained to the available width.

The error card means the diagram text could not be parsed; it does not by itself indicate a mobile-only problem. Check the expanded source and the Mermaid syntax if it appears.

### 5. Work offline and install

`src/main.tsx` registers `public/sw.js` on localhost or HTTPS. The service worker caches the app shell during installation and caches successful same-origin GET resources as they are requested. This supports repeat/offline visits after the required shell and resources have been cached. The PWA does not upload, synchronize, or back up note files.

## Current scope and limitations

- This repository contains the browser React/Vite PWA. The planned Tauri desktop shell and native filesystem adapter are not included yet.
- The web app edits the selected folder through the File System Access API; writable access depends on browser support and permission.
- The manifest currently has no app icon entries, so an icon set should be added before distributing a polished installable PWA.
- The service worker caches the app shell and resources it sees; it is not a sync engine and does not cache or manage the selected notes as app-owned data.
- Build validation: `npm run build`. There is currently no separate automated test script in `package.json`.

## Key files

```text
src/
  domain.ts                         Shared types and Markdown metadata helpers
  main.tsx                          React entry point and service-worker registration
  storage/browserFileSystem.ts      Browser folder access and disk operations
  ui/App.tsx                        Workspace state and feature orchestration
  ui/styles.css                     Responsive layout and visual design
  ui/components/                    Reusable workspace and editor components
public/
  manifest.webmanifest              PWA metadata
  sw.js                             App-shell and runtime resource caching
```
"# MarkdownOS" 
