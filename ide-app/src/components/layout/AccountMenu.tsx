import React from "react";
import { GitBranch, LogIn, LogOut, Settings } from "lucide-react";
import { EditorTheme } from "../../types/ide";

interface AccountMenuProps {
  isOpen: boolean;
  onClose: () => void;
  editorTheme: EditorTheme;
  isSignedIn: boolean;
  setIsSignedIn: (signedIn: boolean) => void;
}

export const AccountMenu: React.FC<AccountMenuProps> = ({
  isOpen,
  onClose,
  editorTheme,
  isSignedIn,
  setIsSignedIn
}) => {
  if (!isOpen) return null;

  return (
    <div className={`absolute bottom-12 left-14 w-64 rounded-xl shadow-2xl border flex flex-col overflow-hidden animate-slide-up z-50 ${
      editorTheme === "vs-dark"
        ? "bg-[#1e1e24] border-slate-700/60 text-slate-300"
        : "bg-white border-slate-200 text-slate-700"
    }`}>
      {!isSignedIn ? (
        <>
          <div className={`px-4 py-3 border-b text-xs font-semibold ${editorTheme === "vs-dark" ? "border-slate-800/80 text-slate-400" : "border-slate-100 text-slate-500"}`}>
            Sign in to sync settings and use AI Copilot
          </div>
          <button
            onClick={() => {
              setIsSignedIn(true);
              onClose();
              alert("Redirecting to GitHub OAuth...");
            }}
            className={`flex items-center gap-2.5 px-4 py-3 text-sm transition-colors cursor-pointer text-left ${
              editorTheme === "vs-dark" ? "hover:bg-slate-800/50 hover:text-white" : "hover:bg-slate-50 hover:text-indigo-600"
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Sign in with GitHub</span>
          </button>
          <button
            onClick={() => {
              setIsSignedIn(true);
              onClose();
            }}
            className={`flex items-center gap-2.5 px-4 py-3 text-sm transition-colors cursor-pointer text-left ${
              editorTheme === "vs-dark" ? "hover:bg-slate-800/50 hover:text-white" : "hover:bg-slate-50 hover:text-indigo-600"
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign in with Email</span>
          </button>
        </>
      ) : (
        <>
          <div className={`px-4 py-3 border-b text-sm font-semibold flex items-center gap-2 ${editorTheme === "vs-dark" ? "border-slate-800/80 text-white" : "border-slate-100 text-slate-800"}`}>
            <img src="https://api.dicebear.com/7.x/initials/svg?seed=Owner" className="w-6 h-6 rounded-full" alt="avatar" />
            <span>owner@antigravity.studio</span>
          </div>
          <button
            onClick={() => {
              onClose();
              alert("Redirecting to Account Management portal...");
            }}
            className={`flex items-center gap-2.5 px-4 py-3 text-sm transition-colors cursor-pointer text-left ${
              editorTheme === "vs-dark" ? "hover:bg-slate-800/50 hover:text-white" : "hover:bg-slate-50 hover:text-indigo-600"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Manage Account</span>
          </button>
          <button
            onClick={() => {
              setIsSignedIn(false);
              onClose();
            }}
            className={`flex items-center gap-2.5 px-4 py-3 text-sm transition-colors cursor-pointer text-left ${
              editorTheme === "vs-dark" ? "hover:bg-slate-800/50 text-red-400 hover:text-red-300" : "hover:bg-slate-50 text-red-500 hover:text-red-600"
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </>
      )}
    </div>
  );
};
export default AccountMenu;
