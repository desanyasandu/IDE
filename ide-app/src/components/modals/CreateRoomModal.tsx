import React from "react";
import { Plus, X, Globe, Check, Shield, Lock } from "lucide-react";
import { EditorTheme } from "../../types/ide";

interface CreateRoomModalProps {
  showCreateRoomModal: boolean;
  setShowCreateRoomModal: (show: boolean) => void;
  editorTheme: EditorTheme;
  createRoomName: string;
  setCreateRoomName: (name: string) => void;
  createRoomType: "public" | "private";
  setCreateRoomType: (type: "public" | "private") => void;
  handleConfirmCreateRoom: () => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  showCreateRoomModal,
  setShowCreateRoomModal,
  editorTheme,
  createRoomName,
  setCreateRoomName,
  createRoomType,
  setCreateRoomType,
  handleConfirmCreateRoom
}) => {
  if (!showCreateRoomModal) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in duration-300">
      <div className={`w-full max-w-[480px] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform scale-100 ${
        editorTheme === "vs-dark"
          ? "bg-[#15151c]/95 border border-[#2d2d35] text-slate-300"
          : "bg-white border border-slate-200 text-slate-700 shadow-slate-200/50"
      }`}>
        {/* Header */}
        <div className={`px-6 py-5 border-b flex items-center justify-between transition-colors duration-250 ${
          editorTheme === "vs-dark" ? "border-slate-800/80" : "border-slate-100"
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
              <Plus className="w-4.5 h-4.5 text-indigo-400" />
            </div>
            <h2 className={`text-md font-bold tracking-wide ${
              editorTheme === "vs-dark" ? "text-white" : "text-slate-900"
            }`}>
              Create New Workspace
            </h2>
          </div>
          <button
            onClick={() => setShowCreateRoomModal(false)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editorTheme === "vs-dark"
                ? "hover:bg-slate-800 text-slate-500 hover:text-slate-300"
                : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Room Name Input */}
          <div>
            <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-2 ${
              editorTheme === "vs-dark" ? "text-slate-400" : "text-slate-500"
            }`}>
              Workspace Name
            </label>
            <input
              type="text"
              value={createRoomName}
              onChange={(e) => setCreateRoomName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmCreateRoom(); }}
              placeholder="e.g. my-project"
              autoFocus
              className={`w-full px-4 py-3 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                editorTheme === "vs-dark"
                  ? "bg-[#1a1a22] border-slate-800 text-white placeholder-slate-600"
                  : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />
            <p className={`text-[10px] mt-1.5 ${
              editorTheme === "vs-dark" ? "text-slate-600" : "text-slate-400"
            }`}>
              Only letters, numbers, hyphens and underscores allowed.
            </p>
          </div>

          {/* Room Type Selector */}
          <div>
            <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-2.5 ${
              editorTheme === "vs-dark" ? "text-slate-400" : "text-slate-500"
            }`}>
              Visibility
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Public Option */}
              <button
                onClick={() => setCreateRoomType("public")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  createRoomType === "public"
                    ? (editorTheme === "vs-dark"
                        ? "border-indigo-500 bg-indigo-950/30 shadow-md shadow-indigo-950/20"
                        : "border-indigo-500 bg-indigo-50/80 shadow-sm")
                    : (editorTheme === "vs-dark"
                        ? "border-slate-800 bg-[#18181c] hover:border-slate-700 hover:bg-slate-800/30"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50")
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  createRoomType === "public"
                    ? "bg-indigo-500/20"
                    : (editorTheme === "vs-dark" ? "bg-slate-800/60" : "bg-slate-100")
                }`}>
                  <Globe className={`w-5 h-5 ${
                    createRoomType === "public" ? "text-indigo-400" : "text-slate-500"
                  }`} />
                </div>
                <span className={`text-xs font-bold ${
                  createRoomType === "public"
                    ? "text-indigo-400"
                    : (editorTheme === "vs-dark" ? "text-slate-400" : "text-slate-600")
                }`}>
                  Public
                </span>
                <span className={`text-[10px] text-center leading-tight ${
                  editorTheme === "vs-dark" ? "text-slate-600" : "text-slate-400"
                }`}>
                  Anyone with the link can join
                </span>
                {createRoomType === "public" && (
                  <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>

              {/* Private Option */}
              <button
                onClick={() => setCreateRoomType("private")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  createRoomType === "private"
                    ? (editorTheme === "vs-dark"
                        ? "border-amber-500 bg-amber-950/20 shadow-md shadow-amber-950/20"
                        : "border-amber-500 bg-amber-50/80 shadow-sm")
                    : (editorTheme === "vs-dark"
                        ? "border-slate-800 bg-[#18181c] hover:border-slate-700 hover:bg-slate-800/30"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50")
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  createRoomType === "private"
                    ? "bg-amber-500/20"
                    : (editorTheme === "vs-dark" ? "bg-slate-800/60" : "bg-slate-100")
                }`}>
                  <Shield className={`w-5 h-5 ${
                    createRoomType === "private" ? "text-amber-400" : "text-slate-500"
                  }`} />
                </div>
                <span className={`text-xs font-bold ${
                  createRoomType === "private"
                    ? "text-amber-400"
                    : (editorTheme === "vs-dark" ? "text-slate-400" : "text-slate-600")
                }`}>
                  Private
                </span>
                <span className={`text-[10px] text-center leading-tight ${
                  editorTheme === "vs-dark" ? "text-slate-600" : "text-slate-400"
                }`}>
                  Passcode required to access
                </span>
                {createRoomType === "private" && (
                  <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-end gap-3 ${
          editorTheme === "vs-dark" ? "border-slate-800/80" : "border-slate-100"
        }`}>
          <button
            onClick={() => setShowCreateRoomModal(false)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              editorTheme === "vs-dark"
                ? "text-slate-400 hover:text-white hover:bg-slate-800"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmCreateRoom}
            disabled={!createRoomName.trim()}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2 ${
              !createRoomName.trim()
                ? "bg-slate-700 text-slate-500 cursor-not-allowed shadow-none"
                : createRoomType === "private"
                  ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]"
            }`}
          >
            {createRoomType === "private" ? (
              <Lock className="w-3.5 h-3.5" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            Create {createRoomType === "private" ? "Private" : "Public"} Room
          </button>
        </div>
      </div>
    </div>
  );
};
export default CreateRoomModal;
