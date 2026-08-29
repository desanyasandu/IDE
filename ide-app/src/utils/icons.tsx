import React from "react";
import { Hash, FileJson, FileCode } from "lucide-react";

export const getFileIcon = (fileName: string): React.ReactNode => {
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
