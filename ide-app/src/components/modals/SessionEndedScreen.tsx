import React from "react";
import { PhoneOff } from "lucide-react";
import { EditorTheme } from "../../types/ide";

interface SessionEndedScreenProps {
  sessionEnded: boolean;
  setSessionEnded: (ended: boolean) => void;
  editorTheme: EditorTheme;
  workspaceId: string;
  setIsCallActive: (active: boolean) => void;
  setIsCallPanelOpen: (open: boolean) => void;
  handleSwitchRoom: (room: string) => void;
}

export const SessionEndedScreen: React.FC<SessionEndedScreenProps> = ({
  sessionEnded,
  setSessionEnded,
  editorTheme,
  workspaceId,
  setIsCallActive,
  setIsCallPanelOpen,
  handleSwitchRoom
}) => {
  if (!sessionEnded) return null;

  return (
    <div className={`fixed inset-0 z-[150] flex flex-col items-center justify-center p-6 transition-colors duration-500 ${
      editorTheme === "vs-dark" ? "bg-[#0d0d11]" : "bg-slate-50"
    }`}>
      {/* Background radial glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[20%] w-[70%] h-[70%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute -bottom-[30%] -right-[20%] w-[70%] h-[70%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className={`w-full max-w-[500px] p-8 rounded-3xl border text-center shadow-2xl flex flex-col gap-6 backdrop-blur-md transition-all duration-500 transform scale-100 ${
        editorTheme === "vs-dark"
          ? "bg-[#15151c]/80 border-slate-800/80 text-slate-300"
          : "bg-white/90 border-slate-200 text-slate-700 shadow-slate-200/50"
      }`}>
        <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-2 animate-pulse">
          <PhoneOff className="w-9 h-9" />
        </div>

        <h1 className={`text-2xl font-bold tracking-tight transition-colors duration-250 ${
          editorTheme === "vs-dark" ? "text-white" : "text-slate-800"
        }`}>
          Session Ended Successfully
        </h1>

        <p className="text-sm text-slate-500 leading-relaxed">
          You have disconnected from the workspace call. The active collaborative editing session has been closed on your end.
        </p>

        <div className={`py-3 px-4 rounded-2xl font-mono text-xs border transition-colors ${
          editorTheme === "vs-dark" 
            ? "bg-slate-900/50 border-slate-800 text-indigo-400" 
            : "bg-slate-50 border-slate-150 text-indigo-600"
        }`}>
          Workspace: <span className="font-bold">{workspaceId}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-2">
          <button
            onClick={() => {
              setSessionEnded(false);
              setIsCallActive(true);
              setIsCallPanelOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl text-sm font-semibold transition-all shadow-md shadow-indigo-900/30 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] cursor-pointer flex items-center justify-center gap-1.5"
          >
            <PhoneOff className="w-4 h-4 rotate-[135deg]" />
            Reconnect to Call
          </button>
          <button
            onClick={() => {
              setSessionEnded(false);
              handleSwitchRoom("my-room");
            }}
            className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all border cursor-pointer ${
              editorTheme === "vs-dark"
                ? "border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white"
                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900"
            }`}
          >
            Go to Personal Workspace
          </button>
        </div>
      </div>
    </div>
  );
};
export default SessionEndedScreen;
