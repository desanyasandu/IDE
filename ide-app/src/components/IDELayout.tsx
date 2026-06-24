import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import ShareModal from "./ShareModal";
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
  Moon,
  Sun,
  TerminalSquare,
  Hash,
  Send,
  Terminal,
  Zap,
  CheckCheck,
  Mic,
  MicOff,
  PhoneCall,
  Video,
  PhoneOff,
  MonitorUp,
  Volume2,
  UserPlus,
  LogOut,
  LogIn
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

  // Panel resizing states
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(260);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(380);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(220);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<"terminal" | "output" | "problems">("terminal");
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "Microsoft Windows [Version 10.0.22631]",
    "(c) Microsoft Corporation. All rights reserved.",
    "",
    "c:\\Users\\DYD\\Desktop\\IDE\\ide-app> "
  ]);
  const [outputLogs, setOutputLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [isResizingBottom, setIsResizingBottom] = useState(false);

  // Mouse drag handlers for resizing panels
  const startResizingLeft = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizingLeft(true);
    const startX = mouseDownEvent.clientX;
    const startWidth = leftSidebarWidth;

    const doDrag = (mouseMoveEvent: MouseEvent) => {
      const newWidth = startWidth + (mouseMoveEvent.clientX - startX);
      if (newWidth >= 160 && newWidth <= 500) {
        setLeftSidebarWidth(newWidth);
      }
    };

    const stopDrag = () => {
      setIsResizingLeft(false);
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  const startResizingRight = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizingRight(true);
    const startX = mouseDownEvent.clientX;
    const startWidth = rightSidebarWidth;

    const doDrag = (mouseMoveEvent: MouseEvent) => {
      const newWidth = startWidth - (mouseMoveEvent.clientX - startX);
      if (newWidth >= 280 && newWidth <= 650) {
        setRightSidebarWidth(newWidth);
      }
    };

    const stopDrag = () => {
      setIsResizingRight(false);
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  const startResizingBottom = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizingBottom(true);
    const startY = mouseDownEvent.clientY;
    const startHeight = bottomPanelHeight;

    const doDrag = (mouseMoveEvent: MouseEvent) => {
      const newHeight = startHeight - (mouseMoveEvent.clientY - startY);
      if (newHeight >= 100 && newHeight <= 550) {
        setBottomPanelHeight(newHeight);
      }
    };

    const stopDrag = () => {
      setIsResizingBottom(false);
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };


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
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<"editor" | "interface" | "ai">("editor");
  const [minimapEnabled, setMinimapEnabled] = useState<boolean>(true);
  const [wordWrap, setWordWrap] = useState<"on" | "off">("on");
  const [tabSize, setTabSize] = useState<number>(2);
  const [cursorBlinking, setCursorBlinking] = useState<"smooth" | "blink" | "solid" | "expand">("smooth");
  const [autoSave, setAutoSave] = useState<boolean>(false);

  // Sync theme with body class
  useEffect(() => {
    if (editorTheme === "vs-dark") {
      document.body.classList.remove("light-mode");
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
    }
  }, [editorTheme]);

  // UI state for clipboard copy confirmations
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Collaborative Call states
  const [isCallActive, setIsCallActive] = useState(true);
  const [isCallPanelOpen, setIsCallPanelOpen] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

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
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(prev => {
        const space = prev.trim() ? " " : "";
        return prev + space + transcript;
      });
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleVoiceInputToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

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

  // Run Code logic simulating dynamic console printing
  const handleRunCode = () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setBottomPanelOpen(true);
    setActiveBottomTab("output");
    setOutputLogs([]);

    const logLines = [
      `[${new Date().toLocaleTimeString()}] Starting build process for ${files[activeFilePath].name}...`,
      `[${new Date().toLocaleTimeString()}] Running typescript compilation & assets optimization...`,
      `[${new Date().toLocaleTimeString()}] Vite v7.0.4 building for production...`,
      `[${new Date().toLocaleTimeString()}] ✓ 32 modules transformed.`,
      `[${new Date().toLocaleTimeString()}] dist/index.html                     0.39 kB │ gzip: 0.25 kB`,
      `[${new Date().toLocaleTimeString()}] dist/assets/index-D7a8B9cE.css      8.42 kB │ gzip: 2.10 kB`,
      `[${new Date().toLocaleTimeString()}] dist/assets/index-Bf9e42Ac.js     142.18 kB │ gzip: 46.50 kB`,
      `[${new Date().toLocaleTimeString()}] ✓ built in 580ms`,
      `[${new Date().toLocaleTimeString()}] Launching Tauri application container...`,
      `[${new Date().toLocaleTimeString()}] Cod Code IDE window successfully mounted (Tauri backend initialized).`,
      `[${new Date().toLocaleTimeString()}] Application is running at http://localhost:1420/`
    ];

    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < logLines.length) {
        setOutputLogs(prev => [...prev, logLines[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 400);
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

  // Copy code to clipboard helper
  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Handle sending chat message
  const handleSendMessage = async (e: React.FormEvent) => {
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

    setAiStatus("thinking");

    try {
      // Map history to Ollama API format
      const ollamaMessages = messages.map(m => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      }));
      
      // Add current message
      ollamaMessages.push({ role: "user", content: promptText });

      // Add developer system instructions
      ollamaMessages.unshift({
        role: "system",
        content: `You are an AI Developer Assistant built into an IDE. You are helping the user with their workspace. You have access to their current file: ${files[activeFilePath]?.name || "None"}. Help them write, explain, refactor, or test code.`
      });

      const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gemma4:e4b",
          messages: ollamaMessages,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama server returned status ${response.status}`);
      }

      setAiStatus("typing");
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulatedText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          
          for (const line of lines) {
            if (line.trim() === "") continue;
            try {
              const parsed = JSON.parse(line);
              if (parsed.message?.content) {
                accumulatedText += parsed.message.content;
                setStreamingMessage(accumulatedText);
              }
            } catch (err) {
              console.error("Error parsing streaming line:", err, line);
            }
          }
        }
      }

      const aiMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: "ai",
        text: accumulatedText || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setStreamingMessage("");
      setAiStatus("idle");

    } catch (error) {
      console.error("Local Gemma 4 connection failed:", error);
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: "ai",
        text: "Error: Failed to connect to local Gemma 4 model. Please ensure Ollama is running on port 11434 and 'gemma4:e4b' is downloaded.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
      setStreamingMessage("");
      setAiStatus("idle");
    }
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".tsx")) {
      return (
        <svg className="w-4 h-4 text-sky-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.09 13.06c-.4.48-1 .74-1.74.74-.78 0-1.39-.28-1.78-.81-.38-.53-.59-1.25-.59-2.09 0-.89.21-1.63.6-2.16.39-.54 1.01-.83 1.78-.83.74 0 1.34.26 1.74.74.39.49.59 1.2.59 2.11 0 .96-.19 1.68-.6 2.14z"/>
        </svg>
      );
    }
    if (fileName.endsWith(".css")) return <Hash className="w-4 h-4 text-teal-400 shrink-0" />;
    if (fileName.endsWith(".json")) return <FileJson className="w-4 h-4 text-amber-500 shrink-0" />;
    return <FileCode className="w-4 h-4 text-slate-400 shrink-0" />;
  };

  const activeFile = files[activeFilePath] || initialFiles["src/components/IDELayout.tsx"];

  return (
    <div 
      data-testid="ide-container" 
      className={`flex flex-col w-full h-full select-none overflow-hidden font-sans gpu-layer transition-colors duration-250 ${
        editorTheme === "vs-dark" 
          ? "bg-[#121215] text-slate-200" 
          : "bg-[#f3f4f6] text-slate-800"
      }`}
    >
      {/* Top Header / Title Bar */}
      <header className={`h-11 flex items-center justify-between px-4 text-xs font-medium z-30 border-b transition-colors duration-250 ${
        editorTheme === "vs-dark"
          ? "bg-[#1a1a1f] border-[#25252b] text-slate-400"
          : "bg-[#ffffff] border-[#e5e7eb] text-slate-600 shadow-sm"
      }`}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block hover:brightness-110 cursor-pointer transition-all"></span>
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block hover:brightness-110 cursor-pointer transition-all"></span>
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block hover:brightness-110 cursor-pointer transition-all"></span>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span className={`font-semibold tracking-wide font-mono transition-colors duration-250 ${editorTheme === "vs-dark" ? "text-slate-300" : "text-slate-700"}`}>Cod Code IDE</span>
          </div>
        </div>
        
        {/* Active file display */}
        <div className={`hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full border transition-colors duration-250 ${
          editorTheme === "vs-dark"
            ? "bg-[#0e0e11]/80 border-slate-800/80"
            : "bg-[#f3f4f6] border-slate-300/80"
        }`}>
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            editorTheme === "vs-dark"
              ? "text-indigo-400 bg-indigo-950/40 border-indigo-900/40"
              : "text-indigo-600 bg-indigo-50 border-indigo-200"
          }`}>Active Workspace</span>
          <span className={`text-xs font-mono select-all transition-colors duration-250 ${editorTheme === "vs-dark" ? "text-slate-300" : "text-slate-700"}`}>{activeFile?.path}</span>
        </div>

        {/* Multiplayer Avatars & Share */}
        <div className="flex items-center ml-auto mr-4 gap-3">
          <div className="flex -space-x-2">
            <img className="w-7 h-7 rounded-full border border-[#1a1a1f] bg-indigo-500 hover:z-10 hover:scale-110 transition-transform cursor-pointer" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4" alt="Alex" title="Alex is editing IDELayout.tsx" />
            <img className="w-7 h-7 rounded-full border border-[#1a1a1f] bg-emerald-500 hover:z-10 hover:scale-110 transition-transform cursor-pointer" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sam&backgroundColor=c0aede" alt="Sam" title="Sam is editing App.css" />
            <div className="w-7 h-7 rounded-full border-2 border-purple-500/80 bg-purple-950 flex items-center justify-center text-[10px] font-bold text-purple-300 z-10 shadow-[0_0_8px_rgba(168,85,247,0.4)]" title="AI Agent is active">AI</div>
          </div>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg text-[11px] font-bold transition-all shadow-md shadow-indigo-900/30 hover:shadow-[0_0_10px_rgba(99,102,241,0.4)] cursor-pointer"
            title="Invite Collaborators"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setEditorTheme(prev => prev === "vs-dark" ? "light" : "vs-dark")}
            className={`p-1.5 rounded-lg hover-scale cursor-pointer transition-colors duration-250 ${
              editorTheme === "vs-dark"
                ? "hover:bg-slate-800/50 text-slate-400 hover:text-white"
                : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"
            }`}
            title="Toggle Light/Dark Theme"
          >
            {editorTheme === "vs-dark" ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform duration-500 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400 transition-transform duration-500 hover:-rotate-12" />
            )}
          </button>

          <button 
            type="button"
            onClick={() => setBottomPanelOpen(prev => !prev)}
            className={`p-1.5 rounded-lg hover-scale cursor-pointer transition-colors duration-250 ${
              bottomPanelOpen 
                ? (editorTheme === "vs-dark" ? "bg-[#25252b] text-indigo-400" : "bg-indigo-50 text-indigo-600") 
                : (editorTheme === "vs-dark" ? "text-slate-400 hover:bg-slate-800/50 hover:text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800")
            }`}
            title="Toggle Bottom Console Panel"
          >
            <TerminalSquare className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handleRunCode}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3 py-1.5 rounded-lg text-xs hover-scale cursor-pointer font-semibold shadow-md shadow-emerald-950/20"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Run App</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex flex-1 w-full overflow-hidden relative">
        
        {/* 1. Activity Bar (Far Left) */}
        <div className={`w-13 flex flex-col justify-between items-center py-3 z-20 shrink-0 border-r transition-colors duration-250 ${
          editorTheme === "vs-dark"
            ? "bg-[#0d0d10] border-[#25252b] text-slate-400"
            : "bg-[#f9fafb] border-[#e5e7eb] text-slate-500"
        }`}>
          <div className="flex flex-col gap-2.5 w-full items-center">
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
              className={`p-2.5 rounded-xl transition-all duration-300 relative hover-scale group cursor-pointer ${
                leftSidebarOpen && activeLeftTab === "explorer" 
                  ? (editorTheme === "vs-dark" ? "text-indigo-400 bg-[#1a1a24] shadow-inner" : "text-indigo-600 bg-indigo-50 shadow-sm") 
                  : (editorTheme === "vs-dark" ? "hover:text-slate-200 hover:bg-slate-900/60" : "hover:text-slate-800 hover:bg-slate-100")
              }`}
              title="File Explorer"
            >
              <Folder className="w-5.5 h-5.5" />
              {leftSidebarOpen && activeLeftTab === "explorer" && (
                <span className="absolute left-0 top-1/4 w-[3px] h-1/2 bg-indigo-500 rounded-r shadow-[0_0_8px_#6366f1]"></span>
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
              className={`p-2.5 rounded-xl transition-all duration-300 relative hover-scale group cursor-pointer ${
                leftSidebarOpen && activeLeftTab === "search" 
                  ? (editorTheme === "vs-dark" ? "text-indigo-400 bg-[#1a1a24] shadow-inner" : "text-indigo-600 bg-indigo-50 shadow-sm") 
                  : (editorTheme === "vs-dark" ? "hover:text-slate-200 hover:bg-slate-900/60" : "hover:text-slate-800 hover:bg-slate-100")
              }`}
              title="Search"
            >
              <Search className="w-5.5 h-5.5" />
              {leftSidebarOpen && activeLeftTab === "search" && (
                <span className="absolute left-0 top-1/4 w-[3px] h-1/2 bg-indigo-500 rounded-r shadow-[0_0_8px_#6366f1]"></span>
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
              className={`p-2.5 rounded-xl transition-all duration-300 relative hover-scale group cursor-pointer ${
                leftSidebarOpen && activeLeftTab === "git" 
                  ? (editorTheme === "vs-dark" ? "text-indigo-400 bg-[#1a1a24] shadow-inner" : "text-indigo-600 bg-indigo-50 shadow-sm") 
                  : (editorTheme === "vs-dark" ? "hover:text-slate-200 hover:bg-slate-900/60" : "hover:text-slate-800 hover:bg-slate-100")
              }`}
              title="Source Control"
            >
              <GitBranch className="w-5.5 h-5.5" />
              {leftSidebarOpen && activeLeftTab === "git" && (
                <span className="absolute left-0 top-1/4 w-[3px] h-1/2 bg-indigo-500 rounded-r shadow-[0_0_8px_#6366f1]"></span>
              )}
            </button>

            {/* Collaborative Call Toggle */}
            <button
              onClick={() => {
                if (!isCallActive) {
                  setIsCallActive(true);
                  setIsCallPanelOpen(true);
                } else {
                  setIsCallPanelOpen(!isCallPanelOpen);
                }
              }}
              className={`p-2.5 rounded-xl transition-all duration-300 relative hover-scale group cursor-pointer ${
                isCallActive && isCallPanelOpen
                  ? "text-emerald-400 bg-emerald-950/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]" 
                  : isCallActive
                  ? "text-emerald-500 hover:text-emerald-400 hover:bg-slate-900/60 animate-pulse"
                  : "hover:text-slate-200 hover:bg-slate-900/60 text-slate-400"
              }`}
              title="Collaborative Call"
            >
              <PhoneCall className="w-5.5 h-5.5" />
              {isCallActive && isCallPanelOpen && (
                <span className="absolute left-0 top-1/4 w-[3px] h-1/2 bg-emerald-500 rounded-r shadow-[0_0_8px_#10b981]"></span>
              )}
            </button>

            <hr className="w-8 border-slate-800/80 my-1.5" />

            {/* AI Assistant Sidebar Toggle (Activates right sidebar with pulse glow) */}
            <button
              onClick={() => setRightSidebarOpen(prev => !prev)}
              className={`p-2.5 rounded-xl transition-all duration-300 relative cursor-pointer ${
                rightSidebarOpen 
                  ? (editorTheme === "vs-dark" 
                      ? "text-purple-400 bg-purple-950/20 border border-purple-800/40 shadow-[0_0_15px_rgba(168,85,247,0.25)] animate-pulse-glow-purple" 
                      : "text-purple-600 bg-purple-50 border border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)] animate-pulse-glow-purple")
                  : (editorTheme === "vs-dark" ? "hover:text-purple-400 hover:bg-purple-950/10" : "hover:text-purple-600 hover:bg-purple-50")
              }`}
              title="Toggle AI Copilot"
            >
              <Sparkles className={`w-5.5 h-5.5 ${rightSidebarOpen ? "text-purple-400" : "text-slate-400"}`} />
            </button>
          </div>

          <div className="flex flex-col gap-2 w-full items-center relative">
            <button 
              onClick={() => setIsAccountMenuOpen(prev => !prev)}
              className={`p-2.5 rounded-xl transition-all cursor-pointer hover-scale ${
                isAccountMenuOpen 
                  ? (editorTheme === "vs-dark" ? "text-indigo-400 bg-[#1a1a24] shadow-inner" : "text-indigo-600 bg-indigo-50 shadow-sm")
                  : (editorTheme === "vs-dark" ? "hover:text-slate-200 hover:bg-slate-900/60" : "hover:text-slate-800 hover:bg-slate-100")
              }`} 
              title="Accounts"
            >
              <User className="w-5.5 h-5.5" />
            </button>
            
            {/* Account Context Menu */}
            {isAccountMenuOpen && (
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
                        setIsAccountMenuOpen(false);
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
                        setIsAccountMenuOpen(false);
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
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Owner" className="w-6 h-6 rounded-full" alt="avatar" />
                      <span>owner@antigravity.studio</span>
                    </div>
                    <button className={`flex items-center gap-2.5 px-4 py-3 text-sm transition-colors cursor-pointer text-left ${
                      editorTheme === "vs-dark" ? "hover:bg-slate-800/50 hover:text-white" : "hover:bg-slate-50 hover:text-indigo-600"
                    }`}>
                      <Settings className="w-4 h-4" />
                      <span>Manage Account</span>
                    </button>
                    <button 
                      onClick={() => {
                        setIsSignedIn(false);
                        setIsAccountMenuOpen(false);
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
            )}

            <button 
              onClick={() => setShowSettings(true)}
              className={`p-2.5 rounded-xl transition-all cursor-pointer hover-scale ${
                showSettings 
                  ? (editorTheme === "vs-dark" ? "text-indigo-400 bg-[#1a1a24] shadow-inner" : "text-indigo-600 bg-indigo-50 shadow-sm") 
                  : (editorTheme === "vs-dark" ? "hover:text-slate-200 hover:bg-slate-900/60" : "hover:text-slate-800 hover:bg-slate-100")
              }`} 
              title="Settings"
            >
              <Settings className="w-5.5 h-5.5" />
            </button>
          </div>
        </div>

        {/* 2. Left Collapsible Sidebar */}
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
            <div className="flex flex-col h-full text-xs">
              <div className={`p-3.5 flex items-center justify-between font-semibold tracking-wider text-[10px] uppercase border-b transition-colors duration-250 ${
                editorTheme === "vs-dark" ? "border-[#25252b] text-slate-400" : "border-[#e5e7eb] text-slate-500"
              }`}>
                <span>Explorer: Project</span>
                <div className="flex items-center gap-1.5">
                  <button className={`p-1 rounded cursor-pointer transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-800/60 text-slate-400 hover:text-white" : "hover:bg-slate-200 text-slate-600 hover:text-slate-900"}`} title="New File">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button className={`p-1 rounded cursor-pointer transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-800/60 text-slate-400 hover:text-white" : "hover:bg-slate-200 text-slate-600 hover:text-slate-900"}`} title="Refresh">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Explorer File Tree */}
              <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
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
                    <span>ide-app</span>
                  </button>

                  {explorerExpanded.root && (
                    <div className={`pl-4 mt-0.5 border-l ml-4.5 flex flex-col gap-0.5 ${editorTheme === "vs-dark" ? "border-slate-800/60" : "border-slate-200"}`}>
                      {/* Src Directory */}
                      <div>
                        <button
                          onClick={() => setExplorerExpanded(prev => ({ ...prev, src: !prev.src }))}
                          className={`flex items-center gap-1.5 w-full py-1.5 px-2 rounded-lg text-left transition-colors cursor-pointer ${
                            editorTheme === "vs-dark" ? "hover:bg-slate-800/30 text-slate-300" : "hover:bg-slate-200/50 text-slate-700"
                          }`}
                        >
                          <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-250 ${!explorerExpanded.src ? "-rotate-90" : ""}`} />
                          <Folder className="w-4 h-4 text-indigo-400 fill-indigo-400/10 shrink-0" />
                          <span>src</span>
                        </button>

                        {explorerExpanded.src && (
                          <div className={`pl-4 border-l ml-4 flex flex-col gap-0.5 ${editorTheme === "vs-dark" ? "border-slate-800/60" : "border-slate-200"}`}>
                            {/* Components Directory */}
                            <div>
                              <button
                                onClick={() => setExplorerExpanded(prev => ({ ...prev, components: !prev.components }))}
                                className={`flex items-center gap-1.5 w-full py-1.5 px-2 rounded-lg text-left transition-colors cursor-pointer ${
                                  editorTheme === "vs-dark" ? "hover:bg-slate-800/30 text-slate-300" : "hover:bg-slate-200/50 text-slate-700"
                                }`}
                              >
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-250 ${!explorerExpanded.components ? "-rotate-90" : ""}`} />
                                <Folder className="w-4 h-4 text-purple-400 fill-purple-400/10 shrink-0" />
                                <span>components</span>
                              </button>

                              {explorerExpanded.components && (
                                <div className={`pl-4 border-l ml-4 flex flex-col gap-0.5 ${editorTheme === "vs-dark" ? "border-slate-800/60" : "border-slate-200"}`}>
                                  {/* IDELayout.tsx */}
                                  <button
                                    onClick={() => handleOpenFile("src/components/IDELayout.tsx")}
                                    className={`flex items-center gap-2 w-full py-1.5 px-2.5 rounded-lg text-left cursor-pointer transition-all duration-200 ${
                                      activeFilePath === "src/components/IDELayout.tsx" 
                                        ? (editorTheme === "vs-dark" 
                                            ? "explorer-item-active text-white font-medium shadow-md shadow-indigo-950/20" 
                                            : "bg-indigo-100/60 border-l-2 border-indigo-600 text-indigo-800 font-medium shadow-sm") 
                                        : (editorTheme === "vs-dark" ? "hover:bg-slate-800/30 text-slate-400 hover:text-slate-200" : "hover:bg-slate-200/50 text-slate-600 hover:text-slate-900")
                                    }`}
                                  >
                                    {getFileIcon("src/components/IDELayout.tsx")}
                                    <span className="font-mono">IDELayout.tsx</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* App.tsx */}
                            <button
                              onClick={() => handleOpenFile("src/App.tsx")}
                              className={`flex items-center gap-2 w-full py-1.5 px-2.5 rounded-lg text-left cursor-pointer transition-all duration-200 ${
                                activeFilePath === "src/App.tsx" 
                                  ? (editorTheme === "vs-dark" 
                                      ? "explorer-item-active text-white font-medium shadow-md shadow-indigo-950/20" 
                                      : "bg-indigo-100/60 border-l-2 border-indigo-600 text-indigo-800 font-medium shadow-sm") 
                                  : (editorTheme === "vs-dark" ? "hover:bg-slate-800/30 text-slate-400 hover:text-slate-200" : "hover:bg-slate-200/50 text-slate-600 hover:text-slate-900")
                              }`}
                            >
                              {getFileIcon("src/App.tsx")}
                              <span className="font-mono">App.tsx</span>
                            </button>

                            {/* index.css */}
                            <button
                              onClick={() => handleOpenFile("src/index.css")}
                              className={`flex items-center gap-2 w-full py-1.5 px-2.5 rounded-lg text-left cursor-pointer transition-all duration-200 ${
                                activeFilePath === "src/index.css" 
                                  ? (editorTheme === "vs-dark" 
                                      ? "explorer-item-active text-white font-medium shadow-md shadow-indigo-950/20" 
                                      : "bg-indigo-100/60 border-l-2 border-indigo-600 text-indigo-800 font-medium shadow-sm") 
                                  : (editorTheme === "vs-dark" ? "hover:bg-slate-800/30 text-slate-400 hover:text-slate-200" : "hover:bg-slate-200/50 text-slate-600 hover:text-slate-900")
                              }`}
                            >
                              {getFileIcon("src/index.css")}
                              <span className="font-mono">index.css</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* package.json */}
                      <button
                        onClick={() => handleOpenFile("package.json")}
                        className={`flex items-center gap-2 w-full py-1.5 px-2.5 rounded-lg text-left cursor-pointer transition-all duration-200 ${
                          activeFilePath === "package.json" 
                            ? (editorTheme === "vs-dark" 
                                ? "explorer-item-active text-white font-medium shadow-md shadow-indigo-950/20" 
                                : "bg-indigo-100/60 border-l-2 border-indigo-600 text-indigo-800 font-medium shadow-sm") 
                            : (editorTheme === "vs-dark" ? "hover:bg-slate-800/30 text-slate-400 hover:text-slate-200" : "hover:bg-slate-200/50 text-slate-600 hover:text-slate-900")
                        }`}
                      >
                        {getFileIcon("package.json")}
                        <span className="font-mono">package.json</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeLeftTab === "search" && (
            <div className="flex flex-col h-full p-4 text-xs">
              <span className={`font-semibold uppercase text-[9px] tracking-wider mb-2.5 ${editorTheme === "vs-dark" ? "text-slate-400" : "text-slate-500"}`}>Search Workspace</span>
              <input 
                type="text" 
                placeholder="Search text..." 
                className={`w-full rounded-lg px-3 py-2 mb-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-xs ${
                  editorTheme === "vs-dark" 
                    ? "bg-[#1b1b22] border-[#2d2d35] text-white" 
                    : "bg-white border-slate-300 text-slate-800"
                }`}
              />
              <span className={`text-center mt-4 ${editorTheme === "vs-dark" ? "text-slate-500" : "text-slate-400"}`}>Type to search for text inside files.</span>
            </div>
          )}

          {activeLeftTab === "git" && (
            <div className="flex flex-col h-full p-4 text-xs">
              <span className={`font-semibold uppercase text-[9px] tracking-wider mb-2.5 ${editorTheme === "vs-dark" ? "text-slate-400" : "text-slate-500"}`}>Source Control</span>
              <div className={`p-3.5 rounded-xl mb-4 shadow-inner border ${
                editorTheme === "vs-dark" 
                  ? "bg-[#1b1b22] border-[#2d2d35]" 
                  : "bg-white border-slate-200"
              }`}>
                <p className={`font-semibold mb-2 flex items-center gap-1.5 ${editorTheme === "vs-dark" ? "text-indigo-400" : "text-indigo-600"}`}>
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>1 Workspace Change</span>
                </p>
                <div className={`flex items-center justify-between text-[11px] py-1 font-mono ${editorTheme === "vs-dark" ? "text-slate-300" : "text-slate-600"}`}>
                  <span className="truncate">src/components/IDELayout.tsx</span>
                  <span className="text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/25">M</span>
                </div>
              </div>
              <textarea 
                placeholder="Commit message..." 
                className={`w-full rounded-xl p-3 h-22 text-xs mb-3 resize-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all ${
                  editorTheme === "vs-dark" 
                    ? "bg-[#1b1b22] border-[#2d2d35] text-white" 
                    : "bg-white border-slate-300 text-slate-800"
                }`}
              />
              <button className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl py-2.5 font-semibold transition-all shadow-md shadow-indigo-950/20 hover-scale cursor-pointer">
                Commit & Push (main)
              </button>
            </div>
          )}
        </div>

        {/* Left Sidebar drag divider */}
        {leftSidebarOpen && (
          <div
            onMouseDown={startResizingLeft}
            className="w-1 hover:w-1.5 bg-transparent hover:bg-indigo-500/50 active:bg-indigo-500 transition-all cursor-col-resize z-30 shrink-0"
            title="Resize Sidebar"
          />
        )}

        {/* 3. Editor Workspace Area (Center) */}
        <div className={`flex-1 flex flex-col min-w-0 relative h-full transition-colors duration-250 ${
          editorTheme === "vs-dark" ? "bg-[#131317]" : "bg-[#ffffff]"
        }`}>
          
          {/* Top Editor Area */}
          <div className="flex-1 flex flex-col min-h-0 w-full relative">
            {/* Tab bar */}
            <div className={`h-10 flex items-center overflow-x-auto select-none scrollbar-none z-10 shrink-0 border-b transition-colors duration-250 ${
              editorTheme === "vs-dark" ? "bg-[#16161a] border-[#1b1b20]" : "bg-[#f3f4f6] border-[#e5e7eb]"
            }`}>
              {openTabs.map(tabPath => {
                const file = files[tabPath] || { name: tabPath };
                const isActive = tabPath === activeFilePath;
                return (
                  <div
                    key={tabPath}
                    onClick={() => setActiveFilePath(tabPath)}
                    className={`group h-full flex items-center gap-2.5 px-4.5 py-2 text-xs cursor-pointer transition-all duration-300 relative border-r ${
                      isActive 
                        ? (editorTheme === "vs-dark" 
                            ? "bg-[#131317] text-white font-medium border-t-2 border-indigo-500 shadow-inner border-r-[#1f1f25]" 
                            : "bg-[#ffffff] text-slate-800 font-medium border-t-2 border-indigo-600 border-r-[#e5e7eb]") 
                        : (editorTheme === "vs-dark" 
                            ? "bg-[#18181c]/60 text-slate-400 hover:bg-[#18181c] hover:text-slate-200 border-r-[#1f1f25]" 
                            : "bg-[#e5e7eb]/60 text-slate-500 hover:bg-[#e5e7eb] hover:text-slate-800 border-r-[#e5e7eb]")
                    }`}
                  >
                    {getFileIcon(file.name)}
                    <span className="font-mono text-[11px]">{file.name}</span>
                    <button
                      onClick={(e) => handleCloseTab(e, tabPath)}
                      className="p-0.5 rounded-full text-slate-500 hover:text-white hover:bg-slate-800/80 transition-colors ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Breadcrumb line */}
            <div className={`h-6.5 flex items-center px-4.5 text-[10px] font-mono gap-1.5 shrink-0 border-b transition-colors duration-250 ${
              editorTheme === "vs-dark" ? "bg-[#131317] border-slate-900 text-slate-500" : "bg-[#ffffff] border-[#e5e7eb] text-slate-600"
            }`}>
              <span className="hover:text-slate-300 cursor-pointer">ide-app</span>
              <ChevronRight className="w-3 h-3" />
              <span className="hover:text-slate-300 cursor-pointer">src</span>
              <ChevronRight className="w-3 h-3" />
              {activeFile?.path?.includes("components") && (
                <>
                  <span className="hover:text-slate-300 cursor-pointer">components</span>
                  <ChevronRight className="w-3 h-3" />
                </>
              )}
              <span className={`font-medium ${editorTheme === "vs-dark" ? "text-indigo-400" : "text-indigo-600"}`}>{activeFile?.name}</span>
            </div>

            {/* Monaco Editor Container */}
            <div className={`flex-1 w-full relative ${editorTheme === "vs-dark" ? "bg-[#1e1e1e]" : "bg-white"}`}>
              <Editor
                height="100%"
                path={activeFile.path}
                language={activeFile.language}
                value={activeFile.content}
                theme={editorTheme}
                onChange={handleEditorChange}
                options={{
                  fontSize: fontSize,
                  minimap: { enabled: minimapEnabled },
                  wordWrap: wordWrap,
                  tabSize: tabSize,
                  cursorBlinking: cursorBlinking,
                  scrollbar: {
                    verticalScrollbarSize: 6,
                    horizontalScrollbarSize: 6,
                    vertical: "visible",
                    horizontal: "visible"
                  },
                  lineNumbers: "on",
                  roundedSelection: true,
                  scrollBeyondLastLine: false,
                  readOnly: false,
                  automaticLayout: true,
                  cursorSmoothCaretAnimation: "on",
                  fontFamily: "Fira Code, Menlo, Monaco, Consolas, monospace",
                  fontLigatures: true,
                  renderLineHighlight: "all",
                  quickSuggestions: { other: true, comments: true, strings: true },
                  suggestOnTriggerCharacters: true
                }}
              />
            </div>

            {/* Code actions bar / Overlay options */}
            <div className={`absolute bottom-4 right-6 flex items-center gap-2 backdrop-blur py-1.5 px-3 rounded-xl shadow-xl text-[11px] z-10 select-none transition-colors duration-250 ${
              editorTheme === "vs-dark" 
                ? "bg-[#1b1b22]/90 border border-slate-800/80 text-slate-300 shadow-black/40" 
                : "bg-white/95 border border-slate-200 text-slate-600 shadow-slate-200/40"
            }`}>
              <span className={`font-bold uppercase text-[9px] tracking-wide pr-1.5 border-r mr-1 ${
                editorTheme === "vs-dark" ? "text-slate-500 border-slate-800" : "text-slate-400 border-slate-200"
              }`}>Font Scale</span>
              <button 
                onClick={() => setFontSize(prev => Math.max(10, prev - 1))}
                className={`p-1 rounded-md w-5 h-5 flex items-center justify-center font-bold font-mono transition-colors cursor-pointer ${
                  editorTheme === "vs-dark" ? "hover:bg-slate-800 text-slate-300 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                }`}
              >
                -
              </button>
              <span className={`font-mono font-semibold ${editorTheme === "vs-dark" ? "text-indigo-400" : "text-indigo-600"}`}>{fontSize}px</span>
              <button 
                onClick={() => setFontSize(prev => Math.min(22, prev + 1))}
                className={`p-1 rounded-md w-5 h-5 flex items-center justify-center font-bold font-mono transition-colors cursor-pointer ${
                  editorTheme === "vs-dark" ? "hover:bg-slate-800 text-slate-300 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                }`}
              >
                +
              </button>
            </div>
          </div>

          {/* Bottom panel divider */}
          {bottomPanelOpen && (
            <div
              onMouseDown={startResizingBottom}
              className="h-1 hover:h-1.5 bg-transparent hover:bg-indigo-500/50 active:bg-indigo-500 transition-all cursor-row-resize z-30 shrink-0"
              title="Resize Bottom Panel"
            />
          )}

          {/* Bottom Panel */}
          <div
            className={`flex flex-col overflow-hidden z-20 border-t transition-colors duration-250 ${
              editorTheme === "vs-dark"
                ? "bg-[#0d0d11] border-[#202025]"
                : "bg-white border-[#e5e7eb]"
            }`}
            style={{ 
              height: bottomPanelOpen ? `${bottomPanelHeight}px` : 0,
              transition: isResizingBottom ? 'none' : 'height 300ms ease-out'
            }}
          >
            {/* Bottom Panel Header */}
            <div className={`h-9 flex items-center justify-between px-4 text-xs font-semibold select-none shrink-0 border-b transition-colors duration-250 ${
              editorTheme === "vs-dark"
                ? "bg-[#141418] border-[#202025] text-slate-400"
                : "bg-[#f3f4f6] border-[#e5e7eb] text-slate-500"
            }`}>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveBottomTab("terminal")}
                  className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all cursor-pointer ${
                    activeBottomTab === "terminal" 
                      ? (editorTheme === "vs-dark" ? "text-indigo-400 border-indigo-500 font-bold" : "text-indigo-600 border-indigo-600 font-bold") 
                      : (editorTheme === "vs-dark" ? "border-transparent hover:text-slate-200" : "border-transparent hover:text-slate-800")
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Terminal</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setActiveBottomTab("output")}
                  className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all cursor-pointer ${
                    activeBottomTab === "output" 
                      ? (editorTheme === "vs-dark" ? "text-indigo-400 border-indigo-500 font-bold" : "text-indigo-600 border-indigo-600 font-bold") 
                      : (editorTheme === "vs-dark" ? "border-transparent hover:text-slate-200" : "border-transparent hover:text-slate-800")
                  }`}
                >
                  <TerminalSquare className="w-3.5 h-3.5" />
                  <span>Output</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveBottomTab("problems")}
                  className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all cursor-pointer ${
                    activeBottomTab === "problems" 
                      ? (editorTheme === "vs-dark" ? "text-indigo-400 border-indigo-500 font-bold" : "text-indigo-600 border-indigo-600 font-bold") 
                      : (editorTheme === "vs-dark" ? "border-transparent hover:text-slate-200" : "border-transparent hover:text-slate-800")
                  }`}
                >
                  <Bug className="w-3.5 h-3.5" />
                  <span>Problems</span>
                </button>
              </div>

              {/* Window action buttons (Clear & Close) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (activeBottomTab === "terminal") {
                      setTerminalHistory([
                        "Microsoft Windows [Version 10.0.22631]",
                        "(c) Microsoft Corporation. All rights reserved.",
                        "",
                        "c:\\Users\\DYD\\Desktop\\IDE\\ide-app> "
                      ]);
                    } else if (activeBottomTab === "output") {
                      setOutputLogs([]);
                    }
                  }}
                  className={`p-1 rounded cursor-pointer transition-colors ${
                    editorTheme === "vs-dark"
                      ? "hover:bg-slate-800 text-slate-400 hover:text-white"
                      : "hover:bg-slate-200 text-slate-500 hover:text-slate-800"
                  }`}
                  title="Clear Console Output"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setBottomPanelOpen(false)}
                  className={`p-1 rounded cursor-pointer transition-colors ${
                    editorTheme === "vs-dark"
                      ? "hover:bg-slate-800 text-slate-400 hover:text-white"
                      : "hover:bg-slate-200 text-slate-500 hover:text-slate-800"
                  }`}
                  title="Close Panel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Panel Content */}
            <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed scrollbar-thin select-text">
              {activeBottomTab === "terminal" && (
                <div className={`h-full flex flex-col ${editorTheme === "vs-dark" ? "text-slate-300" : "text-slate-700"}`}>
                  <div className="flex-1 overflow-y-auto mb-1 whitespace-pre-wrap">
                    {terminalHistory.map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                  {/* Interactive Input Line */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!terminalInput.trim()) return;
                      const cmd = terminalInput.trim();
                      let reply = "";
                      
                      if (cmd === "cls" || cmd === "clear") {
                        setTerminalHistory(["c:\\Users\\DYD\\Desktop\\IDE\\ide-app> "]);
                        setTerminalInput("");
                        return;
                      } else if (cmd === "npm run dev" || cmd === "npm start" || cmd === "run") {
                        handleRunCode();
                        setTerminalInput("");
                        return;
                      } else if (cmd === "git status") {
                        reply = "On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges not staged for commit:\n  (use \"git add <file>...\" to update what will be committed)\n  (use \"git restore <file>...\" to discard changes in working directory)\n\tmodified:   src/components/IDELayout.tsx\n\nno changes added to commit (use \"git add\" and/or \"git commit -a\")";
                      } else if (cmd.startsWith("help")) {
                        reply = "Available commands: cls, clear, npm run dev, run, git status, help, node -v, echo <text>";
                      } else if (cmd === "node -v") {
                        reply = "v20.11.0";
                      } else if (cmd.startsWith("echo ")) {
                        reply = cmd.substring(5);
                      } else {
                        reply = `'${cmd.split(" ")[0]}' is not recognized as an internal or external command,\noperable program or batch file. Type 'help' for commands.`;
                      }

                      setTerminalHistory(prev => {
                        const hist = [...prev];
                        if (hist.length > 0) {
                          hist[hist.length - 1] = hist[hist.length - 1] + cmd;
                        }
                        if (reply) {
                          hist.push(reply);
                        }
                        hist.push("c:\\Users\\DYD\\Desktop\\IDE\\ide-app> ");
                        return hist;
                      });
                      setTerminalInput("");
                    }}
                    className="flex items-center"
                  >
                    <span className="shrink-0">c:\Users\DYD\Desktop\IDE\ide-app&gt;&nbsp;</span>
                    <input
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      className={`flex-1 bg-transparent focus:outline-none border-none outline-none ${
                        editorTheme === "vs-dark" ? "text-slate-200 caret-indigo-400" : "text-slate-800 caret-indigo-650"
                      }`}
                    />
                  </form>
                </div>
              )}

              {activeBottomTab === "output" && (
                <div className={`whitespace-pre-wrap ${editorTheme === "vs-dark" ? "text-slate-300" : "text-slate-700"}`}>
                  {outputLogs.length === 0 ? (
                    <span className="text-slate-500 italic select-none">No build logs. Click 'Run App' in the top bar to run compilation...</span>
                  ) : (
                    outputLogs.map((log, idx) => {
                      if (!log) return null;
                      const hasCheck = log.includes("✓");
                      const hasLaunch = log.includes("Launching") || log.includes("Running");
                      return (
                        <div 
                          key={idx} 
                          className={
                            hasCheck 
                              ? (editorTheme === "vs-dark" ? "text-emerald-400" : "text-emerald-600 font-semibold") 
                              : hasLaunch 
                              ? (editorTheme === "vs-dark" ? "text-indigo-400" : "text-indigo-600 font-semibold") 
                              : (editorTheme === "vs-dark" ? "text-slate-300" : "text-slate-700")
                          }
                        >
                          {log}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeBottomTab === "problems" && (
                <div className={`select-none flex flex-col items-center justify-center h-full gap-2 ${
                  editorTheme === "vs-dark" ? "text-slate-400" : "text-slate-500"
                }`}>
                  <Bug className={`w-8 h-8 animate-pulse ${editorTheme === "vs-dark" ? "text-slate-600" : "text-slate-300"}`} />
                  <span>No problems have been detected in the workspace. Clean build!</span>
                </div>
              )}
            </div>
          </div>

          {/* Floating Call UI Panel */}
          {isCallActive && isCallPanelOpen && (
            <div className="absolute top-6 right-6 w-72 bg-[#141419]/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/60 z-40 overflow-hidden flex flex-col animate-slide-up">
              {/* Call Header */}
              <div className="bg-[#1b1b22] px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between cursor-move select-none">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">Collab Session</span>
                </div>
                <button 
                  onClick={() => setIsCallPanelOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Call Video/Avatars Grid */}
              <div className="p-4 grid grid-cols-2 gap-3 bg-[#0d0d10]/40">
                {/* User 1 */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-800/50 border-2 border-emerald-500/50 flex flex-col items-center justify-center group shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4" className="w-14 h-14 rounded-full" alt="Alex" />
                  <div className="absolute bottom-1.5 left-2 right-2 bg-black/60 backdrop-blur-md rounded-md px-1.5 py-0.5 flex items-center justify-between">
                    <span className="text-[9px] font-medium text-white truncate">Alex</span>
                    <Mic className="w-2.5 h-2.5 text-emerald-400" />
                  </div>
                </div>
                {/* User 2 */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-800/50 border border-slate-700/50 flex flex-col items-center justify-center group">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sam&backgroundColor=c0aede" className="w-14 h-14 rounded-full opacity-80" alt="Sam" />
                  <div className="absolute bottom-1.5 left-2 right-2 bg-black/60 backdrop-blur-md rounded-md px-1.5 py-0.5 flex items-center justify-between">
                    <span className="text-[9px] font-medium text-white truncate">Sam</span>
                    <MicOff className="w-2.5 h-2.5 text-red-400" />
                  </div>
                </div>
                {/* AI Agent Avatar */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-purple-950/20 border-2 border-purple-500/50 flex flex-col items-center justify-center group shadow-[0_0_15px_rgba(168,85,247,0.15)] col-span-2 h-28">
                  <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center border-2 border-purple-400/50 animate-pulse-glow-purple">
                     <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute bottom-2 left-3 right-3 bg-black/60 backdrop-blur-md rounded-lg px-2 py-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-300">Agent Alpha</span>
                    <Volume2 className="w-3 h-3 text-emerald-400 animate-pulse" />
                  </div>
                  {/* Audio wave mock */}
                  <div className="absolute top-3 right-3 flex gap-0.5">
                    <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: "0ms"}}></span>
                    <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: "100ms"}}></span>
                    <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: "200ms"}}></span>
                  </div>
                </div>
              </div>

              {/* Call Controls */}
              <div className="bg-[#1b1b22] p-3 flex justify-center gap-3 border-t border-slate-800/80">
                <button className="p-2.5 rounded-full bg-slate-700/50 hover:bg-slate-600 text-white transition-colors cursor-pointer" title="Mute">
                  <Mic className="w-4.5 h-4.5" />
                </button>
                <button className="p-2.5 rounded-full bg-slate-700/50 hover:bg-slate-600 text-white transition-colors cursor-pointer" title="Deafen">
                  <Volume2 className="w-4.5 h-4.5" />
                </button>
                <button className="p-2.5 rounded-full bg-slate-700/50 hover:bg-slate-600 text-white transition-colors cursor-pointer" title="Share Screen">
                  <MonitorUp className="w-4.5 h-4.5" />
                </button>
                <button 
                  onClick={() => setIsCallActive(false)}
                  className="p-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40 transition-colors cursor-pointer" 
                  title="Disconnect"
                >
                  <PhoneOff className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar drag divider */}
        {rightSidebarOpen && (
          <div
            onMouseDown={startResizingRight}
            className="w-1 hover:w-1.5 bg-transparent hover:bg-purple-500/50 active:bg-purple-500 transition-all cursor-col-resize z-30 shrink-0"
            title="Resize AI Panel"
          />
        )}

        {/* 4. Right Collapsible Sidebar (AI Chat Interface) */}
        <div 
          className={`flex flex-col overflow-hidden relative z-10 gpu-layer border-l transition-colors duration-250 ${
            editorTheme === "vs-dark"
              ? "bg-[#121216] border-[#25252b]"
              : "bg-[#f9fafb] border-[#e5e7eb]"
          }`}
          style={{ 
            width: rightSidebarOpen ? `${rightSidebarWidth}px` : 0,
            transition: isResizingRight ? 'none' : 'width 300ms ease-out'
          }}
        >
          {/* Header with gradient flow */}
          <div className={`p-4 flex items-center justify-between border-b transition-colors duration-250 ${
            editorTheme === "vs-dark"
              ? "bg-gradient-to-r from-[#17171d] via-[#1a1a24] to-[#121217] border-[#25252b]"
              : "bg-gradient-to-r from-[#f9fafb] via-[#f3f4f6] to-[#f9fafb] border-[#e5e7eb]"
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.15)] animate-pulse-glow-purple">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-500 block">System AI</span>
                <span className={`text-[13px] font-bold block -mt-0.5 transition-colors duration-250 ${editorTheme === "vs-dark" ? "text-slate-100" : "text-slate-800"}`}>Coding Assistant</span>
              </div>
            </div>
            
            <button
              onClick={() => setRightSidebarOpen(false)}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                editorTheme === "vs-dark" ? "hover:bg-slate-800/60 text-slate-400 hover:text-white" : "hover:bg-slate-200 text-slate-500 hover:text-slate-800"
              }`}
              title="Close Copilot Panel"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* AI Status Indicator Bar */}
          <div className={`px-4 py-2 flex items-center justify-between text-xs border-b transition-colors duration-250 ${
            editorTheme === "vs-dark"
              ? "border-[#202025] bg-[#0c0c0f]/80 text-slate-400"
              : "border-[#e5e7eb] bg-[#f3f4f6] text-slate-500"
          }`}>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {aiStatus !== "idle" && (
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    aiStatus === "thinking" ? "bg-amber-400" : "bg-cyan-400"
                  }`}></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  aiStatus === "idle" 
                    ? "bg-emerald-500" 
                    : aiStatus === "thinking" 
                    ? "bg-amber-400" 
                    : "bg-cyan-400"
                }`}></span>
              </span>
              <span className={`font-semibold ${editorTheme === "vs-dark" ? "text-slate-300" : "text-slate-700"}`}>
                Copilot:{" "}
                <span className={`font-bold uppercase tracking-wide text-[10px] px-1.5 py-0.5 rounded border ${
                  aiStatus === "thinking" 
                    ? (editorTheme === "vs-dark" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" : "text-amber-600 bg-amber-50 border-amber-200") 
                    : aiStatus === "typing" 
                    ? (editorTheme === "vs-dark" ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/20 animate-pulse" : "text-cyan-600 bg-cyan-50 border-cyan-200 animate-pulse") 
                    : (editorTheme === "vs-dark" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-emerald-600 bg-emerald-50 border-emerald-250")
                }`}>
                  {aiStatus === "idle" ? "Ready" : aiStatus}
                </span>
              </span>
            </div>
            {aiStatus !== "idle" && (
              <span className="text-[10px] text-slate-500 font-mono animate-pulse">
                {aiStatus === "thinking" ? "synching references..." : "streaming code..."}
              </span>
            )}
          </div>

          {/* Chat Timeline (Scrollable Messages Area) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[88%] animate-slide-up ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Sender Avatar */}
                <div className={`w-7.5 h-7.5 rounded-xl flex items-center justify-center shrink-0 border shadow-md ${
                  msg.sender === "user" 
                    ? "bg-slate-700/80 border-slate-600/50 text-slate-300" 
                    : "bg-purple-950/40 border-purple-800/40 text-purple-400"
                }`}>
                  {msg.sender === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-3.5 h-3.5" />}
                </div>

                {/* Message Bubble */}
                <div className="flex flex-col gap-1.5 max-w-full">
                  <div className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap shadow-md transition-colors duration-250 ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-none"
                      : (editorTheme === "vs-dark" 
                          ? "glass-panel text-slate-200 border border-slate-800/60 rounded-tl-none" 
                          : "bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm")
                  }`}>
                    {/* Render Code Formatting in Chat Messages */}
                    {msg.text.includes("```") ? (
                      msg.text.split("```").map((block, idx) => {
                        if (idx % 2 === 1) {
                          // Code block
                          const codeLines = block.split("\n");
                          const lang = codeLines[0].trim();
                          const actualCode = codeLines.slice(1).join("\n");
                          const copyId = `${msg.id}-${idx}`;
                          return (
                            <div key={idx} className={`my-2.5 border rounded-xl overflow-hidden font-mono text-[11px] shadow-lg transition-colors duration-250 ${
                              editorTheme === "vs-dark" ? "border-slate-800/80 bg-[#0f0f12] text-slate-300" : "border-slate-200 bg-[#f9fafb] text-slate-700"
                            }`}>
                              <div className={`px-3.5 py-1.5 text-[9px] font-bold flex justify-between items-center select-none border-b transition-colors duration-250 ${
                                editorTheme === "vs-dark" ? "bg-[#0c0c0e] text-slate-500 border-slate-900/60" : "bg-[#f3f4f6] text-slate-500 border-slate-200"
                              }`}>
                                <span className="uppercase tracking-wider">{lang || "code"}</span>
                                <button 
                                  onClick={() => handleCopyCode(actualCode, copyId)}
                                  type="button"
                                  className={`p-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                                    editorTheme === "vs-dark" ? "hover:text-white hover:bg-slate-800/50 text-slate-400" : "hover:text-slate-900 hover:bg-slate-200/60 text-slate-500"
                                  }`}
                                  title="Copy Code"
                                >
                                  {copiedCodeId === copyId ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                  <span>{copiedCodeId === copyId ? "Copied!" : "Copy"}</span>
                                </button>
                              </div>
                              <pre className="p-3.5 overflow-x-auto select-text scrollbar-thin"><code>{actualCode}</code></pre>
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
                  <span className="text-[9px] text-slate-500 self-end px-1.5">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {/* Streaming Typing Indicator Message */}
            {aiStatus === "typing" && streamingMessage && (
              <div className="flex gap-3 max-w-[88%] mr-auto animate-slide-up">
                <div className={`w-7.5 h-7.5 rounded-xl flex items-center justify-center shrink-0 border ${
                  editorTheme === "vs-dark" ? "bg-purple-950/40 border-purple-800/40 text-purple-400" : "bg-purple-50 border-purple-200 text-purple-600"
                }`}>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="flex flex-col gap-1.5 max-w-full">
                  <div className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap shadow-md transition-colors duration-250 ${
                    editorTheme === "vs-dark" 
                      ? "glass-panel text-slate-200 border border-slate-800/60 rounded-tl-none" 
                      : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
                  }`}>
                    {streamingMessage.includes("```") ? (
                      streamingMessage.split("```").map((block, idx) => {
                        if (idx % 2 === 1) {
                          const codeLines = block.split("\n");
                          const lang = codeLines[0].trim();
                          const actualCode = codeLines.slice(1).join("\n");
                          return (
                            <div key={idx} className={`my-2.5 border rounded-xl overflow-hidden font-mono text-[11px] transition-colors duration-250 ${
                              editorTheme === "vs-dark" ? "border-slate-800/80 bg-[#0f0f12] text-slate-300" : "border-slate-200 bg-[#f9fafb] text-slate-700"
                            }`}>
                              <div className={`px-3.5 py-1.5 text-[9px] font-bold flex justify-between items-center select-none border-b transition-colors duration-250 ${
                                editorTheme === "vs-dark" ? "bg-[#0c0c0e] text-slate-500 border-slate-900/60" : "bg-[#f3f4f6] text-slate-500 border-slate-200"
                              }`}>
                                <span className="uppercase tracking-wider">{lang || "code"}</span>
                              </div>
                              <pre className="p-3.5 overflow-x-auto scrollbar-thin"><code>{actualCode}</code></pre>
                            </div>
                          );
                        }
                        return <span key={idx}>{block}</span>;
                      })
                    ) : (
                      streamingMessage
                    )}
                    <span className="inline-block w-2 h-4 ml-1 bg-purple-500 animate-pulse rounded-sm align-middle"></span>
                  </div>
                </div>
              </div>
            )}

            {/* Thinking Indicator Animation */}
            {aiStatus === "thinking" && (
              <div className="flex gap-3 max-w-[88%] mr-auto items-start animate-slide-up">
                <div className={`w-7.5 h-7.5 rounded-xl flex items-center justify-center shrink-0 border ${
                  editorTheme === "vs-dark" ? "bg-purple-950/40 border-purple-800/40 text-purple-400" : "bg-purple-50 border-purple-200 text-purple-600"
                }`}>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className={`border p-4.5 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-md transition-colors duration-250 ${
                  editorTheme === "vs-dark" ? "glass-panel border-slate-800/60" : "bg-white border-slate-200"
                }`}>
                  <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce-typing" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce-typing" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce-typing" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Panel */}
          <div className={`px-4 py-3.5 flex flex-col gap-2 shrink-0 border-t transition-colors duration-250 ${
            editorTheme === "vs-dark"
              ? "border-[#202025] bg-[#0c0c0f]/80"
              : "border-[#e5e7eb] bg-[#f9fafb]"
          }`}>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Quick Suggestions</span>
            <div className="flex flex-wrap gap-1.5">
              <button 
                onClick={() => handleQuickPrompt("explain")}
                type="button"
                disabled={aiStatus !== "idle"}
                className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow-[0_0_8px_rgba(168,85,247,0.15)] ${
                  editorTheme === "vs-dark"
                    ? "text-slate-300 hover:text-white bg-[#1b1b22] hover:bg-purple-900/10 border border-[#2d2d35] hover:border-purple-500/50"
                    : "text-slate-700 hover:text-purple-700 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300"
                }`}
              >
                <Code className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                <span>Explain code</span>
              </button>
              <button 
                onClick={() => handleQuickPrompt("refactor")}
                type="button"
                disabled={aiStatus !== "idle"}
                className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow-[0_0_8px_rgba(168,85,247,0.15)] ${
                  editorTheme === "vs-dark"
                    ? "text-slate-300 hover:text-white bg-[#1b1b22] hover:bg-purple-900/10 border border-[#2d2d35] hover:border-purple-500/50"
                    : "text-slate-700 hover:text-purple-700 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300"
                }`}
              >
                <Bug className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                <span>Refactor</span>
              </button>
              <button 
                onClick={() => handleQuickPrompt("test")}
                type="button"
                disabled={aiStatus !== "idle"}
                className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow-[0_0_8px_rgba(168,85,247,0.15)] ${
                  editorTheme === "vs-dark"
                    ? "text-slate-300 hover:text-white bg-[#1b1b22] hover:bg-purple-900/10 border border-[#2d2d35] hover:border-purple-500/50"
                    : "text-slate-700 hover:text-purple-700 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300"
                }`}
              >
                <Play className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                <span>Write Tests</span>
              </button>
            </div>
          </div>

          {/* Input Area */}
          <form 
            onSubmit={(e) => {
              stopListening();
              handleSendMessage(e);
            }} 
            className={`p-3.5 flex flex-col gap-2 shrink-0 border-t transition-colors duration-250 ${
              editorTheme === "vs-dark" ? "bg-[#141418] border-[#202025]" : "bg-white border-[#e5e7eb]"
            }`}
          >
            <div className={`relative flex items-end rounded-2xl p-2.5 transition-all duration-250 ${
              editorTheme === "vs-dark"
                ? "glass-input focus-within:ring-1 focus-within:ring-purple-500/60 focus-within:border-transparent"
                : "bg-[#f3f4f6] border border-slate-200 focus-within:bg-white focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500/60"
            }`}>
              <textarea
                ref={messageInputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    stopListening();
                    handleSendMessage(e);
                  }
                }}
                disabled={aiStatus !== "idle"}
                placeholder="Ask Copilot to write, change, or review..."
                className={`flex-1 max-h-24 min-h-[44px] resize-none bg-transparent text-xs placeholder-slate-500 self-center focus:outline-none scrollbar-none py-1 pl-1 ${
                  editorTheme === "vs-dark" ? "text-white" : "text-slate-800"
                }`}
                rows={1}
              />
              <button
                type="button"
                onClick={handleVoiceInputToggle}
                disabled={aiStatus !== "idle"}
                className={`p-2 rounded-xl transition-all self-center hover-scale shrink-0 cursor-pointer mr-1.5 ${
                  isListening
                    ? "bg-red-600/20 text-red-400 border border-red-500/30 animate-pulse"
                    : (editorTheme === "vs-dark" ? "text-slate-400 hover:text-white hover:bg-slate-800/40" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50")
                }`}
                title={isListening ? "Listening... Click to stop" : "Voice input"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                type="submit"
                disabled={!inputMessage.trim() || aiStatus !== "idle"}
                className={`p-2 rounded-xl transition-all self-center hover-scale shrink-0 cursor-pointer ${
                  inputMessage.trim() && aiStatus === "idle"
                    ? "bg-purple-600 text-white hover:bg-purple-500 shadow-md shadow-purple-950/20"
                    : (editorTheme === "vs-dark" ? "text-slate-600 bg-[#1e1e23]/30 cursor-not-allowed border border-transparent" : "text-slate-400 bg-slate-200/50 cursor-not-allowed border border-transparent")
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <span className="text-[9px] text-slate-600 text-center select-none">
              AI Copilot can make mistakes. Verify critical code details.
            </span>
          </form>
        </div>

      </div>

      {/* 5. Status Bar (Bottom) */}
      <footer className={`h-6.5 flex items-center justify-between px-4 text-[11px] select-none z-20 shrink-0 font-medium border-t transition-colors duration-250 ${
        editorTheme === "vs-dark"
          ? "bg-[#0d0d11] border-[#1c1c22] text-slate-400"
          : "bg-white border-slate-200 text-slate-600 shadow-[0_-1px_3px_rgba(0,0,0,0.02)]"
      }`}>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1 px-2.5 py-0.5 cursor-pointer h-full transition-colors ${
            editorTheme === "vs-dark" ? "hover:bg-slate-800/60 hover:text-slate-200" : "hover:bg-slate-100 hover:text-slate-900"
          }`}>
            <GitBranch className="w-3.5 h-3.5" />
            <span>main</span>
          </div>
          <div className={`flex items-center gap-2.5 px-2.5 py-0.5 cursor-pointer h-full transition-colors ${
            editorTheme === "vs-dark" ? "hover:bg-slate-800/60 hover:text-slate-200" : "hover:bg-slate-100 hover:text-slate-900"
          }`}>
            <div className="flex items-center gap-1">
              <span className="font-bold">0</span>
              <X className={`w-3 h-3 ${editorTheme === "vs-dark" ? "text-red-400" : "text-red-600"}`} />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold">0</span>
              <Bug className={`w-3 h-3 ${editorTheme === "vs-dark" ? "text-amber-400" : "text-amber-600"}`} />
            </div>
          </div>
          <div 
            onClick={() => setBottomPanelOpen(prev => !prev)}
            className={`hidden sm:flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 cursor-pointer h-full transition-colors ${
              editorTheme === "vs-dark" 
                ? "text-indigo-400 hover:bg-slate-800/60 hover:text-indigo-300" 
                : "text-indigo-600 hover:bg-slate-100 hover:text-indigo-800"
            }`}
            title="Toggle Bottom Console Panel"
          >
            <TerminalSquare className="w-3.5 h-3.5 shrink-0" />
            <span>Console: {bottomPanelOpen ? "OPEN" : "CLOSED"}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 cursor-pointer h-full hidden md:inline transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-800/60" : "hover:bg-slate-100"}`}>Ln 14, Col 5</span>
          <span className={`px-2 py-0.5 cursor-pointer h-full hidden md:inline transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-800/60" : "hover:bg-slate-100"}`}>Spaces: 2</span>
          <span className={`px-2 py-0.5 cursor-pointer h-full hidden sm:inline transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-800/60" : "hover:bg-slate-100"}`}>UTF-8</span>
          <span className={`px-2 py-0.5 cursor-pointer h-full transition-colors ${editorTheme === "vs-dark" ? "hover:bg-slate-800/60" : "hover:bg-slate-100"}`}>TypeScript JSX</span>
          <span className={`px-2.5 py-0.5 cursor-pointer h-full transition-colors flex items-center gap-1 ${
            editorTheme === "vs-dark" ? "text-indigo-400 hover:bg-slate-800/60" : "text-indigo-600 hover:bg-slate-100"
          }`}>
            <Sparkles className={`w-3.5 h-3.5 ${aiStatus !== "idle" ? "animate-spin text-amber-500" : ""}`} />
            <span>Copilot Sync'd</span>
          </span>
        </div>
      </footer>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="settings-glass-panel w-full max-w-2xl h-[450px] rounded-2xl flex flex-col overflow-hidden shadow-2xl relative animate-slide-up" style={{
            background: editorTheme === "vs-dark" 
              ? "linear-gradient(135deg, rgba(24,24,28,0.95) 0%, rgba(30,30,35,0.92) 100%)" 
              : "linear-gradient(135deg, rgba(249,250,251,0.95) 0%, rgba(243,244,246,0.92) 100%)",
            border: editorTheme === "vs-dark" 
              ? "1px solid rgba(51,51,68,0.4)" 
              : "1px solid rgba(203,213,225,0.4)"
          }}>
            
            {/* Modal Header */}
            <div className={`px-5 py-4 border-b flex items-center justify-between transition-colors duration-250 ${
              editorTheme === "vs-dark" ? "border-slate-800/80 text-white" : "border-slate-200 text-slate-800"
            }`}>
              <div className="flex items-center gap-2">
                <Settings className={`w-5 h-5 ${editorTheme === "vs-dark" ? "text-indigo-400" : "text-indigo-600"}`} />
                <span className="font-bold text-sm tracking-wide">Cod Code IDE User Settings</span>
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

                    <div className="space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={minimapEnabled} 
                          onChange={(e) => setMinimapEnabled(e.target.checked)}
                          className="w-3.5 h-3.5 rounded accent-indigo-600"
                        />
                        <span className="font-semibold">Enable Minimap</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={autoSave} 
                          onChange={(e) => setAutoSave(e.target.checked)}
                          className="w-3.5 h-3.5 rounded accent-indigo-600"
                        />
                        <span className="font-semibold">Auto-save</span>
                      </label>
                    </div>

                    <div className="space-y-2">
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
                          className="w-full mt-1"
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
                    
                    <div className={`p-3 rounded-lg border ${
                      editorTheme === "vs-dark" 
                        ? "bg-blue-950/20 border-blue-900/40" 
                        : "bg-blue-50/50 border-blue-200/50"
                    }`}>
                      <p className={`text-[11px] ${editorTheme === "vs-dark" ? "text-blue-300" : "text-blue-700"}`}>
                        Panel visibility, resizing, and layout options are managed from the header controls. Use the toggle buttons in the top toolbar to show/hide sidebars and the bottom panel.
                      </p>
                    </div>
                  </>
                )}

                {activeSettingsTab === "ai" && (
                  <>
                    <div className="border-b pb-3 border-transparent">
                      <h3 className={`text-[13px] font-bold mb-1.5 ${editorTheme === "vs-dark" ? "text-slate-100" : "text-slate-800"}`}>AI Chat & Copilot Configuration</h3>
                      <p className={`text-[11px] ${editorTheme === "vs-dark" ? "text-slate-500" : "text-slate-500"}`}>Manage AI assistant and Copilot integrations.</p>
                    </div>

                    <div className={`p-3 rounded-lg border ${
                      editorTheme === "vs-dark" 
                        ? "bg-purple-950/20 border-purple-900/40" 
                        : "bg-purple-50/50 border-purple-200/50"
                    }`}>
                      <p className={`text-[11px] ${editorTheme === "vs-dark" ? "text-purple-300" : "text-purple-700"}`}>
                        AI features including code completion, chat, and analysis can be accessed from the right sidebar. Use voice input for hands-free interaction and collaborate in real-time.
                      </p>
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
      )}

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
      />
    </div>
  );
}
