import React from "react";
import { ChevronRight, ChevronDown, RefreshCw } from "lucide-react";
import { EditorTheme } from "../../types/ide";
import { getFileIcon } from "../../utils/icons";

interface SearchMatchItem {
  path: string;
  lineIndex: number;
  lineContent: string;
  isFileNameMatch?: boolean;
}

interface SearchViewProps {
  editorTheme: EditorTheme;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  replaceQuery: string;
  setReplaceQuery: (q: string) => void;
  isReplaceExpanded: boolean;
  setIsReplaceExpanded: (expanded: boolean) => void;
  groupedResults: Record<string, SearchMatchItem[]>;
  handleReplaceAll: () => void;
  handleReplaceSingle: (path: string, lineIndex: number) => void;
  handleResultClick: (path: string, lineIndex: number, isFileNameMatch?: boolean) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  editorTheme,
  searchQuery,
  setSearchQuery,
  replaceQuery,
  setReplaceQuery,
  isReplaceExpanded,
  setIsReplaceExpanded,
  groupedResults,
  handleReplaceAll,
  handleReplaceSingle,
  handleResultClick
}) => {
  return (
    <div className="flex flex-col h-full text-xs">
      <div className={`p-3.5 flex items-center justify-between font-semibold tracking-wider text-[10px] uppercase border-b transition-colors duration-250 ${
        editorTheme === "vs-dark" ? "border-[#25252b] text-slate-400" : "border-[#e5e7eb] text-slate-500"
      }`}>
        <span>Search & Replace</span>
      </div>

      <div className="p-3 flex flex-col gap-2 border-b border-transparent">
        {/* Search & Replace Inputs */}
        <div className="flex items-start gap-1.5">
          <button
            onClick={() => setIsReplaceExpanded(!isReplaceExpanded)}
            className={`mt-1.5 p-0.5 rounded transition-colors cursor-pointer ${editorTheme === "vs-dark" ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-200 text-slate-500"}`}
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isReplaceExpanded ? "rotate-90" : ""}`} />
          </button>
          <div className="flex-1 flex flex-col gap-2">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-md px-2.5 py-1.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans text-xs outline-none border ${
                editorTheme === "vs-dark"
                  ? "bg-[#1a1a24] border-slate-700/60 text-white placeholder-slate-500"
                  : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
              }`}
            />
            {isReplaceExpanded && (
              <div className="flex items-center gap-1.5 relative">
                <input
                  type="text"
                  placeholder="Replace"
                  value={replaceQuery}
                  onChange={(e) => setReplaceQuery(e.target.value)}
                  className={`w-full rounded-md px-2.5 py-1.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans text-xs outline-none border pr-8 ${
                    editorTheme === "vs-dark"
                      ? "bg-[#1a1a24] border-slate-700/60 text-white placeholder-slate-500"
                      : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                  }`}
                />
                <button
                  onClick={handleReplaceAll}
                  disabled={!searchQuery}
                  className={`absolute right-1 top-1 p-1 rounded cursor-pointer transition-colors ${
                    editorTheme === "vs-dark"
                      ? "hover:bg-slate-700 text-slate-400 hover:text-white"
                      : "hover:bg-slate-200 text-slate-500 hover:text-slate-800"
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                  title="Replace All"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin">
        {!searchQuery ? (
          <div className={`p-4 text-center mt-4 text-[11px] ${editorTheme === "vs-dark" ? "text-slate-500" : "text-slate-400"}`}>
            Type to search for text across all workspace files.
          </div>
        ) : Object.keys(groupedResults).length === 0 ? (
          <div className={`p-4 text-center mt-4 text-[11px] ${editorTheme === "vs-dark" ? "text-slate-500" : "text-slate-400"}`}>
            No results found.
          </div>
        ) : (
          <div className="flex flex-col gap-2 mt-2">
            {Object.entries(groupedResults).map(([path, results]) => (
              <div key={path} className="flex flex-col mb-1">
                {/* File Header */}
                <div className={`flex items-center gap-1.5 w-full py-1.5 px-2 rounded font-semibold text-xs transition-colors ${
                  editorTheme === "vs-dark" ? "text-slate-300 hover:bg-slate-800/30" : "text-slate-700 hover:bg-slate-200/50"
                }`}>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  {getFileIcon(path)}
                  <span className="truncate">{path.split('/').pop()}</span>
                  <span className={`ml-auto text-[10px] rounded-full px-1.5 ${editorTheme === "vs-dark" ? "bg-slate-800 text-slate-400" : "bg-slate-200 text-slate-500"}`}>{results.length}</span>
                </div>
                {/* Result Lines */}
                <div className="flex flex-col">
                  {results.map((res, i) => {
                    if (res.isFileNameMatch) {
                      return (
                        <button
                          key={i}
                          onClick={() => handleResultClick(path, res.lineIndex, true)}
                          className={`flex items-center justify-between pl-8 pr-2 py-1 transition-colors w-full text-left cursor-pointer ${
                            editorTheme === "vs-dark" ? "hover:bg-slate-800/50" : "hover:bg-slate-200/50"
                          }`}
                        >
                          <span className={`text-[10px] flex-1 truncate italic ${editorTheme === "vs-dark" ? "text-slate-500" : "text-slate-400"}`}>
                            File name matches: {res.lineContent.replace('File: ', '')}
                          </span>
                        </button>
                      );
                    }

                    const lowerLine = res.lineContent.toLowerCase();
                    const lowerQuery = searchQuery.toLowerCase();
                    const matchIndex = lowerLine.indexOf(lowerQuery);
                    const prefix = res.lineContent.substring(0, matchIndex);
                    const match = res.lineContent.substring(matchIndex, matchIndex + searchQuery.length);
                    const suffix = res.lineContent.substring(matchIndex + searchQuery.length);

                    return (
                      <div key={i} className={`flex items-center justify-between pl-8 pr-2 py-1 transition-colors ${
                        editorTheme === "vs-dark" ? "hover:bg-slate-800/50" : "hover:bg-slate-200/50"
                      }`}>
                        <button
                          onClick={() => handleResultClick(path, res.lineIndex)}
                          className="flex items-start gap-2 text-left cursor-pointer flex-1 min-w-0"
                          title={res.lineContent}
                        >
                          <div className={`font-mono text-[10px] truncate leading-relaxed ${editorTheme === "vs-dark" ? "text-slate-400" : "text-slate-600"}`}>
                            {prefix}
                            <span className={`rounded-[2px] ${editorTheme === "vs-dark" ? "bg-indigo-500/50 text-indigo-50 font-bold" : "bg-indigo-200 text-indigo-900 font-bold"}`}>{match}</span>
                            {suffix}
                          </div>
                        </button>
                        {isReplaceExpanded && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReplaceSingle(path, res.lineIndex);
                            }}
                            className={`p-1 rounded cursor-pointer transition-colors ml-1 shrink-0 ${
                              editorTheme === "vs-dark"
                                ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                                : "bg-slate-200 text-slate-600 hover:bg-slate-300 hover:text-slate-900"
                            }`}
                            title="Replace this match"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default SearchView;
