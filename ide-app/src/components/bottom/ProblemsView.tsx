import React from "react";
import { Bug } from "lucide-react";
import { EditorTheme } from "../../types/ide";

interface ProblemsViewProps {
  editorTheme: EditorTheme;
}

export const ProblemsView: React.FC<ProblemsViewProps> = ({ editorTheme }) => {
  return (
    <div className={`select-none flex flex-col items-center justify-center h-full gap-2 ${
      editorTheme === "vs-dark" ? "text-slate-400" : "text-slate-500"
    }`}>
      <Bug className={`w-8 h-8 animate-pulse ${editorTheme === "vs-dark" ? "text-slate-600" : "text-slate-300"}`} />
      <span>No problems have been detected in the workspace. Clean build!</span>
    </div>
  );
};
export default ProblemsView;
