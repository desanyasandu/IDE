import React from "react";
import { User, Bot, Copy, CheckCheck } from "lucide-react";
import { ChatMessage, EditorTheme } from "../../types/ide";

interface ChatMessageBubbleProps {
  msg: ChatMessage;
  editorTheme: EditorTheme;
  copiedCodeId: string | null;
  handleCopyCode: (code: string, id: string) => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  msg,
  editorTheme,
  copiedCodeId,
  handleCopyCode
}) => {
  return (
    <div
      className={`flex gap-3 max-w-[90%] animate-slide-up ${
        msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
      }`}
    >
      {/* Sender Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-md transition-all ${
        msg.sender === "user"
          ? "bg-slate-800/80 border-slate-700/50 text-slate-300"
          : "bg-purple-950/60 border-purple-800/50 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.1)]"
      }`}>
        {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4.5 h-4.5" />}
      </div>

      {/* Message Bubble */}
      <div className="flex flex-col gap-1.5 max-w-full">
        <div className={`p-4 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap shadow-lg transition-colors duration-250 ${
          msg.sender === "user"
            ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-none shadow-[0_4px_12px_rgba(124,58,237,0.2)]"
            : (editorTheme === "vs-dark"
                ? "bg-[#181822]/70 text-slate-200 border border-[#2d2d3c] rounded-tl-none"
                : "bg-white text-slate-700 border border-slate-200/80 rounded-tl-none shadow-[0_4px_12px_rgba(0,0,0,0.02)]")
        }`}>
          {/* Render Code Formatting in Chat Messages */}
          {msg.text.includes("```") ? (
            msg.text.split("```").map((block, idx) => {
              if (idx % 2 === 1) {
                // Code block
                const codeLines = block.split("\n");
                const lang = codeLines[0].trim();
                const actualCode = codeLines.slice(1).join("\n");
                const copyId = `${msg.id}-${idx}`;
                return (
                  <div key={idx} className={`my-3 border rounded-xl overflow-hidden font-mono text-[12px] shadow-lg transition-colors duration-250 ${
                    editorTheme === "vs-dark" ? "border-[#252533] bg-[#07070a] text-slate-300" : "border-slate-200 bg-[#f8fafc] text-slate-700"
                  }`}>
                    <div className={`px-3.5 py-1.5 text-[10px] font-bold flex justify-between items-center select-none border-b transition-colors duration-250 ${
                      editorTheme === "vs-dark" ? "bg-[#0b0b10] text-slate-500 border-[#1d1d28]" : "bg-[#f1f5f9] text-slate-500 border-slate-200"
                    }`}>
                      <span className="uppercase tracking-wider font-semibold">{lang || "code"}</span>
                      <button
                        onClick={() => handleCopyCode(actualCode, copyId)}
                        type="button"
                        className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 ${
                          editorTheme === "vs-dark" ? "hover:text-white hover:bg-slate-800/80 text-slate-400" : "hover:text-slate-900 hover:bg-slate-200 text-slate-500"
                        }`}
                        title="Copy Code"
                      >
                        {copiedCodeId === copyId ? (
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedCodeId === copyId ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>
                    <pre className="p-3.5 overflow-x-auto select-text scrollbar-thin"><code>{actualCode}</code></pre>
                  </div>
                );
              }
              // Text block
              return <span key={idx}>{block}</span>;
            })
          ) : (
            msg.text
          )}
        </div>
        <span className="text-[9px] text-slate-500 self-end px-1.5">{msg.timestamp}</span>
      </div>
    </div>
  );
};
export default ChatMessageBubble;
