import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import {
  Folder,
  Search,
  GitBranch,
  Settings,
  ChevronDown,
  ChevronRight,
  X,
  Sparkles,
  User,
  Copy,
  Bug,
  Code,
  FileCode,
  RefreshCw,
  FileJson,
  Plus,
  Play,
  PlayCircle,
  Moon,
  Sun,
  TerminalSquare,
  Hash,
  Send
} from "lucide-react";

interface MockFile {
  name: string;
  path: string;
  language: string;
  content: string;
}

const initialFiles: Record<string, MockFile> = {
  "src/components/IDELayout.tsx": {
    name: "IDELayout.tsx",
    path: "src/components/IDELayout.tsx",
    language: "typescript",
    content: `import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Sparkles, MessageSquareCode, Folder } from 'lucide-react';

export default function IDELayout() {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  
  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-[#1e1e1e]">
      {/* Premium IDE Workspace */}
    </div>
  );
}`
  },
  "src/App.tsx": {
    name: "App.tsx",
    path: "src/App.tsx",
    language: "typescript",
    content: `import React from 'react';
import IDELayout from './components/IDELayout';

function App() {
  return (
    <div className="h-screen w-screen bg-[#181818] overflow-hidden flex flex-col text-slate-100">
      <IDELayout />
    </div>
  );
}

export default App;`
  },
  "src/index.css": {
    name: "index.css",
    path: "src/index.css",
    language: "css",
    content: `@import "tailwindcss";

body {
  margin: 0;
  background-color: #1e1e1e;
  color: #f3f4f6;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
}`
  },
  "package.json": {
    name: "package.json",
    path: "package.json",
    language: "json",
    content: `{
  "name": "ide-app",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@monaco-editor/react": "^4.7.0",
    "lucide-react": "^0.470.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "tailwindcss": "^4.0.0"
  }
}`
  }
};

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export default function IDELayout() {
  // Sidebar states
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [activeLeftTab, setActiveLeftTab] = useState<"explorer" | "search" | "git">("explorer");

  // File explorer states
  const [files, setFiles] = useState<Record<string, MockFile>>(initialFiles);
  const [activeFilePath, setActiveFilePath] = useState<string>("src/components/IDELayout.tsx");
  const [openTabs, setOpenTabs] = useState<string[]>([
    "src/components/IDELayout.tsx",
    "src/App.tsx",
    "package.json"
  ]);
  const [explorerExpanded, setExplorerExpanded] = useState({
    src: true,
    components: true,
    root: true
  });

  // Editor states
  const [editorTheme, setEditorTheme] = useState<"vs-dark" | "light">("vs-dark");
  const [fontSize, setFontSize] = useState<number>(14);

  // AI Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hello! I am your AI Developer Assistant. I have analyzed your workspace. How can I help you write, explain, or test your code today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [aiStatus, setAiStatus] = useState<"idle" | "thinking" | "typing">("idle");
  const [streamingMessage, setStreamingMessage] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage, aiStatus]);

  // Handle file code editing
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setFiles(prev => ({
        ...prev,
        [activeFilePath]: {
          ...prev[activeFilePath],
          content: value
        }
      }));
    }
  };

  // Open file in editor
  const handleOpenFile = (path: string) => {
    if (!openTabs.includes(path)) {
      setOpenTabs(prev => [...prev, path]);
    }
    setActiveFilePath(path);
  };

  // Close tab
  const handleCloseTab = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    const newTabs = openTabs.filter(t => t !== path);
    setOpenTabs(newTabs);

    if (activeFilePath === path && newTabs.length > 0) {
      setActiveFilePath(newTabs[newTabs.length - 1]);
    }
  };

  // Run Code placeholder
  const handleRunCode = () => {
    alert(`Executing build and running ${files[activeFilePath].name}... Output directed to dev console.`);
  };

  // AI Prompt Helpers
  const handleQuickPrompt = (promptType: "explain" | "refactor" | "test") => {
    let text = "";
    if (promptType === "explain") text = `Explain the code in ${files[activeFilePath].name}`;
    if (promptType === "refactor") text = `Suggest optimizations and refactoring for ${files[activeFilePath].name}`;
    if (promptType === "test") text = `Generate Jest unit tests for the current code in ${files[activeFilePath].name}`;
    
    setInputMessage(text);
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  // Handle sending chat message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || aiStatus !== "idle") return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const promptText = inputMessage;
    setInputMessage("");

    // Simulate AI response sequence
    setAiStatus("thinking");

    setTimeout(() => {
      // Transition from thinking to typing
      setAiStatus("typing");

      // Select dynamic response based on prompt text
      let responseText = "";
      const lowercasePrompt = promptText.toLowerCase();

      if (lowercasePrompt.includes("explain")) {
        responseText = `Here is a detailed breakdown of \`${files[activeFilePath].name}\`:\n\n1. **Structure**: It is written in ${files[activeFilePath].language.toUpperCase()}.\n2. **Logic**: Handles client-side React rendering and state coordination.\n3. **Key APIs**: Utilizes modular design elements, local React state hooks (\`useState\`, \`useEffect\`), and integrated layouts.\n4. **Optimization**: Ready for deployment. Runs fast with minimal re-render cycles. Let me know if you want to rewrite a specific portion!`;
      } else if (lowercasePrompt.includes("refactor") || lowercasePrompt.includes("optimize")) {
        responseText = `Here is a refactored code proposal for \`${files[activeFilePath].name}\` to enhance performance and readability:\n\n\`\`\`typescript\n// Refactored State hooks\nimport React, { useMemo } from 'react';\n\n// Memoize workspace selectors to avoid unnecessary re-renders\nconst memoizedValue = useMemo(() => {\n  return computeExpensiveValue(activeFilePath);\n}, [activeFilePath]);\n\`\`\`\nThis reduces CPU overhead and maintains smooth UI transitions.`;
      } else if (lowercasePrompt.includes("test") || lowercasePrompt.includes("jest")) {
        responseText = `Here is a Jest + React Testing Library test script for \`${files[activeFilePath].name}\`:\n\n\`\`\`typescript\nimport { render, screen } from '@testing-library/react';\nimport App from './App';\n\ndescribe('IDE component tests', () => {\n  it('loads Monaco Editor container successfully', () => {\n    render(<App />);\n    const workspaceElement = screen.getByTestId('ide-container');\n    expect(workspaceElement).toBeInTheDocument();\n  });\n});\n\`\`\`\nRun this using \`npm test\` to confirm setup correctness.`;
      } else {
        responseText = `I received your request: "${promptText}".\n\nAs your AI assistant, I can help you compile, refactor, or test this workspace. Try selecting one of the quick suggestions below, or ask me to modify code blocks in \`${files[activeFilePath].name}\`.`;
      }

      // Stream the response word by word
      const words = responseText.split(" ");
      let currentWordIndex = 0;
      let accumulatedText = "";

      const typingInterval = setInterval(() => {
        if (currentWordIndex < words.length) {
          accumulatedText += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex];
          setStreamingMessage(accumulatedText);
          currentWordIndex++;
        } else {
          clearInterval(typingInterval);
          // Typing complete
          const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            text: responseText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, aiMsg]);
          setStreamingMessage("");
          setAiStatus("idle");
        }
      }, 40); // 40ms per word for natural streaming flow
    }, 1500); // 1.5 seconds thinking delay
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".tsx")) return <Code className="w-4 h-4 text-sky-400" />;
    if (fileName.endsWith(".css")) return <Hash className="w-4 h-4 text-teal-400" />;
    if (fileName.endsWith(".json")) return <FileJson className="w-4 h-4 text-amber-400" />;
    return <FileCode className="w-4 h-4 text-slate-400" />;
  };

  const activeFile = files[activeFilePath] || initialFiles["src/components/IDELayout.tsx"];

  return (
    <div 
      data-testid="ide-container" 
      className="flex flex-col w-full h-full bg-[#1e1e1e] text-slate-200 select-none overflow-hidden font-sans"
    >
      {/* Top Header / Title Bar */}
      <header className="h-10 bg-[#2d2d2d] border-b border-[#252526] flex items-center justify-between px-4 text-xs font-medium text-slate-400">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block"></span>
          </div>
          <span className="ml-4 font-semibold text-slate-300">Antigravity Studio IDE</span>
        </div>
        
        {/* Active file display */}
        <div className="hidden md:flex items-center gap-2 bg-[#1e1e1e] px-4 py-1 rounded-md border border-[#3e3e3e]">
          <span className="text-[10px] text-indigo-400 font-bold uppercase bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-900/50">Workspace</span>
          <span className="text-slate-300 text-xs font-mono">{activeFile.path}</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setEditorTheme(prev => prev === "vs-dark" ? "light" : "vs-dark")}
            className="p-1 hover:bg-[#3c3c3c] rounded text-slate-400 hover:text-white transition-colors"
            title="Toggle Theme"
          >
            {editorTheme === "vs-dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button 
            onClick={handleRunCode}
            className="flex items-center gap-1 bg-[#248a3d] hover:bg-[#2ca249] text-white px-2.5 py-1 rounded text-xs transition-colors font-semibold"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Run</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex flex-1 w-full overflow-hidden">
        
        {/* 1. Activity Bar (Far Left) */}
        <div className="w-12 bg-[#181818] border-r border-[#252526] flex flex-col justify-between items-center py-2 text-slate-400">
          <div className="flex flex-col gap-2 w-full items-center">
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
              className={`p-2.5 rounded-lg transition-all relative group ${
                leftSidebarOpen && activeLeftTab === "explorer" 
                  ? "text-indigo-400 bg-[#2d2d2d]" 
                  : "hover:text-slate-200 hover:bg-[#252526]"
              }`}
              title="File Explorer"
            >
              <Folder className="w-5 h-5" />
              {leftSidebarOpen && activeLeftTab === "explorer" && (
                <span className="absolute left-0 top-1/4 w-[3px] h-1/2 bg-indigo-500 rounded-r"></span>
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
              className={`p-2.5 rounded-lg transition-all relative group ${
                leftSidebarOpen && activeLeftTab === "search" 
                  ? "text-indigo-400 bg-[#2d2d2d]" 
                  : "hover:text-slate-200 hover:bg-[#252526]"
              }`}
              title="Search"
            >
              <Search className="w-5 h-5" />
              {leftSidebarOpen && activeLeftTab === "search" && (
                <span className="absolute left-0 top-1/4 w-[3px] h-1/2 bg-indigo-500 rounded-r"></span>
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
              className={`p-2.5 rounded-lg transition-all relative group ${
                leftSidebarOpen && activeLeftTab === "git" 
                  ? "text-indigo-400 bg-[#2d2d2d]" 
                  : "hover:text-slate-200 hover:bg-[#252526]"
              }`}
              title="Source Control"
            >
              <GitBranch className="w-5 h-5" />
              {leftSidebarOpen && activeLeftTab === "git" && (
                <span className="absolute left-0 top-1/4 w-[3px] h-1/2 bg-indigo-500 rounded-r"></span>
              )}
            </button>

            <hr className="w-8 border-[#2d2d2d] my-1" />

            {/* AI Assistant Sidebar Toggle (Activates right sidebar) */}
            <button
              onClick={() => setRightSidebarOpen(prev => !prev)}
              className={`p-2.5 rounded-lg transition-all relative ${
                rightSidebarOpen 
                  ? "text-purple-400 bg-[#2d2d2d]/60 shadow-[0_0_8px_rgba(168,85,247,0.15)]" 
                  : "hover:text-slate-200 hover:bg-[#252526]"
              }`}
              title="Toggle AI Copilot Chat"
            >
              <Sparkles className={`w-5 h-5 ${rightSidebarOpen ? "animate-pulse" : ""}`} />
            </button>
          </div>

          <div className="flex flex-col gap-2 items-center w-full">
            <button className="p-2.5 hover:text-slate-200 hover:bg-[#252526] rounded-lg transition-all" title="User Profile">
              <User className="w-5 h-5" />
            </button>
            <button className="p-2.5 hover:text-slate-200 hover:bg-[#252526] rounded-lg transition-all" title="Settings">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Left Collapsible Sidebar */}
        <div 
          className={`bg-[#1e1e1e] border-r border-[#252526] flex flex-col transition-all duration-300 overflow-hidden ${
            leftSidebarOpen ? "w-64" : "w-0"
          }`}
        >
          {activeLeftTab === "explorer" && (
            <div className="flex flex-col h-full text-xs">
              <div className="p-3 border-b border-[#252526] flex items-center justify-between font-semibold tracking-wider text-[10px] uppercase text-slate-400">
                <span>Explorer: Project</span>
                <div className="flex items-center gap-1">
                  <button className="p-1 hover:bg-[#2d2d2d] rounded text-slate-400 hover:text-white" title="New File">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 hover:bg-[#2d2d2d] rounded text-slate-400 hover:text-white" title="Refresh">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Explorer File Tree */}
              <div className="flex-1 overflow-y-auto p-2">
                {/* Root Directory */}
                <div>
                  <button 
                    onClick={() => setExplorerExpanded(prev => ({ ...prev, root: !prev.root }))}
                    className="flex items-center gap-1 w-full py-1.5 px-2 hover:bg-[#2d2d2d] rounded text-left font-semibold text-slate-300"
                  >
                    {explorerExpanded.root ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    <Folder className="w-4 h-4 text-amber-500 fill-amber-500/10" />
                    <span>ide-app</span>
                  </button>

                  {explorerExpanded.root && (
                    <div className="pl-4 mt-0.5 border-l border-[#2d2d2d] ml-3.5">
                      {/* Src Directory */}
                      <div>
                        <button
                          onClick={() => setExplorerExpanded(prev => ({ ...prev, src: !prev.src }))}
                          className="flex items-center gap-1 w-full py-1 px-2 hover:bg-[#2d2d2d] rounded text-left text-slate-300"
                        >
                          {explorerExpanded.src ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          <Folder className="w-3.5 h-3.5 text-blue-400 fill-blue-400/10" />
                          <span>src</span>
                        </button>

                        {explorerExpanded.src && (
                          <div className="pl-4 border-l border-[#2d2d2d] ml-3.5">
                            {/* Components Directory */}
                            <div>
                              <button
                                onClick={() => setExplorerExpanded(prev => ({ ...prev, components: !prev.components }))}
                                className="flex items-center gap-1 w-full py-1 px-2 hover:bg-[#2d2d2d] rounded text-left text-slate-300"
                              >
                                {explorerExpanded.components ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                <Folder className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/10" />
                                <span>components</span>
                              </button>

                              {explorerExpanded.components && (
                                <div className="pl-4 border-l border-[#2d2d2d] ml-3.5">
                                  {/* IDELayout.tsx */}
                                  <button
                                    onClick={() => handleOpenFile("src/components/IDELayout.tsx")}
                                    className={`flex items-center gap-2 w-full py-1 px-2 rounded text-left ${
                                      activeFilePath === "src/components/IDELayout.tsx" 
                                        ? "bg-[#37373d] text-white font-medium" 
                                        : "hover:bg-[#2a2a2e] text-slate-400 hover:text-slate-200"
                                    }`}
                                  >
                                    {getFileIcon("src/components/IDELayout.tsx")}
                                    <span>IDELayout.tsx</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* App.tsx */}
                            <button
                              onClick={() => handleOpenFile("src/App.tsx")}
                              className={`flex items-center gap-2 w-full py-1 px-2 rounded text-left ${
                                activeFilePath === "src/App.tsx" 
                                  ? "bg-[#37373d] text-white font-medium" 
                                  : "hover:bg-[#2a2a2e] text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              {getFileIcon("src/App.tsx")}
                              <span>App.tsx</span>
                            </button>

                            {/* index.css */}
                            <button
                              onClick={() => handleOpenFile("src/index.css")}
                              className={`flex items-center gap-2 w-full py-1 px-2 rounded text-left ${
                                activeFilePath === "src/index.css" 
                                  ? "bg-[#37373d] text-white font-medium" 
                                  : "hover:bg-[#2a2a2e] text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              {getFileIcon("src/index.css")}
                              <span>index.css</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* package.json */}
                      <button
                        onClick={() => handleOpenFile("package.json")}
                        className={`flex items-center gap-2 w-full py-1 px-2 rounded text-left mt-0.5 ${
                          activeFilePath === "package.json" 
                            ? "bg-[#37373d] text-white font-medium" 
                            : "hover:bg-[#2a2a2e] text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {getFileIcon("package.json")}
                        <span>package.json</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeLeftTab === "search" && (
            <div className="flex flex-col h-full p-4 text-xs">
              <span className="font-semibold uppercase text-slate-400 text-[10px] tracking-wider mb-2">Search Workspace</span>
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-[#2d2d2d] border border-[#3e3e3e] text-white rounded px-2.5 py-1.5 focus:border-indigo-500 mb-4"
              />
              <span className="text-slate-500 text-center mt-4">Type to search for text inside files.</span>
            </div>
          )}

          {activeLeftTab === "git" && (
            <div className="flex flex-col h-full p-4 text-xs">
              <span className="font-semibold uppercase text-slate-400 text-[10px] tracking-wider mb-2">Source Control</span>
              <div className="bg-[#2d2d2d] border border-[#3e3e3e] p-3 rounded mb-4">
                <p className="font-medium text-slate-300 mb-1">1 Pending Change</p>
                <div className="flex items-center gap-2 text-slate-400 py-1 font-mono">
                  <span className="text-amber-500 font-bold">M</span>
                  <span>src/components/IDELayout.tsx</span>
                </div>
              </div>
              <textarea 
                placeholder="Commit message..." 
                className="w-full bg-[#2d2d2d] border border-[#3e3e3e] text-white rounded p-2 focus:border-indigo-500 h-20 text-xs mb-2 resize-none"
              />
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded py-2 font-semibold transition-colors">
                Commit & Push (main)
              </button>
            </div>
          )}
        </div>

        {/* 3. Editor Workspace Area (Center) */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e] relative">
          
          {/* Tab bar */}
          <div className="h-9 bg-[#252526] flex items-center overflow-x-auto border-b border-[#1e1e1e] select-none scrollbar-none">
            {openTabs.map(tabPath => {
              const file = files[tabPath] || { name: tabPath };
              const isActive = tabPath === activeFilePath;
              return (
                <div
                  key={tabPath}
                  onClick={() => setActiveFilePath(tabPath)}
                  className={`group h-full flex items-center gap-2 px-3 py-1.5 text-xs border-r border-[#252526] cursor-pointer transition-colors relative ${
                    isActive 
                      ? "bg-[#1e1e1e] text-white font-medium border-t-2 border-indigo-500" 
                      : "bg-[#2d2d2d]/60 text-slate-400 hover:bg-[#2d2d2d] hover:text-slate-200"
                  }`}
                >
                  {getFileIcon(file.name)}
                  <span className="font-mono text-xs">{file.name}</span>
                  <button
                    onClick={(e) => handleCloseTab(e, tabPath)}
                    className="p-0.5 rounded-full text-slate-500 hover:text-white hover:bg-[#3c3c3c] transition-colors ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Breadcrumb line */}
          <div className="h-6 bg-[#1e1e1e] border-b border-[#2d2d2d] flex items-center px-4 text-[10px] text-slate-500 font-mono gap-1">
            <span className="hover:text-slate-300 cursor-pointer">ide-app</span>
            <ChevronRight className="w-3 h-3" />
            <span className="hover:text-slate-300 cursor-pointer">src</span>
            <ChevronRight className="w-3 h-3" />
            {activeFile.path.includes("components") && (
              <>
                <span className="hover:text-slate-300 cursor-pointer">components</span>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
            <span className="text-slate-300 font-medium">{activeFile.name}</span>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 w-full relative">
            <Editor
              height="100%"
              path={activeFile.path}
              language={activeFile.language}
              value={activeFile.content}
              theme={editorTheme}
              onChange={handleEditorChange}
              options={{
                fontSize: fontSize,
                minimap: { enabled: true },
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8
                },
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                cursorBlinking: "blink",
                cursorSmoothCaretAnimation: "on"
              }}
            />
          </div>

          {/* Code actions bar / Overlay options */}
          <div className="absolute bottom-3 right-6 flex items-center gap-2 bg-[#2d2d2d]/85 backdrop-blur border border-[#3e3e3e] py-1 px-2.5 rounded-lg shadow-lg text-[11px] text-slate-300 z-10">
            <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wide pr-1 border-r border-[#3e3e3e] mr-1">Font Size</span>
            <button 
              onClick={() => setFontSize(prev => Math.max(10, prev - 1))}
              className="p-1 hover:bg-[#3c3c3c] rounded w-5 h-5 flex items-center justify-center font-bold font-mono"
            >
              -
            </button>
            <span className="font-mono">{fontSize}px</span>
            <button 
              onClick={() => setFontSize(prev => Math.min(22, prev + 1))}
              className="p-1 hover:bg-[#3c3c3c] rounded w-5 h-5 flex items-center justify-center font-bold font-mono"
            >
              +
            </button>
          </div>
        </div>

        {/* 4. Right Collapsible Sidebar (AI Chat Interface) */}
        <div 
          className={`bg-[#1f1f23] border-l border-[#252526] flex flex-col transition-all duration-300 overflow-hidden relative ${
            rightSidebarOpen ? "w-[380px]" : "w-0"
          }`}
        >
          {/* Header */}
          <div className="p-3 bg-[#26262a] border-b border-[#2d2d30] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <span className="text-sm font-semibold text-slate-100">AI Coding Copilot</span>
            </div>
            
            <button
              onClick={() => setRightSidebarOpen(false)}
              className="p-1 hover:bg-[#2e2e34] rounded text-slate-400 hover:text-white transition-colors"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* AI Status Indicator Bar */}
          <div className="px-4 py-2 border-b border-[#2d2d30] bg-[#1a1a1d] flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {aiStatus !== "idle" && (
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    aiStatus === "thinking" ? "bg-amber-400" : "bg-cyan-400"
                  }`}></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  aiStatus === "idle" 
                    ? "bg-[#27c93f]" 
                    : aiStatus === "thinking" 
                    ? "bg-amber-400" 
                    : "bg-cyan-400"
                }`}></span>
              </span>
              <span className="font-medium text-slate-300">
                AI Status:{" "}
                <span className={`font-semibold capitalize ${
                  aiStatus === "thinking" 
                    ? "text-amber-400" 
                    : aiStatus === "typing" 
                    ? "text-cyan-400 animate-pulse" 
                    : "text-[#27c93f]"
                }`}>
                  {aiStatus === "idle" ? "Ready" : aiStatus}
                </span>
              </span>
            </div>
            {aiStatus !== "idle" && (
              <span className="text-[10px] text-slate-500 font-mono animate-pulse">
                {aiStatus === "thinking" ? "compiling references..." : "generating code..."}
              </span>
            )}
          </div>

          {/* Chat Timeline (Scrollable Messages Area) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-2.5 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Sender Avatar */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                  msg.sender === "user" 
                    ? "bg-slate-700 border-slate-600 text-slate-300" 
                    : "bg-purple-950/60 border-purple-800/50 text-purple-400"
                }`}>
                  {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3 h-3" />}
                </div>

                {/* Message Bubble */}
                <div className="flex flex-col gap-1">
                  <div className={`p-3 rounded-xl leading-relaxed whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-md"
                      : "bg-[#26262a] text-slate-200 border border-[#2d2d30] rounded-tl-none shadow-md"
                  }`}>
                    {/* Render Code Formatting in Chat Messages */}
                    {msg.text.includes("```") ? (
                      msg.text.split("```").map((block, idx) => {
                        if (idx % 2 === 1) {
                          // Code block
                          const codeLines = block.split("\n");
                          const lang = codeLines[0].trim();
                          const actualCode = codeLines.slice(1).join("\n");
                          return (
                            <div key={idx} className="my-2 border border-slate-700 rounded-lg overflow-hidden font-mono bg-slate-900 text-slate-300 text-[11px]">
                              <div className="bg-slate-950 px-3 py-1 text-[10px] text-slate-500 font-bold border-b border-slate-800 flex justify-between items-center">
                                <span>{lang || "code"}</span>
                                <button 
                                  onClick={() => navigator.clipboard.writeText(actualCode)}
                                  type="button"
                                  className="hover:text-white p-0.5 rounded transition-colors"
                                  title="Copy Code"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                              <pre className="p-3 overflow-x-auto"><code>{actualCode}</code></pre>
                            </div>
                          );
                        }
                        // Text block
                        return <span key={idx}>{block}</span>;
                      })
                    ) : (
                      msg.text
                    )}
                  </div>
                  <span className="text-[9px] text-slate-500 self-end px-1">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {/* Streaming Typing Indicator Message */}
            {aiStatus === "typing" && streamingMessage && (
              <div className="flex gap-2.5 max-w-[85%] mr-auto">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border bg-purple-950/60 border-purple-800/50 text-purple-400">
                  <Sparkles className="w-3 h-3 animate-spin" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="p-3 rounded-xl bg-[#26262a] text-slate-200 border border-[#2d2d30] rounded-tl-none shadow-md leading-relaxed whitespace-pre-wrap">
                    {streamingMessage.includes("```") ? (
                      streamingMessage.split("```").map((block, idx) => {
                        if (idx % 2 === 1) {
                          const codeLines = block.split("\n");
                          const lang = codeLines[0].trim();
                          const actualCode = codeLines.slice(1).join("\n");
                          return (
                            <div key={idx} className="my-2 border border-slate-700 rounded-lg overflow-hidden font-mono bg-slate-900 text-slate-300 text-[11px]">
                              <div className="bg-slate-950 px-3 py-1 text-[10px] text-slate-500 font-bold border-b border-slate-800 flex justify-between items-center">
                                <span>{lang || "code"}</span>
                              </div>
                              <pre className="p-3 overflow-x-auto"><code>{actualCode}</code></pre>
                            </div>
                          );
                        }
                        return <span key={idx}>{block}</span>;
                      })
                    ) : (
                      streamingMessage
                    )}
                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-purple-400 animate-pulse"></span>
                  </div>
                </div>
              </div>
            )}

            {/* Thinking Indicator Animation */}
            {aiStatus === "thinking" && (
              <div className="flex gap-2.5 max-w-[85%] mr-auto items-start">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border bg-purple-950/60 border-purple-800/50 text-purple-400 animate-pulse">
                  <Sparkles className="w-3 h-3 animate-spin" />
                </div>
                <div className="bg-[#26262a] border border-[#2d2d30] p-3 rounded-xl rounded-tl-none flex items-center gap-1">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Panel */}
          <div className="px-4 py-2 border-t border-[#2d2d30] bg-[#1a1a1d] flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Quick Prompts</span>
            <div className="flex flex-wrap gap-1.5">
              <button 
                onClick={() => handleQuickPrompt("explain")}
                type="button"
                disabled={aiStatus !== "idle"}
                className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-white bg-[#26262a] hover:bg-[#34343a] border border-[#3e3e44] hover:border-slate-500 px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Code className="w-3 h-3" />
                <span>Explain file</span>
              </button>
              <button 
                onClick={() => handleQuickPrompt("refactor")}
                type="button"
                disabled={aiStatus !== "idle"}
                className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-white bg-[#26262a] hover:bg-[#34343a] border border-[#3e3e44] hover:border-slate-500 px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Bug className="w-3 h-3" />
                <span>Refactor</span>
              </button>
              <button 
                onClick={() => handleQuickPrompt("test")}
                type="button"
                disabled={aiStatus !== "idle"}
                className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-white bg-[#26262a] hover:bg-[#34343a] border border-[#3e3e44] hover:border-slate-500 px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <PlayCircle className="w-3 h-3" />
                <span>Write Tests</span>
              </button>
            </div>
          </div>

          {/* Input Area */}
          <form 
            onSubmit={handleSendMessage} 
            className="p-3 bg-[#1e1e21] border-t border-[#2d2d30] flex flex-col gap-2"
          >
            <div className="relative flex items-end bg-[#26262a] border border-[#3e3e44] focus-within:border-purple-500 rounded-lg p-2 transition-colors">
              <textarea
                ref={messageInputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                disabled={aiStatus !== "idle"}
                placeholder="Ask AI Copilot to generate or explain..."
                className="flex-1 max-h-24 min-h-[40px] resize-none bg-transparent text-white text-xs placeholder-slate-500 self-center focus:outline-none scrollbar-none py-1 pl-1"
                rows={1}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || aiStatus !== "idle"}
                className={`p-1.5 rounded-md transition-all self-center ${
                  inputMessage.trim() && aiStatus === "idle"
                    ? "bg-purple-600 text-white hover:bg-purple-700 shadow-sm cursor-pointer"
                    : "text-slate-600 bg-transparent cursor-not-allowed"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-[9px] text-slate-600 text-center">
              AI Copilot can make mistakes. Verify critical code details.
            </span>
          </form>
        </div>

      </div>

      {/* 5. Status Bar (Bottom) */}
      <footer className="h-6 bg-[#007ACC] flex items-center justify-between px-4 text-xs text-white select-none z-20 shrink-0 font-medium">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 hover:bg-[#1f8ad2] px-2 py-0.5 cursor-pointer h-full">
            <GitBranch className="w-3.5 h-3.5" />
            <span>main</span>
          </div>
          <div className="flex items-center gap-2 hover:bg-[#1f8ad2] px-2 py-0.5 cursor-pointer h-full">
            <div className="flex items-center gap-0.5">
              <span className="font-semibold">0</span>
              <X className="w-3 h-3 text-red-200" />
            </div>
            <div className="flex items-center gap-0.5">
              <span className="font-semibold">0</span>
              <Bug className="w-3 h-3 text-amber-200" />
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-blue-100 font-mono">
            <TerminalSquare className="w-3.5 h-3.5" />
            <span>AI Status: {aiStatus.toUpperCase()}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hover:bg-[#1f8ad2] px-2 py-0.5 cursor-pointer h-full hidden md:inline">Ln 14, Col 5</span>
          <span className="hover:bg-[#1f8ad2] px-2 py-0.5 cursor-pointer h-full hidden md:inline">Spaces: 2</span>
          <span className="hover:bg-[#1f8ad2] px-2 py-0.5 cursor-pointer h-full hidden sm:inline">UTF-8</span>
          <span className="hover:bg-[#1f8ad2] px-2 py-0.5 cursor-pointer h-full">TypeScript JSX</span>
          <span className="hover:bg-[#1f8ad2] px-2.5 py-0.5 cursor-pointer h-full text-blue-100">
            <Sparkles className={`w-3.5 h-3.5 inline mr-1 ${aiStatus !== "idle" ? "animate-spin text-amber-200" : ""}`} />
            <span>Copilot Sync'd</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
