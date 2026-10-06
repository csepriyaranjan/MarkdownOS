import { openDB, type IDBPDatabase } from "idb";
import type { FolderEntry, LocalStorageAdapter } from "../domain";

const DATABASE_NAME = "markdownos-local";
const HANDLE_STORE = "handles";
const ROOT_HANDLE_KEY = "root";
const INVALID_NAME_CHARACTERS = /[\\/:*?"<>|]/;

interface HandleDatabase {
  handles: {
    key: string;
    value: FileSystemDirectoryHandle;
  };
}

export class FolderAccessError extends Error {
  constructor(message = "Permission to access this folder is required.") {
    super(message);
    this.name = "FolderAccessError";
  }
}

export class BrowserFileSystemAdapter implements LocalStorageAdapter {
  private root: FileSystemDirectoryHandle | null = null;
  private database: Promise<IDBPDatabase<HandleDatabase>> | null = null;

  get rootName(): string {
    return this.root?.name ?? "My Files";
  }

  get hasRoot(): boolean {
    return this.root !== null;
  }

  async pickRoot(): Promise<void> {
    if (!("showDirectoryPicker" in window)) {
      throw new Error("This browser does not support writable folder access. Use a recent Chromium-based browser to edit local files.");
    }

    const handle = await window.showDirectoryPicker({ mode: "readwrite" });
    const permission = await handle.requestPermission({ mode: "readwrite" });
    if (permission !== "granted") throw new FolderAccessError();
    this.root = handle;
    await (await this.getDatabase()).put(HANDLE_STORE, handle, ROOT_HANDLE_KEY);
  }

  async restoreRoot(): Promise<boolean> {
    const handle = await (await this.getDatabase()).get(HANDLE_STORE, ROOT_HANDLE_KEY);
    if (!handle) return false;
    this.root = handle;
    return (await handle.queryPermission({ mode: "readwrite" })) === "granted";
  }

  async requestRootAccess(): Promise<boolean> {
    if (!this.root) return false;
    const permission = await this.root.requestPermission({ mode: "readwrite" });
    return permission === "granted";
  }

  async list(path = ""): Promise<FolderEntry[]> {
    const directory = await this.getDirectory(path);
    const entries: FolderEntry[] = [];
    for await (const entry of directory.values()) {
      const entryPath = path ? `${path}/${entry.name}` : entry.name;
      if (entry.kind === "directory") {
        entries.push({ name: entry.name, path: entryPath, kind: "directory" });
      } else {
        const file = await entry.getFile();
        entries.push({
          name: entry.name,
          path: entryPath,
          kind: "file",
          modifiedAt: file.lastModified,
          size: file.size,
        });
      }
    }
    return entries.sort((a, b) => a.kind === b.kind
      ? a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      : a.kind === "directory" ? -1 : 1);
  }

  async readFile(path: string): Promise<string> {
    const { directory, name } = await this.getParent(path);
    return (await (await directory.getFileHandle(name)).getFile()).text();
  }

  async writeFile(path: string, contents: string): Promise<void> {
    const { directory, name } = await this.getParent(path);
    const file = await directory.getFileHandle(name);
    const writable = await file.createWritable();
    await writable.write(contents);
    await writable.close();
  }

  async createFile(directoryPath: string, name: string, contents: string): Promise<string> {
    validateEntryName(name);
    const directory = await this.getDirectory(directoryPath);
    await assertNameAvailable(directory, name);
    const handle = await directory.getFileHandle(name, { create: true });
    const writable = await handle.createWritable();
    await writable.write(contents);
    await writable.close();
    return directoryPath ? `${directoryPath}/${name}` : name;
  }

  async createDirectory(directoryPath: string, name: string): Promise<string> {
    validateEntryName(name);
    const directory = await this.getDirectory(directoryPath);
    await assertNameAvailable(directory, name);
    await directory.getDirectoryHandle(name, { create: true });
    return directoryPath ? `${directoryPath}/${name}` : name;
  }

  async rename(path: string, newName: string): Promise<string> {
    validateEntryName(newName);
    const { directory, name } = await this.getParent(path);
    if (name === newName) return path;
    await assertNameAvailable(directory, newName);
    const source = await directory.getDirectoryHandle(name).catch(async (error: unknown) => {
      if (!isNotFound(error) && !isTypeMismatch(error)) throw error;
      return null;
    });
    if (source) {
      const destination = await directory.getDirectoryHandle(newName, { create: true });
      await copyDirectoryContents(source, destination);
      await directory.removeEntry(name, { recursive: true });
    } else {
      const file = await directory.getFileHandle(name);
      const content = await file.getFile();
      const destination = await directory.getFileHandle(newName, { create: true });
      const writable = await destination.createWritable();
      await writable.write(content);
      await writable.close();
      await directory.removeEntry(name);
    }
    const parent = path.split("/").slice(0, -1).join("/");
    return parent ? `${parent}/${newName}` : newName;
  }

  async duplicate(path: string): Promise<string> {
    const { directory, name } = await this.getParent(path);
    const { baseName, extension } = splitExtension(name);
    let candidate = `${baseName} Copy${extension}`;
    let counter = 2;
    while (await entryExists(directory, candidate)) {
      candidate = `${baseName} Copy ${counter}${extension}`;
      counter += 1;
    }
    const sourceDirectory = await directory.getDirectoryHandle(name).catch(async (error: unknown) => {
      if (!isNotFound(error) && !isTypeMismatch(error)) throw error;
      return null;
    });
    if (sourceDirectory) {
      const target = await directory.getDirectoryHandle(candidate, { create: true });
      await copyDirectoryContents(sourceDirectory, target);
    } else {
      const sourceFile = await directory.getFileHandle(name);
      const target = await directory.getFileHandle(candidate, { create: true });
      const writable = await target.createWritable();
      await writable.write(await sourceFile.getFile());
      await writable.close();
    }
    const parent = path.split("/").slice(0, -1).join("/");
    return parent ? `${parent}/${candidate}` : candidate;
  }

  async delete(path: string): Promise<void> {
    const { directory, name } = await this.getParent(path);
    await directory.removeEntry(name, { recursive: true });
  }

  private async getDatabase(): Promise<IDBPDatabase<HandleDatabase>> {
    this.database ??= openDB<HandleDatabase>(DATABASE_NAME, 1, {
      upgrade(database) {
        database.createObjectStore(HANDLE_STORE);
      },
    });
    return this.database;
  }

  private async getDirectory(path: string): Promise<FileSystemDirectoryHandle> {
    let directory = this.getRoot();
    for (const segment of path.split("/").filter(Boolean)) {
      directory = await directory.getDirectoryHandle(segment);
    }
    return directory;
  }

  private async getParent(path: string): Promise<{ directory: FileSystemDirectoryHandle; name: string }> {
    const pieces = path.split("/").filter(Boolean);
    const name = pieces.pop();
    if (!name) throw new Error("A file path is required.");
    return { directory: await this.getDirectory(pieces.join("/")), name };
  }

  private getRoot(): FileSystemDirectoryHandle {
    if (!this.root) throw new FolderAccessError("Choose a local folder before accessing files.");
    return this.root;
  }
}

export function validateEntryName(name: string): void {
  const trimmed = name.trim();
  if (!trimmed || trimmed === "." || trimmed === ".." || INVALID_NAME_CHARACTERS.test(trimmed)) {
    throw new Error("Use a valid name without / \\ : * ? \" < > |.");
  }
}

function splitExtension(name: string): { baseName: string; extension: string } {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? { baseName: name.slice(0, dot), extension: name.slice(dot) } : { baseName: name, extension: "" };
}

async function assertNameAvailable(directory: FileSystemDirectoryHandle, name: string): Promise<void> {
  if (await entryExists(directory, name)) throw new Error("Already exists");
}

async function entryExists(directory: FileSystemDirectoryHandle, name: string): Promise<boolean> {
  try {
    await directory.getFileHandle(name);
    return true;
  } catch (error) {
    if (!isNotFound(error)) throw error;
  }
  try {
    await directory.getDirectoryHandle(name);
    return true;
  } catch (error) {
    if (!isNotFound(error)) throw error;
    return false;
  }
}

async function copyDirectoryContents(
  source: FileSystemDirectoryHandle,
  target: FileSystemDirectoryHandle,
): Promise<void> {
  for await (const entry of source.values()) {
    if (entry.kind === "directory") {
      const child = await target.getDirectoryHandle(entry.name, { create: true });
      await copyDirectoryContents(entry, child);
    } else {
      const file = await entry.getFile();
      const copy = await target.getFileHandle(entry.name, { create: true });
      const writable = await copy.createWritable();
      await writable.write(file);
      await writable.close();
    }
  }
}

function isNotFound(error: unknown): boolean {
  return error instanceof DOMException && error.name === "NotFoundError";
}

function isTypeMismatch(error: unknown): boolean {
  return error instanceof DOMException && error.name === "TypeMismatchError";
}
