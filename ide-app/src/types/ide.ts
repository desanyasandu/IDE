export interface MockFile {
  id?: string;
  name: string;
  path: string;
  language: string;
  content: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface Collaborator {
  name: string;
  email?: string;
  avatar: string;
  role: string;
  id?: string;
  color?: string;
  cursor?: { line: number; ch: number };
}

export type EditorTheme = "vs-dark" | "light";
export type ActiveLeftTab = "explorer" | "search" | "git" | "rooms";
export type ActiveBottomTab = "terminal" | "output" | "problems";
export type ClientOS = "macos" | "linux" | "windows";
export type UserRole = "owner" | "editor" | "viewer";

export interface MenuItem {
  label?: string;
  action?: () => void;
  divider?: boolean;
  shortcut?: string;
}

export interface Invitation {
  room: string;
  role: string;
  passcode?: string;
}

export interface SearchMatch {
  path: string;
  lineIndex: number;
  lineContent: string;
  matchIndex: number;
  matchLength: number;
}
