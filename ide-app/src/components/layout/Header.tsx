import React from "react";
import {
  Terminal,
  Plus,
  UserPlus,
  Sun,
  Moon,
  TerminalSquare,
  Bot
} from "lucide-react";
import { EditorTheme, MenuItem, UserRole } from "../../types/ide";

interface HeaderProps {
  editorTheme: EditorTheme;
  setEditorTheme: React.Dispatch<React.SetStateAction<EditorTheme>>;
  activeMenu: string | null;
  setActiveMenu: (menu: string | null) => void;
  IDE_MENUS: Record<string, MenuItem[]>;
  userRole: UserRole;
  handleCreateNewRoom: () => void;
  setIsShareModalOpen: (open: boolean) => void;
  bottomPanelOpen: boolean;
  setBottomPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  rightSidebarOpen: boolean;
  setRightSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Header: React.FC<HeaderProps> = ({
  editorTheme,
  setEditorTheme,
  activeMenu,
  setActiveMenu,
  IDE_MENUS,
  userRole,
  handleCreateNewRoom,
  setIsShareModalOpen,
  bottomPanelOpen,
  setBottomPanelOpen,
  rightSidebarOpen,
  setRightSidebarOpen
}) => {
  return (
    <header className={`h-11 flex items-center justify-between px-4 text-xs font-medium z-30 border-b transition-colors duration-250 ${
      editorTheme === "vs-dark"
        ? "bg-[#1a1a1f] border-[#25252b] text-slate-400"
        : "bg-[#ffffff] border-[#e5e7eb] text-slate-600 shadow-sm"
    }`}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 ml-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className={`font-semibold tracking-wide font-mono transition-colors duration-250 ${editorTheme === "vs-dark" ? "text-slate-300" : "text-slate-700"}`}>COD CODE</span>
        </div>

        {/* Main Menu Bar */}
        <div className={`hidden lg:flex items-center text-[11px] font-medium transition-colors duration-250 relative ${
          editorTheme === "vs-dark" ? "text-slate-400" : "text-slate-600"
        }`}>
          {Object.keys(IDE_MENUS).map((menuName) => (
            <div key={menuName} className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === menuName ? null : menuName)}
                onMouseEnter={() => { if (activeMenu && activeMenu !== menuName) setActiveMenu(menuName); }}
                className={`px-2 py-1 rounded transition-colors cursor-pointer relative z-50 ${
                  activeMenu === menuName
                    ? (editorTheme === "vs-dark" ? "bg-[#25252b] text-slate-100" : "bg-slate-200 text-slate-900")
                    : (editorTheme === "vs-dark" ? "hover:bg-slate-800/60 hover:text-slate-200" : "hover:bg-slate-200/60 hover:text-slate-900")
                }`}
              >
                {menuName}
              </button>

              {/* Dropdown Menu */}
              {activeMenu === menuName && (
                <div className={`absolute top-full left-0 mt-0.5 min-w-[240px] rounded-lg shadow-2xl border z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100 ${
                  editorTheme === "vs-dark" ? "bg-[#1e1e24] border-slate-700/80 text-slate-300 shadow-[0_8px_30px_rgba(0,0,0,0.6)]" : "bg-white border-slate-200 text-slate-700 shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
                }`}>
                  {IDE_MENUS[menuName].map((item, idx) =>
                    item.divider ? (
                      <hr key={idx} className={`my-1.5 border-t ${editorTheme === "vs-dark" ? "border-slate-700/60" : "border-slate-100"}`} />
                    ) : (
                      <button
                        key={idx}
                        onClick={() => {
                          if (item.action) item.action();
                          setActiveMenu(null);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-1.5 text-xs transition-colors cursor-pointer text-left ${
                          editorTheme === "vs-dark" ? "hover:bg-indigo-600 hover:text-white" : "hover:bg-indigo-50 hover:text-indigo-600"
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.shortcut && <span className={`text-[10px] opacity-60 ml-6 font-sans tracking-wide`}>{item.shortcut}</span>}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Click Away Overlay for Menus */}
        {activeMenu && (
          <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)}></div>
        )}
      </div>

      {/* Multiplayer Avatars & Share */}
      <div className="flex items-center ml-auto mr-4 gap-3">
        <div className="flex -space-x-2">
          <img className="w-7 h-7 rounded-full border border-[#1a1a1f] bg-indigo-500 hover:z-10 hover:scale-110 transition-transform cursor-pointer" src="https://api.dicebear.com/7.x/initials/svg?seed=Alex" alt="Alex" title="Alex is editing IDELayout.tsx" />
          <img className="w-7 h-7 rounded-full border border-[#1a1a1f] bg-emerald-500 hover:z-10 hover:scale-110 transition-transform cursor-pointer" src="https://api.dicebear.com/7.x/initials/svg?seed=Sam" alt="Sam" title="Sam is editing App.css" />
          <div className="w-7 h-7 rounded-full border-2 border-purple-500/80 bg-purple-950 flex items-center justify-center text-[10px] font-bold text-purple-300 z-10 shadow-[0_0_8px_rgba(168,85,247,0.4)]" title="AI Agent is active">AI</div>
        </div>
        {userRole === "owner" && (
          <button
            onClick={handleCreateNewRoom}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border border-slate-700 cursor-pointer hover:border-slate-600 shadow-sm"
            title="Create New Workspace Room"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>New Room</span>
          </button>
        )}
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg text-[11px] font-bold transition-all shadow-md shadow-indigo-900/30 hover:shadow-[0_0_10px_rgba(99,102,241,0.4)] cursor-pointer"
          title="Invite Collaborators"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      </div>

      {/* Action icons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setEditorTheme(prev => prev === "vs-dark" ? "light" : "vs-dark")}
          className={`p-1.5 rounded-lg hover-scale cursor-pointer transition-colors duration-250 ${
            editorTheme === "vs-dark"
              ? "hover:bg-slate-800/50 text-slate-400 hover:text-white"
              : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"
          }`}
          title="Toggle Light/Dark Theme"
        >
          {editorTheme === "vs-dark" ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform duration-500 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400 transition-transform duration-500 hover:-rotate-12" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setBottomPanelOpen(prev => !prev)}
          className={`p-1.5 rounded-lg hover-scale cursor-pointer transition-colors duration-250 ${
            bottomPanelOpen
              ? (editorTheme === "vs-dark" ? "bg-[#25252b] text-indigo-400" : "bg-indigo-50 text-indigo-600")
              : (editorTheme === "vs-dark" ? "text-slate-400 hover:bg-slate-800/50 hover:text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800")
          }`}
          title="Toggle Bottom Console Panel"
        >
          <TerminalSquare className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setRightSidebarOpen(prev => !prev)}
          className={`p-1.5 rounded-xl cursor-pointer transition-all duration-300 ai-activity-btn ${
            rightSidebarOpen
              ? (editorTheme === "vs-dark"
                  ? "bg-purple-950/40 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.35)] border border-purple-500/40 animate-pulse-glow-purple"
                  : "bg-purple-100/80 text-purple-600 border border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.35)] animate-pulse-glow-purple")
              : (editorTheme === "vs-dark" ? "text-slate-400 hover:text-purple-400 hover:bg-purple-950/20" : "text-slate-500 hover:text-purple-600 hover:bg-purple-50")
          }`}
          title="Toggle AI Assistant"
        >
          <Bot className={`w-4.5 h-4.5 ai-icon-target ${rightSidebarOpen ? "text-purple-400" : "text-slate-400"}`} />
        </button>
      </div>
    </header>
  );
};
export default Header;
