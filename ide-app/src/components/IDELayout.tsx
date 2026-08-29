import React, { useState, useEffect, useRef, useCallback } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import type { MockFile, ChatMessage, ClientOS } from "../types/ide";
import { initialFiles } from "../constants/initialFiles";
import { detectClientOS, getTerminalPrompt, getTerminalHeader } from "../utils/terminal";
import Header from "./layout/Header";
import ActivityBar from "./layout/ActivityBar";
import StatusBar from "./layout/StatusBar";
import LeftSidebar from "./sidebar/LeftSidebar";
import EditorArea from "./editor/EditorArea";
import BottomPanel from "./bottom/BottomPanel";
import AIChatSidebar from "./ai/AIChatSidebar";
import CallPanel from "./call/CallPanel";
import FloatingScreensharePopup from "./call/FloatingScreensharePopup";
import SettingsModal from "./modals/SettingsModal";
import CreateRoomModal from "./modals/CreateRoomModal";
import InvitationModal from "./modals/InvitationModal";
import SessionEndedScreen from "./modals/SessionEndedScreen";
import ShareModal from "./ShareModal";

export default function IDELayout() {
  // Sidebar states
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [activeLeftTab, setActiveLeftTab] = useState<"explorer" | "search" | "git" | "rooms">("explorer");

  // Panel resizing states
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(260);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(380);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(220);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<"terminal" | "output" | "problems">("terminal");
  // OS Detection for terminal custom look and feel
  const [clientOS] = useState<ClientOS>(() => detectClientOS());

  

  

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
  const [workspaceId, setWorkspaceId] = useState<string>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const invitedRoom = urlParams.get('room');
    const passcode = urlParams.get('passcode');
    const saved = localStorage.getItem('cod-ide-rooms-history');
    const historyList = saved ? JSON.parse(saved) : ["my-room"];
    
    if (invitedRoom && historyList.includes(invitedRoom)) {
      if (passcode) {
        const passcodes = JSON.parse(localStorage.getItem('cod-ide-room-passcodes') || '{}');
        passcodes[invitedRoom] = passcode;
        localStorage.setItem('cod-ide-room-passcodes', JSON.stringify(passcodes));
      }
      return invitedRoom;
    }
    return "my-room";
  });

  const [userRole, setUserRole] = useState<"owner" | "editor" | "viewer">((() => {
    const urlParams = new URLSearchParams(window.location.search);
    const invitedRoom = urlParams.get('room');
    const roleParam = urlParams.get('role')?.toLowerCase();
    
    const saved = localStorage.getItem('cod-ide-rooms-history');
    const historyList = saved ? JSON.parse(saved) : ["my-room"];
    
    if (invitedRoom && historyList.includes(invitedRoom)) {
      if (roleParam === "owner") return "owner";
      if (roleParam === "editor") return "editor";
      if (roleParam === "viewer") return "viewer";
      return "editor";
    }
    return "owner";
  })());

  const [roomsHistory, setRoomsHistory] = useState<string[]>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const invitedRoom = urlParams.get('room');
    const saved = localStorage.getItem('cod-ide-rooms-history');
    const list = saved ? JSON.parse(saved) : ["my-room"];
    
    const initialId = (invitedRoom && list.includes(invitedRoom)) ? invitedRoom : "my-room";
    const uniqueList = Array.from(new Set([...list, initialId])).filter(Boolean);
    localStorage.setItem('cod-ide-rooms-history', JSON.stringify(uniqueList));
    
    // Track roles for each room in localStorage
    const savedRoles = localStorage.getItem('cod-ide-room-roles') || '{}';
    const rolesMap = JSON.parse(savedRoles);
    if (!rolesMap[initialId]) {
      const roleParam = urlParams.get('role')?.toLowerCase() || "owner";
      rolesMap[initialId] = roleParam;
      localStorage.setItem('cod-ide-room-roles', JSON.stringify(rolesMap));
    }
    return uniqueList;
  });

  const roomsHistoryRef = useRef<string[]>([]);

  const updateRoomsHistory = (newHistory: string[]) => {
    const uniqueList = Array.from(new Set(newHistory)).filter(Boolean);
    setRoomsHistory(uniqueList);
    roomsHistoryRef.current = uniqueList;
    localStorage.setItem('cod-ide-rooms-history', JSON.stringify(uniqueList));
  };

  // Keep ref in sync with state
  useEffect(() => {
    roomsHistoryRef.current = roomsHistory;
  }, [roomsHistory]);

  // Create Room Modal states
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [createRoomName, setCreateRoomName] = useState("");
  const [createRoomType, setCreateRoomType] = useState<"public" | "private">("public");

  const [invitation, setInvitation] = useState<{ room: string; role: string; passcode?: string } | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const invitedRoom = urlParams.get('room');
    const invitedRole = urlParams.get('role')?.toLowerCase() || "editor";
    const invitedPasscode = urlParams.get('passcode') || "";
    
    const saved = localStorage.getItem('cod-ide-rooms-history');
    const historyList = saved ? JSON.parse(saved) : ["my-room"];
    
    if (invitedRoom && !historyList.includes(invitedRoom)) {
      setInvitation({ room: invitedRoom, role: invitedRole, passcode: invitedPasscode });
    }
  }, []);

  const handleAcceptInvitation = () => {
    if (!invitation) return;
    const { room, role, passcode } = invitation;

    // Save passcode if present
    if (passcode) {
      const passcodes = JSON.parse(localStorage.getItem('cod-ide-room-passcodes') || '{}');
      passcodes[room] = passcode;
      localStorage.setItem('cod-ide-room-passcodes', JSON.stringify(passcodes));
    }

    // Add to history
    const saved = localStorage.getItem('cod-ide-rooms-history');
    const historyList = saved ? JSON.parse(saved) : ["my-room"];
    updateRoomsHistory([...historyList, room]);

    // Set roles map
    const savedRoles = localStorage.getItem('cod-ide-room-roles') || '{}';
    const rolesMap = JSON.parse(savedRoles);
    rolesMap[room] = role;
    localStorage.setItem('cod-ide-room-roles', JSON.stringify(rolesMap));

    // Clear invitation state
    setInvitation(null);

    // Switch to room
    handleSwitchRoom(room);
  };

  const handleDeclineInvitation = () => {
    setInvitation(null);
    // Clear URL parameters
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    url.searchParams.delete('role');
    url.searchParams.delete('passcode');
    window.history.pushState(null, '', url.toString());
  };

  const handleSwitchRoom = (roomId: string) => {
    setWorkspaceId(roomId);
    
    const savedRoles = localStorage.getItem('cod-ide-room-roles') || '{}';
    const rolesMap = JSON.parse(savedRoles);
    const role = rolesMap[roomId] || 'owner';
    
    const passcodes = JSON.parse(localStorage.getItem('cod-ide-room-passcodes') || '{}');
    const passcode = passcodes[roomId] || "";

    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    url.searchParams.set('role', role);
    if (passcode) {
      url.searchParams.set('passcode', passcode);
    } else {
      url.searchParams.delete('passcode');
    }
    window.history.pushState(null, '', url.toString());

    setUserRole(role as any);
  };

  const handleCreateNewRoom = () => {
    setCreateRoomName(`room-${Math.random().toString(36).substring(2, 9)}`);
    setCreateRoomType("public");
    setShowCreateRoomModal(true);
  };

  const handleConfirmCreateRoom = async () => {
    const newRoomId = createRoomName.trim().replace(/[^a-zA-Z0-9-_]/g, '-');
    if (!newRoomId) return;

    const isPrivate = createRoomType === "private";
    setShowCreateRoomModal(false);
    
    // Call backend API to create workspace room (saving in MongoDB)
    let passcode = "";
    try {
      const response = await fetch(`${BACKEND_API_URL}/workspace`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({
          workspace_id: newRoomId,
          name: createRoomName.trim() || newRoomId,
          type: isPrivate ? "private" : "public"
        })
      });
      if (response.ok) {
        const workspaceData = await response.json();
        passcode = workspaceData.passcode || "";
      }
    } catch (err) {
      console.warn("Could not create workspace room in backend database:", err);
      // Fallback local passcode generation
      if (isPrivate) {
        passcode = 'sec-' + Math.random().toString(36).substring(2, 10);
      }
    }

    if (passcode) {
      const passcodes = JSON.parse(localStorage.getItem('cod-ide-room-passcodes') || '{}');
      passcodes[newRoomId] = passcode;
      localStorage.setItem('cod-ide-room-passcodes', JSON.stringify(passcodes));
    }

    const savedRoles = localStorage.getItem('cod-ide-room-roles') || '{}';
    const rolesMap = JSON.parse(savedRoles);
    rolesMap[newRoomId] = 'owner';
    localStorage.setItem('cod-ide-room-roles', JSON.stringify(rolesMap));

    updateRoomsHistory([...roomsHistory, newRoomId]);

    if (!isPrivate && ydocRef.current) {
      ydocRef.current.getMap('rooms-sync').set('event', JSON.stringify({
        type: 'create',
        newRoomId: newRoomId,
        timestamp: Date.now()
      }));
    }

    setTimeout(() => {
      handleSwitchRoom(newRoomId);
    }, 200);
  };

  const handleRenameRoom = async (oldRoomId: string) => {
    const newRoomName = window.prompt(`Enter new name for room "${oldRoomId}":`, oldRoomId);
    if (!newRoomName) return;
    const sanitizedNewRoomId = newRoomName.trim().replace(/[^a-zA-Z0-9-_]/g, '-');
    if (!sanitizedNewRoomId || sanitizedNewRoomId === oldRoomId) return;

    if (roomsHistory.includes(sanitizedNewRoomId)) {
      alert("A room with this name already exists in history.");
      return;
    }

    const passcodes = JSON.parse(localStorage.getItem('cod-ide-room-passcodes') || '{}');
    const oldPasscode = passcodes[oldRoomId] || "";
    const isOldRoomPrivate = !!oldPasscode;

    // Call backend rename endpoint — it migrates files + cleans up old data
    try {
      const url = new URL(`${BACKEND_API_URL}/workspace/${oldRoomId}/rename`);
      if (oldPasscode) url.searchParams.set('passcode', oldPasscode);

      const response = await fetch(url.toString(), {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({
          new_workspace_id: sanitizedNewRoomId,
          new_name: newRoomName.trim()
        })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        alert(err.detail || "Failed to rename workspace on server.");
        return;
      }
    } catch (err) {
      console.warn("Could not rename workspace on backend:", err);
    }

    // Migrate passcode from old room to new room in localStorage
    if (isOldRoomPrivate) {
      delete passcodes[oldRoomId];
      passcodes[sanitizedNewRoomId] = oldPasscode;
      localStorage.setItem('cod-ide-room-passcodes', JSON.stringify(passcodes));
    }

    if (!isOldRoomPrivate && ydocRef.current) {
      ydocRef.current.getMap('rooms-sync').set('event', JSON.stringify({
        type: 'rename',
        oldRoomId: oldRoomId,
        newRoomId: sanitizedNewRoomId,
        timestamp: Date.now()
      }));
    }

    // Update rooms history list
    const updatedHistory = roomsHistory.map(r => r === oldRoomId ? sanitizedNewRoomId : r);
    updateRoomsHistory(updatedHistory);

    // Update room roles
    const savedRoles = localStorage.getItem('cod-ide-room-roles') || '{}';
    const rolesMap = JSON.parse(savedRoles);
    const role = rolesMap[oldRoomId] || 'owner';
    delete rolesMap[oldRoomId];
    rolesMap[sanitizedNewRoomId] = role;
    localStorage.setItem('cod-ide-room-roles', JSON.stringify(rolesMap));

    // If it was the active room, switch to it
    if (oldRoomId === workspaceId) {
      setTimeout(() => {
        handleSwitchRoom(sanitizedNewRoomId);
      }, 200);
    }
  };

  // Clear workspace files/tabs when workspaceId changes to avoid data leaking between rooms
  useEffect(() => {
    setFiles({});
    setOpenTabs([]);
    setActiveFilePath("");
    setIsLocalProject(false);
    setLocalDirName("");
    localDirectoryHandleRef.current = null;
    localFileHandlesRef.current.clear();
  }, [workspaceId]);

  const BACKEND_API_URL = "https://untamed-art-briskly.ngrok-free.dev";

  const uploadFile = async (filePath: string, fileData: MockFile) => {
    const payload = {
      name: fileData.name,
      path: filePath,
      content: fileData.content,
      language: fileData.language
    };
    try {
      const passcodes = JSON.parse(localStorage.getItem('cod-ide-room-passcodes') || '{}');
      const passcode = passcodes[workspaceId] || new URLSearchParams(window.location.search).get('passcode') || "";
      const url = new URL(`${BACKEND_API_URL}/workspace/${workspaceId}/files`);
      if (passcode) url.searchParams.set('passcode', passcode);

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify(payload)
      });
      return response.ok;
    } catch (e) {
      console.error("Failed to upload file:", filePath, e);
      return false;
    }
  };

  // Local project states
  const [isLocalProject, setIsLocalProject] = useState<boolean>(false);
  const [localDirName, setLocalDirName] = useState<string>("");
  const localDirectoryHandleRef = useRef<any>(null);
  const localFileHandlesRef = useRef<Map<string, any>>(new Map());

  // File explorer states
  const [files, setFiles] = useState<Record<string, MockFile>>(initialFiles);
  const [activeFilePath, setActiveFilePath] = useState<string>("");
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [explorerExpanded, setExplorerExpanded] = useState<Record<string, boolean>>({
    src: true,
    components: true,
    root: true,
    recent: true
  });

  const [recentFiles, setRecentFiles] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`recent-files-${workspaceId}`);
    setRecentFiles(saved ? JSON.parse(saved) : []);
  }, [workspaceId]);

  const addToRecentFiles = useCallback((filePath: string) => {
    setRecentFiles(prev => {
      const filtered = prev.filter(f => f !== filePath);
      const updated = [filePath, ...filtered].slice(0, 10);
      localStorage.setItem(`recent-files-${workspaceId}`, JSON.stringify(updated));
      return updated;
    });
  }, [workspaceId]);

  // Open local folder / project using File System Access API
  const handleOpenLocalFolder = async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        alert("Your browser does not support local directory access. Please use Chrome, Edge, or Opera.");
        return;
      }
      
      const dirHandle = await (window as any).showDirectoryPicker();
      setIsLocalProject(true);
      setLocalDirName(dirHandle.name);
      localDirectoryHandleRef.current = dirHandle;
      localFileHandlesRef.current.clear();
      
      const loadedFiles: Record<string, MockFile> = {};
      
      const readDirectory = async (directoryHandle: any, currentPath: string = "") => {
        for await (const entry of directoryHandle.values()) {
          const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
          
          if (entry.kind === 'file') {
            if (entry.name.startsWith('.') || entryPath.includes('node_modules/') || entryPath.includes('.git/')) {
              continue;
            }
            
            const fileHandle = entry;
            localFileHandlesRef.current.set(entryPath, fileHandle);
            
            try {
              const file = await fileHandle.getFile();
              const textContent = await file.text();
              
              let language = "javascript";
              if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) language = "typescript";
              else if (entry.name.endsWith(".css")) language = "css";
              else if (entry.name.endsWith(".json")) language = "json";
              else if (entry.name.endsWith(".html")) language = "html";
              else if (entry.name.endsWith(".py")) language = "python";
              else if (entry.name.endsWith(".md")) language = "markdown";
              else if (entry.name.endsWith(".txt")) language = "plaintext";
              
              loadedFiles[entryPath] = {
                id: entryPath,
                name: entry.name,
                path: entryPath,
                language: language,
                content: textContent
              };
            } catch (fileErr) {
              console.warn(`Could not read file ${entryPath}:`, fileErr);
            }
          } else if (entry.kind === 'directory') {
            if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.vscode' || entry.name === 'dist') {
              continue;
            }
            await readDirectory(entry, entryPath);
          }
        }
      };
      
      await readDirectory(dirHandle);
      
      setFiles(loadedFiles);

      // Upload files to the collaborative workspace backend
      const uploadPromises = Object.entries(loadedFiles).map(([path, fileData]) => 
        uploadFile(path, fileData)
      );
      await Promise.all(uploadPromises);

      // Notify other clients via Yjs
      if (ydocRef.current) {
        ydocRef.current.getMap('files-metadata').set('lastUpdated', Date.now().toString());
      }
      
      const filePaths = Object.keys(loadedFiles);
      if (filePaths.length > 0) {
        filePaths.sort();
        setActiveFilePath(filePaths[0]);
        setOpenTabs([filePaths[0]]);
      } else {
        setActiveFilePath("");
        setOpenTabs([]);
      }
      
      alert(`Successfully opened local project: ${dirHandle.name} and shared with collaborators`);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Error opening directory:", err);
        alert(`Failed to open directory: ${err.message}`);
      }
    }
  };

  // Open single local file
  const handleOpenLocalFile = async () => {
    try {
      if (!('showOpenFilePicker' in window)) {
        alert("Your browser does not support local file access. Please use Chrome, Edge, or Opera.");
        return;
      }
      
      const [fileHandle] = await (window as any).showOpenFilePicker();
      const file = await fileHandle.getFile();
      const textContent = await file.text();
      
      let language = "javascript";
      if (file.name.endsWith(".ts") || file.name.endsWith(".tsx")) language = "typescript";
      else if (file.name.endsWith(".css")) language = "css";
      else if (file.name.endsWith(".json")) language = "json";
      else if (file.name.endsWith(".html")) language = "html";
      else if (file.name.endsWith(".py")) language = "python";
      else if (file.name.endsWith(".md")) language = "markdown";
      else if (file.name.endsWith(".txt")) language = "plaintext";
      
      const filePath = file.name;
      localFileHandlesRef.current.set(filePath, fileHandle);
      setIsLocalProject(true);
      
      const fileData = {
        id: filePath,
        name: file.name,
        path: filePath,
        language: language,
        content: textContent
      };

      setFiles(prev => ({
        ...prev,
        [filePath]: fileData
      }));
      
      await uploadFile(filePath, fileData);

      // Notify other clients via Yjs
      if (ydocRef.current) {
        ydocRef.current.getMap('files-metadata').set('lastUpdated', Date.now().toString());
      }
      
      handleOpenFile(filePath);
      alert(`Opened and shared file: ${file.name}`);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Error opening file:", err);
        alert(`Failed to open file: ${err.message}`);
      }
    }
  };

  // Save active file content back to disk
  const handleSaveFile = useCallback(async () => {
    if (!activeFilePath) return;
    
    if (isLocalProject) {
      try {
        const fileHandle = localFileHandlesRef.current.get(activeFilePath);
        if (fileHandle) {
          const writable = await fileHandle.createWritable();
          await writable.write(files[activeFilePath]?.content || "");
          await writable.close();
          console.log(`Saved ${activeFilePath} to local disk.`);
        } else {
          alert("File handle not found. Try 'Save As...'");
        }
      } catch (err: any) {
        console.error("Failed to save local file:", err);
        alert(`Failed to save file: ${err.message}`);
      }
    } else {
      alert("Changes synced automatically with the collaborative room!");
    }
  }, [activeFilePath, isLocalProject, files]);

  // Save file under new name
  const handleSaveFileAs = async () => {
    if (!activeFilePath) return;
    try {
      if (!('showSaveFilePicker' in window)) {
        alert("Your browser does not support local file saving. Please use Chrome, Edge, or Opera.");
        return;
      }
      
      const file = files[activeFilePath];
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: file.name
      });
      const writable = await handle.createWritable();
      await writable.write(file.content);
      await writable.close();
      alert(`Successfully saved file as ${handle.name}`);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Error saving file as:", err);
        alert(`Failed to save file: ${err.message}`);
      }
    }
  };

  // Close local project and return to remote
  const handleCloseLocalProject = useCallback(() => {
    setIsLocalProject(false);
    setLocalDirName("");
    localDirectoryHandleRef.current = null;
    localFileHandlesRef.current.clear();
    setFiles({});
    setOpenTabs([]);
    setActiveFilePath("");
    setTimeout(() => {
      fetchWorkspaceFiles();
    }, 100);
    alert("Closed local project and reconnected to remote workspace.");
  }, [workspaceId]);

  // Bug 7 fix: Wrap fetchWorkspaceFiles in useCallback to avoid stale closures
  const fetchWorkspaceFiles = useCallback(async () => {
    try {
      const passcodes = JSON.parse(localStorage.getItem('cod-ide-room-passcodes') || '{}');
      const passcode = passcodes[workspaceId] || new URLSearchParams(window.location.search).get('passcode') || "";
      const url = new URL(`${BACKEND_API_URL}/workspace/${workspaceId}/files`);
      if (passcode) url.searchParams.set('passcode', passcode);

      const response = await fetch(url.toString(), {
        headers: {
          "ngrok-skip-browser-warning": "true"
        },
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const filesMap: Record<string, MockFile> = {};
          setFiles(prev => {
            // First keep all existing local files (to prevent losing them if upload is still in progress or failed)
            if (isLocalProject) {
              Object.keys(prev).forEach(key => {
                if (localFileHandlesRef.current.has(key)) {
                  filesMap[key] = prev[key];
                }
              });
            }
            data.forEach((file: any) => {
              const filePath = file.path || file.name || `src/${file.id || file.name}`;
              // Prevent overwriting the active file's content with old backend data while editing
              const existingContent = prev[filePath]?.content ?? "";
              const newContent = (filePath === activeFilePath && existingContent) ? existingContent : (file.content || "");
              filesMap[filePath] = {
                id: file.id || file.file_id || filePath,
                name: file.name,
                path: filePath,
                language: file.language || "typescript",
                content: newContent
              };
            });
            return filesMap;
          });
          setOpenTabs(prev => {
            // Keep existing tabs if they are still valid in the new files map
            const validPrev = prev.filter(p => filesMap[p] || p === activeFilePath);
            if (validPrev.length > 0) return validPrev;
            return Object.keys(filesMap).length > 0 ? Object.keys(filesMap) : prev;
          });
          setActiveFilePath(prev => {
            if (filesMap[prev] || prev === activeFilePath) return prev;
            return Object.keys(filesMap)[0] || prev;
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch files from backend REST API:", err);
    }
  }, [workspaceId, activeFilePath, isLocalProject]);

  // Fetch workspace files from backend on component mount
  useEffect(() => {
    fetchWorkspaceFiles();
  }, [fetchWorkspaceFiles]);

  // Fallback Polling: Fetch workspace files list every 5 seconds to ensure sync
  // even if WebSocket connection is blocked by ngrok
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWorkspaceFiles();
    }, 5000);
    return () => clearInterval(interval);
  }, [workspaceId, fetchWorkspaceFiles]);

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
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newName.trim())}`
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
              // Bug 11 fix: guard against null providerRef.current
              isMe: clientID === providerRef.current?.awareness?.clientID
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

  // Exit/Goodbye Screen States
  const [isExiting, setIsExiting] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);

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
  // Bug 4 fix: Don't start call automatically — wait for user to join
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCallPanelOpen, setIsCallPanelOpen] = useState(false);
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
    const passcodes = JSON.parse(localStorage.getItem('cod-ide-room-passcodes') || '{}');
    const passcode = passcodes[workspaceId] || new URLSearchParams(window.location.search).get('passcode') || "";
    const provider = new WebsocketProvider(
      'wss://quench-mortified-amaze.ngrok-free.dev/ws',
      workspaceId + (passcode ? '?passcode=' + passcode : ''),
      doc
    );
    providerRef.current = provider;

    // Set local client awareness profile
    if (!localUserRef.current) {
      const randomSeed = Math.floor(Math.random() * 1000);
      localUserRef.current = {
        name: `User-${randomSeed}`,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=User-${randomSeed}`,
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        isSharingScreen: false,
        role: userRole
      };
    }
    provider.awareness.setLocalStateField('user', localUserRef.current);

    const handleAwarenessUpdate = () => {
      const states = provider.awareness.getStates();
      const collabs: any[] = [];
      
      let styleEl = document.getElementById('yjs-cursor-styles');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'yjs-cursor-styles';
        document.head.appendChild(styleEl);
      }

      let cssRules = '';

      // Helper to calculate contrast color (black or white text based on background brightness)
      const getContrastColor = (hexColor: string) => {
        if (!hexColor || hexColor.charAt(0) !== '#') return '#ffffff';
        const hex = hexColor.substring(1);
        let r = 0, g = 0, b = 0;
        if (hex.length === 3) {
          r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
          g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
          b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
        } else if (hex.length === 6) {
          r = parseInt(hex.substring(0, 2), 16);
          g = parseInt(hex.substring(2, 4), 16);
          b = parseInt(hex.substring(4, 6), 16);
        } else {
          return '#ffffff';
        }
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.6 ? '#0f172a' : '#ffffff';
      };

      states.forEach((state: any, clientID: number) => {
        if (state.user) {
          collabs.push({
            id: clientID,
            name: state.user.name,
            avatar: state.user.avatar,
            color: state.user.color,
            isMe: clientID === provider.awareness.clientID,
            isSharingScreen: !!state.user.isSharingScreen,
            role: state.user.role || 'editor'
          });

          // Generate cursor styles for remote collaborators
          if (clientID !== provider.awareness.clientID) {
            const color = state.user.color || '#8b5cf6';
            const name = state.user.name || 'Collaborator';
            const textColor = getContrastColor(color);

            cssRules += `
              .yRemoteSelection-${clientID} {
                background-color: ${color}26 !important; /* ~15% transparency */
              }
              .yRemoteSelectionHead-${clientID} {
                position: absolute;
                border-left: 2px solid ${color} !important;
                height: 100%;
                box-sizing: border-box;
              }
              .yRemoteSelectionHead-${clientID}::after {
                content: "${name}";
                position: absolute;
                top: -19px;
                left: -2px;
                font-size: 9px;
                font-family: system-ui, -apple-system, sans-serif;
                font-weight: 600;
                background-color: ${color};
                color: ${textColor};
                padding: 1.5px 5.5px;
                border-radius: 3px;
                border-bottom-left-radius: 0;
                white-space: nowrap;
                pointer-events: none;
                opacity: 0.95;
                z-index: 100;
                box-shadow: 0 1.5px 3px rgba(0, 0, 0, 0.3);
              }
            `;
          }
        }
      });

      styleEl.textContent = cssRules;
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

    const roomsSyncMap = doc.getMap('rooms-sync');
    const handleRoomsSyncObserve = () => {
      try {
        const rawEvent = roomsSyncMap.get('event') as string;
        if (!rawEvent) return;
        const parsed = JSON.parse(rawEvent);
        if (!parsed || !parsed.newRoomId) return;

        const currentHistory = roomsHistoryRef.current;

        if (parsed.type === 'create') {
          updateRoomsHistory([...currentHistory, parsed.newRoomId]);
        } else if (parsed.type === 'rename') {
          const oldId = parsed.oldRoomId;
          const newId = parsed.newRoomId;

          // Update local history using ref for fresh value
          const nextHistory = currentHistory.map(r => r === oldId ? newId : r);
          updateRoomsHistory([...nextHistory, newId]);

          // Update roles map in localStorage
          const savedRoles = localStorage.getItem('cod-ide-room-roles') || '{}';
          const rolesMap = JSON.parse(savedRoles);
          const role = rolesMap[oldId] || 'editor';
          delete rolesMap[oldId];
          rolesMap[newId] = role;
          localStorage.setItem('cod-ide-room-roles', JSON.stringify(rolesMap));

          // If currently in the renamed room, redirect automatically!
          if (workspaceId === oldId) {
            setWorkspaceId(newId);
            const url = new URL(window.location.href);
            url.searchParams.set('room', newId);
            url.searchParams.set('role', role);
            window.history.pushState(null, '', url.toString());
            setUserRole(role as any);
          }
        }
      } catch (err) {
        console.error("Failed to sync room event:", err);
      }
    };
    roomsSyncMap.observe(handleRoomsSyncObserve);

    setProviderReady(true);

    provider.on('status', (event: any) => {
      console.log('Yjs collaboration provider status:', event.status);
    });

    return () => {
      setProviderReady(false);
      provider.awareness.off('change', handleAwarenessUpdate);
      filesMetadataMap.unobserve(handleFilesMetadataObserve);
      roomsSyncMap.unobserve(handleRoomsSyncObserve);
      provider.destroy();
      doc.destroy();
      ydocRef.current = null;
      providerRef.current = null;

      // Clean up dynamic styles
      const styleEl = document.getElementById('yjs-cursor-styles');
      if (styleEl) {
        styleEl.remove();
      }
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
  const [poppedOutScreens, setPoppedOutScreens] = useState<Record<string, boolean>>({});
  const [popupPositions, setPopupPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [maximizedPopups, setMaximizedPopups] = useState<Record<string, boolean>>({});
  const popupDragRef = useRef<{ id: string | null; startMouse: { x: number; y: number }; startPos: { x: number; y: number } }>({ id: null, startMouse: { x: 0, y: 0 }, startPos: { x: 0, y: 0 } });

  // ── Disconnect call: stop all streams, close all peer connections ────────────
  const disconnectCall = () => {
    // Stop local microphone
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    localAudioTrackRef.current = null;

    // Stop local screen share
    if (localScreenStreamRef.current) {
      localScreenStreamRef.current.getTracks().forEach(t => t.stop());
      localScreenStreamRef.current = null;
    }
    setIsSharingScreen(false);

    // Close all peer connections (Bug 12 fix: log errors instead of swallowing)
    Object.keys(peerConnectionsRef.current).forEach(pcId => {
      try { peerConnectionsRef.current[pcId].close(); } catch (e) { console.debug('Error closing peer connection:', e); }
      delete peerConnectionsRef.current[pcId];
    });
    peerConnectionsRef.current = {};

    // Remove all audio elements from DOM (Bug 12 fix: log errors)
    Object.keys(audioElementsRef.current).forEach(pcId => {
      try { audioElementsRef.current[pcId].pause(); audioElementsRef.current[pcId].srcObject = null; audioElementsRef.current[pcId].remove(); } catch (e) { console.debug('Error removing audio element:', e); }
      delete audioElementsRef.current[pcId];
    });
    audioElementsRef.current = {};

    // Stop volume monitors
    Object.keys(audioContextsRef.current).forEach(cid => stopMonitoringVolume(cid));
    audioContextsRef.current = {};
    setSpeakingUsers({});

    // Clear remote streams and popup state
    setRemoteScreenStreams({});
    setPoppedOutScreens({});
    setPopupPositions({});
    setMaximizedPopups({});

    // Hide the call panel
    setIsCallActive(false);
    setIsCallPanelOpen(false);
  };

  const playExitSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.exponentialRampToValueAtTime(261.63, now + 0.15);
      osc1.frequency.exponentialRampToValueAtTime(130.81, now + 0.4);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(261.63, now);
      osc2.frequency.exponentialRampToValueAtTime(130.81, now + 0.2);
      osc2.frequency.exponentialRampToValueAtTime(65.41, now + 0.5);
      gain2.gain.setValueAtTime(0.15, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      
      osc1.start(now);
      osc1.stop(now + 0.5);
      osc2.start(now);
      osc2.stop(now + 0.55);
    } catch (e) {
      console.warn("Failed to play exit sound:", e);
    }
  };

  const handleExitCallWithAnimation = () => {
    playExitSound();
    setIsExiting(true);
    setTimeout(() => {
      disconnectCall();
      setSessionEnded(true);
      setIsExiting(false);
    }, 700);
  };

  // ── Toggle screenshare popup out of panel ────────────────────────────────────
  const togglePopOut = (collabId: string) => {
    setPoppedOutScreens(prev => {
      const isPopped = !!prev[collabId];
      if (!isPopped) {
        // Initialize centered position
        setPopupPositions(p => ({
          ...p,
          [collabId]: { x: window.innerWidth / 2 - 400, y: window.innerHeight / 2 - 250 }
        }));
      }
      return { ...prev, [collabId]: !isPopped };
    });
  };

  // ── Popup drag helpers ────────────────────────────────────────────────────────
  const handlePopupMouseDown = (collabId: string, e: React.MouseEvent) => {
    e.preventDefault();
    popupDragRef.current = {
      id: collabId,
      startMouse: { x: e.clientX, y: e.clientY },
      startPos: { ...popupPositions[collabId] }
    };
    const onMove = (me: MouseEvent) => {
      const ref = popupDragRef.current;
      if (!ref.id) return;
      const dx = me.clientX - ref.startMouse.x;
      const dy = me.clientY - ref.startMouse.y;
      setPopupPositions(prev => ({
        ...prev,
        [ref.id!]: { x: ref.startPos.x + dx, y: ref.startPos.y + dy }
      }));
    };
    const onUp = () => {
      popupDragRef.current.id = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // Renegotiate connection helper
  const renegotiate = (pcId: string, pc: RTCPeerConnection) => {
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
      .catch(err => console.error(`Error renegotiating for peer ${pcId}:`, err));
  };
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
      // Bug 6 fix: Connect to a silent gain node instead of audioCtx.destination
      // to prevent audio feedback loop (raw mic playing back through speakers)
      const silentGain = audioCtx.createGain();
      silentGain.gain.value = 0;
      processor.connect(silentGain);
      silentGain.connect(audioCtx.destination);

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
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
          localScreenStreamRef.current = stream;
          const videoTrack = stream.getVideoTracks()[0];

          // Add all tracks (video and audio, if present) to all peer connections
          Object.entries(peerConnectionsRef.current).forEach(([pcId, pc]) => {
            stream.getTracks().forEach((track) => {
              pc.addTrack(track, stream);
            });
            // Trigger renegotiation offer
            renegotiate(pcId, pc);
          });

          if (videoTrack) {
            videoTrack.onended = () => {
              setIsSharingScreen(false);
            };
          }
        } catch (err) {
          console.warn("Screen share cancelled or failed:", err);
          setIsSharingScreen(false);
        }
      } else if (!isSharingScreen && localScreenStreamRef.current) {
        // Stop current tracks
        localScreenStreamRef.current.getTracks().forEach(t => t.stop());
        localScreenStreamRef.current = null;

        // Remove screen share senders from peer connections
        Object.entries(peerConnectionsRef.current).forEach(([pcId, pc]) => {
          const senders = pc.getSenders();
          let hasRemoved = false;
          senders.forEach((sender) => {
            if (
              sender.track &&
              (sender.track.kind === 'video' ||
                (sender.track.kind === 'audio' && sender.track !== localAudioTrackRef.current))
            ) {
              pc.removeTrack(sender);
              hasRemoved = true;
            }
          });
          if (hasRemoved) {
            // Renegotiate
            renegotiate(pcId, pc);
          }
        });
      }
    };
    handleScreenSharing();
  }, [isSharingScreen]);

  // Bug 3 fix: Track ICE candidate polling intervals for proper cleanup
  const iceIntervalsRef = useRef<number[]>([]);

  // WebRTC Audio & Video Calls & Signalling via Yjs
  useEffect(() => {
    if (!providerReady || !ydocRef.current || !providerRef.current) return;

    const doc = ydocRef.current;
    const provider = providerRef.current;
    const myClientID = provider.awareness.clientID;

    // Get or create signaling map
    const signalingMap = doc.getMap('webrtc-signaling');

    if (!isCallActive) {
      // CLEAN UP EVERYTHING INSTANTLY! (Bug 12 fix: log errors)
      Object.keys(peerConnectionsRef.current).forEach((pcId) => {
        try {
          peerConnectionsRef.current[pcId].close();
        } catch (e) { console.debug('Error closing peer connection during cleanup:', e); }
        delete peerConnectionsRef.current[pcId];
      });
      peerConnectionsRef.current = {};

      Object.keys(audioElementsRef.current).forEach((pcId) => {
        try {
          audioElementsRef.current[pcId].remove();
        } catch (e) { console.debug('Error removing audio element during cleanup:', e); }
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

      if (localScreenStreamRef.current) {
        localScreenStreamRef.current.getTracks().forEach(t => t.stop());
        localScreenStreamRef.current = null;
      }
      setIsSharingScreen(false);

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
          Object.entries(peerConnectionsRef.current).forEach(([pcId, pc]) => {
            const senders = pc.getSenders();
            const audioSender = senders.find(s => 
              s.track && 
              s.track.kind === 'audio' && 
              !(localScreenStreamRef.current && localScreenStreamRef.current.getAudioTracks().some(t => t === s.track))
            );
            if (audioSender) {
              audioSender.replaceTrack(track);
            } else {
              pc.addTrack(track, stream);
              // Trigger renegotiation for the newly added microphone track
              renegotiate(pcId, pc);
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
        localScreenStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localScreenStreamRef.current!);
        });
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
            if (remoteStream.getVideoTracks().length > 0) {
              // This is screenshare audio, which is played by the screen share <video> element.
              // We do not assign it to the mic <audio> element to prevent overwriting.
              return;
            }
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
                  if (localScreenStreamRef.current) {
                    const senders = pc.getSenders();
                    localScreenStreamRef.current.getTracks().forEach((track) => {
                      if (!senders.some(s => s.track === track)) {
                        pc.addTrack(track, localScreenStreamRef.current!);
                      }
                    });
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
                // Bug 3 fix: Track polling intervals for cleanup to prevent memory leaks
                const checkInterval = window.setInterval(() => {
                  if (pc.remoteDescription) {
                    pc.addIceCandidate(new RTCIceCandidate(data.candidate))
                      .catch(err => console.error("Error adding ICE candidate:", err));
                    clearInterval(checkInterval);
                    // Remove from tracked intervals
                    iceIntervalsRef.current = iceIntervalsRef.current.filter(id => id !== checkInterval);
                  }
                }, 100);
                iceIntervalsRef.current.push(checkInterval);
                setTimeout(() => {
                  clearInterval(checkInterval);
                  iceIntervalsRef.current = iceIntervalsRef.current.filter(id => id !== checkInterval);
                }, 5000);
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
      // Bug 3 fix: Clear all tracked ICE polling intervals on cleanup
      iceIntervalsRef.current.forEach(id => clearInterval(id));
      iceIntervalsRef.current = [];
    };
    // Bug 5 fix: Use stringified collaborator IDs instead of .length
    // to detect identity changes (not just count changes)
  }, [providerReady, JSON.stringify(activeCollaborators.map(c => c.id)), isCallActive, isMuted, isDeafened]);

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
  const chatContainerRef = useRef<HTMLDivElement>(null);
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

  // Auto-scroll chat to bottom with smart stabilization and viewport anchoring
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    // Check if the user is already near the bottom (within a 120px threshold)
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;

    // Trigger instant scroll during active streaming to prevent jitter, 
    // and smooth scroll during thinking/idle transitions to feel premium
    if (isNearBottom || aiStatus === "thinking") {
      const scrollBehavior = aiStatus === "typing" ? "auto" : "smooth";
      container.scrollTo({
        top: container.scrollHeight,
        behavior: scrollBehavior
      });
    }
  }, [messages, streamingMessage, aiStatus]);

  // Handle file code editing
  const handleEditorChange = (value: string | undefined) => {
    if (userRole === "viewer") return;
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
    addToRecentFiles(path);
  };

  // Create workspace file in backend
  const handleCreateFile = async () => {
    if (userRole === "viewer" && !isLocalProject) {
      alert("Permission Denied: Viewers cannot create files.");
      return;
    }
    const filename = prompt("Enter new filename (e.g., src/index.css):");
    if (!filename) return;

    let language = "javascript";
    if (filename.endsWith(".ts") || filename.endsWith(".tsx")) language = "typescript";
    else if (filename.endsWith(".css")) language = "css";
    else if (filename.endsWith(".json")) language = "json";
    else if (filename.endsWith(".html")) language = "html";
    else if (filename.endsWith(".py")) language = "python";
    else if (filename.endsWith(".md")) language = "markdown";
    else if (filename.endsWith(".txt")) language = "plaintext";

    if (isLocalProject) {
      try {
        if (!localDirectoryHandleRef.current) {
          alert("No local project open.");
          return;
        }
        const parts = filename.split("/");
        const fileName = parts.pop()!;
        
        let currentDirHandle = localDirectoryHandleRef.current;
        for (const dirName of parts) {
          if (dirName) {
            currentDirHandle = await currentDirHandle.getDirectoryHandle(dirName, { create: true });
          }
        }
        
        const newFileHandle = await currentDirHandle.getFileHandle(fileName, { create: true });
        localFileHandlesRef.current.set(filename, newFileHandle);
        
        const initialContent = `// New file ${filename}\n`;
        const writable = await newFileHandle.createWritable();
        await writable.write(initialContent);
        await writable.close();
        
        const fileData = {
          id: filename,
          name: fileName,
          path: filename,
          language: language,
          content: initialContent
        };

        setFiles(prev => ({
          ...prev,
          [filename]: fileData
        }));

        await uploadFile(filename, fileData);

        // Notify other clients via Yjs
        if (ydocRef.current) {
          ydocRef.current.getMap('files-metadata').set('lastUpdated', Date.now().toString());
        }

        handleOpenFile(filename);
      } catch (err: any) {
        console.error("Failed to create local file:", err);
        alert(`Failed to create file: ${err.message}`);
      }
      return;
    }

    const payload = {
      name: filename.split('/').pop() || filename,
      path: filename,
      content: `// New file ${filename}\n`,
      language: language
    };

    try {
      const passcodes = JSON.parse(localStorage.getItem('cod-ide-room-passcodes') || '{}');
      const passcode = passcodes[workspaceId] || new URLSearchParams(window.location.search).get('passcode') || "";
      const url = new URL(`${BACKEND_API_URL}/workspace/${workspaceId}/files`);
      if (passcode) url.searchParams.set('passcode', passcode);

      const response = await fetch(url.toString(), {
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
    if (userRole === "viewer" && !isLocalProject) {
      alert("Permission Denied: Viewers cannot delete files.");
      return;
    }
    const file = files[path];
    if (!file) return;

    if (!confirm(`Are you sure you want to delete ${file.name}?`)) return;

    if (isLocalProject) {
      try {
        if (!localDirectoryHandleRef.current) {
          alert("No local project open.");
          return;
        }
        const parts = path.split("/");
        const fileName = parts.pop()!;
        
        let currentDirHandle = localDirectoryHandleRef.current;
        for (const dirName of parts) {
          if (dirName) {
            currentDirHandle = await currentDirHandle.getDirectoryHandle(dirName);
          }
        }
        
        await currentDirHandle.removeEntry(fileName);
        localFileHandlesRef.current.delete(path);
        
        setFiles(prev => {
          const newFiles = { ...prev };
          delete newFiles[path];
          return newFiles;
        });
        setRecentFiles(prev => {
          const updated = prev.filter(f => f !== path);
          localStorage.setItem(`recent-files-${workspaceId}`, JSON.stringify(updated));
          return updated;
        });
        handleCloseTab(null as any, path);

        // Delete from backend as well so collaborators are updated
        try {
          const fileId = file.id || file.name || path;
          const encodedFileId = fileId.split('/').map(encodeURIComponent).join('/');
          const passcodes = JSON.parse(localStorage.getItem('cod-ide-room-passcodes') || '{}');
          const passcode = passcodes[workspaceId] || new URLSearchParams(window.location.search).get('passcode') || "";
          const url = new URL(`${BACKEND_API_URL}/workspace/${workspaceId}/files/${encodedFileId}`);
          if (passcode) url.searchParams.set('passcode', passcode);

          const response = await fetch(url.toString(), {
            method: "DELETE",
            headers: {
              "ngrok-skip-browser-warning": "true"
            }
          });
          if (response.ok && ydocRef.current) {
            ydocRef.current.getMap('files-metadata').set('lastUpdated', Date.now().toString());
          } else if (!response.ok) {
            const errText = await response.text();
            console.error("Failed to delete local file from backend:", errText);
            alert(`Failed to delete file from backend: ${errText}`);
          }
        } catch (backendErr) {
          console.error("Failed to delete local file from backend:", backendErr);
        }
      } catch (err: any) {
        console.error("Failed to delete local file:", err);
        alert(`Failed to delete file: ${err.message}`);
      }
      return;
    }

    const fileId = file.id || file.name || path;

    try {
      const passcodes = JSON.parse(localStorage.getItem('cod-ide-room-passcodes') || '{}');
      const passcode = passcodes[workspaceId] || new URLSearchParams(window.location.search).get('passcode') || "";
      const encodedFileId = fileId.split('/').map(encodeURIComponent).join('/');
      const url = new URL(`${BACKEND_API_URL}/workspace/${workspaceId}/files/${encodedFileId}`);
      if (passcode) url.searchParams.set('passcode', passcode);

      const response = await fetch(url.toString(), {
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
        setRecentFiles(prev => {
          const updated = prev.filter(f => f !== path);
          localStorage.setItem(`recent-files-${workspaceId}`, JSON.stringify(updated));
          return updated;
        });
        handleCloseTab(null as any, path);

        // Notify other clients via Yjs
        if (ydocRef.current) {
          ydocRef.current.getMap('files-metadata').set('lastUpdated', Date.now().toString());
        }
      } else {
        const errText = await response.text();
        console.error("Failed to delete file on backend:", errText);
        alert(`Failed to delete file: ${errText}`);
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

  // Close tab (Bug 1 fix: guard against null event from programmatic calls)
  const handleCloseTab = (e: React.MouseEvent | null, path: string) => {
    e?.stopPropagation();
    const newTabs = openTabs.filter(t => t !== path);
    setOpenTabs(newTabs);

    if (activeFilePath === path && newTabs.length > 0) {
      setActiveFilePath(newTabs[newTabs.length - 1]);
    }
  };

  // Run Code logic simulating dynamic console printing
  const handleRunCode = () => {
    if (userRole === "viewer") {
      alert("Permission Denied: Viewers cannot run code.");
      return;
    }
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
      `[${new Date().toLocaleTimeString()}] COD CODE window successfully mounted (Tauri backend initialized).`,
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
      { label: "Open Folder...", shortcut: "Ctrl+O", action: handleOpenLocalFolder },
      { label: "Open File...", action: handleOpenLocalFile },
      { label: "New Workspace / Room", action: handleCreateNewRoom },
      { label: "New Window", shortcut: "Ctrl+Shift+N", action: () => window.open(window.location.href, '_blank') },
      { divider: true },
      { label: "Save", shortcut: "Ctrl+S", action: handleSaveFile },
      { label: "Save As...", shortcut: "Ctrl+Shift+S", action: handleSaveFileAs },
      { divider: true },
      { label: "Share Workspace", action: () => setIsShareModalOpen(true) },
      ...(isLocalProject ? [
        { divider: true },
        { label: "Close Local Project", action: handleCloseLocalProject }
      ] : []),
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
      { label: "Welcome", action: () => alert("Welcome to COD CODE!") },
      { label: "Keyboard Shortcuts", shortcut: "Ctrl+K Ctrl+S", action: () => { editorRef.current?.focus(); editorRef.current?.trigger('source', 'editor.action.showCommands', null); } },
      { divider: true },
      { label: "About", action: () => alert("COD CODE v0.1.0") }
    ]
  };

  
  // 3. Global keyboard shortcuts for local operations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S / Cmd+S: Save file
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveFile();
      }
      // Ctrl+O / Cmd+O: Open Folder / Project
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenLocalFolder();
      }
      // Ctrl+N / Cmd+N: New File
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n' && !e.shiftKey) {
        e.preventDefault();
        handleCreateFile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveFile, handleOpenLocalFolder, handleCreateFile]);

  const activeFile = files[activeFilePath] || initialFiles["src/components/IDELayout.tsx"];

  

  return (
    <div
      data-testid="ide-container"
      className={`flex flex-col w-full h-full select-none overflow-hidden font-sans gpu-layer transition-all duration-700 ease-in-out transform ${
        editorTheme === "vs-dark"
          ? "bg-[#121215] text-slate-200"
          : "bg-[#f3f4f6] text-slate-800"
      } ${isExiting ? "scale-[0.93] rotate-1 opacity-0 filter blur-md pointer-events-none" : "scale-100 rotate-0 opacity-100"}`}
    >
      {/* 1. Top Header */}
      <Header
        editorTheme={editorTheme}
        setEditorTheme={setEditorTheme}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        IDE_MENUS={IDE_MENUS}
        userRole={userRole}
        handleCreateNewRoom={handleCreateNewRoom}
        setIsShareModalOpen={setIsShareModalOpen}
        bottomPanelOpen={bottomPanelOpen}
        setBottomPanelOpen={setBottomPanelOpen}
        rightSidebarOpen={rightSidebarOpen}
        setRightSidebarOpen={setRightSidebarOpen}
      />

      {/* 2. Main Workspace Body */}
      <div className={`flex flex-1 w-full overflow-hidden relative ${sidebarPosition === "right" ? "flex-row-reverse" : ""}`}>
        {/* Activity Bar */}
        <ActivityBar
          editorTheme={editorTheme}
          leftSidebarOpen={leftSidebarOpen}
          setLeftSidebarOpen={setLeftSidebarOpen}
          activeLeftTab={activeLeftTab}
          setActiveLeftTab={setActiveLeftTab}
          isCallActive={isCallActive}
          setIsCallActive={setIsCallActive}
          isCallPanelOpen={isCallPanelOpen}
          setIsCallPanelOpen={setIsCallPanelOpen}
          rightSidebarOpen={rightSidebarOpen}
          setRightSidebarOpen={setRightSidebarOpen}
          isAccountMenuOpen={isAccountMenuOpen}
          setIsAccountMenuOpen={setIsAccountMenuOpen}
          isSignedIn={isSignedIn}
          setIsSignedIn={setIsSignedIn}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
        />

        {/* Left Collapsible Sidebar */}
        <LeftSidebar
          editorTheme={editorTheme}
          leftSidebarOpen={leftSidebarOpen}
          leftSidebarWidth={leftSidebarWidth}
          isResizingLeft={isResizingLeft}
          startResizingLeft={startResizingLeft}
          activeLeftTab={activeLeftTab}
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
          workspaceId={workspaceId}
          roomsHistory={roomsHistory}
          handleCreateNewRoom={handleCreateNewRoom}
          handleSwitchRoom={handleSwitchRoom}
          handleRenameRoom={handleRenameRoom}
          updateRoomsHistory={updateRoomsHistory}
        />

        {/* Center Workspace (Editor + Bottom Panel + Floating Call Panel) */}
        <div className="flex-1 flex flex-col min-w-0 relative h-full">
          <EditorArea
            editorTheme={editorTheme}
            openTabs={openTabs}
            files={files}
            activeFilePath={activeFilePath}
            setActiveFilePath={setActiveFilePath}
            handleCloseTab={handleCloseTab}
            showBreadcrumbs={showBreadcrumbs}
            activeFile={activeFile}
            fontSize={fontSize}
            setFontSize={setFontSize}
            bottomPanelOpen={bottomPanelOpen}
            startResizingBottom={startResizingBottom}
            handleEditorChange={handleEditorChange}
            handleEditorDidMount={handleEditorDidMount}
            minimapEnabled={minimapEnabled}
            wordWrap={wordWrap}
            tabSize={tabSize}
            cursorBlinking={cursorBlinking}
            lineNumbers={lineNumbers}
            renderWhitespace={renderWhitespace}
            bracketPairColorization={bracketPairColorization}
            userRole={userRole}
            fontFamily={fontFamily}
          />

          <BottomPanel
            editorTheme={editorTheme}
            bottomPanelOpen={bottomPanelOpen}
            setBottomPanelOpen={setBottomPanelOpen}
            bottomPanelHeight={bottomPanelHeight}
            isResizingBottom={isResizingBottom}
            activeBottomTab={activeBottomTab}
            setActiveBottomTab={setActiveBottomTab}
            clientOS={clientOS}
            terminalHistory={terminalHistory}
            setTerminalHistory={setTerminalHistory}
            terminalInput={terminalInput}
            setTerminalInput={setTerminalInput}
            outputLogs={outputLogs}
            setOutputLogs={setOutputLogs}
            userRole={userRole}
            tauriInvokeRef={tauriInvokeRef}
            handleRunCode={handleRunCode}
          />

          <CallPanel
            isCallActive={isCallActive}
            isCallPanelOpen={isCallPanelOpen}
            setIsCallPanelOpen={setIsCallPanelOpen}
            editorTheme={editorTheme}
            callPanelPos={callPanelPos}
            handleMouseDown={handleMouseDown}
            activeCollaborators={activeCollaborators}
            speakingUsers={speakingUsers}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            isDeafened={isDeafened}
            setIsDeafened={setIsDeafened}
            isSharingScreen={isSharingScreen}
            setIsSharingScreen={setIsSharingScreen}
            isEditingName={isEditingName}
            setIsEditingName={setIsEditingName}
            userNameInput={userNameInput}
            setUserNameInput={setUserNameInput}
            handleSaveName={handleSaveName}
            remoteScreenStreams={remoteScreenStreams}
            poppedOutScreens={poppedOutScreens}
            togglePopOut={togglePopOut}
            setRemoteScreenStreams={setRemoteScreenStreams}
            handleExitCallWithAnimation={handleExitCallWithAnimation}
          />
        </div>

        {/* Right Collapsible Sidebar (AI Assistant) */}
        <AIChatSidebar
          rightSidebarOpen={rightSidebarOpen}
          setRightSidebarOpen={setRightSidebarOpen}
          rightSidebarWidth={rightSidebarWidth}
          isResizingRight={isResizingRight}
          startResizingRight={startResizingRight}
          editorTheme={editorTheme}
          aiStatus={aiStatus}
          messages={messages}
          streamingMessage={streamingMessage}
          copiedCodeId={copiedCodeId}
          handleCopyCode={handleCopyCode}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          isListening={isListening}
          handleVoiceInputToggle={handleVoiceInputToggle}
          stopListening={stopListening}
          handleSendMessage={handleSendMessage}
          chatContainerRef={chatContainerRef}
          chatEndRef={chatEndRef}
          messageInputRef={messageInputRef}
        />
      </div>

      {/* 3. Status Bar */}
      <StatusBar
        showStatusBar={showStatusBar}
        editorTheme={editorTheme}
        bottomPanelOpen={bottomPanelOpen}
        setBottomPanelOpen={setBottomPanelOpen}
        aiStatus={aiStatus}
      />

      {/* 4. Modals and Overlays */}
      <SettingsModal
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        editorTheme={editorTheme}
        setEditorTheme={setEditorTheme}
        activeSettingsTab={activeSettingsTab}
        setActiveSettingsTab={setActiveSettingsTab}
        minimapEnabled={minimapEnabled}
        setMinimapEnabled={setMinimapEnabled}
        autoSave={autoSave}
        setAutoSave={setAutoSave}
        bracketPairColorization={bracketPairColorization}
        setBracketPairColorization={setBracketPairColorization}
        formatOnSave={formatOnSave}
        setFormatOnSave={setFormatOnSave}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        wordWrap={wordWrap}
        setWordWrap={setWordWrap}
        lineNumbers={lineNumbers}
        setLineNumbers={setLineNumbers}
        renderWhitespace={renderWhitespace}
        setRenderWhitespace={setRenderWhitespace}
        cursorBlinking={cursorBlinking}
        setCursorBlinking={setCursorBlinking}
        tabSize={tabSize}
        setTabSize={setTabSize}
        sidebarPosition={sidebarPosition}
        setSidebarPosition={setSidebarPosition}
        showStatusBar={showStatusBar}
        setShowStatusBar={setShowStatusBar}
        showBreadcrumbs={showBreadcrumbs}
        setShowBreadcrumbs={setShowBreadcrumbs}
        glassBlur={glassBlur}
        setGlassBlur={setGlassBlur}
        aiAutocompleteMode={aiAutocompleteMode}
        setAiAutocompleteMode={setAiAutocompleteMode}
        aiMaxTokens={aiMaxTokens}
        setAiMaxTokens={setAiMaxTokens}
        aiTemperature={aiTemperature}
        setAiTemperature={setAiTemperature}
        aiSystemPrompt={aiSystemPrompt}
        setAiSystemPrompt={setAiSystemPrompt}
      />

      <FloatingScreensharePopup
        remoteScreenStreams={remoteScreenStreams}
        poppedOutScreens={poppedOutScreens}
        activeCollaborators={activeCollaborators}
        popupPositions={popupPositions}
        maximizedPopups={maximizedPopups}
        editorTheme={editorTheme}
        handlePopupMouseDown={handlePopupMouseDown}
        setMaximizedPopups={setMaximizedPopups}
        togglePopOut={togglePopOut}
        setRemoteScreenStreams={setRemoteScreenStreams}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        theme={editorTheme}
        workspaceId={workspaceId}
        activeCollaborators={activeCollaborators}
        onChangeName={handleChangeName}
        userRole={userRole}
      />

      <CreateRoomModal
        showCreateRoomModal={showCreateRoomModal}
        setShowCreateRoomModal={setShowCreateRoomModal}
        editorTheme={editorTheme}
        createRoomName={createRoomName}
        setCreateRoomName={setCreateRoomName}
        createRoomType={createRoomType}
        setCreateRoomType={setCreateRoomType}
        handleConfirmCreateRoom={handleConfirmCreateRoom}
      />

      <InvitationModal
        invitation={invitation}
        editorTheme={editorTheme}
        handleAcceptInvitation={handleAcceptInvitation}
        handleDeclineInvitation={handleDeclineInvitation}
      />

      <SessionEndedScreen
        sessionEnded={sessionEnded}
        setSessionEnded={setSessionEnded}
        editorTheme={editorTheme}
        workspaceId={workspaceId}
        setIsCallActive={setIsCallActive}
        setIsCallPanelOpen={setIsCallPanelOpen}
        handleSwitchRoom={handleSwitchRoom}
      />
    </div>
  );
}
