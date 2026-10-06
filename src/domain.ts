export type EntryKind = "file" | "directory";

export interface FolderEntry {
  name: string;
  path: string;
  kind: EntryKind;
  modifiedAt?: number;
  size?: number;
}

export interface LocalStorageAdapter {
  readonly rootName: string;
  pickRoot(): Promise<void>;
  restoreRoot(): Promise<boolean>;
  requestRootAccess(): Promise<boolean>;
  list(path?: string): Promise<FolderEntry[]>;
  readFile(path: string): Promise<string>;
  writeFile(path: string, contents: string): Promise<void>;
  createFile(directory: string, name: string, contents: string): Promise<string>;
  createDirectory(directory: string, name: string): Promise<string>;
  rename(path: string, newName: string): Promise<string>;
  duplicate(path: string): Promise<string>;
  delete(path: string): Promise<void>;
}

export interface NoteDocument extends FolderEntry {
  kind: "file";
  content: string;
  title: string;
  snippet: string;
  tags: string[];
}

export interface FolderNode extends FolderEntry {
  kind: "directory";
  children: FolderNode[];
  files: NoteDocument[];
}

export function parentPath(path: string): string {
  const pieces = path.split("/");
  pieces.pop();
  return pieces.join("/");
}

export function pathName(path: string): string {
  return path.split("/").at(-1) ?? path;
}

export function tagsFor(content: string): string[] {
  return [...new Set(content.match(/(?:^|\s)#([a-zA-Z][\w/-]*)/g)?.map((tag) => tag.trim().slice(1)) ?? [])];
}

export function noteTitle(content: string, filename: string): string {
  const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return heading || filename.replace(/\.md$/i, "");
}

export function noteSnippet(content: string): string {
  return content
    .replace(/^```[\s\S]*?```/gm, "")
    .replace(/[#>*_`[\]()!-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}
