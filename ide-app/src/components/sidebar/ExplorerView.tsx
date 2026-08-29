import React from "react";
import { Plus, RefreshCw, ChevronDown, History, Folder, X } from "lucide-react";
import { EditorTheme, MockFile } from "../../types/ide";
import { getFileIcon } from "../../utils/icons";

interface ExplorerViewProps {
  editorTheme: EditorTheme;
  isLocalProject: boolean;
  localDirName: string;
  handleCreateFile: () => void;
  explorerExpanded: Record<string, boolean>;
  setExplorerExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  recentFiles: string[];
  files: Record<string, MockFile>;
  activeFilePath: string;
  handleOpenFile: (path: string) => void;
  handleDeleteFile: (e: React.MouseEvent, path: string) => void;
}

export const ExplorerView: React.FC<ExplorerViewProps> = ({
  editorTheme,
  isLocalProject,
  localDirName,
  handleCreateFile,
  explorerExpanded,
  setExplorerExpanded,
  recentFiles,
  files,
  activeFilePath,
  handleOpenFile,
  handleDeleteFile
}) => {
  return (
    <div className="flex flex-col h-full text-xs">
      <div className={`p-3.5 flex items-center justify-between font-semibold tracking-wider text-[10px] uppercase border-b transition-colors duration-250 ${
        editorTheme === "vs-dark" ? "border-[#25252b] text-slate-400" : "border-[#e5e7eb] text-slate-500"
      }`}>
        <div className="flex items-center gap-2">
          <span>Explorer: {isLocalProject ? (localDirName || "Local Project") : "Project"}</span>
          {isLocalProject && (
            <span className="bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded text-[8px] font-bold border border-emerald-500/30 normal-case tracking-normal">
              Local
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleCreateFile}
            className={`p-1 rounded cursor-pointer transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-800/60 text-slate-400 hover:text-white" : "hover:bg-slate-200 text-slate-600 hover:text-slate-900"}`} 
            title="New File"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button className={`p-1 rounded cursor-pointer transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-800/60 text-slate-400 hover:text-white" : "hover:bg-slate-200 text-slate-600 hover:text-slate-900"}`} title="Refresh">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Explorer File Tree */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        {/* Recent Files Section */}
        <div className="mb-4">
          <button
            onClick={() => setExplorerExpanded(prev => ({ ...prev, recent: !prev.recent }))}
            className={`flex items-center gap-1.5 w-full py-2 px-2 rounded-lg text-left font-semibold transition-colors cursor-pointer ${
              editorTheme === "vs-dark" ? "hover:bg-slate-800/30 text-slate-300" : "hover:bg-slate-200/50 text-slate-700"
            }`}
          >
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-250 ${!explorerExpanded.recent ? "-rotate-90" : ""}`} />
            <History className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Recent Files</span>
          </button>

          {explorerExpanded.recent && (
            <div className={`pl-4 mt-0.5 border-l ml-4.5 flex flex-col gap-0.5 ${editorTheme === "vs-dark" ? "border-slate-800/60" : "border-slate-200"}`}>
              {recentFiles.filter(fp => files[fp]).length === 0 ? (
                <div className="py-2 px-2.5 text-slate-500 italic select-none">No recent files</div>
              ) : (
                recentFiles.filter(fp => files[fp]).map((filePath) => {
                  const file = files[filePath];
                  return (
                    <div key={filePath} className="group flex flex-col w-full rounded-lg transition-all duration-200">
                      <button
                        onClick={() => handleOpenFile(filePath)}
                        className={`flex flex-col items-start gap-0.5 w-full py-1.5 px-2.5 rounded-lg text-left cursor-pointer transition-all duration-200 ${
                          activeFilePath === filePath
                            ? (editorTheme === "vs-dark"
                                ? "explorer-item-active text-white font-medium shadow-md shadow-indigo-950/20"
                                : "bg-indigo-100/60 border-l-2 border-indigo-600 text-indigo-800 font-medium shadow-sm")
                            : (editorTheme === "vs-dark" ? "hover:bg-slate-800/30 text-slate-400 hover:text-slate-200" : "hover:bg-slate-200/50 text-slate-600 hover:text-slate-900")
                        }`}
                      >
                        <div className="flex items-center gap-2 w-full">
                          {getFileIcon(file.name)}
                          <span className="font-mono truncate select-none font-medium">{file.name}</span>
                        </div>
                        <span className={`text-[9px] font-mono pl-6 truncate w-full ${editorTheme === "vs-dark" ? "text-slate-500" : "text-slate-400"}`}>
                          {file.path}
                        </span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Root Directory */}
        <div>
          <button
            onClick={() => setExplorerExpanded(prev => ({ ...prev, root: !prev.root }))}
            className={`flex items-center gap-1.5 w-full py-2 px-2 rounded-lg text-left font-semibold transition-colors cursor-pointer ${
              editorTheme === "vs-dark" ? "hover:bg-slate-800/30 text-slate-300" : "hover:bg-slate-200/50 text-slate-700"
            }`}
          >
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-250 ${!explorerExpanded.root ? "-rotate-90" : ""}`} />
            <Folder className="w-4.5 h-4.5 text-amber-500 fill-amber-500/10 shrink-0" />
            <span>{isLocalProject ? "Local Files" : "Workspace Files"}</span>
          </button>

          {explorerExpanded.root && (
            <div className={`pl-4 mt-0.5 border-l ml-4.5 flex flex-col gap-0.5 ${editorTheme === "vs-dark" ? "border-slate-800/60" : "border-slate-200"}`}>
              {Object.keys(files).map((filePath) => {
                const file = files[filePath];
                return (
                  <div key={filePath} className="group flex items-center justify-between w-full rounded-lg transition-all duration-200 relative">
                    <button
                      onClick={() => handleOpenFile(filePath)}
                      className={`flex items-center gap-2 flex-1 py-1.5 px-2.5 rounded-lg text-left cursor-pointer transition-all duration-200 ${
                        activeFilePath === filePath
                          ? (editorTheme === "vs-dark"
                              ? "explorer-item-active text-white font-medium shadow-md shadow-indigo-950/20"
                              : "bg-indigo-100/60 border-l-2 border-indigo-600 text-indigo-800 font-medium shadow-sm")
                          : (editorTheme === "vs-dark" ? "hover:bg-slate-800/30 text-slate-400 hover:text-slate-200" : "hover:bg-slate-200/50 text-slate-600 hover:text-slate-900")
                      }`}
                    >
                      {getFileIcon(file.name)}
                      <span className="font-mono truncate select-none">{file.name}</span>
                    </button>
                    {/* Delete File Button on hover */}
                    <button
                      onClick={(e) => handleDeleteFile(e, filePath)}
                      className={`opacity-0 group-hover:opacity-100 absolute right-2 p-1 rounded transition-colors z-20 cursor-pointer ${
                        editorTheme === "vs-dark"
                          ? "hover:bg-slate-800 text-slate-400 hover:text-red-400"
                          : "hover:bg-slate-200 text-slate-500 hover:text-red-600"
                      }`}
                      title={`Delete ${file.name}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ExplorerView;
