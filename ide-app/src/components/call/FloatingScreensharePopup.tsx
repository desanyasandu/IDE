import React from "react";
import { Maximize2, Minimize2, X } from "lucide-react";
import { Collaborator, EditorTheme } from "../../types/ide";

interface FloatingScreensharePopupProps {
  remoteScreenStreams: Record<string, MediaStream>;
  poppedOutScreens: Record<string, boolean>;
  activeCollaborators: Collaborator[];
  popupPositions: Record<string, { x: number; y: number }>;
  maximizedPopups: Record<string, boolean>;
  editorTheme: EditorTheme;
  handlePopupMouseDown: (collabId: string, e: React.MouseEvent) => void;
  setMaximizedPopups: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  togglePopOut: (collabId: string) => void;
  setRemoteScreenStreams: React.Dispatch<React.SetStateAction<Record<string, MediaStream>>>;
}

export const FloatingScreensharePopup: React.FC<FloatingScreensharePopupProps> = ({
  remoteScreenStreams,
  poppedOutScreens,
  activeCollaborators,
  popupPositions,
  maximizedPopups,
  editorTheme,
  handlePopupMouseDown,
  setMaximizedPopups,
  togglePopOut,
  setRemoteScreenStreams
}) => {
  return (
    <>
      {Object.entries(remoteScreenStreams).filter(([cid]) => poppedOutScreens[cid]).map(([collabId, stream]) => {
        const sharingCollab = activeCollaborators.find(c => (c.id || "").toString() === collabId);
        const pos = popupPositions[collabId] || { x: 80, y: 80 };
        const isMax = !!maximizedPopups[collabId];
        return (
          <div
            key={collabId}
            className={`fixed z-[200] rounded-2xl shadow-2xl border flex flex-col overflow-hidden ${
              editorTheme === "vs-dark"
                ? "bg-[#0e0e12] border-slate-700/70 shadow-black/70"
                : "bg-slate-900 border-slate-600 shadow-slate-900/60"
            }`}
            style={isMax
              ? { top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', borderRadius: 0 }
              : { top: pos.y, left: pos.x, width: 640, minHeight: 420, resize: 'both', overflow: 'hidden' }
            }
          >
            {/* Popup title bar — draggable */}
            <div
              className="px-3 py-2 flex items-center justify-between bg-[#141419] border-b border-slate-800/80 cursor-move select-none shrink-0"
              onMouseDown={isMax ? undefined : (e) => handlePopupMouseDown(collabId, e)}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-[11px] font-semibold text-slate-200">
                  {sharingCollab ? sharingCollab.name : `User-${collabId}`}&nbsp;— Screen Share
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMaximizedPopups(prev => ({ ...prev, [collabId]: !isMax }))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors cursor-pointer"
                  title={isMax ? "Restore" : "Maximize"}
                >
                  {isMax ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => togglePopOut(collabId)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-700/50 transition-colors cursor-pointer"
                  title="Dock back to panel"
                >
                  <Minimize2 className="w-3.5 h-3.5 rotate-90" />
                </button>
                <button
                  onClick={() => setRemoteScreenStreams(prev => { const n = { ...prev }; delete n[collabId]; return n; })}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700/50 transition-colors cursor-pointer"
                  title="Close stream"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {/* Video area */}
            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
              <video
                ref={(el) => { if (el && el.srcObject !== stream) { el.srcObject = stream; el.play().catch(() => {}); } }}
                autoPlay playsInline
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        );
      })}
    </>
  );
};
export default FloatingScreensharePopup;
