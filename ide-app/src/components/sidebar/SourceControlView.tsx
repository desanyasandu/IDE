import React from "react";
import {
  ChevronDown,
  Check,
  RefreshCw,
  MoreHorizontal,
  Minus,
  Plus,
  GitMerge,
  Target,
  Download,
  Upload,
  Circle,
  Cloud,
  Terminal,
  X
} from "lucide-react";
import { EditorTheme } from "../../types/ide";
import { getFileIcon } from "../../utils/icons";

interface SourceControlViewProps {
  editorTheme: EditorTheme;
  isSourceControlExpanded: boolean;
  setIsSourceControlExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  isGraphExpanded: boolean;
  setIsGraphExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  isTerminalExpanded: boolean;
  setIsTerminalExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  gitTerminalHistory: string[];
  gitTerminalInput: string;
  setGitTerminalInput: (input: string) => void;
  handleGitTerminalSubmit: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const SourceControlView: React.FC<SourceControlViewProps> = ({
  editorTheme,
  isSourceControlExpanded,
  setIsSourceControlExpanded,
  isGraphExpanded,
  setIsGraphExpanded,
  isTerminalExpanded,
  setIsTerminalExpanded,
  gitTerminalHistory,
  gitTerminalInput,
  setGitTerminalInput,
  handleGitTerminalSubmit
}) => {
  return (
    <div className="flex flex-col h-full text-xs">
      {/* TOP PANE: Source Control */}
      <div className={`flex-1 flex flex-col min-h-0 border-b ${
        editorTheme === "vs-dark" ? "border-slate-800" : "border-slate-200"
      }`}>
        {/* Source Control Accordion Header */}
        <div 
          onClick={() => setIsSourceControlExpanded(!isSourceControlExpanded)}
          className={`p-1.5 flex items-center gap-1 font-semibold tracking-wider text-[10px] uppercase transition-colors duration-250 cursor-pointer select-none ${
            editorTheme === "vs-dark" ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-200"
          }`}
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${!isSourceControlExpanded ? "-rotate-90" : ""}`} />
          <span className="flex-1">Source Control</span>
          <div className="flex gap-1 items-center pr-1" onClick={e => e.stopPropagation()}>
            <button className={`p-1 rounded transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-700/50" : "hover:bg-slate-200/80"}`} title="Commit"><Check className="w-3.5 h-3.5" /></button>
            <button className={`p-1 rounded transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-700/50" : "hover:bg-slate-200/80"}`} title="Refresh"><RefreshCw className="w-3.5 h-3.5" /></button>
            <button className={`p-1 rounded transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-700/50" : "hover:bg-slate-200/80"}`} title="More Actions..."><MoreHorizontal className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* Source Control Content */}
        {isSourceControlExpanded && (
          <div className="flex flex-col flex-1 min-h-0 pt-2">
            {/* Message Box */}
            <div className="px-3 pb-3">
              <div className={`relative rounded border focus-within:ring-1 focus-within:ring-indigo-500 transition-all ${
                editorTheme === "vs-dark" ? "bg-[#1a1a24] border-slate-700/60" : "bg-white border-slate-300"
              }`}>
                <textarea 
                  placeholder="Message (Enter to commit on 'main')" 
                  className={`w-full p-2 h-16 text-xs bg-transparent resize-none outline-none ${
                    editorTheme === "vs-dark" ? "text-white placeholder-slate-500" : "text-slate-800 placeholder-slate-400"
                  }`}
                />
              </div>
              <button className={`w-full mt-2 rounded py-1.5 font-semibold text-white transition-all shadow shadow-indigo-950/20 cursor-pointer ${
                editorTheme === "vs-dark" ? "bg-indigo-600 hover:bg-indigo-500" : "bg-indigo-600 hover:bg-indigo-700"
              }`}>
                Commit
              </button>
            </div>

            {/* Tree */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {/* Staged Changes */}
              <div className="flex flex-col mb-1">
                <div className={`flex items-center gap-1 w-full py-1 px-2 font-semibold text-xs transition-colors cursor-pointer select-none ${
                  editorTheme === "vs-dark" ? "text-slate-300 hover:bg-slate-800/50" : "text-slate-700 hover:bg-slate-200/50"
                }`}>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Staged Changes</span>
                  <span className={`ml-auto text-[10px] rounded-full px-1.5 ${editorTheme === "vs-dark" ? "bg-slate-800 text-slate-400" : "bg-slate-200 text-slate-500"}`}>1</span>
                </div>
                <div className="flex flex-col pl-4">
                  <div className={`group flex items-center justify-between py-1 px-2 cursor-pointer transition-colors ${
                    editorTheme === "vs-dark" ? "hover:bg-slate-800/40 text-slate-400" : "hover:bg-slate-200/40 text-slate-600"
                  }`}>
                    <div className="flex items-center gap-2 truncate">
                      {getFileIcon("package.json")}
                      <span className="truncate">package.json</span>
                      <span className="text-[10px] opacity-60 truncate">/</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button className={`opacity-0 group-hover:opacity-100 p-0.5 rounded transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-300 text-slate-600"}`} title="Unstage Changes"><Minus className="w-3.5 h-3.5" /></button>
                      <span className="text-amber-500 font-bold text-[10px] w-3 text-center">M</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Changes */}
              <div className="flex flex-col mb-1 mt-2">
                <div className={`flex items-center gap-1 w-full py-1 px-2 font-semibold text-xs transition-colors cursor-pointer select-none ${
                  editorTheme === "vs-dark" ? "text-slate-300 hover:bg-slate-800/50" : "text-slate-700 hover:bg-slate-200/50"
                }`}>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Changes</span>
                  <span className={`ml-auto text-[10px] rounded-full px-1.5 ${editorTheme === "vs-dark" ? "bg-slate-800 text-slate-400" : "bg-slate-200 text-slate-500"}`}>2</span>
                </div>
                <div className="flex flex-col pl-4">
                  <div className={`group flex items-center justify-between py-1 px-2 cursor-pointer transition-colors ${
                    editorTheme === "vs-dark" ? "hover:bg-slate-800/40 text-slate-400" : "hover:bg-slate-200/40 text-slate-600"
                  }`}>
                    <div className="flex items-center gap-2 truncate">
                      {getFileIcon("src/App.tsx")}
                      <span className="truncate">App.tsx</span>
                      <span className="text-[10px] opacity-60 truncate">src</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button className={`opacity-0 group-hover:opacity-100 p-0.5 rounded transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-300 text-slate-600"}`} title="Stage Changes"><Plus className="w-3.5 h-3.5" /></button>
                      <span className="text-amber-500 font-bold text-[10px] w-3 text-center">M</span>
                    </div>
                  </div>
                  <div className={`group flex items-center justify-between py-1 px-2 cursor-pointer transition-colors ${
                    editorTheme === "vs-dark" ? "hover:bg-slate-800/40 text-slate-400" : "hover:bg-slate-200/40 text-slate-600"
                  }`}>
                    <div className="flex items-center gap-2 truncate">
                      {getFileIcon("src/index.css")}
                      <span className="truncate">index.css</span>
                      <span className="text-[10px] opacity-60 truncate">src</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button className={`opacity-0 group-hover:opacity-100 p-0.5 rounded transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-300 text-slate-600"}`} title="Stage Changes"><Plus className="w-3.5 h-3.5" /></button>
                      <span className="text-green-500 font-bold text-[10px] w-3 text-center">U</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Graph Accordion Header */}
        <div 
          onClick={() => setIsGraphExpanded(!isGraphExpanded)}
          className={`p-1.5 flex items-center gap-1 font-semibold tracking-wider text-[10px] uppercase transition-colors duration-250 cursor-pointer select-none border-t ${
            editorTheme === "vs-dark" ? "border-slate-800 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-200"
          }`}
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${!isGraphExpanded ? "-rotate-90" : ""}`} />
          <span className="flex-1">Graph</span>
          <div className="flex gap-1 items-center pr-1" onClick={e => e.stopPropagation()}>
            <button className={`p-1 rounded transition-colors flex items-center gap-1 ${editorTheme === "vs-dark" ? "hover:bg-slate-700/50 text-indigo-400" : "hover:bg-slate-200/80 text-indigo-600"}`} title="Auto/Branch"><GitMerge className="w-3.5 h-3.5" /> <span className="normal-case font-normal text-[9px] mr-1">Auto</span></button>
            <button className={`p-1 rounded transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-700/50" : "hover:bg-slate-200/80"}`} title="Fetch"><Target className="w-3.5 h-3.5" /></button>
            <button className={`p-1 rounded transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-700/50" : "hover:bg-slate-200/80"}`} title="Pull"><Download className="w-3.5 h-3.5" /></button>
            <button className={`p-1 rounded transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-700/50" : "hover:bg-slate-200/80"}`} title="Push"><Upload className="w-3.5 h-3.5" /></button>
            <button className={`p-1 rounded transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-700/50" : "hover:bg-slate-200/80"}`} title="Refresh"><RefreshCw className="w-3.5 h-3.5" /></button>
            <button className={`p-1 rounded transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-700/50" : "hover:bg-slate-200/80"}`} title="More Actions..."><MoreHorizontal className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* Graph Content */}
        {isGraphExpanded && (
          <div className={`flex flex-col flex-1 min-h-0 p-3 overflow-y-auto scrollbar-thin ${
            editorTheme === "vs-dark" ? "bg-[#18181c]" : "bg-[#f8f9fa]"
          }`}>
            {/* Commit Node 1 */}
            <div className="flex items-start gap-2 mb-2">
              <div className="mt-1"><Circle className="w-3 h-3 text-indigo-500 fill-transparent" /></div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-medium truncate flex-1 ${editorTheme === "vs-dark" ? "text-slate-200" : "text-slate-800"}`}>feat(search): complete search features</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${editorTheme === "vs-dark" ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}><Target className="w-2.5 h-2.5"/> main</span>
                  <Cloud className={`w-3 h-3 shrink-0 ${editorTheme === "vs-dark" ? "text-purple-400" : "text-purple-600"}`} />
                </div>
              </div>
            </div>
            
            {/* Commit Node 2 */}
            <div className="flex items-start gap-2 h-6">
              <div className="w-3 flex flex-col items-center h-full relative">
                <div className="w-[1.5px] h-3 bg-indigo-500"></div>
                <Circle className="w-2.5 h-2.5 text-indigo-500 fill-indigo-500" />
                <div className="w-[1.5px] h-full bg-indigo-500"></div>
                
                {/* Branching line curve */}
                <svg className="absolute top-3 left-1.5 w-4 h-full" preserveAspectRatio="none">
                  <path d="M0,0 C3,3 8,0 8,10" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
              <div className={`text-[10px] leading-3 truncate w-full ${editorTheme === "vs-dark" ? "text-slate-400" : "text-slate-500"}`}>
                Merge branch 'main' of https://github.com...
              </div>
            </div>

            {/* Commit Node 3 (branched) */}
            <div className="flex items-start gap-2 h-6">
              <div className="w-3 flex flex-col items-center h-full relative">
                <div className="w-[1.5px] h-full bg-indigo-500 relative z-10"></div>
                <div className="absolute top-0 left-2 w-[1.5px] h-3 bg-amber-500 z-20"></div>
                <Circle className="w-2.5 h-2.5 text-amber-500 fill-amber-500 absolute top-3 left-[5px] z-30" />
                <div className="absolute top-4 left-2 w-[1.5px] h-full bg-amber-500 z-20"></div>
              </div>
              <div className={`text-[10px] leading-3 truncate w-full ${editorTheme === "vs-dark" ? "text-slate-400" : "text-slate-500"}`}>
                feat: implement IDELayout component wi...
              </div>
            </div>
            
            {/* Commit Node 4 */}
            <div className="flex items-start gap-2 h-6">
              <div className="w-3 flex flex-col items-center h-full relative">
                <div className="w-[1.5px] h-3 bg-indigo-500 z-10"></div>
                <Circle className="w-2.5 h-2.5 text-[#3b82f6] fill-[#3b82f6] z-10" />
                <div className="w-[1.5px] h-full bg-indigo-500 z-10"></div>
                <div className="absolute top-0 left-2 w-[1.5px] h-full bg-amber-500 z-20"></div>
              </div>
              <div className={`text-[10px] leading-3 truncate w-full flex items-center gap-1 ${editorTheme === "vs-dark" ? "text-slate-400" : "text-slate-500"}`}>
                <span className={`text-[11px] font-medium ${editorTheme === "vs-dark" ? "text-slate-200" : "text-slate-700"}`}>search features completed</span>
                <span>ide-user</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM PANE: Git Bash Terminal */}
      <div className={`${isTerminalExpanded ? "h-[35%] min-h-[200px]" : "h-auto"} flex flex-col shrink-0 border-t border-transparent shadow-[0_-5px_15px_rgba(0,0,0,0.1)] transition-all duration-300`}>
        <div 
          onClick={() => setIsTerminalExpanded(!isTerminalExpanded)}
          className={`p-1.5 flex items-center gap-1 font-semibold tracking-wider text-[10px] uppercase transition-colors duration-250 cursor-pointer select-none border-y ${
            editorTheme === "vs-dark" ? "text-slate-400 bg-[#16161a] border-[#25252b] hover:bg-slate-800" : "text-slate-500 bg-[#f3f4f6] border-[#e5e7eb] hover:bg-slate-200"
          }`}
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${!isTerminalExpanded ? "-rotate-90" : ""}`} />
          <span className="flex items-center gap-1.5 flex-1"><Terminal className="w-3 h-3"/> Git Bash</span>
          <div className="flex gap-1.5 items-center pr-1" onClick={e => e.stopPropagation()}>
            <button className={`p-0.5 rounded transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-700/50" : "hover:bg-slate-200/80"}`}><X className="w-3 h-3" /></button>
          </div>
        </div>
        
        {isTerminalExpanded && (
          <div className="flex-1 bg-[#181818] text-[#cccccc] p-3 font-mono text-[11px] overflow-y-auto whitespace-pre-wrap select-text leading-relaxed">
            {gitTerminalHistory.map((line, idx) => (
              <div key={idx} className={line.startsWith('$') ? "text-white mt-1" : "opacity-80"}>
                {line}
              </div>
            ))}
            <div className="text-[#3fc9b5] mt-2 mb-1">
              <span className="text-[#3fc9b5]">ide-user@DESKTOP</span> <span className="text-[#d7ba7d]">MINGW64</span> <span className="text-[#c5c8c6]">~/workspace</span> <span className="text-[#62d2e1]">(main)</span>
            </div>
            <div className="flex items-center gap-2 relative">
              <span className="text-white shrink-0">$</span>
              <input 
                type="text" 
                value={gitTerminalInput}
                onChange={(e) => setGitTerminalInput(e.target.value)}
                onKeyDown={handleGitTerminalSubmit}
                className="bg-transparent text-white outline-none flex-1 border-none font-mono"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default SourceControlView;
