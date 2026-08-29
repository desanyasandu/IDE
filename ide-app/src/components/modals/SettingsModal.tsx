import React from "react";
import { Settings, X } from "lucide-react";
import { EditorTheme } from "../../types/ide";

interface SettingsModalProps {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  editorTheme: EditorTheme;
  setEditorTheme: (theme: EditorTheme) => void;
  activeSettingsTab: "editor" | "interface" | "ai";
  setActiveSettingsTab: (tab: "editor" | "interface" | "ai") => void;
  minimapEnabled: boolean;
  setMinimapEnabled: (enabled: boolean) => void;
  autoSave: boolean;
  setAutoSave: (save: boolean) => void;
  bracketPairColorization: boolean;
  setBracketPairColorization: (color: boolean) => void;
  formatOnSave: boolean;
  setFormatOnSave: (fmt: boolean) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  wordWrap: "on" | "off";
  setWordWrap: (wrap: "on" | "off") => void;
  lineNumbers: "on" | "off" | "relative";
  setLineNumbers: (ln: "on" | "off" | "relative") => void;
  renderWhitespace: "none" | "boundary" | "all";
  setRenderWhitespace: (ws: "none" | "boundary" | "all") => void;
  cursorBlinking: "smooth" | "blink" | "solid" | "expand";
  setCursorBlinking: (cb: "smooth" | "blink" | "solid" | "expand") => void;
  tabSize: number;
  setTabSize: (sz: number) => void;
  sidebarPosition: "left" | "right";
  setSidebarPosition: (pos: "left" | "right") => void;
  showStatusBar: boolean;
  setShowStatusBar: (show: boolean) => void;
  showBreadcrumbs: boolean;
  setShowBreadcrumbs: (show: boolean) => void;
  glassBlur: number;
  setGlassBlur: (blur: number) => void;
  aiAutocompleteMode: "always" | "manual" | "disabled";
  setAiAutocompleteMode: (mode: "always" | "manual" | "disabled") => void;
  aiMaxTokens: number;
  setAiMaxTokens: (tokens: number) => void;
  aiTemperature: number;
  setAiTemperature: (temp: number) => void;
  aiSystemPrompt: string;
  setAiSystemPrompt: (prompt: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  showSettings,
  setShowSettings,
  editorTheme,
  setEditorTheme,
  activeSettingsTab,
  setActiveSettingsTab,
  minimapEnabled,
  setMinimapEnabled,
  autoSave,
  setAutoSave,
  bracketPairColorization,
  setBracketPairColorization,
  formatOnSave,
  setFormatOnSave,
  fontFamily,
  setFontFamily,
  wordWrap,
  setWordWrap,
  lineNumbers,
  setLineNumbers,
  renderWhitespace,
  setRenderWhitespace,
  cursorBlinking,
  setCursorBlinking,
  tabSize,
  setTabSize,
  sidebarPosition,
  setSidebarPosition,
  showStatusBar,
  setShowStatusBar,
  showBreadcrumbs,
  setShowBreadcrumbs,
  glassBlur,
  setGlassBlur,
  aiAutocompleteMode,
  setAiAutocompleteMode,
  aiMaxTokens,
  setAiMaxTokens,
  aiTemperature,
  setAiTemperature,
  aiSystemPrompt,
  setAiSystemPrompt
}) => {
  if (!showSettings) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="settings-glass-panel w-full max-w-2xl h-[450px] rounded-2xl flex flex-col overflow-hidden shadow-2xl relative animate-slide-up"
        style={{
          background: editorTheme === "vs-dark"
            ? "linear-gradient(135deg, rgba(24,24,28,0.95) 0%, rgba(30,30,35,0.92) 100%)"
            : "linear-gradient(135deg, rgba(249,250,251,0.95) 0%, rgba(243,244,246,0.92) 100%)",
          border: editorTheme === "vs-dark"
            ? "1px solid rgba(51,51,68,0.4)"
            : "1px solid rgba(203,213,225,0.4)",
          backdropFilter: `blur(${glassBlur}px)`,
          WebkitBackdropFilter: `blur(${glassBlur}px)`
        }}
      >
        {/* Modal Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between transition-colors duration-250 ${
          editorTheme === "vs-dark" ? "border-slate-800/80 text-white" : "border-slate-200 text-slate-800"
        }`}>
          <div className="flex items-center gap-2">
            <Settings className={`w-5 h-5 ${editorTheme === "vs-dark" ? "text-indigo-400" : "text-indigo-600"}`} />
            <span className="font-bold text-sm tracking-wide">COD CODE User Settings</span>
          </div>
          <button
            onClick={() => setShowSettings(false)}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              editorTheme === "vs-dark" ? "hover:bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"
            }`}
            title="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Settings Sidebar Tabs */}
          <div className={`w-48 shrink-0 p-3 flex flex-col gap-1 border-r transition-colors duration-250 ${
            editorTheme === "vs-dark" ? "bg-[#18181c]/40 border-slate-800/80" : "bg-[#f9fafb] border-slate-200"
          }`}>
            <button
              onClick={() => setActiveSettingsTab("editor")}
              className={`w-full py-2 px-3 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer ${
                activeSettingsTab === "editor"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/20"
                  : (editorTheme === "vs-dark" ? "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200" : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900")
              }`}
            >
              Editor Configuration
            </button>
            <button
              onClick={() => setActiveSettingsTab("interface")}
              className={`w-full py-2 px-3 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer ${
                activeSettingsTab === "interface"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/20"
                  : (editorTheme === "vs-dark" ? "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200" : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900")
              }`}
            >
              Interface & Layout
            </button>
            <button
              onClick={() => setActiveSettingsTab("ai")}
              className={`w-full py-2 px-3 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer ${
                activeSettingsTab === "ai"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/20"
                  : (editorTheme === "vs-dark" ? "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200" : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900")
              }`}
            >
              AI Configuration
            </button>
          </div>

          {/* Right Settings Configuration Form */}
          <div className={`flex-1 p-5 overflow-y-auto text-xs space-y-5 transition-colors duration-250 ${
            editorTheme === "vs-dark" ? "text-slate-300" : "text-slate-700"
          }`}>
            {activeSettingsTab === "editor" && (
              <>
                <div className="border-b pb-3 border-transparent">
                  <h3 className={`text-[13px] font-bold mb-1.5 ${editorTheme === "vs-dark" ? "text-slate-100" : "text-slate-800"}`}>Text Editor Customization</h3>
                  <p className={`text-[11px] ${editorTheme === "vs-dark" ? "text-slate-500" : "text-slate-500"}`}>Configure Monaco Editor behavior and appearance.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={minimapEnabled}
                        onChange={(e) => setMinimapEnabled(e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-indigo-600 cursor-pointer"
                      />
                      <span className="font-semibold">Enable Minimap</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={autoSave}
                        onChange={(e) => setAutoSave(e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-indigo-600 cursor-pointer"
                      />
                      <span className="font-semibold">Auto-save</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={bracketPairColorization}
                        onChange={(e) => setBracketPairColorization(e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-indigo-600 cursor-pointer"
                      />
                      <span className="font-semibold">Bracket Pair Colorization</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formatOnSave}
                        onChange={(e) => setFormatOnSave(e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-indigo-600 cursor-pointer"
                      />
                      <span className="font-semibold">Format On Save</span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="block">
                      <span className="font-semibold">Font Family</span>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className={`w-full mt-1 px-2 py-1.5 rounded text-xs border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          editorTheme === "vs-dark"
                            ? "bg-[#1b1b22] border-slate-700 text-white"
                            : "bg-white border-slate-300 text-slate-800"
                        }`}
                      >
                        <option value="Fira Code">Fira Code</option>
                        <option value="JetBrains Mono">JetBrains Mono</option>
                        <option value="Source Code Pro">Source Code Pro</option>
                        <option value="Courier New">Courier New</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="font-semibold">Word Wrap</span>
                      <select
                        value={wordWrap}
                        onChange={(e) => setWordWrap(e.target.value as "on" | "off")}
                        className={`w-full mt-1 px-2 py-1.5 rounded text-xs border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          editorTheme === "vs-dark"
                            ? "bg-[#1b1b22] border-slate-700 text-white"
                            : "bg-white border-slate-300 text-slate-800"
                        }`}
                      >
                        <option value="on">On</option>
                        <option value="off">Off</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <label className="block">
                    <span className="font-semibold">Line Numbers</span>
                    <select
                      value={lineNumbers}
                      onChange={(e) => setLineNumbers(e.target.value as "on" | "off" | "relative")}
                      className={`w-full mt-1 px-2 py-1.5 rounded text-xs border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        editorTheme === "vs-dark"
                          ? "bg-[#1b1b22] border-slate-700 text-white"
                          : "bg-white border-slate-300 text-slate-800"
                      }`}
                    >
                      <option value="on">On</option>
                      <option value="off">Off</option>
                      <option value="relative">Relative</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="font-semibold">Render Whitespace</span>
                    <select
                      value={renderWhitespace}
                      onChange={(e) => setRenderWhitespace(e.target.value as "none" | "boundary" | "all")}
                      className={`w-full mt-1 px-2 py-1.5 rounded text-xs border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        editorTheme === "vs-dark"
                          ? "bg-[#1b1b22] border-slate-700 text-white"
                          : "bg-white border-slate-300 text-slate-800"
                      }`}
                    >
                      <option value="none">None</option>
                      <option value="boundary">Boundary</option>
                      <option value="all">All</option>
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <label className="block">
                    <span className="font-semibold">Cursor Blinking</span>
                    <select
                      value={cursorBlinking}
                      onChange={(e) => setCursorBlinking(e.target.value as "smooth" | "blink" | "solid" | "expand")}
                      className={`w-full mt-1 px-2 py-1.5 rounded text-xs border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        editorTheme === "vs-dark"
                          ? "bg-[#1b1b22] border-slate-700 text-white"
                          : "bg-white border-slate-300 text-slate-800"
                      }`}
                    >
                      <option value="blink">Blink</option>
                      <option value="smooth">Smooth</option>
                      <option value="expand">Expand</option>
                      <option value="solid">Solid</option>
                    </select>
                  </label>

                  <label className="block">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Tab Size: <span className="text-indigo-400">{tabSize}</span></span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={tabSize}
                      onChange={(e) => setTabSize(parseInt(e.target.value))}
                      className="w-full mt-2.5 accent-indigo-600 cursor-pointer"
                    />
                  </label>
                </div>
              </>
            )}

            {activeSettingsTab === "interface" && (
              <>
                <div className="border-b pb-3 border-transparent">
                  <h3 className={`text-[13px] font-bold mb-1.5 ${editorTheme === "vs-dark" ? "text-slate-100" : "text-slate-800"}`}>IDE Interface Parameters</h3>
                  <p className={`text-[11px] ${editorTheme === "vs-dark" ? "text-slate-500" : "text-slate-500"}`}>Adjust IDE layout, sidebars, and panel visibility.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block">
                      <span className="font-semibold">Color Theme</span>
                      <select
                        value={editorTheme}
                        onChange={(e) => setEditorTheme(e.target.value as "vs-dark" | "light")}
                        className={`w-full mt-1 px-2 py-1.5 rounded text-xs border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          editorTheme === "vs-dark"
                            ? "bg-[#1b1b22] border-slate-700 text-white"
                            : "bg-white border-slate-300 text-slate-800"
                        }`}
                      >
                        <option value="vs-dark">VS Dark (Premium Charcoal)</option>
                        <option value="light">Light Mode (Clean Snow)</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="font-semibold">Sidebar Position</span>
                      <select
                        value={sidebarPosition}
                        onChange={(e) => setSidebarPosition(e.target.value as "left" | "right")}
                        className={`w-full mt-1 px-2 py-1.5 rounded text-xs border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          editorTheme === "vs-dark"
                            ? "bg-[#1b1b22] border-slate-700 text-white"
                            : "bg-white border-slate-300 text-slate-800"
                        }`}
                      >
                        <option value="left">Left Side</option>
                        <option value="right">Right Side</option>
                      </select>
                    </label>
                  </div>

                  <div className="space-y-3 flex flex-col justify-center">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showStatusBar}
                        onChange={(e) => setShowStatusBar(e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-indigo-600 cursor-pointer"
                      />
                      <span className="font-semibold">Show Status Bar</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showBreadcrumbs}
                        onChange={(e) => setShowBreadcrumbs(e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-indigo-600 cursor-pointer"
                      />
                      <span className="font-semibold">Show Breadcrumbs</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Glassmorphism Blur: <span className="text-indigo-400">{glassBlur}px</span></span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={glassBlur}
                      onChange={(e) => setGlassBlur(parseInt(e.target.value))}
                      className="w-full mt-2 accent-indigo-600 cursor-pointer"
                    />
                  </label>
                </div>
              </>
            )}

            {activeSettingsTab === "ai" && (
              <>
                <div className="border-b pb-3 border-transparent">
                  <h3 className={`text-[13px] font-bold mb-1.5 ${editorTheme === "vs-dark" ? "text-slate-100" : "text-slate-800"}`}>AI Chat & Copilot Configuration</h3>
                  <p className={`text-[11px] ${editorTheme === "vs-dark" ? "text-slate-500" : "text-slate-500"}`}>Manage AI assistant and Copilot integrations.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block">
                      <span className="font-semibold">Autocomplete Mode</span>
                      <select
                        value={aiAutocompleteMode}
                        onChange={(e) => setAiAutocompleteMode(e.target.value as "always" | "manual" | "disabled")}
                        className={`w-full mt-1 px-2 py-1.5 rounded text-xs border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          editorTheme === "vs-dark"
                            ? "bg-[#1b1b22] border-slate-700 text-white"
                            : "bg-white border-slate-300 text-slate-800"
                        }`}
                      >
                        <option value="always">Always (As-You-Type)</option>
                        <option value="manual">Manual Trigger Only</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </label>
                  </div>

                  <div className="space-y-3">
                    <label className="block">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Max Response Length: <span className="text-indigo-400">{aiMaxTokens} tokens</span></span>
                      </div>
                      <input
                        type="range"
                        min="256"
                        max="2048"
                        step="128"
                        value={aiMaxTokens}
                        onChange={(e) => setAiMaxTokens(parseInt(e.target.value))}
                        className="w-full mt-2.5 accent-indigo-600 cursor-pointer"
                      />
                    </label>

                    <label className="block">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Temperature: <span className="text-indigo-400">{aiTemperature}</span></span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={aiTemperature}
                        onChange={(e) => setAiTemperature(parseFloat(e.target.value))}
                        className="w-full mt-2.5 accent-indigo-600 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-1">
                  <label className="block">
                    <span className="font-semibold">Copilot Context Directive / System Prompt</span>
                    <textarea
                      value={aiSystemPrompt}
                      onChange={(e) => setAiSystemPrompt(e.target.value)}
                      className={`w-full mt-1.5 px-2 py-1.5 rounded text-xs border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-[65px] ${
                        editorTheme === "vs-dark"
                          ? "bg-[#1b1b22] border-slate-700 text-white placeholder-slate-600"
                          : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                      }`}
                      placeholder="e.g., Use functional components with hooks, keep code modular..."
                    />
                  </label>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`px-5 py-3 border-t flex items-center justify-end gap-3 transition-colors duration-250 ${
          editorTheme === "vs-dark" ? "bg-[#101014] border-slate-800/80" : "bg-[#f9fafb] border-slate-200"
        }`}>
          <button
            onClick={() => setShowSettings(false)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-md hover-scale"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
export default SettingsModal;
