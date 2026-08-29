import React from "react";
import { Terminal, TerminalSquare, Bug, RefreshCw, X } from "lucide-react";
import { ActiveBottomTab, ClientOS, EditorTheme, UserRole } from "../../types/ide";
import { getTerminalHeader, getTerminalPrompt } from "../../utils/terminal";
import TerminalView from "./TerminalView";
import OutputView from "./OutputView";
import ProblemsView from "./ProblemsView";

interface BottomPanelProps {
  editorTheme: EditorTheme;
  bottomPanelOpen: boolean;
  setBottomPanelOpen: (open: boolean) => void;
  bottomPanelHeight: number;
  isResizingBottom: boolean;
  activeBottomTab: ActiveBottomTab;
  setActiveBottomTab: (tab: ActiveBottomTab) => void;
  clientOS: ClientOS;
  terminalHistory: string[];
  setTerminalHistory: React.Dispatch<React.SetStateAction<string[]>>;
  terminalInput: string;
  setTerminalInput: (val: string) => void;
  outputLogs: string[];
  setOutputLogs: React.Dispatch<React.SetStateAction<string[]>>;
  userRole: UserRole;
  tauriInvokeRef: React.MutableRefObject<any>;
  handleRunCode: () => void;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  editorTheme,
  bottomPanelOpen,
  setBottomPanelOpen,
  bottomPanelHeight,
  isResizingBottom,
  activeBottomTab,
  setActiveBottomTab,
  clientOS,
  terminalHistory,
  setTerminalHistory,
  terminalInput,
  setTerminalInput,
  outputLogs,
  setOutputLogs,
  userRole,
  tauriInvokeRef,
  handleRunCode
}) => {
  return (
    <div
      className={`flex flex-col overflow-hidden z-20 border-t transition-colors duration-250 ${
        editorTheme === "vs-dark"
          ? "bg-[#0d0d11] border-[#202025]"
          : "bg-white border-[#e5e7eb]"
      }`}
      style={{
        height: bottomPanelOpen ? `${bottomPanelHeight}px` : 0,
        transition: isResizingBottom ? 'none' : 'height 300ms ease-out'
      }}
    >
      {/* Bottom Panel Header */}
      <div className={`h-9 flex items-center justify-between px-4 text-xs font-semibold select-none shrink-0 border-b transition-colors duration-250 ${
        editorTheme === "vs-dark"
          ? "bg-[#141418] border-[#202025] text-slate-400"
          : "bg-[#f3f4f6] border-[#e5e7eb] text-slate-500"
      }`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveBottomTab("terminal")}
            className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all cursor-pointer ${
              activeBottomTab === "terminal"
                ? (editorTheme === "vs-dark" ? "text-indigo-400 border-indigo-500 font-bold" : "text-indigo-600 border-indigo-600 font-bold")
                : (editorTheme === "vs-dark" ? "border-transparent hover:text-slate-200" : "border-transparent hover:text-slate-800")
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveBottomTab("output")}
            className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all cursor-pointer ${
              activeBottomTab === "output"
                ? (editorTheme === "vs-dark" ? "text-indigo-400 border-indigo-500 font-bold" : "text-indigo-600 border-indigo-600 font-bold")
                : (editorTheme === "vs-dark" ? "border-transparent hover:text-slate-200" : "border-transparent hover:text-slate-800")
            }`}
          >
            <TerminalSquare className="w-3.5 h-3.5" />
            <span>Output</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveBottomTab("problems")}
            className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all cursor-pointer ${
              activeBottomTab === "problems"
                ? (editorTheme === "vs-dark" ? "text-indigo-400 border-indigo-500 font-bold" : "text-indigo-600 border-indigo-600 font-bold")
                : (editorTheme === "vs-dark" ? "border-transparent hover:text-slate-200" : "border-transparent hover:text-slate-800")
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Problems</span>
          </button>
        </div>

        {/* Window action buttons (Clear & Close) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (activeBottomTab === "terminal") {
                const prompt = getTerminalPrompt(clientOS);
                const header = getTerminalHeader(clientOS);
                setTerminalHistory([...header, prompt]);
              } else if (activeBottomTab === "output") {
                setOutputLogs([]);
              }
            }}
            className={`p-1 rounded cursor-pointer transition-colors ${
              editorTheme === "vs-dark"
                ? "hover:bg-slate-800 text-slate-400 hover:text-white"
                : "hover:bg-slate-200 text-slate-500 hover:text-slate-800"
            }`}
            title="Clear Console Output"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setBottomPanelOpen(false)}
            className={`p-1 rounded cursor-pointer transition-colors ${
              editorTheme === "vs-dark"
                ? "hover:bg-slate-800 text-slate-400 hover:text-white"
                : "hover:bg-slate-200 text-slate-500 hover:text-slate-800"
            }`}
            title="Close Panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Panel Content */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-[14.5px] leading-relaxed scrollbar-thin select-text">
        {activeBottomTab === "terminal" && (
          <TerminalView
            editorTheme={editorTheme}
            terminalHistory={terminalHistory}
            terminalInput={terminalInput}
            setTerminalInput={setTerminalInput}
            setTerminalHistory={setTerminalHistory}
            clientOS={clientOS}
            userRole={userRole}
            tauriInvokeRef={tauriInvokeRef}
            handleRunCode={handleRunCode}
          />
        )}

        {activeBottomTab === "output" && (
          <OutputView
            editorTheme={editorTheme}
            outputLogs={outputLogs}
          />
        )}

        {activeBottomTab === "problems" && (
          <ProblemsView
            editorTheme={editorTheme}
          />
        )}
      </div>
    </div>
  );
};
export default BottomPanel;
