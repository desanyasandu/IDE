import { ClientOS } from "../types/ide";

export const detectClientOS = (): ClientOS => {
  if (typeof window === "undefined") return "windows";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "macos";
  if (ua.includes("linux")) return "linux";
  return "windows";
};

export const getTerminalPrompt = (os: ClientOS | string): string => {
  if (os === "macos") return "user@mac-ide workspace % ";
  if (os === "linux") return "user@linux-ide:~/workspace$ ";
  return "c:\\Users\\DYD\\Desktop\\IDE\\ide-app> ";
};

export const getTerminalHeader = (os: ClientOS | string): string[] => {
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
