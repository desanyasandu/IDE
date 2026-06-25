import { useState } from 'react';
import { X, UserPlus, Globe, ChevronDown, Check } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: "vs-dark" | "light";
  workspaceId?: string;
  activeCollaborators?: any[];
  onChangeName?: (newName: string) => void;
}

export default function ShareModal({ isOpen, onClose, theme = "vs-dark", workspaceId = "my-room", activeCollaborators = [], onChangeName }: ShareModalProps) {
  if (!isOpen) return null;

  const [inviteRole, setInviteRole] = useState("Editor");
  const [linkRole, setLinkRole] = useState("Viewer");
  const [copied, setCopied] = useState(false);
  const [inviteInput, setInviteInput] = useState("");
  const [isEditingMyName, setIsEditingMyName] = useState(false);
  const [myNameInput, setMyNameInput] = useState("");
  const [collaborators, setCollaborators] = useState([
    { name: "Alex (AI Expert)", email: "alex@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4", role: "Editor" },
    { name: "Sam Designer", email: "sam@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam&backgroundColor=c0aede", role: "Viewer" }
  ]);

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${workspaceId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = () => {
    if (!inviteInput.trim()) return;
    const name = inviteInput.split('@')[0];
    const isEmail = inviteInput.includes('@');
    const newCollab = {
      name: isEmail ? name.charAt(0).toUpperCase() + name.slice(1) : inviteInput,
      email: isEmail ? inviteInput : `${inviteInput.toLowerCase().replace(/\s+/g, '')}@example.com`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(inviteInput)}&backgroundColor=b6e3f4`,
      role: inviteRole
    };
    setCollaborators([...collaborators, newCollab]);
    setInviteInput("");
  };

  const handleRoleChange = (index: number, newRole: string) => {
    if (newRole === "Remove") {
      setCollaborators(collaborators.filter((_, i) => i !== index));
    } else {
      setCollaborators(collaborators.map((c, i) => i === index ? { ...c, role: newRole } : c));
    }
  };

  const isDark = theme === "vs-dark";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-[520px] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-colors duration-250 ${
        isDark 
          ? "bg-[#15151c] border border-slate-700/60 text-slate-300" 
          : "bg-white border border-slate-200 text-slate-700 shadow-slate-200/50"
      }`}>

        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between transition-colors duration-250 ${
          isDark ? "border-slate-800/80" : "border-slate-100"
        }`}>
          <h2 className={`text-lg font-semibold tracking-wide transition-colors duration-250 ${
            isDark ? "text-white" : "text-slate-800"
          }`}>Share Workspace</h2>
          <button 
            onClick={onClose} 
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isDark ? "hover:bg-slate-800/60 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">

          {/* Invite Section */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Invite Collaborators</label>
            <div className="flex items-center gap-2">
              <div className={`flex-1 relative flex items-center border rounded-xl transition-all shadow-inner ${
                isDark 
                  ? "bg-[#0d0d10]/80 border-[#2d2d35] focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50" 
                  : "bg-[#f8fafc] border-slate-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50"
              }`}>
                <input
                  type="text"
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleInvite();
                  }}
                  placeholder="Enter usernames or emails..."
                  className={`w-full bg-transparent text-sm px-3.5 py-3 outline-none font-mono ${
                    isDark ? "text-white placeholder-slate-600" : "text-slate-800 placeholder-slate-400"
                  }`}
                />
              </div>
              <div className="relative group shrink-0">
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className={`appearance-none border text-sm px-4 py-3 pr-8 rounded-xl outline-none cursor-pointer transition-colors shadow-sm ${
                    isDark 
                      ? "bg-[#1b1b22] border-[#2d2d35] text-slate-300 hover:border-slate-500" 
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-400"
                  }`}
                >
                  <option value="Editor">Editor</option>
                  <option value="Viewer">Viewer</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2.5 top-3.5 text-slate-400 pointer-events-none" />
              </div>
              <button
                onClick={handleInvite}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-900/30 hover:shadow-[0_0_12px_rgba(99,102,241,0.5)] shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                Invite
              </button>
            </div>
          </div>

          {/* Access List */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Who has access</label>
            <div className="flex flex-col gap-3.5">

              {/* Owner */}
              {(!activeCollaborators || activeCollaborators.length === 0) && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-900/40 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                      ME
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-semibold transition-colors duration-250 ${isDark ? "text-white" : "text-slate-800"}`}>You</span>
                      <span className="text-[11px] text-slate-500 font-mono">owner@antigravity.studio</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 px-3 uppercase tracking-wider">Owner</span>
                </div>
              )}

              {/* Dynamic Collaborators */}
              {activeCollaborators && activeCollaborators.length > 0 ? (
                activeCollaborators.map((collab) => (
                  <div key={collab.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={collab.avatar} className={`w-9 h-9 rounded-full border shadow-sm ${isDark ? "border-slate-700/80" : "border-slate-200"}`} alt={collab.name} />
                      <div className="flex flex-col">
                        {collab.isMe && isEditingMyName ? (
                          <input
                            type="text"
                            value={myNameInput}
                            onChange={(e) => setMyNameInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                if (myNameInput.trim()) {
                                  onChangeName?.(myNameInput.trim());
                                  setIsEditingMyName(false);
                                }
                              }
                              if (e.key === "Escape") {
                                setIsEditingMyName(false);
                              }
                            }}
                            onBlur={() => {
                              if (myNameInput.trim()) {
                                onChangeName?.(myNameInput.trim());
                              }
                              setIsEditingMyName(false);
                            }}
                            autoFocus
                            className={`bg-transparent text-sm font-semibold outline-none border-b border-indigo-500 transition-colors ${
                              isDark ? "text-white" : "text-slate-800"
                            }`}
                          />
                        ) : (
                          <span 
                            onClick={() => {
                              if (collab.isMe) {
                                setMyNameInput(collab.name);
                                setIsEditingMyName(true);
                              }
                            }}
                            className={`text-sm font-semibold transition-colors duration-250 ${collab.isMe ? "cursor-pointer hover:underline hover:text-indigo-400" : ""} ${isDark ? "text-slate-200" : "text-slate-750"}`}
                            title={collab.isMe ? "Click to change name" : undefined}
                          >
                            {collab.name} {collab.isMe && "(You)"}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 font-mono">
                          {collab.isMe ? "owner@antigravity.studio" : `${collab.name.toLowerCase().replace(/\s+/g, '')}@workspace.collab`}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 px-3 uppercase tracking-wider">
                      {collab.isMe ? "Owner" : "Editor"}
                    </span>
                  </div>
                ))
              ) : (
                collaborators.map((collab, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={collab.avatar} className={`w-9 h-9 rounded-full border shadow-sm ${isDark ? "border-slate-700/80" : "border-slate-200"}`} alt={collab.name} />
                      <div className="flex flex-col">
                        <span className={`text-sm font-semibold transition-colors duration-250 ${isDark ? "text-slate-200" : "text-slate-750"}`}>{collab.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{collab.email}</span>
                      </div>
                    </div>
                    <div className="relative group shrink-0">
                      <select
                        value={collab.role}
                        onChange={(e) => handleRoleChange(index, e.target.value)}
                        className={`appearance-none bg-transparent border border-transparent text-xs font-medium px-3 py-1.5 pr-7 rounded-lg outline-none cursor-pointer transition-colors ${
                          isDark 
                            ? "hover:bg-slate-800 hover:border-slate-700 text-slate-300" 
                            : "hover:bg-slate-100 hover:border-slate-250 text-slate-750"
                        }`}
                      >
                        <option value="Editor">Editor</option>
                        <option value="Viewer">Viewer</option>
                        <option value="Remove">Remove access</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                ))
              )}

            </div>
          </div>

          <hr className={`my-1 ${isDark ? "border-slate-800/60" : "border-slate-150"}`} />

          {/* General Access (Link Sharing) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 shadow-inner ${
                isDark ? "bg-slate-800/40 border-slate-700/60" : "bg-[#f8fafc] border-slate-200"
              }`}>
                <Globe className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-semibold transition-colors duration-250 ${isDark ? "text-slate-200" : "text-slate-700"}`}>Anyone with the link</span>
                <span className="text-[11px] text-slate-500 max-w-[200px] truncate">Anyone on the internet with the link can view</span>
              </div>
            </div>

            <div className="relative group shrink-0">
              <select
                value={linkRole}
                onChange={(e) => setLinkRole(e.target.value)}
                className={`appearance-none bg-transparent border border-transparent text-xs font-medium px-3 py-1.5 pr-7 rounded-lg outline-none cursor-pointer transition-colors ${
                  isDark 
                    ? "hover:bg-slate-800 hover:border-slate-700 text-slate-300" 
                    : "hover:bg-slate-100 hover:border-slate-250 text-slate-750"
                }`}
              >
                <option value="Restricted">Restricted</option>
                <option value="Viewer">Viewer</option>
                <option value="Editor">Editor</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-2 text-slate-400 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className={`px-6 py-4 border-t flex items-center justify-between transition-colors duration-250 ${
          isDark ? "bg-[#0f0f12]/80 border-slate-800/60" : "bg-[#f8fafc] border-slate-100"
        }`}>
          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all border cursor-pointer shadow-sm ${
              isDark 
                ? "border-[#2d2d35] hover:bg-slate-800 hover:border-slate-500 hover:text-white" 
                : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-350 text-slate-700 hover:text-slate-900"
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Globe className="w-4 h-4 text-slate-400" />}
            <span className={copied ? "text-emerald-400" : ""}>{copied ? "Link Copied!" : "Copy link"}</span>
          </button>

          <button 
            onClick={onClose} 
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer ${
              isDark 
                ? "bg-white hover:bg-slate-200 text-black shadow-white/10 hover:shadow-white/20" 
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/20 hover:shadow-indigo-950/30"
            }`}
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
