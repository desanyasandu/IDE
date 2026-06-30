# COD CODE – VS Code Clone with AI Chatbot

A high-fidelity, interactive, and premium developer workspace interface styled with Tailwind CSS v4. The application features collapsible layouts, a functional file explorer, tabs coordination, a fully editable Monaco Editor instance, and an AI Chat panel with real-time status transitions.

---

## 🌟 Key Features

- 🛠️ **Activity Bar (Far Left)**: Toggles for File Explorer, Search, Source Control (Git), and AI Assistant.
- 📁 **Left Collapsible Sidebar**:
  - **Explorer**: Expandable project folder tree containing mock files. Clicking files opens them inside the editor.
  - **Search**: Workspace search layout placeholder.
  - **Source Control**: Git panel displaying mock modified files with commit and push controls.
- 💻 **Main Editor Workspace**:
  - **Monaco Editor**: Fully functional editor (`@monaco-editor/react`) loaded with the file's current text.
  - **Tabs Bar**: Switch between open files or close active tabs.
  - **Breadcrumbs**: File path indicator path.
  - **Controls Overlay**: Customize font size (+/-) and switch between Dark/Light modes on the fly.
- 🔮 **Collapsible AI Copilot Sidebar**:
  - **AI Status Banner**: Glowing, animated indicators showing state changes: `Ready` (green) ➔ `Thinking` (pulsing amber) ➔ `Typing` (pulsing cyan) ➔ `Ready`.
  - **Streaming Bot Response**: A word-by-word typewriter effect rendering answers dynamically.
  - **Quick Prompts**: Shortcuts for one-click prompts ("Explain file", "Refactor", "Write Tests").
  - **Rich Code Blocks**: Embedded syntax-highlighted code output with a copy-to-clipboard button.
- 📊 **Status Bar (Bottom)**: Classic IDE footer showing Git branch name, mock problems counts, editor coordinates (Line/Col), spacing type, active language, and synced AI assistant statuses.

---

## 📂 Project Structure

Here are the key workspace files created or modified for this interface:
```text
ide-app/
├── src/
│   ├── components/
│   │   └── IDELayout.tsx    # Primary IDE workspace, layout, and AI Chat logic
│   ├── App.tsx              # Mounts and renders the full-screen layout
│   ├── App.css              # Tailwind CSS configuration and custom styling overrides
│   └── vite-env.d.ts
├── src-tauri/               # Tauri Native Rust Backend configuration
│   └── tauri.conf.json      # Desktop application config
├── package.json             # Added lucide-react & Tailwind CSS v4
└── vite.config.ts           # Integrates @tailwindcss/vite plugin
```

---

## 🚀 Running the Web App locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) and `npm` installed.

### Installation
1. Open your terminal and navigate to the project directory:
   ```bash
   cd c:\Users\DYD\Desktop\IDE\ide-app
   ```
2. Install the project dependencies:
   ```bash
   npm install
   ```

### Start Development Server
Run the local Vite development server:
```bash
npm run dev
```
Once started, open your browser and navigate to the displayed local address (typically `http://localhost:1420/`).

---

## 🖥️ Running as a Desktop Application (Tauri)

Tauri compiles the React frontend into a lightweight native desktop binary. To run it as a desktop application, you need to configure compiling toolchains on your machine:

### Prerequisites for Windows

1. **Install Microsoft C++ Build Tools**:
   - Download the Visual Studio Installer from [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/).
   - Open the installer, select **Desktop development with C++** under the Workloads tab, and click **Install**.
2. **Install Rust Compiler**:
   - Download and run the official installer [rustup-init.exe](https://rustup.rs/).
   - Keep default selection (`1`) to install the toolchain.
3. **Restart Terminal**:
   - Close and reopen your terminal or code editor to ensure that `cargo` and `rustc` commands are recognized.

### Run in Desktop Dev Mode
Navigate to your `ide-app` directory and launch the desktop app:
```bash
npm run tauri dev
```
Tauri will automatically compile the Rust backend, bind it with the React app, and open a desktop window.

### Build standalone Installer (.exe)
To compile a production-ready installer executable that runs independently:
```bash
npm run tauri build
```
The compiled output will be generated inside `src-tauri/target/release/bundle/msi/` or `src-tauri/target/release/bundle/nsis/`.
