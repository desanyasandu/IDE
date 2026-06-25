import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import ShareModal from "./ShareModal";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import {
  Folder,
  Search,
  GitBranch,
  Settings,
  ChevronDown,
  ChevronRight,
  X,
  MoreHorizontal,
  Minus,
  Check,
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
  Sparkles,
  CheckCheck,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  MonitorUp,
  Volume2,
  VolumeX,
  UserPlus,
  LogOut,
  LogIn,
  Target,
  Download,
  Upload,
  GitMerge,
  Cloud,
  Circle
} from "lucide-react";

interface MockFile {
  id?: string;
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
  // OS Detection for terminal custom look and feel
  const [clientOS] = useState(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("mac")) return "macos";
    if (ua.includes("linux")) return "linux";
    return "windows";
  });

  const getTerminalPrompt = (os: string) => {
    if (os === "macos") return "user@mac-ide workspace % ";
    if (os === "linux") return "user@linux-ide:~/workspace$ ";
    return "c:\\Users\\DYD\\Desktop\\IDE\\ide-app> ";
  };

  const getTerminalHeader = (os: string) => {
    if (os === "macos") {
      return [
        "Last login: Thu Jun 25 10:19:08 on ttys001",
        "Welcome to macOS! Apple Swift version 5.9",
        ""
      ];
    }
    if (os === "linux") {
      return [
        "Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 6.2.0-37-generic x86_64)",
        "",
        " * Documentation:  https://help.ubuntu.com",
        " * Management:     https://landscape.canonical.com",
        " * Support:        https://ubuntu.com/pro",
        ""
      ];
    }
    return [
      "Microsoft Windows [Version 10.0.22631]",
      "(c) Microsoft Corporation. All rights reserved.",
      ""
    ];
  };

  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<string[]>(() => {
    const prompt = getTerminalPrompt(clientOS);
    const header = getTerminalHeader(clientOS);
    return [...header, prompt];
  });

  const tauriInvokeRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      import('@tauri-apps/api/core')
        .then((m) => {
          tauriInvokeRef.current = m.invoke;
        })
        .catch((err) => {
          console.warn("Failed to load Tauri core API:", err);
        });
    }
  }, []);
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
  const [workspaceId] = useState<string>(() => new URLSearchParams(window.location.search).get('room') || "my-room");
  const BACKEND_API_URL = "https://quench-mortified-amaze.ngrok-free.dev";

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

  const fetchWorkspaceFiles = async () => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/workspace/${workspaceId}/files`, {
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const filesMap: Record<string, MockFile> = {};
          data.forEach((file: any) => {
            const filePath = file.path || file.name || `src/${file.id || file.name}`;
            filesMap[filePath] = {
              id: file.id || file.file_id || filePath,
              name: file.name,
              path: filePath,
              language: file.language || "typescript",
              content: file.content || ""
            };
          });
          setFiles(filesMap);
          setOpenTabs(prev => {
            // Keep existing tabs if they are still valid in the new files map
            const validPrev = prev.filter(p => filesMap[p]);
            if (validPrev.length > 0) return validPrev;
            return Object.keys(filesMap);
          });
          setActiveFilePath(prev => {
            if (filesMap[prev]) return prev;
            return Object.keys(filesMap)[0];
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch files from backend REST API:", err);
    }
  };

  // Fetch workspace files from backend on component mount
  useEffect(() => {
    fetchWorkspaceFiles();
  }, []);

  // Fallback Polling: Fetch workspace files list every 5 seconds to ensure sync
  // even if WebSocket connection is blocked by ngrok
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWorkspaceFiles();
    }, 5000);
    return () => clearInterval(interval);
  }, [workspaceId]);

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
  const [activeCollaborators, setActiveCollaborators] = useState<any[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [userNameInput, setUserNameInput] = useState("");

  const handleChangeName = (newName: string) => {
    if (!newName.trim()) return;

    if (localUserRef.current) {
      const newProfile = { 
        ...localUserRef.current, 
        name: newName.trim(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newName.trim())}&backgroundColor=b6e3f4`
      };
      localUserRef.current = newProfile;
      if (providerRef.current) {
        providerRef.current.awareness.setLocalStateField('user', newProfile);
        
        // Update local collaborators list immediately
        const states = providerRef.current.awareness.getStates();
        const collabs: any[] = [];
        states.forEach((state: any, clientID: number) => {
          if (state.user) {
            collabs.push({
              id: clientID,
              name: state.user.name,
              avatar: state.user.avatar,
              color: state.user.color,
              isMe: clientID === providerRef.current.awareness.clientID
            });
          }
        });
        setActiveCollaborators(collabs);
      }
    }
  };

  const handleSaveName = () => {
    setIsEditingName(false);
    handleChangeName(userNameInput);
  };

  // New Editor Settings
  const [fontFamily, setFontFamily] = useState<string>("Fira Code");
  const [lineNumbers, setLineNumbers] = useState<"on" | "off" | "relative">("on");
  const [bracketPairColorization, setBracketPairColorization] = useState<boolean>(true);
  const [formatOnSave, setFormatOnSave] = useState<boolean>(false);
  const [renderWhitespace, setRenderWhitespace] = useState<"none" | "boundary" | "all">("none");

  // New Interface Settings
  const [sidebarPosition, setSidebarPosition] = useState<"left" | "right">("left");
  const [showStatusBar, setShowStatusBar] = useState<boolean>(true);
  const [showBreadcrumbs, setShowBreadcrumbs] = useState<boolean>(true);
  const [glassBlur, setGlassBlur] = useState<number>(24);

  // New AI Settings
  const [aiAutocompleteMode, setAiAutocompleteMode] = useState<"always" | "manual" | "disabled">("always");
  const [aiMaxTokens, setAiMaxTokens] = useState<number>(1024);
  const [aiTemperature, setAiTemperature] = useState<number>(0.7);
  const [aiSystemPrompt, setAiSystemPrompt] = useState<string>("You are an elite developer assistant. Write clean, comments-documented, modern code.");

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
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Search & Replace states
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [isReplaceExpanded, setIsReplaceExpanded] = useState(false);
  const editorRef = useRef<any>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    setEditorInstance(editor);
  };

  // Yjs Collaborative Editing Integration
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<any>(null);
  const bindingRef = useRef<any>(null);
  const localUserRef = useRef<any>(null);
  const [providerReady, setProviderReady] = useState(false);

  // 1. Workspace-wide connection & awareness state
  useEffect(() => {
    const doc = new Y.Doc();
    ydocRef.current = doc;

    // Connect to Yjs websocket backend using WSS for the entire workspace (global room)
    const provider = new WebsocketProvider(
      'wss://quench-mortified-amaze.ngrok-free.dev/ws',
      workspaceId,
      doc
    );
    providerRef.current = provider;

    // Set local client awareness profile
    if (!localUserRef.current) {
      const randomSeed = Math.floor(Math.random() * 1000);
      localUserRef.current = {
        name: `User-${randomSeed}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=User-${randomSeed}&backgroundColor=b6e3f4`,
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        isSharingScreen: false
      };
    }
    provider.awareness.setLocalStateField('user', localUserRef.current);

    const handleAwarenessUpdate = () => {
      const states = provider.awareness.getStates();
      const collabs: any[] = [];
      states.forEach((state: any, clientID: number) => {
        if (state.user) {
          collabs.push({
            id: clientID,
            name: state.user.name,
            avatar: state.user.avatar,
            color: state.user.color,
            isMe: clientID === provider.awareness.clientID,
            isSharingScreen: !!state.user.isSharingScreen
          });
        }
      });
      setActiveCollaborators(collabs);
    };

    provider.awareness.on('change', handleAwarenessUpdate);
    handleAwarenessUpdate();

    // Observe changes to shared files-metadata to trigger file tree reloading in real-time
    const filesMetadataMap = doc.getMap('files-metadata');
    const handleFilesMetadataObserve = () => {
      fetchWorkspaceFiles();
    };
    filesMetadataMap.observe(handleFilesMetadataObserve);

    setProviderReady(true);

    provider.on('status', (event: any) => {
      console.log('Yjs collaboration provider status:', event.status);
    });

    return () => {
      setProviderReady(false);
      provider.awareness.off('change', handleAwarenessUpdate);
      filesMetadataMap.unobserve(handleFilesMetadataObserve);
      provider.destroy();
      doc.destroy();
      ydocRef.current = null;
      providerRef.current = null;
    };
  }, [workspaceId]);

  // 2. Monaco binding per file
  useEffect(() => {
    if (!providerReady || !editorInstance || !ydocRef.current || !providerRef.current) return;

    const doc = ydocRef.current;
    const provider = providerRef.current;

    // Sanitize path to be used as Yjs text type identifier
    const safePath = activeFilePath.replace(/[^a-zA-Z0-9-_]/g, '_');
    const ytext = doc.getText(safePath);

    // Populate initial text if Yjs document is empty
    const currentModel = editorInstance.getModel();
    if (ytext.toString() === "" && currentModel) {
      const val = currentModel.getValue();
      if (val) {
        ytext.insert(0, val);
      }
    }

    // Bind Yjs shared type to Monaco Editor model
    const binding = new MonacoBinding(
      ytext,
      currentModel,
      new Set([editorInstance]),
      provider.awareness
    );
    bindingRef.current = binding;

    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }
    };
  }, [activeFilePath, editorInstance, providerReady]);

  // Call settings state
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);

  // WebRTC Call Refs
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioElementsRef = useRef<Record<string, HTMLAudioElement>>({});
  const localAudioTrackRef = useRef<MediaStreamTrack | null>(null);
  const localScreenStreamRef = useRef<MediaStream | null>(null);
  const [remoteScreenStreams, setRemoteScreenStreams] = useState<Record<string, MediaStream>>({});
  const [speakingUsers, setSpeakingUsers] = useState<Record<string, boolean>>({});
  const audioContextsRef = useRef<Record<string, { audioCtx: AudioContext; processor: ScriptProcessorNode; source: MediaStreamAudioSourceNode }>>({});

  const monitorStreamVolume = (clientId: string, stream: MediaStream) => {
    try {
      stopMonitoringVolume(clientId);

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) return;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(2048, 1, 1);

      source.connect(processor);
      processor.connect(audioCtx.destination);

      let speakingCounter = 0;
      const threshold = 0.008;
      const consecutiveFrames = 3;

      processor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < inputBuffer.length; i++) {
          sum += inputBuffer[i] * inputBuffer[i];
        }
        const rms = Math.sqrt(sum / inputBuffer.length);
        const isCurrentlySpeaking = rms > threshold;

        if (isCurrentlySpeaking) {
          speakingCounter = Math.min(consecutiveFrames, speakingCounter + 1);
        } else {
          speakingCounter = Math.max(-consecutiveFrames, speakingCounter - 1);
        }

        if (speakingCounter >= consecutiveFrames) {
          setSpeakingUsers(prev => {
            if (prev[clientId]) return prev;
            return { ...prev, [clientId]: true };
          });
        } else if (speakingCounter <= -consecutiveFrames) {
          setSpeakingUsers(prev => {
            if (!prev[clientId]) return prev;
            return { ...prev, [clientId]: false };
          });
        }
      };

      audioContextsRef.current[clientId] = { audioCtx, processor, source };
    } catch (err) {
      console.warn(`Failed to monitor stream volume for client ${clientId}:`, err);
    }
  };

  const stopMonitoringVolume = (clientId: string) => {
    const monitor = audioContextsRef.current[clientId];
    if (monitor) {
      try {
        monitor.processor.disconnect();
        monitor.source.disconnect();
        if (monitor.audioCtx.state !== "closed") {
          monitor.audioCtx.close();
        }
      } catch (err) {
        console.warn(`Error stopping volume monitor for client ${clientId}:`, err);
      }
      delete audioContextsRef.current[clientId];
    }
    setSpeakingUsers(prev => {
      if (!prev[clientId]) return prev;
      const next = { ...prev };
      delete next[clientId];
      return next;
    });
  };

  // Sync isSharingScreen to Yjs awareness profile
  useEffect(() => {
    if (providerRef.current && localUserRef.current) {
      const newProfile = { ...localUserRef.current, isSharingScreen };
      localUserRef.current = newProfile;
      providerRef.current.awareness.setLocalStateField('user', newProfile);
    }
  }, [isSharingScreen]);

  // Handle local screen capture & streaming to peers
  useEffect(() => {
    const handleScreenSharing = async () => {
      if (isSharingScreen && !localScreenStreamRef.current) {
        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          localScreenStreamRef.current = stream;
          const track = stream.getVideoTracks()[0];

          // Add video track to all peer connections
          Object.entries(peerConnectionsRef.current).forEach(([pcId, pc]) => {
            pc.addTrack(track, stream);
            // Trigger renegotiation offer
            pc.createOffer()
              .then((offer) => {
                return pc.setLocalDescription(offer).then(() => {
                  if (ydocRef.current && providerRef.current) {
                    const signalingMap = ydocRef.current.getMap('webrtc-signaling');
                    const myClientID = providerRef.current.awareness.clientID;
                    const offerKey = `offer_${myClientID}_${pcId}_${Date.now()}`;
                    signalingMap.set(offerKey, JSON.stringify({
                      offer,
                      target: pcId,
                      from: myClientID
                    }));
                  }
                });
              })
              .catch(err => console.error("Error sending offer for screen share:", err));
          });

          track.onended = () => {
            setIsSharingScreen(false);
          };
        } catch (err) {
          console.warn("Screen share cancelled or failed:", err);
          setIsSharingScreen(false);
        }
      } else if (!isSharingScreen && localScreenStreamRef.current) {
        // Stop current tracks
        localScreenStreamRef.current.getTracks().forEach(t => t.stop());
        localScreenStreamRef.current = null;

        // Remove video sender from peer connections
        Object.entries(peerConnectionsRef.current).forEach(([pcId, pc]) => {
          const senders = pc.getSenders();
          const videoSender = senders.find(s => s.track && s.track.kind === 'video');
          if (videoSender) {
            pc.removeTrack(videoSender);
            // Renegotiate
            pc.createOffer()
              .then((offer) => {
                return pc.setLocalDescription(offer).then(() => {
                  if (ydocRef.current && providerRef.current) {
                    const signalingMap = ydocRef.current.getMap('webrtc-signaling');
                    const myClientID = providerRef.current.awareness.clientID;
                    const offerKey = `offer_${myClientID}_${pcId}_${Date.now()}`;
                    signalingMap.set(offerKey, JSON.stringify({
                      offer,
                      target: pcId,
                      from: myClientID
                    }));
                  }
                });
              })
              .catch(err => console.error("Error renegotiating screen share close:", err));
          }
        });
      }
    };
    handleScreenSharing();
  }, [isSharingScreen]);

  // WebRTC Audio & Video Calls & Signalling via Yjs
  useEffect(() => {
    if (!providerReady || !ydocRef.current || !providerRef.current) return;

    const doc = ydocRef.current;
    const provider = providerRef.current;
    const myClientID = provider.awareness.clientID;

    // Get or create signaling map
    const signalingMap = doc.getMap('webrtc-signaling');

    if (!isCallActive) {
      // CLEAN UP EVERYTHING INSTANTLY!
      Object.keys(peerConnectionsRef.current).forEach((pcId) => {
        try {
          peerConnectionsRef.current[pcId].close();
        } catch (e) {}
        delete peerConnectionsRef.current[pcId];
      });
      peerConnectionsRef.current = {};

      Object.keys(audioElementsRef.current).forEach((pcId) => {
        try {
          audioElementsRef.current[pcId].remove();
        } catch (e) {}
        delete audioElementsRef.current[pcId];
      });
      audioElementsRef.current = {};

      Object.keys(audioContextsRef.current).forEach((clientId) => {
        stopMonitoringVolume(clientId);
      });
      audioContextsRef.current = {};
      setSpeakingUsers({});

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      localAudioTrackRef.current = null;

      setRemoteScreenStreams({});
      return;
    }

    // Tries to request audio stream if call is active
    const setupLocalStream = async () => {
      if (isCallActive && !localStreamRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          localStreamRef.current = stream;
          const track = stream.getAudioTracks()[0];
          localAudioTrackRef.current = track;
          // Toggle track state based on mute/deafen
          track.enabled = !isMuted && !isDeafened;
          
          // Monitor local stream volume
          monitorStreamVolume(myClientID.toString(), stream);

          // Attach track to existing RTCPeerConnections
          Object.values(peerConnectionsRef.current).forEach((pc) => {
            const senders = pc.getSenders();
            const audioSender = senders.find(s => s.track && s.track.kind === 'audio');
            if (audioSender) {
              audioSender.replaceTrack(track);
            } else {
              pc.addTrack(track, stream);
            }
          });
        } catch (err) {
          console.warn("Failed to get microphone stream:", err);
        }
      }
    };

    setupLocalStream();

    // Toggle track enablement dynamically when isMuted/isDeafened changes
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.enabled = !isMuted && !isDeafened;
    }

    // Connect to a collaborator
    const getOrCreatePeerConnection = (collabId: string) => {
      const pcId = collabId.toString();
      if (peerConnectionsRef.current[pcId]) {
        return peerConnectionsRef.current[pcId];
      }

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      peerConnectionsRef.current[pcId] = pc;

      // Add local tracks if available
      if (localStreamRef.current && localAudioTrackRef.current) {
        pc.addTrack(localAudioTrackRef.current, localStreamRef.current);
      }
      if (localScreenStreamRef.current) {
        const screenTrack = localScreenStreamRef.current.getVideoTracks()[0];
        if (screenTrack) {
          pc.addTrack(screenTrack, localScreenStreamRef.current);
        }
      }

      // Send local ICE candidates to the target collaborator
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidateKey = `ice_${myClientID}_${collabId}_${Date.now()}`;
          signalingMap.set(candidateKey, JSON.stringify({
            candidate: event.candidate,
            target: collabId,
            from: myClientID
          }));
        }
      };

      // Play remote audio/video stream when received
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        if (remoteStream) {
          if (event.track.kind === 'video') {
            // Screen share stream
            setRemoteScreenStreams(prev => ({
              ...prev,
              [collabId]: remoteStream
            }));

            event.track.onended = () => {
              setRemoteScreenStreams(prev => {
                const next = { ...prev };
                delete next[collabId];
                return next;
              });
            };
          } else {
            // Audio stream
            let audio = audioElementsRef.current[pcId];
            if (!audio) {
              audio = document.createElement('audio');
              audio.autoplay = true;
              audio.style.display = 'none';
              document.body.appendChild(audio);
              audioElementsRef.current[pcId] = audio;
            }
            audio.srcObject = remoteStream;
            audio.muted = isDeafened;
            audio.play().catch(e => console.warn("Failed to auto-play remote audio:", e));

            // Monitor remote stream volume
            monitorStreamVolume(collabId, remoteStream);
          }
        }
      };

      return pc;
    };

    // Clean up disconnected collaborators
    const collabIds = activeCollaborators.map(c => c.id.toString());
    Object.keys(peerConnectionsRef.current).forEach((pcId) => {
      if (pcId !== myClientID.toString() && !collabIds.includes(pcId)) {
        // Disconnected
        peerConnectionsRef.current[pcId].close();
        delete peerConnectionsRef.current[pcId];
        if (audioElementsRef.current[pcId]) {
          audioElementsRef.current[pcId].remove();
          delete audioElementsRef.current[pcId];
        }
        stopMonitoringVolume(pcId);
        setRemoteScreenStreams(prev => {
          const next = { ...prev };
          delete next[pcId];
          return next;
        });
      }
    });

    // Handle incoming signals
    const handleSignalingObserve = (event: any) => {
      event.changes.keys.forEach((change: any, key: string) => {
        if (change.action === 'add' || change.action === 'update') {
          try {
            const raw = signalingMap.get(key) as string;
            if (!raw) return;
            const data = JSON.parse(raw);

            // Verify the message is intended for us
            if (data.target?.toString() !== myClientID.toString()) return;

            const fromId = data.from?.toString();
            if (!fromId) return;

            const pc = getOrCreatePeerConnection(fromId);

            if (key.startsWith('offer_')) {
              // Received Offer
              pc.setRemoteDescription(new RTCSessionDescription(data.offer))
                .then(() => {
                  if (localStreamRef.current && localAudioTrackRef.current) {
                    // Make sure tracks are added if not already
                    const senders = pc.getSenders();
                    if (!senders.some(s => s.track === localAudioTrackRef.current)) {
                      pc.addTrack(localAudioTrackRef.current, localStreamRef.current);
                    }
                  }
                  return pc.createAnswer();
                })
                .then((answer) => {
                  return pc.setLocalDescription(answer).then(() => {
                    const answerKey = `answer_${myClientID}_${fromId}`;
                    signalingMap.set(answerKey, JSON.stringify({
                      answer,
                      target: fromId,
                      from: myClientID
                    }));
                  });
                })
                .catch(err => console.error("Error handling WebRTC offer:", err));
            } else if (key.startsWith('answer_')) {
              // Received Answer
              pc.setRemoteDescription(new RTCSessionDescription(data.answer))
                .catch(err => console.error("Error setting remote answer:", err));
            } else if (key.startsWith('ice_')) {
              // Received ICE Candidate
              if (pc.remoteDescription) {
                pc.addIceCandidate(new RTCIceCandidate(data.candidate))
                  .catch(err => console.error("Error adding ICE candidate:", err));
              } else {
                // Queue the candidate if description is not set yet
                const checkInterval = setInterval(() => {
                  if (pc.remoteDescription) {
                    pc.addIceCandidate(new RTCIceCandidate(data.candidate))
                      .catch(err => console.error("Error adding ICE candidate:", err));
                    clearInterval(checkInterval);
                  }
                }, 100);
                setTimeout(() => clearInterval(checkInterval), 5000);
              }
            }
          } catch (e) {
            console.error("Error parsing signaling data:", e);
          }
        }
      });
    };

    signalingMap.observe(handleSignalingObserve);

    // Initiator logic: connect to collaborators with lower client ID
    activeCollaborators.forEach((collab) => {
      const collabIdNum = collab.id;
      // If we are the initiator (lower clientID wins, or simply deterministic choice)
      if (collabIdNum !== myClientID && myClientID < collabIdNum) {
        const pc = getOrCreatePeerConnection(collabIdNum.toString());
        // Create offer if not already offering
        if (pc.signalingState === 'stable') {
          pc.createOffer()
            .then((offer) => {
              return pc.setLocalDescription(offer).then(() => {
                const offerKey = `offer_${myClientID}_${collabIdNum}`;
                signalingMap.set(offerKey, JSON.stringify({
                  offer,
                  target: collabIdNum.toString(),
                  from: myClientID
                }));
              });
            })
            .catch(err => console.error("Error creating WebRTC offer:", err));
        }
      }
    });

    // Deafen adjustment for existing audio elements
    Object.values(audioElementsRef.current).forEach((audio) => {
      audio.muted = isDeafened;
    });

    return () => {
      signalingMap.unobserve(handleSignalingObserve);
    };
  }, [providerReady, activeCollaborators.length, isCallActive, isMuted, isDeafened]);

  // Clean up WebRTC on unmount
  useEffect(() => {
    return () => {
      Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
      peerConnectionsRef.current = {};
      Object.values(audioElementsRef.current).forEach(audio => audio.remove());
      audioElementsRef.current = {};
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      localAudioTrackRef.current = null;
    };
  }, []);

  // Git UI states
  const [isSourceControlExpanded, setIsSourceControlExpanded] = useState(true);
  const [isGraphExpanded, setIsGraphExpanded] = useState(true);
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(true);
  const [gitTerminalHistory, setGitTerminalHistory] = useState<string[]>([
    "user@ide MINGW64 ~/workspace (main)",
    "$ git status",
    "On branch main",
    "Changes not staged for commit:",
    "  (use \"git add <file>...\" to update what will be committed)",
    "  (use \"git restore <file>...\" to discard changes in working directory)",
    "\tmodified:   src/App.tsx",
    "\tmodified:   src/index.css"
  ]);
  const [gitTerminalInput, setGitTerminalInput] = useState("");

  const handleGitTerminalSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && gitTerminalInput.trim()) {
      setGitTerminalHistory(prev => [
        ...prev,
        `$ ${gitTerminalInput}`,
        `bash: ${gitTerminalInput.split(' ')[0]}: command not found (mock environment)`
      ]);
      setGitTerminalInput("");
    }
  };



  // Dragging logic for Collab Session panel
  const [callPanelPos, setCallPanelPos] = useState({ x: 0, y: 0 });
  const [isDraggingCallPanel, setIsDraggingCallPanel] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const panelStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDraggingCallPanel(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    panelStartPos.current = { x: callPanelPos.x, y: callPanelPos.y };
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingCallPanel) return;
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      setCallPanelPos({
        x: panelStartPos.current.x + dx,
        y: panelStartPos.current.y + dy
      });
    };

    const handleMouseUp = () => {
      setIsDraggingCallPanel(false);
    };

    if (isDraggingCallPanel) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingCallPanel]);
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

  // Create workspace file in backend
  const handleCreateFile = async () => {
    const filename = prompt("Enter new filename (e.g., src/index.css):");
    if (!filename) return;

    let language = "javascript";
    if (filename.endsWith(".ts") || filename.endsWith(".tsx")) language = "typescript";
    else if (filename.endsWith(".css")) language = "css";
    else if (filename.endsWith(".json")) language = "json";
    else if (filename.endsWith(".html")) language = "html";

    const payload = {
      name: filename.split('/').pop() || filename,
      path: filename,
      content: `// New file ${filename}\n`,
      language: language
    };

    try {
      const response = await fetch(`${BACKEND_API_URL}/workspace/${workspaceId}/files`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const fileData = await response.json();
        const createdPath = fileData.path || filename;
        setFiles(prev => ({
          ...prev,
          [createdPath]: {
            id: fileData.id || fileData.file_id || createdPath,
            name: fileData.name || payload.name,
            path: createdPath,
            language: fileData.language || payload.language,
            content: fileData.content || payload.content
          }
        }));
        handleOpenFile(createdPath);

        // Notify other clients via Yjs
        if (ydocRef.current) {
          ydocRef.current.getMap('files-metadata').set('lastUpdated', Date.now().toString());
        }
      }
    } catch (err) {
      console.error("Error creating file on backend:", err);
      // Local fallback
      setFiles(prev => ({
        ...prev,
        [filename]: {
          id: filename,
          name: filename.split('/').pop() || filename,
          path: filename,
          language: language,
          content: `// New file ${filename}\n`
        }
      }));
      handleOpenFile(filename);
    }
  };

  // Delete workspace file in backend
  const handleDeleteFile = async (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    const file = files[path];
    if (!file) return;

    if (!confirm(`Are you sure you want to delete ${file.name}?`)) return;

    const fileId = file.id || file.name;

    try {
      const response = await fetch(`${BACKEND_API_URL}/workspace/${workspaceId}/files/${fileId}`, {
        method: "DELETE",
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      });
      if (response.ok) {
        setFiles(prev => {
          const newFiles = { ...prev };
          delete newFiles[path];
          return newFiles;
        });
        handleCloseTab(null as any, path);

        // Notify other clients via Yjs
        if (ydocRef.current) {
          ydocRef.current.getMap('files-metadata').set('lastUpdated', Date.now().toString());
        }
      }
    } catch (err) {
      console.error("Error deleting file on backend:", err);
      // Local fallback
      setFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[path];
        return newFiles;
      });
      handleCloseTab(null as any, path);
    }
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
      `[${new Date().toLocaleTimeString()}] âœ“ 32 modules transformed.`,
      `[${new Date().toLocaleTimeString()}] dist/index.html                     0.39 kB â”‚ gzip: 0.25 kB`,
      `[${new Date().toLocaleTimeString()}] dist/assets/index-D7a8B9cE.css      8.42 kB â”‚ gzip: 2.10 kB`,
      `[${new Date().toLocaleTimeString()}] dist/assets/index-Bf9e42Ac.js     142.18 kB â”‚ gzip: 46.50 kB`,
      `[${new Date().toLocaleTimeString()}] âœ“ built in 580ms`,
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

  // Search logic derived state
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const results: { path: string; lineIndex: number; lineContent: string; isFileNameMatch?: boolean }[] = [];
    Object.entries(files).forEach(([path, file]) => {
      // Check file name match
      if (file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push({ path, lineIndex: 1, lineContent: `File: ${file.name}`, isFileNameMatch: true });
      }

      // Check content matches
      const lines = file.content.split('\n');
      lines.forEach((line, idx) => {
        if (line.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ path, lineIndex: idx + 1, lineContent: line.trim() });
        }
      });
    });
    return results;
  }, [searchQuery, files]);

  const groupedResults = React.useMemo(() => {
    return searchResults.reduce((acc, curr) => {
      if (!acc[curr.path]) acc[curr.path] = [];
      acc[curr.path].push(curr);
      return acc;
    }, {} as Record<string, typeof searchResults>);
  }, [searchResults]);

  const handleReplaceSingle = (path: string, lineIndex: number) => {
    if (!searchQuery) return;
    const file = files[path];
    if (!file) return;

    // We only replace the first occurrence in that specific line to match VS Code single replace
    const lines = file.content.split('\n');
    const actualLineIndex = lineIndex - 1;

    // We escape the search query
    const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapeRegExp(searchQuery), 'i'); // case insensitive, first match only

    if (lines[actualLineIndex] && lines[actualLineIndex].toLowerCase().includes(searchQuery.toLowerCase())) {
      lines[actualLineIndex] = lines[actualLineIndex].replace(regex, replaceQuery);
      setFiles({
        ...files,
        [path]: {
          ...file,
          content: lines.join('\n')
        }
      });
    }
  };

  const handleResultClick = (path: string, lineIndex: number, isFileNameMatch: boolean = false) => {
    // Open the file
    handleOpenFile(path);

    // If it's just a file name match, no need to jump or highlight lines
    if (isFileNameMatch) return;

    // Use a short timeout to allow Monaco editor to mount if it wasn't open
    setTimeout(() => {
      if (editorRef.current) {
        // Jump to line
        editorRef.current.revealLineInCenter(lineIndex);
        editorRef.current.setPosition({ lineNumber: lineIndex, column: 1 });
        editorRef.current.focus();
      }
    }, 100);
  };

  const handleReplaceAll = () => {
    if (!searchQuery) return;
    const newFiles = { ...files };
    let totalReplacements = 0;

    // We escape the search query to prevent regex syntax errors if they type symbols
    const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapeRegExp(searchQuery), 'gi');

    Object.keys(newFiles).forEach(path => {
      const file = newFiles[path];
      if (file.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        const matches = file.content.match(regex);
        if (matches) totalReplacements += matches.length;

        newFiles[path] = {
          ...file,
          content: file.content.replace(regex, replaceQuery)
        };
      }
    });

    setFiles(newFiles);
    alert(`Replaced ${totalReplacements} occurrence(s) across files.`);
  };

  type MenuItem = { label?: string; action?: () => void; divider?: boolean; shortcut?: string };
  const IDE_MENUS: Record<string, MenuItem[]> = {
    File: [
      { label: "New File", shortcut: "Ctrl+N", action: handleCreateFile },
      { label: "New Window", shortcut: "Ctrl+Shift+N", action: () => window.open(window.location.href, '_blank') },
      { divider: true },
      { label: "Save", shortcut: "Ctrl+S", action: () => alert("File saved successfully!") },
      { label: "Save As...", shortcut: "Ctrl+Shift+S", action: () => alert("Save As dialog opened (mock)") },
      { divider: true },
      { label: "Share Workspace", action: () => setIsShareModalOpen(true) },
      { divider: true },
      { label: "Exit", shortcut: "Ctrl+Q", action: () => window.close() }
    ],
    Edit: [
      { label: "Undo", shortcut: "Ctrl+Z", action: () => { editorRef.current?.focus(); editorRef.current?.trigger('source', 'undo', null); } },
      { label: "Redo", shortcut: "Ctrl+Y", action: () => { editorRef.current?.focus(); editorRef.current?.trigger('source', 'redo', null); } },
      { divider: true },
      { label: "Cut", shortcut: "Ctrl+X", action: () => { editorRef.current?.focus(); document.execCommand('cut'); } },
      { label: "Copy", shortcut: "Ctrl+C", action: () => { editorRef.current?.focus(); document.execCommand('copy'); } },
      { label: "Paste", shortcut: "Ctrl+V", action: () => { editorRef.current?.focus(); document.execCommand('paste'); } }
    ],
    Selection: [
      { label: "Select All", shortcut: "Ctrl+A", action: () => { editorRef.current?.focus(); editorRef.current?.trigger('source', 'editor.action.selectAll', null); } },
      { label: "Expand Selection", shortcut: "Alt+Shift+Right", action: () => { editorRef.current?.focus(); editorRef.current?.trigger('source', 'editor.action.smartSelect.expand', null); } }
    ],
    View: [
      { label: "Explorer", shortcut: "Ctrl+Shift+E", action: () => { setLeftSidebarOpen(true); setActiveLeftTab("explorer"); } },
      { label: "Search", shortcut: "Ctrl+Shift+F", action: () => { setLeftSidebarOpen(true); setActiveLeftTab("search"); } },
      { label: "Source Control", shortcut: "Ctrl+Shift+G", action: () => { setLeftSidebarOpen(true); setActiveLeftTab("git"); } },
      { divider: true },
      { label: "Bottom Panel", shortcut: "Ctrl+J", action: () => setBottomPanelOpen(prev => !prev) },
      { label: "AI Copilot", action: () => setRightSidebarOpen(prev => !prev) }
    ],
    Go: [
      { label: "Go to File...", shortcut: "Ctrl+P", action: () => { setLeftSidebarOpen(true); setActiveLeftTab("explorer"); } },
      { label: "Go to Line...", shortcut: "Ctrl+G", action: () => { editorRef.current?.focus(); editorRef.current?.trigger('source', 'editor.action.gotoLine', null); } }
    ],
    Run: [
      { label: "Start Debugging", shortcut: "F5", action: () => { setBottomPanelOpen(true); setActiveBottomTab("problems"); } },
      { label: "Run Without Debugging", shortcut: "Ctrl+F5", action: handleRunCode }
    ],
    Terminal: [
      { label: "New Terminal", shortcut: "Ctrl+Shift+`", action: () => { setBottomPanelOpen(true); setActiveBottomTab("terminal"); } }
    ],
    Help: [
      { label: "Welcome", action: () => alert("Welcome to Cod Code IDE!") },
      { label: "Keyboard Shortcuts", shortcut: "Ctrl+K Ctrl+S", action: () => { editorRef.current?.focus(); editorRef.current?.trigger('source', 'editor.action.showCommands', null); } },
      { divider: true },
      { label: "About", action: () => alert("Cod Code IDE v0.1.0") }
    ]
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 ml-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span className={`font-semibold tracking-wide font-mono transition-colors duration-250 ${editorTheme === "vs-dark" ? "text-slate-300" : "text-slate-700"}`}>COD Code IDE</span>
          </div>

          {/* Main Menu Bar */}
          <div className={`hidden lg:flex items-center text-[11px] font-medium transition-colors duration-250 relative ${
            editorTheme === "vs-dark" ? "text-slate-400" : "text-slate-600"
          }`}>
            {Object.keys(IDE_MENUS).map((menuName) => (
              <div key={menuName} className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === menuName ? null : menuName)}
                  onMouseEnter={() => { if (activeMenu && activeMenu !== menuName) setActiveMenu(menuName); }}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer relative z-50 ${
                    activeMenu === menuName
                      ? (editorTheme === "vs-dark" ? "bg-[#25252b] text-slate-100" : "bg-slate-200 text-slate-900")
                      : (editorTheme === "vs-dark" ? "hover:bg-slate-800/60 hover:text-slate-200" : "hover:bg-slate-200/60 hover:text-slate-900")
                  }`}
                >
                  {menuName}
                </button>

                {/* Dropdown Menu */}
                {activeMenu === menuName && (
                  <div className={`absolute top-full left-0 mt-0.5 min-w-[240px] rounded-lg shadow-2xl border z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100 ${
                    editorTheme === "vs-dark" ? "bg-[#1e1e24] border-slate-700/80 text-slate-300 shadow-[0_8px_30px_rgba(0,0,0,0.6)]" : "bg-white border-slate-200 text-slate-700 shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
                  }`}>
                    {IDE_MENUS[menuName].map((item, idx) =>
                      item.divider ? (
                        <hr key={idx} className={`my-1.5 border-t ${editorTheme === "vs-dark" ? "border-slate-700/60" : "border-slate-100"}`} />
                      ) : (
                        <button
                          key={idx}
                          onClick={() => {
                            if (item.action) item.action();
                            setActiveMenu(null);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-1.5 text-xs transition-colors cursor-pointer text-left ${
                            editorTheme === "vs-dark" ? "hover:bg-indigo-600 hover:text-white" : "hover:bg-indigo-50 hover:text-indigo-600"
                          }`}
                        >
                          <span>{item.label}</span>
                          {item.shortcut && <span className={`text-[10px] opacity-60 ml-6 font-sans tracking-wide`}>{item.shortcut}</span>}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Click Away Overlay for Menus */}
          {activeMenu && (
            <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)}></div>
          )}
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
            type="button"
            onClick={() => setRightSidebarOpen(prev => !prev)}
            className={`p-1.5 rounded-lg hover-scale cursor-pointer transition-colors duration-250 ${
              rightSidebarOpen
                ? (editorTheme === "vs-dark" ? "bg-purple-950/50 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.25)] border border-purple-500/30" : "bg-purple-50 text-purple-600 border border-purple-200")
                : (editorTheme === "vs-dark" ? "text-slate-400 hover:bg-slate-800/50 hover:text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800")
            }`}
            title="Toggle AI Chat Panel"
          >
            <Sparkles className="w-4 h-4" />
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
      <div className={`flex flex-1 w-full overflow-hidden relative ${sidebarPosition === "right" ? "flex-row-reverse" : ""}`}>

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
                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        alert("Redirecting to Account Management portal...");
                      }}
                      className={`flex items-center gap-2.5 px-4 py-3 text-sm transition-colors cursor-pointer text-left ${
                        editorTheme === "vs-dark" ? "hover:bg-slate-800/50 hover:text-white" : "hover:bg-slate-50 hover:text-indigo-600"
                      }`}
                    >
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
                    <span>Workspace Files</span>
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
          )}

          {activeLeftTab === "search" && (
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
          )}

          {activeLeftTab === "git" && (
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
            {showBreadcrumbs && (
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
            )}

            {/* Monaco Editor Container */}
            <div className={`flex-1 w-full relative ${editorTheme === "vs-dark" ? "bg-[#1e1e1e]" : "bg-white"}`}>
              <Editor
                height="100%"
                path={activeFile.path}
                language={activeFile.language}
                value={activeFile.content}
                theme={editorTheme}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
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
                  lineNumbers: lineNumbers,
                  renderWhitespace: renderWhitespace,
                  bracketPairColorization: { enabled: bracketPairColorization },
                  roundedSelection: true,
                  scrollBeyondLastLine: false,
                  readOnly: false,
                  automaticLayout: true,
                  cursorSmoothCaretAnimation: "on",
                  fontFamily: `${fontFamily}, Menlo, Monaco, Consolas, monospace`,
                  fontLigatures: true,
                  renderLineHighlight: "all",
                  quickSuggestions: { other: true, comments: true, strings: true },
                  suggestOnTriggerCharacters: true
                }}
              />
              {/* Screen Share Overlay Viewer */}
              {Object.entries(remoteScreenStreams).map(([collabId, stream]) => {
                const sharingCollab = activeCollaborators.find(c => c.id.toString() === collabId);
                return (
                  <div 
                    key={collabId} 
                    className={`absolute inset-0 z-30 flex flex-col backdrop-blur-md ${
                      editorTheme === "vs-dark" ? "bg-[#0b0b0f]/80" : "bg-white/80"
                    }`}
                  >
                    <div className={`px-4 py-2 border-b flex items-center justify-between ${
                      editorTheme === "vs-dark" ? "bg-[#141419] border-slate-800/80 text-white" : "bg-slate-50 border-slate-200 text-slate-850"
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="text-xs font-semibold">
                          {sharingCollab ? sharingCollab.name : `User-${collabId}`} is sharing their screen
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setRemoteScreenStreams(prev => {
                            const next = { ...prev };
                            delete next[collabId];
                            return next;
                          });
                        }}
                        className={`p-1 rounded hover:bg-slate-700/50 cursor-pointer ${
                          editorTheme === "vs-dark" ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1 bg-black flex items-center justify-center p-2 relative overflow-hidden">
                      <video
                        ref={(el) => {
                          if (el) {
                            el.srcObject = stream;
                            el.play().catch(e => console.warn("Failed to play screen share track:", e));
                          }
                        }}
                        autoPlay
                        playsInline
                        className="max-w-full max-h-full rounded-lg shadow-2xl object-contain border border-slate-800"
                      />
                    </div>
                  </div>
                );
              })}
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
                      const prompt = getTerminalPrompt(clientOS);
                      const header = getTerminalHeader(clientOS);
                      setTerminalHistory([...header, prompt]);
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
                      const prompt = getTerminalPrompt(clientOS);

                      if (cmd === "cls" || cmd === "clear") {
                        setTerminalHistory([prompt]);
                        setTerminalInput("");
                        return;
                      }

                      // Execute Command (Native or Mock)
                      const executeTerminalCmd = async () => {
                        let reply = "";
                        
                        if (tauriInvokeRef.current) {
                          // Running inside Tauri desktop application - execute actual native shell command!
                          try {
                            const res = await tauriInvokeRef.current("execute_command", { command: cmd });
                            reply = res || "";
                          } catch (err: any) {
                            reply = err || "Error executing command";
                          }
                        } else {
                          // Running inside regular web browser - fall back to mock environment with OS check
                          if (cmd === "npm run dev" || cmd === "npm start" || cmd === "run") {
                            handleRunCode();
                            setTerminalInput("");
                            return;
                          } else if (cmd === "git status") {
                            reply = "On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges not staged for commit:\n  (use \"git add <file>...\" to update what will be committed)\n  (use \"git restore <file>...\" to discard changes in working directory)\n\tmodified:   src/components/IDELayout.tsx\n\nno changes added to commit (use \"git add\" and/or \"git commit -a\")";
                          } else if (cmd.startsWith("help")) {
                            reply = "Available commands (Mock): cls, clear, npm run dev, run, git status, help, node -v, echo <text>\n\nNote: To run actual machine shell commands, launch this IDE as a desktop application using Tauri.";
                          } else if (cmd === "node -v") {
                            reply = "v20.11.0";
                          } else if (cmd.startsWith("echo ")) {
                            reply = cmd.substring(5);
                          } else {
                            if (clientOS === "windows") {
                              reply = `'${cmd.split(" ")[0]}' is not recognized as an internal or external command,\noperable program or batch file. Type 'help' for commands.`;
                            } else {
                              reply = `bash: ${cmd.split(" ")[0]}: command not found. Type 'help' for commands.`;
                            }
                          }
                        }

                        setTerminalHistory(prev => {
                          const hist = [...prev];
                          if (hist.length > 0) {
                            hist[hist.length - 1] = hist[hist.length - 1] + cmd;
                          }
                          if (reply) {
                            // If reply has newlines, split it and push
                            const lines = reply.split("\n");
                            hist.push(...lines);
                          }
                          hist.push(prompt);
                          return hist;
                        });
                        setTerminalInput("");
                      };

                      executeTerminalCmd();
                    }}
                    className="flex items-center"
                  >
                    <span className="shrink-0">{getTerminalPrompt(clientOS)}&nbsp;</span>
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
                      const hasCheck = log.includes("âœ“");
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
            <div
              className={`absolute w-72 backdrop-blur-xl border rounded-2xl shadow-2xl z-40 overflow-hidden flex flex-col animate-slide-up ${
                editorTheme === "vs-dark" 
                  ? "bg-[#141419]/95 border-slate-700/50 shadow-black/60 text-white" 
                  : "bg-white/95 border-slate-200 shadow-slate-200/50 text-slate-800"
              }`}
              style={{
                top: `${24 + callPanelPos.y}px`,
                right: `${24 - callPanelPos.x}px`
              }}
            >
              {/* Call Header */}
              <div
                className={`px-4 py-2.5 border-b flex items-center justify-between cursor-move select-none ${
                  editorTheme === "vs-dark" ? "bg-[#1b1b22] border-slate-800/80" : "bg-slate-50 border-slate-200"
                }`}
                onMouseDown={handleMouseDown}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className={`text-[11px] font-bold tracking-wider uppercase ${
                    editorTheme === "vs-dark" ? "text-slate-300" : "text-slate-600"
                  }`}>Collab Session</span>
                </div>
                <button
                  onClick={() => setIsCallPanelOpen(false)}
                  className={`p-1 rounded-lg transition-colors cursor-pointer ${
                    editorTheme === "vs-dark" ? "text-slate-400 hover:text-white hover:bg-slate-800/50" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
                  }`}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Call Video/Avatars Grid */}
              <div className={`p-4 grid grid-cols-2 gap-3 ${
                editorTheme === "vs-dark" ? "bg-[#0d0d10]/40" : "bg-slate-50/50"
              }`}>
                {activeCollaborators.map((collab) => (
                  <div 
                    key={collab.id} 
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 flex flex-col items-center justify-center group transition-all duration-300 ${
                      editorTheme === "vs-dark" ? "bg-slate-800/50" : "bg-slate-100 border-slate-200"
                    } ${
                      speakingUsers[collab.id.toString()]
                        ? "ring-2 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.55)] scale-[1.03] border-emerald-500"
                        : (collab.isMe 
                            ? (isMuted ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]" : "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]") 
                            : "border-slate-700/50")
                    }`}
                  >
                    <img src={collab.avatar} className="w-14 h-14 rounded-full" alt={collab.name} />
                    <div className="absolute bottom-1.5 left-2 right-2 bg-black/60 backdrop-blur-md rounded-md px-1.5 py-0.5 flex items-center justify-between">
                      {collab.isMe && isEditingName ? (
                        <input
                          type="text"
                          value={userNameInput}
                          onChange={(e) => setUserNameInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveName();
                            if (e.key === "Escape") setIsEditingName(false);
                          }}
                          onBlur={handleSaveName}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          className="bg-slate-800 text-white text-[9px] px-1 py-0.5 rounded outline-none border border-indigo-500 w-20"
                        />
                      ) : (
                        <span 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (collab.isMe) {
                              setUserNameInput(collab.name);
                              setIsEditingName(true);
                            }
                          }}
                          className={`text-[9px] font-medium text-white truncate cursor-pointer ${collab.isMe ? "hover:underline hover:text-indigo-300" : ""}`}
                          title={collab.isMe ? "Click to change name" : undefined}
                        >
                          {collab.name} {collab.isMe && "(You)"}
                        </span>
                      )}
                      {collab.isMe ? (
                        isMuted ? <MicOff className="w-2.5 h-2.5 text-red-400" /> : <Mic className="w-2.5 h-2.5 text-emerald-400" />
                      ) : (
                        <Mic className="w-2.5 h-2.5 text-emerald-400" />
                      )}
                    </div>
                  </div>
                ))}
                {/* AI Agent Avatar */}
                <div className={`relative aspect-square rounded-xl overflow-hidden border-2 flex flex-col items-center justify-center group col-span-2 h-28 ${
                  editorTheme === "vs-dark" 
                    ? "bg-purple-950/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]" 
                    : "bg-purple-50 border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.08)]"
                }`}>
                  <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center border-2 border-purple-400/50 animate-pulse-glow-purple">
                     <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute bottom-2 left-3 right-3 bg-black/60 backdrop-blur-md rounded-lg px-2 py-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-300">Agent Alpha</span>
                    <Volume2 className="w-3 h-3 text-emerald-400 animate-pulse" />
                  </div>
                  {/* Audio wave mock */}
                  {!isDeafened && (
                    <div className="absolute top-3 right-3 flex gap-0.5">
                      <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: "0ms"}}></span>
                      <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: "100ms"}}></span>
                      <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: "200ms"}}></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Call Controls */}
              <div className={`p-3 flex justify-center gap-3 border-t ${
                editorTheme === "vs-dark" ? "bg-[#1b1b22] border-slate-800/80" : "bg-slate-50 border-slate-200"
              }`}>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                    isMuted ? "bg-red-600 hover:bg-red-500 text-white" : (editorTheme === "vs-dark" ? "bg-slate-700/50 hover:bg-slate-600 text-white" : "bg-slate-250 hover:bg-slate-300 text-slate-700")
                  }`}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                </button>
                <button
                  onClick={() => setIsDeafened(!isDeafened)}
                  className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                    isDeafened ? "bg-red-600 hover:bg-red-500 text-white" : (editorTheme === "vs-dark" ? "bg-slate-700/50 hover:bg-slate-600 text-white" : "bg-slate-250 hover:bg-slate-300 text-slate-700")
                  }`}
                  title={isDeafened ? "Undeafen" : "Deafen"}
                >
                  {isDeafened ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
                </button>
                <button
                  onClick={() => setIsSharingScreen(!isSharingScreen)}
                  className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                    isSharingScreen 
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40" 
                      : (editorTheme === "vs-dark" ? "bg-slate-700/50 hover:bg-slate-600 text-white" : "bg-slate-250 hover:bg-slate-300 text-slate-700")
                  }`}
                  title={isSharingScreen ? "Stop Sharing Screen" : "Share Screen"}
                >
                  <MonitorUp className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={() => {
                    setIsCallActive(false);
                    setIsCallPanelOpen(false);
                  }}
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
          className={`flex flex-col overflow-hidden relative z-10 gpu-layer border-l transition-all duration-300 ease-in-out ${
            editorTheme === "vs-dark"
              ? "bg-[#0b0b0f]/95 backdrop-blur-xl border-[#1d1d24] shadow-[-10px_0_30px_rgba(0,0,0,0.5)]"
              : "bg-[#ffffff]/95 backdrop-blur-xl border-[#e2e8f0] shadow-[-10px_0_30px_rgba(0,0,0,0.03)]"
          }`}
          style={{
            width: rightSidebarOpen ? `${rightSidebarWidth}px` : 0,
            transition: isResizingRight ? 'none' : 'width 300ms ease-out'
          }}
        >
          {/* Header with gradient flow */}
          <div className={`p-4 flex items-center justify-between border-b transition-colors duration-250 ${
            editorTheme === "vs-dark"
              ? "bg-gradient-to-r from-[#111116] via-[#161622] to-[#0e0e12] border-[#1e1e26]"
              : "bg-gradient-to-r from-[#fcfdfd] via-[#f8fafc] to-[#fcfdfd] border-[#e2e8f0]"
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)] animate-pulse-glow-purple">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-500 block">System AI</span>
                <span className={`text-[14px] font-bold block -mt-0.5 transition-colors duration-250 ${editorTheme === "vs-dark" ? "text-slate-100" : "text-slate-800"}`}>Coding Assistant</span>
              </div>
            </div>

            <button
              onClick={() => setRightSidebarOpen(false)}
              className={`p-1.5 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                editorTheme === "vs-dark" ? "hover:bg-slate-800/60 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"
              }`}
              title="Close Copilot Panel"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* AI Status Indicator Bar */}
          <div className={`px-4 py-2 flex items-center justify-between text-xs border-b transition-colors duration-250 ${
            editorTheme === "vs-dark"
              ? "border-[#1c1c22] bg-[#07070a]/60 text-slate-400"
              : "border-[#e2e8f0] bg-[#f8fafc] text-slate-500"
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
                <span className={`font-bold uppercase tracking-wide text-[9px] px-1.5 py-0.5 rounded border ${
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
                className={`flex gap-3 max-w-[90%] animate-slide-up ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Sender Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-md transition-all ${
                  msg.sender === "user"
                    ? "bg-slate-800/80 border-slate-700/50 text-slate-300"
                    : "bg-purple-950/60 border-purple-800/50 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                }`}>
                  {msg.sender === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="flex flex-col gap-1.5 max-w-full">
                  <div className={`p-4 rounded-2xl leading-relaxed whitespace-pre-wrap shadow-lg transition-colors duration-250 ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-none shadow-[0_4px_12px_rgba(124,58,237,0.2)]"
                      : (editorTheme === "vs-dark"
                          ? "bg-[#181822]/70 text-slate-200 border border-[#2d2d3c] rounded-tl-none"
                          : "bg-white text-slate-700 border border-slate-200/80 rounded-tl-none shadow-[0_4px_12px_rgba(0,0,0,0.02)]")
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
                            <div key={idx} className={`my-3 border rounded-xl overflow-hidden font-mono text-[11px] shadow-lg transition-colors duration-250 ${
                              editorTheme === "vs-dark" ? "border-[#252533] bg-[#07070a] text-slate-300" : "border-slate-200 bg-[#f8fafc] text-slate-700"
                            }`}>
                              <div className={`px-3.5 py-1.5 text-[9px] font-bold flex justify-between items-center select-none border-b transition-colors duration-250 ${
                                editorTheme === "vs-dark" ? "bg-[#0b0b10] text-slate-500 border-[#1d1d28]" : "bg-[#f1f5f9] text-slate-500 border-slate-200"
                              }`}>
                                <span className="uppercase tracking-wider font-semibold">{lang || "code"}</span>
                                <button
                                  onClick={() => handleCopyCode(actualCode, copyId)}
                                  type="button"
                                  className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 ${
                                    editorTheme === "vs-dark" ? "hover:text-white hover:bg-slate-800/80 text-slate-400" : "hover:text-slate-900 hover:bg-slate-200 text-slate-500"
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
              <div className="flex gap-3 max-w-[90%] mr-auto animate-slide-up">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-md ${
                  editorTheme === "vs-dark" ? "bg-purple-950/60 border-purple-800/50 text-purple-400 animate-pulse-glow-purple" : "bg-purple-50 border-purple-250 text-purple-600"
                }`}>
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="flex flex-col gap-1.5 max-w-full">
                  <div className={`p-4 rounded-2xl leading-relaxed whitespace-pre-wrap shadow-lg transition-colors duration-250 ${
                    editorTheme === "vs-dark"
                      ? "bg-[#181822]/70 text-slate-200 border border-[#2d2d3c] rounded-tl-none"
                      : "bg-white text-slate-700 border border-slate-200/80 rounded-tl-none"
                  }`}>
                    {streamingMessage.includes("```") ? (
                      streamingMessage.split("```").map((block, idx) => {
                        if (idx % 2 === 1) {
                          const codeLines = block.split("\n");
                          const lang = codeLines[0].trim();
                          const actualCode = codeLines.slice(1).join("\n");
                          return (
                            <div key={idx} className={`my-3 border rounded-xl overflow-hidden font-mono text-[11px] shadow-lg transition-colors duration-250 ${
                              editorTheme === "vs-dark" ? "border-[#252533] bg-[#07070a] text-slate-300" : "border-slate-200 bg-[#f8fafc] text-slate-700"
                            }`}>
                              <div className={`px-3.5 py-1.5 text-[9px] font-bold flex justify-between items-center select-none border-b transition-colors duration-250 ${
                                editorTheme === "vs-dark" ? "bg-[#0b0b10] text-slate-500 border-[#1d1d28]" : "bg-[#f1f5f9] text-slate-500 border-slate-200"
                              }`}>
                                <span className="uppercase tracking-wider font-semibold">{lang || "code"}</span>
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
                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-purple-500 animate-pulse rounded-sm align-middle"></span>
                  </div>
                </div>
              </div>
            )}

            {/* Thinking Indicator Animation */}
            {aiStatus === "thinking" && (
              <div className="flex gap-3 max-w-[90%] mr-auto items-start animate-slide-up">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-md ${
                  editorTheme === "vs-dark" ? "bg-purple-950/60 border-purple-800/50 text-purple-400 animate-pulse-glow-purple" : "bg-purple-50 border-purple-250 text-purple-600"
                }`}>
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className={`border p-4.5 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-lg transition-colors duration-250 ${
                  editorTheme === "vs-dark" ? "bg-[#181822]/70 border-[#2d2d3c]" : "bg-white border-slate-200/80"
                }`}>
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce-typing" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce-typing" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce-typing" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Panel */}
          <div className={`px-4 py-3.5 flex flex-col gap-2 shrink-0 border-t transition-colors duration-250 ${
            editorTheme === "vs-dark"
              ? "border-[#1c1c22] bg-[#07070a]/60"
              : "border-[#e2e8f0] bg-[#f8fafc]"
          }`}>
            <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest pl-0.5">Quick Suggestions</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleQuickPrompt("explain")}
                type="button"
                disabled={aiStatus !== "idle"}
                className={`flex items-center gap-1.5 text-[10px] px-3.5 py-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(168,85,247,0.25)] ${
                  editorTheme === "vs-dark"
                    ? "text-slate-200 hover:text-white bg-[#161620] hover:bg-purple-950/20 border border-[#252533] hover:border-purple-500/55"
                    : "text-slate-700 hover:text-purple-700 bg-white hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300"
                }`}
              >
                <Code className="w-3.5 h-3.5 text-purple-400" />
                <span>Explain code</span>
              </button>
              <button
                onClick={() => handleQuickPrompt("refactor")}
                type="button"
                disabled={aiStatus !== "idle"}
                className={`flex items-center gap-1.5 text-[10px] px-3.5 py-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(168,85,247,0.25)] ${
                  editorTheme === "vs-dark"
                    ? "text-slate-200 hover:text-white bg-[#161620] hover:bg-purple-950/20 border border-[#252533] hover:border-purple-500/55"
                    : "text-slate-700 hover:text-purple-700 bg-white hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300"
                }`}
              >
                <Bug className="w-3.5 h-3.5 text-emerald-400" />
                <span>Refactor</span>
              </button>
              <button
                onClick={() => handleQuickPrompt("test")}
                type="button"
                disabled={aiStatus !== "idle"}
                className={`flex items-center gap-1.5 text-[10px] px-3.5 py-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(168,85,247,0.25)] ${
                  editorTheme === "vs-dark"
                    ? "text-slate-200 hover:text-white bg-[#161620] hover:bg-purple-950/20 border border-[#252533] hover:border-purple-500/55"
                    : "text-slate-700 hover:text-purple-700 bg-white hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300"
                }`}
              >
                <Play className="w-3.5 h-3.5 text-amber-400" />
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
            className={`p-4 flex flex-col gap-2.5 shrink-0 border-t transition-colors duration-250 ${
              editorTheme === "vs-dark" ? "bg-[#0b0b0f] border-[#1c1c22]" : "bg-white border-[#e2e8f0]"
            }`}
          >
            <div className={`relative flex items-end rounded-2xl p-2.5 transition-all duration-300 border focus-within:shadow-[0_0_15px_rgba(168,85,247,0.15)] focus-within:scale-[1.01] ${
              editorTheme === "vs-dark"
                ? "bg-[#09090d] border-[#252533] focus-within:border-purple-500/60 focus-within:ring-1 focus-within:ring-purple-500/40"
                : "bg-[#f8fafc] border border-slate-200 focus-within:bg-white focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500/40"
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
      {showStatusBar && (
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
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="settings-glass-panel w-full max-w-2xl h-[450px] rounded-2xl flex flex-col overflow-hidden shadow-2xl relative animate-slide-up" style={{
            background: editorTheme === "vs-dark"
              ? "linear-gradient(135deg, rgba(24,24,28,0.95) 0%, rgba(30,30,35,0.92) 100%)"
              : "linear-gradient(135deg, rgba(249,250,251,0.95) 0%, rgba(243,244,246,0.92) 100%)",
            border: editorTheme === "vs-dark"
              ? "1px solid rgba(51,51,68,0.4)"
              : "1px solid rgba(203,213,225,0.4)",
            backdropFilter: `blur(${glassBlur}px)`,
            WebkitBackdropFilter: `blur(${glassBlur}px)`
          }}>

            {/* Modal Header */}
            <div className={`px-5 py-4 border-b flex items-center justify-between transition-colors duration-250 ${
              editorTheme === "vs-dark" ? "border-slate-800/80 text-white" : "border-slate-200 text-slate-800"
            }`}>
              <div className="flex items-center gap-2">
                <Settings className={`w-5 h-5 ${editorTheme === "vs-dark" ? "text-indigo-400" : "text-indigo-600"}`} />
                <span className="font-bold text-sm tracking-wide">COD Code IDE User Settings</span>
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
      )}

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        theme={editorTheme}
        workspaceId={workspaceId}
        activeCollaborators={activeCollaborators}
        onChangeName={handleChangeName}
      />
    </div>
  );
}
