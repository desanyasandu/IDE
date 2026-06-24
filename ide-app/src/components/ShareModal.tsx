import { useState } from 'react';
import { X, UserPlus, Globe, Copy, ChevronDown, Check } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ isOpen, onClose }: ShareModalProps) {
  if (!isOpen) return null;

  const [inviteRole, setInviteRole] = useState("Editor");
  const [linkRole, setLinkRole] = useState("Viewer");
  const [copied, setCopied] = useState(false);
  const [inviteInput, setInviteInput] = useState("");
  const [collaborators, setCollaborators] = useState([
    { name: "Alex (AI Expert)", email: "alex@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4", role: "Editor" },
    { name: "Sam Designer", email: "sam@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam&backgroundColor=c0aede", role: "Viewer" }
  ]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText("desan.demo.link");
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

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#15151c] border border-slate-700/60 w-full max-w-[520px] rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden text-slate-300 font-sans relative">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white tracking-wide">Share Workspace</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800/60 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">

          {/* Invite Section */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Invite Collaborators</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative flex items-center bg-[#0d0d10]/80 border border-[#2d2d35] rounded-xl focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-inner">
                <input
                  type="text"
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleInvite();
                  }}
                  placeholder="Enter usernames or emails..."
                  className="w-full bg-transparent text-sm text-white px-3.5 py-3 outline-none placeholder-slate-600 font-mono"
                />
              </div>
              <div className="relative group shrink-0">
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="appearance-none bg-[#1b1b22] border border-[#2d2d35] hover:border-slate-500 text-slate-300 text-sm px-4 py-3 pr-8 rounded-xl outline-none cursor-pointer transition-colors shadow-sm"
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-900/40 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                    ME
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">You</span>
                    <span className="text-[11px] text-slate-500 font-mono">owner@antigravity.studio</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500 px-3 uppercase tracking-wider">Owner</span>
              </div>

              {/* Dynamic Collaborators */}
              {collaborators.map((collab, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={collab.avatar} className="w-9 h-9 rounded-full border border-slate-700/80 shadow-sm" alt={collab.name} />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-200">{collab.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{collab.email}</span>
                    </div>
                  </div>
                  <div className="relative group shrink-0">
                    <select
                      value={collab.role}
                      onChange={(e) => handleRoleChange(index, e.target.value)}
                      className="appearance-none bg-transparent hover:bg-slate-800 border border-transparent hover:border-slate-700 text-slate-300 text-xs font-medium px-3 py-1.5 pr-7 rounded-lg outline-none cursor-pointer transition-colors"
                    >
                      <option value="Editor">Editor</option>
                      <option value="Viewer">Viewer</option>
                      <option value="Remove">Remove access</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              ))}

            </div>
          </div>

          <hr className="border-slate-800/60 my-1" />

          {/* General Access (Link Sharing) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800/40 border border-slate-700/60 flex items-center justify-center shrink-0 shadow-inner">
                <Globe className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-200">Anyone with the link</span>
                <span className="text-[11px] text-slate-500 max-w-[200px] truncate">Anyone on the internet with the link can view</span>
              </div>
            </div>

            <div className="relative group shrink-0">
              <select
                value={linkRole}
                onChange={(e) => setLinkRole(e.target.value)}
                className="appearance-none bg-transparent hover:bg-slate-800 border border-transparent hover:border-slate-700 text-slate-300 text-xs font-medium px-3 py-1.5 pr-7 rounded-lg outline-none cursor-pointer transition-colors"
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
        <div className="bg-[#0f0f12]/80 px-6 py-4 border-t border-slate-800/60 flex items-center justify-between">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all border border-[#2d2d35] hover:bg-slate-800 hover:border-slate-500 hover:text-white cursor-pointer shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span className={copied ? "text-emerald-400" : ""}>{copied ? "Link Copied!" : "Copy link"}</span>
          </button>

          <button onClick={onClose} className="bg-white hover:bg-slate-200 text-black px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-white/10 hover:shadow-white/20 cursor-pointer">
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
