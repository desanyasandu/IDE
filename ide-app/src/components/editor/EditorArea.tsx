import React from "react";
import { ChevronRight, X } from "lucide-react";
import { EditorTheme, MockFile, UserRole } from "../../types/ide";
import { getFileIcon } from "../../utils/icons";
import MonacoEditorPane from "./MonacoEditorPane";

interface EditorAreaProps {
  editorTheme: EditorTheme;
  openTabs: string[];
  files: Record<string, MockFile>;
  activeFilePath: string;
  setActiveFilePath: (path: string) => void;
  handleCloseTab: (e: React.MouseEvent | null, path: string) => void;
  showBreadcrumbs: boolean;
  activeFile?: MockFile;
  fontSize: number;
  setFontSize: React.Dispatch<React.SetStateAction<number>>;
  bottomPanelOpen: boolean;
  startResizingBottom: (mouseDownEvent: React.MouseEvent) => void;

  // Monaco props
  handleEditorChange: (value: string | undefined) => void;
  handleEditorDidMount: (editor: any) => void;
  minimapEnabled: boolean;
  wordWrap: "on" | "off";
  tabSize: number;
  cursorBlinking: "smooth" | "blink" | "solid" | "expand";
  lineNumbers: "on" | "off" | "relative";
  renderWhitespace: "none" | "boundary" | "selection" | "all";
  bracketPairColorization: boolean;
  userRole: UserRole;
  fontFamily: string;
}

export const EditorArea: React.FC<EditorAreaProps> = ({
  editorTheme,
  openTabs,
  files,
  activeFilePath,
  setActiveFilePath,
  handleCloseTab,
  showBreadcrumbs,
  activeFile,
  fontSize,
  setFontSize,
  bottomPanelOpen,
  startResizingBottom,
  handleEditorChange,
  handleEditorDidMount,
  minimapEnabled,
  wordWrap,
  tabSize,
  cursorBlinking,
  lineNumbers,
  renderWhitespace,
  bracketPairColorization,
  userRole,
  fontFamily
}) => {
  return (
    <div className={`flex-1 flex flex-col min-w-0 relative h-full transition-colors duration-250 ${
      editorTheme === "vs-dark" ? "bg-[#131317]" : "bg-[#ffffff]"
    }`}>
      {/* Top Editor Area */}
      <div className="flex-1 flex flex-col min-h-0 w-full relative">
        {/* Tab bar */}
        <div className={`h-10 flex items-center overflow-x-auto select-none scrollbar-none z-10 shrink-0 border-b transition-colors duration-250 ${
          editorTheme === "vs-dark" ? "bg-[#16161a] border-[#1b1b20]" : "bg-[#f3f4f6] border-[#e5e7eb]"
        }`}>
          {openTabs.map(tabPath => {
            const file = files[tabPath] || { name: tabPath };
            const isActive = tabPath === activeFilePath;
            return (
              <div
                key={tabPath}
                onClick={() => setActiveFilePath(tabPath)}
                className={`group h-full flex items-center gap-2.5 px-4.5 py-2 text-sm cursor-pointer transition-all duration-300 relative border-r ${
                  isActive
                    ? (editorTheme === "vs-dark"
                        ? "bg-[#131317] text-white font-medium border-t-2 border-indigo-500 shadow-inner border-r-[#1f1f25]"
                        : "bg-[#ffffff] text-slate-800 font-medium border-t-2 border-indigo-600 border-r-[#e5e7eb]")
                    : (editorTheme === "vs-dark"
                        ? "bg-[#18181c]/60 text-slate-400 hover:bg-[#18181c] hover:text-slate-200 border-r-[#1f1f25]"
                        : "bg-[#e5e7eb]/60 text-slate-500 hover:bg-[#e5e7eb] hover:text-slate-800 border-r-[#e5e7eb]")
                }`}
              >
                {getFileIcon(file.name)}
                <span className="font-mono text-[13px] font-medium">{file.name}</span>
                <button
                  onClick={(e) => handleCloseTab(e, tabPath)}
                  className="p-0.5 rounded-full text-slate-500 hover:text-white hover:bg-slate-800/80 transition-colors ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Breadcrumb line */}
        {showBreadcrumbs && (
          <div className={`h-7 flex items-center px-4.5 text-xs font-mono gap-1.5 shrink-0 border-b transition-colors duration-250 ${
            editorTheme === "vs-dark" ? "bg-[#131317] border-slate-900 text-slate-400" : "bg-[#ffffff] border-[#e5e7eb] text-slate-600"
          }`}>
            <span className="hover:text-slate-300 cursor-pointer">ide-app</span>
            <ChevronRight className="w-3 h-3" />
            <span className="hover:text-slate-300 cursor-pointer">src</span>
            <ChevronRight className="w-3 h-3" />
            {activeFile?.path?.includes("components") && (
              <>
                <span className="hover:text-slate-300 cursor-pointer">components</span>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
            <span className={`font-medium ${editorTheme === "vs-dark" ? "text-indigo-400" : "text-indigo-600"}`}>{activeFile?.name}</span>
          </div>
        )}

        {/* Monaco Editor Pane */}
        <MonacoEditorPane
          activeFile={activeFile}
          editorTheme={editorTheme}
          handleEditorChange={handleEditorChange}
          handleEditorDidMount={handleEditorDidMount}
          fontSize={fontSize}
          minimapEnabled={minimapEnabled}
          wordWrap={wordWrap}
          tabSize={tabSize}
          cursorBlinking={cursorBlinking}
          lineNumbers={lineNumbers}
          renderWhitespace={renderWhitespace}
          bracketPairColorization={bracketPairColorization}
          userRole={userRole}
          fontFamily={fontFamily}
        />

        {/* Code actions bar / Overlay options */}
        <div className={`absolute bottom-4 right-6 flex items-center gap-2 backdrop-blur py-1.5 px-3 rounded-xl shadow-xl text-[11px] z-10 select-none transition-colors duration-250 ${
          editorTheme === "vs-dark"
            ? "bg-[#1b1b22]/90 border border-slate-800/80 text-slate-300 shadow-black/40"
            : "bg-white/95 border border-slate-200 text-slate-600 shadow-slate-200/40"
        }`}>
          <span className={`font-bold uppercase text-[9px] tracking-wide pr-1.5 border-r mr-1 ${
            editorTheme === "vs-dark" ? "text-slate-500 border-slate-800" : "text-slate-400 border-slate-200"
          }`}>Font Scale</span>
          <button
            onClick={() => setFontSize(prev => Math.max(10, prev - 1))}
            className={`p-1 rounded-md w-5 h-5 flex items-center justify-center font-bold font-mono transition-colors cursor-pointer ${
              editorTheme === "vs-dark" ? "hover:bg-slate-800 text-slate-300 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"
            }`}
          >
            -
          </button>
          <span className={`font-mono font-semibold ${editorTheme === "vs-dark" ? "text-indigo-400" : "text-indigo-600"}`}>{fontSize}px</span>
          <button
            onClick={() => setFontSize(prev => Math.min(22, prev + 1))}
            className={`p-1 rounded-md w-5 h-5 flex items-center justify-center font-bold font-mono transition-colors cursor-pointer ${
              editorTheme === "vs-dark" ? "hover:bg-slate-800 text-slate-300 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"
            }`}
          >
            +
          </button>
        </div>
      </div>

      {/* Bottom panel divider */}
      {bottomPanelOpen && (
        <div
          onMouseDown={startResizingBottom}
          className="h-1 hover:h-1.5 bg-transparent hover:bg-indigo-500/50 active:bg-indigo-500 transition-all cursor-row-resize z-30 shrink-0"
          title="Resize Bottom Panel"
        />
      )}
    </div>
  );
};
export default EditorArea;
