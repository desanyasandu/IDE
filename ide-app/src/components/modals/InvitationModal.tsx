import React from "react";
import { Globe, UserPlus, Check } from "lucide-react";
import { EditorTheme, Invitation } from "../../types/ide";

interface InvitationModalProps {
  invitation: Invitation | null;
  editorTheme: EditorTheme;
  handleAcceptInvitation: () => void;
  handleDeclineInvitation: () => void;
}

export const InvitationModal: React.FC<InvitationModalProps> = ({
  invitation,
  editorTheme,
  handleAcceptInvitation,
  handleDeclineInvitation
}) => {
  if (!invitation) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in duration-300">
      <div className={`w-full max-w-[460px] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform scale-100 ${
        editorTheme === "vs-dark"
          ? "bg-[#15151c]/90 border border-[#2d2d35] text-slate-350"
          : "bg-white border border-slate-205 text-slate-700 shadow-slate-200/55"
      }`}>
        {/* Header */}
        <div className={`px-6 py-5 border-b flex items-center justify-between transition-colors duration-250 ${
          editorTheme === "vs-dark" ? "border-slate-800/80" : "border-slate-100"
        }`}>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-500 animate-pulse" />
            <h2 className={`text-md font-bold tracking-wide transition-colors duration-250 ${
              editorTheme === "vs-dark" ? "text-white" : "text-slate-800"
            }`}>Workspace Invitation</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/35 flex items-center justify-center text-indigo-500 mb-2">
            <UserPlus className="w-7 h-7" />
          </div>
          <p className="text-sm">
            You have been invited to join the collaborative workspace:
          </p>
          <div className={`py-3 px-4 rounded-xl font-mono text-sm font-bold border transition-colors ${
            editorTheme === "vs-dark" 
              ? "bg-slate-900/50 border-slate-800 text-indigo-400" 
              : "bg-slate-50 border-slate-150 text-indigo-600"
          }`}>
            {invitation.room}
          </div>
          <p className="text-[11px] text-slate-500">
            Role assigned to you: <strong className="uppercase text-indigo-500">{invitation.role}</strong>
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Before joining, you are currently viewing your own personal workspace. Would you like to connect to the shared room?
          </p>
        </div>

        {/* Actions */}
        <div className={`px-6 py-4.5 border-t flex items-center justify-end gap-3 transition-colors duration-250 ${
          editorTheme === "vs-dark" ? "bg-[#0f0f12]/80 border-slate-800/60" : "bg-[#f8fafc] border-slate-100"
        }`}>
          <button
            onClick={handleDeclineInvitation}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              editorTheme === "vs-dark"
                ? "border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white"
                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900"
            }`}
          >
            Stay in Personal Workspace
          </button>
          <button
            onClick={handleAcceptInvitation}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-900/25 cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Join Workspace
          </button>
        </div>
      </div>
    </div>
  );
};
export default InvitationModal;
