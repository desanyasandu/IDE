import React from "react";
import { Plus, Globe, Lock, Edit2, Trash2 } from "lucide-react";
import { EditorTheme } from "../../types/ide";
import { BACKEND_API_URL } from "../../constants/config";

interface RoomsViewProps {
  editorTheme: EditorTheme;
  workspaceId: string;
  roomsHistory: string[];
  handleCreateNewRoom: () => void;
  handleSwitchRoom: (roomId: string) => void;
  handleRenameRoom: (roomId: string) => void;
  updateRoomsHistory: (history: string[]) => void;
}

export const RoomsView: React.FC<RoomsViewProps> = ({
  editorTheme,
  workspaceId,
  roomsHistory,
  handleCreateNewRoom,
  handleSwitchRoom,
  handleRenameRoom,
  updateRoomsHistory
}) => {
  return (
    <div className="flex flex-col h-full text-xs animate-fade-in duration-200">
      <div className={`p-3.5 flex items-center justify-between font-semibold tracking-wider text-[10px] uppercase border-b transition-colors duration-250 ${
        editorTheme === "vs-dark" ? "border-[#25252b] text-slate-400" : "border-[#e5e7eb] text-slate-500"
      }`}>
        <span>Workspaces / Rooms</span>
        <button
          onClick={handleCreateNewRoom}
          className={`p-1 rounded cursor-pointer transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-800/60 text-slate-400 hover:text-white" : "hover:bg-slate-200 text-slate-600 hover:text-slate-900"}`}
          title="Create New Room"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 scrollbar-thin flex flex-col gap-2.5">
        <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest pl-1 mb-1.5 flex items-center justify-between">
          <span>Visited Rooms History</span>
          <span className={`px-2 py-0.5 rounded-full text-[9px] ${editorTheme === "vs-dark" ? "bg-slate-800 text-slate-400" : "bg-slate-200 text-slate-600"}`}>
            {roomsHistory.length}
          </span>
        </div>
        
        {roomsHistory.map((roomId) => {
          const isActive = roomId === workspaceId;
          const roomRoles = JSON.parse(localStorage.getItem('cod-ide-room-roles') || '{}');
          const role = roomRoles[roomId] || "owner";
          const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
          const passcodesMap = JSON.parse(localStorage.getItem('cod-ide-room-passcodes') || '{}');
          const isRoomPrivate = !!passcodesMap[roomId];

          return (
            <div
              key={roomId}
              className={`group flex flex-col p-3 rounded-xl border transition-all duration-250 cursor-pointer ${
                isActive
                  ? (editorTheme === "vs-dark"
                      ? "bg-indigo-950/20 border-indigo-500/50 shadow-md shadow-indigo-950/10"
                      : "bg-indigo-50/60 border-indigo-250 shadow-sm")
                  : (editorTheme === "vs-dark"
                      ? "bg-[#18181c] border-slate-800/80 hover:bg-slate-800/20 hover:border-slate-700/60"
                      : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-350")
              }`}
              onClick={() => handleSwitchRoom(roomId)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isRoomPrivate ? (
                    <Lock className={`w-3.5 h-3.5 ${isActive ? "text-indigo-400" : "text-amber-500"}`} />
                  ) : (
                    <Globe className={`w-3.5 h-3.5 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                  )}
                  <span className={`font-mono font-bold text-xs truncate max-w-[120px] ${isActive ? "text-indigo-400" : (editorTheme === "vs-dark" ? "text-slate-200" : "text-slate-700")}`}>
                    {roomId}
                  </span>
                </div>
                {isActive && (
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${editorTheme === "vs-dark" ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-700"}`}>
                    Active
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                <div className="flex items-center gap-1.5">
                  <span className={`px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider text-[8px] ${
                    role === "owner" 
                      ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                      : role === "editor" 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {roleLabel}
                  </span>
                  {isRoomPrivate && (
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider text-[8px]">
                      Private
                    </span>
                  )}
                </div>

                {/* Actions (like rename, delete from history) */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRenameRoom(roomId);
                    }}
                    className={`p-1 rounded hover:bg-indigo-500/10 text-slate-500 hover:text-indigo-400 transition-colors`}
                    title="Rename room"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  {roomId !== "my-room" && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const confirmDelete = window.confirm(`Delete room "${roomId}"? This will remove it from history and delete all data from the server.`);
                        if (confirmDelete) {
                          // Call backend DELETE to clean up MongoDB + Redis
                          try {
                            const passcodes = JSON.parse(localStorage.getItem('cod-ide-room-passcodes') || '{}');
                            const passcode = passcodes[roomId] || "";
                            const url = new URL(`${BACKEND_API_URL}/workspace/${roomId}`);
                            if (passcode) url.searchParams.set('passcode', passcode);

                            await fetch(url.toString(), {
                              method: "DELETE",
                              headers: { "ngrok-skip-browser-warning": "true" }
                            });

                            // Clean passcode from localStorage
                            if (passcode) {
                              delete passcodes[roomId];
                              localStorage.setItem('cod-ide-room-passcodes', JSON.stringify(passcodes));
                            }
                          } catch (err) {
                            console.warn("Could not delete workspace from backend:", err);
                          }

                          const updatedHistory = roomsHistory.filter(r => r !== roomId);
                          updateRoomsHistory(updatedHistory);
                          
                          const roles = JSON.parse(localStorage.getItem('cod-ide-room-roles') || '{}');
                          delete roles[roomId];
                          localStorage.setItem('cod-ide-room-roles', JSON.stringify(roles));
                          
                          if (isActive) {
                            handleSwitchRoom("my-room");
                          }
                        }
                      }}
                      className={`p-1 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors`}
                      title="Delete room"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default RoomsView;
