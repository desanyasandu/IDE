import React from "react";
import {
  X,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  ExternalLink,
  MonitorUp,
  PhoneOff
} from "lucide-react";
import { Collaborator, EditorTheme } from "../../types/ide";

interface CallPanelProps {
  isCallActive: boolean;
  isCallPanelOpen: boolean;
  setIsCallPanelOpen: (open: boolean) => void;
  editorTheme: EditorTheme;
  callPanelPos: { x: number; y: number };
  handleMouseDown: (e: React.MouseEvent) => void;
  activeCollaborators: (Collaborator & { isMe?: boolean })[];
  speakingUsers: Record<string, boolean>;
  isMuted: boolean;
  setIsMuted: (muted: boolean | ((prev: boolean) => boolean)) => void;
  isDeafened: boolean;
  setIsDeafened: (deafened: boolean | ((prev: boolean) => boolean)) => void;
  isSharingScreen: boolean;
  setIsSharingScreen: (sharing: boolean | ((prev: boolean) => boolean)) => void;
  isEditingName: boolean;
  setIsEditingName: (editing: boolean) => void;
  userNameInput: string;
  setUserNameInput: (name: string) => void;
  handleSaveName: () => void;
  remoteScreenStreams: Record<string, MediaStream>;
  poppedOutScreens: Record<string, boolean>;
  togglePopOut: (collabId: string) => void;
  setRemoteScreenStreams: React.Dispatch<React.SetStateAction<Record<string, MediaStream>>>;
  handleExitCallWithAnimation: () => void;
}

export const CallPanel: React.FC<CallPanelProps> = ({
  isCallActive,
  isCallPanelOpen,
  setIsCallPanelOpen,
  editorTheme,
  callPanelPos,
  handleMouseDown,
  activeCollaborators,
  speakingUsers,
  isMuted,
  setIsMuted,
  isDeafened,
  setIsDeafened,
  isSharingScreen,
  setIsSharingScreen,
  isEditingName,
  setIsEditingName,
  userNameInput,
  setUserNameInput,
  handleSaveName,
  remoteScreenStreams,
  poppedOutScreens,
  togglePopOut,
  setRemoteScreenStreams,
  handleExitCallWithAnimation
}) => {
  if (!isCallActive || !isCallPanelOpen) return null;

  return (
    <div
      className={`absolute w-72 backdrop-blur-xl border rounded-2xl shadow-2xl z-40 overflow-hidden flex flex-col animate-slide-up ${
        editorTheme === "vs-dark" 
          ? "bg-[#141419]/95 border-slate-700/50 shadow-black/60 text-white" 
          : "bg-white/95 border-slate-200 shadow-slate-200/50 text-slate-800"
      }`}
      style={{
        top: `${24 + callPanelPos.y}px`,
        right: `${24 - callPanelPos.x}px`
      }}
    >
      {/* Call Header */}
      <div
        className={`px-4 py-2.5 border-b flex items-center justify-between cursor-move select-none ${
          editorTheme === "vs-dark" ? "bg-[#1b1b22] border-slate-800/80" : "bg-slate-50 border-slate-200"
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className={`text-[11px] font-bold tracking-wider uppercase ${
            editorTheme === "vs-dark" ? "text-slate-300" : "text-slate-600"
          }`}>Collab Session</span>
        </div>
        <button
          onClick={() => setIsCallPanelOpen(false)}
          className={`p-1 rounded-lg transition-colors cursor-pointer ${
            editorTheme === "vs-dark" ? "text-slate-400 hover:text-white hover:bg-slate-800/50" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
          }`}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Call Video/Avatars Grid */}
      <div className={`p-4 grid grid-cols-2 gap-3 ${
        editorTheme === "vs-dark" ? "bg-[#0d0d10]/40" : "bg-slate-50/50"
      }`}>
        {activeCollaborators.map((collab) => (
          <div 
            key={collab.id || collab.name} 
            className={`relative aspect-square rounded-xl overflow-hidden border-2 flex flex-col items-center justify-center group transition-all duration-300 ${
              editorTheme === "vs-dark" ? "bg-slate-800/50" : "bg-slate-100 border-slate-200"
            } ${
              speakingUsers[(collab.id || "").toString()]
                ? "ring-2 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.55)] scale-[1.03] border-emerald-500"
                : (collab.isMe 
                    ? (isMuted ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]" : "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]") 
                    : "border-slate-700/50")
            }`}
          >
            <img src={collab.avatar} className="w-14 h-14 rounded-full" alt={collab.name} />
            <div className="absolute bottom-1.5 left-2 right-2 bg-black/60 backdrop-blur-md rounded-md px-1.5 py-0.5 flex items-center justify-between">
              {collab.isMe && isEditingName ? (
                <input
                  type="text"
                  value={userNameInput}
                  onChange={(e) => setUserNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") setIsEditingName(false);
                  }}
                  onBlur={handleSaveName}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  className="bg-slate-800 text-white text-[9px] px-1 py-0.5 rounded outline-none border border-indigo-500 w-20"
                />
              ) : (
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (collab.isMe) {
                      setUserNameInput(collab.name);
                      setIsEditingName(true);
                    }
                  }}
                  className={`text-[9px] font-medium text-white truncate cursor-pointer ${collab.isMe ? "hover:underline hover:text-indigo-300" : ""}`}
                  title={collab.isMe ? "Click to change name" : undefined}
                >
                  {collab.name} {collab.isMe && "(You)"}
                </span>
              )}
              {collab.isMe ? (
                isMuted ? <MicOff className="w-2.5 h-2.5 text-red-400" /> : <Mic className="w-2.5 h-2.5 text-emerald-400" />
              ) : (
                <Mic className="w-2.5 h-2.5 text-emerald-400" />
              )}
            </div>
          </div>
        ))}
        {/* AI Agent Avatar */}
        <div className={`relative aspect-square rounded-xl overflow-hidden border-2 flex flex-col items-center justify-center group col-span-2 h-28 ${
          editorTheme === "vs-dark" 
            ? "bg-purple-950/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]" 
            : "bg-purple-50 border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.08)]"
        }`}>
          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center border-2 border-purple-400/50 animate-pulse-glow-purple">
             <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="absolute bottom-2 left-3 right-3 bg-black/60 backdrop-blur-md rounded-lg px-2 py-1 flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-300">Agent Alpha</span>
            <Volume2 className="w-3 h-3 text-emerald-400 animate-pulse" />
          </div>
          {/* Audio wave mock */}
          {!isDeafened && (
            <div className="absolute top-3 right-3 flex gap-0.5">
              <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: "0ms"}}></span>
              <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: "100ms"}}></span>
              <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: "200ms"}}></span>
            </div>
          )}
        </div>
      </div>

      {/* ── Active Screen Share Tiles ── */}
      {Object.entries(remoteScreenStreams).filter(([cid]) => !poppedOutScreens[cid]).map(([collabId, stream]) => {
        const sharingCollab = activeCollaborators.find(c => (c.id || "").toString() === collabId);
        return (
          <div key={collabId} className={`mx-3 mb-3 rounded-xl overflow-hidden border flex flex-col ${
            editorTheme === "vs-dark" ? "bg-black border-slate-700/60" : "bg-slate-900 border-slate-600"
          }`}>
            {/* Tile header */}
            <div className={`px-2.5 py-1.5 flex items-center justify-between ${
              editorTheme === "vs-dark" ? "bg-[#1b1b22] border-b border-slate-800" : "bg-slate-800 border-b border-slate-700"
            }`}>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-[10px] font-semibold text-slate-300 truncate max-w-[120px]">
                  {sharingCollab ? sharingCollab.name : `User-${collabId}`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => togglePopOut(collabId)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
                  title="Pop out"
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setRemoteScreenStreams(prev => { const n = { ...prev }; delete n[collabId]; return n; })}
                  className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-700/60 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
            {/* Video */}
            <div className="bg-black flex items-center justify-center" style={{ minHeight: '120px' }}>
              <video
                ref={(el) => { if (el && el.srcObject !== stream) { el.srcObject = stream; el.play().catch(() => {}); } }}
                autoPlay playsInline
                className="w-full object-contain"
                style={{ maxHeight: '160px' }}
              />
            </div>
          </div>
        );
      })}

      {/* Call Controls */}
      <div className={`p-3 flex justify-center gap-3 border-t ${
        editorTheme === "vs-dark" ? "bg-[#1b1b22] border-slate-800/80" : "bg-slate-50 border-slate-200"
      }`}>
        <button
          onClick={() => setIsMuted(prev => !prev)}
          className={`p-2.5 rounded-full transition-colors cursor-pointer ${
            isMuted ? "bg-red-600 hover:bg-red-500 text-white" : (editorTheme === "vs-dark" ? "bg-slate-700/50 hover:bg-slate-600 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-700")
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
        </button>
        <button
          onClick={() => setIsDeafened(prev => !prev)}
          className={`p-2.5 rounded-full transition-colors cursor-pointer ${
            isDeafened ? "bg-red-600 hover:bg-red-500 text-white" : (editorTheme === "vs-dark" ? "bg-slate-700/50 hover:bg-slate-600 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-700")
          }`}
          title={isDeafened ? "Undeafen" : "Deafen"}
        >
          {isDeafened ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
        </button>
        <button
          onClick={() => setIsSharingScreen(prev => !prev)}
          className={`p-2.5 rounded-full transition-colors cursor-pointer ${
            isSharingScreen 
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40" 
              : (editorTheme === "vs-dark" ? "bg-slate-700/50 hover:bg-slate-600 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-700")
          }`}
          title={isSharingScreen ? "Stop Sharing Screen" : "Share Screen"}
        >
          <MonitorUp className="w-4.5 h-4.5" />
        </button>
        <button
          onClick={handleExitCallWithAnimation}
          className="p-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40 transition-colors cursor-pointer"
          title="Disconnect"
        >
          <PhoneOff className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
};
export default CallPanel;
