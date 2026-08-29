import React from "react";
import { GitBranch, X, Bug, TerminalSquare, Sparkles } from "lucide-react";
import { EditorTheme } from "../../types/ide";

interface StatusBarProps {
  showStatusBar: boolean;
  editorTheme: EditorTheme;
  bottomPanelOpen: boolean;
  setBottomPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  aiStatus: "idle" | "thinking" | "typing";
}

export const StatusBar: React.FC<StatusBarProps> = ({
  showStatusBar,
  editorTheme,
  bottomPanelOpen,
  setBottomPanelOpen,
  aiStatus
}) => {
  if (!showStatusBar) return null;

  return (
    <footer className={`h-7.5 flex items-center justify-between px-4 text-[12.5px] select-none z-20 shrink-0 font-medium border-t transition-colors duration-250 ${
      editorTheme === "vs-dark"
        ? "bg-[#0d0d11] border-[#1c1c22] text-slate-300"
        : "bg-white border-slate-200 text-slate-700 shadow-[0_-1px_3px_rgba(0,0,0,0.02)]"
    }`}>
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-1 px-2.5 py-0.5 cursor-pointer h-full transition-colors ${
          editorTheme === "vs-dark" ? "hover:bg-slate-800/60 hover:text-slate-100" : "hover:bg-slate-100 hover:text-slate-900"
        }`}>
          <GitBranch className="w-4 h-4" />
          <span>main</span>
        </div>
        <div className={`flex items-center gap-2.5 px-2.5 py-0.5 cursor-pointer h-full transition-colors ${
          editorTheme === "vs-dark" ? "hover:bg-slate-800/60 hover:text-slate-100" : "hover:bg-slate-100 hover:text-slate-900"
        }`}>
          <div className="flex items-center gap-1">
            <span className="font-bold">0</span>
            <X className={`w-3.5 h-3.5 ${editorTheme === "vs-dark" ? "text-red-400" : "text-red-600"}`} />
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold">0</span>
            <Bug className={`w-3.5 h-3.5 ${editorTheme === "vs-dark" ? "text-amber-400" : "text-amber-600"}`} />
          </div>
        </div>
        <div
          onClick={() => setBottomPanelOpen(prev => !prev)}
          className={`hidden sm:flex items-center gap-1.5 text-[12px] font-mono px-2 py-0.5 cursor-pointer h-full transition-colors ${
            editorTheme === "vs-dark"
              ? "text-indigo-400 hover:bg-slate-800/60 hover:text-indigo-300"
              : "text-indigo-600 hover:bg-slate-100 hover:text-indigo-800"
          }`}
          title="Toggle Bottom Console Panel"
        >
          <TerminalSquare className="w-4 h-4 shrink-0" />
          <span>Console: {bottomPanelOpen ? "OPEN" : "CLOSED"}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={`px-2 py-0.5 cursor-pointer h-full hidden md:inline transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-800/60" : "hover:bg-slate-100"}`}>Ln 14, Col 5</span>
        <span className={`px-2 py-0.5 cursor-pointer h-full hidden md:inline transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-800/60" : "hover:bg-slate-100"}`}>Spaces: 2</span>
        <span className={`px-2 py-0.5 cursor-pointer h-full hidden sm:inline transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-800/60" : "hover:bg-slate-100"}`}>UTF-8</span>
        <span className={`px-2 py-0.5 cursor-pointer h-full transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-800/60" : "hover:bg-slate-100"}`}>TypeScript JSX</span>
        <span className={`px-2.5 py-0.5 cursor-pointer h-full transition-colors flex items-center gap-1 ${
          editorTheme === "vs-dark" ? "text-indigo-400 hover:bg-slate-800/60" : "text-indigo-600 hover:bg-slate-100"
        }`}>
          <Sparkles className={`w-3.5 h-3.5 ${aiStatus !== "idle" ? "animate-spin text-amber-500" : ""}`} />
          <span>Copilot Sync'd</span>
        </span>
      </div>
    </footer>
  );
};
export default StatusBar;
