import React from "react";
import {
  Folder,
  Search,
  GitBranch,
  Layers,
  PhoneCall,
  Sparkles,
  User,
  Settings
} from "lucide-react";
import { ActiveLeftTab, EditorTheme } from "../../types/ide";
import AccountMenu from "./AccountMenu";

interface ActivityBarProps {
  editorTheme: EditorTheme;
  leftSidebarOpen: boolean;
  setLeftSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeLeftTab: ActiveLeftTab;
  setActiveLeftTab: (tab: ActiveLeftTab) => void;
  isCallActive: boolean;
  setIsCallActive: (active: boolean) => void;
  isCallPanelOpen: boolean;
  setIsCallPanelOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  rightSidebarOpen: boolean;
  setRightSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isAccountMenuOpen: boolean;
  setIsAccountMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSignedIn: boolean;
  setIsSignedIn: (signedIn: boolean) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  editorTheme,
  leftSidebarOpen,
  setLeftSidebarOpen,
  activeLeftTab,
  setActiveLeftTab,
  isCallActive,
  setIsCallActive,
  isCallPanelOpen,
  setIsCallPanelOpen,
  rightSidebarOpen,
  setRightSidebarOpen,
  isAccountMenuOpen,
  setIsAccountMenuOpen,
  isSignedIn,
  setIsSignedIn,
  showSettings,
  setShowSettings
}) => {
  return (
    <div className={`w-13 flex flex-col justify-between items-center py-3 z-20 shrink-0 border-r transition-colors duration-250 ${
      editorTheme === "vs-dark"
        ? "bg-[#0d0d10] border-[#25252b] text-slate-400"
        : "bg-[#f9fafb] border-[#e5e7eb] text-slate-500"
    }`}>
      <div className="flex flex-col gap-2.5 w-full items-center">
        {/* Explorer Toggle */}
        <button
          onClick={() => {
            if (leftSidebarOpen && activeLeftTab === "explorer") {
              setLeftSidebarOpen(false);
            } else {
              setLeftSidebarOpen(true);
              setActiveLeftTab("explorer");
            }
          }}
          className={`p-2.5 rounded-xl transition-all duration-300 relative hover-scale group cursor-pointer ${
            leftSidebarOpen && activeLeftTab === "explorer"
              ? (editorTheme === "vs-dark" ? "text-indigo-400 bg-[#1a1a24] shadow-inner" : "text-indigo-600 bg-indigo-50 shadow-sm")
              : (editorTheme === "vs-dark" ? "hover:text-slate-200 hover:bg-slate-900/60" : "hover:text-slate-800 hover:bg-slate-100")
          }`}
          title="File Explorer"
        >
          <Folder className="w-5.5 h-5.5" />
          {leftSidebarOpen && activeLeftTab === "explorer" && (
            <span className="absolute left-0 top-1/4 w-[3px] h-1/2 bg-indigo-500 rounded-r shadow-[0_0_8px_#6366f1]"></span>
          )}
        </button>

        {/* Search Toggle */}
        <button
          onClick={() => {
            if (leftSidebarOpen && activeLeftTab === "search") {
              setLeftSidebarOpen(false);
            } else {
              setLeftSidebarOpen(true);
              setActiveLeftTab("search");
            }
          }}
          className={`p-2.5 rounded-xl transition-all duration-300 relative hover-scale group cursor-pointer ${
            leftSidebarOpen && activeLeftTab === "search"
              ? (editorTheme === "vs-dark" ? "text-indigo-400 bg-[#1a1a24] shadow-inner" : "text-indigo-600 bg-indigo-50 shadow-sm")
              : (editorTheme === "vs-dark" ? "hover:text-slate-200 hover:bg-slate-900/60" : "hover:text-slate-800 hover:bg-slate-100")
          }`}
          title="Search"
        >
          <Search className="w-5.5 h-5.5" />
          {leftSidebarOpen && activeLeftTab === "search" && (
            <span className="absolute left-0 top-1/4 w-[3px] h-1/2 bg-indigo-500 rounded-r shadow-[0_0_8px_#6366f1]"></span>
          )}
        </button>

        {/* Source Control Toggle */}
        <button
          onClick={() => {
            if (leftSidebarOpen && activeLeftTab === "git") {
              setLeftSidebarOpen(false);
            } else {
              setLeftSidebarOpen(true);
              setActiveLeftTab("git");
            }
          }}
          className={`p-2.5 rounded-xl transition-all duration-300 relative hover-scale group cursor-pointer ${
            leftSidebarOpen && activeLeftTab === "git"
              ? (editorTheme === "vs-dark" ? "text-indigo-400 bg-[#1a1a24] shadow-inner" : "text-indigo-600 bg-indigo-50 shadow-sm")
              : (editorTheme === "vs-dark" ? "hover:text-slate-200 hover:bg-slate-900/60" : "hover:text-slate-800 hover:bg-slate-100")
          }`}
          title="Source Control"
        >
          <GitBranch className="w-5.5 h-5.5" />
          {leftSidebarOpen && activeLeftTab === "git" && (
            <span className="absolute left-0 top-1/4 w-[3px] h-1/2 bg-indigo-500 rounded-r shadow-[0_0_8px_#6366f1]"></span>
          )}
        </button>

        {/* Rooms/Workspaces Toggle */}
        <button
          onClick={() => {
            if (leftSidebarOpen && activeLeftTab === "rooms") {
              setLeftSidebarOpen(false);
            } else {
              setLeftSidebarOpen(true);
              setActiveLeftTab("rooms");
            }
          }}
          className={`p-2.5 rounded-xl transition-all duration-300 relative hover-scale group cursor-pointer ${
            leftSidebarOpen && activeLeftTab === "rooms"
              ? (editorTheme === "vs-dark" ? "text-indigo-400 bg-[#1a1a24] shadow-inner" : "text-indigo-600 bg-indigo-50 shadow-sm")
              : (editorTheme === "vs-dark" ? "hover:text-slate-200 hover:bg-slate-900/60" : "hover:text-slate-800 hover:bg-slate-100")
          }`}
          title="Rooms & Workspaces"
        >
          <Layers className="w-5.5 h-5.5" />
          {leftSidebarOpen && activeLeftTab === "rooms" && (
            <span className="absolute left-0 top-1/4 w-[3px] h-1/2 bg-indigo-500 rounded-r shadow-[0_0_8px_#6366f1]"></span>
          )}
        </button>

        {/* Collaborative Call Toggle */}
        <button
          onClick={() => {
            if (!isCallActive) {
              setIsCallActive(true);
              setIsCallPanelOpen(true);
            } else {
              setIsCallPanelOpen(prev => !prev);
            }
          }}
          className={`p-2.5 rounded-xl transition-all duration-300 relative hover-scale group cursor-pointer ${
            isCallActive && isCallPanelOpen
              ? "text-emerald-400 bg-emerald-950/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
              : isCallActive
              ? "text-emerald-500 hover:text-emerald-400 hover:bg-slate-900/60 animate-pulse"
              : "hover:text-slate-200 hover:bg-slate-900/60 text-slate-400"
          }`}
          title="Collaborative Call"
        >
          <PhoneCall className="w-5.5 h-5.5" />
          {isCallActive && isCallPanelOpen && (
            <span className="absolute left-0 top-1/4 w-[3px] h-1/2 bg-emerald-500 rounded-r shadow-[0_0_8px_#10b981]"></span>
          )}
        </button>

        <hr className="w-8 border-slate-800/80 my-1.5" />

        {/* AI Assistant Sidebar Toggle (Activates right sidebar with pulse glow) */}
        <button
          onClick={() => setRightSidebarOpen(prev => !prev)}
          className={`p-2.5 rounded-xl transition-all duration-300 relative cursor-pointer ${
            rightSidebarOpen
              ? (editorTheme === "vs-dark"
                  ? "text-purple-400 bg-purple-950/20 border border-purple-800/40 shadow-[0_0_15px_rgba(168,85,247,0.25)] animate-pulse-glow-purple"
                  : "text-purple-600 bg-purple-50 border border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)] animate-pulse-glow-purple")
              : (editorTheme === "vs-dark" ? "hover:text-purple-400 hover:bg-purple-950/10" : "hover:text-purple-600 hover:bg-purple-50")
          }`}
          title="Toggle AI Copilot"
        >
          <Sparkles className={`w-5.5 h-5.5 ${rightSidebarOpen ? "text-purple-400" : "text-slate-400"}`} />
        </button>
      </div>

      <div className="flex flex-col gap-2 w-full items-center relative">
        <button
          onClick={() => setIsAccountMenuOpen(prev => !prev)}
          className={`p-2.5 rounded-xl transition-all cursor-pointer hover-scale ${
            isAccountMenuOpen
              ? (editorTheme === "vs-dark" ? "text-indigo-400 bg-[#1a1a24] shadow-inner" : "text-indigo-600 bg-indigo-50 shadow-sm")
              : (editorTheme === "vs-dark" ? "hover:text-slate-200 hover:bg-slate-900/60" : "hover:text-slate-800 hover:bg-slate-100")
          }`}
          title="Accounts"
        >
          <User className="w-5.5 h-5.5" />
        </button>

        {/* Account Context Menu */}
        <AccountMenu
          isOpen={isAccountMenuOpen}
          onClose={() => setIsAccountMenuOpen(false)}
          editorTheme={editorTheme}
          isSignedIn={isSignedIn}
          setIsSignedIn={setIsSignedIn}
        />

        <button
          onClick={() => setShowSettings(true)}
          className={`p-2.5 rounded-xl transition-all cursor-pointer hover-scale ${
            showSettings
              ? (editorTheme === "vs-dark" ? "text-indigo-400 bg-[#1a1a24] shadow-inner" : "text-indigo-600 bg-indigo-50 shadow-sm")
              : (editorTheme === "vs-dark" ? "hover:text-slate-200 hover:bg-slate-900/60" : "hover:text-slate-800 hover:bg-slate-100")
          }`}
          title="Settings"
        >
          <Settings className="w-5.5 h-5.5" />
        </button>
      </div>
    </div>
  );
};
export default ActivityBar;
