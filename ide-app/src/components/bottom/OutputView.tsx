import React from "react";
import { EditorTheme } from "../../types/ide";

interface OutputViewProps {
  editorTheme: EditorTheme;
  outputLogs: string[];
}

export const OutputView: React.FC<OutputViewProps> = ({
  editorTheme,
  outputLogs
}) => {
  return (
    <div className={`whitespace-pre-wrap ${editorTheme === "vs-dark" ? "text-slate-300" : "text-slate-700"}`}>
      {outputLogs.length === 0 ? (
        <span className="text-slate-500 italic select-none">No build logs. Run compilation using the terminal...</span>
      ) : (
        outputLogs.map((log, idx) => {
          if (!log) return null;
          const hasCheck = log.includes("✓");
          const hasLaunch = log.includes("Launching") || log.includes("Running");
          return (
            <div
              key={idx}
              className={
                hasCheck
                  ? (editorTheme === "vs-dark" ? "text-emerald-400" : "text-emerald-600 font-semibold")
                  : hasLaunch
                  ? (editorTheme === "vs-dark" ? "text-indigo-400" : "text-indigo-600 font-semibold")
                  : (editorTheme === "vs-dark" ? "text-slate-300" : "text-slate-700")
              }
            >
              {log}
            </div>
          );
        })
      )}
    </div>
  );
};
export default OutputView;
