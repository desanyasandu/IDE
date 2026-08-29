import React from "react";
import { ActiveLeftTab, EditorTheme, MockFile } from "../../types/ide";
import ExplorerView from "./ExplorerView";
import SearchView from "./SearchView";
import SourceControlView from "./SourceControlView";
import RoomsView from "./RoomsView";

interface LeftSidebarProps {
  editorTheme: EditorTheme;
  leftSidebarOpen: boolean;
  leftSidebarWidth: number;
  isResizingLeft: boolean;
  startResizingLeft: (mouseDownEvent: React.MouseEvent) => void;
  activeLeftTab: ActiveLeftTab;

  // Explorer props
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

  // Search props
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  replaceQuery: string;
  setReplaceQuery: (q: string) => void;
  isReplaceExpanded: boolean;
  setIsReplaceExpanded: (expanded: boolean) => void;
  groupedResults: Record<string, any[]>;
  handleReplaceAll: () => void;
  handleReplaceSingle: (path: string, lineIndex: number) => void;
  handleResultClick: (path: string, lineIndex: number, isFileNameMatch?: boolean) => void;

  // Git props
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

  // Rooms props
  workspaceId: string;
  roomsHistory: string[];
  handleCreateNewRoom: () => void;
  handleSwitchRoom: (roomId: string) => void;
  handleRenameRoom: (roomId: string) => void;
  updateRoomsHistory: (history: string[]) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  editorTheme,
  leftSidebarOpen,
  leftSidebarWidth,
  isResizingLeft,
  startResizingLeft,
  activeLeftTab,
  isLocalProject,
  localDirName,
  handleCreateFile,
  explorerExpanded,
  setExplorerExpanded,
  recentFiles,
  files,
  activeFilePath,
  handleOpenFile,
  handleDeleteFile,
  searchQuery,
  setSearchQuery,
  replaceQuery,
  setReplaceQuery,
  isReplaceExpanded,
  setIsReplaceExpanded,
  groupedResults,
  handleReplaceAll,
  handleReplaceSingle,
  handleResultClick,
  isSourceControlExpanded,
  setIsSourceControlExpanded,
  isGraphExpanded,
  setIsGraphExpanded,
  isTerminalExpanded,
  setIsTerminalExpanded,
  gitTerminalHistory,
  gitTerminalInput,
  setGitTerminalInput,
  handleGitTerminalSubmit,
  workspaceId,
  roomsHistory,
  handleCreateNewRoom,
  handleSwitchRoom,
  handleRenameRoom,
  updateRoomsHistory
}) => {
  return (
    <>
      <div
        className={`flex flex-col overflow-hidden z-10 gpu-layer border-r transition-colors duration-250 ${
          editorTheme === "vs-dark"
            ? "bg-[#16161a] border-[#25252b]"
            : "bg-[#f3f4f6] border-[#e5e7eb]"
        }`}
        style={{
          width: leftSidebarOpen ? `${leftSidebarWidth}px` : 0,
          transition: isResizingLeft ? 'none' : 'width 300ms ease-out'
        }}
      >
        {activeLeftTab === "explorer" && (
          <ExplorerView
            editorTheme={editorTheme}
            isLocalProject={isLocalProject}
            localDirName={localDirName}
            handleCreateFile={handleCreateFile}
            explorerExpanded={explorerExpanded}
            setExplorerExpanded={setExplorerExpanded}
            recentFiles={recentFiles}
            files={files}
            activeFilePath={activeFilePath}
            handleOpenFile={handleOpenFile}
            handleDeleteFile={handleDeleteFile}
          />
        )}

        {activeLeftTab === "search" && (
          <SearchView
            editorTheme={editorTheme}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            replaceQuery={replaceQuery}
            setReplaceQuery={setReplaceQuery}
            isReplaceExpanded={isReplaceExpanded}
            setIsReplaceExpanded={setIsReplaceExpanded}
            groupedResults={groupedResults}
            handleReplaceAll={handleReplaceAll}
            handleReplaceSingle={handleReplaceSingle}
            handleResultClick={handleResultClick}
          />
        )}

        {activeLeftTab === "git" && (
          <SourceControlView
            editorTheme={editorTheme}
            isSourceControlExpanded={isSourceControlExpanded}
            setIsSourceControlExpanded={setIsSourceControlExpanded}
            isGraphExpanded={isGraphExpanded}
            setIsGraphExpanded={setIsGraphExpanded}
            isTerminalExpanded={isTerminalExpanded}
            setIsTerminalExpanded={setIsTerminalExpanded}
            gitTerminalHistory={gitTerminalHistory}
            gitTerminalInput={gitTerminalInput}
            setGitTerminalInput={setGitTerminalInput}
            handleGitTerminalSubmit={handleGitTerminalSubmit}
          />
        )}

        {activeLeftTab === "rooms" && (
          <RoomsView
            editorTheme={editorTheme}
            workspaceId={workspaceId}
            roomsHistory={roomsHistory}
            handleCreateNewRoom={handleCreateNewRoom}
            handleSwitchRoom={handleSwitchRoom}
            handleRenameRoom={handleRenameRoom}
            updateRoomsHistory={updateRoomsHistory}
          />
        )}
      </div>

      {/* Left Sidebar drag divider */}
      {leftSidebarOpen && (
        <div
          onMouseDown={startResizingLeft}
          className="w-1 hover:w-1.5 bg-transparent hover:bg-indigo-500/50 active:bg-indigo-500 transition-all cursor-col-resize z-30 shrink-0"
        />
      )}
    </>
  );
};
export default LeftSidebar;
