import React from "react";
import { Sparkles, Bot, X, Mic, MicOff, Send } from "lucide-react";
import { ChatMessage, EditorTheme } from "../../types/ide";
import ChatMessageBubble from "./ChatMessageBubble";

interface AIChatSidebarProps {
  rightSidebarOpen: boolean;
  setRightSidebarOpen: (open: boolean) => void;
  rightSidebarWidth: number;
  isResizingRight: boolean;
  startResizingRight: (mouseDownEvent: React.MouseEvent) => void;
  editorTheme: EditorTheme;
  aiStatus: "idle" | "thinking" | "typing";
  messages: ChatMessage[];
  streamingMessage: string;
  copiedCodeId: string | null;
  handleCopyCode: (code: string, id: string) => void;
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  isListening: boolean;
  handleVoiceInputToggle: () => void;
  stopListening: () => void;
  handleSendMessage: (e: React.FormEvent) => void;
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  messageInputRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const AIChatSidebar: React.FC<AIChatSidebarProps> = ({
  rightSidebarOpen,
  setRightSidebarOpen,
  rightSidebarWidth,
  isResizingRight,
  startResizingRight,
  editorTheme,
  aiStatus,
  messages,
  streamingMessage,
  copiedCodeId,
  handleCopyCode,
  inputMessage,
  setInputMessage,
  isListening,
  handleVoiceInputToggle,
  stopListening,
  handleSendMessage,
  chatContainerRef,
  chatEndRef,
  messageInputRef
}) => {
  return (
    <>
      {/* Right Sidebar drag divider */}
      {rightSidebarOpen && (
        <div
          onMouseDown={startResizingRight}
          className="w-1 hover:w-1.5 bg-transparent hover:bg-purple-500/50 active:bg-purple-500 transition-all cursor-col-resize z-30 shrink-0"
          title="Resize AI Panel"
        />
      )}

      {/* Right Collapsible Sidebar (AI Chat Interface) */}
      <div
        className={`flex flex-col overflow-hidden relative z-10 gpu-layer border-l transition-all duration-300 ease-in-out ${
          editorTheme === "vs-dark"
            ? "bg-[#0b0b0f]/95 backdrop-blur-xl border-[#1d1d24] shadow-[-10px_0_30px_rgba(0,0,0,0.5)]"
            : "bg-[#ffffff]/95 backdrop-blur-xl border-[#e2e8f0] shadow-[-10px_0_30px_rgba(0,0,0,0.03)]"
        }`}
        style={{
          width: rightSidebarOpen ? `${rightSidebarWidth}px` : 0,
          transition: isResizingRight ? 'none' : 'width 300ms ease-out'
        }}
      >
        {/* Header with gradient flow */}
        <div className={`p-4 flex items-center justify-between border-b transition-colors duration-250 ${
          editorTheme === "vs-dark"
            ? "bg-gradient-to-r from-[#111116] via-[#161622] to-[#0e0e12] border-[#1e1e26]"
            : "bg-gradient-to-r from-[#fcfdfd] via-[#f8fafc] to-[#fcfdfd] border-[#e2e8f0]"
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 shadow-[0_0_16px_rgba(168,85,247,0.3)] ai-header-badge cursor-pointer">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-500 block">System AI</span>
              <span className={`text-[14px] font-bold block -mt-0.5 transition-colors duration-250 ${editorTheme === "vs-dark" ? "text-slate-100" : "text-slate-800"}`}>Coding Assistant</span>
            </div>
          </div>

          <button
            onClick={() => setRightSidebarOpen(false)}
            className={`p-1.5 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              editorTheme === "vs-dark" ? "hover:bg-slate-800/60 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"
            }`}
            title="Close Copilot Panel"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* AI Status Indicator Bar */}
        <div className={`px-4 py-2 flex items-center justify-between text-xs border-b transition-colors duration-250 ${
          editorTheme === "vs-dark"
            ? "border-[#1c1c22] bg-[#07070a]/60 text-slate-400"
            : "border-[#e2e8f0] bg-[#f8fafc] text-slate-500"
        }`}>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {aiStatus !== "idle" && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  aiStatus === "thinking" ? "bg-amber-400" : "bg-cyan-400"
                }`}></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                aiStatus === "idle"
                  ? "bg-emerald-500"
                  : aiStatus === "thinking"
                  ? "bg-amber-400"
                  : "bg-cyan-400"
              }`}></span>
            </span>
            <span className={`font-semibold ${editorTheme === "vs-dark" ? "text-slate-300" : "text-slate-700"}`}>
              Copilot:{" "}
              <span className={`font-bold uppercase tracking-wide text-[9px] px-1.5 py-0.5 rounded border ${
                aiStatus === "thinking"
                  ? (editorTheme === "vs-dark" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" : "text-amber-600 bg-amber-50 border-amber-200")
                  : aiStatus === "typing"
                  ? (editorTheme === "vs-dark" ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/20 animate-pulse" : "text-cyan-600 bg-cyan-50 border-cyan-200 animate-pulse")
                  : (editorTheme === "vs-dark" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-emerald-600 bg-emerald-50 border-emerald-250")
              }`}>
                {aiStatus === "idle" ? "Ready" : aiStatus}
              </span>
            </span>
          </div>
          {aiStatus !== "idle" && (
            <span className="text-[10px] text-slate-500 font-mono animate-pulse">
              {aiStatus === "thinking" ? "synching references..." : "streaming code..."}
            </span>
          )}
        </div>

        {/* Chat Timeline (Scrollable Messages Area) */}
        <div 
          ref={chatContainerRef} 
          className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin"
        >
          {messages.map((msg) => (
            <ChatMessageBubble
              key={msg.id}
              msg={msg}
              editorTheme={editorTheme}
              copiedCodeId={copiedCodeId}
              handleCopyCode={handleCopyCode}
            />
          ))}

          {/* Streaming Typing Indicator Message */}
          {aiStatus === "typing" && streamingMessage && (
            <div className="flex gap-3 max-w-[90%] mr-auto animate-slide-up">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-md ${
                editorTheme === "vs-dark" ? "bg-purple-950/60 border-purple-800/50 text-purple-400 animate-pulse-glow-purple" : "bg-purple-50 border-purple-250 text-purple-600"
              }`}>
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="flex flex-col gap-1.5 max-w-full">
                <div className={`p-4 rounded-2xl leading-relaxed whitespace-pre-wrap shadow-lg transition-colors duration-250 ${
                  editorTheme === "vs-dark"
                    ? "bg-[#181822]/70 text-slate-200 border border-[#2d2d3c] rounded-tl-none"
                    : "bg-white text-slate-700 border border-slate-200/80 rounded-tl-none"
                }`}>
                  {streamingMessage.includes("```") ? (
                    streamingMessage.split("```").map((block, idx) => {
                      if (idx % 2 === 1) {
                        const codeLines = block.split("\n");
                        const lang = codeLines[0].trim();
                        const actualCode = codeLines.slice(1).join("\n");
                        return (
                          <div key={idx} className={`my-3 border rounded-xl overflow-hidden font-mono text-[11px] shadow-lg transition-colors duration-250 ${
                            editorTheme === "vs-dark" ? "border-[#252533] bg-[#07070a] text-slate-300" : "border-slate-200 bg-[#f8fafc] text-slate-700"
                          }`}>
                            <div className={`px-3.5 py-1.5 text-[9px] font-bold flex justify-between items-center select-none border-b transition-colors duration-250 ${
                              editorTheme === "vs-dark" ? "bg-[#0b0b10] text-slate-500 border-[#1d1d28]" : "bg-[#f1f5f9] text-slate-500 border-slate-200"
                            }`}>
                              <span className="uppercase tracking-wider font-semibold">{lang || "code"}</span>
                            </div>
                            <pre className="p-3.5 overflow-x-auto scrollbar-thin"><code>{actualCode}</code></pre>
                          </div>
                        );
                      }
                      return <span key={idx}>{block}</span>;
                    })
                  ) : (
                    streamingMessage
                  )}
                  <span className="inline-block w-1.5 h-3.5 ml-1 bg-purple-500 animate-pulse rounded-sm align-middle"></span>
                </div>
              </div>
            </div>
          )}

          {/* Thinking Indicator Animation */}
          {aiStatus === "thinking" && (
            <div className="flex gap-3 max-w-[90%] mr-auto items-start animate-slide-up">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-md ${
                editorTheme === "vs-dark" ? "bg-purple-950/60 border-purple-800/50 text-purple-400 animate-pulse-glow-purple" : "bg-purple-50 border-purple-250 text-purple-600"
              }`}>
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className={`border p-4.5 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-lg transition-colors duration-250 ${
                editorTheme === "vs-dark" ? "bg-[#181822]/70 border-[#2d2d3c]" : "bg-white border-slate-200/80"
              }`}>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce-typing" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce-typing" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce-typing" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <form
          onSubmit={(e) => {
            stopListening();
            handleSendMessage(e);
          }}
          className={`p-4 flex flex-col gap-2.5 shrink-0 border-t transition-colors duration-250 ${
            editorTheme === "vs-dark" ? "bg-[#0b0b0f] border-[#1c1c22]" : "bg-white border-[#e2e8f0]"
          }`}
        >
          <div className={`relative flex items-end rounded-2xl p-2.5 transition-all duration-300 border focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)] focus-within:scale-[1.01] ${
            editorTheme === "vs-dark"
              ? "bg-[#09090d] border-[#252533] focus-within:border-purple-500/60 focus-within:ring-1 focus-within:ring-purple-500/40"
              : "bg-[#f8fafc] border border-slate-200 focus-within:bg-white focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500/40"
          }`}>
            <textarea
              ref={messageInputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  stopListening();
                  handleSendMessage(e);
                }
              }}
              disabled={aiStatus !== "idle"}
              placeholder="Ask Copilot to write, change, or review..."
              className={`flex-1 max-h-24 min-h-[44px] resize-none bg-transparent text-sm placeholder-slate-500 self-center focus:outline-none scrollbar-none py-1 pl-1 ${
                editorTheme === "vs-dark" ? "text-white" : "text-slate-800"
              }`}
              rows={1}
            />
            <button
              type="button"
              onClick={handleVoiceInputToggle}
              disabled={aiStatus !== "idle"}
              className={`p-2 rounded-xl transition-all self-center hover-scale shrink-0 cursor-pointer mr-1.5 ${
                isListening
                  ? "bg-red-600/20 text-red-400 border border-red-500/30 animate-pulse"
                  : (editorTheme === "vs-dark" ? "text-slate-400 hover:text-white hover:bg-slate-800/40" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50")
              }`}
              title={isListening ? "Listening... Click to stop" : "Voice input"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              type="submit"
              disabled={!inputMessage.trim() || aiStatus !== "idle"}
              className={`p-2 rounded-xl transition-all self-center hover-scale shrink-0 cursor-pointer ${
                inputMessage.trim() && aiStatus === "idle"
                  ? "bg-purple-600 text-white hover:bg-purple-500 shadow-md shadow-purple-950/20"
                  : (editorTheme === "vs-dark" ? "text-slate-600 bg-[#1e1e23]/30 cursor-not-allowed border border-transparent" : "text-slate-400 bg-slate-200/50 cursor-not-allowed border border-transparent")
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <span className="text-[9px] text-slate-600 text-center select-none">
            AI Copilot can make mistakes. Verify critical code details.
          </span>
        </form>
      </div>
    </>
  );
};
export default AIChatSidebar;
