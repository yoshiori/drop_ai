# DropAI - AI Desktop Assistant (Top-Down Terminal Style)

A modern desktop application built with Electron, TypeScript, React, and Vite that provides a top-down terminal style experience for Gemini AI (https://gemini.google.com/app).

## Features

- **Top-Down Terminal Style**: Shows/hides with global shortcut like Guake or Yakuake
- **Global Shortcut**: Press `F12` to toggle window visibility
- **Auto-Hide**: Automatically hides when focus is lost
- **Slide Animation**: Smooth slide-down/up animations
- **Always on Top**: Window stays above other applications
- **Frameless**: Clean, minimal window design
- **Background Operation**: Runs in background without taskbar presence
- **Session Persistence**: Maintains login state across app restarts
- **Vite** for fast builds and HMR (Hot Module Replacement)

## Requirements

- Node.js 16 or higher
- npm or yarn

## Installation

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start the application
npm start
```

## Development

```bash
# Development mode (application only)
npm run dev

# Development mode (Vite server + Electron concurrent)
npm run dev:concurrent

# Start Vite dev server only
npm run dev:renderer

# Build
npm run build

# Start application
npm start

# Clean build files
npm run clean
```

## Building for Distribution

### Create Installable Packages

```bash
# Build for current platform
npm run dist

# Build for specific platforms
npm run dist:linux           # AppImage, deb, rpm (requires rpmbuild)
npm run dist:linux-portable  # AppImage, deb only (recommended)
npm run dist:win             # NSIS installer, portable
npm run dist:mac             # DMG, zip

# Create unpacked directory (for testing)
npm run pack
```

### Supported Package Formats

- **Linux**: AppImage (portable), DEB (Debian/Ubuntu), RPM (RedHat/Fedora)
- **Windows**: NSIS Installer, Portable executable
- **macOS**: DMG, ZIP

Built packages will be available in the `release/` directory.

## Automated Releases (GitHub Actions)

### 🚀 Auto Release
Automatically creates releases when code is pushed to main branch:

**Version bumping based on commit message:**
- Contains `major` or `breaking` → **major** version bump (1.0.0 → 2.0.0)
- Contains `feat` or `feature` or `minor` → **minor** version bump (1.0.0 → 1.1.0)
- Everything else → **patch** version bump (1.0.0 → 1.0.1)

**Examples:**
```bash
git commit -m "feat: add custom shortcut configuration"     # → v1.1.0
git commit -m "fix session persistence issue"              # → v1.0.1
git commit -m "major: redesign UI with breaking changes"   # → v2.0.0
git commit -m "[skip ci] update documentation"             # → no release
```

**Skip release:** Add `[skip ci]` or `[skip release]` to commit message

### Manual Version Override
You can also manually trigger a release with specific version type:
- Go to Actions tab → "Auto Release" → "Run workflow"
- Choose version type: patch, minor, or major

## Installation

### From Pre-built Packages

1. Download the appropriate package from the releases
2. **Linux AppImage**: Make executable and run
   ```bash
   chmod +x DropAI-*.AppImage
   ./DropAI-*.AppImage
   ```
3. **Linux DEB**: Install with package manager
   ```bash
   sudo dpkg -i DropAI-*.deb
   ```
4. **Linux RPM**: Install with package manager
   ```bash
   sudo rpm -i DropAI-*.rpm
   ```

### From Source

```bash
# Clone repository
git clone https://github.com/yoshiori/drop_ai.git
cd drop_ai

# Install dependencies
npm install

# Build and run
npm start
```

### VS Code Tasks

Use the Command Palette (`Ctrl+Shift+P`) and select `Tasks: Run Task` to execute:

- `Build and Run Electron App`: Build and start the application
- `Start Vite Dev Server`: Start Vite development server
- `Development Mode (Concurrent)`: Development mode (Vite + Electron concurrent)
- `Build with Vite`: Build the project
- `Clean Build`: Clean build files

## Keyboard Shortcuts

- `F12`: Toggle window visibility (main shortcut)
- `Ctrl/Cmd + N`: New chat
- `Ctrl/Cmd + R`: Reload
- `Escape`: Hide window
- `Ctrl/Cmd + Q`: Quit application

## Project Structure

```
src/
├── main/           # Electron main process
│   └── main.ts     # Main process entry point
└── renderer/       # Renderer process (fallback UI)
    ├── index.html  # HTML template
    └── index.tsx   # React components
```

## Build Configuration

- `vite.config.ts`: Vite configuration (for renderer process)
- `tsconfig.json`: TypeScript configuration for renderer process
- `tsconfig.main.json`: TypeScript configuration for main process

## Vite Benefits

- ⚡ **Fast builds**: ~10x faster than Webpack
- 🔥 **HMR**: Hot module replacement for comfortable development experience
- 📦 **Modern setup**: Native support for ES modules and TypeScript
- 🎯 **Optimization**: Automatic optimization for production builds
