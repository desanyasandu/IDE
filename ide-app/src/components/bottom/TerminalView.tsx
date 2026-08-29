import React from "react";
import { ClientOS, EditorTheme, UserRole } from "../../types/ide";
import { getTerminalPrompt } from "../../utils/terminal";

interface TerminalViewProps {
  editorTheme: EditorTheme;
  terminalHistory: string[];
  terminalInput: string;
  setTerminalInput: (val: string) => void;
  setTerminalHistory: React.Dispatch<React.SetStateAction<string[]>>;
  clientOS: ClientOS;
  userRole: UserRole;
  tauriInvokeRef: React.MutableRefObject<any>;
  handleRunCode: () => void;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  editorTheme,
  terminalHistory,
  terminalInput,
  setTerminalInput,
  setTerminalHistory,
  clientOS,
  userRole,
  tauriInvokeRef,
  handleRunCode
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim();
    const prompt = getTerminalPrompt(clientOS);

    if (cmd === "cls" || cmd === "clear") {
      setTerminalHistory([prompt]);
      setTerminalInput("");
      return;
    }

    // Execute Command (Native or Mock)
    const executeTerminalCmd = async () => {
      let reply = "";
      
      if (tauriInvokeRef.current) {
        // Running inside Tauri desktop application - execute actual native shell command!
        try {
          const res = await tauriInvokeRef.current("execute_command", { command: cmd });
          reply = res || "";
        } catch (err: any) {
          reply = err || "Error executing command";
        }
      } else {
        // Running inside regular web browser - fall back to mock environment with OS check
        if (cmd === "npm run dev" || cmd === "npm start" || cmd === "run") {
          handleRunCode();
          setTerminalInput("");
          return;
        } else if (cmd === "git status") {
          reply = "On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges not staged for commit:\n  (use \"git add <file>...\" to update what will be committed)\n  (use \"git restore <file>...\" to discard changes in working directory)\n\tmodified:   src/components/IDELayout.tsx\n\nno changes added to commit (use \"git add\" and/or \"git commit -a\")";
        } else if (cmd.startsWith("help")) {
          reply = "Available commands (Mock): cls, clear, npm run dev, run, git status, help, node -v, echo <text>\n\nNote: To run actual machine shell commands, launch this IDE as a desktop application using Tauri.";
        } else if (cmd === "node -v") {
          reply = "v20.11.0";
        } else if (cmd.startsWith("echo ")) {
          reply = cmd.substring(5);
        } else {
          if (clientOS === "windows") {
            reply = `'${cmd.split(" ")[0]}' is not recognized as an internal or external command,\noperable program or batch file. Type 'help' for commands.`;
          } else {
            reply = `bash: ${cmd.split(" ")[0]}: command not found. Type 'help' for commands.`;
          }
        }
      }

      setTerminalHistory(prev => {
        const hist = [...prev];
        if (hist.length > 0) {
          hist[hist.length - 1] = hist[hist.length - 1] + cmd;
        }
        if (reply) {
          const lines = reply.split("\n");
          hist.push(...lines);
        }
        hist.push(prompt);
        return hist;
      });
      setTerminalInput("");
    };

    executeTerminalCmd();
  };

  return (
    <div className={`h-full flex flex-col ${editorTheme === "vs-dark" ? "text-slate-300" : "text-slate-700"}`}>
      <div className="flex-1 overflow-y-auto mb-1 whitespace-pre-wrap">
        {terminalHistory.map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
      </div>
      {/* Interactive Input Line */}
      <form onSubmit={handleSubmit} className="flex items-center">
        <span className="shrink-0">{getTerminalPrompt(clientOS)}&nbsp;</span>
        <input
          type="text"
          disabled={userRole !== "owner"}
          value={terminalInput}
          onChange={(e) => setTerminalInput(e.target.value)}
          placeholder={userRole !== "owner" ? "Terminal is read-only (Owner only)" : ""}
          className={`flex-1 bg-transparent focus:outline-none border-none outline-none ${
            editorTheme === "vs-dark" ? "text-slate-200 caret-indigo-400" : "text-slate-800 caret-indigo-650"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      </form>
    </div>
  );
};
export default TerminalView;
