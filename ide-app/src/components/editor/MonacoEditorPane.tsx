import React from "react";
import Editor from "@monaco-editor/react";
import { Terminal } from "lucide-react";
import { EditorTheme, MockFile, UserRole } from "../../types/ide";

interface MonacoEditorPaneProps {
  activeFile?: MockFile;
  editorTheme: EditorTheme;
  handleEditorChange: (value: string | undefined) => void;
  handleEditorDidMount: (editor: any) => void;
  fontSize: number;
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

export const MonacoEditorPane: React.FC<MonacoEditorPaneProps> = ({
  activeFile,
  editorTheme,
  handleEditorChange,
  handleEditorDidMount,
  fontSize,
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
    <div className={`flex-1 w-full relative ${editorTheme === "vs-dark" ? "bg-[#1e1e1e]" : "bg-white"}`}>
      {activeFile?.path ? (
        <Editor
          height="100%"
          path={activeFile.path}
          language={activeFile.language}
          value={activeFile.content}
          theme={editorTheme}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize: fontSize,
            minimap: { enabled: minimapEnabled },
            wordWrap: wordWrap,
            tabSize: tabSize,
            cursorBlinking: cursorBlinking,
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
              vertical: "visible",
              horizontal: "visible"
            },
            lineNumbers: lineNumbers,
            renderWhitespace: renderWhitespace,
            bracketPairColorization: { enabled: bracketPairColorization },
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly: userRole === "viewer",
            automaticLayout: true,
            cursorSmoothCaretAnimation: "on",
            fontFamily: `${fontFamily}, Menlo, Monaco, Consolas, monospace`,
            fontLigatures: true,
            renderLineHighlight: "all",
            quickSuggestions: { other: true, comments: true, strings: true },
            suggestOnTriggerCharacters: true
          }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
          <Terminal className="w-12 h-12 text-slate-700 animate-pulse animate-duration-1000" />
          <p className="text-sm font-medium">No file active</p>
          <p className="text-xs text-slate-600">Select a file from the explorer or create a new one to begin editing.</p>
        </div>
      )}
    </div>
  );
};
export default MonacoEditorPane;
