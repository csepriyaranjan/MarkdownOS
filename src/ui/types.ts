export type CreateTarget = { kind: "file" | "directory"; directory: string };
export type RenameTarget = { path: string; kind: "file" | "directory"; value: string };
export type ContextTarget = { path: string; kind: "file" | "directory"; x: number; y: number };
export type MobilePane = "folders" | "files" | "editor";
export type ToastState = { message: string; error?: boolean };
